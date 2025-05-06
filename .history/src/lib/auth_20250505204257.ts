import { supabase } from './supabase';
import type { UserProfile, SignUpData, AuthResponse } from './types';

// Constants for authentication configuration
const AUTH_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

// Helper function to get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('Getting profile for user:', userId);
    
    // First try to get existing profile
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // If profile exists, return it
    if (data) {
      console.log('Found existing profile:', data);
      return data;
    }
    
    // If error is anything other than "not found", throw it
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      throw error;
    }
    
    // No profile found, we need to create one from the user's metadata
    console.log('No profile found, creating new profile from user metadata');
    
    // Get user data from auth
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      console.error('Error getting user data for profile creation:', userError);
      throw new Error('Could not retrieve user information');
    }
    
    // Create a basic profile using auth metadata
    const newProfile = {
      id: userId,
      email: userData.user.email || '',
      full_name: userData.user.user_metadata?.full_name || 'User',
      education_level: userData.user.user_metadata?.education_level || 'Not specified',
      current_university: '',
      field_of_study: '',
      gpa: null,
      phone_number: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state_province: '',
      postal_code: '',
      country: '',
      date_of_birth: '',
      bio: '',
      test_scores: { 
        ielts: '', 
        toefl: '', 
        gre: { verbal: '', quantitative: '', analytical: '' } 
      },
      study_preferences: {
        countries: [],
        max_tuition: '',
        program_type: [],
        start_date: ''
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert the new profile into the database
    console.log('Creating new profile with data:', newProfile);
    
    // Use the Supabase client directly instead of manual fetch
    const { data: insertedData, error: insertError } = await supabase
      .from('user_profiles')
      .insert([newProfile])
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating initial profile:', insertError);
      throw insertError;
    }
    
    console.log('Initial profile created successfully:', insertedData);
    
    // Return the newly created profile
    return insertedData || newProfile;
    
  } catch (error) {
    console.error('Error getting/creating user profile:', error);
    return null;
  }
};

// Sign up with email, password and additional user data
export const signUp = async ({
  email,
  password,
  fullName,
  educationLevel
}: SignUpData): Promise<AuthResponse> => {
  try {
    if (!email?.trim()) {
      throw new Error('Email is required');
    }
    if (!password?.trim() || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (!fullName?.trim()) {
      throw new Error('Full Name is required');
    }
    if (!educationLevel?.trim()) {
      throw new Error('Education level is required');
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: { 
          full_name: fullName, 
          education_level: educationLevel 
        }
      },
    });

    if (error) throw error;

    // Check if session was created
    const { data: sessionData } = await supabase.auth.getSession();

    return { 
      user: data.user, 
      session: sessionData.session,
      error: null 
    };
  } catch (error) {
    console.error('Error signing up:', error);
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error : new Error('Failed to create account')
    };
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    if (!email?.trim()) throw new Error('Email is required');
    if (!password?.trim()) throw new Error('Password is required');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) throw error;

    return { 
      user: data.user, 
      session: data.session,
      error: null 
    };
  } catch (error) {
    console.error('Error signing in:', error);
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error : new Error('Failed to sign in')
    };
  }
};

// Sign out the current user
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { 
      error: error instanceof Error ? error : new Error('Unknown error during sign out')
    };
  }
};

