import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import UnifiedPreferenceService, { UserPreferences, StructuredPreferences } from '../preferences'
import { supabase } from '../supabase'

// Mock Supabase
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn()
      })),
      upsert: jest.fn(),
      rpc: jest.fn()
    }))
  }
}))

const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('UnifiedPreferenceService Data Consistency Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Data Merging Logic', () => {
    it('should prioritize structured preferences over JSONB', async () => {
      // Arrange: Mock responses where structured data differs from JSONB
      const mockProfileData = {
        data: {
          profile_completed: true,
          study_preferences: {
            countries: ['USA', 'UK'], // JSONB value
            specializations: ['Computer Science'], // JSONB value
            max_tuition: '50000',
            program_type: ['Masters']
          }
        }
      }

      const mockPreferencesData = {
        data: {
          user_id: 'test-user-id',
          countries: ['Canada', 'Australia'], // Structured value (should win)
          specializations: ['Data Science', 'AI'], // Structured value (should win)
          budget_range: 60000,
          study_level: 'PhD',
          scholarship_needed: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        }
      }

      // Mock parallel promises
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue(mockProfileData)
              }))
            }))
          } as any
        } else if (table === 'user_preferences') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue(mockPreferencesData)
              }))
            }))
          } as any
        }
        return {} as any
      })

      // Act
      const result = await UnifiedPreferenceService.getUserPreferences('test-user-id')

      // Assert: Structured data should take precedence
      expect(result).toEqual({
        profileCompleted: true,
        // These should come from structured preferences (priority)
        specializations: ['Data Science', 'AI'],
        countries: ['Canada', 'Australia'],
        budgetRange: 60000,
        studyLevel: 'PhD',
        scholarshipNeeded: true,
        // These should fall back to JSONB since no structured equivalent
        preferredCities: undefined,
        languagePreference: undefined,
        preferredDuration: undefined,
        goals: undefined,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      })
    })

    it('should fall back to JSONB when structured data is missing', async () => {
      // Arrange: Structured preferences missing, only JSONB available
      const mockProfileData = {
        data: {
          profile_completed: false,
          study_preferences: {
            countries: ['Germany', 'Netherlands'],
            specializations: ['Engineering'],
            max_tuition: '30000',
            program_type: ['Masters'],
            preferred_cities: ['Berlin', 'Amsterdam'],
            language_preference: 'English',
            start_date: '2024-09-01'
          }
        }
      }

      const mockPreferencesData = {
        data: null // No structured preferences
      }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue(mockProfileData)
              }))
            }))
          } as any
        } else if (table === 'user_preferences') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue(mockPreferencesData)
              }))
            }))
          } as any
        }
        return {} as any
      })

      // Act
      const result = await UnifiedPreferenceService.getUserPreferences('test-user-id')

      // Assert: Should fall back to JSONB values
      expect(result).toEqual({
        profileCompleted: false,
        specializations: ['Engineering'],
        countries: ['Germany', 'Netherlands'],
        studyLevel: 'Masters', // from program_type[0]
        budgetRange: 30000, // parsed from max_tuition
        preferredCities: ['Berlin', 'Amsterdam'],
        languagePreference: 'English',
        preferredDuration: '2024-09-01',
        scholarshipNeeded: false, // default
        goals: undefined,
        createdAt: undefined,
        updatedAt: undefined
      })
    })

    it('should handle empty arrays and null values correctly', async () => {
      // Arrange: Mix of empty arrays and null values
      const mockProfileData = {
        data: {
          profile_completed: true,
          study_preferences: {
            countries: [], // Empty array
            specializations: null, // Null value
            max_tuition: '', // Empty string
            program_type: []
          }
        }
      }

      const mockPreferencesData = {
        data: {
          user_id: 'test-user-id',
          countries: [], // Empty structured array
          specializations: ['AI'], // Non-empty structured array
          budget_range: null, // Null structured value
          preferred_cities: null
        }
      }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue(mockProfileData)
              }))
            }))
          } as any
        } else if (table === 'user_preferences') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue(mockPreferencesData)
              }))
            }))
          } as any
        }
        return {} as any
      })

      // Act
      const result = await UnifiedPreferenceService.getUserPreferences('test-user-id')

      // Assert: Should handle empty/null values appropriately
      expect(result).toEqual({
        profileCompleted: true,
        specializations: ['AI'], // Structured non-empty wins
        countries: [], // Structured empty array wins
        budgetRange: undefined, // Both null/empty, so undefined
        studyLevel: undefined, // program_type is empty
        preferredCities: undefined, // Both null
        languagePreference: undefined,
        preferredDuration: undefined,
        scholarshipNeeded: false,
        goals: undefined,
        createdAt: undefined,
        updatedAt: undefined
      })
    })
  })

  describe('Data Type Consistency', () => {
    it('should handle numeric budget conversions correctly', async () => {
      const mockProfileData = {
        data: {
          study_preferences: {
            max_tuition: '75000.50' // String number
          }
        }
      }

      const mockPreferencesData = {
        data: {
          budget_range: 80000 // Numeric
        }
      }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue(mockProfileData)
              }))
            }))
          } as any
        } else if (table === 'user_preferences') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue(mockPreferencesData)
              }))
            }))
          } as any
        }
        return {} as any
      })

      const result = await UnifiedPreferenceService.getUserPreferences('test-user-id')
      
      // Structured numeric should win over JSONB string
      expect(result?.budgetRange).toBe(80000)
      expect(typeof result?.budgetRange).toBe('number')
    })

    it('should handle array type consistency', async () => {
      const mockProfileData = {
        data: {
          study_preferences: {
            countries: 'USA,UK,Canada', // String instead of array
            specializations: ['Computer Science'] // Proper array
          }
        }
      }

      const mockPreferencesData = {
        data: {
          countries: ['Australia', 'New Zealand'], // Proper array (should win)
          specializations: null // Null (should fall back to JSONB)
        }
      }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue(mockProfileData)
              }))
            }))
          } as any
        } else if (table === 'user_preferences') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue(mockPreferencesData)
              }))
            }))
          } as any
        }
        return {} as any
      })

      const result = await UnifiedPreferenceService.getUserPreferences('test-user-id')
      
      expect(result?.countries).toEqual(['Australia', 'New Zealand'])
      expect(result?.specializations).toEqual(['Computer Science'])
      expect(Array.isArray(result?.countries)).toBe(true)
      expect(Array.isArray(result?.specializations)).toBe(true)
    })
  })

  describe('Update Consistency', () => {
    it('should update both systems when updating preferences', async () => {
      // Mock successful updates
      const mockProfileUpdate = { error: null }
      const mockPreferencesUpdate = { error: null }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            update: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue(mockProfileUpdate)
            }))
          } as any
        } else if (table === 'user_preferences') {
          return {
            upsert: jest.fn().mockResolvedValue(mockPreferencesUpdate)
          } as any
        }
        return {} as any
      })

      const updates: Partial<UserPreferences> = {
        specializations: ['Machine Learning'],
        countries: ['Switzerland'],
        budgetRange: 90000,
        scholarshipNeeded: true
      }

      const result = await UnifiedPreferenceService.updatePreferences('test-user-id', updates)

      expect(result.success).toBe(true)
      
      // Verify both systems were updated
      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles')
      expect(mockSupabase.from).toHaveBeenCalledWith('user_preferences')
    })

    it('should handle partial update failures gracefully', async () => {
      // Mock profile update failure
      const mockProfileUpdate = { error: { message: 'Profile update failed' } }
      const mockPreferencesUpdate = { error: null }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            update: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue(mockProfileUpdate)
            }))
          } as any
        } else if (table === 'user_preferences') {
          return {
            upsert: jest.fn().mockResolvedValue(mockPreferencesUpdate)
          } as any
        }
        return {} as any
      })

      const updates: Partial<UserPreferences> = {
        specializations: ['Data Science']
      }

      const result = await UnifiedPreferenceService.updatePreferences('test-user-id', updates)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Profile update failed')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should return null for invalid user ID', async () => {
      const result = await UnifiedPreferenceService.getUserPreferences('')
      expect(result).toBeNull()
    })

    it('should handle database connection errors', async () => {
      mockSupabase.from.mockImplementation(() => {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockRejectedValue(new Error('Database connection failed'))
            }))
          }))
        } as any
      })

      const result = await UnifiedPreferenceService.getUserPreferences('test-user-id')
      expect(result).toBeNull()
    })

    it('should handle malformed JSONB data', async () => {
      const mockProfileData = {
        data: {
          study_preferences: {
            countries: { invalid: 'data' }, // Invalid format
            max_tuition: 'not-a-number',
            program_type: 'not-an-array'
          }
        }
      }

      const mockPreferencesData = { data: null }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue(mockProfileData)
              }))
            }))
          } as any
        } else if (table === 'user_preferences') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue(mockPreferencesData)
              }))
            }))
          } as any
        }
        return {} as any
      })

      const result = await UnifiedPreferenceService.getUserPreferences('test-user-id')
      
      // Should handle malformed data gracefully
      expect(result).toBeDefined()
      expect(result?.countries).toEqual([])  // Invalid data should default to empty
      expect(result?.budgetRange).toBeUndefined() // Invalid number should be undefined
      expect(result?.studyLevel).toBeUndefined() // Invalid array should be undefined
    })
  })

  describe('Profile Completion Calculation', () => {
    it('should calculate completion percentage correctly', () => {
      const completePreferences: UserPreferences = {
        profileCompleted: true,
        specializations: ['Computer Science'],
        studyLevel: 'Masters',
        countries: ['USA'],
        budgetRange: 50000,
        preferredCities: ['San Francisco'],
        languagePreference: 'English',
        goals: 'Career advancement',
        preferredDuration: '2 years',
        scholarshipNeeded: false
      }

      const percentage = UnifiedPreferenceService.getProfileCompletionPercentage(completePreferences)
      expect(percentage).toBe(100)
    })

    it('should handle incomplete profiles', () => {
      const incompletePreferences: UserPreferences = {
        profileCompleted: false,
        specializations: ['Computer Science'], // Required field present
        studyLevel: 'Masters', // Required field present
        countries: [], // Required field empty
        budgetRange: undefined, // Required field missing
        scholarshipNeeded: false
      }

      const percentage = UnifiedPreferenceService.getProfileCompletionPercentage(incompletePreferences)
      expect(percentage).toBeLessThan(100)
      expect(percentage).toBeGreaterThan(0)
    })
  })

  describe('Default Value Handling', () => {
    it('should apply correct default values', async () => {
      const mockProfileData = { data: null }
      const mockPreferencesData = { data: null }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue(mockProfileData)
              }))
            }))
          } as any
        } else if (table === 'user_preferences') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue(mockPreferencesData)
              }))
            }))
          } as any
        }
        return {} as any
      })

      const result = await UnifiedPreferenceService.getUserPreferences('test-user-id')

      expect(result).toEqual({
        profileCompleted: false, // Default
        specializations: [], // Default empty array
        countries: [], // Default empty array
        preferredCities: [], // Default empty array
        scholarshipNeeded: false, // Default
        studyLevel: undefined,
        budgetRange: undefined,
        languagePreference: undefined,
        goals: undefined,
        preferredDuration: undefined,
        createdAt: undefined,
        updatedAt: undefined
      })
    })
  })
})

// Integration test helper for real database testing
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