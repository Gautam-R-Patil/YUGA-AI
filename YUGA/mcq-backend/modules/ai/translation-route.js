import express from 'express';
import { handleTranslation, handleMalayalamTTS } from './translation-controller.js';

const router = express.Router();

router.post('/translate', handleTranslation);
router.post('/tts/malayalam', handleMalayalamTTS); // NEW: Malayalam TTS route

export default router;