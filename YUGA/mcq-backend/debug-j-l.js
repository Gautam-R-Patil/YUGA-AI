// Debug J and L replacements
import { applyKeywordSubstitutions } from './modules/ai/text-utils.js';

// Test various contexts where J and L appear
const testCases = [
    {
        name: "Energy in J",
        text: "The energy is 100 J. The work done is 50 J.",
        keywords: { "J": "Joules" }
    },
    {
        name: "Volume in L",
        text: "The volume is 22.4 L at STP. Add 5 L of water.",
        keywords: { "L": "Liters" }
    },
    {
        name: "Mixed with punctuation",
        text: "Energy: 100 J, Volume: 22.4 L, Power = 50 J/s",
        keywords: { "J": "Joules", "L": "Liters", "s": "seconds" }
    },
    {
        name: "In parentheses",
        text: "The answer is (100 J) and volume (22.4 L).",
        keywords: { "J": "Joules", "L": "Liters" }
    },
    {
        name: "At end of sentence",
        text: "The energy required is 100 J.",
        keywords: { "J": "Joules" }
    },
    {
        name: "With decimal",
        text: "101.325 J at standard pressure",
        keywords: { "J": "Joules" }
    },
    {
        name: "Multiple occurrences",
        text: "Energy = 100 J; Work = 50 J; Heat = 25 J",
        keywords: { "J": "Joules" }
    },
    {
        name: "Real physics text",
        text: "Given: mass = 1 kg, energy = 200 J. Calculate: KE = 1/2 mv² = 200 J. The unit J represents energy.",
        keywords: { "J": "Joules", "kg": "kilograms", "m": "mass", "v": "velocity" }
    }
];

testCases.forEach((testCase, idx) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Test ${idx + 1}: ${testCase.name}`);
    console.log('='.repeat(80));
    console.log('Original:', testCase.text);
    
    const result = applyKeywordSubstitutions(testCase.text, testCase.keywords);
    console.log('Result:  ', result);
    
    // Check if original abbreviations still exist
    Object.keys(testCase.keywords).forEach(abbr => {
        const stillPresent = new RegExp(`\\b${abbr}\\b`, 'g').test(result);
        if (stillPresent) {
            console.log(`⚠️  WARNING: "${abbr}" still found in result!`);
        }
    });
});
