import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Program } from '../lib/types';

/**
 * Hook to fetch available countries for filtering
 */
export function useCountries() {
  return useQuery({
    queryKey: ['filter-countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return (data || []).map(c => ({
        code: c.country_code,
        name: c.name
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - countries don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
}

/**
 * Hook to fetch available degree types
 */
export function useDegreeTypes() {
  return useQuery({
    queryKey: ['filter-degree-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('degree_type')
        .not('degree_type', 'is', null);

      if (error) throw error;

      const uniqueDegrees = [...new Set(
        (data || [])
          .map(p => p.degree_type)
          .filter((d): d is string => Boolean(d))
      )].sort();

      return uniqueDegrees;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch available institution types
 */
export function useInstitutionTypes() {
  return useQuery({
    queryKey: ['filter-institution-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('institution_type')
        .not('institution_type', 'is', null);

      if (error) throw error;

      const uniqueTypes = [...new Set(
        (data || [])
          .map(u => u.institution_type)
          .filter((t): t is string => Boolean(t))
      )].sort();

      return uniqueTypes;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch available fields/specializations
 */
export function useFields() {
  return useQuery({
    queryKey: ['filter-fields'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('name');

      if (error) throw error;

      // Extract field names from program names
      const extractedFields = (data || [])
        .map(p => {
          const name = p.name || '';
          const cleaned = name.replace(
            /^(BSc|MSc|MA|MBA|PhD|Master|Bachelor|Doctor)\s+(of\s+)?(Science\s+in\s+|Arts\s+in\s+)?/i,
            ''
          ).trim();
          return cleaned;
        })
        .filter(Boolean);

      const uniqueFields = [...new Set(extractedFields)].sort();
      return uniqueFields.slice(0, 20); // Limit to top 20
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export interface ProgramSearchFilters {
  searchQuery?: string;
  country?: string;
  degreeType?: string;
  maxTuition?: string;
  field?: string;
  institutionType?: string;
  scholarshipsOnly?: boolean;
  sortBy?: 'match' | 'tuition-low' | 'tuition-high' | 'deadline';
}

/**
 * Hook to search programs with filters
 */
export function useProgramSearch(filters: ProgramSearchFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: ['programs-search', filters],
    queryFn: async () => {
      console.log('⏳ Starting search with filters:', filters);

      // Start with optimized query - only fetch needed fields
      let query = supabase
        .from('programs')
        .select(
          filters.institutionType
            ? 'id, name, university, university_id, country, location, tuition_fee, degree_type, created_at, scholarship_available, has_scholarships, specialization, application_deadline, deadline, description, website, duration, application_fee, requirements, city, university_website, program_website, entry_requirements, language_requirements, study_level, tuition_fee_currency, tuition_fee_original, application_fee_currency, universities!inner(institution_type)'
            : 'id, name, university, university_id, country, location, tuition_fee, degree_type, created_at, scholarship_available, has_scholarships, specialization, application_deadline, deadline, description, website, duration, application_fee, requirements, city, university_website, program_website, entry_requirements, language_requirements, study_level, tuition_fee_currency, tuition_fee_original, application_fee_currency'
        )
        .limit(50); // Limit results to prevent timeout

      // Apply filters one by one
      if (filters.searchQuery?.trim()) {
        // Use ilike for case-insensitive search
        query = query.or(
          `name.ilike.%${filters.searchQuery}%,university.ilike.%${filters.searchQuery}%,country.ilike.%${filters.searchQuery}%`
        );
      }

      if (filters.country) {
        query = query.eq('country', filters.country);
      }

      if (filters.degreeType) {
        query = query.eq('degree_type', filters.degreeType);
      }

      if (filters.maxTuition && filters.maxTuition !== 'any') {
        const maxTuition = parseInt(filters.maxTuition);
        // Convert USD to NGN (1 USD = 1500 NGN approximation)
        const maxTuitionNGN = maxTuition * 1500;
        query = query.lte('tuition_fee', maxTuitionNGN);
      }

      if (filters.field) {
        query = query.or(
          `specialization.ilike.%${filters.field}%,name.ilike.%${filters.field}%`
        );
      }

      if (filters.institutionType) {
        query = query.eq('universities.institution_type', filters.institutionType);
      }

      if (filters.scholarshipsOnly) {
        // Check both possible scholarship fields
        query = query.or('scholarship_available.eq.true,has_scholarships.eq.true');
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'tuition-low':
        case 'tuition-high':
          // Sort client-side after currency conversion
          query = query.order('created_at', { ascending: false });
          break;
        case 'deadline':
          query = query.order('application_deadline', {
            ascending: true,
            nullsFirst: false,
          });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Search error:', error);
        throw error;
      }

      console.log(`✅ Found ${data?.length || 0} programs`);
      return (data || []) as any as Program[];
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes - search results can change frequently
    gcTime: 5 * 60 * 1000,
    retry: 3, // Retry failed searches
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
