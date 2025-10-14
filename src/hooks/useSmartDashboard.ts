import { useState, useEffect, useCallback } from 'react'
import { useProfileCompletion, useApplicationTimeline, useCostAnalysis } from './useDashboard'
import { usePersonalizedPrograms, useUserPreferences } from './usePreferences'
import { formatNGN, formatCompactNGN } from './usePreferences'
import { useRealtime, useRefresh } from './useRealtime'

export interface DashboardInsight {
  id: string
  type: 'urgent' | 'opportunity' | 'success' | 'warning' | 'info'
  title: string
  message: string
  action?: string
  actionUrl?: string
  priority: 'high' | 'medium' | 'low'
  dismissible: boolean
  icon?: string
  timestamp: Date
}

export interface DashboardMetrics {
  profileCompletionPercentage: number
  totalApplications: number
  urgentDeadlines: number
  averageCostNGN: number
  affordablePrograms: number
  recommendationScore: number
}

/**
 * Master dashboard hook that aggregates all dashboard data and insights
 * Specifically designed for Nigerian students' study abroad journey
 */
export const useSmartDashboard = () => {
  const { completionData, getCompletionBenefits, isProfileOptimal } = useProfileCompletion()
  const { timelineData, getTimelineInsights, getDaysUntilDeadline } = useApplicationTimeline()
  const { costData, getBudgetInsights } = useCostAnalysis()
  const { programs: recommendedPrograms } = usePersonalizedPrograms(5)
  const { preferences } = useUserPreferences()

  const [insights, setInsights] = useState<DashboardInsight[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Generate comprehensive insights for Nigerian students
  const generateInsights = useCallback(() => {
    const allInsights: DashboardInsight[] = []

    // Profile completion insights
    if (completionData) {
      const benefits = getCompletionBenefits(completionData.percentage)
      
      if (completionData.percentage < 70) {
        allInsights.push({
          id: 'profile-completion',
          type: 'opportunity',
          title: 'Complete Your Profile',
          message: `${completionData.percentage}% complete. ${benefits.message}`,
          action: 'Complete Profile',
          actionUrl: '/dashboard/profile',
          priority: benefits.urgency,
          dismissible: false,
          icon: '👤',
          timestamp: new Date()
        })
      }

      // Next steps insights
      if (completionData.nextSteps.length > 0) {
        allInsights.push({
          id: 'next-steps',
          type: 'info',
          title: 'Recommended Next Steps',
          message: completionData.nextSteps[0], // Show most important step
          action: 'View All Steps',
          actionUrl: '/dashboard/profile',
          priority: 'medium',
          dismissible: true,
          icon: '📝',
          timestamp: new Date()
        })
      }
    }

    // Timeline insights
    const timelineInsights = getTimelineInsights()
    timelineInsights?.forEach((insight, index) => {
      allInsights.push({
        id: `timeline-${index}`,
        type: insight.type as any,
        title: insight.type === 'urgent' ? '⚠️ Urgent Deadlines' : 
               insight.type === 'overdue' ? '🔴 Overdue Applications' :
               insight.type === 'empty' ? '🎓 Start Your Journey' : '✅ Great Progress',
        message: insight.message,
        action: insight.action,
        actionUrl: '/dashboard/applications',
        priority: insight.priority as any,
        dismissible: insight.type !== 'urgent' && insight.type !== 'overdue',
        timestamp: new Date()
      })
    })

    // Budget insights
    const budgetInsights = getBudgetInsights()
    budgetInsights.forEach((insight, index) => {
      const typeMap = {
        budget_exceeded: 'warning' as const,
        budget_tight: 'warning' as const,
        budget_comfortable: 'success' as const,
        scholarship_available: 'opportunity' as const
      }

      allInsights.push({
        id: `budget-${index}`,
        type: typeMap[insight.type as keyof typeof typeMap],
        title: insight.type === 'scholarship_available' ? '💰 Scholarship Opportunities' : 
               insight.type === 'budget_exceeded' ? '💸 Budget Alert' :
               insight.type === 'budget_tight' ? '💰 Budget Tight' : '💚 Budget Comfortable',
        message: insight.message,
        action: insight.suggestion,
        actionUrl: '/dashboard/calculator',
        priority: insight.priority as any,
        dismissible: insight.priority !== 'high',
        timestamp: new Date()
      })
    })

    // Recommendation quality insights
    if (recommendedPrograms && recommendedPrograms.length > 0) {
      const highQualityMatches = recommendedPrograms.filter(p => p.match_score > 80)
      
      if (highQualityMatches.length > 0) {
        allInsights.push({
          id: 'high-matches',
          type: 'success',
          title: '🎯 Perfect Matches Found',
          message: `${highQualityMatches.length} programs with 80%+ match scores available`,
          action: 'View Recommendations',
          actionUrl: '/dashboard/recommended',
          priority: 'medium',
          dismissible: true,
          timestamp: new Date()
        })
      }

      // New programs insight
      const recentPrograms = recommendedPrograms.filter(p => {
        // This would check against a "new programs" dataset
        // For now, we'll use a simple heuristic
        return p.match_score > 70
      })

      if (recentPrograms.length >= 3 && isProfileOptimal) {
        allInsights.push({
          id: 'new-programs',
          type: 'info',
          title: '🆕 New Programs Available',
          message: `${recentPrograms.length} new programs match your preferences`,
          action: 'Explore Programs',
          actionUrl: '/dashboard/search',
          priority: 'low',
          dismissible: true,
          timestamp: new Date()
        })
      }
    }

    // Nigerian-specific insights
    if (costData?.budgetAnalysis && costData.budgetAnalysis.totalBudget > 0) {
      const avgCostUSD = costData.budgetAnalysis.averageProgramCost / 1500 // Convert to USD
      
      if (avgCostUSD < 15000) {
        allInsights.push({
          id: 'affordable-focus',
          type: 'success',
          title: '🇳🇬 Budget-Friendly Choices',
          message: 'Your selected programs are well-suited for Nigerian students\' budgets',
          priority: 'low',
          dismissible: true,
          timestamp: new Date()
        })
      }
    }

    // Sort insights by priority and timestamp
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    allInsights.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return b.timestamp.getTime() - a.timestamp.getTime()
    })

    return allInsights.slice(0, 8) // Limit to 8 insights to avoid overwhelm
  }, [completionData, getCompletionBenefits, getTimelineInsights, getBudgetInsights, recommendedPrograms, isProfileOptimal, costData])

  // Calculate dashboard metrics
  const calculateMetrics = useCallback((): DashboardMetrics => {
    const profileCompletion = completionData?.percentage || 0
    const totalApps = timelineData?.applications.length || 0
    const urgentDeadlines = timelineData?.urgentCount || 0
    const avgCost = costData?.budgetAnalysis?.averageProgramCost || 0
    const affordableCount = costData?.budgetAnalysis?.affordablePrograms || 0
    
    // Calculate recommendation score based on various factors
    let recScore = 0
    if (profileCompletion >= 70) recScore += 30
    if (recommendedPrograms && recommendedPrograms.length > 0) {
      const avgMatchScore = recommendedPrograms.reduce((sum, p) => sum + (p.match_score || 0), 0) / recommendedPrograms.length
      recScore += (avgMatchScore / 100) * 70
    }

    return {
      profileCompletionPercentage: profileCompletion,
      totalApplications: totalApps,
      urgentDeadlines,
      averageCostNGN: avgCost,
      affordablePrograms: affordableCount,
      recommendationScore: Math.round(recScore)
    }
  }, [completionData, timelineData, costData, recommendedPrograms])

  // Update insights and metrics when data changes
  useEffect(() => {
    try {
      const newInsights = generateInsights()
      const newMetrics = calculateMetrics()
      
      setInsights(newInsights)
      setMetrics(newMetrics)
    } catch (error) {
      console.error('Error generating dashboard data:', error)
      // Set default fallback data
      setInsights([])
      setMetrics({
        profileCompletionPercentage: 0,
        totalApplications: 0,
        urgentDeadlines: 0,
        averageCostNGN: 0,
        affordablePrograms: 0,
        recommendationScore: 0
      })
    } finally {
      setLoading(false)
    }
  }, [generateInsights, calculateMetrics])

  // Add timeout fallback to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Dashboard loading timeout - setting fallback data')
        setLoading(false)
        setMetrics({
          profileCompletionPercentage: 0,
          totalApplications: 0,
          urgentDeadlines: 0,
          averageCostNGN: 0,
          affordablePrograms: 0,
          recommendationScore: 0
        })
        setInsights([])
      }
    }, 5000) // 5 second timeout

    return () => clearTimeout(timeout)
  }, [loading])

  // Dashboard actions
  const dismissInsight = useCallback((insightId: string) => {
    setInsights(prev => prev.filter(insight => insight.id !== insightId))
  }, [])

  const refreshDashboard = useCallback(async () => {
    setRefreshing(true)
    try {
      // Force re-render by updating a timestamp
      setInsights(prev => [...prev])
      // Add a small delay to show refresh state
      await new Promise(resolve => setTimeout(resolve, 500))
    } finally {
      setRefreshing(false)
    }
  }, [])

  // Debounced refresh function - increased from 1s to 5s to reduce network calls
  const { refresh: debouncedRefresh } = useRefresh(refreshDashboard, 5000)

  // Real-time subscriptions for dashboard data - disabled to prevent refresh loops
  // useRealtime({
  //   table: 'applications',
  //   onInsert: () => debouncedRefresh(),
  //   onUpdate: () => debouncedRefresh(),
  //   onDelete: () => debouncedRefresh(),
  //   enabled: true
  // })

  // useRealtime({
  //   table: 'saved_programs',
  //   onInsert: () => debouncedRefresh(),
  //   onUpdate: () => debouncedRefresh(),
  //   onDelete: () => debouncedRefresh(),
  //   enabled: true
  // })

  // useRealtime({
  //   table: 'user_preferences',
  //   onUpdate: () => debouncedRefresh(),
  //   enabled: true
  // })

  // Get dashboard summary for Nigerian students
  const getDashboardSummary = useCallback(() => {
    if (!metrics) return null

    const summaryItems = []

    // Profile status
    if (metrics.profileCompletionPercentage < 70) {
      summaryItems.push(`Complete your profile (${metrics.profileCompletionPercentage}%)`)
    } else {
      summaryItems.push('Profile optimized ✅')
    }

    // Application status
    if (metrics.urgentDeadlines > 0) {
      summaryItems.push(`${metrics.urgentDeadlines} urgent deadline${metrics.urgentDeadlines > 1 ? 's' : ''}`)
    } else if (metrics.totalApplications > 0) {
      summaryItems.push(`${metrics.totalApplications} application${metrics.totalApplications > 1 ? 's' : ''} in progress`)
    } else {
      summaryItems.push('Ready to start applications')
    }

    // Budget status
    if (metrics.averageCostNGN > 0) {
      summaryItems.push(`Avg cost: ${formatCompactNGN(metrics.averageCostNGN)}`)
    }

    // Recommendation quality
    if (metrics.recommendationScore > 80) {
      summaryItems.push('Excellent matches available')
    } else if (metrics.recommendationScore > 60) {
      summaryItems.push('Good matches found')
    } else {
      summaryItems.push('Improve profile for better matches')
    }

    return {
      status: metrics.urgentDeadlines > 0 ? 'urgent' : 
              metrics.profileCompletionPercentage < 50 ? 'needs_attention' : 'good',
      summary: summaryItems.join(' • '),
      actionNeeded: metrics.urgentDeadlines > 0 || metrics.profileCompletionPercentage < 50
    }
  }, [metrics])

  // Get quick actions for dashboard
  const getQuickActions = useCallback(() => {
    const actions = []

    if (completionData && completionData.percentage < 70) {
      actions.push({
        id: 'complete-profile',
        label: 'Complete Profile',
        url: '/dashboard/profile',
        priority: 'high',
        icon: '👤'
      })
    }

    if (timelineData && timelineData.urgentCount > 0) {
      actions.push({
        id: 'urgent-deadlines',
        label: 'View Urgent Deadlines',
        url: '/applications',
        priority: 'high',
        icon: '⏰'
      })
    }

    actions.push({
      id: 'search-programs',
      label: 'Search Programs',
      url: '/programs/search',
      priority: 'medium',
      icon: '🔍'
    })

    if (costData && costData.scholarshipOpportunities.length > 0) {
      actions.push({
        id: 'view-scholarships',
        label: 'View Scholarships',
        url: '/scholarships',
        priority: 'medium',
        icon: '💰'
      })
    }

    return actions.slice(0, 4) // Limit to 4 quick actions
  }, [completionData, timelineData, costData])

  return {
    insights,
    metrics,
    loading,
    refreshing,
    dismissInsight,
    refreshDashboard,
    getDashboardSummary,
    getQuickActions,
    
    // Expose individual hook data for detailed views
    profileData: { completionData, isProfileOptimal },
    timelineData,
    costData,
    recommendedPrograms,
    preferences
  }
}

