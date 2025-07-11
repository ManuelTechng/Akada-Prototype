import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BellIcon, 
  RefreshCwIcon, 
  EyeIcon, 
  EyeOffIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  InfoIcon,
  TrendingUpIcon,
  DollarSignIcon,
  UserIcon,
  GlobeIcon,
  CalendarIcon,
  BookOpenIcon,
  SparklesIcon,
  ArrowRightIcon,
  PlusIcon,
  SettingsIcon
} from 'lucide-react'
import { useSmartDashboard, useDashboardNotifications } from '../../hooks/useSmartDashboard'
import { useAuth } from '../../contexts/AuthContext'
import { ProfileCompletionWidget } from '../ProfileCompletionWidget'
import { ApplicationTimelineWidget } from './ApplicationTimelineWidget'
import { CostAnalysisWidget } from './CostAnalysisWidget'
import SkeletonLoader from '../ui/SkeletonLoader'
import { akadaTokens } from '../../styles/tokens'
import { cn } from '../../lib/utils'

// Lazy load heavy components for performance
const CostComparisonChart = lazy(() => import('./CostComparisonChart'))

interface DashboardSummary {
  greeting: string
  motivationalQuote: string
  overallStatus: 'on-track' | 'needs-attention' | 'critical'
  keyMetrics: {
    profileScore: number
    upcomingDeadlines: number
    budgetHealth: string
    matchedPrograms: number
  }
  nextBestAction: {
    text: string
    action: () => void
    priority: 'high' | 'medium' | 'low'
  }
}

interface SmartNotification {
  id: string
  type: 'deadline' | 'budget' | 'profile' | 'opportunity' | 'tip'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  dismissible: boolean
  icon: React.ReactNode
  timestamp: Date
}

interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  priority: 'high' | 'medium' | 'low'
  color: string
}

interface OnboardingCardProps {
  step: number
  title: string
  description: string
  icon: React.ReactNode
  action: () => void
}

const OnboardingCard: React.FC<OnboardingCardProps> = ({ 
  step, 
  title, 
  description, 
  icon, 
  action 
}) => (
  <div 
    onClick={action}
    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-all duration-300 group"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="text-2xl">{icon}</div>
      <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-sm font-semibold">
        {step}
      </div>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
      {description}
    </p>
    <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-medium">
      Get Started <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
    </div>
  </div>
)

const WelcomeDashboard: React.FC = () => {
  const navigate = useNavigate()
  
  return (
    <div className="text-center py-12 px-6">
      <div className="text-6xl mb-6">🎉</div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome to Your Akada Dashboard!
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
        Your personalized command center for studying abroad. Let's get you started on your journey to international education success.
      </p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <OnboardingCard 
          step={1}
          title="Complete Your Profile"
          description="Tell us about your academic dreams and preferences"
          icon={<UserIcon className="w-6 h-6" />}
          action={() => navigate('/dashboard/profile')}
        />
        <OnboardingCard 
          step={2}
          title="Set Your Budget"
          description="Know your financial limits and discover opportunities"
          icon={<DollarSignIcon className="w-6 h-6" />}
          action={() => navigate('/dashboard/calculator')}
        />
        <OnboardingCard 
          step={3}
          title="Explore Programs"
          description="Find your perfect university and program match"
          icon={<GlobeIcon className="w-6 h-6" />}
          action={() => navigate('/dashboard/search')}
        />
      </div>
      
      <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 max-w-md mx-auto">
        <div className="text-4xl mb-3">🇳🇬</div>
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
          Made for Nigerian Students
        </h3>
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          Join 1,000+ Nigerian students who have successfully secured admissions and ₦50M+ in scholarships through Akada.
        </p>
      </div>
    </div>
  )
}

