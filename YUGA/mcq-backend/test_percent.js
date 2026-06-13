import { processScientificText } from './modules/ai/scientific-tts.js';

const cases = [
    "32%",
    "Packing efficiency = 68%",
    "Efficiency is 32% (Free space)",
    "H2 + O2 gives 100% water"
];

cases.forEach(c => {
    console.log(`Input: ${c}`);
    console.log(`TTS:   ${processScientificText(c)}`);
    console.log('---');
});
