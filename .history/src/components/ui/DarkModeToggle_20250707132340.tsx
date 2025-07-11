import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface DarkModeToggleProps {
  className?: string;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'
        }`}
        aria-label="Toggle theme"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
        <span className="sr-only">Toggle theme</span>
      </button>
    </div>
  );
};

export default DarkModeToggle;