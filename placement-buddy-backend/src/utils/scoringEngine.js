/**
 * Scoring Engine - Phase 2.1
 * Hiring-grade scoring algorithms for technical interviews
 */

/**
 * Calculate Technical Round Score
 * Uses category-weighted scoring matching real hiring committees
 * @param {Array} questions - Array of evaluated questions
 * @returns {Object} - Total score and breakdown
 */
function calculateTechnicalScore(questions) {
    // Category weights (must sum to 1.0)
    const CATEGORY_WEIGHTS = {
        'Core CS': 0.25,      // 25%
        'DSA': 0.30,          // 30%
        'System Design': 0.25, // 25%
        'Framework': 0.10,    // 10%
        'Projects': 0.10      // 10%
    };

    // Group questions by category
    const categoryScores = {};
    const categoryCounts = {};

    questions.forEach(q => {
        if (q.aiEvaluation && q.aiEvaluation.score !== undefined) {
            const category = q.category;

            if (!categoryScores[category]) {
                categoryScores[category] = 0;
                categoryCounts[category] = 0;
            }

            categoryScores[category] += q.aiEvaluation.score;
            categoryCounts[category]++;
        }
    });

    // Calculate average score per category
    const categoryAverages = {};
    for (const category in categoryScores) {
        categoryAverages[category] = categoryScores[category] / categoryCounts[category];
    }

    // Calculate weighted total score
    let weightedSum = 0;
    let totalWeight = 0;

    for (const [category, weight] of Object.entries(CATEGORY_WEIGHTS)) {
        if (categoryAverages[category]) {
            const avgScore = categoryAverages[category];
            weightedSum += (avgScore * 10) * weight; // Convert 0-10 to 0-100 scale
            totalWeight += weight;
        }
    }

    // Normalize if not all categories were covered
    const finalScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

    // Calculate breakdown for each category
    const breakdown = {};
    for (const category in CATEGORY_WEIGHTS) {
        if (categoryAverages[category]) {
            breakdown[category] = Math.round(categoryAverages[category] * 10);
        } else {
            breakdown[category] = 0;
        }
    }

    return {
        totalScore: finalScore, // 0-100
        breakdown: {
            coreCS: breakdown['Core CS'] || 0,
            dsa: breakdown['DSA'] || 0,
            systemDesign: breakdown['System Design'] || 0,
            framework: breakdown['Framework'] || 0,
            projects: breakdown['Projects'] || 0
        },
        averageScore: finalScore / 10, // Convert back to 0-10 scale
        evaluatedQuestions: Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)
    };
}

/**
 * Determine if follow-up is warranted
 * @param {Number} score - Question score (0-10)
 * @returns {Boolean} - Whether to ask follow-up
 */
function shouldAskFollowUp(score) {
    return score < 7;
}

/**
 * Calculate overall interview progress
 * @param {Number} answeredQuestions - Number of answered questions
 * @param {Number} totalQuestions - Total questions in round
 * @returns {Object} - Progress metrics
 */
function calculateProgress(answeredQuestions, totalQuestions) {
    const progressPercentage = Math.round((answeredQuestions / totalQuestions) * 100);
    const remainingQuestions = totalQuestions - answeredQuestions;

    return {
        answeredQuestions,
        totalQuestions,
        remainingQuestions,
        progressPercentage,
        isComplete: answeredQuestions >= totalQuestions
    };
}

/**
 * Get performance level based on score
 * @param {Number} score - Score (0-100)
 * @returns {String} - Performance level
 */
function getPerformanceLevel(score) {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Satisfactory';
    if (score >= 40) return 'Below Average';
    return 'Poor';
}

/**
 * Generate hiring recommendation based on technical score
 * @param {Number} technicalScore - Technical round score (0-100)
 * @returns {Object} - Recommendation based on technical performance alone
 */
function generateTechnicalRecommendation(technicalScore) {
    if (technicalScore >= 80) {
        return {
            level: 'Strong Pass',
            message: 'Candidate demonstrated strong technical competency.',
            proceedToNextRound: true
        };
    } else if (technicalScore >= 65) {
        return {
            level: 'Pass',
            message: 'Candidate showed adequate technical skills.',
            proceedToNextRound: true
        };
    } else if (technicalScore >= 50) {
        return {
            level: 'Borderline',
            message: 'Candidate has gaps but shows potential.',
            proceedToNextRound: true
        };
    } else {
        return {
            level: 'Fail',
            message: 'Candidate needs significant improvement in technical skills.',
            proceedToNextRound: false
        };
    }
}

module.exports = {
    calculateTechnicalScore,
    shouldAskFollowUp,
    calculateProgress,
    getPerformanceLevel,
    generateTechnicalRecommendation
};
