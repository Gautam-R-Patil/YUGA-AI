import {
  transcribeAudio,
  getCompletion,
  getOpenAICompletion,
  synthesizeLongAudio,
  translateWithNLLB
} from './voice-service.js';
import User from '../shared/db/models/user_schema.js';

export const handleVoiceQuery = async (req, res) => {
  try {
    const {
      audio,
      messages = [],
      courseCategory = 'NEET',
      language = 'english',
      taskType = 'general',
      subject = null,
      setNumber = null,
      keywords = [],
      source = 'voice_assistant' // default to voice_assistant
    } = req.body;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const plan = user.membership?.plan || 'free';

    // 1. Enforce Premium logic for AI Voice Assistant (Interactive Tutor)
    // Only Student and Pro plans get access to this.
    // Allow 'doubt_clarification' taskType for free users (subject to weekly quotas below)
    if (source === 'voice_assistant' && taskType !== 'doubt_clarification' && plan === 'free') {
      return res.status(403).json({
        error: 'Upgrade required',
        message: 'The interactive AI Tutor is available for Premium users only. Upgrade to Student tier to unlock.'
      });
    }

    // 2. Enforce logic for Doubt Solver
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

    const usageStats = user.usageStats || {};
    const lastDoubtDate = usageStats.lastDoubtDate ? new Date(usageStats.lastDoubtDate) : null;

    // Reset daily count if it's a new day
    if (!lastDoubtDate || lastDoubtDate < today) {
      usageStats.doubtsAskedToday = 0;
      usageStats.lastDoubtDate = today;
    }

    // Reset weekly count if it's a new week
    if (!lastDoubtDate || lastDoubtDate < startOfWeek) {
      usageStats.doubtsAskedThisWeek = 0; // Need to ensure this field exists or just check date
    }

    if (plan === 'free') {
      // Free: 5 doubts per week (checking against total used this week)
      // For simplicity, let's use a count in usageStats
      if (usageStats.doubtsAskedThisWeek >= 5) {
        return res.status(403).json({
          error: 'Weekly limit reached',
          message: 'You have reached your limit of 5 free doubts this week. Upgrade to Student tier for daily limits.'
        });
      }
      usageStats.doubtsAskedThisWeek = (usageStats.doubtsAskedThisWeek || 0) + 1;
    } else if (plan === 'student') {
      // Student: 10 doubts per day
      if (usageStats.doubtsAskedToday >= 10) {
        return res.status(403).json({
          error: 'Daily limit reached',
          message: 'You have reached your limit of 10 student doubts today. Upgrade to Ultimate for unlimited access.'
        });
      }
      usageStats.doubtsAskedToday += 1;
    }
    // Pro has unlimited

    user.usageStats = usageStats;
    await user.save();

    console.log(`Received voice query [${source}] for category: ${courseCategory}, Language: ${language}`);

    // Normalize keywords to object format {abbreviation: term}
    // Can receive as array [{abbreviation, term}] or object {abbreviation: term}
    let keywordMap = {};
    if (Array.isArray(keywords)) {
      // Array format: [{abbreviation: "K.E.", term: "Kinetic Energy"}]
      keywords.forEach(kw => {
        if (kw.abbreviation && kw.term) {
          keywordMap[kw.abbreviation] = kw.term;
        }
      });
    } else if (keywords && typeof keywords === 'object') {
      // Object format: {"K.E.": "Kinetic Energy", "J": "Joules"}
      keywordMap = keywords;
    }

    // Filter out highly ambiguous single-letter keywords that cause incorrect replacements
    // These LOWERCASE letters have multiple meanings (e.g., "m" = mass OR meters)
    // UPPERCASE letters (W, Q, K, U) are kept as they represent specific physics quantities
    const ambiguousLowercase = ['m', 'g', 'h', 'v', 's', 't', 'n', 'p', 'q', 'r', 'x', 'y', 'z', 'a', 'b', 'c', 'd', 'e', 'f', 'k', 'u', 'w'];
    const originalKeywordCount = Object.keys(keywordMap).length;
    const filteredKeywordMap = {};
    Object.entries(keywordMap).forEach(([abbr, term]) => {
      // Keep multi-character abbreviations (like "K.E.", "kg", "J/s")
      // Keep uppercase single letters (W=Work, Q=Heat, K=Kelvin, U=Internal Energy, etc.)
      // Filter out ambiguous single lowercase letters only
      const isAmbiguous = abbr.length === 1 && ambiguousLowercase.includes(abbr) && abbr === abbr.toLowerCase();
      if (!isAmbiguous) {
        filteredKeywordMap[abbr] = term;
      } else {
        console.log(`⚠️  Filtered out ambiguous keyword: "${abbr}" → "${term}"`);
      }
    });

    keywordMap = filteredKeywordMap;
    const keywordCount = Object.keys(keywordMap).length;

    if (originalKeywordCount > 0) {
      console.log(`📚 Keywords: ${originalKeywordCount} received, ${keywordCount} active after filtering`);
      console.log('Active keywords:', Object.keys(keywordMap).join(', '));
    }
    if (subject && setNumber && keywordCount > 0) {
      console.log(`📚 Question Context: Subject=${subject}, Set=${setNumber}, Keywords=${keywordCount}`);
    }

    // If audio is provided, transcribe it
    let userSpeech = '';
    let fullConversation = [...messages];

    if (audio) {
      console.log('Processing audio data...');
      const audioBuffer = Buffer.from(audio, 'base64');
      console.log(`Audio Buffer Size: ${audioBuffer.length} bytes`);

      // Debug: Write audio to file
      if (process.env.NODE_ENV === 'development') {
        const fs = await import('fs');
        const debugPath = './last_voice_debug.webm';
        fs.writeFileSync(debugPath, audioBuffer);
        console.log(`Saved debug audio to ${debugPath}`);
      }

      userSpeech = await transcribeAudio(audioBuffer, language);
      console.log('Transcribed speech (Native):', userSpeech);
      fullConversation.push({ role: "user", content: userSpeech });
    } else if (messages.length > 0) {
      // Get the last user message if no audio
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      userSpeech = lastUserMessage?.content || '';
      console.log('Using text message:', userSpeech);
    } else {
      return res.status(400).json({ error: 'No audio or text provided' });
    }

    // --- BUILD KEYWORD CONTEXT ---
    let keywordContextStr = '';
    if (keywordCount > 0) {
      console.log(`📚 Building keyword context from ${keywordCount} keywords...`);
      keywordContextStr = '\n\n**IMPORTANT - REFERENCE KEYWORDS FOR THIS QUESTION SET:**\n';

      // Sort by length of abbreviation (longer first for better matching)
      const sortedEntries = Object.entries(keywordMap).sort((a, b) => b[0].length - a[0].length);

      // Separate into categories for better organization
      const abbreviations = sortedEntries.filter(([abbr]) => abbr.length <= 10);
      const longerTerms = sortedEntries.filter(([abbr]) => abbr.length > 10);

      if (abbreviations.length > 0) {
        keywordContextStr += '\n**Key Terms & Abbreviations:**\n';
        abbreviations.slice(0, 30).forEach(([abbr, term]) => {
          keywordContextStr += `• ${abbr}: ${term}\n`;
        });
      }

      if (longerTerms.length > 0) {
        keywordContextStr += '\n**Important Concepts:**\n';
        longerTerms.slice(0, 20).forEach(([abbr, term]) => {
          keywordContextStr += `• ${abbr}: ${term}\n`;
        });
      }

      keywordContextStr += '\n**Use these keywords as reference context for accurate answers. When explaining, use the FULL TERMS (right side) instead of abbreviations.**\n';
    }

    // --- TRANSLATION PIPELINE (NLLB) ---
    // 1. Translate User Input: Native -> English
    let englishInput = userSpeech;
    if (language !== 'english' && userSpeech) {
      console.log(`Translating input from ${language} to english...`);
      englishInput = await translateWithNLLB(userSpeech, language, 'english');
      console.log(`English Input: "${englishInput}"`);

      // Replace the last user message with English content for the LLM context
      // This ensures the LLM sees the whole conversation in English
      // Note: For history, we might ideally keep English versions, but simplistic approach here:
      fullConversation[fullConversation.length - 1].content = englishInput;
    }

    // 2. Get English Response from LLM WITH KEYWORD CONTEXT
    console.log('Getting thinking response from LLM (English)...');

    // Add keyword context to the conversation for the LLM
    const conversationWithKeywords = [...fullConversation];
    if (keywordContextStr) {
      // Inject keywords into the last user message
      const lastIdx = conversationWithKeywords.length - 1;
      if (lastIdx >= 0 && conversationWithKeywords[lastIdx].role === 'user') {
        conversationWithKeywords[lastIdx].content += keywordContextStr;
      }
    }

    // Force english for LLM reasoning (NLLB flow)
    const englishReply = await getOpenAICompletion(conversationWithKeywords, courseCategory, taskType, true, 'english');
    console.log('LLM Response (English):', englishReply);

    // 3. Prepare Final Response for UI (Raw/Markdown)
    let finalUIResponse = englishReply;
    if (language !== 'english') {
      console.log(`Translating UI response from english to ${language}...`);
      finalUIResponse = await translateWithNLLB(englishReply, 'english', language);
    }

    // 4. Prepare Text for TTS (Cleaned/No LaTeX)
    const cleanTextForTTS = (text) => {
      let cleaned = text;
      // First, remove display math $$...$$ and inline $...$
      cleaned = cleaned
        .replace(/\$\$([^$]+)\$\$/g, (match, formula) => cleanFormula(formula))
        .replace(/\$([^$]+)\$/g, (match, formula) => cleanFormula(formula))
        .replace(/\$/g, '');
      return cleaned;
    };

    const cleanFormula = (formula) => {
      return formula
        .replace(/\\pi/g, ' pi ')
        .replace(/\\theta/g, ' theta ')
        .replace(/\\alpha/g, ' alpha ')
        .replace(/\\beta/g, ' beta ')
        .replace(/\\gamma/g, ' gamma ')
        .replace(/\\delta/g, ' delta ')
        .replace(/\\times/g, ' times ')
        .replace(/\\cdot/g, ' times ')
        .replace(/\\div/g, ' divided by ')
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 divided by $2')
        .replace(/\^(\d+|\{[^}]+\})/g, (match, exp) => ` to the power ${exp.replace(/[{}]/g, '')}`)
        .replace(/_(\d+|\{[^}]+\})/g, (match, sub) => ` ${sub.replace(/[{}]/g, '')}`)
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .replace(/\\mathrm\{([^}]+)\}/g, '$1')
        .replace(/\\[a-zA-Z]+/g, '')
        .replace(/[{}]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    let textToSpeak = cleanTextForTTS(finalUIResponse);

    // Note: Keyword substitutions will be applied inside synthesizeLongAudio
    // before preprocessTextForTTS to avoid conflicts with generic replacements
    if (keywordCount > 0) {
      console.log(`📝 Passing ${keywordCount} keywords to TTS for accurate pronunciation...`);
    }

    // 5. Generate Audio (make this non-fatal)
    let base64Audio = null;
    let audioMime = null;
    let ttsLanguage = language;

    if (language === 'english' && /[\u0900-\u097F]/.test(textToSpeak)) {
      console.log('Detected Hindi characters in response. Switching TTS to Hindi.');
      ttsLanguage = 'hindi';
    }

    try {
      console.log(`Generating speech for response (Language: ${ttsLanguage})...`);
      const ttsResult = await synthesizeLongAudio(textToSpeak, ttsLanguage, keywordMap);
      base64Audio = ttsResult.audioBuffer.toString('base64');
      audioMime = ttsResult.audioMime;
      console.log('✅ Speech generated successfully');
    } catch (ttsError) {
      console.warn('⚠️ TTS Error:', ttsError.message);
    }

    console.log('Voice query completed successfully');

    res.json({
      success: true,
      transcription: userSpeech,
      response: finalUIResponse,      // Raw Markdown for UI/Notes
      audioText: textToSpeak,          // Cleaned text for Transcript/Debug
      englishResponse: englishReply,
      audio: base64Audio,
      ...(base64Audio ? { audioMime } : {})
    });

  } catch (error) {
    console.error('Voice query error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

// Dedicated TTS endpoint so frontend can just request audio for existing text
export const handleTTS = async (req, res) => {
  try {
    const { text, language = 'english', keywords = {} } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`TTS REQUEST`);
    console.log(`Text: "${text.substring(0, 100)}..."`);
    console.log(`Language: ${language}`);
    console.log(`Keywords received:`, JSON.stringify(keywords));
    console.log(`Keywords type:`, typeof keywords);
    console.log(`Keywords is array:`, Array.isArray(keywords));

    // Normalize and filter keywords (same logic as handleVoiceQuery)
    let keywordMap = {};
    if (Array.isArray(keywords)) {
      keywords.forEach(kw => {
        if (kw.abbreviation && kw.term) {
          keywordMap[kw.abbreviation] = kw.term;
        }
      });
    } else if (keywords && typeof keywords === 'object') {
      keywordMap = keywords;
    }

    console.log(`Normalized keyword map:`, JSON.stringify(keywordMap));

    // Filter ambiguous keywords
    const ambiguousLowercase = ['m', 'g', 'h', 'v', 's', 't', 'n', 'p', 'q', 'r', 'x', 'y', 'z', 'a', 'b', 'c', 'd', 'e', 'f', 'k', 'u', 'w'];
    const originalCount = Object.keys(keywordMap).length;
    const filteredKeywordMap = {};
    Object.entries(keywordMap).forEach(([abbr, term]) => {
      const isAmbiguous = abbr.length === 1 && ambiguousLowercase.includes(abbr) && abbr === abbr.toLowerCase();
      if (!isAmbiguous) {
        filteredKeywordMap[abbr] = term;
      } else {
        console.log(`  ⚠️  Filtered: "${abbr}" → "${term}"`);
      }
    });

    console.log(`Filtered keyword map (${Object.keys(filteredKeywordMap).length}/${originalCount}):`, JSON.stringify(filteredKeywordMap));
    console.log(`${'='.repeat(80)}\n`);

    const ttsResult = await synthesizeLongAudio(text, language, filteredKeywordMap);
    const base64Audio = ttsResult.audioBuffer.toString('base64');

    res.json({
      audio: base64Audio,
      audioMime: ttsResult.audioMime
    });

  } catch (error) {
    console.error('TTS handler error:', error);
    res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}