/**
 * Hook for dashboard notifications specifically for Nigerian students
 */
export const useDashboardNotifications = () => {
  const { insights, timelineData } = useSmartDashboard()
  const [notifications, setNotifications] = useState<DashboardInsight[]>([])

  useEffect(() => {
    // Filter insights for notification-worthy items
    const notificationWorthy = insights.filter(insight => 
      insight.priority === 'high' || 
      insight.type === 'urgent' || 
      (insight.type === 'opportunity' && !insight.dismissible)
    )

    // Add timeline-specific notifications
    const timelineNotifications: DashboardInsight[] = []
    
    if (timelineData?.nextDeadline) {
      const daysLeft = Math.ceil(
        (new Date(timelineData.nextDeadline.deadline).getTime() - new Date().getTime()) / 
        (1000 * 60 * 60 * 24)
      )
      
      if (daysLeft <= 3) {
        timelineNotifications.push({
          id: 'deadline-critical',
          type: 'urgent',
          title: 'Critical Deadline',
          message: `${timelineData.nextDeadline.programs.name} application due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
          action: 'Submit Application',
          priority: 'high',
          dismissible: false,
          timestamp: new Date()
        })
      }
    }

    setNotifications([...notificationWorthy, ...timelineNotifications])
  }, [insights, timelineData])

  return {
    notifications,
    hasUrgentNotifications: notifications.some(n => n.priority === 'high'),
    urgentCount: notifications.filter(n => n.priority === 'high').length
  }
}

export default useSmartDashboard
