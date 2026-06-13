import { extractTextFromImage, extractTextFromMultipleImages, solveProblemFromImage } from './ocr-service.js';
import * as MCQService from '../assessment/mcq-service.js';

/**
 * Extract text from a single image
 */
export const extractText = async (req, res) => {
  try {
    const { base64Image, contentType } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: 'base64Image is required' });
    }

    const extractedText = await extractTextFromImage(base64Image, contentType || 'image/jpeg');

    res.status(200).json({
      success: true,
      text: extractedText,
      hasText: extractedText.length > 0
    });
  } catch (error) {
    console.error('Error in extractText controller:', error);
    res.status(500).json({ error: error.message || 'Failed to extract text from image' });
  }
};

/**
 * Extract text from multiple images
 */
export const extractTextBatch = async (req, res) => {
  try {
    const { images } = req.body;

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ error: 'images array is required' });
    }

    const extractedTexts = await extractTextFromMultipleImages(images);

    res.status(200).json({
      success: true,
      results: extractedTexts.map((text, index) => ({
        index,
        text,
        hasText: text.length > 0
      }))
    });
  } catch (error) {
    console.error('Error in extractTextBatch controller:', error);
    res.status(500).json({ error: error.message || 'Failed to extract text from images' });
  }
};

/**
 * Backfill OCR text for existing questions with images
 */
export const backfillOCR = async (req, res) => {
  try {
    const { limit, subject } = req.query;
    const result = await MCQService.backfillOCR(limit ? parseInt(limit) : 100, subject);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in backfillOCR controller:', error);
    res.status(500).json({ error: error.message || 'Failed to backfill OCR text' });
  }
};

/**
 * Get OCR text for a specific question
 */
export const getQuestionOCR = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await MCQService.getQuestionOCR(id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getQuestionOCR controller:', error);
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Failed to get OCR text' });
  }
};

/**
 * Solve a problem from an image
 */
export const solveExercise = async (req, res) => {
  try {
    const { base64Image, contentType } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: 'base64Image is required' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const User = (await import('../shared/db/models/user_schema.js')).default;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const plan = user.membership?.plan || 'free';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usageStats = user.usageStats || {};
    const lastOcrDate = usageStats.lastOcrDate ? new Date(usageStats.lastOcrDate) : null;

    // Reset count if it's a new day
    if (!lastOcrDate || lastOcrDate < today) {
      usageStats.ocrUsedToday = 0;
      usageStats.lastOcrDate = today;
    }

    // Enforce limits
    if (plan === 'free') {
      if (usageStats.ocrUsedToday >= 1) {
        return res.status(403).json({
          error: 'Daily limit reached',
          message: 'You have reached your limit of 1 free OCR solution today. Upgrade to Student tier for 3 daily solutions.'
        });
      }
    } else if (plan === 'student') {
      if (usageStats.ocrUsedToday >= 3) {
        return res.status(403).json({
          error: 'Daily limit reached',
          message: 'You have reached your limit of 3 student OCR solutions today. Upgrade to Ultimate for unlimited access.'
        });
      }
    }

    const solution = await solveProblemFromImage(base64Image, contentType || 'image/jpeg');

    // Increment usage
    usageStats.ocrUsedToday += 1;
    user.usageStats = usageStats;
    await user.save();

    res.status(200).json({
      success: true,
      solution: solution
    });
  } catch (error) {
    console.error('Error in solveExercise controller:', error);
    res.status(500).json({ error: error.message || 'Failed to solve problem' });
  }
};
