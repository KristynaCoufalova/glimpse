import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './src/store';
import { NavigationContainer } from '@react-navigation/native';
import Navigation from './src/navigation';
import { LogBox } from 'react-native';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { auth } from './src/services/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { setUser } from './src/store/slices/authSlice';
import { fetchUserGroups } from './src/store/slices/groupsSlice';
import { fetchFeedVideos } from './src/store/slices/videosSlice';

// Ignore specific warnings
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native',
  'Possible Unhandled Promise Rejection',
  'Setting a timer for a long period of time',
]);

// Auth state wrapper component
const AuthStateWrapper = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        };
        dispatch(setUser(userData));
        
        // Fetch user groups
        dispatch(fetchUserGroups(firebaseUser.uid) as any);
        
        // Fetch feed videos
        dispatch(fetchFeedVideos({ userId: firebaseUser.uid }) as any);
      } else {
        // User is signed out
        dispatch(setUser(null));
      }
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, [dispatch]);

  // Fetch groups when user changes
  useEffect(() => {
    if (user) {
      dispatch(fetchUserGroups(user.uid) as any);
    }
  }, [user, dispatch]);

  return <>{children}</>;
};

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <AuthStateWrapper>
              <Navigation />
            </AuthStateWrapper>
          </NavigationContainer>
        </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  );
}