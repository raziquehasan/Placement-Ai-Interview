import axios from './axios';

/**
 * Interview API calls
 */

// Start new interview
export const startInterview = async (interviewData) => {
    const response = await axios.post('/interviews/start', interviewData);
    return response.data.data.interview;
};

// Get interview by ID
export const getInterview = async (id) => {
    const response = await axios.get(`/interviews/${id}`);
    return response.data.data.interview;
};

// Submit interview answers
export const submitAnswers = async (id, answers) => {
    const response = await axios.post(`/interviews/${id}/submit`, { answers });
    return response.data.data.interview;
};

// Get interview history
export const getInterviewHistory = async () => {
    const response = await axios.get('/interviews/history');
    return response.data;
};

// Get user's interviews
export const getUserInterviews = async () => {
    const response = await axios.get('/interviews');
    return response.data.data.interviews;
};
