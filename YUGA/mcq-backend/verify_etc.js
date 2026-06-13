import { preprocessTextForTTS } from './modules/ai/text-utils.js';

const testCases = [
    'Apples, oranges, etc.',
    'Apples, oranges, etc. More fruit.',
    'Apples, oranges, etc More fruit.',
    'And etc.',
    'ETC is often capitalized.',
    'The etc. of the world.'
];

console.log('--- ETC Pronunciation Test ---');
testCases.forEach(text => {
    const result = preprocessTextForTTS(text);
    console.log(`Original: "${text}"`);
    console.log(`TTS:      "${result}"`);
    console.log('---------------------------');
});
