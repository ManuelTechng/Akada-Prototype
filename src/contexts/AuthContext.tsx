import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../lib/types';
import { getUserProfile, updateUserProfile } from '../lib/auth';
import { useProfileFetcher } from '../hooks/useProfileFetcher';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  error: null,
  initialized: false,
  isAuthenticated: false,
  signOut: async () => {},
  refreshProfile: async () => {},
  updateProfile: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [initAttempts, setInitAttempts] = useState(0);
  const MAX_INIT_ATTEMPTS = 3;

  const fetchProfile = useProfileFetcher();

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      console.log('AuthContext: Refreshing profile for user', user.id);
      const profile = await fetchProfile(user.id);
      console.log('AuthContext: Profile refresh result', profile ? 'success' : 'null');
      if (profile) setProfile(profile);
    } catch (err) {
      console.error('AuthContext: Error refreshing profile:', err);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      console.log('AuthContext: Updating profile for user', user.id, 'with updates', updates);
      await updateUserProfile(user.id, updates);
      await refreshProfile(); // Refresh the profile after updating
    } catch (err) {
      console.error('AuthContext: Error updating profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
    }
  };

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      console.log('AuthContext: Initializing auth, attempt', initAttempts + 1);
      try {
        // Get initial session
        console.log('AuthContext: Getting session from Supabase');
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('AuthContext: Session error:', sessionError);
          if (initAttempts < MAX_INIT_ATTEMPTS) {
            setInitAttempts(prev => prev + 1);
            console.log(`AuthContext: Retrying in 2 seconds (attempt ${initAttempts + 1}/${MAX_INIT_ATTEMPTS})`);
            initTimeout = setTimeout(initializeAuth, 2000);
          } else {
            console.error('AuthContext: Max init attempts reached');
          }
          throw sessionError;
        }
        
        console.log('AuthContext: Session result:', initialSession ? 'has session' : 'no session');
        if (mounted) setSession(initialSession);
        
        if (initialSession?.user && mounted) {
          console.log('AuthContext: Got user from session', initialSession.user.id);
          setUser(initialSession.user);
          
          try {
            console.log('AuthContext: Fetching user profile');
            const profile = await fetchProfile(initialSession.user.id);
            console.log('AuthContext: Profile result', profile ? 'success' : 'null');
            if (profile && mounted) setProfile(profile);
          } catch (profileError) {
            console.error('AuthContext: Error fetching user profile:', profileError);
          }
        } else {
          console.log('AuthContext: No user in session');
        }
      } catch (err) {
        console.error('AuthContext: Error initializing auth:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize auth'));
        }
      } finally {
        if (mounted) {
          console.log('AuthContext: Auth initialization complete');
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    console.log('AuthContext: Setting up auth state change listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        console.log('AuthContext: Auth state changed:', event);
        if (mounted) setSession(newSession);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession?.user) {
            console.log('AuthContext: User signed in or token refreshed', newSession.user.id);
            setUser(newSession.user);
            try {
              console.log('AuthContext: Fetching profile after sign in');
              const profile = await fetchProfile(newSession.user.id);
              console.log('AuthContext: Profile fetch result', profile ? 'success' : 'null');
              if (profile && mounted) setProfile(profile);
            } catch (profileError) {
              console.error('AuthContext: Error fetching user profile after sign in:', profileError);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthContext: User signed out');
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
        }
        
        if (mounted) {
          console.log('AuthContext: Setting loading to false after auth state change');
          setLoading(false);
        }
      }
    );

    return () => {
      console.log('AuthContext: Cleaning up auth context');
      mounted = false;
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, [initAttempts]);

  const handleSignOut = async () => {
    try {
      console.log('AuthContext: Signing out user');
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthContext: Error signing out:', error);
        throw error;
      }
      console.log('AuthContext: Sign out successful');
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (err) {
      console.error('AuthContext: Error signing out:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign out'));
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    error,
    initialized,
    isAuthenticated: !!user,
    signOut: handleSignOut,
    refreshProfile,
    updateProfile
  };

  console.log('AuthContext: Rendering with state:', { 
    hasUser: !!user, 
    loading, 
    initialized, 
    hasError: !!error,
    isAuthenticated: !!user
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};