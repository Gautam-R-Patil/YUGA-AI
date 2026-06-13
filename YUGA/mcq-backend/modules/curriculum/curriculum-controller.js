import { getCompletion, synthesizeLongAudio } from '../ai/voice-service.js';
import { calculateStudentScore } from '../learning-analytics/analytics-service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GET_DATA_DIR = (type) => {
    const folder = type === 'jee' ? 'jee_mains' : 'neet';
    return path.join(__dirname, '../../data/classroom', folder);
};

export const getSyllabus = async (req, res) => {
    try {
        const { type } = req.params;
        const dataDir = GET_DATA_DIR(type);

        const syllabus = {};
        const subjects = fs.readdirSync(dataDir).filter(f => fs.statSync(path.join(dataDir, f)).isDirectory());

        for (const subject of subjects) {
            syllabus[subject] = {};
            const subjectDir = path.join(dataDir, subject);
            const classes = fs.readdirSync(subjectDir).filter(f => fs.statSync(path.join(subjectDir, f)).isDirectory());

            for (const classLevel of classes) {
                const classDir = path.join(subjectDir, classLevel);
                const chapterFolders = fs.readdirSync(classDir).filter(f => fs.statSync(path.join(classDir, f)).isDirectory());

                // Extract chapter number and name from "chapter_N_Name"
                const chapters = chapterFolders.map(folder => {
                    const parts = folder.split('_');
                    if (parts.length >= 3 && parts[0] === 'chapter') {
                        const chapterNumber = parseInt(parts[1], 10);
                        const chapterName = parts.slice(2).join(' ').replace(/_/g, ' ');
                        return {
                            number: chapterNumber,
                            name: chapterName,
                            folderName: folder
                        };
                    }
                    // Fallback for non-standard folder names
                    return {
                        number: 999,
                        name: folder.replace(/_/g, ' '),
                        folderName: folder
                    };
                });

                // Sort by chapter number
                chapters.sort((a, b) => a.number - b.number);

                syllabus[subject][classLevel.replace('_', ' ')] = chapters;
            }
        }

        res.json({ syllabus });
    } catch (error) {
        console.error('Error getting syllabus:', error);
        res.status(500).json({ error: 'Failed to get syllabus' });
    }
};

export const getTopics = async (req, res) => {
    try {
        let { subject, classLevel, chapter, type } = req.query;
        // Normalize subject: "NEET Physics Class" -> "Physics" or "JEE Physics Class" -> "Physics"
        const normalizedSubject = subject.replace(/^(NEET|JEE) /, "").replace(" Class", "");
        // Normalize classLevel and chapter for file system
        const fsClass = classLevel.replace(' ', '_');

        const dataDir = GET_DATA_DIR(type);
        const subjectDir = path.join(dataDir, normalizedSubject);
        const classDir = path.join(subjectDir, fsClass);

        // Find the chapter folder
        const chapterFolders = fs.readdirSync(classDir);
        const chapterFolder = chapterFolders.find(f => {
            const normalized = f.split('_').slice(2).join(' ').replace(/_/g, ' ').toLowerCase();
            return normalized === chapter.toLowerCase();
        }) || chapter.replace(/ /g, '_');

        const chapterPath = path.join(classDir, chapterFolder);

        if (!fs.existsSync(chapterPath)) {
            return res.status(404).json({ error: 'Chapter not found', path: chapterPath });
        }

        const files = fs.readdirSync(chapterPath).filter(f => f.endsWith('.json'));
        const topics = files.map(f => {
            const filePath = path.join(chapterPath, f);
            try {
                const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                return {
                    title: f.replace('.json', '').replace(/_/g, ' '),
                    duration: content.duration_minutes || 15
                };
            } catch (err) {
                return {
                    title: f.replace('.json', '').replace(/_/g, ' '),
                    duration: 15
                };
            }
        });

        res.json({ topics });
    } catch (error) {
        console.error('Error getting topics:', error);
        res.status(500).json({ error: 'Failed to get topics' });
    }
};

export const getTopicContent = async (req, res) => {
    try {
        let { subject, classLevel, chapter, topic, type } = req.query;
        // Normalize subject
        const normalizedSubject = subject.replace(/^(NEET|JEE) /, "").replace(" Class", "");
        const fsClass = classLevel.replace(' ', '_');
        const fsTopic = topic.replace(/ /g, '_') + '.json';

        const dataDir = GET_DATA_DIR(type);
        const subjectDir = path.join(dataDir, normalizedSubject);
        const classDir = path.join(subjectDir, fsClass);

        // Find the chapter folder
        const chapterFolders = fs.readdirSync(classDir);
        const chapterFolder = chapterFolders.find(f => {
            const normalized = f.split('_').slice(2).join(' ').replace(/_/g, ' ').toLowerCase();
            return normalized === chapter.toLowerCase();
        }) || chapter.replace(/ /g, '_');

        const topicPath = path.join(classDir, chapterFolder, fsTopic);

        if (!fs.existsSync(topicPath)) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const User = (await import('../shared/db/models/user_schema.js')).default;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const plan = user.membership?.plan || 'free';
        if (plan === 'free') {
            return res.status(403).json({
                error: 'Upgrade required',
                message: 'One-Shot Classes are available for Premium users only. Upgrade to Student tier to unlock.'
            });
        }

        const content = JSON.parse(fs.readFileSync(topicPath, 'utf8'));
        res.json({ success: true, ...content });
    } catch (error) {
        console.error('Error getting topic content:', error);
        res.status(500).json({ error: 'Failed to get topic content' });
    }
};

