/**
 * Interview Service
 * Business logic for interview generation and management
 */

const Interview = require('../models/Interview');
const Resume = require('../models/Resume');

/**
 * Generate AI interview questions
 * This is a placeholder - integrate with OpenAI/Gemini in production
 * @param {String} jobRole - Job role
 * @param {String} difficulty - Difficulty level
 * @param {Object} resumeData - Parsed resume data
 * @returns {Array} List of questions
 */
const generateQuestions = async (jobRole, difficulty, resumeData) => {
    // Placeholder questions - replace with AI API call
    const questionBank = {
        easy: [
            {
                questionId: 'q1',
                question: `Tell me about yourself and why you're interested in the ${jobRole} position.`,
                category: 'general',
                expectedAnswer: 'A brief introduction highlighting relevant experience and skills.'
            },
            {
                questionId: 'q2',
                question: 'What are your greatest strengths?',
                category: 'behavioral',
                expectedAnswer: 'Specific strengths relevant to the job role.'
            },
            {
                questionId: 'q3',
                question: `What do you know about ${jobRole} responsibilities?`,
                category: 'general',
                expectedAnswer: 'Understanding of the role and its requirements.'
            }
        ],
        medium: [
            {
                questionId: 'q1',
                question: `Describe a challenging project you worked on related to ${jobRole}.`,
                category: 'behavioral',
                expectedAnswer: 'Detailed project description with challenges and solutions.'
            },
            {
                questionId: 'q2',
                question: 'How do you handle tight deadlines and pressure?',
                category: 'situational',
                expectedAnswer: 'Examples of time management and stress handling.'
            },
            {
                questionId: 'q3',
                question: `What technical skills make you suitable for ${jobRole}?`,
                category: 'technical',
                expectedAnswer: 'Relevant technical skills with examples.'
            },
            {
                questionId: 'q4',
                question: 'Describe a time when you had to learn a new technology quickly.',
                category: 'behavioral',
                expectedAnswer: 'Learning ability and adaptability example.'
            }
        ],
        hard: [
            {
                questionId: 'q1',
                question: `Design a system architecture for a ${jobRole} project.`,
                category: 'technical',
                expectedAnswer: 'Detailed system design with scalability considerations.'
            },
            {
                questionId: 'q2',
                question: 'Explain a complex technical concept to a non-technical person.',
                category: 'communication',
                expectedAnswer: 'Clear explanation demonstrating communication skills.'
            },
            {
                questionId: 'q3',
                question: 'How would you optimize the performance of a slow application?',
                category: 'technical',
                expectedAnswer: 'Performance optimization strategies and techniques.'
            },
            {
                questionId: 'q4',
                question: 'Describe a situation where you had to make a difficult technical decision.',
                category: 'situational',
                expectedAnswer: 'Decision-making process and outcome.'
            },
            {
                questionId: 'q5',
                question: 'What are the latest trends in your field and how do you stay updated?',
                category: 'general',
                expectedAnswer: 'Industry awareness and continuous learning.'
            }
        ]
    };

    // TODO: Replace with AI API call
    // const aiQuestions = await callOpenAI(jobRole, difficulty, resumeData);

    return questionBank[difficulty] || questionBank.medium;
};

/**
 * Start a new interview
 * @param {String} userId - User ID
 * @param {String} resumeId - Resume ID
 * @param {String} jobRole - Job role
 * @param {String} difficulty - Difficulty level
 * @returns {Object} Interview data
 */
const startInterview = async (userId, resumeId, jobRole, difficulty = 'medium') => {
    // Verify resume exists and belongs to user
    const resume = await Resume.findOne({ _id: resumeId, userId });

    if (!resume) {
        throw new Error('Resume not found or does not belong to user');
    }

    // Generate questions
    const questions = await generateQuestions(jobRole, difficulty, resume.parsedData);

    // Create interview
    const interview = await Interview.create({
        userId,
        resumeId,
        jobRole,
        difficulty,
        questions,
        status: 'in-progress'
    });

    return interview;
};

/**
 * Submit answers for an interview
 * @param {String} interviewId - Interview ID
 * @param {String} userId - User ID
 * @param {Array} answers - User answers
 * @returns {Object} Updated interview
 */
const submitAnswers = async (interviewId, userId, answers) => {
    // Find interview
    const interview = await Interview.findOne({ _id: interviewId, userId });

    if (!interview) {
        throw new Error('Interview not found or does not belong to user');
    }

    if (interview.status === 'completed') {
        throw new Error('Interview already completed');
    }

    // Update answers
    interview.answers = answers;
    await interview.complete();

    return interview;
};

/**
 * Get interview by ID
 * @param {String} interviewId - Interview ID
 * @param {String} userId - User ID
 * @returns {Object} Interview data
 */
const getInterviewById = async (interviewId, userId) => {
    const interview = await Interview.findOne({ _id: interviewId, userId })
        .populate('resumeId', 'fileName parsedData')
        .populate('userId', 'name email');

    if (!interview) {
        throw new Error('Interview not found');
    }

    return interview;
};

/**
 * Get interview history for a user
 * @param {String} userId - User ID
 * @returns {Array} List of interviews
 */
const getInterviewHistory = async (userId) => {
    const interviews = await Interview.find({ userId })
        .populate('resumeId', 'fileName')
        .sort({ startedAt: -1 });

    return interviews;
};

module.exports = {
    generateQuestions,
    startInterview,
    submitAnswers,
    getInterviewById,
    getInterviewHistory
};
