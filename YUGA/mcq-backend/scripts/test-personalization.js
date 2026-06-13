import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { calculateStudentScore } from '../modules/learning-analytics/analytics-service.js';
import User from '../modules/shared/db/models/user_schema.js';
import TopicMastery from '../modules/shared/db/models/topic_mastery_schema.js';
import LearningAnalytics from '../modules/shared/db/models/learning_analytics_schema.js';
import LessonProgress from '../modules/shared/db/models/lessonProgress.js';
import fs from 'fs';
import AssessmentSubmission from '../modules/shared/db/models/assessmentSubmission.js';

const logError = (msg) => fs.appendFileSync('test_errors.txt', msg + '\n');

dotenv.config();

const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const runTest = async () => {
    await connectMongo();

    let testUserId = null;

    try {
        // 1. Create Test User
        const user = new User({
            fullName: 'Test User Personalization',
            email: `test_pers_${Date.now()}@example.com`,
            password: 'password123',
            topic: 'NEET',
            role: 'student'
        });
        await user.save();
        testUserId = user._id;
        console.log(`Created test user: ${testUserId}`);

        // 2. Test High Score Scenario
        console.log('\n--- Testing High Score Scenario ---');

        // Mastery: 90%
        try {
            await new TopicMastery({ userId: testUserId, subject: 'Physics', topic: 'Mechanics', masteryScore: 90, totalAttempts: 10, correctAttempts: 9 }).save();
            await new TopicMastery({ userId: testUserId, subject: 'Chemistry', topic: 'Organic', masteryScore: 90, totalAttempts: 10, correctAttempts: 9 }).save();
        } catch (e) { logError("TopicMastery Error: " + JSON.stringify(e, Object.getOwnPropertyNames(e))); }

        // Accuracy: 100% (Last 30 days)
        try {
            await new LearningAnalytics({ userId: testUserId, questionId: 1, subject: 'Physics', topic: 'Mechanics', difficulty: 'Medium', isCorrect: true, timeSpent: 60 }).save();
            await new LearningAnalytics({ userId: testUserId, questionId: 2, subject: 'Physics', topic: 'Mechanics', difficulty: 'Medium', isCorrect: true, timeSpent: 60 }).save();
        } catch (e) { logError("LearningAnalytics Error: " + JSON.stringify(e, Object.getOwnPropertyNames(e))); }

        // Classes: 50 lessons (100% score)
        try {
            const progressDocs = [];
            for (let i = 0; i < 50; i++) {
                progressDocs.push({ user: testUserId, lesson: new mongoose.Types.ObjectId().toString(), completed: true });
            }
            await LessonProgress.insertMany(progressDocs);
        } catch (e) { logError("LessonProgress Error: " + JSON.stringify(e, Object.getOwnPropertyNames(e))); }

        // Assessments: 90%
        try {
            await new AssessmentSubmission({
                user: testUserId,
                score: 90,
                passed: true,
                lesson: "lesson_test_1",
                answers: []
            }).save();
        } catch (e) { logError("AssessmentSubmission Error: " + JSON.stringify(e, Object.getOwnPropertyNames(e))); }
        // Actually checking AssessmentSubmission schema or usage in analytics-service to be sure 'score' is direct field.
        // In analytics-service: assessments.reduce((sum, a) => sum + a.score, 0)
        // So it expects 'score' field.

        const highScore = await calculateStudentScore(testUserId);
        console.log(`High Score Result: ${highScore}`);
        if (highScore > 80) console.log('PASS: Score is high as expected');
        else console.log('FAIL: Score should be high');

        // 3. Test Low Score Scenario
        console.log('\n--- Testing Low Score Scenario ---');
        // Clean up previous data
        await TopicMastery.deleteMany({ userId: testUserId });
        await LearningAnalytics.deleteMany({ userId: testUserId });
        await LessonProgress.deleteMany({ user: testUserId });
        await AssessmentSubmission.deleteMany({ user: testUserId });

        // Mastery: 20%
        await new TopicMastery({ userId: testUserId, subject: 'Physics', topic: 'Mechanics', masteryScore: 20, totalAttempts: 10, correctAttempts: 2 }).save();

        // Accuracy: 0%
        await new LearningAnalytics({ userId: testUserId, questionId: 1, subject: 'Physics', topic: 'Mechanics', difficulty: 'Easy', isCorrect: false, timeSpent: 60 }).save();

        // Classes: 0

        // Assessments: 20%
        await new AssessmentSubmission({
            user: testUserId,
            score: 20,
            passed: false,
            lesson: "lesson_test_1",
            answers: []
        }).save();

        const lowScore = await calculateStudentScore(testUserId);
        console.log(`Low Score Result: ${lowScore}`);
        if (lowScore < 40) console.log('PASS: Score is low as expected');
        else console.log('FAIL: Score should be low');

    } catch (error) {
        logError('Test failed: ' + JSON.stringify(error, Object.getOwnPropertyNames(error)));
        console.error('Test failed:', error);
    } finally {
        if (testUserId) {
            console.log('\nCleaning up...');
            await User.findByIdAndDelete(testUserId);
            await TopicMastery.deleteMany({ userId: testUserId });
            await LearningAnalytics.deleteMany({ userId: testUserId });
            await LessonProgress.deleteMany({ user: testUserId });
            await AssessmentSubmission.deleteMany({ user: testUserId });
            console.log('Cleanup complete');
        }
        await mongoose.disconnect();
    }
};

runTest();
