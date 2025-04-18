import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

// Firebase configuration
// In a real app, these values would be stored in environment variables
// or in a secure configuration file that's not committed to version control
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "glimpse-app.firebaseapp.com",
  projectId: "glimpse-app",
  storageBucket: "glimpse-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-ABCDEFGHIJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };