import { processScientificText } from './modules/ai/scientific-tts.js';

const cases = [
    "He₂⁺",
    "Fe³⁺",
    "OH⁻",
    "H₃O⁺",
    "10⁻²",
    "10⁶",
    "x²",
    "Cl⁻"
];

cases.forEach(c => {
    console.log(`Input: ${c}`);
    console.log(`TTS:   ${processScientificText(c)}`);
    console.log('---');
});
