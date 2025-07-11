import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import UnifiedPreferenceService from '../preferences'
import { supabase } from '../supabase'

/**
 * Integration tests for UnifiedPreferenceService
 * These tests run against the actual Supabase database
 * Use with caution in production environments
 */

describe('UnifiedPreferenceService Integration Tests', () => {
  let testUserId: string
  let cleanup: Array<() => Promise<void>> = []

  beforeAll(async () => {
    // Create a test user for integration testing
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: `test-${Date.now()}@akada-test.com`,
      password: 'test-password-123'
    })

    if (authError || !authUser.user) {
      throw new Error(`Failed to create test user: ${authError?.message}`)
    }

    testUserId = authUser.user.id

    // Add cleanup function
    cleanup.push(async () => {
      // Clean up test data
      await supabase.from('user_preferences').delete().eq('user_id', testUserId)
      await supabase.from('user_profiles').delete().eq('id', testUserId)
    })
  })

  afterAll(async () => {
    // Run all cleanup functions
    for (const cleanupFn of cleanup) {
      await cleanupFn()
    }
  })

  describe('Real Database Data Consistency', () => {
    it('should create and merge preferences correctly', async () => {
      // Step 1: Create structured preferences
      const { error: prefError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: testUserId,
          specializations: ['Computer Science', 'Data Science'],
          countries: ['USA', 'Canada'],
          study_level: 'Masters',
          budget_range: 75000,
          scholarship_needed: true,
          goals: 'Career advancement'
        })

      expect(prefError).toBeNull()

      // Step 2: Create JSONB preferences in user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: testUserId,
          email: `test-${Date.now()}@akada-test.com`,
          full_name: 'Test User',
          education_level: 'Undergraduate',
          study_preferences: {
            countries: ['UK', 'Germany'], // Different from structured
            specializations: ['Engineering'], // Different from structured
            max_tuition: '50000', // Different from structured
            program_type: ['PhD'], // Different from structured
            preferred_cities: ['London', 'Berlin'],
            language_preference: 'English'
          },
          profile_completed: false
        })

      expect(profileError).toBeNull()

      // Step 3: Fetch unified preferences
      const unifiedPrefs = await UnifiedPreferenceService.getUserPreferences(testUserId)

      // Step 4: Verify structured data takes precedence
      expect(unifiedPrefs).toBeDefined()
      expect(unifiedPrefs?.specializations).toEqual(['Computer Science', 'Data Science']) // Structured wins
      expect(unifiedPrefs?.countries).toEqual(['USA', 'Canada']) // Structured wins
      expect(unifiedPrefs?.studyLevel).toBe('Masters') // Structured wins
      expect(unifiedPrefs?.budgetRange).toBe(75000) // Structured wins
      expect(unifiedPrefs?.scholarshipNeeded).toBe(true) // Structured wins

      // Step 5: Verify JSONB fallback for missing structured fields
      expect(unifiedPrefs?.preferredCities).toEqual(['London', 'Berlin']) // JSONB fallback
      expect(unifiedPrefs?.languagePreference).toBe('English') // JSONB fallback
    })

    it('should update both systems consistently', async () => {
      const updates = {
        specializations: ['Machine Learning', 'AI'],
        countries: ['Switzerland', 'Netherlands'],
        budgetRange: 90000,
        preferredCities: ['Zurich', 'Amsterdam'],
        languagePreference: 'German'
      }

      const result = await UnifiedPreferenceService.updatePreferences(testUserId, updates)
      expect(result.success).toBe(true)

      // Verify updates in structured table
      const { data: structuredData } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', testUserId)
        .single()

      expect(structuredData?.specializations).toEqual(['Machine Learning', 'AI'])
      expect(structuredData?.countries).toEqual(['Switzerland', 'Netherlands'])
      expect(structuredData?.budget_range).toBe(90000)

      // Verify updates in JSONB
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('study_preferences')
        .eq('id', testUserId)
        .single()

      const studyPrefs = profileData?.study_preferences as any
      expect(studyPrefs?.countries).toEqual(['Switzerland', 'Netherlands'])
      expect(studyPrefs?.specializations).toEqual(['Machine Learning', 'AI'])
      expect(studyPrefs?.preferred_cities).toEqual(['Zurich', 'Amsterdam'])
      expect(studyPrefs?.language_preference).toBe('German')
    })
  })

  describe('Data Migration Scenarios', () => {
    it('should handle migration from JSONB-only to unified system', async () => {
      // Create a new test user with only JSONB data (legacy scenario)
      const { data: legacyUser } = await supabase.auth.signUp({
        email: `legacy-${Date.now()}@akada-test.com`,
        password: 'test-password-123'
      })

      const legacyUserId = legacyUser.user!.id

      // Insert only JSONB preferences (legacy state)
      await supabase.from('user_profiles').insert({
        id: legacyUserId,
        email: `legacy-${Date.now()}@akada-test.com`,
        full_name: 'Legacy User',
        education_level: 'Graduate',
        study_preferences: {
          countries: ['Australia', 'New Zealand'],
          specializations: ['Environmental Science'],
          max_tuition: '40000',
          program_type: ['Masters'],
          preferred_cities: ['Sydney', 'Auckland'],
          language_preference: 'English',
          start_date: '2024-09-01'
        }
      })

      // Fetch should work with JSONB fallback
      const preferences = await UnifiedPreferenceService.getUserPreferences(legacyUserId)
      
      expect(preferences?.countries).toEqual(['Australia', 'New Zealand'])
      expect(preferences?.specializations).toEqual(['Environmental Science'])
      expect(preferences?.budgetRange).toBe(40000)
      expect(preferences?.studyLevel).toBe('Masters')

      // Update should create structured preferences
      const updateResult = await UnifiedPreferenceService.updatePreferences(legacyUserId, {
        budgetRange: 45000,
        scholarshipNeeded: true
      })

      expect(updateResult.success).toBe(true)

      // Verify structured preferences were created
      const { data: newStructuredData } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', legacyUserId)
        .single()

      expect(newStructuredData).toBeDefined()
      expect(newStructuredData?.budget_range).toBe(45000)
      expect(newStructuredData?.scholarship_needed).toBe(true)

      // Cleanup
      cleanup.push(async () => {
        await supabase.from('user_preferences').delete().eq('user_id', legacyUserId)
        await supabase.from('user_profiles').delete().eq('id', legacyUserId)
      })
    })
  })
})

