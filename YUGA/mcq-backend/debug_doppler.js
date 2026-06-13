import { processScientificText } from './modules/ai/scientific-tts.js';

const text = 'f × v/(v − vs)';
const p1 = processScientificText(text);
console.log('Result:', p1);
