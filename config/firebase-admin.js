/**
 * Firebase Admin SDK Configuration
 * This is optional and only needed if using Firebase services
 */

let admin = null;
let firebaseInitialized = false;

try {
    // Check if Firebase credentials are provided
    if (process.env.FIREBASE_CREDENTIALS) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

        admin = require('firebase-admin');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        firebaseInitialized = true;
        console.log('✓ Firebase Admin initialized');
    } else {
        console.log('ℹ Firebase Admin not configured (optional)');
    }
} catch (error) {
    console.warn('⚠ Firebase Admin initialization failed (optional service):', error.message);
}

module.exports = { admin, firebaseInitialized };
