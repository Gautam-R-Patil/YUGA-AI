// Test the exact question from user
import { applyKeywordSubstitutions, preprocessTextForTTS } from './modules/ai/text-utils.js';

const keywords = {
    "P_ext": "external pressure",
    "atm": "atmospheres",
    "L": "liters",
    "J": "Joules",
    "ΔV": "change in volume",
    "ΔU": "change in internal energy",
    "W": "work"
};

// Apply the same filtering as voice-controller.js (UPDATED)
const ambiguousLowercase = ['m', 'g', 'h', 'v', 's', 't', 'n', 'p', 'q', 'r', 'x', 'y', 'z', 'a', 'b', 'c', 'd', 'e', 'f', 'k', 'u', 'w'];
const filteredKeywords = {};
Object.entries(keywords).forEach(([abbr, term]) => {
    const isAmbiguous = abbr.length === 1 && ambiguousLowercase.includes(abbr) && abbr === abbr.toLowerCase();
    if (!isAmbiguous) {
        filteredKeywords[abbr] = term;
    } else {
        console.log(`⚠️  Filtered out: "${abbr}"`);
    }
});

console.log('Filtered Keywords:', JSON.stringify(filteredKeywords, null, 2));

const texts = {
    question: "A gas is allowed to expand in a well insulated container against a constant external pressure of 2.5 atm from an initial volume of 2.50 L to a final volume of 4.50 L. The change in internal energy U of the gas in joules will be:",
    
    basicAnswer: "Given: [Initial Volume (V1) = 2.50 L, Final Volume (V2) = 4.50 L, External Pressure (P_ext) = 2.5 atm]\nConcept: [The change in internal energy U can be found using the formula U = Q - W, where Q is the heat exchanged and W is the work done. For a gas expanding against a constant pressure, W = P_ext × ΔV. Since the container is well insulated, Q = 0.]\nCalculation: [Convert external pressure from atm to J: 1 atm = 101.325 J/L, so P_ext = 2.5 atm × 101.325 J/L = 253.3125 J/L. Then, change in volume ΔV = V2 - V1 = 4.50 L - 2.50 L = 2.00 L. Work done W = P_ext × ΔV = 253.3125 J/L × 2.00 L = 506.625 J. Therefore, ΔU = 0 - 506.625 J = -506.625 J, which rounds to -506 J.]\nHence Option C is the correct answer."
};

Object.entries(texts).forEach(([name, text]) => {
    console.log('\n' + '='.repeat(100));
    console.log(name.toUpperCase());
    console.log('='.repeat(100));
    
    console.log('\n📝 ORIGINAL:');
    console.log(text.substring(0, 200) + '...');
    
    // Step 1: Apply keywords
    const afterKeywords = applyKeywordSubstitutions(text, filteredKeywords);
    console.log('\n✅ AFTER KEYWORDS:');
    console.log(afterKeywords.substring(0, 300) + '...');
    
    // Check for remaining J and L
    const jMatches = afterKeywords.match(/\bJ\b/g);
    const lMatches = afterKeywords.match(/\bL\b/g);
    console.log(`\n🔍 Remaining: J=${jMatches ? jMatches.length : 0}, L=${lMatches ? lMatches.length : 0}`);
    if (jMatches) console.log('   J found at:', jMatches);
    if (lMatches) console.log('   L found at:', lMatches);
    
    // Step 2: Apply preprocessing
    const final = preprocessTextForTTS(afterKeywords);
    console.log('\n🔄 AFTER PREPROCESSING:');
    console.log(final.substring(0, 300) + '...');
    
    // Final check
    const finalJ = (final.match(/\bJ\b/g) || []).length;
    const finalL = (final.match(/\bL\b/g) || []).length;
    const joulesCount = (final.match(/Joules/gi) || []).length;
    const litersCount = (final.match(/liters/gi) || []).length;
    
    console.log(`\n📊 FINAL: J=${finalJ}, L=${finalL}, Joules=${joulesCount}, Liters=${litersCount}`);
    
    if (finalJ > 0 || finalL > 0) {
        console.log('❌ ERROR: J or L still present!');
    } else {
        console.log('✅ SUCCESS: All replacements correct!');
    }
});
