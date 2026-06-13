import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { getCompletion } from './llm-service.js';
import { getKeywordsForCurrentSet, formatKeywordsAsContext } from './keywords-service.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache paths
// Cache paths
let cachedQuestionsData = null;
const SPLIT_DIR = path.join(__dirname, '../../RAG/neet_rag_output/neet_rag_model/subjects_split');
const SUBJECT_SET_DIR = path.join(__dirname, '../../data/questions/mcq_practice');

const normalizeSubjectFolder = (subject) => {
    if (!subject) return 'physics';
    const s = subject.toLowerCase();
    if (s.includes('physics')) return 'physics';
    if (s.includes('chemistry')) return 'chemistry';
    if (s.includes('biology') || s.includes('botany') || s.includes('zoology')) return 'biology';
    return s.trim();
};



/**
 * Clean up text artifacts from OCR and fix LaTeX formatting
 */
const cleanupQuestionText = (text) => {
    if (!text) return '';
    return text
        .replace(/\\n(?=[\s]|$)/g, '\n') // Handle literal \n strings only if followed by space/end (prevents breaking \niche, \nucleus)
        .replace(/â€“/g, '-') // Fix common dash encoding
        .replace(/Â/g, '')     // Fix common encoding artifact
        .replace(/â€™/g, "'") // Fix apostrophe
        .replace(/â€œ/g, '"') // Fix opening quote
        .replace(/â€/g, '"')  // Fix closing quote
        .replace(/\(a\)/g, 'A)') // Normalize option labels
        .replace(/\(b\)/g, 'B)')
        .replace(/\(c\)/g, 'C)')
        .replace(/\(d\)/g, 'D)')
        .replace(/([0-9]+)\^([-0-9]+)/g, '$1^{$2}') // Fix powers to LaTeX (including negative)
        .replace(/H2O/g, '$\\text{H}_2\\text{O}$')     // Common chemical formulas
        .replace(/CO2/g, '$\\text{CO}_2$')
        .replace(/O2/g, '$\\text{O}_2$')
        .replace(/SO2/g, '$\\text{SO}_2$')
        .replace(/NO2/g, '$\\text{NO}_2$')
        .replace(/[ \t]+/g, ' ') // Collapse multiple horizontal spaces only
        // Fix JSON-string-decoding artifacts where \t (tab) replaced \t in \times or \text
        .replace(/(\s|^)imes(\s|$)/g, '$1\\times$2') // Fix " imes " -> " \times "
        .replace(/(\d)imes(\d)/g, '$1\\times$2')     // Fix "5imes10" -> "5\times10"
        .replace(/(\s|^)ext\{/g, '$1\\text{')        // Fix " ext{" -> " \text{"
        .replace(/(\s|^)frac\{/g, '$1\\frac{')       // Fix " frac{" -> " \frac{"
        .replace(/(\s|^)mu(\s|$)/g, '$1\\mu$2')
        .trim();
};

/**
 * Specifically cleans up and formats markdown explanations
 */
const cleanupExplanation = (text) => {
    if (!text) return '';

    let clean = String(text);

    // Recursive brace stripping to handle artifacts or botched JSON
    const stripBraces = (s) => {
        s = s.trim();
        // Check for wrapping braces that are likely artifacts
        if (s.startsWith('{') && s.endsWith('}')) {
            // If the content looks like a serialized JSON object (starts with "key":), DON'T strip
            // We want to strip only if it's "wrapped text" like {**Core Concept**...}
            if (!s.match(/^\{\s*"/)) {
                return stripBraces(s.substring(1, s.length - 1));
            }
        }
        return s;
    };
    clean = stripBraces(clean);

    // Apply general text cleanup (encoding, chemistry formulas)
    clean = cleanupQuestionText(clean);

    // Structural Formatting

    // Force headers (bold terms) to separate lines with double newline
    clean = clean.replace(/([^\n])\s*(\*\*[^*:]+\*\*)/g, '$1\n\n$2');
    clean = clean.replace(/^\s*(\*\*[^*:]+\*\*)/g, '$1'); // Normalize start header

    // Force bullet points to separate lines
    // CRITICAL FIX: Only treat hyphen as bullet if it follows punctuation (.:;) or newlines.
    // This prevents breaking equations like "w = - P" where "-" is a minus sign, not a bullet.
    clean = clean.replace(/([.:;])\s*([-•])\s+/g, '$1\n$2 ');
    // Also handle start of string bullets
    clean = clean.replace(/^([-•])\s+/g, '$1 ');

    // Force numbered lists to separate lines
    clean = clean.replace(/([^\n])\s*(\d+\.)\s/g, '$1\n$2 ');

    // --- Math Delimiting Helper ---
    // Wraps common LaTeX patterns in $ signs if they aren't already.
    const delimitMath = (str) => {
        // 0. Normalize double backslashes that might have survived JSON parsing for common LaTeX commands
        // e.g. \\frac -> \frac, \\text -> \text, \\quad -> \quad
        str = str.replace(/\\\\(frac|text|quad|sqrt|Delta|mu|pi|eta|lambda|Lambda|left|right|cdot|times|hat|vec|sin|cos|tan|log|ln)/g, '\\$1');

        // 1. Handle explicit parentheses that look like math: ( P_{ext} = ... ) -> ( $P_{ext} = ...$ )
        str = str.replace(/\(([^)$]*?(?:\\Delta|P_\{|V_\{|=[^=]|\\text)[^)$]*?)\)/g, '($ $1 $)');

        // 4. Convert \( ... \) to $ ... $ (common LaTeX delimiters)
        str = str.replace(/\\\((.*?)\\\)/g, '$$$1$$');

        return str;
    };

    clean = delimitMath(clean);

    // Final cleanups
    return clean
        .replace(/^###\s+/gm, '**')   // Convert h3 to bold
        .replace(/\n###\s+/g, '\n**')
        .replace(/\*\*([^*]+)\*\*/g, (match, p1) => `**${p1.trim()}**`) // Trim inside bold tags
        .replace(/\n{3,}/g, '\n\n')    // Max 2 newlines
        .split('\n').map(line => line.trim()).join('\n') // Trim each line
        .trim();
};

const loadQuestionsData = async () => {
    if (cachedQuestionsData) return cachedQuestionsData;
    try {
        try {
            await fs.promises.access(SPLIT_DIR);
        } catch {
            console.error(`❌ Split directory not found at: ${SPLIT_DIR}`);
            return null;
        }

        const entries = await fs.promises.readdir(SPLIT_DIR);
        const files = entries.filter(f => f.endsWith('.json'));
        if (files.length === 0) {
            console.error(`❌ No JSON files found in split directory: ${SPLIT_DIR}`);
            return null;
        }

        let combinedData = [];
        console.log(`📂 Loading questions from subjects_split directory...`);

        for (const file of files) {
            const filePath = path.join(SPLIT_DIR, file);
            const rawData = await fs.promises.readFile(filePath, 'utf-8');
            const fileData = JSON.parse(rawData);
            combinedData = combinedData.concat(fileData);
            console.log(`   - Loaded ${fileData.length} questions from ${file}`);
        }

        if (combinedData.length > 0) {
            cachedQuestionsData = combinedData;
            console.log(`✅ Total loaded from split: ${cachedQuestionsData.length} questions.`);
            return cachedQuestionsData;
        }

        return null;
    } catch (error) {
        console.error("Failed to load questions data from subjects_split:", error);
        return null;
    }
};

const loadQuestionSet = async (subject, setNum) => {
    try {
        if (!subject) return [];
        const subjectDir = path.join(SUBJECT_SET_DIR, normalizeSubjectFolder(subject));
        const setFile = path.join(subjectDir, `Set${setNum}`, `set${setNum}.json`);

        try {
            await fs.promises.access(setFile);
        } catch {
            console.error(`⚠️ Set file not found: ${setFile}. Defaulting to empty.`);
            return [];
        }

        console.log(`📂 Loading set ${setNum} for ${subject} from ${setFile}`);
        const rawData = await fs.promises.readFile(setFile, 'utf-8');
        return JSON.parse(rawData);
    } catch (e) {
        console.error(`Error loading set ${setNum} for ${subject}:`, e);
        return [];
    }
};

const generateAIQuestions = async (subject, topic, count = 5, score = null, factors = null) => {
    const topicStr = topic ? `on the topic "${topic}"` : "covering various important topics (Mixed Bag)";

    let personalizationContext = "";
    if (score) {
        personalizationContext = `
    PERSONALIZATION CONTEXT:
    The student currently has a predicted score of ${score}% for this subject.
    ${factors ? `Their performance is driven by these factors: ${factors}` : ''}
    Please tailor the difficulty, depth of explanation, and complexity of concepts to exactly challenge a student at this level, helping them improve without overwhelming them.`;
    }

    // Prompt engineered for strict JSON output compatible with our renderer
    const prompt = `You are a strict NEET Exam Question Generator.
    Generate ${count} high-quality, conceptual NEET-level multiple choice questions for ${subject} ${topicStr}.
    ${personalizationContext}
    
    Strictly output VALID JSON with a key "questions" containing an array of objects.
    Each object must have these exact keys:
    - "text": The question text. Use LaTeX *ONLY* for mathematical formulas/equations. IMPORTANT: Escape backslashes.
      - Correct: "$\\\\alpha$"
      - Do NOT use LaTeX for emphasis or scientific terms (e.g., NO \\\\ecological, NO \\\\trophic). 
      - Use **Markdown** for bold/emphasis.
      - Example: "5.0 \\\\times 10^{-3}" is good. "The \\\\ecological niche" is BAD. Use "The **ecological niche**".
      - For "Match the Columns" questions, do NOT use stars or complex formatting. Use standard Markdown tables or lists properly formatted. Avoid "Column-1" headers if they break.
    - "options": An array of 4 distinct string options.
    - "correct_answer": The text of the correct option (must match one option exactly).
    - "explanation": A detailed, step-by-step explanation. 
      - **CRITICAL**: The explanation MUST Conclude with "Therefore, the correct answer is Option X." where X matches the option letter of the correct answer.
      - Ensure the explanation logic fully supports the 'correct_answer' provided.
      - Use bold headers like **Step 1**, **Concept**, etc.
    - "basic_answer": A short answer key (e.g., "A").
    - "difficulty": "Medium" or "Hard".
    - "sub_topic": The specific sub-topic name.

    Ensure NO "Answer:" prefixes in the options.
    Ensure strict JSON format. Do not add markdown code blocks around the JSON.`;

    try {
        console.log(`🤖 Asking LLM to generate questions for ${subject}...`);
        const response = await getCompletion(
            [{ role: "user", content: prompt }],
            'NEET',
            'quiz_explanation',
            false, // Do not cache practice mode (realtime)
            'english',
            true // Use JSON mode
        );

        if (!response) return [];
        const parsed = JSON.parse(response);
        return parsed.questions || [];
    } catch (e) {
        console.error("❌ Error generating AI questions:", e);
        return [];
    }
};

/**
 * Service to bridge Node.js with the RAG system (now using direct JSON).
 */
// Update signature to accept mode
export const fetchNEETMockQuestions = async (mockId = 'NEET AI Examiner', subject = null, topic = null, setNum = 1, count = 10, mode = 'json', score = null, factors = null) => {
    try {
        // Validation helper
        const isValidQuestion = (q) => {
            const text = (q.text || '').trim();
            const options = q.options || [];
            if (text.length < 10) return false;
            // Check for explicit "Unable to parse" error in text (from bad OCR/parsing)
            if (text.includes("Unable to parse")) return false;

            if (!options || options.length < 2) return false;
            if (options.some(opt => !String(opt).trim())) return false;
            const lowerText = text.toLowerCase();
            if (lowerText.includes('missing') || (lowerText.includes('figure') && !q.has_images)) return false;
            return true;
        };

        // Formatter helper
        const formatQ = (q, sub, index) => {
            const originalOptions = q.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'];

            let rawExplanation = (q.explanation || '').trim();
            let rawCorrect = String(q.correct_answer || '').trim();

            // Handle cases where the explanation field contains a nested JSON or bracketed string
            if (rawExplanation.startsWith('{') && rawExplanation.endsWith('}')) {
                try {
                    const parsed = JSON.parse(rawExplanation);
                    if (parsed.explanation) rawExplanation = parsed.explanation;
                    if (parsed.correct_answer && (rawCorrect === '' || rawCorrect.toLowerCase().includes('unable'))) {
                        rawCorrect = String(parsed.correct_answer);
                    }
                } catch (e) {
                    // Not valid JSON, but still bracketed - strip the braces
                    rawExplanation = rawExplanation.substring(1, rawExplanation.length - 1).trim();
                }
            }

            // Extract correct answer text from JSON
            let correctAnswerText = '';

            if (rawCorrect) {
                // Handle "A. Text" or just "A" format
                const letterMatch = rawCorrect.match(/^([A-D])(?:\.|$|\s)/i);
                if (letterMatch) {
                    const letter = letterMatch[1].toUpperCase();
                    const optIndex = letter.charCodeAt(0) - 65;
                    correctAnswerText = originalOptions[optIndex] || originalOptions[0];
                } else {
                    // Check if rawCorrect matches any option text directly
                    const exactMatch = originalOptions.find(opt => String(opt).trim() === rawCorrect);
                    if (exactMatch) {
                        correctAnswerText = exactMatch;
                    } else {
                        correctAnswerText = rawCorrect; // Fallback to raw string
                    }
                }
            } else {
                correctAnswerText = originalOptions[0]; // Fallback if missing
            }

            // Fisher-Yates shuffle algorithm for options - DISABLED per user request
            // const shuffledOptions = [...originalOptions];
            // for (let i = shuffledOptions.length - 1; i > 0; i--) {
            //     const j = Math.floor(Math.random() * (i + 1));
            //     [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
            // }
            const shuffledOptions = originalOptions;

            // Cleanup all texts and normalize explanation
            const cleanQuestion = cleanupQuestionText(q.text || '');
            const cleanOptions = shuffledOptions.map(opt => cleanupQuestionText(String(opt)));
            const cleanCorrectAnswer = cleanupQuestionText(String(correctAnswerText));
            const cleanExplanation = cleanupExplanation(rawExplanation || '');
            const basicAnswer = cleanupQuestionText(q.basic_answer || '');

            // Debug logging for keywords
            if (index === 0) {
                console.log(`🔍 RAG DEBUG - Question ${index} keywords:`, q.keywords);
            }

            return {
                "id": `rag-${sub.toLowerCase()}-${index}`,
                "question": cleanQuestion,
                "options": cleanOptions,
                "correctAnswer": cleanCorrectAnswer,
                "explanation": cleanExplanation,
                "basicAnswer": basicAnswer,
                "subject": sub,
                "sub_topic": q.sub_topic || '',
                "difficulty": q.difficulty || 'Medium',
                "hasImage": q.has_images || false,
                "images": q.images || [],
                "keywords": q.keywords || {}, // Pass through keywords from JSON
                "approvalStatus": "approved",
                "explanationApproved": true,
                "reviewNotes": "Auto-approved - RAG source"
            };
        };

        // NEW PRACTICE MODE LOGIC: Load from specific Set JSON, Fallback to AI
        if (mockId === 'practice' && subject) {
            console.log(`📚 Practice Mode: ${mode === 'ai' ? 'AI Generation' : 'JSON Loading'} for ${subject}`);

            let rawQuestions = [];

            if (mode === 'ai') {
                // Force AI Generation (Study Hub)
                console.log(`✨ Generating fresh AI questions for ${subject}...`);
                rawQuestions = await generateAIQuestions(subject, topic, count, score, factors);
            } else {
                // Default / Mode = 'json' (Practice Set Interface)
                // 1. Try to load from valid JSON set file first
                console.log(`📂 Loading JSON Set ${setNum} for ${subject}`);
                rawQuestions = await loadQuestionSet(subject, setNum);

                // Debug: Check if keywords exist in raw data
                if (rawQuestions && rawQuestions.length > 0) {
                    console.log(`🔍 RAW Question 0 keywords from JSON:`, rawQuestions[0].keywords);
                }

                // 2. If JSON set is empty or missing, fallback to AI Generation IS DISABLED FOR STRICT JSON REQUIREMENT?
                // User Request: "mock test and mcq practice will be from the json only"
                // So if json is missing, we should probably return empty or error, NOT fallback to AI.

                if (!rawQuestions || rawQuestions.length === 0) {
                    console.warn(`⚠️ Set ${setNum} not found for ${subject}. Returning empty list (Strict JSON Mode).`);
                    return [];
                }

                // slice to requested count if JSON has more
                if (count && rawQuestions.length > count) {
                    rawQuestions = rawQuestions.slice(0, count);
                }
            }

            let validQuestions = rawQuestions.filter(isValidQuestion);

            // Add keywords context from all questions in the set (for LLM prompts)
            const keywordContext = await getKeywordsForCurrentSet(subject, setNum);

            // Format questions - keywords already included from formatQ
            const result = validQuestions.map((q, i) => {
                const formatted = formatQ(q, subject, i + 1);
                // Add keywordContext array for LLM prompts (don't overwrite keywords object)
                formatted.keywordContext = formatKeywordsAsContext(keywordContext);
                return formatted;
            });

            // Debug: Log first question's keywords
            if (result.length > 0) {
                console.log(`🔍 FORMATTED Question 0 keywords:`, result[0].keywords);
            }

            return result;
        }

        // --- OLD LOGIC For Mock Tests (Random Sampling from Big Files) ---
        const data = await loadQuestionsData();

        if (!data) {
            // Fallback for mock tests if big files missing
            throw new Error("RAG model data not found in subjects_split directory.");
        }

        // Configuration based on Mock ID
        let questionsPerSubject = 50;
        let difficultyPref = null;

        if (mockId === 'neet-mock-sample') {
            questionsPerSubject = 5;
        } else if (mockId === 'neet-mock-2' || mockId === 'neet-mock-5') {
            difficultyPref = 'Hard';
        } else if (mockId === 'NEET AI Examiner') {
            questionsPerSubject = 25;
        }

        const getSubjectQuestions = (subName, count, topicName = null) => {
            let pool = data.filter(q => q.subject.toLowerCase() === subName.toLowerCase() && isValidQuestion(q));

            // Apply Topic Filter if provided
            if (topicName && topicName !== "") {
                const topicPool = pool.filter(q => (q.sub_topic || '').toLowerCase() === topicName.toLowerCase());
                if (topicPool.length > 0) pool = topicPool;
            }

            if (pool.length < count && ['botany', 'zoology'].includes(subName.toLowerCase())) {
                pool = pool.concat(data.filter(q => q.subject === 'Biology' && isValidQuestion(q)));
            }

            if (difficultyPref) {
                const preferred = pool.filter(q => q.difficulty === difficultyPref);
                const others = pool.filter(q => q.difficulty !== difficultyPref);
                pool = [...preferred, ...others];
            }

            // Ensure unique
            const unique = [];
            const seen = new Set();
            for (const q of pool) {
                const snippet = q.text.substring(0, 50);
                if (!seen.has(snippet)) {
                    unique.push(q);
                    seen.add(snippet);
                }
            }

            // Shuffle and prefer sub-topic diversity
            const shuffled = unique.sort(() => Math.random() - 0.5);
            const selected = [];
            const subTopicsSeen = new Map();
            const MAX_PER_SUBTOPIC = Math.ceil(count * 0.25); // Limit each sub-topic to 25% of the total count if possible

            for (const q of shuffled) {
                if (selected.length >= count) break;

                const subTopic = q.sub_topic || 'General';
                const topicCount = subTopicsSeen.get(subTopic) || 0;

                if (topicCount < MAX_PER_SUBTOPIC) {
                    selected.push(q);
                    subTopicsSeen.set(subTopic, topicCount + 1);
                }
            }

            // If we still need more (relaxed diversity)
            if (selected.length < count) {
                for (const q of shuffled) {
                    if (selected.length >= count) break;
                    if (!selected.includes(q)) {
                        selected.push(q);
                    }
                }
            }

            return selected;
        };

        let allQs = [];

        const MOCK_TEST_DIR = path.join(__dirname, '../../data/questions/micro_mock_test');

        if (mockId.startsWith('neet-mock-')) {
            // NEW LOGIC: Load specific paper JSON from data/questions/mock_test
            console.log(`📝 Loading Mock Test Paper for: ${mockId}`);

            // Extract paper number (e.g. neet-mock-1 -> 1, neet-mock-sample -> 1)
            let paperNum = mockId.replace('neet-mock-', '');
            if (paperNum === 'sample') paperNum = '1';
            
            const paperFile = path.join(MOCK_TEST_DIR, `micro_mock_test_${paperNum}`, `micro_${paperNum}.json`);

            let rawQuestions = [];
            try {
                try {
                    await fs.promises.access(paperFile);
                    console.log(`📂 Reading paper file: ${paperFile}`);
                    const content = await fs.promises.readFile(paperFile, 'utf-8');
                    rawQuestions = JSON.parse(content);
                } catch (accessErr) {
                    console.error(`❌ Paper file not found: ${paperFile}`);
                }
            } catch (e) {
                console.error(`❌ Error reading mock paper ${paperNum}:`, e);
            }

            // Filter and format
            // Note: The raw JSON in paperX.json might act like 'setX.json'
            const validQuestions = rawQuestions.filter(isValidQuestion);

            // We need to map them. Since they are pre-mixed in a paper, we just format them.
            // Assuming paper structure is array of question objects.
            return validQuestions.map((q, i) => formatQ(q, q.subject || 'General', i + 1));

        } else {
            // Default: Full Mock (NEET AI Examiner) - potentially still uses RAG/SPLIT_DIR if not migrated?
            // User only asked to update "mock paper ques" (neet-mock-X). 
            // "NEET AI Examiner" might be a different flow. 
            // Leaving this part as is for "NEET AI Examiner" unless it matches neet-mock- prefix logic which it doesn't.

            const subjects = ['Physics', 'Chemistry', 'Botany', 'Zoology'];
            subjects.forEach(sub => {
                const qs = getSubjectQuestions(sub, questionsPerSubject, topic);
                qs.forEach((q, i) => allQs.push(formatQ(q, sub, i + 1)));
            });
        }

        return allQs;

    } catch (err) {
        console.error("Error in fetchNEETMockQuestions:", err);
        throw err;
    }
};

/**
 * Get the number of available practice sets for a subject.
 * Scans the directory for setX.json files.
 */
export const getAvailableSetsCount = async (subject) => {
    try {
        if (!subject) return 0;
        const subjectDir = path.join(SUBJECT_SET_DIR, normalizeSubjectFolder(subject));

        try {
            await fs.promises.access(subjectDir);
        } catch {
            console.warn(`Subject directory not found: ${subjectDir}`);
            return 0;
        }

        const entries = await fs.promises.readdir(subjectDir, { withFileTypes: true });
        // patterns: Set1, Set2 ... directories
        const setDirs = entries.filter(dirent => {
            return dirent.isDirectory() && /^Set\d+$/.test(dirent.name);
        });

        return setDirs.length;
    } catch (e) {
        console.error(`Error counting sets for ${subject}:`, e);
        return 0;
    }
};
