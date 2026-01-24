const openai = require('../utils/openaiClient');
const logger = require('../utils/logger');

/**
 * AI Mentor Coach - Phase 2
 * Generates personalized improvement roadmaps based on simulation performance.
 */

exports.generateMentorPlan = async (session, company) => {
    try {
        logger.info(`🎓 Generating AI Mentor Plan for session: ${session._id}`);

        // Aggregate round metrics for context
        const metricsSummary = session.rounds.map(r => ({
            title: r.title,
            type: r.type,
            score: r.score,
            feedback: r.feedback
        }));

        const prompt = `
            You are a Senior Career Coach and Technical Mentor. 
            The candidate just completed a ${company.name} (${company.category}) hiring simulation.
            
            Performance Summary:
            ${JSON.stringify(metricsSummary)}
            
            Integrity Score: ${session.integrityScore}/100
            Overall Status: ${session.status}

            Task: Generate a detailed JSON mentor plan including:
            1. 'weakAreas': Top 3 topics to improve.
            2. 'drills': 3 specific coding/behavioral exercises.
            3. 'weeklyRoadmap': A 4-week study plan.
            4. 'targetCompanies': 3 other companies they might fit well based on this performance.
            5. 'summary': A motivational yet realistic summary.

            Response must be ONLY JSON.
        `;

        const result = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are an expert technical hiring mentor." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        const mentorPlan = JSON.parse(result.choices[0].message.content);

        logger.info(`✅ AI Mentor Plan generated for ${session._id}`);
        return mentorPlan;

    } catch (err) {
        logger.error('Mentor Plan Generation Failed:', err);
        return {
            summary: "Unable to generate plan at this moment. Please focus on your core DSA and communication basics.",
            weakAreas: ["General System Knowledge"]
        };
    }
};
