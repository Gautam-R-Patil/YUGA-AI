import fs from 'fs';
import path from 'path';

const baseDir = 'd:/Programming/code/YUGA/mcq-backend/data/questions/mcq_practice';

const subscriptMap = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ',
    '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎'
};

/**
 * Converts a string to Unicode subscripts if possible.
 */
function toUnicodeSubscript(str) {
    let result = '';
    for (const char of str) {
        if (subscriptMap[char]) {
            result += subscriptMap[char];
        } else {
            return null;
        }
    }
    return result;
}

/**
 * Formats a base and subscript into the best available representation.
 */
function formatSubscript(match, base, sub) {
    // 1. Try Unicode first (cleanest look for simple variables)
    const unicode = toUnicodeSubscript(sub);
    if (unicode) {
        return base + unicode;
    }

    // 2. Fallback to LaTeX (robust for complex words/mixed case)
    // Avoid doubling up if already in LaTeX
    if (base.startsWith('$') || base.endsWith('$')) return match;

    // Use \text{} for subscripts that are more than 1 letter (likely words like 'centre')
    if (/^[a-z]{2,}$/i.test(sub)) {
        // If the base is also Greek or special, we might need more but this is fine for most
        return `$${base}_{\\text{${sub}}}$`;
    } else {
        return `$${base}_{${sub}}$`;
    }
}

/**
 * Rule-based check to avoid formatting internal IDs and metadata
 */
function shouldProcessKey(key) {
    const keysToProcess = ['text', 'basic_answer', 'explanation', 'correct_answer', 'options', 'keywords'];
    return keysToProcess.includes(key);
}

function processValue(value) {
    if (typeof value !== 'string') return value;

    // Skip internal-looking patterns: _img0, _12, set10_id, etc.
    if (value.startsWith('_img') || /^[a-z0-9]+_id$/i.test(value)) return value;

    // Pattern: [Base]_[Subscript]
    // Handles multiple occurrences like v_y and v_center
    let result = value;
    let iterations = 0;
    const maxIterations = 5; // Prevent loops if something goes wrong

    while (iterations < maxIterations) {
        const nextResult = result.replace(/([A-Za-z0-9]+)_([A-Za-z0-9+\-=()]+)/g, (match, base, sub) => {
            // Check if it's looks like an internal identifier (lowercase_lowercase_digit/id)
            if (match.includes('_id') || match.startsWith('set') || match.startsWith('original')) return match;

            return formatSubscript(match, base, sub);
        });

        if (nextResult === result) break;
        result = nextResult;
        iterations++;
    }

    return result;
}

function processObject(obj) {
    if (Array.isArray(obj)) {
        return obj.map(item => processObject(item));
    } else if (obj !== null && typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            if (shouldProcessKey(key)) {
                if (key === 'options') {
                    newObj[key] = obj[key].map(opt => processValue(opt));
                } else if (key === 'keywords') {
                    const newKeywords = {};
                    for (const k in obj[key]) {
                        // For keywords, both key and value might need conversion
                        const newK = processValue(k);
                        newKeywords[newK] = processValue(obj[key][k]);
                    }
                    newObj[key] = newKeywords;
                } else {
                    newObj[key] = processValue(obj[key]);
                }
            } else {
                newObj[key] = processObject(obj[key]);
            }
        }
        return newObj;
    }
    return obj;
}

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });
    return arrayOfFiles;
}

const allFiles = getAllFiles(baseDir);
let filesProcessed = 0;

allFiles.forEach(file => {
    if (path.extname(file) !== '.json') return;

    console.log(`Processing ${path.basename(file)}...`);
    const content = JSON.parse(fs.readFileSync(file, 'utf8'));
    const processedContent = processObject(content);

    fs.writeFileSync(file, JSON.stringify(processedContent, null, 4));
    filesProcessed++;
});

console.log(`\nSuccess! Processed ${filesProcessed} files.`);
