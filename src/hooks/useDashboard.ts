import { useState, useEffect, useCallback } from 'react'
import { useUserPreferences } from './usePreferences'
import { UserPreferences } from '../lib/preferences'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

/**
 * Dashboard data hook for profile completion tracking
 * Provides real-time completion status and next steps for Nigerian students
 */
export const useProfileCompletion = () => {
  const { preferences, loading } = useUserPreferences()
  const [completionData, setCompletionData] = useState<{
    percentage: number
    completedSections: string[]
    missingSections: string[]
    nextSteps: string[]
    priority: 'high' | 'medium' | 'low'
  } | null>(null)

  const calculateCompletionDetails = useCallback((prefs: UserPreferences) => {
    const sections = {
      basicInfo: {
        complete: prefs.specializations.length > 0 && prefs.studyLevel && prefs.countries.length > 0,
        label: 'Study Preferences',
        weight: 25
      },
      financialInfo: {
        complete: prefs.budgetRange !== undefined && prefs.scholarshipNeeded !== undefined,
        label: 'Budget & Scholarships',
        weight: 25
      },
      academicInfo: {
        complete: prefs.preferredDuration !== undefined,
        label: 'Academic Timeline', 
        weight: 15
      },
      locationInfo: {
        complete: prefs.countries.length > 0,
        label: 'Location Preferences',
        weight: 15
      },
      personalInfo: {
        complete: prefs.goals !== undefined && prefs.languagePreference !== undefined,
        label: 'Personal Profile',
        weight: 20
      }
    }

    let totalScore = 0
    const completed: string[] = []
    const missing: string[] = []

    Object.entries(sections).forEach(([, section]) => {
      if (section.complete) {
        totalScore += section.weight
        completed.push(section.label)
      } else {
        missing.push(section.label)
      }
    })

    // Generate next steps based on what's missing
    const nextSteps: string[] = []
    if (!sections.basicInfo.complete) {
      nextSteps.push('Choose your study specialization and preferred countries')
    }
    if (!sections.financialInfo.complete) {
      nextSteps.push('Set your budget range and scholarship preferences')
    }
    if (!sections.academicInfo.complete) {
      nextSteps.push('Select your preferred program duration')
    }
    if (!sections.locationInfo.complete) {
      nextSteps.push('Add preferred cities to find local programs')
    }
    if (!sections.personalInfo.complete) {
      const missingFields = []
      if (!prefs.goals) missingFields.push('Study Goals')
      if (!prefs.languagePreference) missingFields.push('Language Preference')
      nextSteps.push(`Complete ${missingFields.join(' and ')} in Personal Information`)
    }

    // Determine priority based on completion level
    let priority: 'high' | 'medium' | 'low' = 'low'
    if (totalScore < 50) priority = 'high'
    else if (totalScore < 80) priority = 'medium'

    return {
      percentage: totalScore,
      completedSections: completed,
      missingSections: missing,
      nextSteps,
      priority
    }
  }, [])

  useEffect(() => {
    if (preferences && !loading) {
      const details = calculateCompletionDetails(preferences)
      setCompletionData(details)
    }
  }, [preferences, loading, calculateCompletionDetails])

  const getCompletionBenefits = useCallback((currentPercentage: number) => {
    if (currentPercentage < 50) {
      return {
        message: 'Complete your profile to unlock personalized program recommendations',
        benefits: ['Get matched with programs that fit your budget', 'See scholarships you qualify for', 'Access cost calculators'],
        urgency: 'high' as const
      }
    } else if (currentPercentage < 80) {
      return {
        message: 'Almost there! Complete your profile for the best matches',
        benefits: ['Get location-specific recommendations', 'Access premium program insights', 'Priority application support'],
        urgency: 'medium' as const
      }
    } else {
      return {
        message: 'Profile complete! You\'re getting the best recommendations',
        benefits: ['Premium program matching', 'Scholarship alerts', 'Application deadline reminders'],
        urgency: 'low' as const
      }
    }
  }, [])

  return {
    completionData,
    loading,
    getCompletionBenefits,
    isProfileOptimal: completionData ? completionData.percentage >= 70 : false
  }
}

/**
 * Dashboard hook for application timeline and deadline tracking
 * Provides Nigerian students with deadline management and progress tracking
 */
