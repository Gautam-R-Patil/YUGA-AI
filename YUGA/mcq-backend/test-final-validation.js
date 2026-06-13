// Final end-to-end test with filtering
import { applyKeywordSubstitutions, preprocessTextForTTS } from './modules/ai/text-utils.js';

// Simulate the complete voice pipeline
function filterAmbiguousKeywords(keywords) {
    const ambiguousKeywords = ['m', 'g', 'h', 'v', 's', 't', 'n', 'p', 'q', 'r', 'x', 'y', 'z', 'a', 'b', 'c', 'd', 'e', 'f', 'k', 'u', 'w'];
    const filtered = {};
    let filteredCount = 0;
    Object.entries(keywords).forEach(([abbr, term]) => {
        const isAmbiguous = ambiguousKeywords.includes(abbr.toLowerCase()) && abbr.length === 1;
        if (!isAmbiguous) {
            filtered[abbr] = term;
        } else {
            filteredCount++;
        }
    });
    return { filtered, filteredCount };
}

function processForTTS(text, keywords) {
    // Step 1: Filter keywords
    const { filtered, filteredCount } = filterAmbiguousKeywords(keywords);
    
    // Step 2: Apply keyword substitutions
    const afterKeywords = applyKeywordSubstitutions(text, filtered);
    
    // Step 3: Apply preprocessing
    const final = preprocessTextForTTS(afterKeywords);
    
    return { final, filteredCount, keywordCount: Object.keys(filtered).length };
}

// Test cases from real questions
const testCases = [
    {
        name: "Physics Q1 - Work and Energy",
        text: "Work done = 0.001 kg × 10 m/s² × 1000 m = 10 J. Speed = 50 m/s. Energy = 1.25 J.",
        keywords: {
            "m": "mass",
            "gm": "gram", 
            "g": "acceleration due to gravity",
            "h": "height",
            "v": "velocity",
            "J": "Joules",
            "KE": "Kinetic Energy"
        }
    },
    {
        name: "Physics Q0 - Thermodynamics",
        text: "Pressure = 2.5 atm. Volume: 2.50 L to 4.50 L. Energy = 506 J. Work W = P_ext × ΔV.",
        keywords: {
            "P_ext": "external pressure",
            "atm": "atmospheres",
            "L": "liters",
            "J": "Joules",
            "ΔV": "change in volume",
            "ΔU": "change in internal energy",
            "W": "work"
        }
    },
    {
        name: "Real answer with K.E.",
        text: "The Kinetic Energy K.E. = 1/2 mv². Total energy is 101.325 J. L is the unit for volume.",
        keywords: {
            "K.E.": "Kinetic Energy",
            "K.E": "Kinetic Energy",
            "J": "Joules",
            "L": "Liters",
            "m": "mass",
            "v": "velocity"
        }
    }
];

console.log('═'.repeat(100));
console.log('FINAL END-TO-END TTS PIPELINE TEST');
console.log('═'.repeat(100));

testCases.forEach((test, idx) => {
    console.log(`\n${'─'.repeat(100)}`);
    console.log(`Test ${idx + 1}: ${test.name}`);
    console.log('─'.repeat(100));
    
    console.log('\n📝 Original Text:');
    console.log(test.text);
    
    const result = processForTTS(test.text, test.keywords);
    
    console.log(`\n📚 Keywords: ${result.keywordCount} active (${result.filteredCount} filtered out)`);
    console.log('\n🎯 Final TTS Output:');
    console.log(result.final);
    
    // Validation
    const hasJ = /\bJ\b/.test(result.final);
    const hasL = /\bL\b/.test(result.final);
    const hasJoules = /Joules/i.test(result.final);
    const hasLiters = /Liters/i.test(result.final);
    const hasKineticEnergy = /Kinetic Energy/i.test(result.final);
    
    console.log('\n📊 Validation:');
    if (hasJ || hasL) {
        console.log('  ❌ FAIL: Still contains bare "J" or "L"');
    } else {
        console.log('  ✅ PASS: No bare "J" or "L"');
    }
    
    if (test.keywords['J'] && hasJoules) {
        console.log('  ✅ PASS: "J" → "Joules" working');
    }
    if (test.keywords['L'] && hasLiters) {
        console.log('  ✅ PASS: "L" → "Liters" working');
    }
    if ((test.keywords['K.E.'] || test.keywords['K.E']) && hasKineticEnergy) {
        console.log('  ✅ PASS: "K.E." → "Kinetic Energy" working');
    }
});

console.log('\n' + '═'.repeat(100));
console.log('✅ ALL TESTS COMPLETE');
console.log('═'.repeat(100));