export const SmartDashboard: React.FC<{ className?: string }> = ({ className }) => {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { 
    insights, 
    metrics, 
    loading, 
    dismissInsight, 
    refreshDashboard, 
    getDashboardSummary, 
    getQuickActions,
    profileData,
    timelineData,
    costData,
    recommendedPrograms
  } = useSmartDashboard()
  
  const { notifications, hasUrgentNotifications, urgentCount } = useDashboardNotifications()
  
  // UI state
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [widgetVisibility, setWidgetVisibility] = useState({
    notifications: true,
    profile: true,
    timeline: true,
    cost: true,
    chart: true,
    quickActions: true
  })
  const [expandedNotifications, setExpandedNotifications] = useState(true)
  const [showAllInsights, setShowAllInsights] = useState(false)

  // Nigerian-specific time-aware greetings
  const getTimeAwareGreeting = (): string => {
    const hour = new Date().getHours()
    
    // Get name from profile, fallback to first part of email, then "Student"
    let name = "Student"
    if (profile?.full_name) {
      // Use first name only (split by space and take first part)
      name = profile.full_name.split(' ')[0]
    } else if (user?.email) {
      // Extract name from email (part before @)
      name = user.email.split('@')[0].replace(/[._]/g, ' ').split(' ')[0]
      // Capitalize first letter
      name = name.charAt(0).toUpperCase() + name.slice(1)
    }
    
    if (hour < 12) {
      return `Good morning, ${name}! Let's make progress today 🌅`
    } else if (hour < 18) {
      return `Good afternoon, ${name}! Keep the momentum going 💪`
    } else {
      return `Good evening, ${name}! Time to review your progress 🌙`
    }
  }

  // Nigerian-specific motivational quotes
  const getMotivationalQuote = (): string => {
    const quotes = [
      "Your dreams are valid - keep pushing! 🚀",
      "From Nigeria to the world 🇳🇬✈️",
      "Every application brings you closer to success 💫",
      "Education is the passport to the future 📚",
      "Believe in yourself and all that you are 💪",
      "Success begins with a single step forward 👣"
    ]
    return quotes[Math.floor(Math.random() * quotes.length)]
  }

  // Generate dashboard summary
  const generateDashboardSummary = (): DashboardSummary => {
    const summary = getDashboardSummary()
    
    return {
      greeting: getTimeAwareGreeting(),
      motivationalQuote: getMotivationalQuote(),
      overallStatus: summary?.status === 'urgent' ? 'critical' : 
                    summary?.status === 'needs_attention' ? 'needs-attention' : 'on-track',
      keyMetrics: {
        profileScore: metrics?.profileCompletionPercentage || 0,
        upcomingDeadlines: metrics?.urgentDeadlines || 0,
        budgetHealth: metrics?.averageCostNGN ? 'Set' : 'Not Set',
        matchedPrograms: recommendedPrograms?.length || 0
      },
      nextBestAction: {
        text: summary?.actionNeeded ? 'Complete urgent tasks' : 'Continue building your profile',
        action: () => navigate(summary?.actionNeeded ? '/applications' : '/profile'),
        priority: summary?.actionNeeded ? 'high' : 'medium'
      }
    }
  }

  // Transform insights to notifications
  const transformInsightsToNotifications = (): SmartNotification[] => {
    return insights.map((insight) => {
      const iconMap = {
        urgent: <AlertCircleIcon className="w-5 h-5 text-red-500" />,
        opportunity: <SparklesIcon className="w-5 h-5 text-yellow-500" />,
        success: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
        warning: <AlertCircleIcon className="w-5 h-5 text-orange-500" />,
        info: <InfoIcon className="w-5 h-5 text-blue-500" />
      }

      return {
        id: insight.id,
        type: insight.type === 'urgent' ? 'deadline' : 
              insight.type === 'opportunity' ? 'opportunity' :
              insight.title.includes('Budget') || insight.title.includes('Cost') ? 'budget' :
              insight.title.includes('Profile') ? 'profile' : 'tip',
        priority: insight.priority === 'high' ? 'urgent' : insight.priority as any,
        title: insight.title,
        message: insight.message,
        action: insight.action ? {
          label: insight.action,
          onClick: () => insight.actionUrl && navigate(insight.actionUrl)
        } : undefined,
        dismissible: insight.dismissible,
        icon: iconMap[insight.type] || iconMap.info,
        timestamp: insight.timestamp
      }
    })
  }

  // Generate quick actions based on context
  const generateQuickActions = (): QuickAction[] => {
    const contextActions = getQuickActions()
    
    return contextActions.map((action) => {
      const iconMap = {
        '👤': <UserIcon className="w-5 h-5" />,
        '⏰': <CalendarIcon className="w-5 h-5" />,
        '🔍': <GlobeIcon className="w-5 h-5" />,
        '💰': <DollarSignIcon className="w-5 h-5" />
      }

      const colorMap = {
        high: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
        medium: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
        low: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
      }

      return {
        id: action.id,
        label: action.label,
        description: `Navigate to ${action.label.toLowerCase()}`,
        icon: iconMap[action.icon as keyof typeof iconMap] || <BookOpenIcon className="w-5 h-5" />,
        onClick: () => navigate(action.url),
        priority: action.priority as any,
        color: colorMap[action.priority as keyof typeof colorMap]
      }
    })
  }

  // Handle refresh with loading state
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await refreshDashboard()
    setTimeout(() => setIsRefreshing(false), 1000) // Show loading for UX
  }, [refreshDashboard])

  // Pull-to-refresh for mobile
  const handlePullToRefresh = useCallback((e: TouchEvent) => {
    // Simple implementation - would need proper pull-to-refresh library in production
    if (window.scrollY === 0) {
      handleRefresh()
    }
  }, [handleRefresh])

  // Widget management
  const toggleWidget = (widget: keyof typeof widgetVisibility) => {
    const newVisibility = { ...widgetVisibility, [widget]: !widgetVisibility[widget] }
    setWidgetVisibility(newVisibility)
    try {
      localStorage.setItem('akada_widget_visibility', JSON.stringify(newVisibility))
    } catch (error) {
      console.warn('Failed to save widget preferences:', error)
    }
  }

  // Load saved widget preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem('akada_widget_visibility')
      if (saved && saved !== '[object Object]') {
        const parsed = JSON.parse(saved)
        if (typeof parsed === 'object' && parsed !== null) {
          setWidgetVisibility(parsed)
        }
      }
    } catch (error) {
      console.warn('Failed to load widget preferences:', error)
      // Clear corrupted data
      localStorage.removeItem('akada_widget_visibility')
    }
  }, [])

  // Add touch event for pull-to-refresh
  useEffect(() => {
    document.addEventListener('touchstart', handlePullToRefresh as any)
    return () => document.removeEventListener('touchstart', handlePullToRefresh as any)
  }, [handlePullToRefresh])

  // Check if user is new (no meaningful data)
  const isNewUser = (!profileData?.completionData || 
                   (profileData.completionData.percentage < 10 && 
                    (!timelineData?.applications?.length) &&
                    (!costData?.budgetAnalysis))) &&
                   !loading // Don't show new user flow while loading

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Dashboard banner skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-4">
            <SkeletonLoader.Line width="w-1/2" height="h-6" />
            <SkeletonLoader.Line width="w-1/3" height="h-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="space-y-2">
                  <SkeletonLoader.Line width="w-full" height="h-8" />
                  <SkeletonLoader.Line width="w-3/4" height="h-3" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Widget skeletons */}
        <SkeletonLoader.DashboardGrid />
      </div>
    )
  }

  if (isNewUser) {
    return <WelcomeDashboard />
  }

  const dashboardSummary = generateDashboardSummary()
  const smartNotifications = transformInsightsToNotifications()
  const quickActions = generateQuickActions()

  return (
    <div className={cn("space-y-6", className)}>
      {/* Dashboard Summary Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">
                {dashboardSummary.greeting}
              </h1>
              <p className="text-indigo-100 mb-4">
                {dashboardSummary.motivationalQuote}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
                aria-label="Refresh dashboard"
              >
                <RefreshCwIcon className={cn("w-5 h-5", isRefreshing && "animate-spin")} />
              </button>
              
              <button
                onClick={() => navigate('/settings')}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                aria-label="Dashboard settings"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-3xl font-bold">{dashboardSummary.keyMetrics.profileScore}%</div>
              <div className="text-indigo-100 text-sm">Profile Complete</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-300">
                {dashboardSummary.keyMetrics.upcomingDeadlines}
              </div>
              <div className="text-indigo-100 text-sm">Urgent Deadlines</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-300">
                {dashboardSummary.keyMetrics.matchedPrograms}
              </div>
              <div className="text-indigo-100 text-sm">Program Matches</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-300">
                {dashboardSummary.keyMetrics.budgetHealth}
              </div>
              <div className="text-indigo-100 text-sm">Budget Status</div>
            </div>
          </div>

          {/* Next Best Action */}
          <div className="mt-6 flex items-center justify-between bg-white/10 rounded-lg p-4">
            <div>
              <div className="font-medium">Next Best Action:</div>
              <div className="text-indigo-100 text-sm">{dashboardSummary.nextBestAction.text}</div>
            </div>
            <button
              onClick={dashboardSummary.nextBestAction.action}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                dashboardSummary.nextBestAction.priority === 'high' 
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-white/20 hover:bg-white/30 text-white"
              )}
            >
              Take Action
            </button>
          </div>
        </div>
      </div>

      {/* Priority Notifications */}
      {widgetVisibility.notifications && smartNotifications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BellIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                {hasUrgentNotifications && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {urgentCount} urgent
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAllInsights(!showAllInsights)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showAllInsights ? 'Show Less' : 'Show All'}
                </button>
                <button
                  onClick={() => setExpandedNotifications(!expandedNotifications)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {expandedNotifications ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => toggleWidget('notifications')}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <EyeOffIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {expandedNotifications && (
            <div className="p-4 space-y-3">
              {(showAllInsights ? smartNotifications : smartNotifications.slice(0, 3)).map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 rounded-lg border",
                    notification.priority === 'urgent' 
                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      : notification.priority === 'high'
                      ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                      : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {notification.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-3">
                          {notification.action && (
                            <button
                              onClick={notification.action.onClick}
                              className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition-colors"
                            >
                              {notification.action.label}
                            </button>
                          )}
                          
                          {notification.dismissible && (
                            <button
                              onClick={() => dismissInsight(notification.id)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {smartNotifications.length > 3 && !showAllInsights && (
                <button
                  onClick={() => setShowAllInsights(true)}
                  className="w-full text-center text-indigo-600 dark:text-indigo-400 text-sm font-medium py-2 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  View {smartNotifications.length - 3} more notifications
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions Grid */}
      {widgetVisibility.quickActions && quickActions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <TrendingUpIcon className="w-5 h-5 text-indigo-600" />
              <span>Quick Actions</span>
            </h3>
            <button
              onClick={() => toggleWidget('quickActions')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <EyeOffIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                className={cn(
                  "p-4 rounded-lg border text-left transition-all duration-200 hover:shadow-md",
                  action.color
                )}
              >
                <div className="flex items-center space-x-3 mb-2">
                  {action.icon}
                  <div className="font-medium">{action.label}</div>
                </div>
                <div className="text-xs opacity-75">{action.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Completion Widget */}
        {widgetVisibility.profile && (
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <div></div>
              <button
                onClick={() => toggleWidget('profile')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <EyeOffIcon className="w-4 h-4" />
              </button>
            </div>
            <ProfileCompletionWidget />
          </div>
        )}

        {/* Application Timeline Widget */}
        {widgetVisibility.timeline && (
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <div></div>
              <button
                onClick={() => toggleWidget('timeline')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <EyeOffIcon className="w-4 h-4" />
              </button>
            </div>
            <ApplicationTimelineWidget />
          </div>
        )}

        {/* Cost Analysis Widget */}
        {widgetVisibility.cost && (
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <div></div>
              <button
                onClick={() => toggleWidget('cost')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <EyeOffIcon className="w-4 h-4" />
              </button>
            </div>
            <CostAnalysisWidget />
          </div>
        )}
      </div>

      {/* Cost Comparison Chart - Full Width */}
      {widgetVisibility.chart && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cost Comparison Analysis
            </h3>
            <button
              onClick={() => toggleWidget('chart')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <EyeOffIcon className="w-5 h-5" />
            </button>
          </div>
          
          <Suspense fallback={<SkeletonLoader.CostChart />}>
            <CostComparisonChart />
          </Suspense>
        </div>
      )}

      {/* Hidden widgets recovery */}
      {Object.values(widgetVisibility).some(visible => !visible) && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Hidden Widgets
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(widgetVisibility).map(([widget, visible]) => 
              !visible && (
                <button
                  key={widget}
                  onClick={() => toggleWidget(widget as keyof typeof widgetVisibility)}
                  className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span className="capitalize">{widget}</span>
                  <PlusIcon className="w-3 h-3" />
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Mobile optimization styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 375px) {
          .text-3xl {
            font-size: 1.5rem;
          }
          .text-2xl {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  )
}

export default SmartDashboard 