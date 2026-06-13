import { getCompletion } from '../ai/voice-service.js';
import { calculateStudentScore } from '../learning-analytics/analytics-service.js';
import User from '../shared/db/models/user_schema.js';

const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return [d.getUTCFullYear(), weekNo];
};

const getNextSundayMidnight = () => {
    const now = new Date();
    const nextSunday = new Date(now);
    // Calculate days until next Sunday (0 is Sunday, so if today is Sunday (0), next Sunday is 7 days away? 
    // Or if today is Sunday, do we reset TONIGHT? 
    // "on sunday midnight it will reset". This usually means Sunday 23:59 -> Monday 00:00.
    // So if today is Sunday, we want THIS Sunday night.
    // If today is Monday, we want NEXT Sunday night.

    // Let's assume standard Mon-Sun week.
    // If today is Sunday (0), current week ends TODAY at midnight.
    // If today is Monday (1), current week ends 6 days later (Sunday).

    // Logic: Set date to next Sunday (or today if Sunday)
    // Actually simpler: Find the upcoming Sunday.
    // If today is Sunday, reset is tonight.

    const day = now.getDay(); // 0 (Sun) to 6 (Sat)
    const daysUntilSunday = (7 - day) % 7;
    // Sun(0) -> 0 -> expires tonight?? No, %7 makes it 0.
    // If today is Sunday, daysUntilSunday is 0. 
    // If we add 0 days, we get today. Set time to 23:59:59.
    // If today is Monday(1), 6 days.

    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(23, 59, 59, 999);
    return nextSunday;
};

const getNextMidnight = () => {
    const d = new Date();
    d.setHours(24, 0, 0, 0);
    return d;
};

