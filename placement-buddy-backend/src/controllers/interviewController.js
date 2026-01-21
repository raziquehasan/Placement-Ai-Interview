/**
 * Interview Controller - Phase 2.1
 * Handles multi-round AI interview operations
 */

const Interview = require('../models/Interview');
const HRRound = require('../models/HRRound');
const Resume = require('../models/Resume');
const interviewQueue = require('../queues/interviewQueue');
const {
    generateTechnicalQuestion,
    generateHRQuestion
} = require('../services/aiInterviewService');
const { compressResumeContext } = require('../prompts/technicalPrompts');
const { calculateProgress } = require('../utils/scoringEngine');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const logger = require('../utils/logger');

/**
 * Create New Interview - Phase 2.1
 * POST /api/v1/interviews
 */
const createInterview = async (req, res, next) => {
    try {
        const { resumeId, role, difficulty } = req.body;
        const userId = req.user._id;

        // Validate resume exists and is shortlisted (ATS >= 60)
        const resume = await Interview.validateResumeEligibility(resumeId);

        // Check resume belongs to user
        if (resume.userId.toString() !== userId.toString()) {
            return errorResponse(res, 403, 'Resume does not belong to you');
        }

        // Create interview
        const interview = await Interview.create({
            userId,
            resumeId,
            role,
            difficulty: difficulty || 'Medium',
            status: 'not_started'
        });

        logger.info(`✅ Interview created for user ${userId} - Role: ${role}`);

        return successResponse(res, 201, 'Interview created successfully', {
            interview: {
                id: interview._id,
                role: interview.role,
                difficulty: interview.difficulty,
                status: interview.status,
                createdAt: interview.createdAt
            }
        });

    } catch (error) {
        if (error.message.includes('Resume not shortlisted')) {
            return errorResponse(res, 403, error.message);
        }
        if (error.message.includes('Resume not found')) {
            return errorResponse(res, 404, error.message);
        }
        next(error);
    }
};

/**
 * Start Technical Round - Phase 2.1
 * POST /api/v1/interviews/:id/technical/start
 */
