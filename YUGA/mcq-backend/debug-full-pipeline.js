// Debug full TTS pipeline
import { applyKeywordSubstitutions, preprocessTextForTTS } from './modules/ai/text-utils.js';

// Test with real question data
const testTexts = [
    {
        name: "Energy calculation",
        text: "Given: mass = 1 kg, energy = 200 J. Calculate: KE = 1/2 mv² = 200 J. The unit J represents energy measured in joules.",
        keywords: { "J": "Joules", "kg": "kilograms", "m": "mass", "v": "velocity", "KE": "Kinetic Energy" }
    },
    {
        name: "Volume with L",
        text: "The volume is 22.4 L at STP. Standard conditions use L as the unit. Add 5 L of solution.",
        keywords: { "L": "Liters" }
    },
    {
        name: "Mixed J and L",
        text: "Energy = 100 J, Volume = 5 L. The work done is 50 J and volume added is 2 L.",
        keywords: { "J": "Joules", "L": "Liters" }
    },
    {
        name: "With formulas",
        text: "Power = Work/Time = 100 J/10 s = 10 J/s. Volume flow = 5 L/min.",
        keywords: { "J": "Joules", "s": "seconds", "L": "Liters" }
    }
];

console.log('\n' + '═'.repeat(100));
console.log('TESTING FULL TTS PIPELINE (Keywords → Preprocessing)');
console.log('═'.repeat(100));

testTexts.forEach((test, idx) => {
    console.log(`\n${'─'.repeat(100)}`);
    console.log(`Test ${idx + 1}: ${test.name}`);
    console.log('─'.repeat(100));
    
    console.log('\n📝 ORIGINAL TEXT:');
    console.log(test.text);
    
    // Step 1: Apply keywords
    const afterKeywords = applyKeywordSubstitutions(test.text, test.keywords);
    console.log('\n✅ AFTER KEYWORD SUBSTITUTION:');
    console.log(afterKeywords);
    
    // Check if J or L still exist after keywords
    const jRemaining = (afterKeywords.match(/\bJ\b/g) || []).length;
    const lRemaining = (afterKeywords.match(/\bL\b/g) || []).length;
    if (jRemaining > 0) console.log(`⚠️  WARNING: "J" still appears ${jRemaining} times`);
    if (lRemaining > 0) console.log(`⚠️  WARNING: "L" still appears ${lRemaining} times`);
    
    // Step 2: Apply preprocessing
    const afterPreprocessing = preprocessTextForTTS(afterKeywords);
    console.log('\n🔄 AFTER PREPROCESSING:');
    console.log(afterPreprocessing);
    
    // Check if J or L reappeared
    const jAfterPreproc = (afterPreprocessing.match(/\bJ\b/g) || []).length;
    const lAfterPreproc = (afterPreprocessing.match(/\bL\b/g) || []).length;
    if (jAfterPreproc > 0) console.log(`❌ ERROR: "J" reappeared ${jAfterPreproc} times!`);
    if (lAfterPreproc > 0) console.log(`❌ ERROR: "L" reappeared ${lAfterPreproc} times!`);
    
    // Check for "Joules" and "Liters"
    const joulesCount = (afterPreprocessing.match(/Joules/gi) || []).length;
    const litersCount = (afterPreprocessing.match(/Liters/gi) || []).length;
    console.log(`\n📊 Final counts: "Joules": ${joulesCount}, "Liters": ${litersCount}`);
});

console.log('\n' + '═'.repeat(100) + '\n');
