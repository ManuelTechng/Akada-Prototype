import { useRef, useCallback } from 'react';
import type { UserProfile } from '../lib/types';
import { getUserProfile } from '../lib/auth';

export const useProfileFetcher = () => {
  const isFetchingRef = useRef(false);

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (isFetchingRef.current) {
      console.debug('Profile fetch already in progress, skipping...');
      return null;
    }

    isFetchingRef.current = true;
    try {
      console.log('Fetching user profile', { userId });
      const profile = await getUserProfile(userId);
      
      if (!profile) {
        console.warn('No profile found for user', { userId });
      } else {
        console.debug('Profile fetched successfully', { userId });
      }
      
      return profile;
    } catch (error) {
      console.error('Failed to fetch user profile', { userId, error });
      return null;
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  return fetchProfile;
};