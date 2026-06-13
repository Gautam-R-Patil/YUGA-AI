import express from 'express';
import {
    generateAssessmentQuestions,
    generateStudySchedule,
    customizeSchedule
} from './schedule-controller.js';
import { verifyToken } from '../shared/middleware/auth-middleware.js';

const router = express.Router();

// Generate assessment questions
router.post('/assessment/generate', generateAssessmentQuestions);

// Generate personalized study schedule
router.post('/generate', verifyToken, generateStudySchedule);

// Customize existing schedule
router.post('/customize', verifyToken, customizeSchedule);

export default router;
