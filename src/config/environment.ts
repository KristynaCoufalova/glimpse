// src/config/environment.ts
// This file handles environment variables for the application

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyBSPsfibfymk7alMe5JpF8W_-nTmSdY7AI',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'glimpse-31af8.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'glimpse-31af8',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'glimpse-31af8.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '737095863798',
  appId: process.env.FIREBASE_APP_ID || '1:737095863798:web:decc2ebd483e76a1010bd7',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-4NKD612834',
};

/**
 * Note: For proper environment variable handling in React Native/Expo,
 * you would typically use a package like react-native-dotenv or a similar solution.
 * For production, you should:
 * 1. Install react-native-dotenv: npm install react-native-dotenv --save-dev
 * 2. Update babel.config.js to include the plugin
 * 3. Use import statements for environment variables
 * The fallback values are included here temporarily to ensure the app works
 * while the proper environment setup is implemented.
 */
