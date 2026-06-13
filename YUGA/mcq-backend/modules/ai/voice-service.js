import { SpeechClient } from '@google-cloud/speech';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import { SUPPORTED_LANGUAGES, NEET_KEYWORDS } from './ai-config.js';
import { preprocessTextForTTS, chunkText, applyKeywordSubstitutions } from './text-utils.js';
export { translateWithNLLB } from './translation-service.js';
export { getCompletion, getOpenAICompletion, getCompletionStream, getContextualCompletion, generatePersonalizedExplanation } from './llm-service.js';
export { applyKeywordSubstitutions } from './text-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientSTT = new SpeechClient({ keyFilename: path.join(__dirname, '../../google-service-account.json') });
const clientTTS = new TextToSpeechClient({ keyFilename: path.join(__dirname, '../../google-service-account.json') });

const GOOGLE_AUDIO_MIME = 'audio/mp3';
const QWEN_AUDIO_MIME = 'audio/wav';
const DEFAULT_QWEN_URL = 'http://127.0.0.1:8001';
const DEFAULT_QWEN_TIMEOUT_MS = 12000;

function isEnglishLanguage(language = 'english') {
    const normalized = (language || 'english').toString().trim().toLowerCase();
    return normalized === 'english' || normalized === 'en' || normalized.startsWith('en-');
}

function getTTSProvider() {
    return (process.env.TTS_PROVIDER || 'qwen').toLowerCase();
}

function isGoogleFallbackEnabled() {
    return process.env.TTS_GOOGLE_FALLBACK !== 'false';
}

function getQwenTimeoutMs() {
    const raw = Number(process.env.QWEN_TTS_TIMEOUT_MS);
    if (Number.isFinite(raw) && raw > 0) {
        return raw;
    }
    return DEFAULT_QWEN_TIMEOUT_MS;
}

function buildQwenPayload(text, language) {
    return {
        text,
        language: isEnglishLanguage(language) ? 'English' : language,
        speaker: process.env.QWEN_TTS_SPEAKER || 'Ryan',
        instruct: process.env.QWEN_TTS_INSTRUCT_ENGLISH || 'Speak like a warm Indian-English tutor: clear, medium pace, natural intonation, student-friendly emphasis, and concise pauses between concepts.'
    };
}

function getQwenUrl() {
    const baseUrl = (process.env.QWEN_TTS_URL || DEFAULT_QWEN_URL).replace(/\/$/, '');
    return `${baseUrl}/synthesize`;
}

function preprocessSpeechText(text, language = 'english', keywords = {}) {
    let processedText = text;

    if (Object.keys(keywords).length > 0) {
        processedText = applyKeywordSubstitutions(processedText, keywords);
    }

    return language === 'english' ? preprocessTextForTTS(processedText) : processedText;
}

async function synthesizeWithGoogleChunked(processedText, language = 'english') {
    const chunks = chunkText(processedText);
    const audioBuffers = [];
    const langConfig = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES['english'];

    const audioPromises = chunks.map(async (chunk, i) => {
        if (!chunk) return null;
        try {
            const [response] = await clientTTS.synthesizeSpeech({
                input: { text: chunk },
                voice: langConfig.ttsVoice,
                audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0, pitch: 0, volumeGainDb: 0 }
            });
            return response.audioContent;
        } catch (err) {
            console.error(`TTS Error on Google chunk ${i}:`, err.message);
            throw err;
        }
    });

    const resolvedBuffers = await Promise.all(audioPromises);
    resolvedBuffers.forEach(buf => {
        if (buf) audioBuffers.push(buf);
    });

    return Buffer.concat(audioBuffers);
}

async function synthesizeWithGoogleSingle(processedText, language = 'english') {
    const langConfig = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES['english'];
    const [response] = await clientTTS.synthesizeSpeech({
        input: { text: processedText },
        voice: langConfig.ttsVoice,
        audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0, pitch: 0, volumeGainDb: 0 }
    });
    return Buffer.from(response.audioContent);
}

async function synthesizeWithQwen(processedText, language = 'english') {
    const timeoutMs = getQwenTimeoutMs();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const startedAt = Date.now();
        const response = await fetch(getQwenUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildQwenPayload(processedText, language)),
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`Qwen service returned ${response.status}`);
        }

        const data = await response.json();
        if (!data.audioBase64) {
            throw new Error('Qwen service returned empty audioBase64');
        }

        return {
            audioBuffer: Buffer.from(data.audioBase64, 'base64'),
            audioMime: data.audioMime || QWEN_AUDIO_MIME,
            provider: 'qwen',
            latencyMs: Date.now() - startedAt,
            fallbackUsed: false
        };
    } finally {
        clearTimeout(timeout);
    }
}

