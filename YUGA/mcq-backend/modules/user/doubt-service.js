import { SpeechClient } from '@google-cloud/speech';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

import { preprocessTextForTTS } from './voice-service.js';
import { getOpenAICompletion } from '../ai/llm-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Google Cloud clients
const clientSTT = new SpeechClient({
    keyFilename: path.join(__dirname, '../google-service-account.json')
});

const clientTTS = new TextToSpeechClient({
    keyFilename: path.join(__dirname, '../google-service-account.json')
});

// getOpenAICompletion is imported from llm-service.js

// Convert text -> speech
async function synthesizeSpeech(text) {
    const processedText = preprocessTextForTTS(text);
    const [response] = await clientTTS.synthesizeSpeech({
        input: { text: processedText },
        voice: { languageCode: "en-US", ssmlGender: "FEMALE" },
        audioConfig: { audioEncoding: "MP3" }
    });

    return response.audioContent;
}

// Transcribe audio
async function transcribeAudio(audioBuffer) {
    const [response] = await clientSTT.recognize({
        audio: { content: audioBuffer.toString('base64') },
        config: {
            encoding: "WEBM_OPUS",
            sampleRateHertz: 48000,
            languageCode: "en-US",
        }
    });

    return response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
}

export const processVoiceQuery = async (audio, messages = []) => {
    // If audio is provided, transcribe it
    let userSpeech = '';
    if (audio) {
        const audioBuffer = Buffer.from(audio, 'base64');
        userSpeech = await transcribeAudio(audioBuffer);
    } else if (messages.length > 0) {
        // Get the last user message if no audio
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        userSpeech = lastUserMessage?.content || '';
    } else {
        throw { status: 400, message: 'No audio or text provided' };
    }

    // messages already contain the conversation history
    const allMessages = [
        ...messages,
        { role: "user", content: userSpeech }
    ];

    // Get response from primary model via OpenAI (gpt-4o)
    // llm-service.js will automatically prepend the correct system prompt based on taskType
    const reply = await getOpenAICompletion(allMessages, 'NEET', 'doubt_clarification');

    // Convert response to speech
    const audioContent = await synthesizeSpeech(reply);

    return {
        transcription: userSpeech,
        response: reply,
        audio: audioContent.toString('base64')
    };
};