/**
 * Data Consistency Report Generator
 * Analyzes real database data for consistency issues
 */
export class DataConsistencyValidator {
  static async generateFullReport(): Promise<{
    summary: {
      totalUsers: number
      usersWithBothSystems: number
      usersWithOnlyStructured: number
      usersWithOnlyJSONB: number
      usersWithConflicts: number
      consistencyScore: number
    }
    conflicts: Array<{
      userId: string
      field: string
      structuredValue: any
      jsonbValue: any
      recommendation: string
    }>
    recommendations: string[]
  }> {
    const report = {
      summary: {
        totalUsers: 0,
        usersWithBothSystems: 0,
        usersWithOnlyStructured: 0,
        usersWithOnlyJSONB: 0,
        usersWithConflicts: 0,
        consistencyScore: 0
      },
      conflicts: [] as Array<{
        userId: string
        field: string
        structuredValue: any
        jsonbValue: any
        recommendation: string
      }>,
      recommendations: [] as string[]
    }

    try {
      // Get all users with preference data
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, study_preferences')
        .not('study_preferences', 'is', null)

      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('user_id, specializations, countries, budget_range, study_level')

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
      const prefMap = new Map(preferences?.map(p => [p.user_id, p]) || [])

      const allUserIds = new Set([...profileMap.keys(), ...prefMap.keys()])
      
      report.summary.totalUsers = allUserIds.size

      for (const userId of allUserIds) {
        const profile = profileMap.get(userId)
        const pref = prefMap.get(userId)

        if (profile && pref) {
          report.summary.usersWithBothSystems++
          
          // Check for conflicts
          const studyPrefs = profile.study_preferences as any
          
          // Check countries conflict
          if (studyPrefs?.countries && pref.countries) {
            const jsonbCountries = JSON.stringify(studyPrefs.countries?.sort())
            const structuredCountries = JSON.stringify(pref.countries?.sort())
            
            if (jsonbCountries !== structuredCountries) {
              report.summary.usersWithConflicts++
              report.conflicts.push({
                userId,
                field: 'countries',
                structuredValue: pref.countries,
                jsonbValue: studyPrefs.countries,
                recommendation: 'Update JSONB to match structured preferences'
              })
            }
          }

          // Check specializations conflict
          if (studyPrefs?.specializations && pref.specializations) {
            const jsonbSpecs = JSON.stringify(studyPrefs.specializations?.sort())
            const structuredSpecs = JSON.stringify(pref.specializations?.sort())
            
            if (jsonbSpecs !== structuredSpecs) {
              report.summary.usersWithConflicts++
              report.conflicts.push({
                userId,
                field: 'specializations',
                structuredValue: pref.specializations,
                jsonbValue: studyPrefs.specializations,
                recommendation: 'Update JSONB to match structured preferences'
              })
            }
          }

          // Check budget conflict
          if (studyPrefs?.max_tuition && pref.budget_range) {
            const jsonbBudget = parseFloat(studyPrefs.max_tuition)
            const structuredBudget = pref.budget_range
            
            if (jsonbBudget !== structuredBudget) {
              report.summary.usersWithConflicts++
              report.conflicts.push({
                userId,
                field: 'budget',
                structuredValue: structuredBudget,
                jsonbValue: jsonbBudget,
                recommendation: 'Update JSONB max_tuition to match structured budget_range'
              })
            }
          }

        } else if (profile && !pref) {
          report.summary.usersWithOnlyJSONB++
        } else if (!profile && pref) {
          report.summary.usersWithOnlyStructured++
        }
      }

      // Calculate consistency score
      const totalDataPoints = report.summary.usersWithBothSystems * 3 // 3 comparable fields
      const conflicts = report.conflicts.length
      report.summary.consistencyScore = totalDataPoints > 0 ? 
        Math.round(((totalDataPoints - conflicts) / totalDataPoints) * 100) : 100

      // Generate recommendations
      if (report.summary.usersWithOnlyJSONB > 0) {
        report.recommendations.push(
          `Migrate ${report.summary.usersWithOnlyJSONB} users from JSONB-only to unified system`
        )
      }

      if (report.conflicts.length > 0) {
        report.recommendations.push(
          `Resolve ${report.conflicts.length} data conflicts by syncing JSONB with structured data`
        )
      }

      if (report.summary.consistencyScore < 95) {
        report.recommendations.push(
          'Implement automated data synchronization job'
        )
      }

      return report

    } catch (error) {
      console.error('Error generating consistency report:', error)
      throw error
    }
  }

