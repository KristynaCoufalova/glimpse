import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, Persistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

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

// Create a proper class-based persistence mechanism using AsyncStorage
// This should satisfy Firebase's expectation for a class definition
class ReactNativePersistence implements Partial<Persistence> {
  readonly type = 'LOCAL';
  async get(key: string): Promise<string | null> {
    try {
      const value = await ReactNativeAsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.error('Error reading from AsyncStorage:', error);
      return null;
    }
  }
  async set(key: string, value: string): Promise<void> {
    try {
      await ReactNativeAsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to AsyncStorage:', error);
    }
  }
  async remove(key: string): Promise<void> {
    try {
      await ReactNativeAsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from AsyncStorage:', error);
    }
  }
}

// Create an instance of our persistence class
const reactNativePersistence = new ReactNativePersistence();

// Initialize Auth with our custom AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: reactNativePersistence as unknown as Persistence,
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