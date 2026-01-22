/**
 * Interview Processor - Phase 2.1
 * Worker for processing AI interview jobs
 */

const { Worker } = require('bullmq');
const redisConnection = require('../../config/redis');
const TechnicalRound = require('../../models/TechnicalRound');
const HRRound = require('../../models/HRRound');
const {
    evaluateTechnicalAnswer,
    generateFollowUp,
    generateTechnicalQuestion,
    generateHRQuestion,
    evaluateHRAnswer
} = require('../../services/aiInterviewService');
const { shouldAskFollowUp } = require('../../utils/scoringEngine');
const logger = require('../../utils/logger');

/**
 * Process Answer Evaluation Job
 * Evaluates user answer with AI and generates follow-up if needed
 */
async function processAnswerEvaluation(job) {
    const { roundId, questionId } = job.data;

    try {
        logger.info(`[Job ${job.id}] Evaluating answer for question ${questionId}`);

        // Get the technical round
        const round = await TechnicalRound.findById(roundId);
        if (!round) {
            throw new Error('Technical round not found');
        }

        // Find the question
        const question = round.questions.find(q => q.questionId === questionId);
        if (!question) {
            throw new Error('Question not found');
        }

        // Evaluate the answer
        const evaluation = await evaluateTechnicalAnswer({
            question: question.questionText,
            expectedAnswer: question.expectedAnswer || '',
            userAnswer: question.userAnswer,
            rubric: question.evaluationRubric
        });

        // Update question with evaluation
        question.aiEvaluation = {
            score: evaluation.score,
            strengths: evaluation.strengths,
            weaknesses: evaluation.weaknesses,
            missingPoints: evaluation.missingPoints || [],
            feedback: evaluation.feedback,
            isPending: evaluation.isPending || false,
            evaluatedAt: new Date()
        };

        // Generate follow-up if score < 7 and not pending
        if (shouldAskFollowUp(evaluation.score) && evaluation.suggestedFollowUp && !evaluation.isPending) {
            question.hasFollowUp = true;
            question.followUpQuestion = evaluation.suggestedFollowUp;

            logger.info(`[Job ${job.id}] Follow-up generated for low score (${evaluation.score}/10)`);
        }

        // Update scores
        await round.updateScores();

        logger.info(`[Job ${job.id}] ✅ Evaluation complete - Score: ${evaluation.score}/10${evaluation.isPending ? ' (Pending)' : ''}`);

        return {
            questionId,
            score: evaluation.score,
            isPending: evaluation.isPending || false,
            hasFollowUp: question.hasFollowUp,
            followUpQuestion: question.followUpQuestion
        };

    } catch (error) {
        logger.error(`[Job ${job.id}] ❌ Failed to evaluate answer:`, error);

        // Don't retry on quota errors - they won't resolve with retries
        if (error.message.includes('quota') || error.message.includes('rate limit')) {
            logger.warn(`[Job ${job.id}] Quota/rate limit error - marking as complete to prevent retries`);
            // Job will be marked as failed but won't retry
            throw new Error('QUOTA_EXHAUSTED: ' + error.message);
        }

        throw error;
    }
}

/**
 * Process Question Generation Job
 * Generates next AI question based on resume and context
 */
async function processQuestionGeneration(job) {
    const { roundId, category, difficulty, questionNumber } = job.data;

    try {
        logger.info(`[Job ${job.id}] Generating question ${questionNumber} - ${category}/${difficulty}`);

        // Get the technical round
        const round = await TechnicalRound.findById(roundId).populate('interviewId');
        if (!round) {
            throw new Error('Technical round not found');
        }

        // Get previously asked questions to avoid repetition
        const previousQuestions = round.questions.map(q => q.questionText);

        logger.info(`[Job ${job.id}] Previous questions count: ${previousQuestions.length}`);

        // Generate question with context
        const questionData = await generateTechnicalQuestion({
            resumeContext: round.resumeContext,
            role: round.interviewId.role,
            category,
            difficulty,
            questionNumber,
            previousQuestions  // ✅ Pass previous questions to avoid repetition
        });

        // Add question to round
        const newQuestion = {
            questionId: `q${questionNumber}`,
            category: questionData.category,
            difficulty: questionData.difficulty,
            questionText: questionData.questionText,
            expectedAnswer: questionData.expectedAnswer,
            evaluationRubric: questionData.evaluationRubric
        };

        round.questions.push(newQuestion);
        await round.save();

        logger.info(`[Job ${job.id}] ✅ Question ${questionNumber} generated - Category: ${questionData.category}`);

        return {
            questionId: newQuestion.questionId,
            questionText: newQuestion.questionText,
            category: newQuestion.category,
            difficulty: newQuestion.difficulty
        };

    } catch (error) {
        logger.error(`[Job ${job.id}] ❌ Failed to generate question:`, error);
        throw error;
    }
}

