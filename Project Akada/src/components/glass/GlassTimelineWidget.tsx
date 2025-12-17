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
import { useTheme } from '../../contexts/ThemeContext'

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
 * Calculate days remaining until deadline
 */
const getDaysUntilDeadline = (deadline: string): number => {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get urgency level based on days left and status
 */
const getUrgencyLevel = (daysLeft: number, status: string): 'low' | 'medium' | 'high' | 'critical' => {
  if (status === 'submitted' || status === 'accepted' || status === 'rejected') {
    return 'low'
  }
  
  if (daysLeft < 0) return 'critical'
  if (daysLeft <= 3) return 'critical'
  if (daysLeft <= 7) return 'high'
  if (daysLeft <= 14) return 'medium'
  return 'low'
}

/**
 * Get status color based on application status
 */
const getStatusColor = (status: string): string => {
  const statusColors = {
    'planning': 'text-gray-600 dark:text-gray-400',
    'draft': 'text-yellow-600 dark:text-yellow-400',
    'submitted': 'text-blue-600 dark:text-blue-400',
    'under_review': 'text-purple-600 dark:text-purple-400',
    'accepted': 'text-green-600 dark:text-green-400',
    'rejected': 'text-red-600 dark:text-red-400',
    'waitlisted': 'text-orange-600 dark:text-orange-400'
  }
  return statusColors[status as keyof typeof statusColors] || statusColors.planning
}

/**
 * Get status icon based on application status
 */
const getStatusIcon = (status: string): React.ReactNode => {
  const statusIcons = {
    'planning': <BookOpenIcon className="w-4 h-4" />,
    'draft': <BookOpenIcon className="w-4 h-4" />,
    'submitted': <CheckCircleIcon className="w-4 h-4" />,
    'under_review': <ClockIcon className="w-4 h-4" />,
    'accepted': <CheckCircleIcon className="w-4 h-4" />,
    'rejected': <XCircleIcon className="w-4 h-4" />,
    'waitlisted': <AlertTriangleIcon className="w-4 h-4" />
  }
  return statusIcons[status as keyof typeof statusIcons] || statusIcons.planning
}

// ======================================
// COMPONENTS
// ======================================

const CountdownTimer: React.FC<CountdownTimerProps> = ({ deadline, className }) => {
  const [timeLeft, setTimeLeft] = useState(getDaysUntilDeadline(deadline))
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getDaysUntilDeadline(deadline))
    }, 1000 * 60 * 60) // Update every hour
    
    return () => clearInterval(timer)
  }, [deadline])
  
  const urgency = getUrgencyLevel(timeLeft, 'active')
  
  if (timeLeft < 0) {
    return (
      <div className={cn("flex items-center space-x-1 text-red-600 dark:text-red-400", className)}>
        <AlertTriangleIcon className="w-4 h-4" />
        <span className="text-sm font-medium">Overdue</span>
      </div>
    )
  }
  
  if (timeLeft === 0) {
    return (
      <div className={cn("flex items-center space-x-1 text-red-600 dark:text-red-400", className)}>
        <AlertTriangleIcon className="w-4 h-4" />
        <span className="text-sm font-medium">Due Today</span>
      </div>
    )
  }
  
  return (
    <div className={cn(
      "flex items-center space-x-1",
      urgency === 'critical' ? "text-red-600 dark:text-red-400" :
      urgency === 'high' ? "text-orange-600 dark:text-orange-400" :
      urgency === 'medium' ? "text-yellow-600 dark:text-yellow-400" :
      "text-gray-600 dark:text-gray-400",
      className
    )}>
      <ClockIcon className="w-4 h-4" />
      <span className="text-sm font-medium">
        {timeLeft} day{timeLeft !== 1 ? 's' : ''} left
      </span>
    </div>
  )
}

