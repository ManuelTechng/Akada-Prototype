import React from 'react'
import { Bell, Clock, AlertTriangle, CheckCircle, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useReminders } from '../../hooks/useReminders'
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns'
import { cn } from '../../lib/utils'
import { useTheme } from '../../contexts/ThemeContext'
import SkeletonLoader from '../ui/SkeletonLoader'

interface ReminderWidgetProps {
  className?: string
}

export function GlassReminderWidget({ className }: ReminderWidgetProps) {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { upcomingReminders, loading, error } = useReminders()

  const getUrgencyColor = (scheduledFor: string) => {
    const date = new Date(scheduledFor)
    const now = new Date()
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffInHours <= 24) return 'text-red-600 dark:text-red-400'
    if (diffInHours <= 72) return 'text-orange-600 dark:text-orange-400'
    return 'text-blue-600 dark:text-blue-400'
  }

  const getUrgencyIcon = (scheduledFor: string) => {
    const date = new Date(scheduledFor)
    const now = new Date()
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffInHours <= 24) return <AlertTriangle className="h-4 w-4" />
    if (diffInHours <= 72) return <Clock className="h-4 w-4" />
    return <Bell className="h-4 w-4" />
  }

  const formatReminderTime = (scheduledFor: string) => {
    const date = new Date(scheduledFor)
    
    if (isToday(date)) {
      return `Today at ${format(date, 'HH:mm')}`
    }
    
    if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'HH:mm')}`
    }
    
    if (isThisWeek(date)) {
      return format(date, 'EEEE \'at\' HH:mm')
    }
    
    return format(date, 'MMM dd \'at\' HH:mm')
  }

  const getUrgencyBadge = (scheduledFor: string) => {
    const date = new Date(scheduledFor)
    const now = new Date()
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffInHours <= 24) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800">
          Urgent
        </span>
      )
    }
    
    if (diffInHours <= 72) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
          Soon
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        Upcoming
      </span>
    )
  }

  if (loading) {
    return <SkeletonLoader.DashboardWidget variant="list" className={className} />
  }

  if (error) {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-2xl backdrop-blur-xl border p-6 text-center",
        isDark 
          ? 'bg-gray-900/40 border-white/10' 
          : 'bg-white/80 border-gray-200',
        className
      )}>
        <div className="relative z-10">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Reminders
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please try again later
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl backdrop-blur-xl border p-6 space-y-4",
      isDark 
        ? 'bg-gray-900/40 border-white/10' 
        : 'bg-white/80 border-gray-200',
      className
    )}>
      {/* Glass effect overlay */}
      <div className={cn(
        "absolute inset-0",
        isDark 
          ? 'bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20' 
          : 'bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50'
      )} />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            Reminders
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Stay on top of your deadlines
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/reminders')}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Reminders List */}
      <div className="relative z-10 space-y-3">
        {upcomingReminders && upcomingReminders.length > 0 ? (
          upcomingReminders.slice(0, 3).map((reminder) => (
            <div
              key={reminder.id}
              className={cn(
                "relative overflow-hidden rounded-xl backdrop-blur-sm border p-3 transition-all duration-200 hover:shadow-md",
                isDark 
                  ? 'bg-gray-800/40 border-white/10' 
                  : 'bg-white/60 border-gray-200'
              )}
            >
              {/* Glass effect overlay */}
              <div className={cn(
                "absolute inset-0",
                isDark 
                  ? 'bg-gradient-to-br from-gray-500/10 to-blue-500/10' 
                  : 'bg-gradient-to-br from-gray-50/50 to-blue-50/30'
              )} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {reminder.type || 'Reminder'}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {reminder.data?.message || reminder.data?.title || 'No details available'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getUrgencyBadge(reminder.scheduled_for)}
                    <div className={cn("flex items-center space-x-1", getUrgencyColor(reminder.scheduled_for))}>
                      {getUrgencyIcon(reminder.scheduled_for)}
                      <span className="text-xs font-medium">
                        {formatReminderTime(reminder.scheduled_for)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <Bell className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              No Reminders
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              You don't have any upcoming reminders
            </p>
            <button
              onClick={() => navigate('/dashboard/reminders')}
              className="bg-indigo-600 dark:bg-indigo-500 text-white text-xs font-medium py-2 px-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
            >
              Create Reminder
            </button>
          </div>
        )}
      </div>

      {/* Show More Button */}
      {upcomingReminders && upcomingReminders.length > 3 && (
        <div className="relative z-10 text-center pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => navigate('/dashboard/reminders')}
            className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            View All Reminders ({upcomingReminders.length})
          </button>
        </div>
      )}
    </div>
  )
}

export default GlassReminderWidget
