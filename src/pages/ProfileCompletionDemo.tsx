import React from 'react'
import ProfileCompletionWidget from '../components/ProfileCompletionWidget'
import { AuthProvider } from '../contexts/AuthContext'

/**
 * Demo page to showcase the ProfileCompletionWidget
 * This demonstrates how the widget looks in different completion states
 */
const ProfileCompletionDemo: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Profile Completion Widget Demo
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Showcasing the ProfileCompletionWidget for Akada's Dashboard
            </p>
          </div>

          {/* Widget in different contexts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Desktop view */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Desktop View (Full Width)
              </h2>
              <ProfileCompletionWidget className="w-full" />
            </div>

            {/* Mobile view simulation */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Mobile View (375px)
              </h2>
              <div className="max-w-[375px] mx-auto border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800">
                <ProfileCompletionWidget />
              </div>
            </div>
          </div>

          {/* Widget in dashboard context */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              In Dashboard Context
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Profile Completion Widget */}
              <div className="md:col-span-2">
                <ProfileCompletionWidget />
              </div>
              
              {/* Other dashboard widget mockup */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Saved Programs</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Applications</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features showcase */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Widget Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Visual Features</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Circular progress ring with animated percentage
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Color-coded progress (red, orange, green)
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Section breakdown with checkmarks
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Confetti animation at 100% completion
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Skeleton loading states
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Nigerian-Specific Elements</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    "Unlock ₦50M+ in scholarships" messaging
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Encouraging, personalized messages
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Mobile-first design (375px optimized)
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Touch-friendly targets (44px minimum)
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Local context references (WAEC/NECO)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Progress states showcase */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Progress States
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">0-30% - Just Getting Started</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Red progress ring, high urgency messaging</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">31-69% - Making Progress</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Orange progress ring, medium urgency</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">70%+ - Profile Optimized</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Green progress ring, low urgency, sparkle icon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  )
}

export default ProfileCompletionDemo