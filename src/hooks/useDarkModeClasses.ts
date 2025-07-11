import { useTheme } from '../contexts/ThemeContext';

/**
 * Hook that provides pre-built dark mode class combinations
 * Optimized for Nigerian users with consistent, accessible color schemes
 */
export const useDarkModeClasses = () => {
  const { isDark } = useTheme();

  return {
    // Background classes
    bg: {
      primary: 'bg-white dark:bg-gray-900',
      secondary: 'bg-gray-50 dark:bg-gray-800',
      tertiary: 'bg-gray-100 dark:bg-gray-700',
      elevated: 'bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/20',
      overlay: 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm',
    },

    // Text classes
    text: {
      primary: 'text-gray-900 dark:text-gray-100',
      secondary: 'text-gray-600 dark:text-gray-300',
      tertiary: 'text-gray-500 dark:text-gray-400',
      muted: 'text-gray-400 dark:text-gray-500',
      inverse: 'text-white dark:text-gray-900',
      accent: 'text-indigo-600 dark:text-indigo-400',
    },

    // Border classes
    border: {
      primary: 'border-gray-200 dark:border-gray-700',
      secondary: 'border-gray-300 dark:border-gray-600',
      focus: 'border-indigo-500 dark:border-indigo-400',
      error: 'border-red-500 dark:border-red-400',
      success: 'border-green-500 dark:border-green-400',
    },

    // Interactive states
    hover: {
      bg: 'hover:bg-gray-50 dark:hover:bg-gray-800',
      text: 'hover:text-gray-900 dark:hover:text-gray-100',
      accent: 'hover:text-indigo-700 dark:hover:text-indigo-300',
    },

    // Form elements
    input: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400',

    // Buttons
    button: {
      primary: 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100',
      ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
      outline: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
    },

    // Cards and containers
    card: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/20',
    
    // Navigation
    nav: {
      bg: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800',
      item: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800',
      active: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20',
    },

    // Status indicators
    status: {
      success: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
      warning: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
      error: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
      info: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    },

    // Nigerian currency specific
    currency: {
      ngn: 'text-green-600 dark:text-green-400',
      usd: 'text-blue-600 dark:text-blue-400',
    },

    // Data visualization (optimized for 3G users)
    chart: {
      bg: 'bg-gray-50 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      grid: 'stroke-gray-200 dark:stroke-gray-700',
      primary: 'fill-indigo-600 dark:fill-indigo-400',
      secondary: 'fill-purple-600 dark:fill-purple-400',
    },

    // Utility functions
    isDark,
    
    // Conditional class helper
    conditional: (lightClass: string, darkClass: string) => 
      isDark ? darkClass : lightClass,
  };
};

export default useDarkModeClasses;
