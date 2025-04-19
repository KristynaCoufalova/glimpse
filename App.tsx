import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch } from 'react-redux';
import { store } from './src/store';
import { NavigationContainer } from '@react-navigation/native';
import Navigation from './src/navigation';
import { LogBox } from 'react-native';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/services/firebase/config';
import { setUser } from './src/store/slices/userSlice';

// Ignore specific warnings
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native',
  'Possible Unhandled Promise Rejection',
  'Setting a timer for a long period of time',
]);

// Auth state listener component
const AuthStateListener = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        dispatch(setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }));
      } else {
        // User is signed out
        dispatch(setUser(null));
      }
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
};

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <AuthStateListener>
              <Navigation />
            </AuthStateListener>
          </NavigationContainer>
        </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  );
}