/**
 * Interview Service - Phase 2.1 Frontend
 * API integration for technical interview operations
 */

import api from './api';

const interviewService = {
    /**
     * Create new interview
     * @param {string} resumeId - Resume ID
     * @param {string} role - Job role
     * @param {string} difficulty - Interview difficulty
     * @returns {Promise<Object>} Created interview
     */
    async createInterview(resumeId, role, difficulty = 'Medium') {
        try {
            const response = await api.post('/interviews', {
                resumeId,
                role,
                difficulty
            });
            return response.data.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create interview');
        }
    },

    /**
     * Get interview by ID
     * @param {string} interviewId - Interview ID
     * @returns {Promise<Object>} Interview details
     */
    async getInterview(interviewId) {
        try {
            const response = await api.get(`/interviews/${interviewId}`);
            return response.data.data.interview;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch interview');
        }
    },

    /**
     * Get interview history
     * @returns {Promise<Array>} List of interviews
     */
    async getInterviewHistory() {
        try {
            const response = await api.get('/interviews');
            return response.data.data.interviews;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch interview history');
        }
    },

    /**
     * Start technical round
     * @param {string} interviewId - Interview ID
     * @returns {Promise<Object>} Round data with first question
     */
    async startTechnicalRound(interviewId) {
        try {
            const response = await api.post(`/interviews/${interviewId}/technical/start`);
            return response.data.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to start technical round');
        }
    },

    /**
     * Submit answer
     * @param {string} interviewId - Interview ID
     * @param {string} questionId - Question ID
     * @param {string} answer - User's answer
     * @param {number} timeSpent - Time spent in seconds
     * @returns {Promise<Object>} Next question and progress
     */
    async submitAnswer(interviewId, questionId, answer, timeSpent) {
        try {
            const response = await api.post(`/interviews/${interviewId}/technical/answer`, {
                questionId,
                answer,
                timeSpent
            });
            return response.data.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to submit answer');
        }
    },

    /**
     * Get evaluation for a question (polling endpoint)
     * @param {string} interviewId - Interview ID
     * @param {string} questionId - Question ID
     * @returns {Promise<Object>} Evaluation data
     */
    async getEvaluation(interviewId, questionId) {
        try {
            const response = await api.get(`/interviews/${interviewId}/technical/evaluation/${questionId}`);
            return response.data.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch evaluation');
        }
    },

    /**
     * Get technical round status and progress
     * @param {string} interviewId - Interview ID
     * @returns {Promise<Object>} Status and scores
     */
    async getTechnicalStatus(interviewId) {
        try {
            const response = await api.get(`/interviews/${interviewId}/technical/status`);
            return response.data.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch status');
        }
    },

    /**
     * Start HR round
     * @param {string} interviewId - Interview ID
     * @returns {Promise<Object>} Round data with first question
     */
    async startHRRound(interviewId) {
        try {
            const response = await api.post(`/interviews/${interviewId}/hr/start`);
            return response.data.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to start HR round');
        }
    },

    /**
     * Submit HR answer
     * @param {string} interviewId - Interview ID
     * @param {string} questionId - Question ID
     * @param {string} answer - User's answer
     * @param {number} timeSpent - Time spent in seconds
     * @returns {Promise<Object>} Next question and progress
     */
    async submitHRAnswer(interviewId, questionId, answer, timeSpent) {
        try {
            const response = await api.post(`/interviews/${interviewId}/hr/answer`, {
                questionId,
                answer,
                timeSpent
            });
            return response.data.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to submit HR answer');
        }
    },

    /**
     * Get evaluation for an HR question (polling endpoint)
     * @param {string} interviewId - Interview ID
     * @param {string} questionId - Question ID
     * @returns {Promise<Object>} Evaluation data
     */
    async getHREvaluation(interviewId, questionId) {
        try {
            const response = await api.get(`/interviews/${interviewId}/hr/evaluation/${questionId}`);
            return response.data.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch HR evaluation');
        }
    },

    /**
     * Get HR round status and progress
     * @param {string} interviewId - Interview ID
     * @returns {Promise<Object>} Status and scores
     */
    async getHRStatus(interviewId) {
        try {
            const response = await api.get(`/interviews/${interviewId}/hr/status`);
            return response.data.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch HR status');
        }
    }
};

export default interviewService;
