import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface Program {
  id: string;
  name: string;
  university: string;
  country: string;
  study_level: string;
  field_of_study: string;
  duration: string;
  tuition_fee: number;
  currency: string;
  application_deadline: string;
  description: string;
  requirements: string;
  created_at: string;
  updated_at: string;
}

interface UseProgramMatchingReturn {
  matchedPrograms: Program[];
  isLoading: boolean;
  error: string | null;
  findMatchesForUser: (userId: string) => Promise<void>;
}

export const useProgramMatching = (): UseProgramMatchingReturn => {
  const [matchedPrograms, setMatchedPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findMatchesForUser = useCallback(async (userId: string) => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get user preferences
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('countries, specializations, study_level')
        .eq('user_id', userId)
        .single();

      if (prefError && prefError.code !== 'PGRST116') {
        console.error('Error fetching user preferences:', prefError);
        setError('Failed to load user preferences');
        return;
      }

      // Build query based on preferences
      let query = supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters if preferences exist
      if (preferences) {
        if (preferences.countries && preferences.countries.length > 0) {
          query = query.in('country', preferences.countries);
        }
        
        if (preferences.study_level) {
          query = query.eq('study_level', preferences.study_level);
        }
        
        if (preferences.specializations && preferences.specializations.length > 0) {
          query = query.in('field_of_study', preferences.specializations);
        }
      }

      const { data: programs, error: programsError } = await query.limit(20);

      if (programsError) {
        console.error('Error fetching programs:', programsError);
        setError('Failed to load recommended programs');
        return;
      }

      setMatchedPrograms(programs || []);
    } catch (err) {
      console.error('Error in program matching:', err);
      setError('Failed to find matching programs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    matchedPrograms,
    isLoading,
    error,
    findMatchesForUser
  };
};