/**
 * Process HR Answer Evaluation Job
 */
async function processHRAnswerEvaluation(job) {
    const { roundId, questionId } = job.data;

    try {
        logger.info(`[Job ${job.id}] Evaluating HR answer for question ${questionId}`);

        const round = await HRRound.findById(roundId);
        if (!round) throw new Error('HR round not found');

        const question = round.questions.find(q => q.questionId === questionId);
        if (!question) throw new Error('Question not found');

        // Evaluate the answer
        const evaluation = await evaluateHRAnswer({
            question: question.questionText,
            evaluationFocus: question.evaluationFocus || [],
            userAnswer: question.userAnswer
        });

        // Update question with evaluation
        question.aiEvaluation = {
            score: evaluation.score,
            confidence: evaluation.confidence,
            clarity: evaluation.clarity,
            relevance: evaluation.relevance,
            authenticity: evaluation.authenticity,
            feedback: evaluation.feedback,
            evaluatedAt: new Date()
        };

        // Generate follow-up if score < 7
        if (evaluation.suggestedFollowUp) {
            question.hasFollowUp = true;
            question.followUpQuestion = evaluation.suggestedFollowUp;
        }

        // Update scores
        await round.calculateScores();
        await round.save();

        logger.info(`[Job ${job.id}] ✅ HR Evaluation complete - Score: ${evaluation.score}/10`);

        return {
            questionId,
            score: evaluation.score,
            hasFollowUp: question.hasFollowUp
        };

    } catch (error) {
        logger.error(`[Job ${job.id}] ❌ Failed to evaluate HR answer:`, error);
        throw error;
    }
}

/**
 * Process HR Question Generation Job
 */
async function processHRQuestionGeneration(job) {
    const { roundId, category, questionNumber, totalQuestions } = job.data;

    try {
        logger.info(`[Job ${job.id}] Generating HR question ${questionNumber} - ${category}`);

        const round = await HRRound.findById(roundId).populate('interviewId');
        if (!round) throw new Error('HR round not found');

        // Generate question
        const questionData = await generateHRQuestion({
            resumeContext: round.resumeContext,
            role: round.interviewId.role,
            category,
            questionNumber,
            totalQuestions
        });

        // Add question to round
        const newQuestion = {
            questionId: `hr${questionNumber}`,
            category: questionData.category,
            questionText: questionData.questionText,
            evaluationFocus: questionData.evaluationFocus
        };

        round.questions.push(newQuestion);
        await round.save();

        logger.info(`[Job ${job.id}] ✅ HR Question ${questionNumber} generated`);

        return {
            questionId: newQuestion.questionId,
            questionText: newQuestion.questionText,
            category: newQuestion.category
        };

    } catch (error) {
        logger.error(`[Job ${job.id}] ❌ Failed to generate HR question:`, error);
        throw error;
    }
}

/**
 * Process Code Execution and Review Job
 * Executes test cases and performs AI code review
 */
