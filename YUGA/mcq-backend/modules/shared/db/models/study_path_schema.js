import mongoose from "mongoose";

const dailyRecommendationSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    estimatedTime: {
        type: Number, // in minutes
        required: true,
    },
    priority: {
        type: String,
        enum: ["High", "Medium", "Low"],
        default: "Medium",
    },
    reason: {
        type: String, // e.g., "Weak area", "Due for review", "Balanced practice"
    },
    completed: {
        type: Boolean,
        default: false,
    },
}, { _id: false });

const weeklyGoalSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    targetMasteryIncrease: {
        type: Number, // Expected mastery score increase
        default: 10,
    },
    priority: {
        type: Number, // 1-10, higher = more important
        default: 5,
    },
}, { _id: false });

const studyPathSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    generatedAt: {
        type: Date,
        default: Date.now,
    },
    weeklyGoals: [weeklyGoalSchema],
    dailyRecommendations: [dailyRecommendationSchema],
    focusAreas: [{
        subject: String,
        topic: String,
        currentMastery: Number,
        targetMastery: Number,
    }],
    strengthAreas: [{
        subject: String,
        topic: String,
        masteryScore: Number,
    }],
    estimatedCompletionDate: {
        type: Date,
        default: null,
    },
    targetExamDate: {
        type: Date,
        default: null,
    },
    adaptationReason: {
        type: String, // e.g., "Updated due to low performance in Genetics"
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

studyPathSchema.index({ userId: 1, isActive: 1 });
studyPathSchema.index({ userId: 1, generatedAt: -1 });

const StudyPath = mongoose.model("StudyPath", studyPathSchema);

export default StudyPath;
