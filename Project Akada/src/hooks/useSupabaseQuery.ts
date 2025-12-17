import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Type for Supabase query function that returns data
 */
type SupabaseQueryFn<TData> = () => Promise<{ data: TData | null; error: PostgrestError | null }>;

/**
 * Options for useSupabaseQuery hook
 */
export interface UseSupabaseQueryOptions<TData, TError = Error>
  extends Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryFn' | 'queryKey'> {
  queryKey: QueryKey;
  queryFn: SupabaseQueryFn<TData>;
}

/**
 * Custom hook that wraps React Query's useQuery with Supabase-specific error handling
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useSupabaseQuery({
 *   queryKey: ['programs', filters],
 *   queryFn: async () => {
 *     return supabase
 *       .from('programs')
 *       .select('*')
 *       .eq('status', 'active');
 *   },
 * });
 * ```
 */
export function useSupabaseQuery<TData = unknown>({
  queryKey,
  queryFn,
  ...options
}: UseSupabaseQueryOptions<TData>) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Execute the Supabase query
      const result = await queryFn();

      // Handle Supabase errors
      if (result.error) {
        const error = new Error(result.error.message);
        error.name = result.error.code || 'SupabaseError';

        // Log error in development
        if (import.meta.env.DEV) {
          console.error('[useSupabaseQuery] Error:', {
            queryKey,
            error: result.error,
            details: result.error.details,
            hint: result.error.hint,
          });
        }

        throw error;
      }

      // Handle null data (no results)
      if (result.data === null) {
        if (import.meta.env.DEV) {
          console.warn('[useSupabaseQuery] No data returned:', { queryKey });
        }
        return null as TData;
      }

      return result.data;
    },
    ...options,
  });
}

/**
 * Hook for querying programs from Supabase with React Query
 *
 * @example
 * ```tsx
 * const { data: programs, isLoading } = useProgramsQuery({
 *   filters: { country: 'Canada' },
 *   enabled: true,
 * });
 * ```
 */
export function useProgramsQuery(filters?: {
  country?: string;
  degreeType?: string;
  searchTerm?: string;
}) {
  return useSupabaseQuery({
    queryKey: ['programs', filters],
    queryFn: async () => {
      let query = supabase
        .from('programs')
        .select(`
          *,
          universities (
            id,
            name,
            location,
            logo_url
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.country) {
        query = query.eq('country', filters.country);
      }
      if (filters?.degreeType) {
        query = query.eq('degree_type', filters.degreeType);
      }
      if (filters?.searchTerm) {
        query = query.ilike('name', `%${filters.searchTerm}%`);
      }

      return query;
    },
    // Cache programs for 5 minutes
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for querying a single program by ID
 */
export function useProgramQuery(programId: string | undefined) {
  return useSupabaseQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      if (!programId) {
        return { data: null, error: null };
      }

      return supabase
        .from('programs')
        .select(`
          *,
          universities (
            id,
            name,
            location,
            website,
            logo_url,
            description
          )
        `)
        .eq('id', programId)
        .single();
    },
    enabled: !!programId,
    staleTime: 10 * 60 * 1000, // Cache individual programs longer
    gcTime: 15 * 60 * 1000,
  });
}

/**
 * Hook for querying saved programs for a user
 */
export function useSavedProgramsQuery(userId: string | undefined) {
  return useSupabaseQuery({
    queryKey: ['saved-programs', userId],
    queryFn: async () => {
      if (!userId) {
        return { data: null, error: null };
      }

      return supabase
        .from('saved_programs')
        .select(`
          *,
          programs (
            *,
            universities (
              id,
              name,
              logo_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // Refresh saved programs more frequently
  });
}

/**
 * Hook for querying user profile
 */
export function useUserProfileQuery(userId: string | undefined) {
  return useSupabaseQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) {
        return { data: null, error: null };
      }

      return supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });
}
