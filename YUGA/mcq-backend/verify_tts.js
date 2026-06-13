import { preprocessTextForTTS } from './modules/ai/text-utils.js';
import fs from 'fs';

const testCases = [
    "speed = d/t",
    "speed = d/t₁",
    "acceleration = (v-u)/t",
    "The hit speed is 50 m/s",
    "g = 10 m/s²",
    "density is 1000 kg/m³",
    "pressure is 1.013 * 10⁵ Pa",
    "1/2 * m * v²",
    "distance/time",
    "The unit is J/K",
    "sin θ/cos θ",
    "C = Q/V",
    "ms⁻²",
    "Force/Area",
    "kg/m³",

    // Logic / implication arrows
    "a-b => b-1",
    "a-b -> b-1",
    "P ⇒ Q"
];

let output = "TTS Pronunciation Test (Unicode Sample):\n\n";
testCases.forEach(text => {
    const result = preprocessTextForTTS(text);
    output += "Original: " + text + "\n";
    output += "Result:   " + result + "\n\n";
    console.log(`OK: "${text}" -> "${result}"`);
});

fs.writeFileSync('output.txt', output, 'utf8');
console.log("Results written to output.txt");
process.exit(0);
