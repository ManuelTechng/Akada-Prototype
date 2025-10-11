import type { UserProfile, SignUpData, AuthResponse } from './types';
import { supabase } from './supabase';

// Constants for authentication configuration
const AUTH_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

// Test Supabase connection
const testConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    console.log('Connection test result:', { data, error: error?.message });
    return !error;
  } catch (err) {
    console.error('Supabase connection test failed:', err);
    return false;
  }
};

// Helper function to get user profile with timeout and retry
export const getUserProfile = async (userId: string, retryCount = 0): Promise<UserProfile | null> => {
  try {
    console.log('Getting profile for user:', { userId, attempt: retryCount + 1 });

    // Test connection first on initial attempt
    if (retryCount === 0) {
      console.log('Testing Supabase connection...');
      const connectionOk = await testConnection();
      if (!connectionOk) {
        throw new Error('Supabase connection failed');
      }
      console.log('Supabase connection test passed');
    }

    // Create timeout promise - reduced timeout for faster failure
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Profile query timeout')), 3000)
    );

    // First try to get existing profile with timeout
    console.log('Executing profile query...');
    const queryPromise = supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('Starting Promise.race for profile query...');
    let data, error;
    try {
      const result = await Promise.race([queryPromise, timeoutPromise]);
      data = result.data;
      error = result.error;
      console.log('Profile query completed:', { hasData: !!data, error: error?.message });
      
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
    } catch (queryError) {
      console.error('Profile query failed:', queryError);
      // Continue with null data - let the app create a new profile
      data = null;
      error = queryError;
    }

    // If profile exists, parse JSON fields and return it
    if (data) {
      console.log('Found existing profile:', { userId });
      
      // Safely parse JSON fields - they might already be objects
      const parseJsonField = (field: any) => {
        if (!field) return null;
        if (typeof field === 'object') return field;
        if (typeof field === 'string') {
          try {
            return JSON.parse(field);
          } catch (e) {
            console.warn('Failed to parse JSON field:', field);
            return null;
          }
        }
        return field;
      };
      
      return {
        ...data,
        test_scores: parseJsonField(data.test_scores),
        study_preferences: parseJsonField(data.study_preferences)
      };
    }
    
    // If error is anything other than "not found", throw it
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', { error });
      throw error;
    }
    
    // No profile found, we need to create one from the user's metadata
    console.log('No profile found, creating new profile from user metadata');
    
    // Get user data from auth
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      console.error('Error getting user data for profile creation:', { error: userError });
      throw new Error('Could not retrieve user information');
    }
    
    // Create a basic profile using auth metadata
    const newProfile = {
      id: userId,
      email: userData.user.email || '',
      full_name: userData.user.user_metadata?.full_name || userData.user.email?.split('@')[0] || 'User',
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
      profile_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert the new profile into the database
    console.log('Creating new profile with data:', { profile: newProfile });
    
    const { data: insertedData, error: insertError } = await supabase
      .from('user_profiles')
      .insert([newProfile])
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating initial profile:', { error: insertError });
      throw insertError;
    }
    
    console.log('Initial profile created successfully:', { userId });
    return insertedData || newProfile;
    
  } catch (error) {
    console.error('Error getting/creating user profile:', { error, attempt: retryCount + 1 });
    
    // Retry logic for network/timeout errors
    if (retryCount < MAX_RETRIES && 
        (error instanceof Error && 
         (error.message.includes('timeout') || 
          error.message.includes('network') ||
          error.message.includes('fetch')))) {
      
      console.log(`Retrying profile fetch in ${(retryCount + 1) * 1000}ms...`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
      return getUserProfile(userId, retryCount + 1);
    }
    
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
export const updateUserProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    console.log('Updating user profile', { userId, profileData });

    // Fetch existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching existing profile', { error: fetchError });
      throw new Error('Failed to fetch existing profile');
    }

    // Sanitize and validate input data
    const sanitizedData = sanitizeProfileData(profileData);
    validateProfileData(sanitizedData);

    // Prepare the data for update/insert
    const formattedProfile = {
      ...sanitizedData,
      test_scores: sanitizedData.test_scores ? JSON.stringify(sanitizedData.test_scores) : null,
      study_preferences: sanitizedData.study_preferences ? JSON.stringify(sanitizedData.study_preferences) : null,
      updated_at: new Date().toISOString()
    };

    let result;
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update(formattedProfile)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile', { error });
        throw new Error('Failed to update profile');
      }
      result = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          ...formattedProfile,
          id: userId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile', { error });
        throw new Error('Failed to create profile');
      }
      result = data;
    }

    // Parse JSON strings back to objects
    if (result) {
      result.test_scores = result.test_scores ? JSON.parse(result.test_scores) : null;
      result.study_preferences = result.study_preferences ? JSON.parse(result.study_preferences) : null;
    }

    return result;
  } catch (error) {
    console.error('Error in updateUserProfile', { error });
    throw error;
  }
};

// Helper function to sanitize profile data and ensure proper JSON structure
const sanitizeProfileData = (profile: Partial<UserProfile>): Partial<UserProfile> => {
  // Create a new object with default values
  const cleanProfile: Partial<UserProfile> = {
    full_name: profile.full_name || '',
    email: profile.email || '',
    education_level: profile.education_level || '',
    current_university: profile.current_university || '',
    field_of_study: profile.field_of_study || '',
    gpa: profile.gpa || undefined,
    phone_number: profile.phone_number || '',
    address_line1: profile.address_line1 || '',
    address_line2: profile.address_line2 || '',
    city: profile.city || '',
    state_province: profile.state_province || '',
    postal_code: profile.postal_code || '',
    country: profile.country || '',
    date_of_birth: profile.date_of_birth || '',
    bio: profile.bio || '',
    test_scores: {
      ielts: profile.test_scores?.ielts || '',
      toefl: profile.test_scores?.toefl || '',
      gre: {
        verbal: profile.test_scores?.gre?.verbal || '',
        quantitative: profile.test_scores?.gre?.quantitative || '',
        analytical: profile.test_scores?.gre?.analytical || ''
      }
    },
    study_preferences: {
      countries: profile.study_preferences?.countries || [],
      max_tuition: profile.study_preferences?.max_tuition || '',
      program_type: profile.study_preferences?.program_type || [],
      start_date: profile.study_preferences?.start_date || ''
    }
  };

  // Remove any undefined or null values
  Object.keys(cleanProfile).forEach((key: string) => {
    const typedKey = key as keyof UserProfile;
    if (cleanProfile[typedKey] === undefined || cleanProfile[typedKey] === null) {
      delete cleanProfile[typedKey];
    }
  });

  return cleanProfile;
};

// Helper function to validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate phone number format
const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
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

// Validation function
const validateProfileData = (data: Partial<UserProfile>) => {
  if (data.email && !isValidEmail(data.email)) {
    throw new Error('Invalid email format');
  }

  if (data.phone_number && !isValidPhoneNumber(data.phone_number)) {
    throw new Error('Invalid phone number format');
  }

  if (data.gpa && (isNaN(Number(data.gpa)) || Number(data.gpa) < 0 || Number(data.gpa) > 4.0)) {
    throw new Error('GPA must be a number between 0 and 4.0');
  }
};