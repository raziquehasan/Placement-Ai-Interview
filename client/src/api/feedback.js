import axios from './axios';

/**
 * Feedback API calls
 */

// Generate feedback for interview
export const generateFeedback = async (interviewId) => {
    const response = await axios.post('/feedback/generate', { interviewId });
    return response.data.data;
};

// Get feedback by interview ID
export const getFeedback = async (interviewId) => {
    const response = await axios.get(`/feedback/${interviewId}`);
    return response.data.data.feedback;
};

// Get all user feedback
export const getAllFeedback = async () => {
    const response = await axios.get('/feedback');
    return response.data;
};
