import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface PixelToggleProps {
  className?: string;
}

const PixelToggle: React.FC<PixelToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-16 h-8 rounded-full transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2
        ${isDark 
          ? 'bg-gray-800 shadow-inner' 
          : 'bg-gray-200 shadow-lg'
        }
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Track shadow effect */}
      <div 
        className={`
          absolute inset-0 rounded-full transition-all duration-300
          ${isDark 
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
          ${isDark ? 'translate-x-8' : 'translate-x-1'}
          ${isDark
            ? 'bg-white shadow-lg border border-gray-200'
            : 'bg-gray-800 shadow-lg border border-gray-600'
          }
        `}
      >
        {/* Pixel Sun Icon */}
        {!isDark && (
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
        {isDark && (
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
    </button>
  );
};

export default PixelToggle;

