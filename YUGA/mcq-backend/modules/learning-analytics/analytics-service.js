/**
 * Analytics Service
 * Business logic for learning analytics
 */

import LearningAnalytics from "../shared/db/models/learning_analytics_schema.js";
import TopicMastery from "../shared/db/models/topic_mastery_schema.js";
import StudyPath from "../shared/db/models/study_path_schema.js";
import LessonProgress from "../shared/db/models/lessonProgress.js";
import AssessmentSubmission from "../shared/db/models/assessmentSubmission.js";
import { calculateMastery, calculateRecallQuality } from "./algorithms/mastery-calculator.js";
import { calculateNextReview } from "./algorithms/spaced-repetition.js";
import { adjustDifficulty } from "./algorithms/difficulty-adjuster.js";
import { getNextQuestions, generateStudyPath } from "./algorithms/recommendation-engine.js";

/**
 * Record a question attempt
 */
export async function recordAttempt(userId, attemptData) {
    try {
        const { questionId, subject, topic, difficulty, isCorrect, timeSpent, confidenceLevel, hintUsed } = attemptData;

        // Save attempt to analytics collection
        const attempt = new LearningAnalytics({
            userId,
            questionId,
            subject,
            topic,
            difficulty,
            isCorrect,
            timeSpent,
            confidenceLevel,
            hintUsed
        });

        await attempt.save();

        // Update topic mastery
        await updateTopicMastery(userId, subject, topic, { isCorrect, timeSpent, difficulty });

        return { success: true, message: "Attempt recorded successfully" };
    } catch (error) {
        console.error("Error recording attempt:", error);
        throw new Error("Failed to record attempt");
    }
}

/**
 * Record multiple question attempts in a batch
 */
export async function recordBatchAttempts(userId, attempts) {
    try {
        const results = [];
        for (const attemptData of attempts) {
            const { questionId, subject, topic, difficulty, isCorrect, timeSpent, confidenceLevel, hintUsed } = attemptData;

            // Save attempt to analytics collection
            const attempt = new LearningAnalytics({
                userId,
                questionId,
                subject,
                topic,
                difficulty,
                isCorrect,
                timeSpent,
                confidenceLevel,
                hintUsed
            });

            await attempt.save();

            // Update topic mastery
            await updateTopicMastery(userId, subject, topic, { isCorrect, timeSpent, difficulty });
            results.push({ questionId, success: true });
        }

        return { success: true, count: results.length, message: "Batch attempts recorded successfully" };
    } catch (error) {
        console.error("Error recording batch attempts:", error);
        throw new Error("Failed to record batch attempts");
    }
}

/**
 * Update topic mastery based on new attempt
 */
async function updateTopicMastery(userId, subject, topic, attemptData) {
    try {
        // Find or create topic mastery record
        let masteryRecord = await TopicMastery.findOne({ userId, subject, topic });

        if (!masteryRecord) {
            masteryRecord = new TopicMastery({
                userId,
                subject,
                topic,
                totalAttempts: 0,
                correctAttempts: 0,
                averageTimeSpent: 0,
                masteryScore: 0
            });
        }

        // Update attempt counts
        masteryRecord.totalAttempts += 1;
        if (attemptData.isCorrect) {
            masteryRecord.correctAttempts += 1;
        }

        // Update average time spent (running average)
        masteryRecord.averageTimeSpent =
            (masteryRecord.averageTimeSpent * (masteryRecord.totalAttempts - 1) + attemptData.timeSpent) / masteryRecord.totalAttempts;

        masteryRecord.lastPracticedAt = new Date();

        // Get all attempts for this topic to calculate mastery
        const allAttempts = await LearningAnalytics.find({ userId, subject, topic })
            .sort({ attemptedAt: -1 })
            .limit(50)
            .lean();

        // Calculate new mastery score
        const topicStats = {
            totalAttempts: masteryRecord.totalAttempts,
            correctAttempts: masteryRecord.correctAttempts,
            averageTimeSpent: masteryRecord.averageTimeSpent
        };

        masteryRecord.masteryScore = calculateMastery(allAttempts, topicStats);

        // Adjust difficulty level
        masteryRecord.difficultyLevel = adjustDifficulty(allAttempts, masteryRecord.difficultyLevel);

        // Update spaced repetition parameters
        const recallQuality = calculateRecallQuality(attemptData.isCorrect, attemptData.timeSpent, attemptData.difficulty);
        const reviewData = calculateNextReview(masteryRecord, recallQuality);

        masteryRecord.nextReviewDate = reviewData.nextReviewDate;
        masteryRecord.interval = reviewData.interval;
        masteryRecord.easinessFactor = reviewData.easinessFactor;
        masteryRecord.repetitions = reviewData.repetitions;

        await masteryRecord.save();

        return masteryRecord;
    } catch (error) {
        console.error("Error updating topic mastery:", error);
        throw error;
    }
}

