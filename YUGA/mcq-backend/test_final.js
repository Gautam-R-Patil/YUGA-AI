import { processScientificText } from './modules/ai/scientific-tts.js';
import { preprocessTextForTTS } from './modules/ai/text-utils.js';

console.log('--- TEST 1 ---');
console.log(preprocessTextForTTS('Time²'));
console.log('--- TEST 2 ---');
console.log(preprocessTextForTTS('S₁ = 1/2'));
