/**
 * Analytics Controller
 * Request handlers for learning analytics API
 */

import * as AnalyticsService from "./analytics-service.js";
import User from "../shared/db/models/user_schema.js";

/**
 * POST /api/learning-analytics/attempt
 * Record a question attempt
 */
export const recordAttempt = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        const attemptData = req.body;

        // Validate required fields
        if (!attemptData.questionId || !attemptData.subject || !attemptData.topic ||
            !attemptData.difficulty || attemptData.isCorrect === undefined || !attemptData.timeSpent) {
            return res.status(400).json({
                error: "Missing required fields: questionId, subject, topic, difficulty, isCorrect, timeSpent"
            });
        }

        const result = await AnalyticsService.recordAttempt(userId, attemptData);

        // --- Gamification Hook: Award XP for activity ---
        let xpGained = 0;
        let streakUpdated = false;

        try {
            const user = await User.findById(userId);
            if (user) {
                // Award 5 XP for a correct answer, 1 XP for just attempting
                xpGained = attemptData.isCorrect ? 5 : 1;

                if (typeof user.xp === 'undefined') user.xp = 0;
                user.xp += xpGained;

                // Super basic streak check: if streak is 0, make it 1 on first action
                if (!user.progress) user.progress = { currentStreak: 0, longestStreak: 0 };
                if (user.progress.currentStreak === 0) {
                    user.progress.currentStreak = 1;
                    if (user.progress.longestStreak === 0) user.progress.longestStreak = 1;
                    streakUpdated = true;
                }

                await user.save();
            }
        } catch (gamificationError) {
            console.error("Non-fatal Gamification error:", gamificationError);
            // Don't fail the main request if gamification update fails
        }

        res.status(200).json({
            ...result,
            gamification: {
                xpAwarded: xpGained,
                streakUpdated
            }
        });
    } catch (error) {
        console.error("Error in recordAttempt controller:", error);
        res.status(500).json({ error: "Failed to record attempt", details: error.message });
    }
};

/**
 * POST /api/learning-analytics/batch-attempt
 * Record multiple question attempts
 */
export const recordBatchAttempts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { attempts } = req.body;

        if (!attempts || !Array.isArray(attempts)) {
            return res.status(400).json({ error: "Missing required field: attempts (array)" });
        }

        const result = await AnalyticsService.recordBatchAttempts(userId, attempts);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in recordBatchAttempts controller:", error);
        res.status(500).json({ error: "Failed to record batch attempts", details: error.message });
    }
};

/**
 * GET /api/learning-analytics/overview
 * Get user's overall analytics overview
 */
export const getOverview = async (req, res) => {
    try {
        const userId = req.user.id;
        const analytics = await AnalyticsService.getUserAnalytics(userId);
        res.status(200).json(analytics);
    } catch (error) {
        console.error("Error in getOverview controller:", error);
        res.status(500).json({ error: "Failed to fetch analytics", details: error.message });
    }
};

/**
 * GET /api/learning-analytics/mastery/:subject
 * Get topic mastery breakdown for a subject
 */
export const getTopicMastery = async (req, res) => {
    try {
        const userId = req.user.id;
        const { subject } = req.params;

        if (!["Chemistry", "Physics", "Botany", "Zoology"].includes(subject)) {
            return res.status(400).json({ error: "Invalid subject. Must be Chemistry, Physics, Botany, or Zoology" });
        }

        const mastery = await AnalyticsService.getTopicMastery(userId, subject);
        res.status(200).json(mastery);
    } catch (error) {
        console.error("Error in getTopicMastery controller:", error);
        res.status(500).json({ error: "Failed to fetch topic mastery", details: error.message });
    }
};

/**
 * GET /api/learning-analytics/study-path
 * Get personalized study path
 */
export const getStudyPath = async (req, res) => {
    try {
        const userId = req.user.id;
        const { targetExamDate } = req.query;

        const examDate = targetExamDate ? new Date(targetExamDate) : null;
        const studyPath = await AnalyticsService.getStudyPath(userId, examDate);

        res.status(200).json(studyPath);
    } catch (error) {
        console.error("Error in getStudyPath controller:", error);
        res.status(500).json({ error: "Failed to fetch study path", details: error.message });
    }
};

/**
 * GET /api/learning-analytics/next-questions
 * Get next recommended questions
 */
export const getNextQuestions = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = parseInt(req.query.count) || 10;

        if (count < 1 || count > 50) {
            return res.status(400).json({ error: "Count must be between 1 and 50" });
        }

        const questions = await AnalyticsService.getRecommendedQuestions(userId, count);
        res.status(200).json(questions);
    } catch (error) {
        console.error("Error in getNextQuestions controller:", error);
        res.status(500).json({ error: "Failed to fetch recommended questions", details: error.message });
    }
};

/**
 * GET /api/learning-analytics/trends
 * Get performance trends over time
 */
export const getPerformanceTrends = async (req, res) => {
    try {
        const userId = req.user.id;
        const period = req.query.period || "week"; // "week" or "month"

        if (!["week", "month"].includes(period)) {
            return res.status(400).json({ error: "Period must be 'week' or 'month'" });
        }

        const trends = await AnalyticsService.getPerformanceTrends(userId, period);
        res.status(200).json(trends);
    } catch (error) {
        console.error("Error in getPerformanceTrends controller:", error);
        res.status(500).json({ error: "Failed to fetch performance trends", details: error.message });
    }
};

/**
 * GET /api/learning-analytics/weak-areas
 * Get weak areas requiring focus
 */
export const getWeakAreas = async (req, res) => {
    try {
        const userId = req.user.id;
        const weakAreas = await AnalyticsService.getWeakAreas(userId);
        res.status(200).json(weakAreas);
    } catch (error) {
        console.error("Error in getWeakAreas controller:", error);
        res.status(500).json({ error: "Failed to fetch weak areas", details: error.message });
    }
};

/**
 * POST /api/learning-analytics/mark-complete
 * Mark a daily recommendation as complete
 */
export const markComplete = async (req, res) => {
    try {
        const userId = req.user.id;
        const { date, subject, topic } = req.body;

        if (!date || !subject || !topic) {
            return res.status(400).json({ error: "Missing required fields: date, subject, topic" });
        }

        const result = await AnalyticsService.markRecommendationComplete(userId, date, subject, topic);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in markComplete controller:", error);
        res.status(500).json({ error: "Failed to mark recommendation complete", details: error.message });
    }
};

/**
 * GET /api/learning-analytics/predictive-score
 * Get predicted exam score based on historical data
 */
export const getPredictiveScore = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Enforce Premium logic for Predictive Analytics
        const user = await User.findById(userId);
        const isPremium = user?.membership?.plan === 'premium';

        if (!isPremium) {
            // Return a payload indicating they need premium instead of a full error
            // so the frontend widget can render a locked state gracefully
            return res.status(200).json({
                isReady: false,
                isPremium: false,
                drivingFactors: ["Premium feature locked"],
                confidence: "Low",
                predictedScore: 0
            });
        }

        const prediction = await AnalyticsService.predictExamScore(userId);

        // Add premium status to response
        res.status(200).json({ ...prediction, isPremium: true });
    } catch (error) {
        console.error("Error in getPredictiveScore controller:", error);
        res.status(500).json({ error: "Failed to fetch predictive score", details: error.message });
    }
};
