import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ViewStyle,
  TextStyle,
  StatusBar
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
        barStyle={transparent ? "light-content" : "dark-content"} 
        backgroundColor="transparent" 
        translucent 
      />
      
      <View style={styles.content}>
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleBackPress}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={transparent ? "#fff" : "#333"}
              />
            </TouchableOpacity>
          )}
          
          {leftIcon && !showBackButton && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onLeftPress}
              disabled={!onLeftPress}
            >
              <Ionicons
                name={leftIcon as any}
                size={24}
                color={transparent ? "#fff" : "#333"}
              />
            </TouchableOpacity>
          )}
        </View>
        
        <Text
          style={[
            styles.title,
            transparent && styles.transparentTitle,
            titleStyle,
          ]}
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
              <Ionicons
                name={rightIcon as any}
                size={24}
                color={transparent ? "#fff" : "#333"}
              />
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 10,
  },
  transparentContainer: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  transparentTitle: {
    color: '#fff',
  },
});

export default Header;