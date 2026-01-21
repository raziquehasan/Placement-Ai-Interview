/**
 * Resume Controller (with Background Jobs)
 * Handles resume upload and retrieval with async processing
 */

const resumeService = require('../services/resumeService');
const resumeQueue = require('../queues/resumeQueue');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads/resumes';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

/**
 * Upload and parse resume (with background processing)
 * POST /api/resumes/upload
 */
const uploadResume = async (req, res, next) => {
    try {
        if (!req.file) {
            return errorResponse(res, 400, 'Please upload a PDF file');
        }

        // 1. Create initial resume record in database with 'Pending' status
        const resume = await resumeService.createInitialResume(req.file, req.user._id);

        logger.info(`Initial resume record ${resume._id} created for user ${req.user._id}`);

        // 2. Add job to queue with the EXISTING resume ID
        const job = await resumeQueue.add('parse-resume', {
            resumeId: resume._id,
            file: req.file,
            userId: req.user._id
        });

        logger.info(`Resume processing job ${job.id} queued for resume ${resume._id}`);

        return successResponse(res, 202, 'Resume uploaded successfully. Processing in background.', {
            jobId: job.id,
            resumeId: resume._id,
            status: 'processing',
            message: 'Your resume is being parsed. Check back shortly for results.'
        });

    } catch (error) {
        logger.error('Resume upload error:', error);
        next(error);
    }
};

/**
 * Get resume by ID
 * GET /api/resumes/:id
 */
const getResume = async (req, res, next) => {
    try {
        const resume = await resumeService.getResumeById(req.params.id);

        return successResponse(res, 200, 'Resume retrieved successfully', { resume });

    } catch (error) {
        if (error.message.includes('not found')) {
            return errorResponse(res, 404, error.message);
        }
        next(error);
    }
};

/**
 * Get all resumes for current user
 * GET /api/resumes/user/me
 */
const getUserResumes = async (req, res, next) => {
    try {
        const resumes = await resumeService.getUserResumes(req.user._id);

        return successResponse(res, 200, 'Resumes retrieved successfully', { resumes });

    } catch (error) {
        next(error);
    }
};

/**
 * Delete a resume
 * DELETE /api/resumes/:id
 */
const deleteResume = async (req, res, next) => {
    try {
        await resumeService.deleteResume(req.params.id, req.user._id);

        return successResponse(res, 200, 'Resume deleted successfully');

    } catch (error) {
        if (error.message.includes('not found')) {
            return errorResponse(res, 404, error.message);
        }
        next(error);
    }
};

module.exports = {
    upload,
    uploadResume,
    getResume,
    getUserResumes,
    deleteResume
};
