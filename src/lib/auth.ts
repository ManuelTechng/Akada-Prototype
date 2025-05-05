import { supabase } from './supabase';
import type { UserProfile, SignUpData, AuthResponse } from './types';

// Constants for authentication configuration
const AUTH_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

// Helper function to get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
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
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profile)
      .eq('id', userId)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
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