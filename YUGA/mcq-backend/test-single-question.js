// Test keyword substitution on a sample question
import { applyKeywordSubstitutions } from './modules/ai/text-utils.js';

// Sample from Physics Set1 with K.E., J problem
const sampleText1 = `Given: [mass m, charge q, electric field E, time t in seconds]
Concept: Kinetic Energy (K.E) = (1/2)mv² where m is mass and v is velocity. 
The work done is measured in J (Joules).
The energy is 101.325 J at time t = 5 s.
L stands for liter in chemistry.`;

const keywords1 = {
    "K.E.": "Kinetic Energy",
    "K.E": "Kinetic Energy",
    "J": "Joules",
    "L": "Liter",
    "m": "mass",
    "v": "velocity",
    "t": "time",
    "s": "seconds",
    "E": "electric field",
    "q": "charge"
};

console.log('📝 Original Text:');
console.log(sampleText1);
console.log('\n' + '='.repeat(80) + '\n');

const result1 = applyKeywordSubstitutions(sampleText1, keywords1);
console.log('✅ After Keyword Substitution:');
console.log(result1);
console.log('\n' + '='.repeat(80) + '\n');

// Test Chemistry symbols
const sampleText2 = `The elements O, S, F, and Cl have different electron affinities.
Oxidation states: +5 for P, +6 for S, and -3 for some ions.`;

const keywords2 = {
    "O": "Oxygen",
    "S": "Sulfur",
    "F": "Fluorine",
    "Cl": "Chlorine",
    "P": "Phosphorus",
    "+": "positive oxidation state",
    "-": "negative oxidation state"
};

console.log('📝 Chemistry Sample:');
console.log(sampleText2);
console.log('\n' + '='.repeat(80) + '\n');

const result2 = applyKeywordSubstitutions(sampleText2, keywords2);
console.log('✅ After Keyword Substitution:');
console.log(result2);
console.log('\n' + '='.repeat(80) + '\n');

// Test decimal numbers
const sampleText3 = `The pressure is 101.325 kPa at standard conditions.
Temperature: 273.15 K, Volume: 22.4 L`;

const keywords3 = {
    "K": "Kelvin",
    "L": "Liters",
    "kPa": "kiloPascals"
};

console.log('📝 Decimal Test:');
console.log(sampleText3);
console.log('\n' + '='.repeat(80) + '\n');

const result3 = applyKeywordSubstitutions(sampleText3, keywords3);
console.log('✅ After Keyword Substitution:');
console.log(result3);
