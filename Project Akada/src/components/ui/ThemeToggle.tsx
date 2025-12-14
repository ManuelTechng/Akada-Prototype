import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '',
  size = 'md'
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const sizeClasses = {
    sm: {
      track: 'h-6 w-11',
      thumb: 'h-4 w-4',
      icon: 'h-2.5 w-2.5',
      translate: isDark ? 'translate-x-5' : 'translate-x-0.5'
    },
    md: {
      track: 'h-8 w-14',
      thumb: 'h-6 w-6',
      icon: 'h-3.5 w-3.5',
      translate: isDark ? 'translate-x-6' : 'translate-x-1'
    },
    lg: {
      track: 'h-10 w-18',
      thumb: 'h-8 w-8',
      icon: 'h-4 w-4',
      translate: isDark ? 'translate-x-8' : 'translate-x-1'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        // Track styles
        'relative inline-flex items-center rounded-full transition-all duration-300 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2',
        'dark:focus:ring-offset-gray-800',
        currentSize.track,
        
        // Track background colors
        isDark 
          ? 'bg-gray-800 shadow-inner' 
          : 'bg-gray-200 shadow-lg',
        
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Track shadow effect */}
      <div 
        className={cn(
          'absolute inset-0 rounded-full transition-all duration-300',
          isDark 
            ? 'shadow-[0px_3.22px_3.22px_rgba(0,0,0,0.25),8.05px_8.05px_16.1px_#24272c]'
            : 'shadow-[-7.1px_-7.1px_14.2px_rgba(233,234,240,0.7),7.1px_7.1px_14.2px_rgba(36,39,44,0.7)]'
        )}
      />
      
      {/* Thumb */}
      <span
        className={cn(
          'relative inline-flex items-center justify-center rounded-full transition-all duration-300 ease-in-out',
          'transform',
          currentSize.thumb,
          currentSize.translate,
          
          // Thumb styling
          isDark
            ? 'bg-white shadow-lg border border-gray-200'
            : 'bg-gray-800 shadow-lg border border-gray-600'
        )}
      >
        {/* Icon */}
        <div className="flex items-center justify-center">
          {isDark ? (
            <Moon className={cn(currentSize.icon, 'text-gray-800')} />
          ) : (
            <Sun className={cn(currentSize.icon, 'text-white')} />
          )}
        </div>
      </span>
    </button>
  );
};

export default ThemeToggle;

