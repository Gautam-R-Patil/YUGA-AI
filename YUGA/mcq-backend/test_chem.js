import { processScientificText } from './modules/ai/scientific-tts.js';

const cases = [
    "CH₃–CH=CH–CH₂–CHBr–CH₃",
    "CH3-CH=CH-CH3",
    "H2O",
    "f = m*a",
    "E = mc²",
    "C = 3 * 10^8",
    "x - y = 0"
];

cases.forEach(c => {
    console.log(`Input: ${c}`);
    console.log(`TTS:   ${processScientificText(c)}`);
    console.log('---');
});
