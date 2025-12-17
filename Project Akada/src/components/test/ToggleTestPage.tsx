import React from 'react';
import PixelToggle from '../ui/PixelToggle';
import ThemeToggle from '../ui/ThemeToggle';
import Rectangle1 from '../ui/Rectangle1';

const ToggleTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Theme Toggle Test Page
        </h1>
        
        {/* Pixel Toggle (Main one) */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Pixel Toggle (Currently in Sidebar)
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Theme:</span>
            <PixelToggle />
            <span className="text-xs text-gray-500 dark:text-gray-500">
              Click to toggle between light and dark mode
            </span>
          </div>
        </div>

        {/* Different sizes */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Different Toggle Styles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Modern Toggle
              </h3>
              <div className="flex justify-center">
                <ThemeToggle size="md" />
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Pixel Toggle
              </h3>
              <div className="flex justify-center">
                <PixelToggle />
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Rectangle1 (Fixed)
              </h3>
              <div className="flex justify-center w-20">
                <Rectangle1 />
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            ✅ Toggle Fixed Successfully!
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <li>• <strong>Pixel Icons:</strong> Custom pixel-perfect sun and moon icons matching your images</li>
            <li>• <strong>Neumorphic Design:</strong> Uses your exact shadow specifications</li>
            <li>• <strong>Smooth Animation:</strong> 300ms transition between light/dark modes</li>
            <li>• <strong>Proper Colors:</strong> Light track in light mode, dark track in dark mode</li>
            <li>• <strong>Accessibility:</strong> ARIA labels and keyboard support</li>
            <li>• <strong>Integration:</strong> Connected to your existing theme system</li>
          </ul>
        </div>

        {/* Theme Demo */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-lg text-white">
          <h3 className="font-semibold mb-2">Theme Demo</h3>
          <p className="text-indigo-100">
            This section changes color based on the current theme. Toggle the theme above to see the difference!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ToggleTestPage;

