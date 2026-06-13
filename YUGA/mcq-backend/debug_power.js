import { processScientificText } from './modules/ai/scientific-tts.js';
import { preprocessTextForTTS } from './modules/ai/text-utils.js';

const text = '10⁻²';
const p1 = processScientificText(text);
console.log('P1:', p1);
const p2 = preprocessTextForTTS(text);
console.log('P2:', p2);
