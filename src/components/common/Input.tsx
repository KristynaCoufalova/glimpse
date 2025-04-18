import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  TextInputProps,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  secureTextEntry,
  showPasswordToggle = false,
  ...rest
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Determine if we should show the password toggle
  const shouldShowPasswordToggle = secureTextEntry && showPasswordToggle;
  
  // Determine the actual secureTextEntry value based on visibility toggle
  const actualSecureTextEntry = secureTextEntry && !isPasswordVisible;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
      
      <View style={[
        styles.inputContainer,
        error ? styles.inputError : null,
      ]}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon as any} 
            size={20} 
            color="#666" 
            style={styles.leftIcon} 
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : null,
            (rightIcon || shouldShowPasswordToggle) ? styles.inputWithRightIcon : null,
            inputStyle,
          ]}
          placeholderTextColor="#999"
          secureTextEntry={actualSecureTextEntry}
          {...rest}
        />
        
        {shouldShowPasswordToggle && (
          <TouchableOpacity 
            style={styles.rightIcon}
            onPress={togglePasswordVisibility}
          >
            <Ionicons 
              name={isPasswordVisible ? 'eye-off' : 'eye'} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !shouldShowPasswordToggle && (
          <TouchableOpacity 
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            <Ionicons 
              name={rightIcon as any} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={[styles.errorText, errorStyle]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIcon: {
    marginLeft: 12,
  },
  rightIcon: {
    padding: 8,
    marginRight: 8,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
  },
});

export default Input;