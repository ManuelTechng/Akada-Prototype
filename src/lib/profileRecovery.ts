import { supabase } from './supabase'
import { getUserProfile } from './auth'

export const ensureUserProfile = async (userId: string) => {
  if (!userId) return null

  try {
    // Check if profile exists
    const { data: existingProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create a basic one
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: '',
          email: '',
          phone_number: '',
          education_level: '',
          field_of_study: '',
          city: '',
          country: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating profile:', createError)
        return null
      }

      return newProfile
    }

    if (error) {
      console.error('Error checking profile:', error)
      return null
    }

    return existingProfile
  } catch (err) {
    console.error('Error ensuring user profile:', err)
    return null
  }
} 