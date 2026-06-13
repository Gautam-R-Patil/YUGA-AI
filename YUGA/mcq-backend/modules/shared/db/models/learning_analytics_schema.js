import mongoose from "mongoose";

const learningAnalyticsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    questionId: {
        type: Number,
        required: true,
    },
    subject: {
        type: String,
        required: true,
        enum: ["Chemistry", "Physics", "Botany", "Zoology"],
    },
    topic: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
        enum: ["Easy", "Medium", "Hard"],
    },
    isCorrect: {
        type: Boolean,
        required: true,
    },
    timeSpent: {
        type: Number, // in seconds
        required: true,
    },
    confidenceLevel: {
        type: Number,
        min: 1,
        max: 5,
        required: false,
    },
    hintUsed: {
        type: Boolean,
        default: false,
    },
    attemptedAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
}, {
    timestamps: true,
});

// Compound index for efficient queries
learningAnalyticsSchema.index({ userId: 1, subject: 1, topic: 1 });
learningAnalyticsSchema.index({ userId: 1, attemptedAt: -1 });

const LearningAnalytics = mongoose.model("LearningAnalytics", learningAnalyticsSchema);

export default LearningAnalytics;