/**
 * Get user's overall analytics
 */
export async function getUserAnalytics(userId) {
    try {
        // Get all mastery records
        const masteryRecords = await TopicMastery.find({ userId }).lean();

        // Get total attempts
        const totalAttempts = await LearningAnalytics.countDocuments({ userId });

        // Get correct attempts
        const correctAttempts = await LearningAnalytics.countDocuments({ userId, isCorrect: true });

        // Calculate overall accuracy
        const overallAccuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

        // Calculate overall mastery
        const overallMastery = masteryRecords.length > 0
            ? masteryRecords.reduce((sum, r) => sum + r.masteryScore, 0) / masteryRecords.length
            : 0;

        // Get subject-wise breakdown
        const subjectBreakdown = await getSubjectBreakdown(userId);

        // Get recent performance (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentAttempts = await LearningAnalytics.countDocuments({
            userId,
            attemptedAt: { $gte: sevenDaysAgo }
        });

        // Get study time this week (total time spent on questions)
        const studyTimeResult = await LearningAnalytics.aggregate([
            {
                $match: {
                    userId: userId,
                    attemptedAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: null,
                    totalTime: { $sum: "$timeSpent" }
                }
            }
        ]);

        const studyTimeThisWeek = studyTimeResult.length > 0 ? Math.round(studyTimeResult[0].totalTime / 60) : 0; // in minutes

        return {
            totalAttempts,
            correctAttempts,
            overallAccuracy: Math.round(overallAccuracy),
            overallMastery: Math.round(overallMastery),
            subjectBreakdown,
            recentAttempts,
            studyTimeThisWeek,
            topicsMastered: masteryRecords.filter(r => r.masteryScore >= 70).length,
            topicsInProgress: masteryRecords.filter(r => r.masteryScore < 70 && r.masteryScore > 0).length,
            personalizationScore: await calculateStudentScore(userId)
        };
    } catch (error) {
        console.error("Error getting user analytics:", error);
        throw error;
    }
}

/**
 * Get subject-wise breakdown
 */
async function getSubjectBreakdown(userId) {
    try {
        const subjects = ["Chemistry", "Physics", "Botany", "Zoology"];
        const breakdown = [];

        for (const subject of subjects) {
            const masteryRecords = await TopicMastery.find({ userId, subject }).lean();
            const attempts = await LearningAnalytics.countDocuments({ userId, subject });
            const correct = await LearningAnalytics.countDocuments({ userId, subject, isCorrect: true });

            const avgMastery = masteryRecords.length > 0
                ? masteryRecords.reduce((sum, r) => sum + r.masteryScore, 0) / masteryRecords.length
                : 0;

            breakdown.push({
                subject,
                attempts,
                accuracy: attempts > 0 ? Math.round((correct / attempts) * 100) : 0,
                averageMastery: Math.round(avgMastery),
                topicsCount: masteryRecords.length
            });
        }

        return breakdown;
    } catch (error) {
        console.error("Error getting subject breakdown:", error);
        return [];
    }
}

/**
 * Get topic mastery for a specific subject
 */
export async function getTopicMastery(userId, subject) {
    try {
        const masteryRecords = await TopicMastery.find({ userId, subject })
            .sort({ masteryScore: -1 })
            .lean();

        return masteryRecords;
    } catch (error) {
        console.error("Error getting topic mastery:", error);
        throw error;
    }
}

/**
 * Get personalized study path
 */