export const generateChapterTopics = async (req, res) => {
    try {
        const { subject, chapter, classLevel } = req.body;

        const prompt = `
      You are an expert curriculum designer for NEET (National Eligibility cum Entrance Test) preparation in India.
      
      Task: Break down the chapter "${chapter}" from ${classLevel} ${subject} into a sequential "Video Playlist" of comprehensive sub-topics.
      
      Requirements:
      1. Create a logical progression of 8-15 video titles that cover the entire chapter COMPREHENSIVELY and in-depth.
      2. Each title should represent a single focused video lesson (approx 15-20 mins of content).
      3. Start with "Introduction to ${chapter}" to set the foundation.
      4. Include conceptual explanation videos for each major concept.
      5. Include worked example videos (e.g., "Solved Examples: [Concept]", "Numerical Problems on [Topic]").
      6. Include problem-solving strategy videos where applicable.
      7. Include application-based videos (e.g., "Real-World Applications of [Concept]").
      8. Include NEET-specific videos (e.g., "NEET Previous Year Questions on [Topic]").
      9. End with "Summary, Key Formulas \u0026 Revision" or similar comprehensive conclusion.
      10. Ensure topics build progressively from basic to advanced.
      11. Cover ALL important sub-topics within the chapter - don't skip anything.
      
      Output Format:
      Strictly return ONLY a valid JSON array of strings. Do not include any markdown formatting, explanation, or "Here is the list".
      Example: ["Introduction to Vectors", "Vector Representation \u0026 Notation", "Vector Addition \u0026 Subtraction", "Scalar \u0026 Dot Product", "Worked Examples: Dot Product", "Vector \u0026 Cross Product", "Applications of Cross Product", "Numerical Problems on Vectors", "NEET Previous Year Questions", "Summary \u0026 Key Formulas"]
    `;

        const messages = [{ role: 'user', content: prompt }];

        // We reuse the existing voice-service getCompletion, essentially treating it as a text-in text-out interface
        const completion = await getCompletion(messages, subject);

        // Attempt to parse JSON
        let topics = [];
        try {
            // Clean up markdown code blocks if present
            const cleaned = completion.replace(/```json/g, '').replace(/```/g, '').trim();
            topics = JSON.parse(cleaned);
        } catch (parseError) {
            console.error("Failed to parse LLM response as JSON:", completion);
            // Fallback: Split by newlines if it looks like a list
            topics = completion.split('\n').filter(line => line.trim().length > 0).map(line => line.replace(/^\d+\.\s*/, '').trim());
        }

        res.json({ topics });

    } catch (error) {
        console.error('Error generating chapter topics:', error);
        res.status(500).json({ error: 'Failed to generate curriculum' });
    }
};

