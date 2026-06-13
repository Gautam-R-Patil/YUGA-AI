/**
 * Spaced Repetition Algorithm (SM-2)
 * Optimizes review timing based on recall performance
 */

/**
 * Calculate next review date using SM-2 algorithm
 * @param {Object} masteryData - Current mastery record with easinessFactor, interval, repetitions
 * @param {Number} recallQuality - Quality of recall (0-5)
 * @returns {Object} - Updated { nextReviewDate, interval, easinessFactor, repetitions }
 */
export function calculateNextReview(masteryData, recallQuality) {
    let { easinessFactor, interval, repetitions } = masteryData;

    // Ensure defaults
    easinessFactor = easinessFactor || 2.5;
    interval = interval || 1;
    repetitions = repetitions || 0;

    // Update easiness factor based on recall quality
    // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const newEF = Math.max(1.3, easinessFactor + (0.1 - (5 - recallQuality) * (0.08 + (5 - recallQuality) * 0.02)));

    let newInterval;
    let newRepetitions;

    // If recall quality < 3, reset the learning process
    if (recallQuality < 3) {
        newInterval = 1;
        newRepetitions = 0;
    } else {
        newRepetitions = repetitions + 1;

        // Calculate new interval
        if (newRepetitions === 1) {
            newInterval = 1;
        } else if (newRepetitions === 2) {
            newInterval = 6;
        } else {
            newInterval = Math.round(interval * newEF);
        }
    }

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
        nextReviewDate,
        interval: newInterval,
        easinessFactor: newEF,
        repetitions: newRepetitions
    };
}

/**
 * Check if a topic is due for review
 * @param {Date} nextReviewDate - Scheduled review date
 * @returns {Boolean} - True if review is due
 */
export function isDueForReview(nextReviewDate) {
    if (!nextReviewDate) return true; // Never reviewed = due
    return new Date() >= new Date(nextReviewDate);
}

/**
 * Get priority score for spaced repetition
 * Higher score = more urgent to review
 * @param {Date} nextReviewDate - Scheduled review date
 * @param {Number} masteryScore - Current mastery (0-100)
 * @returns {Number} - Priority score (0-100)
 */
export function getReviewPriority(nextReviewDate, masteryScore) {
    if (!nextReviewDate) {
        return 100; // Never reviewed = highest priority
    }

    const now = new Date();
    const dueDate = new Date(nextReviewDate);
    const daysDifference = (now - dueDate) / (1000 * 60 * 60 * 24);

    // Overdue items get higher priority
    if (daysDifference > 0) {
        // 1 day overdue = +10, 2 days = +20, etc. (capped at +50)
        const overdueBonus = Math.min(daysDifference * 10, 50);
        return Math.min(100, 50 + overdueBonus);
    }

    // Items due soon (within 3 days) get moderate priority
    if (daysDifference > -3) {
        return 40;
    }

    // Items with low mastery should be reviewed more frequently
    if (masteryScore < 50) {
        return 30;
    }

    return 10; // Low priority for well-mastered, not-due topics
}
