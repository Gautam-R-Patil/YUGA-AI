import { processScientificText } from './modules/ai/scientific-tts.js';

const cases = [
    "dA/dt = 0",
    "f/m = a",
    "v/(v - vs)",
    "1/2 * m * v²",
    "dy/dx"
];

cases.forEach(c => {
    console.log(`Input: ${c}`);
    console.log(`TTS:   ${processScientificText(c)}`);
    console.log('---');
});
