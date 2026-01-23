import axios from 'axios';

// Create axios instance with base configuration
const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds to allow for AI generation
});

// Request interceptor to add JWT token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized - redirect to login
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        // Handle network errors
        if (!error.response) {
            console.error('Network error:', error.message);
            return Promise.reject({
                message: 'Network error. Please check your connection.',
            });
        }

        // Return error response
        return Promise.reject(error.response?.data || error);
    }
);

export default axiosInstance;
