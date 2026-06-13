import * as TranslationService from "./translation-service.js";

export const handleTranslation = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'No text provided for translation' });
    }

    if (!targetLanguage) {
      return res.status(400).json({ error: 'No target language specified' });
    }

    console.log('Translating text to:', targetLanguage);
    console.log('Text length:', text.length);
    console.log('Text sample:', text.substring(0, 100) + '...');

    const result = await TranslationService.translateText(text, targetLanguage);
    res.json(result);

  } catch (error) {
    console.error('Translation controller error:', error);
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({
      error: 'Translation failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// NEW: Malayalam Text-to-Speech endpoint
export const handleMalayalamTTS = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'No text provided for TTS' });
    }

    console.log('Generating Malayalam TTS for text:', text.substring(0, 100) + '...');

    const result = await TranslationService.generateMalayalamTTS(text);
    res.json(result);

  } catch (error) {
    console.error('Malayalam TTS controller error:', error);
    res.status(500).json({
      error: 'TTS failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};