export const useApplicationTimeline = () => {
  const { user } = useAuth()
  const [timelineData, setTimelineData] = useState<{
    applications: any[]
    upcomingDeadlines: any[]
    overdueApplications: any[]
    completedApplications: any[]
    nextDeadline: any | null
    urgentCount: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTimelineData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Fetch applications with program details
      const { data: applications, error: appsError } = await supabase
        .from('applications')
        .select(`
          id, status, deadline, notes, created_at, updated_at,
          programs!inner(
            id, name, university, country, tuition_fee, 
            scholarship_available, application_deadline
          )
        `)
        .eq('user_id', user.id)
        .order('deadline', { ascending: true })

      if (appsError) throw appsError

      const now = new Date()
      const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))

      // Process applications by status and deadlines
      const upcoming = applications?.filter(app => {
        const deadline = new Date(app.deadline)
        return deadline > now && deadline <= thirtyDaysFromNow && app.status !== 'submitted'
      }) || []

      const overdue = applications?.filter(app => {
        const deadline = new Date(app.deadline)
        return deadline < now && app.status !== 'submitted' && app.status !== 'cancelled'
      }) || []

      const completed = applications?.filter(app => 
        ['submitted', 'accepted', 'rejected'].includes(app.status)
      ) || []

      // Find next immediate deadline
      const nextDeadline = upcoming.length > 0 ? upcoming[0] : null

      // Count urgent applications (deadline within 7 days)
      const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000))
      const urgentCount = applications?.filter(app => {
        const deadline = new Date(app.deadline)
        return deadline > now && deadline <= sevenDaysFromNow && app.status !== 'submitted'
      }).length || 0

      setTimelineData({
        applications: applications || [],
        upcomingDeadlines: upcoming,
        overdueApplications: overdue,
        completedApplications: completed,
        nextDeadline,
        urgentCount
      })
      
      setError(null)
    } catch (err) {
      console.error('Error fetching timeline data:', err)
      setError('Failed to load application timeline')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Calculate days until deadline
  const getDaysUntilDeadline = useCallback((deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }, [])

  // Get timeline insights for Nigerian students
  const getTimelineInsights = useCallback(() => {
    if (!timelineData) return null

    const insights = []
    
    if (timelineData.urgentCount > 0) {
      insights.push({
        type: 'urgent',
        message: `${timelineData.urgentCount} application${timelineData.urgentCount > 1 ? 's' : ''} due within 7 days`,
        action: 'Review urgent applications',
        priority: 'high'
      })
    }

    if (timelineData.overdueApplications.length > 0) {
      insights.push({
        type: 'overdue',
        message: `${timelineData.overdueApplications.length} overdue application${timelineData.overdueApplications.length > 1 ? 's' : ''}`,
        action: 'Contact universities about late submissions',
        priority: 'high'
      })
    }

    if (timelineData.applications.length === 0) {
      insights.push({
        type: 'empty',
        message: 'Start your study abroad journey',
        action: 'Save programs to begin applications',
        priority: 'medium'
      })
    }

    if (timelineData.completedApplications.length > 0 && timelineData.upcomingDeadlines.length === 0) {
      insights.push({
        type: 'success',
        message: `${timelineData.completedApplications.length} application${timelineData.completedApplications.length > 1 ? 's' : ''} submitted!`,
        action: 'Explore more programs or prepare for interviews',
        priority: 'low'
      })
    }

    return insights
  }, [timelineData])

  useEffect(() => {
    fetchTimelineData()
  }, [fetchTimelineData])

  return {
    timelineData,
    loading,
    error,
    refetchTimeline: fetchTimelineData,
    getDaysUntilDeadline,
    getTimelineInsights
  }
}

/**
 * Dashboard hook for cost comparison and budget tracking
 * Helps Nigerian students track and compare program costs in NGN
 */