// Get the current user session
export const getCurrentUser = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return null;
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.error('Error getting user:', error);
      return null;
    }
    
    const profile = await getUserProfile(user.id);
    return { user, profile };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>) => {
  try {
    console.log('Updating profile for user:', userId);
    console.log('Profile data:', JSON.stringify(profile, null, 2));
    
    // First check if the profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing profile:', fetchError);
      throw new Error(`Error checking profile: ${fetchError.message}`);
    }
    
    // Sanitize input to ensure proper JSON structure
    const cleanProfile = sanitizeProfileData(profile);
    
    if (existingProfile) {
      console.log('Existing profile found, updating...');
      
      // Create a properly formatted update object - including new fields
      const formattedProfile = {
        full_name: cleanProfile.full_name,
        email: cleanProfile.email || existingProfile.email,
        education_level: cleanProfile.education_level || existingProfile.education_level,
        current_university: cleanProfile.current_university,
        field_of_study: cleanProfile.field_of_study,
        gpa: cleanProfile.gpa,
        // Include new profile fields
        phone_number: cleanProfile.phone_number,
        address_line1: cleanProfile.address_line1,
        address_line2: cleanProfile.address_line2,
        city: cleanProfile.city,
        state_province: cleanProfile.state_province,
        postal_code: cleanProfile.postal_code,
        country: cleanProfile.country,
        date_of_birth: cleanProfile.date_of_birth,
        bio: cleanProfile.bio,
        test_scores: cleanProfile.test_scores ? cleanProfile.test_scores : existingProfile.test_scores,
        study_preferences: cleanProfile.study_preferences ? cleanProfile.study_preferences : existingProfile.study_preferences,
        updated_at: new Date().toISOString()
      };
      
      console.log('Sending formatted profile data:', JSON.stringify(formattedProfile, null, 2));
      
      // Use Supabase client instead of direct fetch
      const { data: updatedData, error: updateError } = await supabase
        .from('user_profiles')
        .update(formattedProfile)
        .eq('id', userId)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }
      
      console.log('Profile updated successfully:', updatedData);
      return updatedData;
      
    } else {
      console.log('No existing profile found, inserting new profile...');
      
      // Get the user's email from auth
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData?.user) {
        console.error('Error getting user data:', userError);
        throw new Error('Could not retrieve user information');
      }
      
      // Create a new profile with all required fields
      const newProfile = {
        id: userId,
        email: userData.user.email || '',
        full_name: userData.user.user_metadata?.full_name || cleanProfile.full_name || 'User',
        education_level: userData.user.user_metadata?.education_level || cleanProfile.education_level || 'Not specified',
        current_university: cleanProfile.current_university || '',
        field_of_study: cleanProfile.field_of_study || '',
        gpa: cleanProfile.gpa || null,
        // New profile fields
        phone_number: cleanProfile.phone_number || '',
        address_line1: cleanProfile.address_line1 || '',
        address_line2: cleanProfile.address_line2 || '',
        city: cleanProfile.city || '',
        state_province: cleanProfile.state_province || '',
        postal_code: cleanProfile.postal_code || '',
        country: cleanProfile.country || '',
        date_of_birth: cleanProfile.date_of_birth || '',
        bio: cleanProfile.bio || '',
        // Existing fields
        test_scores: cleanProfile.test_scores || { 
          ielts: '', 
          toefl: '', 
          gre: { verbal: '', quantitative: '', analytical: '' } 
        },
        study_preferences: cleanProfile.study_preferences || {
          countries: [],
          max_tuition: '',
          program_type: [],
          start_date: ''
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Sending new profile data:', JSON.stringify(newProfile, null, 2));
      
      // Use Supabase client instead of direct fetch
      const { data: insertedData, error: insertError } = await supabase
        .from('user_profiles')
        .insert([newProfile])
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating profile:', insertError);
        throw insertError;
      }
      
      console.log('Profile created successfully:', insertedData);
      return insertedData;
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Helper function to sanitize profile data and ensure proper JSON structure
const sanitizeProfileData = (profile: Partial<UserProfile>): Partial<UserProfile> => {
  const cleanProfile = { ...profile };
  
  // Check and fix test_scores if it exists
  if (cleanProfile.test_scores) {
    // If test_scores is a string, try to parse it
    if (typeof cleanProfile.test_scores === 'string') {
      try {
        cleanProfile.test_scores = JSON.parse(cleanProfile.test_scores);
      } catch (e) {
        console.warn('Could not parse test_scores as JSON:', e);
        // Default to an empty object if parsing fails
        cleanProfile.test_scores = {
          ielts: '',
          toefl: '',
          gre: { verbal: '', quantitative: '', analytical: '' }
        };
      }
    }
    
    // Ensure proper structure
    cleanProfile.test_scores = {
      ielts: cleanProfile.test_scores.ielts || '',
      toefl: cleanProfile.test_scores.toefl || '',
      gre: {
        verbal: cleanProfile.test_scores.gre?.verbal || '',
        quantitative: cleanProfile.test_scores.gre?.quantitative || '',
        analytical: cleanProfile.test_scores.gre?.analytical || ''
      }
    };
  }
  
  // Check and fix study_preferences if it exists
  if (cleanProfile.study_preferences) {
    // If study_preferences is a string, try to parse it
    if (typeof cleanProfile.study_preferences === 'string') {
      try {
        cleanProfile.study_preferences = JSON.parse(cleanProfile.study_preferences);
      } catch (e) {
        console.warn('Could not parse study_preferences as JSON:', e);
        // Default to an empty object if parsing fails
        cleanProfile.study_preferences = {
          countries: [],
          max_tuition: '',
          program_type: [],
          start_date: ''
        };
      }
    }
    
    // Ensure proper structure
    cleanProfile.study_preferences = {
      countries: Array.isArray(cleanProfile.study_preferences.countries) ? 
        cleanProfile.study_preferences.countries : [],
      max_tuition: cleanProfile.study_preferences.max_tuition || '',
      program_type: Array.isArray(cleanProfile.study_preferences.program_type) ? 
        cleanProfile.study_preferences.program_type : [],
      start_date: cleanProfile.study_preferences.start_date || ''
    };
  }
  
  return cleanProfile;
};

// Password reset functionality
export const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
  try {
    if (!email?.trim()) {
      throw new Error('Email is required');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { 
      error: error instanceof Error ? error : new Error('Unknown error during password reset')
    };
  }
};

// Update password
export const updatePassword = async (newPassword: string): Promise<{ error: Error | null }> => {
  try {
    if (!newPassword?.trim()) {
      throw new Error('New password is required');
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword.trim()
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error updating password:', error);
    return { 
      error: error instanceof Error ? error : new Error('Unknown error during password update')
    };
  }
};

// Get current session
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session, error: null };
  } catch (error) {
    console.error('Error getting current session:', error);
    return { 
      session: null, 
      error: error instanceof Error ? error : new Error('Unknown error getting session')
    };
  }
};