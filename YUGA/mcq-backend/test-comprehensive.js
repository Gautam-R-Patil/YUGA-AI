import { preprocessTextForTTS } from './modules/ai/text-utils.js';

const comprehensiveTests = [
    "The force constant is 10⁴ N/m",
    "Energy is proportional to v⁻²",
    "Pressure of 1.5 × 10⁻³ atm",
    "Rate = k[A]⁻¹[B]²",
    "Temperature is 300 K",
    "Frequency is 60 s⁻¹", 
    "The electric field is 10⁵ V/m",
    "Gravitational acceleration is 10 ms⁻²",
    "Distance = 5 × 10⁻⁶ m"
];

console.log("🎯 Comprehensive Negative Power Test");
console.log("==================================\n");

comprehensiveTests.forEach(text => {
    const result = preprocessTextForTTS(text);
    console.log(`Original: "${text}"`);
    console.log(`Spoken:   "${result}"`);
    console.log();
});