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
const results = [];

allFiles.forEach(file => {
    if (path.extname(file) !== '.json') return;
    const content = JSON.parse(fs.readFileSync(file, 'utf8'));

    content.forEach((q, idx) => {
        ['text', 'basic_answer', 'explanation'].forEach(key => {
            const val = q[key];
            if (typeof val === 'string') {
                const matches = val.match(/[A-Za-z0-9]+_[A-Za-z0-9+\-=()]+/g);
                if (matches) {
                    matches.forEach(m => {
                        // Ignore internal markers
                        if (m.startsWith('_img') || m.includes('_id')) return;
                        results.push({
                            file: path.relative(baseDir, file),
                            question: q.id,
                            key: key,
                            pattern: m
                        });
                    });
                }
            }
        });
    });
});

console.log(JSON.stringify(results, null, 2));
console.log(`\nFound ${results.length} remaining underscore patterns.`);
