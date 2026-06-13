// Test J/L pattern specifically
import { applyKeywordSubstitutions, preprocessTextForTTS } from './modules/ai/text-utils.js';

// Don't load server
process.exit = () => {};

const keywords = {
    "J": "Joules",
    "L": "liters"
};

const testCases = [
    "1 atm = 101.325 J/L",
    "253.3125 J/L",
    "Energy per volume: 100 J/L",
    "The value is 5 J per L",
    "Convert to J/L units",
];

console.log('Testing J/L pattern:\n');

testCases.forEach((text, i) => {
    console.log(`Test ${i + 1}: "${text}"`);
    
    const afterKeywords = applyKeywordSubstitutions(text, keywords);
    console.log(`  After keywords: "${afterKeywords}"`);
    
    const afterPreproc = preprocessTextForTTS(afterKeywords);
    console.log(`  After preproc:  "${afterPreproc}"`);
    
    // Check for remaining J or L
    const hasJ = /\bJ\b/.test(afterPreproc);
    const hasL = /\bL\b/.test(afterPreproc);
    
    if (hasJ || hasL) {
        console.log(`  ❌ FAIL: Still has ${hasJ ? 'J' : ''} ${hasL ? 'L' : ''}`);
    } else {
        console.log(`  ✅ PASS`);
    }
    console.log();
});