// Convert text -> speech
export async function synthesizeSpeech(text, language = 'english') {
    try {
        const processedText = preprocessSpeechText(text, language);
        const provider = getTTSProvider();

        if (provider === 'qwen' && isEnglishLanguage(language)) {
            try {
                const qwenResult = await synthesizeWithQwen(processedText, language);
                console.log(`[TTS] provider=${qwenResult.provider} language=${language} latencyMs=${qwenResult.latencyMs}`);
                return qwenResult.audioBuffer;
            } catch (qwenErr) {
                console.warn(`[TTS] Qwen synthesizeSpeech failed: ${qwenErr.message}`);
                if (!isGoogleFallbackEnabled()) {
                    throw qwenErr;
                }
                console.warn('[TTS] Falling back to Google synthesizeSpeech');
            }
        }

        const startedAt = Date.now();
        const googleAudio = await synthesizeWithGoogleSingle(processedText, language);
        console.log(`[TTS] provider=google language=${language} latencyMs=${Date.now() - startedAt}`);
        return googleAudio;
    } catch (err) {
        console.error('TTS Error:', err);
        throw new Error('Failed to synthesize speech');
    }
}

// Synthesize long audio by chunking
// Keywords should be applied BEFORE preprocessTextForTTS to avoid conflicts
export async function synthesizeLongAudio(text, language = 'english', keywords = {}) {
    console.log('\n>>> synthesizeLongAudio called');
    console.log('>>> Keywords passed:', JSON.stringify(keywords));
    console.log('>>> Keywords count:', Object.keys(keywords).length);

    const processedText = preprocessSpeechText(text, language, keywords);
    console.log(`>>> Text after preprocessing (first 150 chars): "${processedText.substring(0, 150)}..."`);

    const ttsProvider = getTTSProvider();
    const isEnglish = isEnglishLanguage(language);

    if (ttsProvider === 'qwen' && isEnglish) {
        try {
            const qwenResult = await synthesizeWithQwen(processedText, language);
            console.log(`[TTS] provider=${qwenResult.provider} language=${language} latencyMs=${qwenResult.latencyMs}`);
            return qwenResult;
        } catch (qwenErr) {
            console.warn(`[TTS] Qwen failed for english audio: ${qwenErr.message}`);

            if (!isGoogleFallbackEnabled()) {
                throw new Error(`Qwen TTS failed and fallback is disabled: ${qwenErr.message}`);
            }

            console.warn('[TTS] Fallback engaged: google');
            const startedAt = Date.now();
            const googleAudio = await synthesizeWithGoogleChunked(processedText, language);
            const latencyMs = Date.now() - startedAt;
            console.log(`[TTS] provider=google language=${language} latencyMs=${latencyMs} fallbackFrom=qwen`);
            return {
                audioBuffer: googleAudio,
                audioMime: GOOGLE_AUDIO_MIME,
                provider: 'google',
                latencyMs,
                fallbackUsed: true
            };
        }
    }

    const startedAt = Date.now();
    const googleAudio = await synthesizeWithGoogleChunked(processedText, language);
    const latencyMs = Date.now() - startedAt;
    console.log(`[TTS] provider=google language=${language} latencyMs=${latencyMs}`);

    return {
        audioBuffer: googleAudio,
        audioMime: GOOGLE_AUDIO_MIME,
        provider: 'google',
        latencyMs,
        fallbackUsed: false
    };
}

// Transcribe audio
export async function transcribeAudio(audioBuffer, language = 'english') {
    try {
        const langConfig = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES['english'];
        const languageCode = langConfig.sttCode;
        const alternativeLanguageCodes = (languageCode !== 'en-IN') ? ['en-IN'] : [];

        const [response] = await clientSTT.recognize({
            audio: { content: audioBuffer.toString('base64') },
            config: {
                encoding: "WEBM_OPUS", sampleRateHertz: 48000, languageCode: languageCode,
                alternativeLanguageCodes: alternativeLanguageCodes,
                speechContexts: [{ phrases: NEET_KEYWORDS, boost: 10.0 }]
            }
        });

        if (!response.results || response.results.length === 0) throw new Error('No speech detected');
        return response.results.map(result => result.alternatives[0].transcript).join('\n');
    } catch (err) {
        console.error("STT Error:", err);
        throw new Error(`Failed to transcribe audio: ${err.message}`);
    }
}
