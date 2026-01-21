import axios from './axios';

/**
 * Authentication API calls
 */

// Register new user
export const register = async (userData) => {
    const response = await axios.post('/auth/register', userData);
    return response.data;
};

// Login user
export const login = async (email, password) => {
    const response = await axios.post('/auth/login', { email, password });
    return response.data;
};

// Get current user profile
export const getProfile = async () => {
    const response = await axios.get('/users/profile');
    return response.data;
};

// Update user profile
export const updateProfile = async (userData) => {
    const response = await axios.put('/users/profile', userData);
    return response.data;
};
