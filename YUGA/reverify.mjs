import { processScientificText } from './mcq-backend/modules/ai/scientific-tts.js';

const tests = [
    "F = ma",
    "CH3COOH reacts with NaOH",
    "Lithium (Li) reacts with H2O",
    "v = u + at",
    "mass",
    "planck",
    "Na",
    "m/s",
    "sinθ",
    "E=mc^2"
];

let output = [];
for (const test of tests) {
    output.push(`Input: ${test}\nOutput: ${processScientificText(test)}`);
}

console.log(output.join('\n\n'));
process.exit(0);
