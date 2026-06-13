import express from 'express';
import { getQuestionExplanation, downloadPerformanceReport } from './analysisController.js';

const router = express.Router();

router.post('/explain', getQuestionExplanation);
router.post('/report', downloadPerformanceReport);

export default router;
