import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

interface HeaderProps {
  title: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  showBackButton?: boolean;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  showBackButton = false,
  containerStyle,
  titleStyle,
  transparent = false,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onLeftPress) {
      onLeftPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
        transparent && styles.transparentContainer,
        containerStyle,
      ]}
    >
      <StatusBar
        barStyle={transparent ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <View style={styles.content}>
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity style={styles.iconButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color={transparent ? '#fff' : '#333'} />
            </TouchableOpacity>
          )}

          {leftIcon && !showBackButton && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onLeftPress}
              disabled={!onLeftPress}
            >
              <Ionicons name={leftIcon as any} size={24} color={transparent ? '#fff' : '#333'} />
            </TouchableOpacity>
          )}
        </View>

        <Text
          style={[styles.title, transparent && styles.transparentTitle, titleStyle]}
          numberOfLines={1}
        >
          {title}
        </Text>

        <View style={styles.rightContainer}>
          {rightIcon && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onRightPress}
              disabled={!onRightPress}
            >
              <Ionicons name={rightIcon as any} size={24} color={transparent ? '#fff' : '#333'} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    zIndex: 10,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 56,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  iconButton: {
    borderRadius: 20,
    padding: 8,
  },
  leftContainer: {
    alignItems: 'flex-start',
    width: 40,
  },
  rightContainer: {
    alignItems: 'flex-end',
    width: 40,
  },
  title: {
    color: '#333',
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  transparentContainer: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  transparentTitle: {
    color: '#fff',
  },
});

export default Header;
