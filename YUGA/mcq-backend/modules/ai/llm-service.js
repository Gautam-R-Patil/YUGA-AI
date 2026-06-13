import Groq from 'groq-sdk';
import OpenAI from 'openai';

// Groq init is now lazy

const PRIMARY_MODEL = "llama-3.3-70b-versatile"; // LLAMA 3.3 70B
const FALLBACK_MODEL = "llama-3.1-8b-instant";   // LLAMA 3.1 8B

const responseCache = new Map();
const CACHE_TTL = 3600000;
const MAX_CACHE_SIZE = 100;

function cleanCache() {
    const now = Date.now();
    for (const [key, value] of responseCache.entries()) if (now - value.timestamp > CACHE_TTL) responseCache.delete(key);
    if (responseCache.size > MAX_CACHE_SIZE) {
        const entries = Array.from(responseCache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);
        entries.slice(0, responseCache.size - MAX_CACHE_SIZE).forEach(([key]) => responseCache.delete(key));
    }
}

async function retryWithBackoff(fn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try { return await fn(); }
        catch (error) {
            if (i === maxRetries - 1) throw error;
            const delay = Math.min(1000 * Math.pow(2, i), 10000);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

function validateResponse(response, minLength = 20) {
    if (!response || response.length < minLength) throw new Error(`Response too short or empty (got ${response?.length || 0} chars, need ${minLength})`);
    if (/I (could not|cannot|can't) generate|failed to|error occurred/i.test(response)) throw new Error('Response contains error indicators');
    return true;
}

const getSystemPrompt = (language = 'english', courseCategory = 'NEET', taskType = 'general') => {
    const isJEE = /JEE|IIT|Engineering|Math/i.test(courseCategory);
    let contextHeader = isJEE ? "IIT-JEE (Mains & Advanced)" : "NEET-UG (Medical)";
    let specificInstructions = isJEE ?
        `- **JEE FOCUS**: Focus on problem-solving, deep understanding, stays within Physics/Chem/Math syllabus.` :
        `- **NEET FOCUS**: **STRICTLY NCERT BASED (2024-25)**. Focus on Biology details, Physics/Chem formulas per NEET syllabus. No experimental or out-of-syllabus content.`;

    let formattingRules = `4. **FORMATTING RULES (STRICT)**: 
   - Use **Markdown** for structure. 
   - Use **Bold** for headers (e.g., **Core Concept**). **ALWAYS leave a blank line before and after headers.**
   - Use **Bold** for key terms and final answers.
   - Use LaTeX for math. Use inline math for small variables (e.g., $\\alpha = 3$).
   - **IMPORTANT**: Use display math blocks ($$ ... $$) for key formulas and final derivations to make them stand out.
   - **Chemical formulas**: ALWAYS use LaTeX with subscripts (e.g., $\\text{H}_2\\text{O}$). NEVER write "H 2 O".
   - **Step-by-Step**: Use numbered lists. Each point should be a single, clear idea. Leave a blank line between list items for readability.
   - **Structure**: 
     1. Correct Option (e.g., **Correct Option: (2)**)
     2. **Core Concept**
     3. **Key Formula** (if applicable)
     4. **Step-by-Step Explanation**
     5. **Conclusion**
   - **NEVER** use braces like '{Core Concept' or JSON format unless explicitly asked.`;

    if (taskType === 'doubt_clarification') {
        formattingRules = `4. **FORMATTING RULES & STRICTURES**:
   - **STRICT CONTEXT ENFORCEMENT**: You MUST ONLY answer doubts directly related to the specific academic question or concept provided in the conversation context.
   - **DO NOT** answer general knowledge, life advice, personal questions, or any topic outside the immediate academic scope of the problem being solved.
   - If a student tries to go off-topic, politely say: "I am here to help you only with this specific question/topic. Let's stay focused on your learning!" and redirect them.
   - Write conversationally and kindly, like a helpful tutor.
   - **DO NOT use LaTeX** (do not use $ or $$). Use standard text characters (e.g., a^2, H2O, pi) since the chat interface does not render LaTeX.
   - Keep it highly readable with short paragraphs and bullet points if needed.
   - Only address the student's specific doubt. Provide direct, natural conversational responses.`;
    }

    const basePrompt = `You are 'Educore', a Senior ${contextHeader} Expert.
Your core objective is to provide **100% accurate, concise, and NCERT-verified** academic content.
### CRITICAL INSTRUCTIONS:
1. **ACCURACY IS PARAMOUNT**: Never hallucinate. Verify every formula and fact against **NCERT 2024-25**.
2. **BE CONCISE**: Provide direct, factual answers without unnecessary fluff.
3. **EXAM FOCUS**: Design explanations to mimic the quality of top ranker's notes. ${specificInstructions}
${formattingRules}
`;
    if (language === 'english') return basePrompt + `5. **LANGUAGE**: Professional academic English.`;
    return basePrompt;
};

const getOptimalTemperature = (taskType = 'general') => ({
    'explanation': 0.4, 'doubt_clarification': 0.3, 'example': 0.6, 'summary': 0.3,
    'quiz_explanation': 0.4, 'lecture': 0.5, 'general': 0.5, 'qa': 0.1
}[taskType] || 0.5);



// Lazy init for Groq to handle import order issues
let groqClient = null;
function getGroqClient() {
    if (!groqClient && process.env.GROQ_API_KEY) {
        groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groqClient;
}

// Lazy init for OpenAI
let openaiClient = null;
function getOpenAIClient() {
    if (!openaiClient && process.env.OPENAI_KEY) {
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_KEY });
    }
    return openaiClient;
}

async function makeGroqCall(messages, model, temperature, useJsonMode = false) {
    const client = getGroqClient();
    if (!client) throw new Error('GROQ_API_KEY not found in environment');

    console.log(`Using Groq model: ${model}${useJsonMode ? ' (JSON Mode)' : ''}`);

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
        const payload = {
            messages,
            model,
            temperature,
            max_tokens: 4096,
            top_p: 0.9
        };

        if (useJsonMode) {
            payload.response_format = { type: "json_object" };
        }

        const completion = await client.chat.completions.create(payload);
        clearTimeout(timeoutId);

        const responseText = completion.choices[0]?.message?.content?.trim() || "";
        validateResponse(responseText, useJsonMode ? 10 : 20); // JSON might be shorter
        return responseText;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - Groq API took longer than 60 seconds');
        }
        throw error;
    }
}

async function makeOpenAICall(messages, model, temperature, useJsonMode = false) {
    const client = getOpenAIClient();
    if (!client) throw new Error('OPENAI_KEY not found in environment');

    console.log(`Using OpenAI model: ${model}${useJsonMode ? ' (JSON Mode)' : ''}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
        const payload = {
            messages,
            model,
            temperature,
            max_tokens: 4096,
            top_p: 0.9
        };

        if (useJsonMode) {
            payload.response_format = { type: "json_object" };
        }

        const completion = await client.chat.completions.create(payload, { signal: controller.signal });
        clearTimeout(timeoutId);

        const responseText = completion.choices[0]?.message?.content?.trim() || "";
        validateResponse(responseText, useJsonMode ? 10 : 20);
        return responseText;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - OpenAI API took longer than 60 seconds');
        }
        throw error;
    }
}

export async function getOpenAICompletion(messages, courseCategory = 'NEET', taskType = 'general', useCache = true, language = 'english', useJsonMode = false) {
    const cacheKey = JSON.stringify({ provider: 'openai', messages, courseCategory, taskType, language, useJsonMode });
    if (useCache) {
        const cached = responseCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) return cached.response;
    }

    const systemPrompt = getSystemPrompt(language, courseCategory, taskType);
    const allMessages = [{ role: "system", content: systemPrompt }, ...messages];
    const temperature = getOptimalTemperature(taskType);

    const client = getOpenAIClient();
    if (!client) {
        throw new Error('OPENAI_KEY not found in environment. Cannot proceed without OpenAI API access.');
    }

    let response;
    const OPENAI_MODEL = "gpt-4o";

    try {
        response = await retryWithBackoff(() => makeOpenAICall(allMessages, OPENAI_MODEL, temperature, useJsonMode), 3);
    } catch (error) {
        throw new Error(`OpenAI attempt failed: ${error.message}`);
    }

    // Clean Response
    if (response) {
        response = response.trim();
        if (response.startsWith('{') && !response.endsWith('}')) {
            response = response.replace(/^\{\s*/, '');
        }
        response = response.replace(/^{Core Concept/, '### Core Concept');

        if (useCache) {
            cleanCache();
            responseCache.set(cacheKey, { response, timestamp: Date.now() });
        }
    }
    return response;
}

export async function getCompletion(messages, courseCategory = 'NEET', taskType = 'general', useCache = true, language = 'english', useJsonMode = false) {
    const cacheKey = JSON.stringify({ messages, courseCategory, taskType, language, useJsonMode });
    if (useCache) {
        const cached = responseCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) return cached.response;
    }

    const systemPrompt = getSystemPrompt(language, courseCategory, taskType);
    const allMessages = [{ role: "system", content: systemPrompt }, ...messages];
    const temperature = getOptimalTemperature(taskType);

    const client = getGroqClient();
    if (!client) {
        throw new Error('GROQ_API_KEY not found in environment. Cannot proceed without Groq API access.');
    }

    let response;

    // 1. Try LLAMA 3.3 70B (Primary)
    try {
        response = await retryWithBackoff(() => makeGroqCall(allMessages, PRIMARY_MODEL, temperature, useJsonMode), 3);
    } catch (primaryError) {
        console.warn(`LLAMA 3.3 70B failed (${primaryError.message}), switching to fallback...`);

        // 2. Fallback to LLAMA 3.1 8B
        try {
            response = await retryWithBackoff(() => makeGroqCall(allMessages, FALLBACK_MODEL, temperature, useJsonMode), 3);
        } catch (fallbackError) {
            throw new Error(`All LLM attempts failed. Primary (3.3 70B): ${primaryError.message}, Fallback (3.1 8B): ${fallbackError.message}`);
        }
    }

    // Clean Response
    if (response) {
        response = response.trim();
        // aggressively clean leading braces if they look like the start of a mistake
        if (response.startsWith('{') && !response.endsWith('}')) {
            response = response.replace(/^\{\s*/, '');
        }
        // Specific fix for user reported "{Core Concept"
        response = response.replace(/^{Core Concept/, '### Core Concept');

        if (useCache) {
            cleanCache();
            responseCache.set(cacheKey, { response, timestamp: Date.now() });
        }
    }
    return response;
}

export async function getCompletionStream(messages, courseCategory = 'NEET', taskType = 'general', onChunk, language = 'english') {
    const systemPrompt = getSystemPrompt(language, courseCategory, taskType);
    const allMessages = [{ role: "system", content: systemPrompt }, ...messages];
    const temperature = getOptimalTemperature(taskType);

    const client = getGroqClient();
    if (!client) {
        throw new Error('GROQ_API_KEY not found in environment. Streaming requires Groq API access.');
    }

    const streamGroq = async (model) => {
        console.log(`Using Groq model (stream): ${model}`);
        const stream = await client.chat.completions.create({
            messages: allMessages, model, temperature, max_tokens: 4096, top_p: 0.9, stream: true
        });

        let fullResponse = '';
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullResponse += content;
            if (onChunk && content) onChunk(content);
        }
        return fullResponse;
    };

    // Try primary model, fallback to secondary
    try {
        return await streamGroq(PRIMARY_MODEL);
    } catch (e) {
        console.warn(`LLAMA 3.3 70B stream failed: ${e.message}. Switching to fallback...`);
        return await streamGroq(FALLBACK_MODEL);
    }
}

export async function getContextualCompletion(messages, context) {
    const { courseCategory = 'NEET', studentLevel = 'intermediate', previousTopics = [], currentChapter = '', learningGoal = 'exam preparation', taskType = 'general', useCache = true } = context;
    const contextPrompt = `\nSTUDENT PROFILE:\n- Level: ${studentLevel}\n- Chapter: ${currentChapter}\n- Covered: ${previousTopics.join(', ')}\n- Goal: ${learningGoal}\nAdapt to this level.`;
    const messagesWithContext = messages.map((m, i) => (i === messages.length - 1 && m.role === 'user') ? { ...m, content: m.content + contextPrompt } : m);
    return await getCompletion(messagesWithContext, courseCategory, taskType, useCache, context.language || 'english');
}

export async function generatePersonalizedExplanation(concept, studentProfile) {
    const { weakAreas = [], strongAreas = [], learningStyle = 'visual', previousMistakes = [], courseCategory = 'NEET' } = studentProfile;
    const prompt = `STUDENT PROFILE:\n- Weak: ${weakAreas.join(', ')}\n- Strong: ${strongAreas.join(', ')}\n- Style: ${learningStyle}\n- Mistakes: ${previousMistakes.join(', ')}\nTASK: Explain "${concept}" using ${learningStyle} approach, connecting to strong areas.`;
    return await getCompletion([{ role: "user", content: prompt }], courseCategory, 'explanation', false);
}
