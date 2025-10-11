import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  CalendarIcon, 
  ClockIcon, 
  AlertTriangleIcon, 
  CheckCircleIcon,
  XCircleIcon,
  BookOpenIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  PlayCircleIcon,
  BellIcon,
  EyeIcon
} from 'lucide-react'
import SkeletonLoader from '../ui/SkeletonLoader'
import { useApplicationTimeline } from '../../hooks/useDashboard'
import { akadaTokens, formatCurrency } from '../../styles/tokens'
import { formatNGN } from '../../utils/currency'
import { cn } from '../../lib/utils'

// ======================================
// TYPES AND INTERFACES
// ======================================

interface ApplicationCardProps {
  application: any
  onViewDetails: (id: string) => void
  onSubmitNow: (id: string) => void
  onSetReminder: (id: string) => void
  isCompact?: boolean
}

interface CountdownTimerProps {
  deadline: string
  className?: string
}

interface UrgencyBadgeProps {
  daysLeft: number
  status: string
  className?: string
}

// ======================================
// UTILITY FUNCTIONS
// ======================================

/**
 * Get urgency level based on days until deadline
 */
const getUrgencyLevel = (daysLeft: number, status: string) => {
  if (status === 'submitted' || status === 'accepted' || status === 'rejected') {
    return 'completed'
  }
  
  if (daysLeft < 0) return 'overdue'
  if (daysLeft <= 7) return 'urgent'
  if (daysLeft <= 30) return 'upcoming'
  return 'future'
}

/**
 * Get status configuration for application statuses
 */
const getStatusConfig = (status: string) => {
  const configs = {
    planning: { 
      color: 'bg-gray-500', 
      textColor: 'text-gray-700 dark:text-gray-300',
      bgColor: 'bg-gray-50 dark:bg-gray-800',
      label: 'Planning' 
    },
    submitted: { 
      color: 'bg-blue-500', 
      textColor: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      label: 'Submitted' 
    },
    'in-review': { 
      color: 'bg-yellow-500', 
      textColor: 'text-yellow-700 dark:text-yellow-300',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      label: 'In Review' 
    },
    accepted: { 
      color: 'bg-green-500', 
      textColor: 'text-green-700 dark:text-green-300',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      label: 'Accepted' 
    },
    rejected: { 
      color: 'bg-red-500', 
      textColor: 'text-red-700 dark:text-red-300',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      label: 'Rejected' 
    },
    deferred: { 
      color: 'bg-orange-500', 
      textColor: 'text-orange-700 dark:text-orange-300',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      label: 'Deferred' 
    }
  }
  
  return configs[status as keyof typeof configs] || configs.planning
}

/**
 * Get urgency styling configuration
 */
const getUrgencyConfig = (urgencyLevel: string) => {
  const configs = {
    overdue: {
      borderColor: 'border-red-300 dark:border-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/10',
      iconColor: 'text-red-600 dark:text-red-400',
      badgeColor: 'bg-red-500 text-white',
      label: 'OVERDUE',
      icon: AlertTriangleIcon,
      priority: 4
    },
    urgent: {
      borderColor: 'border-orange-300 dark:border-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/10',
      iconColor: 'text-orange-600 dark:text-orange-400',
      badgeColor: 'bg-orange-500 text-white',
      label: 'URGENT',
      icon: ClockIcon,
      priority: 3
    },
    upcoming: {
      borderColor: 'border-yellow-300 dark:border-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/10',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      badgeColor: 'bg-yellow-500 text-white',
      label: 'UPCOMING',
      icon: CalendarIcon,
      priority: 2
    },
    future: {
      borderColor: 'border-gray-200 dark:border-gray-700',
      bgColor: 'bg-white dark:bg-gray-800',
      iconColor: 'text-gray-500 dark:text-gray-400',
      badgeColor: 'bg-gray-500 text-white',
      label: 'SCHEDULED',
      icon: CalendarIcon,
      priority: 1
    },
    completed: {
      borderColor: 'border-green-200 dark:border-green-700',
      bgColor: 'bg-green-50 dark:bg-green-900/10',
      iconColor: 'text-green-600 dark:text-green-400',
      badgeColor: 'bg-green-500 text-white',
      label: 'COMPLETED',
      icon: CheckCircleIcon,
      priority: 0
    }
  }
  
  return configs[urgencyLevel as keyof typeof configs] || configs.future
}

/**
 * Format Nigerian date (DD/MM/YYYY format)
 */
const formatNigerianDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    // Nigerian date format: DD/MM/YYYY
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

/**
 * Format time until deadline for Nigerian users
 */
