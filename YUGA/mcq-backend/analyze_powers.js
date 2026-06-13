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

    // Look for squared, cubed, ^, or numbers that might be powers
    const matches = content.match(/\w+\s+squared\b|\w+\s+cubed?\b|\w+\^[\d\w]+|\w+2\b/gi);
    if (matches) {
        matches.forEach(m => patterns.add(m.toLowerCase()));
    }
});

console.log(JSON.stringify(Array.from(patterns).sort(), null, 2));