async function processCodeExecution(job) {
    const { roundId, code, language } = job.data;

    try {
        logger.info(`[Job ${job.id}] Executing ${language} code for round ${roundId}`);

        const CodingRound = require('../../models/CodingRound');
        const judge0Client = require('../../utils/judge0Client');
        const { reviewCode } = require('../../services/aiInterviewService');

        // Get coding round
        const codingRound = await CodingRound.findById(roundId);
        if (!codingRound) {
            throw new Error('Coding round not found');
        }

        codingRound.status = 'evaluating';
        await codingRound.save();

        // Combine sample and hidden test cases
        const allTestCases = [
            ...codingRound.problem.sampleTestCases,
            ...codingRound.problem.hiddenTestCases
        ];

        logger.info(`[Job ${job.id}] Running ${allTestCases.length} test cases...`);

        // Execute all test cases
        const testResults = await judge0Client.executeTestCases({
            code,
            language,
            testCases: allTestCases
        });

        // Calculate test pass rate
        const passedTests = testResults.filter(r => r.passed).length;
        const totalTests = testResults.length;
        const testPassRate = (passedTests / totalTests) * 100;

        // Save test results
        codingRound.testResults = {
            totalTests,
            passedTests,
            failedTests: totalTests - passedTests,
            testPassRate,
            results: testResults,
            executedAt: new Date()
        };

        await codingRound.save();

        logger.info(`[Job ${job.id}] Test execution complete: ${passedTests}/${totalTests} passed (${testPassRate}%)`);

        // Perform AI code review
        logger.info(`[Job ${job.id}] Starting AI code review...`);

        const codeReview = await reviewCode({
            problem: codingRound.problem,
            code,
            language,
            testResults: {
                totalTests,
                passedTests,
                testPassRate,
                results: testResults
            }
        });

        // Save code review
        codingRound.codeReview = {
            correctness: codeReview.correctness,
            efficiency: codeReview.efficiency,
            readability: codeReview.readability,
            edgeCases: codeReview.edgeCases,
            timeComplexity: codeReview.timeComplexity,
            spaceComplexity: codeReview.spaceComplexity,
            strengths: codeReview.strengths,
            improvements: codeReview.improvements,
            bugs: codeReview.bugs || [],
            feedback: codeReview.feedback,
            overallScore: codeReview.overallScore,
            reviewedAt: new Date()
        };

        // Calculate final score and complete round
        codingRound.calculateFinalScore();
        codingRound.completeRound();
        await codingRound.save();

        logger.info(`[Job ${job.id}] ✅ Code evaluation complete - Final Score: ${codingRound.finalScore}/100`);

        return {
            testPassRate,
            codeQualityScore: codeReview.overallScore,
            finalScore: codingRound.finalScore
        };

    } catch (error) {
        logger.error(`[Job ${job.id}] ❌ Failed to execute code:`, error);

        // Update status to failed
        try {
            const CodingRound = require('../../models/CodingRound');
            const codingRound = await CodingRound.findById(roundId);
            if (codingRound) {
                codingRound.status = 'completed';
                codingRound.testResults = {
                    totalTests: 0,
                    passedTests: 0,
                    failedTests: 0,
                    testPassRate: 0,
                    results: [],
                    executedAt: new Date()
                };
                await codingRound.save();
            }
        } catch (updateError) {
            logger.error('Failed to update coding round status:', updateError);
        }

        throw error;
    }
}

// Create Interview Worker
const interviewWorker = new Worker('interview-processing', async (job) => {
    logger.info(`[Worker] Processing job ${job.id} - Type: ${job.name}`);

    switch (job.name) {
        case 'evaluate-answer':
            return await processAnswerEvaluation(job);

        case 'generate-question':
            return await processQuestionGeneration(job);

        case 'evaluate-hr-answer':
            return await processHRAnswerEvaluation(job);

        case 'generate-hr-question':
            return await processHRQuestionGeneration(job);

        case 'execute-code-tests':
            return await processCodeExecution(job);

        default:
            throw new Error(`Unknown job type: ${job.name}`);
    }
}, {
    connection: redisConnection,
    concurrency: 50, // Process up to 50 jobs concurrently
    limiter: {
        max: 100, // Max 100 jobs
        duration: 60000 // per 60 seconds
    }
});

// Worker event listeners
interviewWorker.on('completed', (job, result) => {
    logger.info(`[Worker] ✅ Job ${job.id} completed successfully`);
});

interviewWorker.on('failed', (job, err) => {
    logger.error(`[Worker] ❌ Job ${job.id} failed:`, err.message);
});

interviewWorker.on('error', (err) => {
    logger.error(`[Worker] ❌ Worker error:`, err);
});

logger.info('👷 Interview Worker started with concurrency: 50');

module.exports = interviewWorker;
