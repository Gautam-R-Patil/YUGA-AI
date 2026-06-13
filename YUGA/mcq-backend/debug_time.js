import { processScientificText } from './modules/ai/scientific-tts.js';

const text = 'Time²';
const p1 = processScientificText(text);
console.log('Final Result:', p1);
