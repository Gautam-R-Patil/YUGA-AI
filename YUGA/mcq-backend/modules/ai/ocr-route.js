import express from 'express';
import {
  extractText,
  extractTextBatch,
  backfillOCR,
  getQuestionOCR,
  solveExercise
} from './ocr-controller.js';

const router = express.Router();

// Extract text from a single image
router.post('/extract', extractText);

// Solve problem from image
router.post('/solve', solveExercise);

// Extract text from multiple images
router.post('/extract-batch', extractTextBatch);

// Backfill OCR for existing questions
router.post('/backfill', backfillOCR);

// Get OCR text for a specific question
router.get('/question/:id', getQuestionOCR);

export default router;



