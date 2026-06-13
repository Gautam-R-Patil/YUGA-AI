import { preprocessTextForTTS } from './modules/ai/text-utils.js';
import fs from 'fs';

const negativePowerTests = [
    "x⁻¹",
    "10⁻²",
    "velocity is in ms⁻¹",
    "acceleration is in ms⁻²", 
    "force per unit area is Nm⁻²",
    "The value is 2⁻³",
    "Energy density is Jm⁻³",
    "Frequency is s⁻¹",
    "Rate constant is M⁻¹s⁻¹"
];

console.log("🧪 Testing Negative Power Pronunciation");
console.log("=====================================\n");

negativePowerTests.forEach(text => {
    const result = preprocessTextForTTS(text);
    const isCorrect = result.includes("to the power of negative") || result.includes("inverse");
    const status = isCorrect ? "✅" : "❌";
    
    console.log(`${status} "${text}"`);
    console.log(`   -> "${result}"`);
    console.log();
});