const formatTimeUntilDeadline = (daysLeft: number) => {
  if (daysLeft < 0) {
    const overdueDays = Math.abs(daysLeft)
    return `${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue`
  }
  
  if (daysLeft === 0) return 'Due today!'
  if (daysLeft === 1) return 'Due tomorrow'
  if (daysLeft <= 7) return `${daysLeft} days left`
  if (daysLeft <= 30) return `${daysLeft} days left`
  
  const weeks = Math.floor(daysLeft / 7)
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} left`
  
  const months = Math.floor(daysLeft / 30)
  return `${months} month${months > 1 ? 's' : ''} left`
}

// ======================================
// COUNTDOWN TIMER COMPONENT
// ======================================

const CountdownTimer: React.FC<CountdownTimerProps> = ({ deadline, className }) => {
  const [timeLeft, setTimeLeft] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime()
      const deadlineTime = new Date(deadline).getTime()
      const difference = deadlineTime - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

        // Set urgency for items less than 24 hours
        setIsUrgent(difference < 24 * 60 * 60 * 1000)

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h`)
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`)
        } else {
          setTimeLeft(`${minutes}m`)
        }
      } else {
        setTimeLeft('Overdue')
        setIsUrgent(true)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [deadline])

  return (
    <div className={cn(
      'flex items-center space-x-1 text-sm font-medium',
      isUrgent ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400',
      className
    )}>
      <ClockIcon className={cn(
        'w-4 h-4',
        isUrgent && 'animate-pulse'
      )} />
      <span>{timeLeft}</span>
    </div>
  )
}

// ======================================
// URGENCY BADGE COMPONENT
// ======================================

const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ daysLeft, status, className }) => {
  const urgencyLevel = getUrgencyLevel(daysLeft, status)
  const config = getUrgencyConfig(urgencyLevel)
  const Icon = config.icon

  if (urgencyLevel === 'completed' || urgencyLevel === 'future') {
    return null // Don't show badge for completed or future items
  }

  return (
    <div className={cn(
      'inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold',
      config.badgeColor,
      className
    )}>
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </div>
  )
}

// ======================================
// APPLICATION CARD COMPONENT
// ======================================

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onViewDetails,
  onSubmitNow,
  onSetReminder,
  isCompact = false
}) => {
  const daysLeft = Math.ceil((new Date(application.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const urgencyLevel = getUrgencyLevel(daysLeft, application.status)
  const urgencyConfig = getUrgencyConfig(urgencyLevel)
  const statusConfig = getStatusConfig(application.status)
  
  const program = application.programs
  const canSubmit = ['planning', 'in-progress'].includes(application.status) && daysLeft >= 0

  return (
    <div className={cn(
      'rounded-lg border p-4 space-y-3 transition-all duration-200',
      'hover:shadow-md transform hover:-translate-y-0.5',
      urgencyConfig.borderColor,
      urgencyConfig.bgColor,
      isCompact && 'p-3 space-y-2'
    )}>
      {/* Header with program info and urgency badge */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            'font-semibold text-gray-900 dark:text-white truncate',
            isCompact ? 'text-sm' : 'text-base'
          )}>
            {program.name}
          </h4>
          <p className={cn(
            'text-gray-600 dark:text-gray-400 truncate',
            isCompact ? 'text-xs' : 'text-sm'
          )}>
            {program.university}, {program.country}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-1 ml-2">
          <UrgencyBadge daysLeft={daysLeft} status={application.status} />
          <span className={cn(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            statusConfig.color,
            'text-white'
          )}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Timeline info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
            <CalendarIcon className="w-4 h-4" />
            <span>Due: {formatNigerianDate(application.deadline)}</span>
          </div>
          {urgencyLevel !== 'completed' && daysLeft !== undefined && (
            <CountdownTimer deadline={application.deadline} />
          )}
        </div>
      </div>

      {/* Application fee (if available) */}
      {program.application_fee && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Application fee: {formatNGN(program.application_fee)}
        </div>
      )}

      {/* Time remaining display */}
      <div className={cn(
        'text-sm font-medium',
        urgencyLevel === 'overdue' ? 'text-red-600 dark:text-red-400' :
        urgencyLevel === 'urgent' ? 'text-orange-600 dark:text-orange-400' :
        'text-gray-600 dark:text-gray-400'
      )}>
        {formatTimeUntilDeadline(daysLeft)}
      </div>

      {/* Notes (if any) */}
      {application.notes && !isCompact && (
        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded p-2">
          <strong>Notes:</strong> {application.notes}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={() => onViewDetails(application.id)}
          className={cn(
            'inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium',
            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
            'hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
            isCompact && 'px-2 py-1 text-xs'
          )}
        >
          <EyeIcon className="w-4 h-4" />
          <span>View Details</span>
        </button>

        {canSubmit && urgencyLevel !== 'completed' && (
          <button
            onClick={() => onSubmitNow(application.id)}
            className={cn(
              'inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium',
              urgencyLevel === 'urgent' || urgencyLevel === 'overdue' 
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white',
              'transition-colors',
              isCompact && 'px-2 py-1 text-xs'
            )}
          >
            <PlayCircleIcon className="w-4 h-4" />
            <span>Submit Now</span>
          </button>
        )}

        {urgencyLevel !== 'completed' && (
          <button
            onClick={() => onSetReminder(application.id)}
            className={cn(
              'inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium',
              'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
              'hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors',
              isCompact && 'px-2 py-1 text-xs'
            )}
          >
            <BellIcon className="w-4 h-4" />
            <span>Remind Me</span>
          </button>
        )}
      </div>
    </div>
  )
}

// ======================================
// EMPTY STATE COMPONENT
// ======================================

const EmptyState: React.FC<{ onBrowsePrograms: () => void }> = ({ onBrowsePrograms }) => (
  <div className="text-center py-12 px-4">
    <div className="mx-auto w-24 h-24 mb-4 text-gray-400 dark:text-gray-600">
      <BookOpenIcon className="w-full h-full" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      Start Your Journey!
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
      Track your applications and never miss a deadline. Begin by saving programs that interest you.
    </p>
    <button
      onClick={onBrowsePrograms}
      className={cn(
        'inline-flex items-center space-x-2 px-6 py-3 rounded-md font-medium',
        'bg-indigo-600 text-white hover:bg-indigo-700',
        'transition-colors duration-200'
      )}
    >
      <BookOpenIcon className="w-5 h-5" />
      <span>Browse Programs</span>
    </button>
    
    {/* Quick tips */}
    <div className="mt-8 text-left max-w-md mx-auto">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Getting Started Tips:
      </h4>
      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <li className="flex items-start space-x-2">
          <span className="text-indigo-500 mt-0.5">•</span>
          <span>Save programs that match your interests and budget</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-indigo-500 mt-0.5">•</span>
          <span>Set realistic deadlines to stay organized</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-indigo-500 mt-0.5">•</span>
          <span>Apply early to increase your chances of acceptance</span>
        </li>
      </ul>
    </div>
  </div>
)

// ======================================
// MAIN WIDGET COMPONENT
// ======================================

export const ApplicationTimelineWidget: React.FC<{ className?: string }> = ({ className }) => {
  const navigate = useNavigate()
  const { 
    timelineData, 
    loading, 
    error,
    refetchTimeline,
    getDaysUntilDeadline,
    getTimelineInsights
  } = useApplicationTimeline()

  const [viewMode, setViewMode] = useState<'all' | 'urgent' | 'upcoming'>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Memoized processed applications
  const processedApplications = useMemo(() => {
    if (!timelineData?.applications) return []

    return timelineData.applications.map(app => ({
      ...app,
      daysLeft: getDaysUntilDeadline(app.deadline),
      urgencyLevel: getUrgencyLevel(getDaysUntilDeadline(app.deadline), app.status),
      urgencyConfig: getUrgencyConfig(getUrgencyLevel(getDaysUntilDeadline(app.deadline), app.status))
    })).sort((a, b) => {
      // Sort by urgency priority first, then by days left
      if (a.urgencyConfig.priority !== b.urgencyConfig.priority) {
        return b.urgencyConfig.priority - a.urgencyConfig.priority
      }
      return a.daysLeft - b.daysLeft
    })
  }, [timelineData?.applications, getDaysUntilDeadline])

  // Filtered applications based on view mode
  const filteredApplications = useMemo(() => {
    if (viewMode === 'urgent') {
      return processedApplications.filter(app => 
        app.urgencyLevel === 'urgent' || app.urgencyLevel === 'overdue'
      )
    }
    if (viewMode === 'upcoming') {
      return processedApplications.filter(app => 
        app.urgencyLevel === 'upcoming' || app.urgencyLevel === 'urgent'
      )
    }
    return processedApplications
  }, [processedApplications, viewMode])

  // Timeline insights
  const insights = useMemo(() => getTimelineInsights(), [getTimelineInsights])

  // Event handlers
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetchTimeline()
    setTimeout(() => setIsRefreshing(false), 500) // Visual feedback
  }

  const handleViewDetails = (applicationId: string) => {
    navigate(`/applications/${applicationId}`)
  }

  const handleSubmitNow = (applicationId: string) => {
    navigate(`/applications/${applicationId}/submit`)
  }

  const handleSetReminder = (applicationId: string) => {
    // Create calendar event or set notification
    const application = processedApplications.find(app => app.id === applicationId)
    if (application) {
      const event = {
        title: `Submit ${application.programs.name} Application`,
        start: new Date(application.deadline),
        details: `Application deadline for ${application.programs.name} at ${application.programs.university}`
      }
      
      // For now, show a success message
      // In a real app, this would integrate with calendar APIs
      alert(`Reminder set for ${application.programs.name} application deadline!`)
    }
  }

  const handleBrowsePrograms = () => {
    navigate('/search')
  }

  // Loading state
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <SkeletonLoader.DashboardWidget variant="list" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center',
        className
      )}>
        <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Failed to Load Timeline
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error}
        </p>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <RefreshCwIcon className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    )
  }

  // Main widget content
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4',
      'transition-all duration-300 hover:shadow-md',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-500" />
            Application Timeline
            {timelineData?.urgentCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {timelineData.urgentCount} urgent
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track deadlines and never miss an opportunity
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={cn(
            'p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
            'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
            isRefreshing && 'animate-spin'
          )}
          title="Refresh timeline"
        >
          <RefreshCwIcon className="w-5 h-5" />
        </button>
      </div>

      {/* View mode tabs */}
      {processedApplications.length > 0 && (
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          {[
            { key: 'all', label: 'All', count: processedApplications.length },
            { key: 'urgent', label: 'Urgent', count: processedApplications.filter(app => app.urgencyLevel === 'urgent' || app.urgencyLevel === 'overdue').length },
            { key: 'upcoming', label: 'Upcoming', count: processedApplications.filter(app => app.urgencyLevel === 'upcoming' || app.urgencyLevel === 'urgent').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key as any)}
              className={cn(
                'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                viewMode === tab.key
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  'ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs',
                  viewMode === tab.key
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Insights and alerts */}
      {insights && insights.length > 0 && (
        <div className="space-y-2">
          {insights.slice(0, 2).map((insight, index) => (
            <div
              key={index}
              className={cn(
                'p-3 rounded-md border-l-4 text-sm',
                insight.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                insight.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
                'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
              )}
            >
              <div className="flex items-start space-x-2">
                <div className={cn(
                  'mt-0.5',
                  insight.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                  insight.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-blue-600 dark:text-blue-400'
                )}>
                  {insight.type === 'urgent' || insight.type === 'overdue' ? (
                    <AlertTriangleIcon className="w-4 h-4" />
                  ) : insight.type === 'success' ? (
                    <CheckCircleIcon className="w-4 h-4" />
                  ) : (
                    <TrendingUpIcon className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    'font-medium',
                    insight.priority === 'high' ? 'text-red-800 dark:text-red-200' :
                    insight.priority === 'medium' ? 'text-yellow-800 dark:text-yellow-200' :
                    'text-blue-800 dark:text-blue-200'
                  )}>
                    {insight.message}
                  </p>
                  <p className={cn(
                    'mt-1 text-xs',
                    insight.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                    insight.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-blue-600 dark:text-blue-400'
                  )}>
                    {insight.action}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Applications list */}
      <div className="space-y-3">
        {filteredApplications.length === 0 ? (
          processedApplications.length === 0 ? (
            <EmptyState onBrowsePrograms={handleBrowsePrograms} />
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No applications match the current filter.
              </p>
              <button
                onClick={() => setViewMode('all')}
                className="mt-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-sm font-medium"
              >
                View all applications
              </button>
            </div>
          )
        ) : (
          filteredApplications.map(application => (
            <ApplicationCard
              key={application.id}
              application={application}
              onViewDetails={handleViewDetails}
              onSubmitNow={handleSubmitNow}
              onSetReminder={handleSetReminder}
              isCompact={filteredApplications.length > 3}
            />
          ))
        )}
      </div>

      {/* Footer with next deadline summary */}
      {timelineData?.nextDeadline && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <ClockIcon className="w-4 h-4" />
              <span>Next deadline: {timelineData.nextDeadline.programs?.name}</span>
            </div>
            <div className="font-medium text-gray-900 dark:text-white">
              {formatTimeUntilDeadline(getDaysUntilDeadline(timelineData.nextDeadline.deadline))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile optimizations */}
        <style>{`
        @media (max-width: 375px) {
          .space-y-3 > * + * {
            margin-top: 0.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default ApplicationTimelineWidget