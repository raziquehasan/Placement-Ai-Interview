const logger = require('../utils/logger');

/**
 * Offer Probability Engine - Phase 2
 * Normalizes scores across company tiers and calculates final hiring chance.
 */

const TIER_WEIGHTS = {
    'Tech-Giant': 0.7, // Hardest to get 90%
    'Startup': 0.85,
    'Unicorn': 0.8,
    'Service-Based': 1.0 // Standard baseline
};

exports.calculateProbability = async (session, company) => {
    try {
        logger.info(`🧮 Calculating offer probability for session: ${session._id}`);

        // 1. Calculate Average Score from all non-skipped rounds
        const completedRounds = session.rounds.filter(r => r.status === 'Completed');
        if (completedRounds.length === 0) return { value: 0, breakdown: {} };

        const avgScore = completedRounds.reduce((acc, r) => acc + (r.score || 0), 0) / completedRounds.length;

        // 2. Normalize based on Company Tier
        const tierFactor = TIER_WEIGHTS[company.category] || 1.0;
        const normalizedScore = avgScore * tierFactor;

        // 3. Weightage Components 
        // We use weights from company blueprint if available, else defaults
        const weights = company.weightage || { dsa: 40, design: 20, culture: 20, softSkills: 20 };

        // 4. Integrity Correction
        const integrityPenalty = (100 - (session.integrityScore || 100)) * 2;

        // 5. Final Calculation
        let finalProb = normalizedScore - integrityPenalty;

        // Ensure bounds 0-100
        finalProb = Math.max(0, Math.min(100, Math.round(finalProb)));

        const breakdown = {
            rawAverage: Math.round(avgScore),
            normalized: Math.round(normalizedScore),
            integrityPenalty: Math.round(integrityPenalty),
            tierAdjustment: company.category
        };

        const explanation = `Based on a ${company.category} difficulty curve, your normalized score is ${breakdown.normalized}%. ${integrityPenalty > 0 ? `A penalty of ${integrityPenalty}% was applied due to integrity alerts.` : ''}`;

        return {
            value: finalProb,
            breakdown,
            explanation
        };

    } catch (err) {
        logger.error('Probability Calculation Failed:', err);
        return { value: 0, breakdown: {}, explanation: 'Error during calculation' };
    }
};
