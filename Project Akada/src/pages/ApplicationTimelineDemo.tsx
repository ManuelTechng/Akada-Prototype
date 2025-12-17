import React from 'react'
import ApplicationTimelineWidget from '../components/dashboard/ApplicationTimelineWidget'

/**
 * Demo page for the Application Timeline Widget
 * Showcases all features and responsive behavior
 */
const ApplicationTimelineDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Application Timeline Widget Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Track application deadlines with Nigerian-optimized interface
          </p>
        </div>

        {/* Widget showcase */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Full Widget
            </h2>
            <ApplicationTimelineWidget />
          </div>

          {/* Responsive demos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Mobile View (375px)
              </h2>
              <div className="max-w-sm mx-auto lg:mx-0">
                <ApplicationTimelineWidget />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tablet View (768px)
              </h2>
              <div className="max-w-md">
                <ApplicationTimelineWidget />
              </div>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Features Implemented
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white">✅ Core Features</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Real-time countdown timers</li>
                <li>• Urgency indicators (overdue, urgent, upcoming)</li>
                <li>• Nigerian date formatting (DD/MM/YYYY)</li>
                <li>• NGN currency formatting</li>
                <li>• Mobile-first responsive design</li>
                <li>• Dark mode support</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white">✅ Advanced Features</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Smart filtering (All, Urgent, Upcoming)</li>
                <li>• Timeline insights and alerts</li>
                <li>• Quick action buttons</li>
                <li>• Empty state with onboarding</li>
                <li>• Skeleton loading states</li>
                <li>• Error handling with retry</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Technical Implementation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Performance Optimizations</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Memoized application processing</li>
                <li>• Efficient countdown timer updates</li>
                <li>• Minimal re-renders with React.memo patterns</li>
                <li>• 3G-optimized skeleton loading</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Nigerian-First Design</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• NGN currency formatting with proper localization</li>
                <li>• DD/MM/YYYY date format</li>
                <li>• West Africa Time (WAT) awareness</li>
                <li>• Mobile-first with 44px touch targets</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            How to Use
          </h2>
          <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            <p>
              <strong>1. Integration:</strong> Import the component and add it to any dashboard or page
            </p>
            <p>
              <strong>2. Data Source:</strong> Uses the `useApplicationTimeline` hook from `useDashboard.ts`
            </p>
            <p>
              <strong>3. Responsive:</strong> Automatically adapts from mobile (375px) to desktop (1024px+)
            </p>
            <p>
              <strong>4. Customization:</strong> Pass className prop for custom styling and spacing
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicationTimelineDemo