import { processScientificText } from './modules/ai/scientific-tts.js';

const text = '50a';
const p1 = processScientificText(text);
console.log('Result for 50a:', p1);
