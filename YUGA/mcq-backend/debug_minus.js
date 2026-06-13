import { processScientificText } from './modules/ai/scientific-tts.js';

const text = '-5';
const p1 = processScientificText(text);
console.log('Result for -5:', p1);
const text2 = '5 - 2';
const p2 = processScientificText(text2);
console.log('Result for 5 - 2:', p2);
const text3 = '−5'; // Unicode minus
const p3 = processScientificText(text3);
console.log('Result for Unicode -5:', p3);
