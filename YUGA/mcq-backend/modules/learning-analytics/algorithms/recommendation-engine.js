/**
 * Recommendation Engine
 * Generates personalized question recommendations and study paths
 */

import LearningAnalytics from "../../shared/db/models/learning_analytics_schema.js";
import TopicMastery from "../../shared/db/models/topic_mastery_schema.js";
import { getReviewPriority, isDueForReview } from "./spaced-repetition.js";
import { getDifficultyDistribution } from "./difficulty-adjuster.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get next recommended questions for adaptive practice
 * @param {String} userId - User ID
 * @param {Number} count - Number of questions to recommend
 * @param {String} examType - "NEET" or "JEE"
 * @returns {Array} - Array of recommended questions
 */
export async function getNextQuestions(userId, count = 10, examType = "NEET") {
    try {
        // Get all topic mastery records for the user
        const masteryRecords = await TopicMastery.find({ userId }).lean();

        if (masteryRecords.length === 0) {
            // No history - return balanced beginner questions
            return await getBeginnerQuestions(count, examType);
        }

        // Prioritize topics based on various factors
        const prioritizedTopics = prioritizeTopics(masteryRecords);

        // Get difficulty distribution based on overall mastery
        const overallMastery = calculateOverallMastery(masteryRecords);
        const difficultyDist = getDifficultyDistribution(overallMastery, count);

        // Select questions
        const questions = await selectQuestions(prioritizedTopics, difficultyDist, count);

        return questions;
    } catch (error) {
        console.error("Error in getNextQuestions:", error);
        throw error;
    }
}

/**
 * Prioritize topics for practice
 */
function prioritizeTopics(masteryRecords) {
    return masteryRecords.map(record => {
        let priorityScore = 0;

        // Factor 1: Low mastery gets high priority (inverted score)
        priorityScore += (100 - record.masteryScore) * 0.4;

        // Factor 2: Due for review (spaced repetition)
        if (isDueForReview(record.nextReviewDate)) {
            priorityScore += getReviewPriority(record.nextReviewDate, record.masteryScore);
        }

        // Factor 3: Recently practiced topics get lower priority
        if (record.lastPracticedAt) {
            const daysSinceLastPractice = (Date.now() - new Date(record.lastPracticedAt)) / (1000 * 60 * 60 * 24);
            if (daysSinceLastPractice < 1) {
                priorityScore -= 20; // Recently practiced
            }
        }

        return {
            ...record,
            priorityScore
        };
    }).sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Calculate overall mastery across all topics
 */
function calculateOverallMastery(masteryRecords) {
    if (masteryRecords.length === 0) return 0;

    const totalMastery = masteryRecords.reduce((sum, record) => sum + record.masteryScore, 0);
    return totalMastery / masteryRecords.length;
}

/**
 * Select questions based on prioritized topics and difficulty distribution
 */
async function selectQuestions(prioritizedTopics, difficultyDist, count) {
    const questions = [];
    const questionsPerTopic = Math.ceil(count / Math.min(prioritizedTopics.length, 3));

    // Select from top 3 priority topics
    for (let i = 0; i < Math.min(3, prioritizedTopics.length) && questions.length < count; i++) {
        const topic = prioritizedTopics[i];
        const topicQuestions = await loadQuestionsForTopic(topic.subject, topic.topic);

        if (topicQuestions.length === 0) continue;

        // Filter by appropriate difficulty
        const targetDifficulty = topic.difficultyLevel;
        const filtered = topicQuestions.filter(q => q.difficulty === targetDifficulty);

        // Randomly select from filtered questions
        const selected = getRandomQuestions(filtered.length > 0 ? filtered : topicQuestions, questionsPerTopic);
        questions.push(...selected);
    }

    return questions.slice(0, count);
}

/**
 * Load questions for a specific topic from JSON files
 */
async function loadQuestionsForTopic(subject, topic) {
    try {
        const dataPath = path.join(__dirname, "../../../data/questions/mcq_practice", subject.toLowerCase());
        const files = await fs.readdir(dataPath, { recursive: true });

        const allQuestions = [];

        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(dataPath, file);
                const content = await fs.readFile(filePath, 'utf-8');
                const questions = JSON.parse(content);

                // Filter by topic
                const topicQuestions = questions.filter(q =>
                    q.sub_topic === topic || q.topic === topic
                );

                allQuestions.push(...topicQuestions);
            }
        }

        return allQuestions;
    } catch (error) {
        console.error(`Error loading questions for ${subject}/${topic}:`, error);
        return [];
    }
}