export const generateAssessment = async (req, res) => {
    try {
        const { type, subject } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const plan = user.membership?.plan || 'free';
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const [currentYear, currentWeek] = getWeekNumber(now);

        // --- MEMBERSHIP LIMITS CHECK ---
        if (plan !== 'pro' && plan !== 'premium') {
            const stats = user.usageStats || {};
            const lastDate = stats.lastPaperGenDate ? new Date(stats.lastPaperGenDate).toISOString().split('T')[0] : null;
            
            // Check if it's a new day/week to reset counts? 
            // Better: just check the actual conditions.
            
            if (plan === 'free') {
                // Free: 1 Weekly AI Paper Gen
                if (stats.papersGeneratedThisWeek >= 1 && stats.lastPaperGenDate) {
                    // Check if the last generation was this week
                    const [lastYear, lastWeek] = getWeekNumber(new Date(stats.lastPaperGenDate));
                    if (lastYear === currentYear && lastWeek === currentWeek) {
                        return res.status(403).json({ 
                            message: "Free tier limit reached: 1 Weekly AI Paper Generation. Upgrade to Student Pro for daily access!",
                            limitReached: true,
                            type: 'weekly'
                        });
                    }
                }
            } else if (plan === 'student') {
                // Student: 1 Daily Paper Gen
                if (lastDate === todayStr && stats.papersGeneratedToday >= 1) {
                    return res.status(403).json({ 
                        message: "Student Pro limit reached: 1 Daily Paper Generation. Upgrade to Ultimate Elite for unlimited access!",
                        limitReached: true,
                        type: 'daily'
                    });
                }
            }
        }

        // --- CHECK FREQUENCY LIMITS (Existing logic to return today's generated one) ---
        if (type === 'quiz') {
            // Check if valid daily quiz exists
            let isValid = false;

            if (user.dailyQuiz && user.dailyQuiz.questions.length > 0) {
                if (user.dailyQuiz.expiresAt) {
                    if (new Date(user.dailyQuiz.expiresAt) > now) {
                        isValid = true;
                    }
                } else {
                    // Fallback check: date string
                    if (user.dailyQuiz.date === todayStr) {
                        isValid = true;
                    }
                }
            }

            if (isValid) {
                console.log(`Returning existing Daily Quiz for ${userId}`);
                return res.json({
                    title: `Daily Quiz - ${todayStr}`,
                    difficulty: user.dailyQuiz.difficulty,
                    questions: user.dailyQuiz.questions,
                    existing: true,
                    completed: user.dailyQuiz.completed,
                    score: user.dailyQuiz.score,
                    expiresAt: user.dailyQuiz.expiresAt
                });
            }
        } else if (type === 'mock') {
            // Check if we have a valid non-expired mock
            let isValid = false;

            if (user.weeklyMock && user.weeklyMock.questions.length >= 180) {
                if (user.weeklyMock.expiresAt) {
                    // Check explicit expiration
                    if (new Date(user.weeklyMock.expiresAt) > now) {
                        isValid = true;
                    }
                } else {
                    // Fallback to week number logic for old records
                    if (user.weeklyMock.weekNumber === currentWeek && user.weeklyMock.year === currentYear) {
                        isValid = true;
                    }
                }
            }

            if (isValid) {
                console.log(`Returning existing Weekly Mock for ${userId} (${user.weeklyMock.questions.length} questions)`);
                return res.json({
                    title: `Weekly Mock Test - Week ${currentWeek}`,
                    difficulty: user.weeklyMock.difficulty,
                    questions: user.weeklyMock.questions,
                    existing: true,
                    completed: user.weeklyMock.completed,
                    score: user.weeklyMock.score,
                    expiresAt: user.weeklyMock.expiresAt
                });
            }
        }

        // --- GENERATE NEW ASSESSMENT ---

        // Calculate student score for difficulty adjustment
        const studentScore = await calculateStudentScore(userId);

        let difficultyLevel = "Intermediate";
        if (studentScore < 40) difficultyLevel = "Beginner";
        else if (studentScore > 75) difficultyLevel = "Advanced";

        const assessmentType = type === 'mock' ? 'Mock Test' : 'Daily Quiz';
        let questions = [];

        if (type === 'mock') {
            // WEEKLY MOCK LOGIC: 200 Questions
            // NEET: 100 Bio, 50 Chem, 50 Phy
            // JEE: 100 Maths, 50 Chem, 50 Phy (Approximation for mock structure)

            const isJEE = user.topic === 'JEE';
            const contextSubject = isJEE ? 'Mathematics' : 'Biology';
            const examName = isJEE ? 'JEE Main' : 'NEET';

            console.log(`Generating Full Weekly Mock for ${userId} (${difficultyLevel}) - ${examName}...`);

            const generateBatch = async (subject, count, retryCount = 0) => {
                const batchPrompt = `
                You are an expert ${examName} exam setter.
                Generate ${count} high-quality ${difficultyLevel} level multiple-choice questions for ${subject}.
                
                Format strictly as a JSON array of objects:
                [
                    {
                        "question": "Question text",
                        "options": ["A", "B", "C", "D"],
                        "answer": "Correct Option Text",
                        "explanation": "Explanation",
                        "subject": "${subject}",
                        "topic": "Relevant Topic"
                    }
                ]
                IMPORTANT: proper JSON only. Do not wrap in markdown code blocks.
                WARNING: If you use LaTeX or math symbols (like \\alpha, \\frac), you MUST double-escape backslashes (e.g., \\\\alpha, \\\\frac) so it is valid JSON.
                `;
                try {
                    const messages = [{ role: 'user', content: batchPrompt }];
                    // Use json_object response format if supported, or rely on prompt
                    const response = await getCompletion(messages, 'json_object');

                    if (!response) throw new Error("Empty response from AI");

                    const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
                    const parsed = JSON.parse(cleanResponse);

                    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid JSON structure");

                    return parsed;
                } catch (e) {
                    console.error(`Error generating batch for ${subject} (Attempt ${retryCount + 1}):`, e.message);
                    if (retryCount < 2) {
                        console.log(`Retrying batch for ${subject}...`);
                        await new Promise(r => setTimeout(r, 2000)); // Wait 2s before retry
                        return generateBatch(subject, count, retryCount + 1);
                    }
                    return [];
                }
            };

            // Define Batches: 
            // Main Subject (Bio/Maths): 4 batches of 25 = 100
            // Physics: 2 batches of 25 = 50
            // Chemistry: 2 batches of 25 = 50

            // We create simple functions that return the promise when called
            const tasks = [
                ...Array(4).fill().map(() => () => generateBatch(contextSubject, 25)),
                ...Array(2).fill().map(() => () => generateBatch('Physics', 25)),
                ...Array(2).fill().map(() => () => generateBatch('Chemistry', 25))
            ];

            // Execute in Chunks to avoid Rate Limits (Concurrency: 2)
            const CONCURRENCY_LIMIT = 2;
            const results = [];

            for (let i = 0; i < tasks.length; i += CONCURRENCY_LIMIT) {
                const chunk = tasks.slice(i, i + CONCURRENCY_LIMIT);
                console.log(`Processing batch chunk ${i / CONCURRENCY_LIMIT + 1}/${Math.ceil(tasks.length / CONCURRENCY_LIMIT)}...`);
                // Execute chunk in parallel
                const chunkResults = await Promise.all(chunk.map(task => task()));
                results.push(...chunkResults);
            }

            questions = results.flat();

            // Fallback checks (if any batch failed, we might have slightly fewer questions, but usually sufficient)
            console.log(`Generated ${questions.length} questions for Weekly Mock.`);

        } else {
            // DAILY QUIZ LOGIC (Batched for Reliability)
            const isJEE = user.topic === 'JEE';
            const contextSubject = isJEE ? 'Mathematics' : 'Biology';
            const examName = isJEE ? 'JEE Main' : 'NEET';

            console.log(`Generating 15 questions in 3 batches (Phy, Chem, ${contextSubject})...`);

            const subjects = ['Physics', 'Chemistry', contextSubject];
            const questionsPerSubject = 5;

            // Helper to generate a batch
            const generateBatch = async (batchSubject) => {
                const prompt = `
                You are an expert ${examName} exam content generator for ${batchSubject}.
                Generate exactly ${questionsPerSubject} multiple-choice questions for a custom "Daily Quiz".
                
                Subject: ${batchSubject}
                Difficulty Level: ${difficultyLevel}
                Language: English
                
                For each question:
                1. Create a clear, exam-standard question text.
                2. Provide 4 distinct options.
                3. Select the correct answer.
                4. **Basic Answer**: Provide a concise, 1-2 sentence explanation (like a teacher speaking).
                
                Strict rules:
                - Output only valid JSON. No extra text.
                - format: JSON Array of Objects.
                - Do not use markdown blocks (no \`\`\`json).
                - Newlines inside strings must be escaped as \\n.
                - WARNING: If using LaTeX/Math (e.g. \\int, \\alpha), you MUST use double backslashes (\\\\int, \\\\alpha) for valid JSON.
                - Follow the exact field names.

                Format strictly as a JSON array of objects:
                [
                  {
                    "id": 1,
                    "question_number": "1",
                    "text": "...",
                    "subject": "${batchSubject}",
                    "sub_topic": "Topic Name",
                    "question_type": "MCQ",
                    "difficulty": "${difficultyLevel}",
                    "page": 1,
                    "source_pdf": "AI Generated",
                    "has_images": false,
                    "num_images": 0,
                    "images": [],
                    "options": ["A", "B", "C", "D"],
                    "metadata": { "source": "AI", "type": "MCQ" },
                    "original_id": 1,
                    "correct_answer": "...",
                    "basic_answer": "...",
                    "keywords": {}
                  }
                ]
                Valid JSON only.
                `;

                const messages = [{ role: 'user', content: prompt }];
                const aiResponse = await getCompletion(messages, 'json_object');

                // Parse Logic
                let cleanResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();

                // Extract JSON array if there is extra text
                const firstBracket = cleanResponse.indexOf('[');
                const lastBracket = cleanResponse.lastIndexOf(']');
                if (firstBracket !== -1 && lastBracket !== -1) {
                    cleanResponse = cleanResponse.substring(firstBracket, lastBracket + 1);
                }

                try {
                    return JSON.parse(cleanResponse);
                } catch (parseError) {
                    console.error(`Batch ${batchSubject} parse failed. Response fragment: ${cleanResponse.substring(0, 100)}...`);
                    // If parsing still fails, try to fix common issues like unescaped newlines in strings
                    // This is risky but better than failing completely
                    try {
                        // escape newlines that might be inside strings (simple heuristic: if not followed by whitespace/indentation)
                        // Actually, let's just fail for now and rely on retry logic or better prompts.
                        // Or try to use a more permissive parser if we had one.
                        throw parseError;
                    } catch (e) {
                        throw e;
                    }
                }
            };

            // Run batches in parallel
            try {
                const results = await Promise.all(subjects.map(subj => generateBatch(subj)));
                questions = results.flat();

                // Re-assign IDs and mix
                questions.forEach((q, i) => {
                    q.id = i + 1;
                    q.question_number = (i + 1).toString();
                });

                // Fisher-Yates Shuffle
                for (let i = questions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [questions[i], questions[j]] = [questions[j], questions[i]];
                }

                // Re-number after shuffle
                questions.forEach((q, i) => {
                    q.question_number = (i + 1).toString();
                });

                console.log(`Successfully generated ${questions.length} questions.`);

            } catch (e) {
                console.error("Batch Generation Error:", e.message);
                // Write error to file for debugging
                try {
                    const fs = await import('fs');
                    fs.writeFileSync('error_log_batch.txt', e.message);
                } catch (err) { /* ignore */ }

                return res.status(500).json({ message: "Failed to generate assessment. Please try again." });
            }
        }

        // --- SAVE TO USER DB ---
        if (type === 'quiz') {
            user.dailyQuiz = {
                lastGenerated: now,
                date: todayStr,
                questions: questions,
                difficulty: difficultyLevel,
                subject: subject || 'General',
                score: 0,
                completed: false,
                expiresAt: getNextMidnight() // Expires tonight at midnight
            };
        } else if (type === 'mock') {
            user.weeklyMock = {
                lastGenerated: now,
                year: currentYear,
                weekNumber: currentWeek,
                questions: questions,
                difficulty: difficultyLevel,
                score: 0,
                completed: false,
                expiresAt: getNextSundayMidnight() // Auto reset next Sunday
            };
        }

        // --- UPDATE USAGE STATS ---
        if (!user.usageStats) user.usageStats = {};
        const stats = user.usageStats;
        
        // Reset if new day
        const lastDate = stats.lastPaperGenDate ? new Date(stats.lastPaperGenDate).toISOString().split('T')[0] : null;
        if (lastDate !== todayStr) {
            stats.papersGeneratedToday = 0;
        }

        // Reset if new week
        if (stats.lastPaperGenDate) {
            const [lastYear, lastWeek] = getWeekNumber(new Date(stats.lastPaperGenDate));
            if (lastYear !== currentYear || lastWeek !== currentWeek) {
                stats.papersGeneratedThisWeek = 0;
            }
        } else {
            stats.papersGeneratedThisWeek = 0;
        }

        stats.papersGeneratedToday += 1;
        stats.papersGeneratedThisWeek += 1;
        stats.lastPaperGenDate = now;

        await user.save();

        res.json({
            title: `${assessmentType} - ${new Date().toLocaleDateString()}`,
            difficulty: difficultyLevel,
            questions: questions,
            existing: false,
            expiresAt: type === 'quiz' ? user.dailyQuiz?.expiresAt : user.weeklyMock?.expiresAt
        });

    } catch (error) {
        console.error("Error generating assessment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};





export const submitAssessment = async (req, res) => {
    try {
        const { type, score } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (type === 'quiz') {
            if (user.dailyQuiz) {
                user.dailyQuiz.score = score;
                user.dailyQuiz.completed = true;
            }
        } else if (type === 'mock') {
            if (user.weeklyMock) {
                user.weeklyMock.score = score;
                user.weeklyMock.completed = true;
            }
        }

        await user.save();
        res.json({ message: "Score submitted successfully", success: true });

    } catch (error) {
        console.error("Error submitting assessment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getQuestionExplanation = async (req, res) => {
    try {
        const { question, options, correctAnswer, subject } = req.body;

        if (!question || !correctAnswer) {
            return res.status(400).json({ message: "Missing question or answer data" });
        }

        const prompt = `
        You are an expert NEET tutor for ${subject || 'Science'}.
        Provide a **detailed explanation** for the following multiple-choice question.

        **Question**: ${question}
        **Options**: ${JSON.stringify(options)}
        **Correct Answer**: ${correctAnswer}

        Structure the explanation exactly as follows (use Markdown):
        
        ### Core Concept
        Short conceptual introduction.

        ### Solution
        Step-by-step reasoning or calculation.

        ### Why This Answer?
        Verification of why the option is correct.

        ### Common Mistakes
        1-2 common pitfalls students encounter.

        Strictly output only the explanation content in Markdown format. Not JSON.
        `;

        const messages = [{ role: 'user', content: prompt }];
        const explanation = await getCompletion(messages, 'text');

        res.json({ explanation: explanation.trim() });

    } catch (error) {
        console.error("Error generating explanation:", error);
        res.status(500).json({ message: "Failed to generate explanation" });
    }
};
