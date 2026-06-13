import vision from '@google-cloud/vision';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the Google Cloud Vision client with service account
const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, '../google-service-account.json')
});


/**
 * Extract text from a base64 encoded image using Google Cloud Vision API
 * @param {string} base64Image - Base64 encoded image string (with or without data URI prefix)
 * @param {string} contentType - MIME type of the image (e.g., 'image/png', 'image/jpeg')
 * @returns {Promise<string>} - Extracted text from the image
 */
export const extractTextFromImage = async (base64Image, contentType = 'image/jpeg') => {
  try {
    if (!base64Image) {
      throw new Error('No image provided for OCR extraction');
    }

    // Remove data URI prefix if present (e.g., "data:image/png;base64,")
    let cleanBase64 = base64Image;
    if (base64Image.includes('base64,')) {
      cleanBase64 = base64Image.split('base64,')[1];
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(cleanBase64, 'base64');

    // Prepare the request for text detection
    const request = {
      image: {
        content: imageBuffer
      }
    };

    // Perform text detection
    const [result] = await client.textDetection(request);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      console.log('No text detected in the image');
      return '';
    }

    // The first annotation contains the full detected text
    // Subsequent annotations contain individual words/phrases
    const fullText = detections[0].description || '';

    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error(`OCR extraction failed: ${error.message}`);
  }
};

/**
 * Extract text from multiple images in batch
 * @param {Array<{base64Image: string, contentType: string}>} images - Array of image objects
 * @returns {Promise<Array<string>>} - Array of extracted texts
 */
export const extractTextFromMultipleImages = async (images) => {
  try {
    const promises = images.map(({ base64Image, contentType }) =>
      extractTextFromImage(base64Image, contentType)
    );
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error extracting text from multiple images:', error);
    throw error;
  }
};

/**
 * Check if an image contains text (useful for optimization)
 * @param {string} base64Image - Base64 encoded image string
 * @param {string} contentType - MIME type of the image
 * @returns {Promise<boolean>} - True if text is detected, false otherwise
 */
export const hasText = async (base64Image, contentType = 'image/jpeg') => {
  try {
    const text = await extractTextFromImage(base64Image, contentType);
    return text.length > 0;
  } catch (error) {
    console.error('Error checking if image has text:', error);
    return false;
  }
};

/**
 * Extract text with confidence scores for each detected word/phrase
 * @param {string} base64Image - Base64 encoded image string
 * @param {string} contentType - MIME type of the image
 * @returns {Promise<Array<{text: string, confidence: number}>>} - Array of detected text with confidence scores
 */
export const extractTextWithConfidence = async (base64Image, contentType = 'image/jpeg') => {
  try {
    if (!base64Image) {
      throw new Error('No image provided for OCR extraction');
    }

    // Remove data URI prefix if present
    let cleanBase64 = base64Image;
    if (base64Image.includes('base64,')) {
      cleanBase64 = base64Image.split('base64,')[1];
    }

    const imageBuffer = Buffer.from(cleanBase64, 'base64');

    const request = {
      image: {
        content: imageBuffer
      }
    };

    const [result] = await client.textDetection(request);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return [];
    }

    // Skip the first detection (full text) and return individual words with confidence
    return detections.slice(1).map(detection => ({
      text: detection.description,
      confidence: detection.confidence || 1.0
    }));
  } catch (error) {
    console.error('Error extracting text with confidence:', error);
    throw error;
  }
};

/**
 * Solve a problem from an image using AI (Groq/Llama)
 * @param {string} base64Image - Base64 encoded image string
 * @param {string} contentType - MIME type of the image
 * @returns {Promise<string>} - The solution in markdown format
 */
export const solveProblemFromImage = async (base64Image, contentType = 'image/jpeg') => {
  try {
    // 1. Extract text using Google Vision
    const extractedText = await extractTextFromImage(base64Image, contentType);

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('Could not extract any readable text from the image.');
    }

    console.log('--- OCR EXTRACTED TEXT ---');
    console.log(extractedText);
    console.log('--------------------------');

    // 2. Solve using Groq via llm-service
    const { getCompletion } = await import('./llm-service.js');

    const prompt = `The following text was extracted from an educational study material (NEET/JEE). 
    Please identify the core question or problem and provide a detailed, premium solution.
    
    EXTRACTED TEXT:
    """
    ${extractedText}
    """
    
    If it's a multiple choice question, identify the correct option.
    Use proper Markdown formatting with LaTeX for formulas.
    Follow the Educore style: Core Concept, Key Formula, Step-by-Step Explanation, and Conclusion.`;

    const solution = await getCompletion([
      { role: 'user', content: prompt }
    ], 'NEET', 'explanation', false); // No cache for OCR solving to ensure fresh analysis

    return solution;
  } catch (error) {
    console.error('Error in solveProblemFromImage:', error);
    throw new Error(`AI Problem Solving failed: ${error.message}`);
  }
};

export default {
  extractTextFromImage,
  extractTextFromMultipleImages,
  hasText,
  extractTextWithConfidence,
  solveProblemFromImage
};
