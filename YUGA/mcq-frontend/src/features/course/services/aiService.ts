import { apiRequest } from '../../../core/utils/api';
import { MCQQuestion } from '../types';

export const preprocessTextForTTS = (text: string): string => {
    if (!text) return text;

    return text
        // Replace chemical formulas with spaced versions for better TTS
        .replace(/CaCO₃/g, 'C A C O 3')
        .replace(/CaO/g, 'C A O')
        .replace(/CO₂/g, 'C O 2')
        .replace(/H₂O/g, 'H 2 O')
        .replace(/H₂/g, 'H 2')
        .replace(/O₂/g, 'O 2')
        .replace(/CO₂/g, 'C O 2')
        // Replace arrows with "gives"
        .replace(/→/g, ' gives ')
        // Remove asterisks and other markdown symbols
        .replace(/\*/g, '')
        .replace(/#/g, '')
        .replace(/`/g, '')
        .replace(/- /g, '')
        .trim();
};

export const getBalancedPrompt = (question: MCQQuestion, userAnswer: string, isCorrect: boolean) => {
    const isNumerical = /\d/.test(question.question) && question.options.some(opt => /\d/.test(opt));

    let prompt = `Provide a clear, concise explanation for this NEET question (50-100 words):

QUESTION: "${question.question}"
CORRECT ANSWER: "${question.correctAnswer}"
${userAnswer && !isCorrect ? `STUDENT'S WRONG ANSWER: "${userAnswer}"` : ''}

REQUIREMENTS:
• Focus on key concept (1-2 sentences)
• ${isNumerical ? 'Show calculation steps briefly' : 'Explain scientific principle'}
• Mention why correct answer is right
• Briefly explain why wrong options are incorrect
• No markdown, simple language
• Maximum 100 words
• Use "gives" instead of arrows (→)
• Spell out chemical formulas clearly
• PRONOUNCE SYMBOLS CORRECTLY:
  - "s1:s2" should be read as "s1 is to s2"
  - "1/2" should be read as "1 by 2" or "one half"
  - "a/b" should be read as "a by b"
  - "√" should be read as "square root of"
  - "π" should be read as "pi"
  - "θ" should be read as "theta"
  - "α" should be read as "alpha"
  - "β" should be read as "beta"
  - "μ" should be read as "mu"
  - "λ" should be read as "lambda"
  - "°C" should be read as "degrees Celsius"
  - "°F" should be read as "degrees Fahrenheit"
  - "Δ" should be read as "delta"
  - "≈" should be read as "approximately equal to"
  - "≠" should be read as "not equal to"
  - "≥" should be read as "greater than or equal to"
  - "≤" should be read as "less than or equal to"
  - "×" should be read as "multiplied by" or "times"
  - "÷" should be read as "divided by"

Make it educational but concise.`;

    return prompt;
};

export const generateGeminiExplanation = async (question: MCQQuestion, userAnswer: string, isCorrect: boolean, language: string): Promise<string> => {
    try {
        // Build the question text with OCR content if available
        let fullQuestionText = question.question;
        if (question.imageOcrText && question.imageOcrText.trim().length > 0) {
            fullQuestionText += `\n\nAdditional content from question image: ${question.imageOcrText}`;
        }

        // Build additional context from answer image OCR if available
        let answerContext = '';
        if (question.answerImageOcrText && question.answerImageOcrText.trim().length > 0) {
            answerContext = `\n\nAdditional explanation/solution details from answer image: ${question.answerImageOcrText}`;
        }

        const balancedPrompt = `Provide a clear, concise explanation for this NEET question (50-100 words):

        QUESTION: "${fullQuestionText}"
        CORRECT ANSWER: "${question.correctAnswer}"${answerContext}
        ${userAnswer && !isCorrect ? `STUDENT'S WRONG ANSWER: "${userAnswer}"` : ''}

        CRITICAL REQUIREMENTS:
        • Focus on key concept (1-2 sentences)
        • Explain scientific principle clearly
        • Mention why correct answer is right
        • No markdown, simple language
        • Maximum 100 words
        • Use "gives" instead of arrows (→)
        • Spell out chemical formulas clearly

        MOST IMPORTANT: USE ONLY WORDS, NO SYMBOLS AT ALL:
        • Use "a is to b" instead of "a:b" 
        • Use "a divided by b" instead of "a/b" or "a forward slash b"
        • Use "square root of" instead of "√"
        • Use "pi" instead of "π"
        • Use "theta" instead of "θ"
        • Use "alpha" instead of "α"
        • Use "beta" instead of "β"
        • Use "mu" instead of "μ"
        • Use "lambda" instead of "λ"
        • Use "degrees Celsius" instead of "°C"
        • Use "degrees Fahrenheit" instead of "°F"
        • Use "delta" instead of "Δ"
        • Use "approximately equal to" instead of "≈"
        • Use "not equal to" instead of "≠"
        • Use "greater than or equal to" instead of "≥"
        • Use "less than or equal to" instead of "≤"
        • Use "multiplied by" or "times" instead of "×"
        • Use "divided by" instead of "÷"
        • Use "percent" instead of "%"
        • Use "equals" instead of "="
        • Use "plus" instead of "+"
        • Use "minus" instead of "-"
        • Use "greater than" instead of ">"
        • Use "less than" instead of "<"

        STRICTLY FORBIDDEN: Do not use any mathematical symbols, operators, or special characters. The entire explanation must be written in plain words only, as if speaking to someone without any mathematical notation.

        Make it natural and easy for students to understand, using only complete words and no symbols whatsoever.`;

        const response = await apiRequest('/voice/query', 'POST', {
            audio: null,
            messages: [
                {
                    role: 'user',
                    content: balancedPrompt
                }
            ],
            courseCategory: 'NEET AI Examiner',
            language: language,
        });

        if (response.ok) {
            const data = await response.json();
            let explanation = data.response || `The correct answer is ${question.correctAnswer}.`;

            // Clean up the response
            explanation = explanation
                .replace(/\*\*/g, '')
                .replace(/#/g, '')
                .replace(/```/g, '')
                .replace(/`/g, '')
                .trim();

            return explanation;
        } else {
            throw new Error('Failed to get explanation from Gemini');
        }
    } catch (error) {
        console.error('Error generating Gemini explanation:', error);
        throw error;
    }
};
