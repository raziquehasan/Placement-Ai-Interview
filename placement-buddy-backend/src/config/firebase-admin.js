const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const config = require('./config');

/**
 * Firebase Admin SDK Initialization
 * Support for both Service Account JSON file and environment variables
 */

const initFirebase = () => {
    try {
        const serviceAccountPath = config.firebaseServiceAccountPath;

        if (serviceAccountPath) {
            console.log(`[Firebase Debug] Config path: ${serviceAccountPath}`);
            console.log(`[Firebase Debug] Raw Env path: ${process.env.FIREBASE_SERVICE_ACCOUNT_PATH}`);

            // Robust absolute path resolution for Windows/Production
            const absolutePath = path.isAbsolute(serviceAccountPath)
                ? serviceAccountPath
                : path.resolve(process.cwd(), serviceAccountPath);

            console.log(`[Firebase Debug] Resolved Absolute path: ${absolutePath}`);

            if (fs.existsSync(absolutePath)) {
                const serviceAccount = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                console.log('✅ Firebase Admin initialized successfully via JSON file');
            } else {
                throw new Error(`Service account file not found at: ${absolutePath}`);
            }
        } else if (config.firebaseProjectId && config.firebaseClientEmail) {
            // Fallback to environment variables
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: config.firebaseProjectId,
                    clientEmail: config.firebaseClientEmail,
                    privateKey: config.firebasePrivateKey?.replace(/\\n/g, '\n'),
                }),
            });
            console.log('✅ Firebase Admin initialized successfully via environment variables');
        } else {
            console.warn('⚠️ Firebase Admin NOT initialized. Missing credentials (FIREBASE_SERVICE_ACCOUNT_PATH or env vars).');
        }
    } catch (error) {
        console.error('❌ Firebase Admin Initialization Failed:');
        console.error(error.message);
        // Do not crash the server, but auth middleware will fail until fixed
    }
};

initFirebase();

module.exports = admin;