const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ daysLeft, status, className }) => {
  const urgency = getUrgencyLevel(daysLeft, status)
  
  const badgeStyles = {
    critical: "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800",
    high: "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    medium: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    low: "bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600"
  }
  
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
      badgeStyles[urgency],
      className
    )}>
      {urgency === 'critical' && <AlertTriangleIcon className="w-3 h-3 mr-1" />}
      {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority
    </span>
  )
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onViewDetails,
  onSubmitNow,
  onSetReminder,
  isCompact = false
}) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const daysLeft = getDaysUntilDeadline(application.deadline)
  const urgency = getUrgencyLevel(daysLeft, application.status)

  // Determine left border color based on status
  const getStatusBorderColor = () => {
    if (application.status === 'submitted' || application.status === 'accepted') {
      return isDark ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-blue-400'
    }
    return isDark ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-orange-400'
  }

  // Background tint based on status
  const getStatusBackground = () => {
    if (application.status === 'submitted' || application.status === 'accepted') {
      return isDark ? 'bg-teal-900/20 border-teal-800/30' : 'bg-teal-50/80 border-teal-200'
    }
    return isDark ? 'bg-green-900/20 border-green-800/30' : 'bg-green-50/80 border-green-200'
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border p-4 transition-all duration-200 hover:shadow-md",
      getStatusBorderColor(),
      getStatusBackground(),
      isCompact && "p-3"
    )}>
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {application.programs?.name || 'Unknown Program'}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {application.programs?.university || 'Unknown University'}
            </p>
          </div>
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            application.status === 'submitted' 
              ? "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
              : "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300"
          )}>
            {application.status === 'submitted' ? 'Submitted' : 'In Progress'}
          </div>
        </div>
        
        {/* Deadline Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
            <CalendarIcon className="w-3 h-3" />
            <span>Due: {new Date(application.deadline).toLocaleDateString('en-GB')}</span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Overdue'}
          </div>
        </div>
        
        {/* Action Button */}
        <button
          onClick={() => onViewDetails(application.id)}
          className="w-full flex items-center justify-center space-x-2 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <EyeIcon className="w-3 h-3" />
          <span>View Details</span>
        </button>
      </div>
    </div>
  )
}

export const GlassTimelineWidget: React.FC<{ className?: string }> = ({ className }) => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { 
    timelineData, 
    loading, 
    error,
    refetchTimeline
  } = useApplicationTimeline()
  
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAll, setShowAll] = useState(false)
  
  // Get computed data
  const upcomingDeadlines = timelineData?.upcomingDeadlines || []
  const urgentApplications = timelineData?.applications?.filter((app: any) => {
    const daysLeft = getDaysUntilDeadline(app.deadline)
    return daysLeft <= 7 && app.status !== 'submitted' && app.status !== 'accepted' && app.status !== 'rejected'
  }) || []
  const stats = timelineData ? {
    total: timelineData.applications?.length || 0,
    submitted: timelineData.applications?.filter((app: any) => app.status === 'submitted').length || 0,
    pending: timelineData.applications?.filter((app: any) => app.status === 'draft' || app.status === 'planning').length || 0
  } : null
  
  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetchTimeline()
    setTimeout(() => setIsRefreshing(false), 1000)
  }
  
  // Handle application actions
  const handleViewDetails = (id: string) => {
    navigate(`/dashboard/applications/${id}`)
  }
  
  const handleSubmitNow = (id: string) => {
    navigate(`/dashboard/applications/${id}/submit`)
  }
  
  const handleSetReminder = (id: string) => {
    navigate(`/dashboard/applications/${id}/reminder`)
  }
  
  // Loading state
  if (loading) {
    return <SkeletonLoader.DashboardWidget variant="list" className={className} />
  }
  
  // No applications state
  if (!timelineData?.applications?.length) {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-2xl backdrop-blur-xl border p-6 text-center",
        isDark 
          ? 'bg-gray-900/40 border-white/10' 
          : 'bg-white/80 border-gray-200',
        className
      )}>
        <div className="relative z-10">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Applications Yet
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Start your journey by creating your first application
          </p>
          <button
            onClick={() => navigate('/dashboard/applications/new')}
            className="bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            Create Application
          </button>
        </div>
      </div>
    )
  }
  
  const displayedApplications = showAll 
    ? timelineData.applications 
    : timelineData.applications.slice(0, 3)
  
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
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
          Application Timeline
          <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Track deadlines and never miss an opportunity
        </p>
        
        {/* Filter Buttons */}
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-4">
          <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900">
            All {timelineData?.applications?.length || 0}
          </button>
          <button className="px-3 py-1.5 text-xs font-medium rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            Urgent
          </button>
          <button className="px-3 py-1.5 text-xs font-medium rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            Upcoming
          </button>
        </div>
      </div>
      
      {/* Status Message */}
      <div className="relative z-10 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-gray-900 dark:text-white font-medium">
            {stats?.submitted || 0} application{stats?.submitted !== 1 ? 's' : ''} submitted!
          </span>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          Explore more programs or prepare for interviews
        </p>
      </div>
      
      {/* Applications List */}
      <div className="relative z-10 space-y-3">
        {displayedApplications.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            onViewDetails={handleViewDetails}
            onSubmitNow={handleSubmitNow}
            onSetReminder={handleSetReminder}
          />
        ))}
      </div>
      
      {/* Show More/Less Button */}
      {timelineData.applications.length > 3 && (
        <div className="relative z-10 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            {showAll ? 'Show Less' : `Show ${timelineData.applications.length - 3} More`}
          </button>
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="relative z-10 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/dashboard/applications')}
            className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>View All</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/applications/new')}
            className="flex items-center space-x-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <TrendingUpIcon className="w-4 h-4" />
            <span>New Application</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default GlassTimelineWidget
