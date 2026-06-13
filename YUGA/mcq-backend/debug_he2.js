import { processScientificText } from './modules/ai/scientific-tts.js';

const test = "He₂⁺";
console.log(`Input: ${test}`);
const result = processScientificText(test);
console.log(`Result: ${result}`);
