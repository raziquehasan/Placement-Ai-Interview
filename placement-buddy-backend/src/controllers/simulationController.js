const Company = require('../models/Company');
const SimulationPipeline = require('../models/SimulationPipeline');
const SimulationSession = require('../models/SimulationSession');
const AuditLog = require('../models/SimulationAuditLog');
const simulationQueue = require('../queues/simulationQueue');
const logger = require('../utils/logger');
const panelOrchestrator = require('../services/aiAgents/panelOrchestrator');
const probabilityEngine = require('../services/probabilityEngine');
const mentorService = require('../services/mentorService');

/**
 * @desc    Generate final simulation insights (Offer Prob + Mentor Plan)
 * @route   POST /api/v1/simulation/session/:id/finalize
 */
exports.finalizeSimulation = async (req, res) => {
    try {
        const session = await SimulationSession.findById(req.params.id).populate('pipelineId');
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        const company = await Company.findById(session.pipelineId.companyId);

        // 1. Calculate Final Offer Probability
        const probability = await probabilityEngine.calculateProbability(session, company);
        session.offerProbability = probability;

        // 2. Generate AI Mentor Plan
        const mentorPlan = await mentorService.generateMentorPlan(session, company);
        session.mentorPlan = mentorPlan;

        session.status = session.status === 'Active' ? 'Completed' : session.status;
        await session.save();

        // 3. Audit Log
        await AuditLog.create({
            sessionId: session._id,
            userId: req.user.id,
            action: 'DECISION_MADE',
            details: { probability: probability.value, decision: session.status }
        });

        res.status(200).json({
            success: true,
            data: {
                probability,
                mentorPlan,
                status: session.status
            }
        });

    } catch (err) {
        logger.error('Error finalizing simulation:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get dashboard metrics for recruiter
 * @route   GET /api/v1/simulation/admin/dashboard
 */
exports.getRecruiterDashboard = async (req, res) => {
    try {
        const totalSessions = await SimulationSession.countDocuments();
        const completedSessions = await SimulationSession.countDocuments({ status: 'Completed' });
        const recentActivity = await AuditLog.find()
            .sort({ timestamp: -1 })
            .limit(10)
            .populate('userId', 'name email');

        // Aggregated distribution (Example)
        const stats = await SimulationSession.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                metrics: { total: totalSessions, completed: completedSessions },
                stats,
                recentActivity
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Start a Panel/Tech round (Fetch configuration)
 * @route   POST /api/v1/simulation/session/:id/panel/start
 */
exports.startPanelRound = async (req, res) => {
    try {
        const session = await SimulationSession.findById(req.params.id);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        const pipeline = await SimulationPipeline.findById(session.pipelineId);
        const currentRound = session.rounds[session.currentRoundIndex];

        // 1. Verify this is a valid interview round
        const roundTemplate = pipeline.rounds.find(r => r._id.toString() === currentRound.roundTemplateId.toString());
        if (!['Technical', 'SystemDesign', 'HR', 'Panel'].includes(roundTemplate.type)) {
            return res.status(400).json({ success: false, message: 'Current round is not an interview round' });
        }

        // 2. Update status
        currentRound.status = 'In-Progress';
        currentRound.startedAt = new Date();
        await session.save();

        // 3. Audit Log
        await AuditLog.create({
            sessionId: session._id,
            userId: req.user.id,
            action: 'ROUND_STARTED',
            details: { roundType: roundTemplate.type, title: roundTemplate.title }
        });

        res.status(200).json({
            success: true,
            data: {
                roundInfo: {
                    type: roundTemplate.type,
                    title: roundTemplate.title,
                    config: roundTemplate.config
                }
            }
        });

    } catch (err) {
        logger.error('Error starting panel round:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Submit Panel interview round response for AI evaluation
 * @route   POST /api/v1/simulation/session/:id/panel/submit
 */
exports.submitPanelRound = async (req, res) => {
    try {
        const { response } = req.body; // { question, answer, code, videoUrl }
        const session = await SimulationSession.findById(req.params.id);
        const currentRound = session.rounds[session.currentRoundIndex];

        if (!currentRound || currentRound.status === 'Completed') {
            return res.status(400).json({ success: false, message: 'Round invalid or already submitted' });
        }

        const pipeline = await SimulationPipeline.findById(session.pipelineId);
        const roundTemplate = pipeline.rounds.find(r => r._id.toString() === currentRound.roundTemplateId.toString());

        // 1. Run AI Panel Evaluation (Multi-Agent)
        logger.info(`🎤 Running Multi-Agent Panel for Round: ${roundTemplate.title}`);

        const evaluation = await panelOrchestrator.runPanelEvaluation(
            session._id,
            response,
            roundTemplate.config
        );

        // 2. Map Results to Session
        const isPassed = evaluation.decision === 'Shortlisted';
        const scorePercentage = (evaluation.scores.technical + evaluation.scores.behavioral + evaluation.scores.softSkills) / 3;

        currentRound.status = isPassed ? 'Completed' : 'Failed';
        currentRound.score = scorePercentage;
        currentRound.metrics = {
            scores: evaluation.scores,
            agentLogs: evaluation.agentLogs,
            decision: evaluation.decision,
            candidateResponse: response
        };
        currentRound.feedback = evaluation.feedback;
        currentRound.completedAt = new Date();

        if (isPassed) {
            session.currentRoundIndex += 1;
            if (session.currentRoundIndex >= session.rounds.length) {
                session.status = 'Completed';
            }
        } else {
            session.status = 'Rejected';
        }

        await session.save();

        // 3. Audit Log
        await AuditLog.create({
            sessionId: session._id,
            userId: req.user.id,
            action: isPassed ? 'SHORTLISTED' : 'REJECTED',
            details: {
                roundType: roundTemplate.type,
                score: scorePercentage,
                agents: ['LeadEngineer', 'BehavioralJudge', 'SilentScorer']
            }
        });

        // 4. Trigger Async Video Processing if enabled
        const company = await Company.findById(pipeline.companyId);
        if (response.videoUrl && company.featureFlags.enableVideo) {
            await simulationQueue.add('video-analysis', {
                sessionId: session._id,
                userId: req.user.id,
                type: 'VIDEO_ANALYSIS_REQUEST',
                details: { videoUrl: response.videoUrl, roundIndex: session.currentRoundIndex - 1 }
            });
        }

        res.status(200).json({
            success: true,
            data: {
                evaluation,
                passed: isPassed,
                nextRound: isPassed ? session.currentRoundIndex : null
            }
        });

    } catch (err) {
        logger.error('Error submitting Panel round:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get all active companies with their pipelines
 * @route   GET /api/v1/simulation/companies
 */
exports.getCompanies = async (req, res) => {
    try {
        const companies = await Company.find({ isActive: true });
        res.status(200).json({
            success: true,
            count: companies.length,
            data: companies
        });
    } catch (err) {
        logger.error('Error fetching companies:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Start a new simulation session
 * @route   POST /api/v1/simulation/start
 */
exports.startSession = async (req, res) => {
    try {
        const { companyId, mode, difficultyScale } = req.body;

        // 1. Fetch Pipeline
        const pipeline = await SimulationPipeline.findOne({
            companyId,
            difficultyScale: difficultyScale || 'Entry',
            isActive: true
        });

        if (!pipeline) {
            return res.status(404).json({ success: false, message: 'No active pipeline found for this company' });
        }

        // 2. check Attempt Policy if Realistic mode
        if (mode === 'Realistic') {
            const company = await Company.findById(companyId);
            const previousSessions = await SimulationSession.countDocuments({
                userId: req.user.id,
                pipelineId: pipeline._id,
                mode: 'Realistic',
                createdAt: { $gte: new Date(Date.now() - company.attemptPolicy.cooldownDays * 24 * 60 * 60 * 1000) }
            });

            if (previousSessions >= company.attemptPolicy.maxAttempts) {
                return res.status(403).json({
                    success: false,
                    message: `Max attempts reached. Cooldown is ${company.attemptPolicy.cooldownDays} days.`
                });
            }
        }

        // 3. Initialize Session
        const sessionRounds = pipeline.rounds.map(r => ({
            roundTemplateId: r._id,
            status: 'Pending',
            score: 0
        }));

        const session = await SimulationSession.create({
            userId: req.user.id,
            pipelineId: pipeline._id,
            mode: mode || 'Practice',
            rounds: sessionRounds,
            currentRoundIndex: 0
        });

        // 4. Create Audit Log
        await AuditLog.create({
            sessionId: session._id,
            userId: req.user.id,
            action: 'SESSION_STARTED',
            details: { mode, pipelineId: pipeline._id, version: pipeline.version }
        });

        res.status(201).json({
            success: true,
            data: session
        });

    } catch (err) {
        logger.error('Error starting simulation:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const Question = require('../models/Question');

/**
 * @desc    Get session details
 * @route   GET /api/v1/simulation/session/:id
 */
exports.getSession = async (req, res) => {
    try {
        const session = await SimulationSession.findById(req.params.id)
            .populate('pipelineId');

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        res.status(200).json({ success: true, data: session });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Start an OA round (Fetch questions)
 * @route   POST /api/v1/simulation/session/:id/oa/start
 */
exports.startOA = async (req, res) => {
    try {
        const session = await SimulationSession.findById(req.params.id);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        const pipeline = await SimulationPipeline.findById(session.pipelineId);
        const currentRound = session.rounds[session.currentRoundIndex];

        // 1. Verify this is an OA round and feature flag is enabled
        const roundTemplate = pipeline.rounds.find(r => r._id.toString() === currentRound.roundTemplateId.toString());
        if (roundTemplate.type !== 'OA') {
            return res.status(400).json({ success: false, message: 'Current round is not an OA' });
        }

        const company = await Company.findById(pipeline.companyId);
        if (company && !company.featureFlags.enableOA) {
            return res.status(403).json({ success: false, message: 'OA is currently disabled for this company.' });
        }

        // 2. Fetch Questions based on config
        const categories = roundTemplate.config?.get('categories') || ['Aptitude', 'Logic'];
        const limitPerCategory = roundTemplate.config?.get('limitPerCategory') || 5;

        let questions = [];
        for (const cat of categories) {
            const catQuestions = await Question.find({ category: cat, isActive: true })
                .limit(limitPerCategory)
                .select('-correctOption -explanation'); // Hide answers
            questions = [...questions, ...catQuestions];
        }

        // 3. Update Session Round Status
        currentRound.status = 'In-Progress';
        currentRound.startedAt = new Date();
        await session.save();

        // 4. Audit Log
        await AuditLog.create({
            sessionId: session._id,
            userId: req.user.id,
            action: 'ROUND_STARTED',
            details: { roundType: 'OA', questionCount: questions.length }
        });

        res.status(200).json({
            success: true,
            data: {
                questions,
                timerSeconds: roundTemplate.config?.get('timerSeconds') || 1800 // 30 mins default
            }
        });

    } catch (err) {
        logger.error('Error starting OA:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Submit OA answers for scoring
 * @route   POST /api/v1/simulation/session/:id/oa/submit
 */
exports.submitOA = async (req, res) => {
    try {
        const { answers } = req.body; // Array of { questionId, selectedOptionId }
        const session = await SimulationSession.findById(req.params.id);
        const currentRound = session.rounds[session.currentRoundIndex];

        if (currentRound.status === 'Completed') {
            return res.status(400).json({ success: false, message: 'Round already submitted' });
        }

        // 1. Calculate Score (Server-side validation)
        let correctCount = 0;
        const resultDetails = [];

        for (const ans of answers) {
            const question = await Question.findById(ans.questionId);
            if (!question) continue;

            const isCorrect = question.correctOption === ans.selectedOptionId;
            if (isCorrect) correctCount++;

            resultDetails.push({
                questionId: ans.questionId,
                category: question.category,
                selected: ans.selectedOptionId,
                correct: question.correctOption,
                isCorrect
            });
        }

        const totalQuestions = answers.length || 1;
        const scorePercentage = (correctCount / totalQuestions) * 100;

        // 2. Determine Shortlist Status
        const pipeline = await SimulationPipeline.findById(session.pipelineId);
        const roundTemplate = pipeline.rounds.find(r => r._id.toString() === currentRound.roundTemplateId.toString());
        const isPassed = scorePercentage >= roundTemplate.shortlistThreshold;

        // 3. Update Session
        currentRound.status = isPassed ? 'Completed' : 'Failed';
        currentRound.score = scorePercentage;
        currentRound.metrics = { correctCount, totalQuestions, details: resultDetails };
        currentRound.completedAt = new Date();

        if (isPassed) {
            session.currentRoundIndex += 1;
            if (session.currentRoundIndex >= session.rounds.length) {
                session.status = 'Completed';
            }
        } else {
            session.status = 'Rejected';
        }

        await session.save();

        // 4. Audit Log
        await AuditLog.create({
            sessionId: session._id,
            userId: req.user.id,
            action: isPassed ? 'SHORTLISTED' : 'REJECTED',
            details: { roundType: 'OA', score: scorePercentage, threshold: roundTemplate.shortlistThreshold }
        });

        // 5. Trigger Async Processing (Probability, Mentor Plan, etc.)
        await simulationQueue.add('oa-eval', {
            sessionId: session._id,
            userId: req.user.id,
            type: 'OA_EVALUATION_COMPLETE',
            details: { score: scorePercentage, passed: isPassed }
        });

        res.status(200).json({
            success: true,
            message: isPassed ? 'Congratulations! You passed the OA.' : 'Hard luck. You did not meet the threshold.',
            data: {
                score: scorePercentage,
                passed: isPassed,
                nextRound: isPassed ? session.currentRoundIndex : null
            }
        });

    } catch (err) {
        logger.error('Error submitting OA:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
