import { useState, useEffect, useCallback } from 'react'
import UnifiedPreferenceService, { UserPreferences, ProgramMatchInput } from '../lib/preferences'
import { useAuth } from '../contexts/AuthContext'

/**
 * React hook for unified user preferences
 * Handles both structured and JSONB preference data seamlessly
 */
export const useUserPreferences = () => {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const prefs = await UnifiedPreferenceService.getUserPreferences(user.id)
      setPreferences(prefs)
      setError(null)
    } catch (err) {
      setError('Failed to load preferences')
      console.error('Error fetching preferences:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Update preferences
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!user?.id) return { success: false, error: 'No user logged in' }

    try {
      const result = await UnifiedPreferenceService.updatePreferences(user.id, updates)
      
      if (result.success) {
        // Refetch to get updated data
        await fetchPreferences()
      }
      
      return result
    } catch (err) {
      console.error('Error updating preferences:', err)
      return { success: false, error: 'Failed to update preferences' }
    }
  }, [user?.id, fetchPreferences])

  // Calculate profile completion percentage
  const completionPercentage = preferences 
    ? UnifiedPreferenceService.getProfileCompletionPercentage(preferences)
    : 0

  // Check if profile is complete enough for good recommendations
  const isProfileComplete = completionPercentage >= 70

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refetchPreferences: fetchPreferences,
    completionPercentage,
    isProfileComplete
  }
}

/**
 * React hook for personalized program recommendations
 */
export const usePersonalizedPrograms = (limit: number = 20) => {
  const { user } = useAuth()
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendations = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const recommendations = await UnifiedPreferenceService.getPersonalizedPrograms(user.id, limit)
      setPrograms(recommendations)
      setError(null)
    } catch (err) {
      setError('Failed to load recommendations')
      console.error('Error fetching recommendations:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id, limit])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  return {
    programs,
    loading,
    error,
    refetchRecommendations: fetchRecommendations
  }
}

/**
 * React hook for program matching and scoring
 */
export const useProgramMatch = () => {
  const { preferences } = useUserPreferences()

  const calculateMatch = useCallback(async (programId: string) => {
    if (!preferences) return 0

    const matchInput: ProgramMatchInput = {
      countries: preferences.countries,
      specializations: preferences.specializations,
      budgetRange: preferences.budgetRange,
      studyLevel: preferences.studyLevel,
      scholarshipNeeded: preferences.scholarshipNeeded
    }

    return UnifiedPreferenceService.calculateProgramMatch(programId, matchInput)
  }, [preferences])

  const getMatchExplanation = useCallback((score: number, program: any) => {
    if (!preferences) return []
    return UnifiedPreferenceService.getMatchExplanation(score, program, preferences)
  }, [preferences])

  const trackInteraction = useCallback((programId: string, action: 'view' | 'save' | 'apply' | 'share') => {
    if (preferences) {
      // Get user ID from auth context
      const userId = (window as any).currentUserId // This would come from your auth context
      UnifiedPreferenceService.trackProgramInteraction(userId, programId, action)
    }
  }, [preferences])

  return {
    calculateMatch,
    getMatchExplanation,
    trackInteraction,
    hasPreferences: !!preferences
  }
}

/**
 * React hook for onboarding progress tracking
 */
export const useOnboardingProgress = () => {
  const { preferences, updatePreferences, completionPercentage } = useUserPreferences()

  // Check which onboarding steps are complete
  const getOnboardingStatus = useCallback(() => {
    if (!preferences) {
      return {
        quickStart: false,
        detailedProfile: false,
        currentStep: 'quick-start'
      }
    }

    const hasBasicPrefs = preferences.countries.length > 0 && 
                         preferences.specializations.length > 0 &&
                         preferences.budgetRange !== undefined

    const hasDetailedProfile = preferences.profileCompleted

    return {
      quickStart: hasBasicPrefs,
      detailedProfile: hasDetailedProfile,
      currentStep: !hasBasicPrefs ? 'quick-start' : 
                   !hasDetailedProfile ? 'detailed-profile' : 
                   'complete'
    }
  }, [preferences])

  // Complete quick start onboarding
  const completeQuickStart = useCallback(async (quickPrefs: {
    specializations: string[]
    studyLevel: string
    countries: string[]
    budgetRange: number
    scholarshipNeeded: boolean
    preferredDuration: string
  }) => {
    return updatePreferences(quickPrefs)
  }, [updatePreferences])

  // Complete detailed profile
  const completeDetailedProfile = useCallback(async (detailedPrefs: Partial<UserPreferences>) => {
    return updatePreferences({
      ...detailedPrefs,
      profileCompleted: true
    })
  }, [updatePreferences])

  const onboardingStatus = getOnboardingStatus()

  return {
    ...onboardingStatus,
    completionPercentage,
    completeQuickStart,
    completeDetailedProfile,
    preferences
  }
}

/**
 * Format currency for Nigerian users
 */
export const formatNGN = (amount: number): string => {
  return amount.toLocaleString('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

/**
 * Format large currency amounts compactly for mobile
 */
export const formatCompactNGN = (amount: number): string => {
  if (amount >= 1000000000) {
    return `₦${(amount / 1000000000).toFixed(1)}B`
  } else if (amount >= 1000000) {
    return `₦${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `₦${(amount / 1000).toFixed(0)}K`
  }
  return formatNGN(amount)
}
