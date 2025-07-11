import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface DarkModeToggleProps {
  className?: string;
  variant?: 'switch' | 'buttons' | 'dropdown';
  showLabel?: boolean;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  className = '',
  variant = 'switch',
  showLabel = true
}) => {
  const { theme, mode, toggleTheme, setMode } = useTheme();

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Theme</span>
        )}
        <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
          <button
            onClick={() => setMode('light')}
            className={`p-2 rounded-md transition-colors ${
              mode === 'light'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
            aria-label="Light mode"
          >
            <Sun className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMode('system')}
            className={`p-2 rounded-md transition-colors ${
              mode === 'system'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
            aria-label="System mode"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMode('dark')}
            className={`p-2 rounded-md transition-colors ${
              mode === 'dark'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
            aria-label="Dark mode"
          >
            <Moon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Default switch variant
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Theme {mode === 'system' && '(Auto)'}
        </span>
      )}
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
          theme === 'dark' ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'
        }`}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform flex items-center justify-center ${
            theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
          }`}
        >
          {theme === 'dark' ? (
            <Moon className="h-2.5 w-2.5 text-indigo-600" />
          ) : (
            <Sun className="h-2.5 w-2.5 text-yellow-500" />
          )}
        </span>
        <span className="sr-only">Toggle theme</span>
      </button>
    </div>
  );
};

export default DarkModeToggle;