/**
 * Get random questions from an array
 */
function getRandomQuestions(questions, count) {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

/**
 * Get beginner-level questions for new users
 */
async function getBeginnerQuestions(count, examType) {
    try {
        // Load from Set1 of each subject (beginner sets)
        const subjects = ["biology", "chemistry", "physics"];
        const allQuestions = [];

        for (const subject of subjects) {
            const filePath = path.join(__dirname, "../../../data/questions/mcq_practice", subject, "Set1/set1.json");
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                const questions = JSON.parse(content);
                allQuestions.push(...questions);
            } catch (err) {
                console.log(`Could not load Set1 for ${subject}`);
            }
        }

        return getRandomQuestions(allQuestions, count);
    } catch (error) {
        console.error("Error loading beginner questions:", error);
        return [];
    }
}

/**
 * Generate weekly study path based on user's current mastery
 */
export async function generateStudyPath(userId, targetExamDate) {
    try {
        const masteryRecords = await TopicMastery.find({ userId }).lean();

        if (masteryRecords.length === 0) {
            return generateBeginnerStudyPath(targetExamDate);
        }

        // Identify focus areas (mastery < 50)
        const focusAreas = masteryRecords
            .filter(r => r.masteryScore < 50)
            .map(r => ({
                subject: r.subject,
                topic: r.topic,
                currentMastery: r.masteryScore,
                targetMastery: Math.min(r.masteryScore + 20, 70)
            }));

        // Identify strength areas (mastery > 70)
        const strengthAreas = masteryRecords
            .filter(r => r.masteryScore > 70)
            .map(r => ({
                subject: r.subject,
                topic: r.topic,
                masteryScore: r.masteryScore
            }));

        // Generate weekly goals (top 5 focus areas)
        const weeklyGoals = focusAreas.slice(0, 5).map((area, index) => ({
            subject: area.subject,
            topic: area.topic,
            targetMasteryIncrease: 20,
            priority: 10 - index
        }));

        // Generate daily recommendations for the week
        const dailyRecommendations = generateDailyRecommendations(focusAreas, 7);

        return {
            weeklyGoals,
            dailyRecommendations,
            focusAreas,
            strengthAreas,
            targetExamDate,
            estimatedCompletionDate: calculateCompletionDate(focusAreas.length),
            adaptationReason: "Generated based on current performance analysis"
        };
    } catch (error) {
        console.error("Error generating study path:", error);
        throw error;
    }
}

/**
 * Generate daily recommendations for the week
 */
function generateDailyRecommendations(focusAreas, days) {
    const recommendations = [];
    const startDate = new Date();

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        // Rotate through focus areas
        const topicsForDay = focusAreas.slice(i % 3, (i % 3) + 2);

        topicsForDay.forEach(area => {
            recommendations.push({
                date,
                subject: area.subject,
                topic: area.topic,
                estimatedTime: 20,
                priority: area.currentMastery < 30 ? "High" : "Medium",
                reason: area.currentMastery < 30 ? "Critical weak area" : "Needs improvement",
                completed: false
            });
        });
    }

    return recommendations;
}

/**
 * Generate study path for beginners
 */
function generateBeginnerStudyPath(targetExamDate) {
    return {
        weeklyGoals: [
            { subject: "Biology", topic: "Cell Structure", targetMasteryIncrease: 30, priority: 10 },
            { subject: "Chemistry", topic: "Atomic Structure", targetMasteryIncrease: 30, priority: 9 },
            { subject: "Physics", topic: "Mechanics", targetMasteryIncrease: 30, priority: 8 }
        ],
        dailyRecommendations: [
            { date: new Date(), subject: "Biology", topic: "Cell Structure", estimatedTime: 30, priority: "High", reason: "Foundation topic", completed: false }
        ],
        focusAreas: [],
        strengthAreas: [],
        targetExamDate,
        estimatedCompletionDate: null,
        adaptationReason: "Initial study path for new user"
    };
}

/**
 * Calculate estimated completion date
 */
function calculateCompletionDate(focusAreasCount) {
    const weeksNeeded = Math.ceil(focusAreasCount / 5); // 5 topics per week
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + (weeksNeeded * 7));
    return completionDate;
}
