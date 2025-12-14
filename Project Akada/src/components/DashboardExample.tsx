// Example: Integrating ProfileCompletionWidget into Dashboard.tsx

import React from 'react'
import ProfileCompletionWidget from './ProfileCompletionWidget'
import { useApplicationTimeline, useCostAnalysis } from '../hooks/useDashboard'
import SkeletonLoader from './ui/SkeletonLoader'

/**
 * Example Dashboard component with ProfileCompletionWidget integrated
 * This shows how to add the widget to your existing dashboard layout
 */
const DashboardWithProfileWidget: React.FC = () => {
  const { timelineData, loading: timelineLoading } = useApplicationTimeline()
  const { costData, loading: costLoading } = useCostAnalysis()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's your study abroad journey overview
          </p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Completion (Priority on mobile) */}
          <div className="lg:col-span-2">
            <ProfileCompletionWidget className="mb-6" />
            
            {/* Application Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Application Timeline
              </h2>
              {timelineLoading ? (
                <SkeletonLoader.List items={3} />
              ) : (
                <div className="space-y-3">
                  {timelineData?.upcomingDeadlines.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {app.programs.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {app.programs.university}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                          {getDaysUntilDeadline(app.deadline)} days left
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!timelineData?.upcomingDeadlines || timelineData.upcomingDeadlines.length === 0) && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No upcoming deadlines. Start by saving some programs!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="space-y-6">
            {/* Saved Programs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Saved Programs
                </h3>
                <span className="text-2xl">📚</span>
              </div>
              {costLoading ? (
                <SkeletonLoader.Line width="w-1/2" height="h-8" />
              ) : (
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {costData?.savedProgramsCosts.length || 0}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Programs matching your preferences
              </p>
            </div>

            {/* Budget Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Budget Status
                </h3>
                <span className="text-2xl">💰</span>
              </div>
              {costLoading ? (
                <SkeletonLoader.Line width="w-2/3" height="h-8" />
              ) : (
                <>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {costData?.budgetAnalysis?.budgetUtilization 
                      ? `${Math.round(costData.budgetAnalysis.budgetUtilization)}% used`
                      : 'Set budget first'
                    }
                  </p>
                  {costData?.budgetAnalysis?.affordablePrograms !== undefined && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {costData.budgetAnalysis.affordablePrograms} affordable programs
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Scholarship Opportunities */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Scholarship Opportunities
                </h3>
                <span className="text-2xl">🎓</span>
              </div>
              {costLoading ? (
                <SkeletonLoader.Line width="w-1/2" height="h-8" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {costData?.scholarshipOpportunities?.length || 0}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Available in saved programs
                  </p>
                </>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 p-4">
              <h3 className="text-sm font-medium text-indigo-800 dark:text-indigo-200 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full py-2 px-3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 rounded-md border border-indigo-300 dark:border-indigo-700 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                  Search Programs
                </button>
                <button className="w-full py-2 px-3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 rounded-md border border-indigo-300 dark:border-indigo-700 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                  Upload Documents
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-First Optimization Note */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 lg:hidden">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 Tip: Complete your profile above to unlock personalized program recommendations and scholarship opportunities worth ₦50M+
          </p>
        </div>
      </div>
    </div>
  )
}

// Helper function
const getDaysUntilDeadline = (deadline: string) => {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export default DashboardWithProfileWidget