export const useCostAnalysis = () => {
  const { user } = useAuth()
  const { preferences } = useUserPreferences()
  const [costData, setCostData] = useState<{
    savedProgramsCosts: any[]
    budgetAnalysis: {
      totalBudget: number
      averageProgramCost: number
      affordablePrograms: number
      budgetUtilization: number
    } | null
    costComparisons: any[]
    scholarshipOpportunities: any[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCostData = useCallback(async () => {
    if (!user?.id || !preferences) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('🔍 Dashboard Debug - Preferences:', {
        budgetRange: preferences.budgetRange,
        hasPreferences: !!preferences,
        userId: user.id
      })

      // Fetch saved programs with cost data
      const { data: savedPrograms, error: savedError } = await supabase
        .from('saved_programs')
        .select(`
          id, notes, saved_at,
          programs!inner(
            id, name, university, country, tuition_fee, 
            scholarship_available, duration
          )
        `)
        .eq('user_id', user.id)

      if (savedError) throw savedError

      // Get cost estimates for countries
      const countries = [...new Set(savedPrograms?.map(sp => sp.programs[0]?.country).filter(Boolean))]
      const { data: countryEstimates, error: estimatesError } = await supabase
        .from('country_estimates')
        .select('*')
        .in('country', countries)

      if (estimatesError) throw estimatesError

      // Get user budget for calculations
      const userBudget = preferences.budgetRange || 0

      // Calculate total costs for each saved program
      const savedProgramsCosts = savedPrograms?.map(sp => {
        const program = sp.programs[0] // Access first program from array
        if (!program) return null
        
        const countryData = countryEstimates?.find(ce => ce.country === program.country)
        
        // Parse duration to months
        const durationMonths = program.duration?.includes('year') ? 
          parseInt(program.duration) * 12 : 
          parseInt(program.duration || '24') // Default to 24 months

        const totalCostNGN = program.tuition_fee + 
          (countryData?.avg_monthly_living || 0) * durationMonths +
          (countryData?.student_visa_fee || 0)

        return {
          ...sp,
          totalCostNGN,
          breakdown: {
            tuition: program.tuition_fee,
            living: (countryData?.avg_monthly_living || 0) * durationMonths,
            visa: countryData?.student_visa_fee || 0
          },
          isAffordable: userBudget > 0 ? totalCostNGN <= userBudget : true
        }
      }).filter((item): item is any => item !== null) || []

      // Budget analysis
      const totalCosts = savedProgramsCosts.map(spc => spc.totalCostNGN)
      const averageCost = totalCosts.length > 0 ? 
        totalCosts.reduce((sum, cost) => sum + cost, 0) / totalCosts.length : 0
      const affordableCount = savedProgramsCosts.filter(spc => spc.isAffordable).length
      const budgetUtilization = userBudget > 0 ? (averageCost / userBudget) * 100 : 0

      const budgetAnalysis = {
        totalBudget: userBudget,
        averageProgramCost: averageCost,
        affordablePrograms: affordableCount,
        budgetUtilization
      }

      // Find scholarship opportunities (regardless of affordability)
      const scholarshipPrograms = savedProgramsCosts.filter(spc => 
        spc.programs?.scholarship_available
      )

      // Debug scholarship detection
      console.log('🔍 Scholarship Debug:', {
        allPrograms: savedProgramsCosts.map(spc => ({
          programName: spc.programs?.name,
          hasScholarship: spc.programs?.scholarship_available,
          isAffordable: spc.isAffordable,
          scholarshipAvailable: spc.programs?.scholarship_available
        })),
        scholarshipProgramsCount: scholarshipPrograms.length
      })

      console.log('🔍 Dashboard Debug - Cost Analysis:', {
        savedProgramsCount: savedPrograms?.length || 0,
        savedProgramsCostsCount: savedProgramsCosts.length,
        userBudget,
        affordableCount,
        scholarshipProgramsCount: scholarshipPrograms.length,
        budgetAnalysis
      })

      setCostData({
        savedProgramsCosts,
        budgetAnalysis,
        costComparisons: savedProgramsCosts.sort((a, b) => a.totalCostNGN - b.totalCostNGN),
        scholarshipOpportunities: scholarshipPrograms
      })

    } catch (err) {
      console.error('Error fetching cost data:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id, preferences])

  // Get budget insights for Nigerian students
  const getBudgetInsights = useCallback(() => {
    if (!costData?.budgetAnalysis) return []

    const insights = []
    const { budgetUtilization } = costData.budgetAnalysis

    if (budgetUtilization > 120) {
      insights.push({
        type: 'budget_exceeded',
        message: 'Your saved programs exceed your budget by 20%+',
        suggestion: 'Consider programs with scholarships or lower-cost countries',
        priority: 'high'
      })
    } else if (budgetUtilization > 100) {
      insights.push({
        type: 'budget_tight',
        message: 'Your saved programs are at your budget limit',
        suggestion: 'Look for scholarship opportunities to reduce costs',
        priority: 'medium'
      })
    } else if (budgetUtilization < 70) {
      insights.push({
        type: 'budget_comfortable',
        message: 'You have budget room for additional programs',
        suggestion: 'Consider premium programs or longer durations',
        priority: 'low'
      })
    }

    if (costData.scholarshipOpportunities.length > 0) {
      insights.push({
        type: 'scholarship_available',
        message: `${costData.scholarshipOpportunities.length} scholarship opportunities in your saved programs`,
        suggestion: 'Apply for scholarships to reduce costs significantly',
        priority: 'high'
      })
    }

    return insights
  }, [costData])

  useEffect(() => {
    fetchCostData()
  }, [fetchCostData])

  return {
    costData,
    loading,
    refetchCostData: fetchCostData,
    getBudgetInsights
  }
}
