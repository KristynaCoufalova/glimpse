import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeScreen } from '../../components/common';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const { status, error: authError } = useSelector((state: RootState) => state.auth);
  const isLoading = status === 'loading';

  // Update local error state when Redux auth error changes
  useEffect(() => {
    if (authError) {
      setLocalError(authError);
    }
  }, [authError]);

  const handleLogin = async () => {
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    setLocalError('');

    try {
      // Dispatch login action to Redux and unwrap the result
      await dispatch(login({ email, password })).unwrap();
      // Navigation will be handled by the Navigation component based on auth state
    } catch (err) {
      console.error('Login error:', err);
      // Error is already handled by the auth state through the useEffect
    }
  };

  return (
    <SafeScreen style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Glimpse</Text>
        <Text style={styles.tagline}>Stay connected with moments that matter</Text>
      </View>

      <View style={styles.formContainer}>
        {localError ? <Text style={styles.errorText}>{localError}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Log In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.signupLink} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupText}>
            Don&apos;t have an account? <Text style={styles.signupTextBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
    padding: 20,
  },
  errorText: {
    color: '#FF6B6B', // Warm coral accent color
    marginBottom: 15,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    padding: 15,
  },
  loginButton: {
    backgroundColor: '#4ECDC4', // Soft teal primary color
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
    marginTop: 80,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4ECDC4', // Soft teal primary color
    marginBottom: 10,
  },
  signupLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#666',
    fontSize: 16,
  },
  signupTextBold: {
    color: '#4ECDC4',
    fontWeight: 'bold', // Soft teal primary color
  },
  tagline: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LoginScreen;
