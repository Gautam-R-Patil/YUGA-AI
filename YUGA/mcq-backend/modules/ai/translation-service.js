import { Translate } from '@google-cloud/translate/build/src/v2/index.js';
import { HfInference } from "@huggingface/inference";
import path from 'path';
import { fileURLToPath } from 'url';
import { SUPPORTED_LANGUAGES, MODEL_EN_INDIC, MODEL_INDIC_EN } from './ai-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientTranslate = new Translate({
    keyFilename: path.join(__dirname, '../../google-service-account.json')
});

const hf = new HfInference(process.env.HF_TOKEN);

function getTranslationModel(sourceLang, targetLang) {
    if (sourceLang === 'english' && targetLang !== 'english') return MODEL_EN_INDIC;
    else if (sourceLang !== 'english' && targetLang === 'english') return MODEL_INDIC_EN;
    return null;
}

export async function translateWithNLLB(text, sourceLang, targetLang) {
    if (sourceLang === targetLang || !text) return text;

    const sourceConfig = SUPPORTED_LANGUAGES[sourceLang] || SUPPORTED_LANGUAGES['english'];
    const targetConfig = SUPPORTED_LANGUAGES[targetLang] || SUPPORTED_LANGUAGES['english'];

    console.log(`Translate Request: ${sourceLang} -> ${targetLang}`);

    const model = getTranslationModel(sourceLang, targetLang);
    if (model && sourceConfig.indicCode && targetConfig.indicCode) {
        console.log(`Attempting IndicTrans2 translation with model: ${model}`);
        try {
            const result = await hf.translation({
                model: model, inputs: text,
                parameters: { src_lang: sourceConfig.indicCode, tgt_lang: targetConfig.indicCode }
            });
            let translatedText = '';
            if (Array.isArray(result)) translatedText = result[0]?.translation_text || result[0];
            else translatedText = result.translation_text;

            if (translatedText) {
                console.log(`IndicTrans2 Success: "${translatedText}"`);
                return translatedText;
            }
        } catch (hfError) {
            console.error("IndicTrans2 Failed:", hfError.message);
            console.log("Falling back to Google Translate...");
        }
    }

    if (!sourceConfig.googleCode || !targetConfig.googleCode) return text;
    console.log(`Translating (Google)...`);
    try {
        const [translation] = await clientTranslate.translate(text, targetConfig.googleCode);
        return translation;
    } catch (error) {
        console.error("Google Translation Error:", error.message);
        return text;
    }
}
