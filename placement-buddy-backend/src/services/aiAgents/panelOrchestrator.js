const openai = require('../../utils/openaiClient');
const logger = require('../../utils/logger');

/**
 * AI Panel Orchestrator - Phase 2
 * Manages Lead Engineer, Behavioral Judge, and Silent Scorer agents.
 */

// Agent Personas
const PERSONAS = {
    LEAD_ENGINEER: {
        role: "Lead Software Engineer at a Top-Tier Tech Company",
        focus: "Technical depth, optimization, edge cases, system scalability, and code cleanliness.",
        tone: "Professional, critical but fair, detail-oriented."
    },
    BEHAVIORAL_JUDGE: {
        role: "Senior HR Manager & Behavioral Specialist",
        focus: "Leadership principles, culture fit, communication, conflict resolution, and soft skills.",
        tone: "Observant, empathetic, focusing on 'how' things are said."
    },
    SILENT_SCORER: {
        role: "Data Analyst / Hiring Committee Scorer",
        focus: "Objective metric generation, integrity checking, and offer probability data.",
        tone: "Neutral, data-driven."
    }
};

/**
 * Executes a round of panel evaluation using specialized agents.
 * 
 * @param {Object} candidateResponse - The data from the user's interview response.
 * @param {Object} roundConfig - Configuration for the current round.
 */
exports.runPanelEvaluation = async (sessionId, candidateResponse, roundConfig) => {
    try {
        logger.info(`🚨 Orchestrating AI Panel for session: ${sessionId}`);

        // 1. Get Lead Engineer's Technical Critique
        const techCritique = await this.getAgentFeedback(
            PERSONAS.LEAD_ENGINEER,
            candidateResponse,
            "Critique the technical accuracy and optimization of this response."
        );

        // 2. Get Behavioral Judge's Soft Skill Assessment
        const softSkillAssessment = await this.getAgentFeedback(
            PERSONAS.BEHAVIORAL_JUDGE,
            candidateResponse,
            "Assess the candidate's leadership, communication style, and culture fit."
        );

        // 3. Get Silent Scorer's Structured Metrics
        const compositePrompt = `
            Technical Critique: ${techCritique}
            Behavioral Assessment: ${softSkillAssessment}
            Response: ${JSON.stringify(candidateResponse)}
        `;

        const structuredResult = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Cost-effective for multi-agent scoring
            messages: [
                { role: "system", content: `You are a ${PERSONAS.SILENT_SCORER.role}. ${PERSONAS.SILENT_SCORER.focus}` },
                { role: "user", content: `Based on the following panel feedback, generate a JSON scoring report:\n${compositePrompt}\n\nReturn ONLY a JSON object with: { scores: { technical: 0-100, behavioral: 0-100, softSkills: 0-100 }, decision: "Shortlisted" | "Rejected", feedback: "Summary string" }` }
            ],
            response_format: { type: "json_object" }
        });

        const panelReport = JSON.parse(structuredResult.choices[0].message.content);

        logger.info(`✅ AI Panel evaluation complete for ${sessionId}`);

        return {
            ...panelReport,
            agentLogs: {
                leadEngineer: techCritique,
                behavioralJudge: softSkillAssessment
            }
        };

    } catch (err) {
        logger.error('AI Panel Orchestration Failed:', err);
        throw err;
    }
};

exports.getAgentFeedback = async (persona, candidateData, specificTask) => {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: `You are a ${persona.role}. Focus: ${persona.focus}. Tone: ${persona.tone}` },
            { role: "user", content: `Task: ${specificTask}\nCandidate Response: ${JSON.stringify(candidateData)}` }
        ]
    });
    return response.choices[0].message.content;
};
