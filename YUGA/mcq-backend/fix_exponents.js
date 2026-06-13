import fs from 'fs';
import path from 'path';

const baseDir = 'd:/Programming/code/YUGA/mcq-backend/data/questions/mcq_practice';

const superMap = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '+': '⁺' };
const subMap = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
const subToSuper = { '₀': '⁰', '₁': '¹', '₂': '²', '₃': '³', '₄': '⁴', '₅': '⁵', '₆': '⁶', '₇': '⁷', '₈': '⁸', '₉': '⁹' };
const superToSub = { '⁰': '₀', '¹': '₁', '²': '₂', '³': '₃', '⁴': '₄', '⁵': '₅', '⁶': '₆', '⁷': '₇', '⁸': '₈', '⁹': '₉' };

function toSuper(str) {
    return str.replace(/[-−]/g, '-').split('').map(c => superMap[c] || c).join('');
}

function toSub(str) {
    return str.split('').map(c => subMap[c] || c).join('');
}

function fixText(text) {
    if (typeof text !== 'string') return text;

    let result = text;

    // 1. Correct existing accidental subscripts in units
    const units = 'm|cm|mm|km|s|Hz|mol|Wb|Ω|Pa|lx|lm|kat';
    const subCorrRegex = new RegExp(`(${units})([₂₃])(?![a-zA-Z0-9])`, 'g');
    result = result.replace(subCorrRegex, (m, unit, sub) => {
        return unit + subToSuper[sub];
    });

    // 2. Handle explicit phrases
    result = result.replace(/(\)|[a-zA-Z0-9])\s*squared\b/gi, (m, b) => b + '²');
    result = result.replace(/(\)|[a-zA-Z0-9])\s*cubed?\b/gi, (m, b) => b + '³');
    result = result.replace(/([a-zA-Z0-9])\s+cube\b/gi, (m, b) => b + '³');

    // 3. Handle Caret notation
    result = result.replace(/([a-zA-Z0-9]|\))\^([+−\-]?\d+)/g, (m, b, p) => b + toSuper(p));
    result = result.replace(/([a-zA-Z0-9]|\))\^\{([+−\-]?\d+)\}/g, (m, b, p) => b + toSuper(p));

    // 4. Handle Powers of 10 with spaces
    result = result.replace(/(\b10|×\s*10)\s+(\d+)\b/g, (m, b, p) => b + toSuper(p));

    // 5. Units (Context-based)
    result = result.replace(/(\d+)\s*(m|cm|mm|km|s)2\b/g, (m, n, u) => n + ' ' + u + '²');
    result = result.replace(/(\d+)\s*(m|cm|mm|km)3\b/g, (m, n, u) => n + ' ' + u + '³');
    result = result.replace(/(\b|[^a-zA-Z])(m|cm|mm|s)\/s2\b/g, (m, pre, u) => pre + u + '/s²');

    result = result.replace(/metre\s+square\b/gi, 'm²');
    result = result.replace(/meter\s+square\b/gi, 'm²');
    result = result.replace(/meters\s+squared\b/gi, 'm²');

    // Inverse units
    const invUnitRegex = new RegExp(`(${units}|A|V|T|J|W)\\s*([−\\-])([123])\\b`, 'g');
    result = result.replace(invUnitRegex, (m, u, dash, p) => u + toSuper('-' + p));

    // 6. Variables (Subscripts)
    const subVars = ['v', 'V', 'n', 'r', 'T', 'P', 'A', 'f', 'm', 'k', 'x', 'y', 'z', 'E', 'B', 'q', 'i', 'I', 'L', 'h', 'R', 'g', 'u', 'w', 'W'];
    subVars.forEach(v => {
        const re = new RegExp(`\\b${v}\\s*(\\d+)\\b`, 'g');
        result = result.replace(re, (m, d) => v + toSub(d));
    });

    // 7. Chemical symbols (Subscripts)
    const chemSymbols = ['H', 'O', 'N', 'C', 'S', 'P', 'Cl', 'Br', 'I', 'Ca', 'Mg', 'Na', 'K', 'Al', 'He', 'Fe', 'Cu', 'Zn', 'Ag', 'Au', 'Hg', 'Pb', 'Sn', 'Cr', 'Mn', 'Co', 'Ni', 'Pt', 'Si', 'F', 'Li', 'Be', 'B', 'Ne', 'Ar', 'Ti', 'V', 'Ba', 'Sr', 'Cs', 'Rb', 'Xe', 'Kr', 'U', 'Th', 'Pu'];
    chemSymbols.forEach(s => {
        const re = new RegExp(`\\b${s}\\s*(\\d+)\\b`, 'g');
        result = result.replace(re, (m, d) => s + toSub(d));
    });

    // 8. Botanty/Bio Special Cases (C3, C4, C2) - Force correction
    result = result.replace(/\bC([²³⁴])/g, (m, p) => 'C' + superToSub[p]);
    result = result.replace(/\bC([234])/g, (m, d) => 'C' + subMap[d]);

    return result;
}

function processObject(obj) {
    if (Array.isArray(obj)) {
        return obj.map(item => processObject(item));
    } else if (obj !== null && typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            if (['text', 'basic_answer', 'explanation', 'correct_answer', 'options', 'keywords'].includes(key)) {
                if (key === 'options') {
                    newObj[key] = obj[key].map(opt => fixText(opt));
                } else if (key === 'keywords') {
                    const newKeywords = {};
                    for (const k in obj[key]) {
                        newKeywords[fixText(k)] = fixText(obj[key][k]);
                    }
                    newObj[key] = newKeywords;
                } else {
                    newObj[key] = fixText(obj[key]);
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
    const contentText = fs.readFileSync(file, 'utf8');
    const content = JSON.parse(contentText);
    const processedContent = processObject(content);

    fs.writeFileSync(file, JSON.stringify(processedContent, null, 4));
    filesProcessed++;
});

console.log(`\nSuccess! Processed ${filesProcessed} files.`);
