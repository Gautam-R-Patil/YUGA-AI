import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data/classroom/jee_mains');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function removeImages() {
    if (!fs.existsSync(DATA_DIR)) {
        console.error('Directory not found:', DATA_DIR);
        return;
    }

    let count = 0;
    walkDir(DATA_DIR, (filePath) => {
        if (filePath.endsWith('.json')) {
            try {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                if (data.images && data.images.length > 0) {
                    data.images = [];
                    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                    console.log(`✅ Cleaned images from: ${path.relative(DATA_DIR, filePath)}`);
                    count++;
                }
            } catch (err) {
                console.error(`❌ Failed to process ${filePath}:`, err.message);
            }
        }
    });

    console.log(`\nDone! Cleaned ${count} files.`);
}

removeImages();
