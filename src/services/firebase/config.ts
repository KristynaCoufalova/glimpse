import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
let auth;

try {
  // Using the exact pattern from the Firebase warning
  // Using type assertion to bypass TypeScript constraints
  const getReactNativePersistence = (asyncStorage: any) => ({
    type: 'asyncStorage',
    storage: asyncStorage,
  }) as any;

  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  
  console.log('Firebase Auth initialized with React Native persistence');
} catch (error) {
  // Fallback to regular auth if persistence setup fails
  auth = getAuth(app);
  console.warn(
    'Using default Firebase Auth without persistence. Authentication state may not persist between sessions.'
  );
}

// Initialize Firebase services
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };