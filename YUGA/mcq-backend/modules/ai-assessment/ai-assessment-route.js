import express from 'express';
import { generateAssessment, submitAssessment, getQuestionExplanation } from './ai-assessment-controller.js';
import { verifyToken } from '../shared/middleware/auth-middleware.js';

const router = express.Router();

// Protected route to generate assessment
router.post('/generate', verifyToken, generateAssessment);

// Protected route to submit assessment score
router.post('/submit', verifyToken, submitAssessment);

// On-demand explanation
router.post('/explain', verifyToken, getQuestionExplanation);

export default router;
