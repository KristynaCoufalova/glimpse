// Utility functions for the app

/**
 * Format a date to a readable string
 * @param date The date to format
 * @param format The format to use (short, medium, long)
 * @returns Formatted date string
 */
export const formatDate = (date: Date, format: 'short' | 'medium' | 'long' = 'medium'): string => {
  if (!date) return '';

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diff / 60000);
  const diffInHours = Math.floor(diff / 3600000);
  const diffInDays = Math.floor(diff / 86400000);

  // If less than 24 hours ago, show relative time
  if (diffInDays < 1) {
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    return `${diffInHours}h ago`;
  }

  // If less than 7 days ago, show day of week
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // Otherwise, show formatted date
  switch (format) {
    case 'short':
      return date.toLocaleDateString();
    case 'long':
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'medium':
    default:
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
  }
};

/**
 * Format a timestamp to a readable time string
 * @param seconds Duration in seconds
 * @returns Formatted time string (MM:SS)
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

/**
 * Validate an email address
 * @param email The email to validate
 * @returns Whether the email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate a password
 * @param password The password to validate
 * @returns Whether the password is valid (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
 */
export const isValidPassword = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
};

/**
 * Get password strength feedback
 * @param password The password to check
 * @returns Object with strength score (0-4) and feedback message
 */
export const getPasswordStrength = (password: string): { score: number; feedback: string } => {
  if (!password) return { score: 0, feedback: 'Password is required' };

  let score = 0;
  let feedback = '';

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Complexity checks
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // Normalize score to 0-4 range
  score = Math.min(4, Math.floor(score / 1.5));

  // Generate feedback
  switch (score) {
    case 0:
      feedback = 'Very weak password';
      break;
    case 1:
      feedback = 'Weak password';
      break;
    case 2:
      feedback = 'Fair password';
      break;
    case 3:
      feedback = 'Good password';
      break;
    case 4:
      feedback = 'Strong password';
      break;
    default:
      feedback = '';
  }

  return { score, feedback };
};

/**
 * Truncate text to a specified length
 * @param text The text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Generate a random string (useful for IDs)
 * @param length Length of the string to generate
 * @returns Random string
 */
export const generateRandomString = (length: number = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Get user's timezone name
 * @returns Timezone name (e.g., "America/New_York")
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Format file size
 * @param bytes Size in bytes
 * @returns Formatted size string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Debounce a function
 * @param func The function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if a URL is valid
 * @param url The URL to check
 * @returns Whether the URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Extract username from email
 * @param email Email address
 * @returns Username portion of the email
 */
export const getUsernameFromEmail = (email: string): string => {
  if (!email) return '';
  return email.split('@')[0];
};
