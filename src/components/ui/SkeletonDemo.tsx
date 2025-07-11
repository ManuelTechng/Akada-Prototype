import React, { useState } from 'react';
import SkeletonLoader from './SkeletonLoader';

/**
 * Demo component showing all skeleton variations
 * Use this for testing and development
 */
const SkeletonDemo: React.FC = () => {
  const [showSkeletons, setShowSkeletons] = useState(true);

  return (
    <div className="p-6 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          3G-Optimized Skeleton Loaders
        </h1>
        <button
          onClick={() => setShowSkeletons(!showSkeletons)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          {showSkeletons ? 'Hide Skeletons' : 'Show Skeletons'}
        </button>
      </div>

      {showSkeletons && (
        <>
          {/* Program Card Skeletons */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Program Card Skeletons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonLoader.ProgramCard />
              <SkeletonLoader.ProgramCard />
            </div>
          </section>

          {/* Dashboard Widget Skeletons */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Dashboard Widget Skeletons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SkeletonLoader.DashboardWidget variant="stats" />
              <SkeletonLoader.DashboardWidget variant="list" />
              <SkeletonLoader.DashboardWidget variant="chart" />
            </div>
          </section>

          {/* Cost Chart Skeleton */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Cost Chart Skeleton
            </h2>
            <div className="max-w-2xl">
              <SkeletonLoader.CostChart />
            </div>
          </section>

          {/* Application Card Skeletons */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Application Card Skeletons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonLoader.ApplicationCard />
              <SkeletonLoader.ApplicationCard />
            </div>
          </section>

          {/* List Skeleton */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              List Skeletons
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 max-w-md">
              <SkeletonLoader.List items={4} />
            </div>
          </section>

          {/* Complete Dashboard Grid */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Complete Dashboard Loading State
            </h2>
            <SkeletonLoader.DashboardGrid />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonLoader.DashboardWidget variant="list" />
              <SkeletonLoader.CostChart />
            </div>
          </section>
        </>
      )}

      {/* Bundle Size Info */}
      <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          3G Optimization Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Bundle Size Optimization
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• &lt;2KB total bundle size</li>
              <li>• Tailwind-only styling (no custom CSS)</li>
              <li>• Shared base classes for minimal duplication</li>
              <li>• Tree-shakeable component exports</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Performance Features
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Minimal DOM nodes</li>
              <li>• Efficient CSS animations</li>
              <li>• Reusable micro-components</li>
              <li>• Dark mode support</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SkeletonDemo;