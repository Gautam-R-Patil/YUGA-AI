
import { getCompletion } from './modules/ai/voice-service.js';
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';

const run = async () => {
    try {
        const numQuestions = 5; // REDUCED TO 5
        const subject = 'Physics, Chemistry, Biology';
        const difficultyLevel = 'Medium';
        const subjectPrompt = 'a balanced mix of Physics (2), Chemistry (2), and Biology (1)';

        const prompt = `
            You are an expert NEET exam content generator for Physics, Chemistry, and Biology.
            Generate exactly ${numQuestions} multiple-choice questions for a custom "Daily Quiz".
            
            Subject Distribution: ${subjectPrompt}
            Difficulty Level: ${difficultyLevel}
            Language: English
            
            For each question:
            1. Create a clear, exam-standard question text.
            2. Provide 4 distinct options.
            3. Select the correct answer.
            4. **Basic Answer**: Provide a concise, 1-2 sentence explanation (like a teacher speaking).
            5. **Detailed Explanation**: structured with "Core Concept", "Solution", "Why This Answer?", and "Common Mistakes".
            
            Strict rules:
            - Output only valid JSON. No extra text.
            - format: JSON Array of Objects.
            - Do not use markdown blocks (no \`\`\`json).
            - Newlines inside strings must be escaped as \\n.
            - Follow the exact field names and structure.

            Format strictly as a JSON array of objects using this exact schema:
            [
              {
                "id": 1,
                "question_number": "1",
                "text": "<full question text>",
                "subject": "<subject name>",
                "sub_topic": "<topic name>",
                "question_type": "MCQ",
                "difficulty": "${difficultyLevel}",
                "page": 1,
                "source_pdf": "AI Generated",
                "has_images": false,
                "num_images": 0,
                "images": [],
                "options": [
                  "<option 1>",
                  "<option 2>",
                  "<option 3>",
                  "<option 4>"
                ],
                "metadata": {
                  "source": "AI",
                  "page": 1,
                  "type": "MCQ"
                },
                "original_id": 1,
                "correct_answer": "<exact option text>",
                "basic_answer": "<short calculation-style solution>",
                "explanation": "<must follow the exact structured headings>",
                "keywords": {
                  "<symbol>": "<meaning>"
                }
              }
            ]
            Valid JSON only. No trailing commas.
            `;

        console.log("Sending prompt to AI...");
        const messages = [{ role: 'user', content: prompt }];
        const aiResponse = await getCompletion(messages, 'json_object');

        console.log("Received Response. Length:", aiResponse.length);

        fs.writeFileSync('debug_response_5q.txt', aiResponse);

        let cleanResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        console.log("Attempting direct parse...");
        const questions = JSON.parse(cleanResponse);
        console.log("SUCCESS! Parsed", questions.length, "questions.");
        console.log("Subject counts:");
        const counts = {};
        questions.forEach(q => counts[q.subject] = (counts[q.subject] || 0) + 1);
        console.log(counts);

    } catch (e) {
        console.error("FAILED:", e.message);
        fs.writeFileSync('debug_error_5q.txt', e.message);
    }
};

run();
