import mongoose from "mongoose";

const topicMasterySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    subject: {
        type: String,
        required: true,
        enum: ["Biology", "Chemistry", "Physics", "Botany"],
    },
    topic: {
        type: String,
        required: true,
    },
    masteryScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    totalAttempts: {
        type: Number,
        default: 0,
    },
    correctAttempts: {
        type: Number,
        default: 0,
    },
    averageTimeSpent: {
        type: Number, // in seconds
        default: 0,
    },
    lastPracticedAt: {
        type: Date,
        default: null,
    },
    difficultyLevel: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        default: "Easy",
    },
    nextReviewDate: {
        type: Date,
        default: null,
    },
    // Spaced repetition variables (SM-2 algorithm)
    easinessFactor: {
        type: Number,
        default: 2.5,
        min: 1.3,
    },
    interval: {
        type: Number, // in days
        default: 1,
    },
    repetitions: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Unique constraint: one record per user-subject-topic combination
topicMasterySchema.index({ userId: 1, subject: 1, topic: 1 }, { unique: true });
topicMasterySchema.index({ userId: 1, masteryScore: 1 });
topicMasterySchema.index({ userId: 1, nextReviewDate: 1 });

const TopicMastery = mongoose.model("TopicMastery", topicMasterySchema);

export default TopicMastery;
