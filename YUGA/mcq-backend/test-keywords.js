import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyKeywordSubstitutions } from './modules/ai/text-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const subjects = ['physics', 'chemistry', 'biology'];
const issues = [];
let totalQuestions = 0;
let totalKeywords = 0;

console.log('🔍 Testing keyword substitutions across all 30 sets...\n');

for (const subject of subjects) {
    const subjectPath = path.join(__dirname, 'data', 'questions', 'mcq_practice', subject);
    
    for (let setNum = 1; setNum <= 10; setNum++) {
        const setFolder = `Set${setNum}`;
        const setFilePath = path.join(subjectPath, setFolder, `set${setNum}.json`);
        const setFilePathAlt = path.join(subjectPath, setFolder, `Set${setNum}.json`);
        
        let filePath = setFilePath;
        if (!fs.existsSync(filePath)) {
            filePath = setFilePathAlt;
        }
        
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${subject} Set${setNum}`);
            continue;
        }
        
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const questions = JSON.parse(content);
            
            questions.forEach((q, idx) => {
                totalQuestions++;
                
                if (!q.keywords || Object.keys(q.keywords).length === 0) {
                    return; // Skip questions without keywords
                }
                
                const keywordMap = q.keywords;
                const keywordCount = Object.keys(keywordMap).length;
                totalKeywords += keywordCount;
                
                // Test text samples from the question
                const testTexts = [
                    q.text,
                    q.basic_answer || '',
                    q.explanation || ''
                ].filter(t => t);
                
                testTexts.forEach(text => {
                    // Check for single-letter keywords that might cause issues
                    Object.entries(keywordMap).forEach(([abbr, fullTerm]) => {
                        if (abbr.length === 1) {
                            // Skip checking if abbreviation is within LaTeX math notation ($...$) or superscript notation
                            // These are valid contexts where we DON'T want substitution
                            const mathNotationPattern = new RegExp(`\\$${abbr}\\$`, 'g');
                            const superscriptPattern = new RegExp(`I\\s*${abbr}\\s+[A-Z]`, 'g'); // e.g., "I A i"
                            
                            if (mathNotationPattern.test(text) || superscriptPattern.test(text)) {
                                return; // Skip this abbreviation - it's in valid math/notation context
                            }
                            
                            // Check if the abbreviation appears in text
                            const regex = new RegExp(`\\b${abbr}\\b|\\s${abbr}[\\s,;.:]|/${abbr}/`, 'g');
                            const matches = text.match(regex);
                            
                            if (matches) {
                                // Test substitution
                                const result = applyKeywordSubstitutions(text, keywordMap);
                                
                                // Verify it was replaced
                                const stillPresent = result.match(regex);
                                if (stillPresent) {
                                    issues.push({
                                        subject,
                                        set: setNum,
                                        questionId: q.id,
                                        questionNum: q.question_number,
                                        abbreviation: abbr,
                                        fullTerm: fullTerm,
                                        problem: 'Single-letter abbreviation not fully replaced',
                                        sample: text.substring(0, 100)
                                    });
                                }
                            }
                        }
                        
                        // Check for multi-character abbreviations like "K.E."
                        if (abbr.includes('.')) {
                            if (text.includes(abbr)) {
                                const result = applyKeywordSubstitutions(text, keywordMap);
                                if (result.includes(abbr)) {
                                    issues.push({
                                        subject,
                                        set: setNum,
                                        questionId: q.id,
                                        questionNum: q.question_number,
                                        abbreviation: abbr,
                                        fullTerm: fullTerm,
                                        problem: 'Dotted abbreviation not replaced',
                                        sample: text.substring(0, 100)
                                    });
                                }
                            }
                        }
                    });
                });
            });
            
            console.log(`✓ ${subject.toUpperCase()} Set${setNum}: ${questions.length} questions checked`);
            
        } catch (error) {
            console.log(`❌ Error reading ${subject} Set${setNum}: ${error.message}`);
        }
    }
    console.log('');
}

console.log('\n📊 SUMMARY:');
console.log(`Total questions processed: ${totalQuestions}`);
console.log(`Total keywords found: ${totalKeywords}`);
console.log(`Issues found: ${issues.length}\n`);

if (issues.length > 0) {
    console.log('⚠️  ISSUES DETECTED:\n');
    issues.forEach((issue, idx) => {
        console.log(`${idx + 1}. ${issue.subject.toUpperCase()} Set${issue.set} - Q${issue.questionNum} (ID: ${issue.questionId})`);
        console.log(`   Problem: ${issue.problem}`);
        console.log(`   Abbreviation: "${issue.abbreviation}" → "${issue.fullTerm}"`);
        console.log(`   Sample: "${issue.sample}..."`);
        console.log('');
    });
} else {
    console.log('✅ ALL KEYWORD SUBSTITUTIONS WORKING CORRECTLY!');
}
