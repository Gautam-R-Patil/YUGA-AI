/**
 * Adaptive Difficulty Adjuster
 * Dynamically adjusts question difficulty based on performance
 */

/**
 * Determine if difficulty should be adjusted based on recent performance
 * @param {Array} recentAttempts - Last N attempts for the topic
 * @param {String} currentDifficulty - Current difficulty level
 * @returns {String} - Recommended difficulty level
 */
export function adjustDifficulty(recentAttempts, currentDifficulty) {
    if (!recentAttempts || recentAttempts.length < 3) {
        return currentDifficulty; // Not enough data
    }

    // Look at last 5 attempts
    const relevantAttempts = recentAttempts.slice(-5);
    const correctCount = relevantAttempts.filter(a => a.isCorrect).length;
    const accuracy = correctCount / relevantAttempts.length;

    // Increase difficulty if consistently getting questions right (>80%)
    if (accuracy >= 0.8) {
        if (currentDifficulty === "Easy") return "Medium";
        if (currentDifficulty === "Medium") return "Hard";
        return "Hard"; // Already at max
    }

    // Decrease difficulty if struggling (<40%)
    if (accuracy < 0.4) {
        if (currentDifficulty === "Hard") return "Medium";
        if (currentDifficulty === "Medium") return "Easy";
        return "Easy"; // Already at min
    }

    // Maintain current difficulty if performance is moderate (40-80%)
    return currentDifficulty;
}

/**
 * Calculate optimal difficulty distribution for a practice session
 * @param {Number} masteryScore - Overall mastery score (0-100)
 * @param {Number} totalQuestions - Number of questions in session
 * @returns {Object} - Distribution { Easy: n, Medium: n, Hard: n }
 */
export function getDifficultyDistribution(masteryScore, totalQuestions) {
    let easyCount, mediumCount, hardCount;

    if (masteryScore < 30) {
        // Beginner: 60% Easy, 30% Medium, 10% Hard
        easyCount = Math.round(totalQuestions * 0.6);
        mediumCount = Math.round(totalQuestions * 0.3);
        hardCount = totalQuestions - easyCount - mediumCount;
    } else if (masteryScore < 60) {
        // Intermediate: 30% Easy, 50% Medium, 20% Hard
        easyCount = Math.round(totalQuestions * 0.3);
        mediumCount = Math.round(totalQuestions * 0.5);
        hardCount = totalQuestions - easyCount - mediumCount;
    } else {
        // Advanced: 10% Easy, 40% Medium, 50% Hard
        easyCount = Math.round(totalQuestions * 0.1);
        mediumCount = Math.round(totalQuestions * 0.4);
        hardCount = totalQuestions - easyCount - mediumCount;
    }

    return {
        Easy: easyCount,
        Medium: mediumCount,
        Hard: hardCount
    };
}

/**
 * Check if performance warrants a difficulty change
 * @param {Array} recentAttempts - Recent attempts
 * @returns {Object} - { shouldChange: Boolean, direction: 'up'|'down'|null, reason: String }
 */
export function evaluatePerformance(recentAttempts) {
    if (!recentAttempts || recentAttempts.length < 5) {
        return { shouldChange: false, direction: null, reason: "Insufficient data" };
    }

    const last5 = recentAttempts.slice(-5);
    const correctCount = last5.filter(a => a.isCorrect).length;
    const avgTime = last5.reduce((sum, a) => sum + a.timeSpent, 0) / last5.length;

    // Check for mastery (all correct + fast)
    if (correctCount === 5 && avgTime < 60) {
        return {
            shouldChange: true,
            direction: "up",
            reason: "Perfect accuracy with good speed - ready for harder challenges"
        };
    }

    // Check for struggle (mostly incorrect)
    if (correctCount <= 1) {
        return {
            shouldChange: true,
            direction: "down",
            reason: "Low accuracy - need to build stronger foundation"
        };
    }

    return { shouldChange: false, direction: null, reason: "Performance is appropriate" };
}
