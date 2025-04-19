import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import Navigation from './src/navigation';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { ThemeProvider } from './src/theme/ThemeProvider';

// Ignore specific warnings
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native',
  'Possible Unhandled Promise Rejection',
  'Setting a timer for a long period of time',
]);

// Ignore specific warnings
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native',
  'Possible Unhandled Promise Rejection',
  'Setting a timer for a long period of time',
]);

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <Navigation />
        </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  );
}
