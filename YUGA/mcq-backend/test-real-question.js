// Test with actual question from database
import { applyKeywordSubstitutions, preprocessTextForTTS } from './modules/ai/text-utils.js';
import fs from 'fs';

// Load actual question
const questions = JSON.parse(fs.readFileSync('./data/questions/mcq_practice/physics/Set1/set1.json', 'utf-8'));

// Test question 0 (has J and L keywords)
const q0 = questions[0];
console.log('═'.repeat(100));
console.log('QUESTION 0 - Thermodynamics (has J and L)');
console.log('═'.repeat(100));
console.log('\nKeywords:', JSON.stringify(q0.keywords, null, 2));

const texts = [
    { label: 'Question Text', content: q0.text },
    { label: 'Basic Answer', content: q0.basic_answer },
    { label: 'Explanation', content: q0.explanation }
];

texts.forEach(({ label, content }) => {
    console.log('\n' + '─'.repeat(100));
    console.log(`${label}:`);
    console.log('─'.repeat(100));
    console.log('\n📝 ORIGINAL:');
    console.log(content.substring(0, 300) + '...');
    
    // Apply keywords
    const afterKeywords = applyKeywordSubstitutions(content, q0.keywords);
    console.log('\n✅ AFTER KEYWORDS:');
    console.log(afterKeywords.substring(0, 300) + '...');
    
    // Count J and L
    const jCount = (afterKeywords.match(/\bJ\b/g) || []).length;
    const lCount = (afterKeywords.match(/\bL\b/g) || []).length;
    const joulesCount = (afterKeywords.match(/Joules/gi) || []).length;
    const litersCount = (afterKeywords.match(/liters/gi) || []).length;
    
    console.log(`\n📊 After Keywords: J=${jCount}, L=${lCount}, Joules=${joulesCount}, Liters=${litersCount}`);
    
    // Apply preprocessing
    const afterPreproc = preprocessTextForTTS(afterKeywords);
    console.log('\n🔄 AFTER PREPROCESSING:');
    console.log(afterPreproc.substring(0, 300) + '...');
    
    // Count again
    const jCount2 = (afterPreproc.match(/\bJ\b/g) || []).length;
    const lCount2 = (afterPreproc.match(/\bL\b/g) || []).length;
    const joulesCount2 = (afterPreproc.match(/Joules/gi) || []).length;
    const litersCount2 = (afterPreproc.match(/liters/gi) || []).length;
    
    console.log(`\n📊 After Preprocessing: J=${jCount2}, L=${lCount2}, Joules=${joulesCount2}, Liters=${litersCount2}`);
    
    if (jCount2 > 0 || lCount2 > 0) {
        console.log('\n❌ ERROR: J or L still present after full pipeline!');
    }
});

console.log('\n' + '═'.repeat(100));
console.log('\nTesting Question 1 (Work and Energy - has J)');
console.log('═'.repeat(100));

const q1 = questions[1];
console.log('\nKeywords:', JSON.stringify(q1.keywords, null, 2));

const testText = q1.basic_answer;
console.log('\n📝 ORIGINAL:');
console.log(testText);

const step1 = applyKeywordSubstitutions(testText, q1.keywords);
console.log('\n✅ AFTER KEYWORDS:');
console.log(step1);

const step2 = preprocessTextForTTS(step1);
console.log('\n🔄 AFTER PREPROCESSING:');
console.log(step2);

const finalJ = (step2.match(/\bJ\b/g) || []).length;
const finalJoules = (step2.match(/Joules/gi) || []).length;
console.log(`\n📊 Final: J=${finalJ}, Joules=${finalJoules}`);

if (finalJ > 0) {
    console.log('\n❌ ERROR: "J" still appears in final text!');
    console.log('Matches:', step2.match(/\bJ\b/g));
}