export async function getStudyPath(userId, targetExamDate) {
    try {
        // Check if there's an active study path
        let studyPath = await StudyPath.findOne({ userId, isActive: true })
            .sort({ generatedAt: -1 })
            .lean();

        // If no active path or path is older than 7 days, generate new one
        if (!studyPath || isStudyPathStale(studyPath.generatedAt)) {
            const pathData = await generateStudyPath(userId, targetExamDate);

            // Deactivate old paths
            await StudyPath.updateMany({ userId }, { isActive: false });

            // Create new study path
            studyPath = new StudyPath({
                userId,
                ...pathData,
                isActive: true
            });

            await studyPath.save();
        }

        return studyPath;
    } catch (error) {
        console.error("Error getting study path:", error);
        throw error;
    }
}

/**
 * Check if study path is stale (older than 7 days)
 */
function isStudyPathStale(generatedAt) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(generatedAt) < sevenDaysAgo;
}

/**
 * Get next recommended questions
 */
export async function getRecommendedQuestions(userId, count = 10) {
    try {
        const questions = await getNextQuestions(userId, count);
        return questions;
    } catch (error) {
        console.error("Error getting recommended questions:", error);
        throw error;
    }
}

/**
 * Get performance trends
 */
export async function getPerformanceTrends(userId, period = "week") {
    try {
        const days = period === "week" ? 7 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const attempts = await LearningAnalytics.find({
            userId,
            attemptedAt: { $gte: startDate }
        }).sort({ attemptedAt: 1 }).lean();

        // Group by day
        const trendsByDay = {};

        attempts.forEach(attempt => {
            const day = attempt.attemptedAt.toISOString().split('T')[0];
            if (!trendsByDay[day]) {
                trendsByDay[day] = { total: 0, correct: 0 };
            }
            trendsByDay[day].total += 1;
            if (attempt.isCorrect) {
                trendsByDay[day].correct += 1;
            }
        });

        // Convert to array
        const trends = Object.keys(trendsByDay).map(day => ({
            date: day,
            accuracy: (trendsByDay[day].correct / trendsByDay[day].total) * 100,
            attempts: trendsByDay[day].total
        }));

        return trends;
    } catch (error) {
        console.error("Error getting performance trends:", error);
        throw error;
    }
}

/**
 * Get weak areas
 */
export async function getWeakAreas(userId) {
    try {
        const weakTopics = await TopicMastery.find({
            userId,
            masteryScore: { $lt: 50 }
        })
            .sort({ masteryScore: 1 })
            .limit(10)
            .lean();

        return weakTopics.map(topic => ({
            subject: topic.subject,
            topic: topic.topic,
            masteryScore: topic.masteryScore,
            attempts: topic.totalAttempts,
            accuracy: topic.totalAttempts > 0
                ? Math.round((topic.correctAttempts / topic.totalAttempts) * 100)
                : 0,
            lastPracticed: topic.lastPracticedAt
        }));
    } catch (error) {
        console.error("Error getting weak areas:", error);
        throw error;
    }
}

/**
 * Mark daily recommendation as complete
 */
export async function markRecommendationComplete(userId, recommendationDate, subject, topic) {
    try {
        const studyPath = await StudyPath.findOne({ userId, isActive: true });

        if (!studyPath) {
            throw new Error("No active study path found");
        }

        // Find and update the recommendation
        const recommendation = studyPath.dailyRecommendations.find(rec =>
            rec.date.toISOString().split('T')[0] === recommendationDate &&
            rec.subject === subject &&
            rec.topic === topic
        );

        if (recommendation) {
            recommendation.completed = true;
            await studyPath.save();
            return { success: true, message: "Recommendation marked as complete" };
        }

        return { success: false, message: "Recommendation not found" };
    } catch (error) {
        console.error("Error marking recommendation complete:", error);
        throw error;
    }
}

/**
 * Calculate comprehensive student personalization score (0-100)
 */