  static async validateUser(userId: string) {
    return await createTestDataConsistencyReport(userId)
  }

  static async fixDataConflicts(dryRun: boolean = true): Promise<{
    fixesApplied: number
    errors: Array<{ userId: string; error: string }>
  }> {
    const report = await this.generateFullReport()
    const result = {
      fixesApplied: 0,
      errors: [] as Array<{ userId: string; error: string }>
    }

    if (dryRun) {
      console.log('DRY RUN: Would fix', report.conflicts.length, 'conflicts')
      return result
    }

    for (const conflict of report.conflicts) {
      try {
        // Apply structured preference value to JSONB
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('study_preferences')
          .eq('id', conflict.userId)
          .single()

        if (profile) {
          const studyPrefs = { ...profile.study_preferences }
          
          // Update the conflicting field
          if (conflict.field === 'countries') {
            studyPrefs.countries = conflict.structuredValue
          } else if (conflict.field === 'specializations') {
            studyPrefs.specializations = conflict.structuredValue
          } else if (conflict.field === 'budget') {
            studyPrefs.max_tuition = conflict.structuredValue.toString()
          }

          const { error } = await supabase
            .from('user_profiles')
            .update({ study_preferences: studyPrefs })
            .eq('id', conflict.userId)

          if (error) {
            result.errors.push({ userId: conflict.userId, error: error.message })
          } else {
            result.fixesApplied++
          }
        }
      } catch (error) {
        result.errors.push({ 
          userId: conflict.userId, 
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return result
  }
}

// Helper function from main test file
export const createTestDataConsistencyReport = async (userId: string) => {
  const preferences = await UnifiedPreferenceService.getUserPreferences(userId)
  
  if (!preferences) {
    return {
      userId,
      status: 'NO_DATA',
      issues: ['No preference data found'],
      recommendations: ['Initialize user preferences']
    }
  }

  const issues: string[] = []
  const recommendations: string[] = []

  // Check for common consistency issues
  if (preferences.specializations.length === 0) {
    issues.push('Missing specializations')
    recommendations.push('Prompt user to select field of study')
  }

  if (preferences.countries.length === 0) {
    issues.push('Missing country preferences')
    recommendations.push('Prompt user to select preferred countries')
  }

  if (!preferences.budgetRange) {
    issues.push('Missing budget information')
    recommendations.push('Prompt user to set budget range')
  }

  const completionPercentage = UnifiedPreferenceService.getProfileCompletionPercentage(preferences)
  
  return {
    userId,
    status: issues.length === 0 ? 'CONSISTENT' : 'NEEDS_ATTENTION',
    completionPercentage,
    issues,
    recommendations,
    preferences
  }
} 