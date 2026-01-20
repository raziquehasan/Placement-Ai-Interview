/**
 * Feedback Service
 * Business logic for AI feedback generation
 */

const Feedback = require('../models/Feedback');
const Interview = require('../models/Interview');

/**
 * Generate AI feedback for interview
 * This is a placeholder - integrate with OpenAI/Gemini in production
 * @param {Object} interview - Interview data
 * @returns {Object} Feedback data
 */
const generateAIFeedback = async (interview) => {
    // Placeholder logic - replace with AI API call

    const { questions, answers } = interview;

    // Calculate basic scores
    const answerCount = answers.length;
    const questionCount = questions.length;
    const completionRate = (answerCount / questionCount) * 100;

    // Calculate average answer length
    const avgAnswerLength = answers.reduce((sum, ans) => sum + ans.answer.length, 0) / answerCount;

    // Simple scoring logic (replace with AI)
    const technicalScore = Math.min(100, Math.floor((avgAnswerLength / 100) * 70 + 30));
    const communicationScore = Math.min(100, Math.floor((avgAnswerLength / 80) * 60 + 40));
    const problemSolvingScore = Math.min(100, Math.floor(completionRate * 0.8));
    const confidenceScore = Math.min(100, Math.floor((avgAnswerLength / 120) * 75 + 25));

    const overallScore = Math.floor(
        (technicalScore + communicationScore + problemSolvingScore + confidenceScore) / 4
    );

    // Generate strengths and improvements
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

    if (technicalScore < 60) {
        improvements.push('Focus on improving technical knowledge');
    }

    if (communicationScore > 70) {
        strengths.push('Good communication skills demonstrated');
    }

    // TODO: Replace with AI API call
    // const aiFeedback = await callOpenAI(interview);

    return {
        overallScore,
        strengths,
        improvements,
        detailedFeedback: {
            technical: {
                score: technicalScore,
                comments: 'Technical knowledge assessment based on answer quality and depth.'
            },
            communication: {
                score: communicationScore,
                comments: 'Communication skills evaluated through answer clarity and structure.'
            },
            problemSolving: {
                score: problemSolvingScore,
                comments: 'Problem-solving ability assessed through question completion and approach.'
            },
            confidence: {
                score: confidenceScore,
                comments: 'Confidence level inferred from answer completeness and detail.'
            }
        }
    };
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