export async function calculateStudentScore(userId) {
    try {
        // 1. Mastery Score (40%) - Average of all topic masteries
        // Default to 50 (neutral) start if no data
        const masteryRecords = await TopicMastery.find({ userId }).lean();
        const avgMastery = masteryRecords.length > 0
            ? masteryRecords.reduce((sum, r) => sum + r.masteryScore, 0) / masteryRecords.length
            : 50;

        // 2. Recent Accuracy (30%) - Last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentAttempts = await LearningAnalytics.find({
            userId,
            attemptedAt: { $gte: thirtyDaysAgo }
        }).select('isCorrect').lean();

        const recentAccuracy = recentAttempts.length > 0
            ? (recentAttempts.filter(a => a.isCorrect).length / recentAttempts.length) * 100
            : 50;

        // 3. Class Completion (15%) - LessonProgress
        // Heuristic: 50 lessons completes the "current goal" for score purposes
        // Real logic ideally splits by course but this is a global engagement metric
        const completedLessons = await LessonProgress.countDocuments({
            user: userId,
            completed: true
        });
        const classScore = Math.min((completedLessons / 50) * 100, 100);

        // 4. Assessment Scores (15%) - Mock Exams/Quizzes
        const assessments = await AssessmentSubmission.find({ user: userId }).select('score').lean();
        const avgAssessment = assessments.length > 0
            ? assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length
            : 50;

        // Weighted Average
        const weightedScore = (
            (avgMastery * 0.40) +
            (recentAccuracy * 0.30) +
            (classScore * 0.15) +
            (avgAssessment * 0.15)
        );

        return Math.round(weightedScore);
    } catch (error) {
        console.error("Error calculating student score:", error);
        return 50; // Fallback to neutral score
    }
}

/**
 * Advanced Predictive Analytics: Predict Real Exam Score
 * Uses historical accuracy, mastery, and assessment scores
 */
export async function predictExamScore(userId) {
    try {
        // 1. Overall Topic Mastery (Weight: 40%)
        const masteryRecords = await TopicMastery.find({ userId }).lean();
        const avgMastery = masteryRecords.length > 0
            ? masteryRecords.reduce((sum, r) => sum + r.masteryScore, 0) / masteryRecords.length
            : 0;

        // 2. Recent MCQ Accuracy - Last 30 Days (Weight: 30%)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentAttempts = await LearningAnalytics.find({
            userId,
            attemptedAt: { $gte: thirtyDaysAgo }
        }).select('isCorrect').lean();

        const recentAccuracy = recentAttempts.length > 0
            ? (recentAttempts.filter(a => a.isCorrect).length / recentAttempts.length) * 100
            : 0;

        // 3. Official Mock Exam Scores (Weight: 30%)
        const assessments = await AssessmentSubmission.find({ user: userId }).select('score').lean();
        const avgAssessment = assessments.length > 0
            ? assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length
            : 0;

        // If no data exists, we can't make a solid prediction
        if (masteryRecords.length === 0 && recentAttempts.length === 0 && assessments.length === 0) {
            return {
                predictedScore: 0,
                confidence: "Low",
                drivingFactors: ["Not enough data to predict a score. Keep practicing!"],
                isReady: false
            };
        }

        // Calculate Weighted Prediction
        let predictedScore = (avgMastery * 0.40) + (recentAccuracy * 0.30) + (avgAssessment * 0.30);

        // Cap at 100
        predictedScore = Math.min(Math.round(predictedScore), 100);

        // Determine Confidence Level based on volume of data
        let confidence = "Low";
        if (recentAttempts.length > 100 && assessments.length > 2) confidence = "High";
        else if (recentAttempts.length > 30 || assessments.length > 0) confidence = "Medium";

        // Generate Insights
        const drivingFactors = [];
        if (avgMastery > 80) drivingFactors.push("High topic mastery across subjects is boosting your score.");
        if (recentAccuracy < 50 && recentAttempts.length > 0) drivingFactors.push("Recent practice accuracy is pulling your prediction down. Focus on weak areas.");
        if (assessments.length === 0) drivingFactors.push("Take a full Mock Exam to significantly improve prediction accuracy.");
        if (avgAssessment > predictedScore) drivingFactors.push("Strong mock exam performance indicates good test-taking skills under pressure.");

        return {
            predictedScore,
            confidence,
            drivingFactors,
            isReady: true
        };
    } catch (error) {
        console.error("Error predicting exam score:", error);
        throw error;
    }
}
