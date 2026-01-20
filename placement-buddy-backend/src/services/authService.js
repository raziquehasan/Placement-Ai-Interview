/**
 * Authentication Service
 * Business logic for user registration and login
 */

const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} User and token
 */
const registerUser = async (userData) => {
    const { name, email, password, role } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    // Create new user (password will be hashed by pre-save middleware)
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'student'
    });

    // Generate JWT token
    const token = generateToken({ userId: user._id, role: user.role });

    return {
        user: user.toJSON(),
        token
    };
};

/**
 * Login user
 * @param {String} email - User email
 * @param {String} password - User password
 * @returns {Object} User and token
 */
const loginUser = async (email, password) => {
    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        throw new Error('Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken({ userId: user._id, role: user.role });

    return {
        user: user.toJSON(),
        token
    };
};

module.exports = {
    registerUser,
    loginUser
};