const startTechnicalRound = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Get interview
        const interview = await Interview.findById(id).populate('resumeId');
        if (!interview) {
            return errorResponse(res, 404, 'Interview not found');
        }

        // Verify ownership
        if (interview.userId.toString() !== userId.toString()) {
            return errorResponse(res, 403, 'Unauthorized');
        }

        // Check status
        if (interview.status !== 'not_started') {
            return errorResponse(res, 400, 'Interview already started');
        }

        // Compress resume context for AI
        const resumeContext = compressResumeContext(interview.resumeId);

        // Create Technical Round
        const technicalRound = await TechnicalRound.create({
            interviewId: interview._id,
            aiPersona: 'Senior Software Engineer',
            resumeContext,
            totalQuestions: 10,
            status: 'in_progress'
        });

        // Update interview status
        await interview.startTechnicalRound();
        interview.technicalRound = technicalRound._id;
        await interview.save();

        // Generate first question (synchronously for better UX)
        const categories = ['Core CS', 'DSA', 'System Design', 'Framework', 'Projects'];
        const firstCategory = categories[0]; // Start with Core CS

        const questionData = await generateTechnicalQuestion({
            resumeContext,
            role: interview.role,
            category: firstCategory,
            difficulty: interview.difficulty,
            questionNumber: 1
        });

        // Add question to round
        const firstQuestion = {
            questionId: 'q1',
            category: questionData.category,
            difficulty: questionData.difficulty,
            questionText: questionData.questionText,
            expectedAnswer: questionData.expectedAnswer,
            evaluationRubric: questionData.evaluationRubric
        };

        technicalRound.questions.push(firstQuestion);
        await technicalRound.save();

        logger.info(`✅ Technical round started for interview ${id}`);

        return successResponse(res, 200, 'Technical round started successfully', {
            roundId: technicalRound._id,
            totalQuestions: technicalRound.totalQuestions,
            aiPersona: technicalRound.aiPersona,
            firstQuestion: {
                questionId: firstQuestion.questionId,
                questionNumber: 1,
                category: firstQuestion.category,
                difficulty: firstQuestion.difficulty,
                questionText: firstQuestion.questionText
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Submit Answer - Phase 2.1
 * POST /api/v1/interviews/:id/technical/answer
 */
const submitAnswer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { questionId, answer, timeSpent } = req.body;
        const userId = req.user._id;

        // Get interview with technical round
        const interview = await Interview.findById(id).populate('technicalRound');
        if (!interview) {
            return errorResponse(res, 404, 'Interview not found');
        }

        // Verify ownership
        if (interview.userId.toString() !== userId.toString()) {
            return errorResponse(res, 403, 'Unauthorized');
        }

        const technicalRound = interview.technicalRound;
        if (!technicalRound) {
            return errorResponse(res, 400, 'Technical round not started');
        }

        // Find question
        const question = technicalRound.questions.find(q => q.questionId === questionId);
        if (!question) {
            return errorResponse(res, 404, 'Question not found');
        }

        // Save answer
        question.userAnswer = answer;
        question.answerTimestamp = new Date();
        question.timeSpent = timeSpent || 0;

        technicalRound.answeredQuestions += 1;
        await technicalRound.save();

        // Queue evaluation job (background)
        await interviewQueue.add('evaluate-answer', {
            roundId: technicalRound._id,
            questionId
        }, {
            priority: 1
        });

        logger.info(`Answer submitted for question ${questionId} - Queued for evaluation`);

        // Generate next question if not complete
        let nextQuestion = null;
        if (!technicalRound.isComplete()) {
            const nextQuestionNumber = technicalRound.getCurrentQuestionNumber();
            const categories = ['Core CS', 'DSA', 'System Design', 'Framework', 'Projects', 'Core CS', 'DSA', 'System Design', 'Framework', 'Projects'];
            const nextCategory = categories[nextQuestionNumber - 1] || 'Core CS';

            // Generate next question synchronously for instant response
            try {
                const questionData = await generateTechnicalQuestion({
                    resumeContext: technicalRound.resumeContext,
                    role: interview.role,
                    category: nextCategory,
                    difficulty: interview.difficulty,
                    questionNumber: nextQuestionNumber
                });

                const newQuestion = {
                    questionId: `q${nextQuestionNumber}`,
                    category: questionData.category,
                    difficulty: questionData.difficulty,
                    questionText: questionData.questionText,
                    expectedAnswer: questionData.expectedAnswer,
                    evaluationRubric: questionData.evaluationRubric
                };

                technicalRound.questions.push(newQuestion);
                await technicalRound.save();

                nextQuestion = {
                    questionId: newQuestion.questionId,
                    questionNumber: nextQuestionNumber,
                    category: newQuestion.category,
                    difficulty: newQuestion.difficulty,
                    questionText: newQuestion.questionText
                };

                logger.info(`Next question (${nextQuestionNumber}) generated`);
            } catch (error) {
                logger.error('Failed to generate next question:', error);
                // Don't fail the request - evaluation is more important
            }
        } else {
            // Round complete
            await technicalRound.completeRound();
            await interview.completeTechnicalRound();
            logger.info(`✅ Technical round completed for interview ${id}`);
        }

        return successResponse(res, 200, 'Answer submitted successfully', {
            questionId,
            submitted: true,
            evaluating: true,
            nextQuestion,
            progress: calculateProgress(technicalRound.answeredQuestions, technicalRound.totalQuestions)
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get Evaluation (Polling Endpoint) - Phase 2.1
 * GET /api/v1/interviews/:id/technical/evaluation/:questionId
 */
const getEvaluation = async (req, res, next) => {
    try {
        const { id, questionId } = req.params;
        const userId = req.user._id;

        // Get interview with technical round
        const interview = await Interview.findById(id).populate('technicalRound');
        if (!interview) {
            return errorResponse(res, 404, 'Interview not found');
        }

        // Verify ownership
        if (interview.userId.toString() !== userId.toString()) {
            return errorResponse(res, 403, 'Unauthorized');
        }

        const technicalRound = interview.technicalRound;
        if (!technicalRound) {
            return errorResponse(res, 400, 'Technical round not started');
        }

        // Find question
        const question = technicalRound.questions.find(q => q.questionId === questionId);
        if (!question) {
            return errorResponse(res, 404, 'Question not found');
        }

        // Check if evaluated
        if (!question.aiEvaluation || question.aiEvaluation.score === undefined) {
            return successResponse(res, 200, 'Evaluation in progress', {
                questionId,
                evaluated: false,
                status: 'processing'
            });
        }

        // Return evaluation
        return successResponse(res, 200, 'Evaluation complete', {
            questionId,
            evaluated: true,
            evaluation: {
                score: question.aiEvaluation.score,
                feedback: question.aiEvaluation.feedback,
                strengths: question.aiEvaluation.strengths,
                weaknesses: question.aiEvaluation.weaknesses,
                evaluatedAt: question.aiEvaluation.evaluatedAt
            },
            hasFollowUp: question.hasFollowUp,
            followUpQuestion: question.followUpQuestion
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Start HR Round - Phase 2.2
 * POST /api/v1/interviews/:id/hr/start
 */
const startHRRound = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const interview = await Interview.findById(id).populate('resumeId');
        if (!interview) return errorResponse(res, 404, 'Interview not found');
        if (interview.userId.toString() !== userId.toString()) return errorResponse(res, 403, 'Unauthorized');

        // Check if round 1 is completed
        if (interview.status !== 'round1_completed' && interview.status !== 'round2_inprogress') {
            return errorResponse(res, 400, 'Technical round must be completed first');
        }

        let hrRound;
        if (interview.hrRound) {
            hrRound = await HRRound.findById(interview.hrRound);
        }

        if (!hrRound) {
            const resumeContext = compressResumeContext(interview.resumeId);
            hrRound = await HRRound.create({
                interviewId: interview._id,
                aiPersona: 'Senior HR Manager',
                resumeContext,
                totalQuestions: 8,
                status: 'in_progress'
            });

            interview.hrRound = hrRound._id;
            interview.status = 'round2_inprogress';
            await interview.save();
        }

        // Generate first HR question if empty
        if (hrRound.questions.length === 0) {
            const questionData = await generateHRQuestion({
                resumeContext: hrRound.resumeContext,
                role: interview.role,
                category: 'Behavioral',
                questionNumber: 1,
                totalQuestions: 8
            });

            hrRound.questions.push({
                questionId: 'hr1',
                category: questionData.category,
                questionText: questionData.questionText,
                evaluationFocus: questionData.evaluationFocus
            });
            await hrRound.save();
        }

        const firstQuestion = hrRound.questions[0];

        return successResponse(res, 200, 'HR round started successfully', {
            roundId: hrRound._id,
            totalQuestions: hrRound.totalQuestions,
            aiPersona: hrRound.aiPersona,
            firstQuestion: {
                questionId: firstQuestion.questionId,
                questionNumber: 1,
                category: firstQuestion.category,
                questionText: firstQuestion.questionText
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Submit HR Answer - Phase 2.2
 */
const submitHRAnswer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { questionId, answer, timeSpent } = req.body;
        const userId = req.user._id;

        const interview = await Interview.findById(id).populate('hrRound');
        if (!interview || !interview.hrRound) return errorResponse(res, 404, 'Interview or HR round not found');
        if (interview.userId.toString() !== userId.toString()) return errorResponse(res, 403, 'Unauthorized');

        const hrRound = interview.hrRound;
        const question = hrRound.questions.find(q => q.questionId === questionId);
        if (!question) return errorResponse(res, 404, 'Question not found');

        question.userAnswer = answer;
        question.answerTimestamp = new Date();
        question.timeSpent = timeSpent || 0;
        hrRound.answeredQuestions += 1;
        await hrRound.save();

        // Queue evaluation
        await interviewQueue.add('evaluate-hr-answer', {
            roundId: hrRound._id,
            questionId
        });

        // Generate next question
        let nextQuestion = null;
        if (hrRound.answeredQuestions < hrRound.totalQuestions) {
            const nextNum = hrRound.answeredQuestions + 1;
            const categories = ['Behavioral', 'Situational', 'Teamwork', 'Leadership', 'Career Goals', 'Culture Fit', 'Behavioral', 'Behavioral'];
            const nextCategory = categories[nextNum - 1] || 'Behavioral';

            const questionData = await generateHRQuestion({
                resumeContext: hrRound.resumeContext,
                role: interview.role,
                category: nextCategory,
                questionNumber: nextNum,
                totalQuestions: 8
            });

            const newQ = {
                questionId: `hr${nextNum}`,
                category: questionData.category,
                questionText: questionData.questionText,
                evaluationFocus: questionData.evaluationFocus
            };

            hrRound.questions.push(newQ);
            await hrRound.save();

            nextQuestion = {
                questionId: newQ.questionId,
                questionNumber: nextNum,
                category: newQ.category,
                questionText: newQ.questionText
            };
        } else {
            hrRound.completeRound();
            await hrRound.save();
            interview.status = 'round2_completed';
            await interview.save();
        }

        return successResponse(res, 200, 'Answer submitted', {
            nextQuestion,
            progress: calculateProgress(hrRound.answeredQuestions, hrRound.totalQuestions)
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get HR Evaluation (Polling)
 */
const getHREvaluation = async (req, res, next) => {
    try {
        const { id, questionId } = req.params;
        const interview = await Interview.findById(id).populate('hrRound');
        if (!interview || !interview.hrRound) return errorResponse(res, 404, 'Not found');

        const question = interview.hrRound.questions.find(q => q.questionId === questionId);
        if (!question.aiEvaluation || !question.aiEvaluation.evaluatedAt) {
            return successResponse(res, 200, 'Evaluating...', { evaluated: false });
        }

        return successResponse(res, 200, 'Evaluated', {
            evaluated: true,
            evaluation: question.aiEvaluation,
            hasFollowUp: question.hasFollowUp,
            followUpQuestion: question.followUpQuestion
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get HR Round Status
 */
const getHRStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const interview = await Interview.findById(id).populate('hrRound');
        if (!interview || !interview.hrRound) return errorResponse(res, 404, 'Not found');

        const hrRound = interview.hrRound;
        return successResponse(res, 200, 'Status retrieved', {
            status: hrRound.status,
            progress: calculateProgress(hrRound.answeredQuestions, hrRound.totalQuestions),
            scores: {
                averageScore: hrRound.averageScore,
                totalScore: hrRound.totalScore,
                cultureFit: hrRound.cultureFit,
                communication: hrRound.communicationSkills
            },
            personalityTraits: hrRound.personalityTraits
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Technical Round Status - Phase 2.1
 * GET /api/v1/interviews/:id/technical/status
 */
const getTechnicalStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Get interview with technical round
        const interview = await Interview.findById(id).populate('technicalRound');
        if (!interview) {
            return errorResponse(res, 404, 'Interview not found');
        }

        // Verify ownership
        if (interview.userId.toString() !== userId.toString()) {
            return errorResponse(res, 403, 'Unauthorized');
        }

        const technicalRound = interview.technicalRound;
        if (!technicalRound) {
            return errorResponse(res, 400, 'Technical round not started');
        }

        // Calculate progress
        const progress = calculateProgress(
            technicalRound.answeredQuestions,
            technicalRound.totalQuestions
        );

        return successResponse(res, 200, 'Technical round status retrieved', {
            status: technicalRound.status,
            progress,
            scores: {
                averageScore: technicalRound.averageScore,
                totalScore: technicalRound.totalScore,
                breakdown: technicalRound.scoreBreakdown
            },
            evaluatedQuestions: technicalRound.evaluatedQuestions,
            startedAt: technicalRound.startedAt,
            duration: technicalRound.duration
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get Interview by ID (Legacy + Phase 2.1)
 * GET /api/v1/interviews/:id
 */
const getInterview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const interview = await Interview.findById(id)
            .populate('resumeId')
            .populate('technicalRound')
            .populate('hrRound')
            .populate('codingRound');

        if (!interview) {
            return errorResponse(res, 404, 'Interview not found');
        }

        // Verify ownership
        if (interview.userId.toString() !== userId.toString()) {
            return errorResponse(res, 403, 'Unauthorized');
        }

        return successResponse(res, 200, 'Interview retrieved successfully', { interview });

    } catch (error) {
        next(error);
    }
};

/**
 * Get Interview History
 * GET /api/v1/interviews
 */
const getInterviewHistory = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const interviews = await Interview.find({ userId })
            .sort({ createdAt: -1 })
            .select('role difficulty status overallScore hiringDecision createdAt startedAt completedAt')
            .limit(50);

        return successResponse(res, 200, 'Interview history retrieved successfully', { interviews });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createInterview,
    startTechnicalRound,
    submitAnswer,
    getEvaluation,
    getTechnicalStatus,
    startHRRound,
    submitHRAnswer,
    getHREvaluation,
    getHRStatus,
    getInterview,
    getInterviewHistory
};
