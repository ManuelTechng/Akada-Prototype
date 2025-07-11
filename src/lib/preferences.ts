import { supabase } from './supabase'

// Enhanced interfaces for unified preference system
export interface UserPreferences {
  // Basic info
  profileCompleted: boolean
  
  // Academic preferences (prioritize structured over JSONB)
  specializations: string[]
  studyLevel?: string
  
  // Location preferences
  countries: string[]
  preferredCities: string[]
  
  // Financial preferences
  budgetRange?: number // in NGN
  scholarshipNeeded: boolean
  
  // Timeline preferences
  preferredDuration?: string
  
  // Other preferences
  languagePreference?: string
  goals?: string
  
  // Metadata
  createdAt?: string
  updatedAt?: string
}

export interface StudyPreferencesJSONB {
  countries?: string[]
  specializations?: string[]
  max_tuition?: string
  program_type?: string[]
  preferred_cities?: string[]
  language_preference?: string
  start_date?: string
}

export interface StructuredPreferences {
  user_id: string
  specializations?: string[]
  preferred_duration?: string
  study_level?: string
  preferred_cities?: string[]
  language_preference?: string
  scholarship_needed: boolean
  goals?: string
  budget_range?: number
  countries?: string[]
  created_at?: string
  updated_at?: string
}

export interface ProgramMatchInput {
  countries: string[]
  specializations: string[]
  budgetRange?: number
  studyLevel?: string
  scholarshipNeeded: boolean
}

/**
 * Unified Preference Service - Handles both structured and JSONB preference data
 * Prioritizes structured data over JSONB for consistency and performance
 */
export class UnifiedPreferenceService {
  /**
   * Get unified user preferences from both data sources
   */
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    if (!userId) return null

