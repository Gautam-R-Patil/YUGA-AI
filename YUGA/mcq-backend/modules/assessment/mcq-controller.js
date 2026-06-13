import * as MCQService from "./mcq-service.js";
import mongoose from "../shared/db/index.js";
import { waitForConnection, getConnectionState } from "../shared/utils/db-connection.js";
import * as ragBridge from "../ai/rag-bridge.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get questions by subject
export const getQuestionsBySubject = async (req, res) => {
  try {
    // Wait for database connection with retry (max 5 seconds)
    try {
      await waitForConnection(5000);
    } catch (dbError) {
      console.error("Database connection unavailable. State:", getConnectionState());
      return res.status(503).json({
        error: "Database temporarily unavailable. Please try again in a moment."
      });
    }

    let { subject } = req.params;
    subject = decodeURIComponent(subject);
    console.log(`mcq-controller.getQuestionsBySubject called for subject='${subject}'`);

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
    const usageStats = user.usageStats || {};

    if (!subject) {
      return res.status(400).json({ error: "Subject parameter is required" });
    }

    // 1. Enforce Mock Paper limits (neet-mock-N is for Student/Micro Mocks)
    if (subject.toLowerCase().startsWith('neet-mock-')) {
      const mockNumberStr = subject.split('-').pop();
      const mockNumber = parseInt(mockNumberStr);
      
      if (plan === 'free' && mockNumber > 2) {
        return res.status(403).json({
          error: 'Mock Paper Locked',
          message: `Micro Mock ${mockNumberStr.padStart(2, '0')} is a Pro feature. Upgrade to Student Pro to unlock all Micro Mock papers!`
        });
      }
      
      console.log(`🔓 Access granted for micro mock: ${subject} (${plan} plan)`);
    } else if (subject.toLowerCase().startsWith('full-mock-')) {
      // For Full Mocks (SME/VM Access), skip student tier limits
      console.log(`🔓 Access granted for full mock: ${subject} (${plan} plan)`);
    }

    // 2. Enforce logic for AI Question Generation (Paper Gen)
    const mode = req.query.mode || 'json';
    if (mode === 'ai' || subject === 'NEET AI Examiner') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      const lastPaperDate = usageStats.lastPaperGenDate ? new Date(usageStats.lastPaperGenDate) : null;

      // Reset daily/weekly counts
      if (!lastPaperDate || lastPaperDate < today) {
        usageStats.papersGeneratedToday = 0;
        usageStats.lastPaperGenDate = today;
      }
      if (!lastPaperDate || lastPaperDate < startOfWeek) {
        usageStats.papersGeneratedThisWeek = 0;
      }

      const count = parseInt(req.query.count) || 10;

      if (plan === 'free') {
        // Free: 1 weekly AI generation event, max 10 questions
        if ((usageStats.papersGeneratedThisWeek || 0) >= 1) {
          return res.status(403).json({
            error: 'Weekly limit reached',
            message: 'You have already generated your 1 free question paper this week. Upgrade to Student tier for daily generation.'
          });
        }
        if (count > 10) {
          return res.status(400).json({
            error: 'Question limit exceeded',
            message: 'Free tier allows max 10 questions per generated paper.'
          });
        }
        usageStats.papersGeneratedThisWeek = (usageStats.papersGeneratedThisWeek || 0) + 1; // Count events
      } else if (plan === 'student') {
        // Student: 1 paper gen daily (max 20 questions)
        if (usageStats.papersGeneratedToday >= 1) {
          return res.status(403).json({
            error: 'Daily limit reached',
            message: 'You have already generated a question paper today. Upgrade to Ultimate for unlimited generation.'
          });
        }
        if (count > 20) {
          return res.status(400).json({
            error: 'Question limit exceeded',
            message: 'Student tier allows max 20 questions per generated paper.'
          });
        }
        usageStats.papersGeneratedToday += 1;
        // Also track weekly for consistency
        usageStats.papersGeneratedThisWeek = (usageStats.papersGeneratedThisWeek || 0) + 1;
      }

      user.usageStats = usageStats;
      await user.save();
    }

    // Proceed with question fetching
    if (subject === 'NEET AI Examiner' || subject.includes('NEET All India Mock') || subject.startsWith('neet-mock-') || subject.startsWith('full-mock-') || subject === 'practice') {
      console.log(`Fetching mock questions for: ${subject}`);

      // If it's a mock id (micro or full), try to serve the bundled mock paper JSON directly from disk
      if (subject.startsWith('neet-mock-') || subject.startsWith('full-mock-')) {
        try {
          const isFull = subject.startsWith('full-mock-');
          const paperNum = isFull ? subject.replace('full-mock-', '') : subject.replace('neet-mock-', '');

          let mockPaperPath;
          if (isFull) {
            // Full Mock (SME/VM Source)
            mockPaperPath = path.join(__dirname, `../../data/questions/mock_test/mock_test_paper_${paperNum}/mock_paper_${paperNum}.json`);
          } else {
            // Micro Mock (Student UI Source)
            // Special-case sample mock id -> load sample file
            if (paperNum === 'sample') {
              mockPaperPath = path.join(__dirname, `../../data/questions/micro_mock_test/micro_mock_test_1/micro_1.json`);
            } else {
              mockPaperPath = path.join(__dirname, `../../data/questions/micro_mock_test/micro_mock_test_${paperNum}/micro_${paperNum}.json`);
            }
          }

          try {
            await fs.promises.access(mockPaperPath);
            const raw = await fs.promises.readFile(mockPaperPath, 'utf8');
            try {
              const parsed = JSON.parse(raw);
              return res.status(200).json(parsed);
            } catch (parseErr) {
              console.error(`Failed to parse mock paper JSON (${mockPaperPath}):`, parseErr);
              return res.status(500).json({ error: 'Failed to parse mock paper JSON', details: parseErr.message });
            }
          } catch (accessErr) {
            console.warn(`Mock paper path not accessible: ${mockPaperPath}`);
            // File doesn't exist or is not accessible - fall through to RAG or DB
          }
        } catch (fsErr) {
          console.error('Error while trying to read mock paper file:', fsErr);
        }
      }

      try {
        const practiceSubject = req.query.subject || req.query.sub || null;
        const topic = req.query.topic || null;
        const setNum = req.query.set || 1;
        const count = parseInt(req.query.count) || 10;
        const score = req.query.score || null;
        const factors = req.query.factors || null;
        const questions = await ragBridge.fetchNEETMockQuestions(subject, practiceSubject, topic, setNum, count, mode, score, factors);
        return res.status(200).json(questions);
      } catch (ragError) {
        console.error("RAG Bridge Error:", ragError);
      }
    }


    // Basic Pagination for DB-based questions
    const limit = parseInt(req.query.limit) || 100;
    const skip = parseInt(req.query.skip) || 0;

    const questions = await MCQService.getQuestionsBySubject(subject, { limit, skip });

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        error: "No questions found for this subject",
        subject: subject
      });
    }

    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions by subject:", error);
    console.error("Error stack:", error.stack);

    // Handle database connection errors
    if (error.name === "MongoError" || error.name === "MongooseError" || error.message?.includes("Database connection")) {
      console.error("Database error. Connection state:", getConnectionState());
      return res.status(503).json({
        error: "Database temporarily unavailable. Please try again in a moment."
      });
    }

    res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Get all subjects available
