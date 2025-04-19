import React from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  Modal,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface LoadingProps {
  visible: boolean;
  text?: string;
  overlay?: boolean;
  spinnerSize?: 'small' | 'large';
  spinnerColor?: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const Loading: React.FC<LoadingProps> = ({
  visible,
  text,
  overlay = false,
  spinnerSize = 'large',
  spinnerColor = '#4ECDC4',
  containerStyle,
  textStyle,
}) => {
  if (!visible) {
    return null;
  }

  // If overlay is true, render a modal with a semi-transparent background
  if (overlay) {
    return (
      <Modal transparent animationType="fade" visible={visible}>
        <View style={styles.modalContainer}>
          <View style={[styles.overlayContainer, containerStyle]}>
            <ActivityIndicator size={spinnerSize} color={spinnerColor} />
            {text && <Text style={[styles.text, textStyle]}>{text}</Text>}
          </View>
        </View>
      </Modal>
    );
  }

  // Otherwise, render a simple loading indicator
  return (
    <View style={[styles.container, containerStyle]}>
      <ActivityIndicator size={spinnerSize} color={spinnerColor} />
      {text && <Text style={[styles.text, textStyle]}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  overlayContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    justifyContent: 'center',
    minHeight: 120,
    minWidth: 120,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    color: '#333',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default Loading;
