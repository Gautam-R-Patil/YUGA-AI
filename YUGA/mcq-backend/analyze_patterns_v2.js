import fs from 'fs';
import path from 'path';

const subscriptMap = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ',
    '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎'
};

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
    const matches = content.match(/[A-Za-z0-9]+_[A-Za-z0-9+\-=()]+/g);
    if (matches) {
        matches.forEach(m => patterns.add(m));
    }
});

const results = Array.from(patterns).sort().map(p => {
    const sub = p.split('_')[1];
    let missing = [];
    for (const char of sub) {
        if (!subscriptMap[char]) {
            missing.push(char);
        }
    }
    return { pattern: p, missing: missing };
});

console.log(JSON.stringify(results, null, 2));
