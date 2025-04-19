module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
    'prettier',
  ],
  rules: {
    // General ESLint rules
    'no-console': 'off', // Allow console for now
    'no-unused-vars': 'off', // TypeScript handles this
    
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // React rules
    'react/prop-types': 'off', // We use TypeScript for prop validation
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/display-name': 'off',
    'react/jsx-uses-react': 'off', // Not needed in React 17+
    'react/no-unescaped-entities': 'off', // Allow quotes in text
    
    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Prettier rules
    'prettier/prettier': ['warn'],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    'jest': true,
    'node': true,
  },
  ignorePatterns: [
    'node_modules/',
    'coverage/',
    'android/',
    'ios/',
    'web-build/',
    '*.config.js',
    '*.lock',
  ],
};