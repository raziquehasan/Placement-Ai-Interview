const admin = require('../config/firebase-admin');

/**
 * Middleware to verify Firebase ID tokens
 * Expects header: Authorization: Bearer <token>
 */
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: No token provided'
        });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying Firebase token:', error);
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid token',
            error: error.code
        });
    }
};

module.exports = {
    authenticate,
    // Exporting as authMiddleware as well just in case
    authMiddleware: authenticate
};
