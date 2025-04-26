// src/services/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_CONFIG } from '../../config/environment';

// Use Firebase configuration from environment
const firebaseConfig = FIREBASE_CONFIG;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with React Native AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
  console.log('Firebase Auth initialized with React Native persistence');
} catch (error) {
  // Fallback to regular auth if persistence setup fails
  console.error('Error initializing Auth with persistence:', error);
  auth = getAuth(app);
  console.warn(
    'Using default Firebase Auth without persistence. Authentication state may not persist between sessions.'
  );
}

// Initialize Firebase services
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };
