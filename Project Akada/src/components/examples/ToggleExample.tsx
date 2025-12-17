import React from 'react';
import ThemeToggle from '../ui/ThemeToggle';
import ThemeToggleModule from '../ui/ThemeToggleModule';
import Rectangle1 from '../ui/Rectangle1';

const ToggleExample: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Theme Toggle Examples
      </h1>
      
      {/* Example 1: Tailwind-based toggle */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Tailwind-based Toggle
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Small:</span>
          <ThemeToggle size="sm" />
          
          <span className="text-sm text-gray-600 dark:text-gray-400">Medium:</span>
          <ThemeToggle size="md" />
          
          <span className="text-sm text-gray-600 dark:text-gray-400">Large:</span>
          <ThemeToggle size="lg" />
        </div>
      </div>

      {/* Example 2: CSS Module-based toggle */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          CSS Module-based Toggle
        </h2>
        <div className="w-20">
          <ThemeToggleModule />
        </div>
      </div>

      {/* Example 3: Your original Rectangle1 component (now fixed) */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Fixed Rectangle1 Component
        </h2>
        <div className="w-20">
          <Rectangle1 />
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Usage Instructions:
        </h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>• Click any toggle to switch between light and dark mode</li>
          <li>• The toggle automatically connects to your existing theme context</li>
          <li>• All toggles include proper accessibility features</li>
          <li>• Smooth animations and hover effects included</li>
        </ul>
      </div>
    </div>
  );
};

export default ToggleExample;

