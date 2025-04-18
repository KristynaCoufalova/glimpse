// App-wide constants

// Colors
export const COLORS = {
  // Primary colors
  primary: '#4ECDC4', // Soft teal
  secondary: '#FF6B6B', // Warm coral
  
  // Neutral colors
  background: '#FFFFFF',
  card: '#F8F8F8',
  text: '#333333',
  textLight: '#666666',
  textLighter: '#999999',
  border: '#DDDDDD',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#FF5252',
  info: '#2196F3',
  
  // Utility colors
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  highlight: '#FFEB3B', // Muted yellow highlight
};

// Typography
export const FONTS = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

// Shadows
export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
};

// App specific constants
export const VIDEO = {
  maxDuration: 90, // Maximum video duration in seconds
  aspectRatio: 9 / 16, // Vertical video aspect ratio (9:16)
  quality: '720p', // Default video quality
};

// API endpoints (for Firebase)
export const FIREBASE_COLLECTIONS = {
  users: 'users',
  groups: 'groups',
  videos: 'videos',
  invites: 'invites',
  reactions: 'reactions',
  prompts: 'prompts',
};

// Local storage keys
export const STORAGE_KEYS = {
  authToken: 'glimpse_auth_token',
  user: 'glimpse_user',
  onboardingComplete: 'glimpse_onboarding_complete',
  lastPromptDate: 'glimpse_last_prompt_date',
};

// Animation durations
export const ANIMATION = {
  short: 150,
  medium: 300,
  long: 500,
};

// Default values
export const DEFAULTS = {
  avatarUrl: 'https://via.placeholder.com/150',
  groupCoverUrl: 'https://via.placeholder.com/600x300',
  videoThumbnailUrl: 'https://via.placeholder.com/300x600',
};