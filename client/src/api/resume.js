import axios from './axios';

/**
 * Resume API calls
 */

// Upload resume file
export const uploadResume = async (file) => {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await axios.post('/resumes/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.data;
};

// Get all user resumes
export const getResumes = async () => {
    const response = await axios.get('/resumes');
    return response.data.data.resumes;
};

// Get single resume by ID
export const getResumeById = async (id) => {
    const response = await axios.get(`/resumes/${id}`);
    return response.data.data.resume;
};

// Delete resume
export const deleteResume = async (id) => {
    const response = await axios.delete(`/resumes/${id}`);
    return response.data;
};
