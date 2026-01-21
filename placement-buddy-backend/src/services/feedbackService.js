/**
 * Feedback Service
 * Business logic for AI feedback generation
 */

const Feedback = require('../models/Feedback');
const Interview = require('../models/Interview');

/**
 * Generate AI feedback for interview using Gemini
 * @param {Object} interview - Interview data
 * @returns {Object} Feedback data
 */
const generateAIFeedback = async (interview) => {
    const model = require('../utils/geminiClient');
    const logger = require('../utils/logger');

    const { questions, answers } = interview;

    // Calculate basic scores for fallback
    const answerCount = answers.length;
    const questionCount = questions.length;
    const completionRate = (answerCount / questionCount) * 100;
    const avgAnswerLength = answers.reduce((sum, ans) => sum + ans.answer.length, 0) / answerCount;

    // Fallback scoring logic
    const fallbackScores = {
        technicalScore: Math.min(100, Math.floor((avgAnswerLength / 100) * 70 + 30)),
        communicationScore: Math.min(100, Math.floor((avgAnswerLength / 80) * 60 + 40)),
        problemSolvingScore: Math.min(100, Math.floor(completionRate * 0.8)),
        confidenceScore: Math.min(100, Math.floor((avgAnswerLength / 120) * 75 + 25))
    };

    const fallbackOverallScore = Math.floor(
        (fallbackScores.technicalScore + fallbackScores.communicationScore +
            fallbackScores.problemSolvingScore + fallbackScores.confidenceScore) / 4
    );

    try {
        // Prepare questions and answers for the prompt
        const qaText = questions.map((q, idx) => {
            const answer = answers.find(a => a.questionId === q.questionId);
            return `Question ${idx + 1} (${q.category}): ${q.question}\nAnswer: ${answer?.answer || 'No answer provided'}`;
        }).join('\n\n');

        // Create detailed prompt for Gemini
        const prompt = `You are an expert interview evaluator and career coach.

Evaluate the following interview performance:

${qaText}

Provide a comprehensive evaluation in the following JSON format (no markdown, no code blocks):
{
  "overallScore": <number 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "detailedFeedback": {
    "technical": {
      "score": <number 0-100>,
      "comments": "Detailed assessment of technical knowledge and skills"
    },
    "communication": {
      "score": <number 0-100>,
      "comments": "Evaluation of communication clarity and articulation"
    },
    "problemSolving": {
      "score": <number 0-100>,
      "comments": "Assessment of problem-solving approach and critical thinking"
    },
    "confidence": {
      "score": <number 0-100>,
      "comments": "Evaluation of confidence and presentation"
    }
  }
}

Provide constructive, specific, and actionable feedback. Focus on both what the candidate did well and areas for improvement.`;

        logger.info('🤖 Generating AI feedback with Gemini...');

        // Call Gemini AI
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let responseText = response.text();

        logger.info('✅ Received feedback response from Gemini AI');

        // Handle markdown-wrapped JSON (```json ... ```)
        if (responseText.includes('```json')) {
            responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        } else if (responseText.includes('```')) {
            responseText = responseText.replace(/```\n?/g, '').trim();
        }

        // Parse JSON response
        const aiFeedback = JSON.parse(responseText);

        // Validate response structure
        if (aiFeedback.overallScore !== undefined &&
            Array.isArray(aiFeedback.strengths) &&
            Array.isArray(aiFeedback.improvements) &&
            aiFeedback.detailedFeedback) {

            logger.info(`✅ Successfully generated AI feedback with score: ${aiFeedback.overallScore}`);
            return aiFeedback;
        } else {
            throw new Error('Invalid AI feedback structure');
        }

    } catch (error) {
        logger.error('❌ Error generating AI feedback:', error.message);
        logger.warn('⚠️ Falling back to placeholder feedback logic');

        // Fallback to placeholder logic
        const strengths = [];
        const improvements = [];

        if (completionRate === 100) {
            strengths.push('Completed all interview questions');
        }

        if (avgAnswerLength > 100) {
            strengths.push('Provided detailed and comprehensive answers');
        } else {
            improvements.push('Provide more detailed explanations in your answers');
        }

        if (fallbackScores.technicalScore < 60) {
            improvements.push('Focus on improving technical knowledge');
        }

        if (fallbackScores.communicationScore > 70) {
            strengths.push('Good communication skills demonstrated');
        }

        return {
            overallScore: fallbackOverallScore,
            strengths,
            improvements,
            detailedFeedback: {
                technical: {
                    score: fallbackScores.technicalScore,
                    comments: 'Technical knowledge assessment based on answer quality and depth.'
                },
                communication: {
                    score: fallbackScores.communicationScore,
                    comments: 'Communication skills evaluated through answer clarity and structure.'
                },
                problemSolving: {
                    score: fallbackScores.problemSolvingScore,
                    comments: 'Problem-solving ability assessed through question completion and approach.'
                },
                confidence: {
                    score: fallbackScores.confidenceScore,
                    comments: 'Confidence level inferred from answer completeness and detail.'
                }
            }
        };
    }
};

/**
 * Generate and save feedback for interview
 * @param {String} interviewId - Interview ID
 * @param {String} userId - User ID
 * @returns {Object} Feedback data
 */
const generateFeedback = async (interviewId, userId) => {
    // Get interview
    const interview = await Interview.findOne({ _id: interviewId, userId });

    if (!interview) {
        throw new Error('Interview not found');
    }

    if (interview.status !== 'completed') {
        throw new Error('Interview must be completed before generating feedback');
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ interviewId });
    if (existingFeedback) {
        return existingFeedback;
    }

    // Generate AI feedback
    const feedbackData = await generateAIFeedback(interview);

    // Save feedback
    const feedback = await Feedback.create({
        userId,
        interviewId,
        ...feedbackData
    });

    return feedback;
};

/**
 * Get feedback for an interview
 * @param {String} interviewId - Interview ID
 * @param {String} userId - User ID
 * @returns {Object} Feedback data
 */
const getFeedbackByInterview = async (interviewId, userId) => {
    const feedback = await Feedback.findOne({ interviewId, userId })
        .populate('interviewId', 'jobRole difficulty startedAt completedAt')
        .populate('userId', 'name email');

    if (!feedback) {
        throw new Error('Feedback not found');
    }

    return feedback;
};

module.exports = {
    generateAIFeedback,
    generateFeedback,
    getFeedbackByInterview
};
