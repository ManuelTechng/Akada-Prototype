import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Program } from '../lib/types';
import { useLogger } from './useLogger';
import { useErrorHandler } from './useErrorHandler';

export interface SavedProgram {
  id: string;
  user_id: string;
  program_id: string;
  saved_at: string;
  program?: Program;
}

export const useSavedPrograms = (userId?: string) => {
  const [savedPrograms, setSavedPrograms] = useState<SavedProgram[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logger = useLogger();
  const { handleError } = useErrorHandler();

  const fetchSavedPrograms = useCallback(async () => {
    if (!userId) {
      setSavedPrograms([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      logger.info('Fetching saved programs for user', { userId });

      const { data, error: fetchError } = await supabase
        .from('saved_programs')
        .select(`
          *,
          program:programs(*)
        `)
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      logger.info('Saved programs fetched successfully', { 
        userId, 
        count: data?.length || 0 
      });

      setSavedPrograms(data || []);
    } catch (error) {
      logger.error('Error fetching saved programs', { userId, error });
      setError('Failed to fetch saved programs');
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, logger, handleError]);

  const saveProgram = useCallback(async (programId: string) => {
    if (!userId) {
      logger.warn('No userId provided for saving program');
      return false;
    }

    try {
      logger.info('Saving program', { userId, programId });

      // Check if already saved
      const { data: existing } = await supabase
        .from('saved_programs')
        .select('id')
        .eq('user_id', userId)
        .eq('program_id', programId)
        .single();

      if (existing) {
        logger.info('Program already saved', { userId, programId });
        return true;
      }

      const { error: saveError } = await supabase
        .from('saved_programs')
        .insert({
          user_id: userId,
          program_id: programId,
          saved_at: new Date().toISOString()
        });

      if (saveError) {
        throw saveError;
      }

      logger.info('Program saved successfully', { userId, programId });
      await fetchSavedPrograms(); // Refresh the list
      return true;
    } catch (error) {
      logger.error('Error saving program', { userId, programId, error });
      handleError(error);
      return false;
    }
  }, [userId, logger, handleError, fetchSavedPrograms]);

  const unsaveProgram = useCallback(async (programId: string) => {
    if (!userId) {
      logger.warn('No userId provided for unsaving program');
      return false;
    }

    try {
      logger.info('Unsaving program', { userId, programId });

      const { error: deleteError } = await supabase
        .from('saved_programs')
        .delete()
        .eq('user_id', userId)
        .eq('program_id', programId);

      if (deleteError) {
        throw deleteError;
      }

      logger.info('Program unsaved successfully', { userId, programId });
      await fetchSavedPrograms(); // Refresh the list
      return true;
    } catch (error) {
      logger.error('Error unsaving program', { userId, programId, error });
      handleError(error);
      return false;
    }
  }, [userId, logger, handleError, fetchSavedPrograms]);

  const refreshSavedPrograms = useCallback(async () => {
    await fetchSavedPrograms();
  }, [fetchSavedPrograms]);

  // Fetch saved programs when userId changes
  useEffect(() => {
    fetchSavedPrograms();
  }, [fetchSavedPrograms]);

  return {
    savedPrograms,
    isLoading,
    error,
    saveProgram,
    unsaveProgram,
    refreshSavedPrograms
  };
};