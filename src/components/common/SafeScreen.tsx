import React, { ReactNode } from 'react';
import { StyleSheet, ViewStyle, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants';

interface SafeScreenProps {
  children: ReactNode;
  style?: ViewStyle;
  statusBarColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
}

const SafeScreen: React.FC<SafeScreenProps> = ({
  children,
  style,
  statusBarColor = COLORS.background,
  statusBarStyle = 'dark-content',
  edges = ['right', 'bottom', 'left', 'top'],
}) => {
  return (
    <>
      <StatusBar backgroundColor={statusBarColor} barStyle={statusBarStyle} translucent={true} />
      <SafeAreaView style={[styles.container, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
});

export default SafeScreen;