    try {
      // Fetch both preference systems in parallel
      const [profileData, preferencesData] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('study_preferences, profile_completed')
          .eq('id', userId)
          .single(),
        supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .single()
      ])

      const profile = profileData.data
      const preferences = preferencesData.data
      const studyPrefs = profile?.study_preferences as StudyPreferencesJSONB

      // Merge and prioritize structured preferences over JSONB
      const unifiedPreferences: UserPreferences = {
        // Basic info
        profileCompleted: profile?.profile_completed || false,
        
        // Academic preferences (prioritize structured over JSONB)
        specializations: preferences?.specializations || 
                        studyPrefs?.specializations || [],
        studyLevel: preferences?.study_level ||
                   studyPrefs?.program_type?.[0],
        
        // Location preferences
        countries: preferences?.countries ||
                  studyPrefs?.countries || [],
        preferredCities: preferences?.preferred_cities ||
                        studyPrefs?.preferred_cities || [],
        
        // Financial preferences
        budgetRange: preferences?.budget_range ||
                    parseFloat(studyPrefs?.max_tuition || '0') || undefined,
        scholarshipNeeded: preferences?.scholarship_needed || false,
        
        // Timeline preferences
        preferredDuration: preferences?.preferred_duration ||
                          studyPrefs?.start_date,
        
        // Other preferences
        languagePreference: preferences?.language_preference ||
                           studyPrefs?.language_preference,
        goals: preferences?.goals,
        
        // Metadata
        createdAt: preferences?.created_at,
        updatedAt: preferences?.updated_at
      }

      return unifiedPreferences
    } catch (error) {
      console.error('Error fetching unified preferences:', error)
      return null
    }
  }

  /**
   * Update preferences in both systems for consistency
   */
  static async updatePreferences(
    userId: string, 
    updates: Partial<UserPreferences>
  ): Promise<{ success: boolean; error?: string }> {
    if (!userId) {
      return { success: false, error: 'User ID is required' }
    }

    try {
      // Prepare updates for both systems
      const structuredUpdate: Partial<StructuredPreferences> = {
        user_id: userId,
        specializations: updates.specializations,
        study_level: updates.studyLevel,
        countries: updates.countries,
        preferred_cities: updates.preferredCities,
        budget_range: updates.budgetRange,
        scholarship_needed: updates.scholarshipNeeded,
        preferred_duration: updates.preferredDuration,
        language_preference: updates.languagePreference,
        goals: updates.goals,
        updated_at: new Date().toISOString()
      }

      const jsonbUpdate: StudyPreferencesJSONB = {
        countries: updates.countries,
        specializations: updates.specializations,
        max_tuition: updates.budgetRange?.toString(),
        program_type: updates.studyLevel ? [updates.studyLevel] : undefined,
        preferred_cities: updates.preferredCities,
        language_preference: updates.languagePreference,
        start_date: updates.preferredDuration
      }

      // Update both systems in parallel
      const [profileUpdate, preferencesUpdate] = await Promise.all([
        supabase
          .from('user_profiles')
          .update({
            study_preferences: jsonbUpdate,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId),
        
        supabase
          .from('user_preferences')
          .upsert(structuredUpdate, { onConflict: 'user_id' })
      ])

      if (profileUpdate.error || preferencesUpdate.error) {
        console.error('Error updating preferences:', {
          profileError: profileUpdate.error,
          preferencesError: preferencesUpdate.error
        })
        return { 
          success: false, 
          error: profileUpdate.error?.message || preferencesUpdate.error?.message 
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in updatePreferences:', error)
      return { success: false, error: 'Failed to update preferences' }
    }
  }

  /**
   * Get personalized program recommendations using the new database function
   */
  static async getPersonalizedPrograms(userId: string, limit: number = 20) {
    try {
      const preferences = await this.getUserPreferences(userId)
      if (!preferences) {
        // Return basic programs if no preferences
        return this.getBasicPrograms(limit)
      }

      // Use our new database function for scoring
      const { data: programs, error } = await supabase
        .rpc('get_recommended_programs', {
          user_countries: preferences.countries,
          user_specializations: preferences.specializations,
          user_budget: preferences.budgetRange,
          user_study_level: preferences.studyLevel,
          needs_scholarship: preferences.scholarshipNeeded,
          result_limit: limit
        })

      if (error) {
        console.error('Error getting personalized programs:', error)
        return this.getBasicPrograms(limit)
      }

      return programs || []
    } catch (error) {
      console.error('Error in getPersonalizedPrograms:', error)
      return this.getBasicPrograms(limit)
    }
  }

  /**
   * Fallback method for basic program recommendations
   */
  private static async getBasicPrograms(limit: number = 20) {
    const { data: programs } = await supabase
      .from('programs')
      .select('*')
      .limit(limit)
      .order('created_at', { ascending: false })

    return programs || []
  }

  /**
   * Calculate match score for a specific program
   */
  static async calculateProgramMatch(
    programId: string, 
    userPreferences: ProgramMatchInput
  ): Promise<number> {
    try {
      const { data: matchScore } = await supabase
        .rpc('calculate_program_match_score', {
          program_id: programId,
          user_countries: userPreferences.countries,
          user_specializations: userPreferences.specializations,
          user_budget: userPreferences.budgetRange,
          user_study_level: userPreferences.studyLevel,
          needs_scholarship: userPreferences.scholarshipNeeded
        })

      return matchScore || 0
    } catch (error) {
      console.error('Error calculating program match:', error)
      return 0
    }
  }

  /**
   * Get match explanation for a program
   */
  static getMatchExplanation(
    score: number, 
    program: any, 
    userPreferences: UserPreferences
  ): string[] {
    const reasons: string[] = []

    // Country match
    if (userPreferences.countries.includes(program.country)) {
      reasons.push(`🌍 Matches your preference for ${program.country}`)
    }

    // Specialization match
    if (userPreferences.specializations.some(spec => 
      program.specialization?.includes(spec) || program.name.includes(spec)
    )) {
      reasons.push(`🎓 Matches your field of interest`)
    }

    // Budget match
    if (userPreferences.budgetRange && program.tuition_fee <= userPreferences.budgetRange) {
      reasons.push(`💰 Within your budget range`)
    }

    // Scholarship match
    if (userPreferences.scholarshipNeeded && program.scholarship_available) {
      reasons.push(`🎯 Offers scholarships you need`)
    }

    // Study level match
    if (program.study_level === userPreferences.studyLevel) {
      reasons.push(`📚 Matches your study level`)
    }

    return reasons
  }

  /**
   * Track user behavior for future personalization
   */
  static async trackProgramInteraction(
    userId: string,
    programId: string,
    action: 'view' | 'save' | 'apply' | 'share'
  ) {
    try {
      // Could be stored in a separate analytics table or sent to analytics service
      console.log('Program interaction tracked:', { userId, programId, action, timestamp: new Date() })
      
      // For now, we'll just log it, but this could be enhanced to:
      // 1. Store in a user_interactions table
      // 2. Send to analytics service (PostHog, Mixpanel, etc.)
      // 3. Use for machine learning model training
    } catch (error) {
      console.error('Error tracking program interaction:', error)
    }
  }

  /**
   * Get completion percentage for user profile
   */
  static getProfileCompletionPercentage(preferences: UserPreferences): number {
    const requiredFields = [
      'specializations',
      'studyLevel', 
      'countries',
      'budgetRange'
    ]

    const optionalFields = [
      'preferredCities',
      'languagePreference',
      'goals',
      'preferredDuration'
    ]

    let score = 0
    const totalWeight = 100

    // Required fields (70% weight)
    const requiredWeight = 70
    const requiredFieldWeight = requiredWeight / requiredFields.length
    
    requiredFields.forEach(field => {
      const value = preferences[field as keyof UserPreferences]
      if (Array.isArray(value) ? value.length > 0 : value) {
        score += requiredFieldWeight
      }
    })

    // Optional fields (30% weight)
    const optionalWeight = 30
    const optionalFieldWeight = optionalWeight / optionalFields.length
    
    optionalFields.forEach(field => {
      const value = preferences[field as keyof UserPreferences]
      if (Array.isArray(value) ? value.length > 0 : value) {
        score += optionalFieldWeight
      }
    })

    return Math.round(score)
  }
}

// Legacy exports for backward compatibility
export const getUserPreferences = UnifiedPreferenceService.getUserPreferences
export const updateUserPreferences = (userId: string, preferences: any) => 
  UnifiedPreferenceService.updatePreferences(userId, preferences)

// Export the service class as default
export default UnifiedPreferenceService