export const generateLessonContent = async (req, res) => {
    try {
        const { subject, chapter, topic, classLevel, language = 'english', script: providedScript } = req.body;

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const User = (await import('../shared/db/models/user_schema.js')).default;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const plan = user.membership?.plan || 'free';
        if (plan === 'free') {
            return res.status(403).json({
                error: 'Upgrade required',
                message: 'Classroom dynamic lessons are available for Premium users only. Upgrade to Student tier to unlock.'
            });
        }

        let lessonData = {};

        if (providedScript) {
            // If a script is provided (dynamic lesson flow), skip LLM generation
            lessonData = {
                script: providedScript,
                keyPoints: req.body.keyPoints || [],
                whiteboardContent: req.body.whiteboardContent || [],
                summary: req.body.summary || ""
            };
        } else {
            // Otherwise, generate using AI

            // Calculate Student Score if user is authenticated
            let studentScore = 50; // Default
            if (req.user && req.user.id) {
                studentScore = await calculateStudentScore(req.user.id);
            }

            let personalizationInstruction = "";
            if (studentScore < 50) {
                personalizationInstruction = `
                STUDENT PROFILE: Beginner / Needs Support (Score: ${studentScore}/100).
                - TEACHING STYLE: Very patient, encouraging, and simple.
                - PACE: Slow and deliberate. Break down every concept into small steps.
                - CONTENT: Focus on FOUNDATIONAL basics. Avoid complex jargon. Use simple real-life analogies.
                - EXAMPLES: Use very basic, relatable examples.
                `;
            } else if (studentScore > 75) {
                personalizationInstruction = `
                STUDENT PROFILE: Advanced / High Achiever (Score: ${studentScore}/100).
                - TEACHING STYLE: Concise, challenging, and fast-paced.
                - PACE: Accelerated. Skip over obvious basics.
                - CONTENT: Focus on ADVANCED applications, edge cases, and deep theory.
                - EXAMPLES: Use complex, multi-step problems and competitive exam-level questions.
                `;
            } else {
                personalizationInstruction = `
                STUDENT PROFILE: Standard / Intermediate (Score: ${studentScore}/100).
                - TEACHING STYLE: Balanced and clear.
                - PACE: Moderate.
                - CONTENT: Standard curriculum coverage.
                `;
            }

            let prompt = `
            You are an expert, engaging AI Tutor for NEET candidates with years of teaching experience.
            
            ${personalizationInstruction}

            Task: Create a comprehensive video lesson script for:
            Subject: ${subject}
            Class: ${classLevel}
            Chapter: ${chapter}
            Topic: ${topic}
            Language: ${language}

            STRICT OUTPUT FORMAT:
            You must output a SINGLE valid JSON object with the following structure. Do not include markdown code blocks.

            {
              "metadata": {
                "subject": "${subject}",
                "class": "${classLevel}",
                "chapter": "${chapter}",
                "chapter_number": "",
                "topic": "${topic}",
                "exam_type": "NEET",
                "generated_at": "",
                "model_used": ""
              },
              "lecture_script": "Full engaging lecture script here (for audio delivery)...",
              "duration_minutes": "15",
              "difficulty_level": "Medium",
              "exam_focus": "NEET",
              "images": [],
              "keywords": ["keyword1", "keyword2"],
              "formulas": [
                {
                  "formula": "LaTeX formula",
                  "description": "Description"
                }
              ],
              "definitions": [
                {
                  "term": "Term",
                  "definition": "Definition"
                }
              ]
            }

            CRITICAL INSTRUCTIONS:
            1. **IMAGES**: The "images" array MUST be empty by default (i.e. []). Do NOT generate image prompts.
            2. **SCRIPT**: Write for AUDIO delivery. Short sentences. Engaging tone.
            3. **FORMAT**: Ensure strictly valid JSON. Escape special characters in strings properly.
            4. **METADATA**: Fill in all metadata fields based on the input.
            5. **KEYWORDS**: Extract at least 5-10 important keywords or concepts from the lecture.
            6. **FORMULAS**: Extract ALL mathematical or scientific formulas mentioned in the script. Use LaTeX format.
            7. **DEFINITIONS**: Define 3-5 key terms introduced in the lecture.
            8. **COMPLETENESS**: Do NOT leave keywords, formulas, or definitions empty if relevant content exists in the script.
            `;

            // [LANGUAGE INSTRUCTIONS...]

            const messages = [{ role: 'user', content: prompt }];
            // Enable JSON mode (6th argument = true)
            const completion = await getCompletion(messages, subject, 'lecture', true, language, true);

            try {
                // Robust JSON extraction
                const start = completion.indexOf('{');
                const end = completion.lastIndexOf('}');

                if (start !== -1 && end !== -1) {
                    const jsonStr = completion.substring(start, end + 1);
                    try {
                        const cleanStr = jsonStr.replace(/[\u0000-\u0019]+/g, "");
                        lessonData = JSON.parse(cleanStr);
                    } catch (jsonErr) {
                        throw jsonErr;
                    }
                } else {
                    if (typeof completion === 'object') {
                        lessonData = completion;
                    } else {
                        const cleaned = completion.replace(/```json/g, '').replace(/```/g, '').trim();
                        const cleanStr = cleaned.replace(/[\u0000-\u0019]+/g, "");
                        lessonData = JSON.parse(cleanStr);
                    }
                }
            } catch (e) {
                console.error("Failed to parse lesson content JSON", completion);
                const errorMessages = { /* ... */ };
                lessonData = {
                    script: errorMessages[language] || errorMessages['english'],
                    keyPoints: ["Content Generation Algorithm Error", "Please Retry"],
                    whiteboardContent: ["System Error"]
                };
            }
        }

        // Generate Audio from Script
        try {
            if (lessonData.script) {
                const ttsResult = await synthesizeLongAudio(lessonData.script, language);
                lessonData.audio = ttsResult.audioBuffer.toString('base64');
                lessonData.audioMime = ttsResult.audioMime;
            }
        } catch (audioErr) {
            console.error("Failed to generate audio for lesson:", audioErr);
            // Non-blocking: continue even if audio generation fails
            lessonData.audio = null;
        }

        res.json(lessonData);

    } catch (error) {
        console.error('Error generating lesson content:', error);

        // For flows where a full script was already provided (e.g. oneshorts / crash courses),
        // we should still return a usable payload even if some internal step fails.
        if (req.body && req.body.script) {
            return res.status(200).json({
                script: req.body.script,
                keyPoints: req.body.keyPoints || [],
                whiteboardContent: req.body.whiteboardContent || [],
                summary: req.body.summary || "",
                audio: null
            });
        }

        res.status(500).json({ error: 'Failed to generate lesson content' });
    }
};
