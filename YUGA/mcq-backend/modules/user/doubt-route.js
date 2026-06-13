// voice-route.js
import express from 'express';
import { handleVoiceQuery, handleMCQExplanation } from './doubt-controller.js';

const router = express.Router();

// Existing voice query route
router.post('/query', handleVoiceQuery);

// New route for MCQ explanations
router.post('/mcq-explanation', handleMCQExplanation);

export default router;