import express from 'express';
import { handleVoiceQuery, handleTTS } from './voice-controller.js';
import { verifyToken } from "../shared/middleware/auth-middleware.js";

const router = express.Router();

router.post('/query', verifyToken, handleVoiceQuery);
router.post('/speak', verifyToken, handleTTS);

export default router;