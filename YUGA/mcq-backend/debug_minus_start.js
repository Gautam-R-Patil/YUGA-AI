import { processScientificText } from './modules/ai/scientific-tts.js';

const text = '-5 is the answer.';
const p1 = processScientificText(text);
console.log('Result:', p1);

const text2 = 'The value is -10.';
const p2 = processScientificText(text2);
console.log('Result 2:', p2);

const text3 = '−10 is the value.'; // Unicode minus
const p3 = processScientificText(text3);
console.log('Result 3:', p3);
