import { useState, useEffect, useCallback } from 'react';

// ======================================
// TYPES AND CONSTANTS
// ======================================

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface DarkModeState {
  /** Current theme mode setting */
  mode: ThemeMode;
  /** Resolved theme (light/dark) */
  resolvedTheme: ResolvedTheme;
  /** Whether dark mode is currently active */
  isDark: boolean;
  /** System preference for dark mode */
  systemPrefersDark: boolean;
  /** Whether the theme has been loaded from storage */
  isLoaded: boolean;
}

interface DarkModeActions {
  /** Set theme mode (light/dark/system) */
  setMode: (mode: ThemeMode) => void;
  /** Toggle between light and dark modes */
  toggle: () => void;
  /** Enable dark mode */
  enable: () => void;
  /** Enable light mode */
  disable: () => void;
  /** Reset to system preference */
  resetToSystem: () => void;
}

const STORAGE_KEY = 'akada-theme-mode';
const DARK_MODE_CLASS = 'dark';

// ======================================
// CORE DARK MODE HOOK
// ======================================

/**
 * Advanced dark mode hook with system preference detection
 * Optimized for data visualization with better contrast
 * Works offline with localStorage persistence
 */
export const useDarkMode = (): DarkModeState & DarkModeActions => {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Detect system preference
  const updateSystemPreference = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemPrefersDark(mediaQuery.matches);
      return mediaQuery.matches;
    } catch (error) {
      console.warn('Failed to detect system color scheme:', error);
      return false;
    }
  }, []);

  // Calculate resolved theme
  const resolvedTheme: ResolvedTheme = mode === 'system' 
    ? (systemPrefersDark ? 'dark' : 'light')
    : mode as ResolvedTheme;

  const isDark = resolvedTheme === 'dark';

  // Apply theme to document
  const applyTheme = useCallback((theme: ResolvedTheme) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;

    const enableDark = theme === 'dark';

    if (enableDark) {
      root.classList.add(DARK_MODE_CLASS);
      root.style.colorScheme = 'dark';
      if (body) {
        body.classList.add('darkMode');
        body.dataset.theme = 'dark';
      }
    } else {
      root.classList.remove(DARK_MODE_CLASS);
      root.style.colorScheme = 'light';
      if (body) {
        body.classList.remove('darkMode');
        body.dataset.theme = 'light';
      }
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#111827' : '#ffffff');
    }
  }, []);

  // Load theme from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
        setModeState(saved as ThemeMode);
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }

    // Detect initial system preference
    updateSystemPreference();
    setIsLoaded(true);
  }, [updateSystemPreference]);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    // Use modern addEventListener if available, fallback to addListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (!isLoaded) return;
    applyTheme(resolvedTheme);
  }, [resolvedTheme, applyTheme, isLoaded]);

  // Actions
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, []);

  const toggle = useCallback(() => {
    if (mode === 'system') {
      // If currently system, toggle to opposite of current resolved theme
      setMode(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else {
      // If light/dark, toggle to opposite
      setMode(mode === 'dark' ? 'light' : 'dark');
    }
  }, [mode, resolvedTheme, setMode]);

  const enable = useCallback(() => {
    setMode('dark');
  }, [setMode]);

  const disable = useCallback(() => {
    setMode('light');
  }, [setMode]);

  const resetToSystem = useCallback(() => {
    setMode('system');
  }, [setMode]);

  return {
    // State
    mode,
    resolvedTheme,
    isDark,
    systemPrefersDark,
    isLoaded,
    
    // Actions
    setMode,
    toggle,
    enable,
    disable,
    resetToSystem
  };
};

// ======================================
// UTILITY HOOKS
// ======================================

/**
 * Simple dark mode detection hook
 * Returns true if dark mode is active
 */
export const useIsDark = (): boolean => {
  const { isDark } = useDarkMode();
  return isDark;
};

/**
 * Theme-aware CSS class helper
 * Returns appropriate classes based on current theme
 */
export const useThemeClasses = () => {
  const { isDark, resolvedTheme } = useDarkMode();
  
  return {
    isDark,
    theme: resolvedTheme,
    
    // Common class patterns
    bg: isDark ? 'bg-gray-900' : 'bg-white',
    text: isDark ? 'text-gray-100' : 'text-gray-900',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    hover: isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50',
    
    // Data visualization optimized colors
    chartBg: isDark ? 'bg-gray-800' : 'bg-gray-50',
    chartText: isDark ? 'text-gray-200' : 'text-gray-700',
    chartBorder: isDark ? 'border-gray-600' : 'border-gray-300',
    
    // High contrast colors for better accessibility
    primaryText: isDark ? 'text-white' : 'text-gray-900',
    secondaryText: isDark ? 'text-gray-300' : 'text-gray-600',
    mutedText: isDark ? 'text-gray-400' : 'text-gray-500',
    
    // Interactive elements
    button: isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200',
    input: isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
    
    // Status colors (optimized for dark mode)
    success: isDark ? 'text-green-400' : 'text-green-600',
    warning: isDark ? 'text-yellow-400' : 'text-yellow-600',
    error: isDark ? 'text-red-400' : 'text-red-600',
    info: isDark ? 'text-blue-400' : 'text-blue-600'
  };
};

// ======================================
// THEME INITIALIZATION
// ======================================

/**
 * Initialize theme on app load
 * Call this once at the root of your app
 */
export const initializeTheme = () => {
  if (typeof window === 'undefined') return;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const mode = (saved === 'light' || saved === 'dark' || saved === 'system') ? saved : 'system';
    
    // Determine initial theme
    let theme: ResolvedTheme = 'light';
    if (mode === 'dark') {
      theme = 'dark';
    } else if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      theme = mediaQuery.matches ? 'dark' : 'light';
    }
    
    // Apply theme immediately to prevent flash
    const root = document.documentElement;
    const body = document.body;
    const enableDark = theme === 'dark';

    if (enableDark) {
      root.classList.add(DARK_MODE_CLASS);
      root.style.colorScheme = 'dark';
      if (body) {
        body.classList.add('darkMode');
        body.dataset.theme = 'dark';
      }
    } else {
      root.classList.remove(DARK_MODE_CLASS);
      root.style.colorScheme = 'light';
      if (body) {
        body.classList.remove('darkMode');
        body.dataset.theme = 'light';
      }
    }
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#111827' : '#ffffff');
    }
  } catch (error) {
    console.warn('Failed to initialize theme:', error);
  }
};

// ======================================
// REACT CONTEXT PROVIDER (Optional)
// ======================================

import { createContext, useContext, ReactNode } from 'react';

const DarkModeContext = createContext<(DarkModeState & DarkModeActions) | null>(null);

interface DarkModeProviderProps {
  children: ReactNode;
}

/**
 * Optional context provider for dark mode
 * Use this if you want to avoid multiple hook instances
 */
export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
  const darkMode = useDarkMode();

  return (
    <DarkModeContext.Provider value={darkMode}>
      {children}
    </DarkModeContext.Provider>
  );
};

/**
 * Use dark mode from context
 * Must be used within DarkModeProvider
 */
export const useDarkModeContext = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkModeContext must be used within DarkModeProvider');
  }
  return context;
};

export default useDarkMode;