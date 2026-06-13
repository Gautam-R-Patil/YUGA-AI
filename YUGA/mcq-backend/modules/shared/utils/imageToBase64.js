import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convert an image file to base64 string
 * @param {string} imagePath - Path to the image file (relative to project root or absolute)
 * @returns {Promise<{base64: string, contentType: string}>} Object containing base64 string and MIME type
 */
export const imageToBase64 = async (imagePath) => {
    try {
        // Resolve path - try relative to project root first, then absolute
        let fullPath = path.resolve(process.cwd(), imagePath);

        // If file doesn't exist, try relative to utils directory
        if (!fs.existsSync(fullPath)) {
            fullPath = path.resolve(__dirname, '..', imagePath);
        }

        // If still doesn't exist, try absolute path
        if (!fs.existsSync(fullPath)) {
            fullPath = imagePath;
        }

        if (!fs.existsSync(fullPath)) {
            throw new Error(`Image file not found: ${imagePath}`);
        }

        // Read file as buffer
        const imageBuffer = fs.readFileSync(fullPath);

        // Get file extension to determine MIME type
        const ext = path.extname(fullPath).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
            '.bmp': 'image/bmp'
        };

        const contentType = mimeTypes[ext] || 'image/jpeg';

        // Convert to base64
        const base64String = imageBuffer.toString('base64');

        return {
            base64: base64String,
            contentType: contentType
        };
    } catch (error) {
        console.error(`Error converting image to base64: ${error.message}`);
        throw error;
    }
};

/**
 * Convert multiple image files to base64
 * @param {string[]} imagePaths - Array of image file paths
 * @returns {Promise<Array<{base64: string, contentType: string}>>}
 */
export const imagesToBase64 = async (imagePaths) => {
    const results = await Promise.all(
        imagePaths.map(path => imageToBase64(path))
    );
    return results;
};


