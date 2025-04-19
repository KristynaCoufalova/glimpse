import React, { createContext, useContext, ReactNode } from 'react';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';

// Define the theme object type
interface ThemeType {
  colors: typeof COLORS;
  fonts: typeof FONTS;
  spacing: typeof SPACING;
  borderRadius: typeof BORDER_RADIUS;
  shadows: typeof SHADOWS;
}

// Create the theme object
const theme: ThemeType = {
  colors: COLORS,
  fonts: FONTS,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
};

// Create the context
const ThemeContext = createContext<ThemeType>(theme);

// Create a hook to use the theme
export const useTheme = () => useContext(ThemeContext);

// Create the provider component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
