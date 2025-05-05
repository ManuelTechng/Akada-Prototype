import { useRef, useCallback } from 'react';
import type { UserProfile } from '../lib/types';
import { getUserProfile } from '../lib/auth';
import { useLogger } from './useLogger';
import { useErrorHandler } from './useErrorHandler';

export const useProfileFetcher = () => {
  const isFetchingRef = useRef(false);
  const logger = useLogger();
  const { handleError } = useErrorHandler();

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (isFetchingRef.current) {
      logger.debug('Profile fetch already in progress, skipping...');
      return null;
    }

    isFetchingRef.current = true;
    try {
      logger.info('Fetching user profile', { userId });
      const profile = await getUserProfile(userId);
      
      if (!profile) {
        logger.warn('No profile found for user', { userId });
      } else {
        logger.debug('Profile fetched successfully', { userId });
      }
      
      return profile;
    } catch (error) {
      logger.error('Failed to fetch user profile', { userId, error });
      handleError(error);
      return null;
    } finally {
      isFetchingRef.current = false;
    }
  }, [logger, handleError]);

  return fetchProfile;
};