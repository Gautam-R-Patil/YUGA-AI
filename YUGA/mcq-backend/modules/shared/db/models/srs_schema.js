import mongoose from "mongoose";

const srsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    subject: {
        type: String,
        required: true,
    },
    chapter: {
        type: String,
        required: true,
    },
    // Supermemo-2 Algorithm fields
    interval: {
        type: Number, // Interval in days
        default: 0,
    },
    repetition: {
        type: Number, // Number of successful reviews in a row
        default: 0,
    },
    easeFactor: {
        type: Number, // E-Factor (starts at 2.5)
        default: 2.5,
    },
    nextReviewDate: {
        type: Date,
        default: Date.now,
        index: true,
    },
    lastReviewedAt: {
        type: Date,
    },
}, { timestamps: true });

// Compound index to quickly find due items for a user
srsSchema.index({ userId: 1, nextReviewDate: 1 });
// Compound index to find a specific chapter for a user
srsSchema.index({ userId: 1, subject: 1, chapter: 1 }, { unique: true });

export const SRSItem = mongoose.model("SRSItem", srsSchema);
export default SRSItem;
