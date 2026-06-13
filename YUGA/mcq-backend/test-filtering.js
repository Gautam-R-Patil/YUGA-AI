// Test keyword filtering
import { applyKeywordSubstitutions, preprocessTextForTTS } from './modules/ai/text-utils.js';

// Simulate the filtering logic from voice-controller
function filterAmbiguousKeywords(keywords) {
    const ambiguousKeywords = ['m', 'g', 'h', 'v', 's', 't', 'n', 'p', 'q', 'r', 'x', 'y', 'z', 'a', 'b', 'c', 'd', 'e', 'f', 'k', 'u', 'w'];
    const filtered = {};
    Object.entries(keywords).forEach(([abbr, term]) => {
        const isAmbiguous = ambiguousKeywords.includes(abbr.toLowerCase()) && abbr.length === 1;
        if (!isAmbiguous) {
            filtered[abbr] = term;
        } else {
            console.log(`⚠️  Filtered: "${abbr}" → "${term}"`);
        }
    });
    return filtered;
}

// Test Question 1 keywords
const originalKeywords = {
    "m": "mass",
    "gm": "gram",
    "g": "acceleration due to gravity",
    "h": "height",
    "v": "velocity",
    "J": "Joules",
    "KE": "Kinetic Energy"
};

console.log('═'.repeat(80));
console.log('ORIGINAL KEYWORDS:');
console.log(JSON.stringify(originalKeywords, null, 2));

const filteredKeywords = filterAmbiguousKeywords(originalKeywords);
console.log('\n' + '═'.repeat(80));
console.log('FILTERED KEYWORDS (after removing ambiguous single letters):');
console.log(JSON.stringify(filteredKeywords, null, 2));

// Test text
const testText = "Given: [mass = 1 gm = 0.001 kg, height = 1 km = 1000 m, speed = 50 m/s, g = 10 m/s squared]\nCalculation: Work = 0.001 kg × 10 m/s squared × 1000 m = 10 J";

console.log('\n' + '═'.repeat(80));
console.log('TEST TEXT:');
console.log(testText);

console.log('\n' + '─'.repeat(80));
console.log('WITH ORIGINAL KEYWORDS (BROKEN):');
const result1 = applyKeywordSubstitutions(testText, originalKeywords);
console.log(result1);

console.log('\n' + '─'.repeat(80));
console.log('WITH FILTERED KEYWORDS (FIXED):');
const result2 = applyKeywordSubstitutions(testText, filteredKeywords);
console.log(result2);

console.log('\n' + '─'.repeat(80));
console.log('AFTER FULL PIPELINE (Filtered Keywords + Preprocessing):');
const final = preprocessTextForTTS(result2);
console.log(final);

// Test Question 0
console.log('\n\n' + '═'.repeat(80));
console.log('QUESTION 0 - Thermodynamics');
console.log('═'.repeat(80));

const q0Keywords = {
    "P_ext": "external pressure",
    "atm": "atmospheres",
    "L": "liters",
    "J": "Joules",
    "ΔV": "change in volume",
    "ΔU": "change in internal energy",
    "W": "work"
};

const q0Filtered = filterAmbiguousKeywords(q0Keywords);
console.log('\nFiltered Keywords:', JSON.stringify(q0Filtered, null, 2));

const q0Text = "Convert: 1 atm = 101.325 J/L, so 2.5 atm = 253.3125 J/L. Volume: 2.50 L to 4.50 L. Work W = 506.625 J.";
console.log('\nOriginal:', q0Text);
const q0Result = applyKeywordSubstitutions(q0Text, q0Filtered);
console.log('After Keywords:', q0Result);
const q0Final = preprocessTextForTTS(q0Result);
console.log('After Preprocessing:', q0Final);

// Check for any remaining J or L
const jCount = (q0Final.match(/\bJ\b/g) || []).length;
const lCount = (q0Final.match(/\bL\b/g) || []).length;
console.log(`\n📊 Final check: J=${jCount}, L=${lCount}`);
if (jCount === 0 && lCount === 0) {
    console.log('✅ SUCCESS: All J and L replaced correctly!');
} else {
    console.log('❌ ERROR: J or L still present!');
}
