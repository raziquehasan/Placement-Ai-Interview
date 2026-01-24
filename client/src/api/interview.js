import axios from './axios';

/**
 * Interview API calls - Phase 2.1 Multi-Round
 */

// 1. Create/Start Base Interview
export const startInterview = async (interviewData) => {
    const response = await axios.post('/interviews', interviewData);
    return response.data.data.interview;
};

// 2. Fetch Interviews
export const getInterview = async (id) => {
    const response = await axios.get(`/interviews/${id}`);
    return response.data.data.interview;
};

export const getUserInterviews = async () => {
    const response = await axios.get('/interviews');
    return response.data.data.interviews;
};

export const getInterviewHistory = async () => {
    const response = await axios.get('/interviews');
    return response.data.data.interviews;
};

// 3. Technical Round (Round 1)
export const startTechnicalRound = async (id) => {
    const response = await axios.post(`/interviews/${id}/technical/start`);
    return response.data.data;
};

export const submitTechnicalAnswer = async (id, answerData) => {
    const response = await axios.post(`/interviews/${id}/technical/answer`, answerData);
    return response.data.data;
};

export const getTechnicalEvaluation = async (id, questionId) => {
    const response = await axios.get(`/interviews/${id}/technical/evaluation/${questionId}`);
    return response.data.data;
};

export const getTechnicalStatus = async (id) => {
    const response = await axios.get(`/interviews/${id}/technical/status`);
    return response.data.data;
};

// 4. HR Round (Round 2)
export const startHRRound = async (id) => {
    const response = await axios.post(`/interviews/${id}/hr/start`);
    return response.data.data;
};

export const submitHRAnswer = async (id, answerData) => {
    const response = await axios.post(`/interviews/${id}/hr/answer`, answerData);
    return response.data.data;
};

export const getHREvaluation = async (id, questionId) => {
    const response = await axios.get(`/interviews/${id}/hr/evaluation/${questionId}`);
    return response.data.data;
};

export const getHRStatus = async (id) => {
    const response = await axios.get(`/interviews/${id}/hr/status`);
    return response.data.data;
};

// 5. Coding Round (Round 3) - Phase 2.3
export const startCodingRound = async (id) => {
    const response = await axios.post(`/interviews/${id}/coding/start`);
    return response.data.data;
};

export const submitCode = async (id, codeData) => {
    const response = await axios.post(`/interviews/${id}/coding/submit`, codeData);
    return response.data.data;
};

export const getCodingResults = async (id) => {
    const response = await axios.get(`/interviews/${id}/coding/results`);
    return response.data.data;
};

export const saveCodingDraft = async (id, draftData) => {
    const response = await axios.post(`/interviews/${id}/coding/draft`, draftData);
    return response.data;
};

export const logCodingIntegrity = async (id, signalType) => {
    const response = await axios.post(`/interviews/${id}/coding/integrity`, { type: signalType });
    return response.data;
};

// 6. Final Hiring Report - Phase 2.4
export const getHiringReport = async (id) => {
    const response = await axios.get(`/interviews/${id}/report`);
    return response.data.data.report;
};

// 7. Legacy/Bulk (Backward Compatibility)
export const submitAnswers = async (id, answers) => {
    const response = await axios.post(`/interviews/${id}/submit`, { answers });
    return response.data.data.interview;
};
