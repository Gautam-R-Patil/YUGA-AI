import fs from 'fs';
import path from 'path';

const baseDir = 'd:/Programming/code/YUGA/mcq-backend/data/questions/mcq_practice';

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
            arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, file));
        }
    });
    return arrayOfFiles;
}

const allFiles = getAllFiles(baseDir);
const patterns = new Set();

allFiles.forEach(file => {
    if (path.extname(file) !== '.json') return;
    const content = fs.readFileSync(file, 'utf8');

    // Look for:
    // 1. "squared", "cubed"
    // 2. "^" followed by digits
    // 3. units like "m2", "cm2", "s2"
    const matches = content.match(/\w+\s+squared\b|\w+\s+cubed?\b|\w+\^\d+|\b[a-z]+[23]\b/gi);
    if (matches) {
        matches.forEach(m => {
            const lower = m.toLowerCase();
            // Filter out things that are likely IDs or hex
            if (/^[0-9]+$/.test(lower)) return;
            if (lower.length > 20) return;
            patterns.add(lower);
        });
    }
});

console.log(Array.from(patterns).sort().join('\n'));
