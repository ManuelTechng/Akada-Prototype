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

  // Default switch variant with pixel-perfect design
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Theme {mode === 'system' && '(Auto)'}
        </span>
      )}
      <button
        onClick={toggleTheme}
        className={`
          relative w-16 h-8 rounded-full transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2
          dark:focus:ring-offset-gray-800
          ${theme === 'dark' 
            ? 'bg-gray-800 shadow-inner' 
            : 'bg-gray-200 shadow-lg'
          }
        `}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {/* Track shadow effect */}
        <div 
          className={`
            absolute inset-0 rounded-full transition-all duration-300
            ${theme === 'dark' 
              ? 'shadow-[0px_3.22px_3.22px_rgba(0,0,0,0.25),8.05px_8.05px_16.1px_#24272c]'
              : 'shadow-[-7.1px_-7.1px_14.2px_rgba(233,234,240,0.7),7.1px_7.1px_14.2px_rgba(36,39,44,0.7)]'
            }
          `}
        />
        
        {/* Thumb */}
        <span
          className={`
            relative inline-flex items-center justify-center rounded-full 
            transition-all duration-300 ease-in-out transform
            h-6 w-6
            ${theme === 'dark' ? 'translate-x-8' : 'translate-x-1'}
            ${theme === 'dark'
              ? 'bg-white shadow-lg border border-gray-200'
              : 'bg-gray-800 shadow-lg border border-gray-600'
            }
          `}
        >
          {/* Pixel Sun Icon */}
          {theme !== 'dark' && (
            <div className="relative w-4 h-4">
              {/* Sun rays */}
              <div className="absolute inset-0">
                {/* Top ray */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-white"></div>
                {/* Top right ray */}
                <div className="absolute top-1 right-1 w-0.5 h-1 bg-white transform rotate-45"></div>
                {/* Right ray */}
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-0.5 bg-white"></div>
                {/* Bottom right ray */}
                <div className="absolute bottom-1 right-1 w-0.5 h-1 bg-white transform rotate-45"></div>
                {/* Bottom ray */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-white"></div>
                {/* Bottom left ray */}
                <div className="absolute bottom-1 left-1 w-0.5 h-1 bg-white transform rotate-45"></div>
                {/* Left ray */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-0.5 bg-white"></div>
                {/* Top left ray */}
                <div className="absolute top-1 left-1 w-0.5 h-1 bg-white transform rotate-45"></div>
              </div>
              {/* Sun center */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-800 rounded-sm"></div>
              {/* Sun center border */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 border border-white"></div>
            </div>
          )}

          {/* Pixel Moon Icon */}
          {theme === 'dark' && (
            <div className="relative w-4 h-4">
              {/* Moon crescent */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                {/* Moon body (hidden part) */}
                <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                {/* Moon crescent (visible part) */}
                <div className="absolute top-0 left-0 w-3 h-3 border-2 border-white rounded-full"></div>
                {/* Crescent cutout */}
                <div className="absolute top-0.5 left-1 w-2 h-2 bg-gray-800 rounded-full"></div>
              </div>
            </div>
          )}
        </span>
        <span className="sr-only">Toggle theme</span>
      </button>
    </div>
  );
};

export default DarkModeToggle;