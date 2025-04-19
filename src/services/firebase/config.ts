import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBSPsfibfymk7alMe5JpF8W_-nTmSdY7AI',
  authDomain: 'glimpse-31af8.firebaseapp.com',
  projectId: 'glimpse-31af8',
  storageBucket: 'glimpse-31af8.firebasestorage.app',
  messagingSenderId: '737095863798',
  appId: '1:737095863798:web:decc2ebd483e76a1010bd7',
  measurementId: 'G-4NKD612834',
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

// Note: In Firebase v11, React Native persistence is handled differently
// We'll use the basic approach for now to fix the initialization issues

export { app, auth, firestore, storage };