export const getAvailableSubjects = async (req, res) => {
  try {
    // Wait for database connection with retry (max 5 seconds)
    try {
      await waitForConnection(5000);
    } catch (dbError) {
      console.error("Database connection unavailable. State:", getConnectionState());
      return res.status(503).json({
        error: "Database temporarily unavailable. Please try again in a moment."
      });
    }

    const subjects = await MCQService.getAvailableSubjects();
    res.status(200).json(subjects || []);
  } catch (error) {
    console.error("Error fetching available subjects:", error);
    console.error("Error stack:", error.stack);

    // Handle database connection errors
    if (error.name === "MongoError" || error.name === "MongooseError" || error.message?.includes("Database connection")) {
      console.error("Database error. Connection state:", getConnectionState());
      return res.status(503).json({
        error: "Database temporarily unavailable. Please try again in a moment."
      });
    }

    res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Get available practice sets for a subject
export const getSetsForSubject = async (req, res) => {
  try {
    let { subject } = req.params;
    subject = decodeURIComponent(subject);

    if (!subject) {
      return res.status(400).json({ error: "Subject parameter is required" });
    }

    // Call RAG bridge to get count
    const count = await ragBridge.getAvailableSetsCount(subject);

    // Default to at least 1 set if none found (fallback) or actually 0
    // The user wants strict actual availability.

    res.status(200).json({
      subject,
      count,
      sets: Array.from({ length: count }, (_, i) => i + 1)
    });

  } catch (error) {
    console.error("Error fetching sets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create new question (for admin use)
export const createQuestion = async (req, res) => {
  try {
    const {
      id,
      question,
      options,
      correctAnswer,
      subject,
      image,
      imageContentType,
      answerImage,
      answerImageContentType
    } = req.body;

    // Validate required fields
    if (!id || !question || !options || !correctAnswer || !subject) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate question image if provided
    if (image && !imageContentType) {
      return res.status(400).json({ error: "imageContentType is required when image is provided" });
    }

    // Validate answer image if provided
    if (answerImage && !answerImageContentType) {
      return res.status(400).json({ error: "answerImageContentType is required when answerImage is provided" });
    }

    const result = await MCQService.createQuestion(req.body);

    res.status(201).json({
      message: "Question created successfully",
      ...result
    });
  } catch (error) {
    console.error("Error creating question:", error);
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update question
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate image content types
    if (updateData.image && !updateData.imageContentType) {
      return res.status(400).json({ error: "imageContentType is required when image is provided" });
    }
    if (updateData.answerImage && !updateData.answerImageContentType) {
      return res.status(400).json({ error: "answerImageContentType is required when answerImage is provided" });
    }

    const result = await MCQService.updateQuestion(id, updateData);

    res.status(200).json({
      message: "Question updated successfully",
      ...result
    });
  } catch (error) {
    console.error("Error updating question:", error);
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete question
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    await MCQService.deleteQuestion(id);
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get admin data from data folder - fully async
export const getAdminData = async (req, res) => {
  try {
    const mcqDir = path.join(__dirname, '../../data/questions/mcq_practice');
    const classroomNeetDir = path.join(__dirname, '../../data/classroom/neet');
    const classroomJeeDir = path.join(__dirname, '../../data/classroom/jee_mains');
    const oneshortsNeetDir = path.join(__dirname, '../../data/classroom/oneshorts/neet');

    const result = {
      mcq: { NEET: {}, JEE: {} },
      classes: { NEET: {}, JEE: {} },
      mock_test: { NEET: {}, JEE: {} },
      oneshorts: { NEET: {}, JEE: {} }
    };

    // Helper functions to safely read directories (Async)
    const getDirectoriesAsync = async (source) => {
      try {
        const entries = await fs.promises.readdir(source, { withFileTypes: true });
        return entries
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);
      } catch (e) { return []; }
    };

    // MCQs (by subject and sets)
    const mcqSubjects = await getDirectoriesAsync(mcqDir);
    for (const sub of mcqSubjects) {
      const sets = await getDirectoriesAsync(path.join(mcqDir, sub));
      const formattedSub = sub.charAt(0).toUpperCase() + sub.slice(1);

      const isNeet = ['biology', 'physics', 'chemistry', 'botany', 'zoology'].includes(sub.toLowerCase());
      const isJee = ['mathematics', 'maths', 'math', 'physics', 'chemistry'].includes(sub.toLowerCase());

      if (isNeet) result.mcq.NEET[formattedSub] = sets.map(s => ({ id: `m_${sub}_${s}`, title: s, status: 'pending', fullData: { subject: sub, setId: s } }));
      if (isJee) result.mcq.JEE[formattedSub] = sets.map(s => ({ id: `m_${sub}_${s}`, title: s, status: 'pending', fullData: { subject: sub, setId: s } }));
    }

    // Classroom Classes (recursive scanning - async)
    let classIdSequence = 1;

    const scanClassFolderAsync = async (fullPath, subPath = '') => {
      let items = [];
      try {
        const entries = await fs.promises.readdir(fullPath, { withFileTypes: true });

        for (const entry of entries) {
          const entryPath = path.join(fullPath, entry.name);
          const relativeSubPath = (subPath ? path.join(subPath, entry.name) : entry.name).replace(/\\/g, '/');

          if (entry.isDirectory()) {
            const subItems = await scanClassFolderAsync(entryPath, relativeSubPath);
            if (subItems.length > 0) {
              items.push({
                id: `folder_${relativeSubPath.replace(/[\/\\]/g, '_')}`,
                title: entry.name.replace(/_/g, ' '),
                status: 'pending',
                type: 'folder',
                children: subItems
              });
            }
          } else if (entry.name.endsWith('.json')) {
            try {
              const content = await fs.promises.readFile(entryPath, 'utf8');
              const parsed = JSON.parse(content);
              const classData = parsed.class || parsed;
              items.push({
                id: `c${classIdSequence++}`,
                title: classData.title || entry.name.replace('.json', '').replace(/_/g, ' '),
                status: 'pending',
                type: 'file',
                fullData: {
                  ...classData,
                  originalFile: entry.name,
                  relativeSubPath: relativeSubPath
                }
              });
            } catch (e) { }
          }
        }
      } catch (e) { }
      // Sort items so folders (like Class 11, Class 12) appear first or in order
      return items.sort((a, b) => {
        if (a.type === b.type) return a.title.localeCompare(b.title, undefined, { numeric: true });
        return a.type === 'folder' ? -1 : 1;
      });
    };

    const processClassesAsync = async (dir, courseStr, targetKey = 'classes') => {
      const classSubjects = await getDirectoriesAsync(dir);
      for (const sub of classSubjects) {
        const formattedSub = sub.charAt(0).toUpperCase() + sub.slice(1);
        const subjectPath = path.join(dir, sub);
        result[targetKey][courseStr][formattedSub] = await scanClassFolderAsync(subjectPath, sub);
      }
    };

    await processClassesAsync(classroomNeetDir, 'NEET', 'classes');
    await processClassesAsync(classroomJeeDir, 'JEE', 'classes');
    await processClassesAsync(oneshortsNeetDir, 'NEET', 'oneshorts');

    // Mock Tests (Full Mocks for SME Terminal under data/questions/mock_test)
    try {
      const mockTestDir = path.join(__dirname, '../../data/questions/mock_test');
      try {
        await fs.promises.access(mockTestDir);
        const entries = await fs.promises.readdir(mockTestDir, { withFileTypes: true });
        const paperDirs = entries
          .filter(d => d.isDirectory())
          .map(d => d.name)
          .sort();

        if (paperDirs.length > 0) {
          const mockItems = paperDirs
            .filter(d => !d.toLowerCase().includes('sample'))
            .map(dirName => {
              const m = dirName.match(/mock_test_paper_(\d+)/i);
              const paperNum = m ? m[1] : dirName;
              return {
                id: `mock_neet_full_${paperNum}`,
                title: `Full Mock ${paperNum}`,
                status: 'pending',
                fullData: { mockId: `full-mock-${paperNum}`, sourceDir: dirName }
              };
            });

          // Group mock tests under a readable subject key for SMEs
          result.mock_test.NEET['Full Mocks'] = mockItems;
        }
      } catch (e) {
        // Directory doesn't exist
      }
    } catch (e) {
      console.warn('Failed to scan mock_test directory for admin data', e);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching admin data:", err);
    res.status(500).json({ error: "Internal server error fetching admin data" });
  }
};

// Submit a report for a question
export const submitReport = async (req, res) => {
  try {
    const { reportText, evaluatorName, email, subject, questionNo } = req.body;

    if (!reportText) {
      return res.status(400).json({ error: "Report text is required" });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"YUGA Quality Assurance" <${process.env.EMAIL_USER}>`,
      to: 'ceo@navodhan.com',
      // to: 'royxlead@gmail.com',
      subject: `SME Evaluation Report - ${subject || 'General'} - ${questionNo || 'Unknown'} - ${email || 'Not Provided'}`,
      text: `Dear Admin,

A new SME Evaluation Report has been submitted.

Evaluator Details:
Name: ${evaluatorName || 'Unknown SME'}
Email: ${email || 'Not Provided'}

Report Context:
Subject: ${subject || 'N/A'}
Question/Item No: ${questionNo || 'N/A'}

================ REPORT DETAILS ================
${reportText}
================================================

Best regards,
YUGA AI System`,
      attachments: [
        {
          filename: `SME_Report_${subject}_${questionNo}.txt`,
          content: reportText
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Report submitted and emailed successfully" });
  } catch (error) {
    console.error("Error sending report email:", error);
    res.status(500).json({ error: "Failed to send report email", details: error.message });
  }
};