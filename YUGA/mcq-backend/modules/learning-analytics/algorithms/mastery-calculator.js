/**
 * Mastery Score Calculator
 * Calculates a 0-100 mastery score based on multiple performance factors
 */

/**
 * Calculate mastery score for a topic based on user attempts
 * @param {Array} attempts - Array of attempt objects with isCorrect, timeSpent, difficulty
 * @param {Object} topicStats - Current topic statistics (totalAttempts, correctAttempts, avgTime)
 * @returns {Number} - Mastery score (0-100)
 */
export function calculateMastery(attempts, topicStats) {
    if (!attempts || attempts.length === 0) {
        return 0;
    }

    // Factor 1: Accuracy (50% weight)
    const accuracy = topicStats.correctAttempts / topicStats.totalAttempts;
    const accuracyScore = accuracy * 50;

    // Factor 2: Consistency (20% weight)
    // Calculate standard deviation of recent results (last 10 attempts)
    const recentAttempts = attempts.slice(-10);
    const consistencyScore = calculateConsistency(recentAttempts) * 20;

    // Factor 3: Speed Score (15% weight)
    // Faster answers (relative to difficulty) = higher mastery
    const speedScore = calculateSpeedScore(attempts, topicStats.averageTimeSpent) * 15;

    // Factor 4: Difficulty Progression (15% weight)
    // Getting harder questions right = higher mastery
    const difficultyScore = calculateDifficultyProgression(attempts) * 15;

    const totalScore = accuracyScore + consistencyScore + speedScore + difficultyScore;

    return Math.min(Math.max(Math.round(totalScore), 0), 100);
}

/**
 * Calculate consistency score based on variance in recent performance
 */
function calculateConsistency(recentAttempts) {
    if (recentAttempts.length < 3) return 0.5; // Neutral score for insufficient data

    const results = recentAttempts.map(a => a.isCorrect ? 1 : 0);
    const mean = results.reduce((sum, val) => sum + val, 0) / results.length;

    const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length;
    const stdDev = Math.sqrt(variance);

    // Lower standard deviation = higher consistency
    // Map stdDev (0 to 0.5) to consistency score (1 to 0)
    return Math.max(0, 1 - (stdDev * 2));
}

/**
 * Calculate speed score - faster accurate answers indicate mastery
 */
function calculateSpeedScore(attempts, averageTime) {
    if (!averageTime || averageTime === 0) return 0.5;

    const recentAttempts = attempts.slice(-10);
    const correctAttempts = recentAttempts.filter(a => a.isCorrect);

    if (correctAttempts.length === 0) return 0;

    const avgCorrectTime = correctAttempts.reduce((sum, a) => sum + a.timeSpent, 0) / correctAttempts.length;

    // Benchmark: 60 seconds for medium difficulty
    const benchmark = 60;
    const speedRatio = benchmark / avgCorrectTime;

    // Cap at 1.0 to avoid overweighting extremely fast answers
    return Math.min(speedRatio, 1.0);
}

/**
 * Calculate difficulty progression score
 */
function calculateDifficultyProgression(attempts) {
    if (attempts.length < 5) return 0.5; // Neutral for insufficient data

    const difficultyMap = { Easy: 1, Medium: 2, Hard: 3 };

    // Calculate weighted accuracy by difficulty
    let totalWeight = 0;
    let weightedCorrect = 0;

    attempts.forEach(attempt => {
        const weight = difficultyMap[attempt.difficulty] || 2;
        totalWeight += weight;
        if (attempt.isCorrect) {
            weightedCorrect += weight;
        }
    });

    return weightedCorrect / totalWeight;
}

/**
 * Determine appropriate difficulty level based on current mastery
 */
export function getRecommendedDifficulty(masteryScore) {
    if (masteryScore < 40) return "Easy";
    if (masteryScore < 70) return "Medium";
    return "Hard";
}

/**
 * Calculate quality of recall for spaced repetition
 * Based on accuracy and response time
 */
export function calculateRecallQuality(isCorrect, timeSpent, difficulty) {
    const difficultyThresholds = {
        Easy: 30,
        Medium: 60,
        Hard: 120
    };

    const threshold = difficultyThresholds[difficulty] || 60;

    if (!isCorrect) return 2; // Failed recall

    // Perfect recall (fast and correct) = 5
    // Good recall (correct, reasonable time) = 4
    // Hesitant recall (correct, slow) = 3

    if (timeSpent < threshold * 0.5) return 5;
    if (timeSpent < threshold) return 4;
    return 3;
}
