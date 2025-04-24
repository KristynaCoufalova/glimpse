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
import { fetchUserGroups, resetGroups } from './src/store/slices/groupsSlice';
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
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        console.log('User authenticated:', firebaseUser.uid);
        console.log('Auth state:', { email: firebaseUser.email, displayName: firebaseUser.displayName });
        
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        };
        dispatch(setUser(userData));
        
        console.log('Dispatching fetchUserGroups for user:', firebaseUser.uid);
        // Fetch user groups
        dispatch(fetchUserGroups(firebaseUser.uid) as any)
          .then((result: any) => {
            if (result.error) {
              console.error('Error fetching groups:', result.error);
            } else {
              console.log('Successfully fetched groups, payload size:', result.payload?.length || 0);
            }
          })
          .catch((err: any) => {
            console.error('Exception fetching groups:', err);
          });
        
        // Fetch feed videos
        console.log('Dispatching fetchFeedVideos');
        dispatch(fetchFeedVideos({ userId: firebaseUser.uid }) as any);
      } else {
        // User is signed out
        console.log('User signed out');
        dispatch(setUser(null));
        
        // Clear groups state on logout
        console.log('Clearing groups state');
        dispatch(resetGroups());
      }
    }, (error) => {
      console.error('Auth state change error:', error);
    });
    
    // Cleanup subscription
    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, [dispatch]);

  // No need to fetch groups again, it's already done in the auth state change handler

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