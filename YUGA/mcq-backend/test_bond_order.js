import { processScientificText } from './modules/ai/scientific-tts.js';

const test = 'He₂⁺ (0.5) < O₂⁻ (1.5) < NO (2.5) < C₂²⁻ (3)';
console.log(`Input: ${test}`);
const result = processScientificText(test);
console.log(`Result: ${result}`);
