import { supabase } from '../../supabase';
import type { Database } from '../../database.types';

type Scholarship = Database['public']['Tables']['program_scholarships']['Row'];
type ScholarshipInsert = Database['public']['Tables']['program_scholarships']['Insert'];
type ScholarshipUpdate = Database['public']['Tables']['program_scholarships']['Update'];

export interface ScholarshipWithDetails extends Scholarship {
  program?: {
    id: string;
    name: string;
    degree_type: string;
    university: string;
  };
  university?: {
    id: string;
    name: string;
    country_code: string | null;
  };
}

/**
 * Get program-specific scholarships
 */
export async function getProgramScholarships(programId: string): Promise<ScholarshipWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('program_scholarships')
      .select(`
        *,
        program:programs(
          id,
          name,
          degree_type,
          university
        ),
        university:universities(
          id,
          name,
          country_code
        )
      `)
      .eq('program_id', programId)
      .eq('is_active', true)
      .order('scholarship_name');

    if (error) {
      console.error('Error fetching program scholarships:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProgramScholarships:', error);
    throw error;
  }
}

/**
 * Get university-wide scholarships
 */
export async function getInstitutionScholarships(institutionId: string): Promise<ScholarshipWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('program_scholarships')
      .select(`
        *,
        program:programs(
          id,
          name,
          degree_type,
          university
        ),
        university:universities(
          id,
          name,
          country_code
        )
      `)
      .eq('university_id', institutionId)
      .is('program_id', null) // University-wide scholarships don't have program_id
      .eq('is_active', true)
      .order('scholarship_name');

    if (error) {
      console.error('Error fetching institution scholarships:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getInstitutionScholarships:', error);
    throw error;
  }
}

/**
 * Get all scholarships for an institution (both program-specific and university-wide)
 */
export async function getAllInstitutionScholarships(institutionId: string): Promise<ScholarshipWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('program_scholarships')
      .select(`
        *,
        program:programs(
          id,
          name,
          degree_type,
          university
        ),
        university:universities(
          id,
          name,
          country_code
        )
      `)
      .eq('university_id', institutionId)
      .eq('is_active', true)
      .order('scholarship_name');

    if (error) {
      console.error('Error fetching all institution scholarships:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllInstitutionScholarships:', error);
    throw error;
  }
}

/**
 * Search scholarships by criteria
 */
export async function searchScholarships(filters: {
  query?: string;
  type?: string;
  minAmount?: number;
  maxAmount?: number;
  countryCode?: string;
  institutionId?: string;
  programId?: string;
  limit?: number;
}): Promise<ScholarshipWithDetails[]> {
  try {
    let query = supabase
      .from('program_scholarships')
      .select(`
        *,
        program:programs(
          id,
          name,
          degree_type,
          university
        ),
        university:universities(
          id,
          name,
          country_code
        )
      `)
      .eq('is_active', true)
      .order('scholarship_name');

    // Apply text search filter
    if (filters.query) {
      query = query.or(`scholarship_name.ilike.%${filters.query}%,eligibility_criteria.ilike.%${filters.query}%`);
    }

    // Apply type filter
    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    // Apply amount filters
    if (filters.minAmount) {
      query = query.gte('amount_min_usd', filters.minAmount);
    }
    if (filters.maxAmount) {
      query = query.lte('amount_max_usd', filters.maxAmount);
    }

    // Apply country filter (through university)
    if (filters.countryCode) {
      query = query.eq('university.country_code', filters.countryCode);
    }

    // Apply institution filter
    if (filters.institutionId) {
      query = query.eq('university_id', filters.institutionId);
    }

    // Apply program filter
    if (filters.programId) {
      query = query.eq('program_id', filters.programId);
    }

    // Apply limit
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error searching scholarships:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchScholarships:', error);
    throw error;
  }
}

/**
 * Get scholarships by type
 */
export async function getScholarshipsByType(
  type: string,
  institutionId?: string,
  limit?: number
): Promise<ScholarshipWithDetails[]> {
  try {
    let query = supabase
      .from('program_scholarships')
      .select(`
        *,
        program:programs(
          id,
          name,
          degree_type,
          university
        ),
        university:universities(
          id,
          name,
          country_code
        )
      `)
      .eq('type', type)
      .eq('is_active', true)
      .order('scholarship_name');

    // Filter by institution if provided
    if (institutionId) {
      query = query.eq('university_id', institutionId);
    }

    // Apply limit if provided
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching scholarships by type:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getScholarshipsByType:', error);
    throw error;
  }
}

/**
 * Get scholarships with upcoming deadlines
 */
export async function getScholarshipsWithDeadlines(
  daysAhead: number = 30,
  institutionId?: string,
  limit?: number
): Promise<ScholarshipWithDetails[]> {
  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    const futureDateString = futureDate.toISOString().split('T')[0];

    let query = supabase
      .from('program_scholarships')
      .select(`
        *,
        program:programs(
          id,
          name,
          degree_type,
          university
        ),
        university:universities(
          id,
          name,
          country_code
        )
      `)
      .eq('is_active', true)
      .not('application_deadline', 'is', null)
      .lte('application_deadline', futureDateString)
      .order('application_deadline', { ascending: true });

    // Filter by institution if provided
    if (institutionId) {
      query = query.eq('university_id', institutionId);
    }

    // Apply limit if provided
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching scholarships with deadlines:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getScholarshipsWithDeadlines:', error);
    throw error;
  }
}

/**
 * Get scholarships by country eligibility
 */
export async function getScholarshipsByCountry(
  countryCode: string,
  institutionId?: string,
  limit?: number
): Promise<ScholarshipWithDetails[]> {
  try {
    let query = supabase
      .from('program_scholarships')
      .select(`
        *,
        program:programs(
          id,
          name,
          degree_type,
          university
        ),
        university:universities(
          id,
          name,
          country_code
        )
      `)
      .eq('is_active', true)
      .or(`eligible_countries.is.null,eligible_countries.cs.{${countryCode}}`)
      .order('scholarship_name');

    // Filter by institution if provided
    if (institutionId) {
      query = query.eq('university_id', institutionId);
    }

    // Apply limit if provided
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching scholarships by country:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getScholarshipsByCountry:', error);
    throw error;
  }
}

/**
 * Create a new scholarship
 */
export async function createScholarship(scholarship: ScholarshipInsert): Promise<Scholarship> {
  try {
    const { data, error } = await supabase
      .from('program_scholarships')
      .insert(scholarship)
      .select()
      .single();

    if (error) {
      console.error('Error creating scholarship:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createScholarship:', error);
    throw error;
  }
}

/**
 * Update a scholarship
 */
export async function updateScholarship(
  scholarshipId: string,
  updates: ScholarshipUpdate
): Promise<Scholarship> {
  try {
    const { data, error } = await supabase
      .from('program_scholarships')
      .update(updates)
      .eq('id', scholarshipId)
      .select()
      .single();

    if (error) {
      console.error('Error updating scholarship:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateScholarship:', error);
    throw error;
  }
}

/**
 * Delete a scholarship
 */
export async function deleteScholarship(scholarshipId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('program_scholarships')
      .delete()
      .eq('id', scholarshipId);

    if (error) {
      console.error('Error deleting scholarship:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteScholarship:', error);
    throw error;
  }
}

/**
 * Get scholarship statistics for an institution
 */
export async function getScholarshipStats(institutionId: string): Promise<{
  total: number;
  programSpecific: number;
  universityWide: number;
  byType: Record<string, number>;
  totalValue: number;
}> {
  try {
    const { data, error } = await supabase
      .from('program_scholarships')
      .select('type, amount_min_usd, amount_max_usd, program_id')
      .eq('university_id', institutionId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching scholarship stats:', error);
      throw error;
    }

    const scholarships = data || [];
    
    const stats = {
      total: scholarships.length,
      programSpecific: scholarships.filter(s => s.program_id).length,
      universityWide: scholarships.filter(s => !s.program_id).length,
      byType: {} as Record<string, number>,
      totalValue: 0
    };

    // Count by type
    scholarships.forEach(scholarship => {
      stats.byType[scholarship.type] = (stats.byType[scholarship.type] || 0) + 1;
    });

    // Calculate total value (using max amount when available, min otherwise)
    scholarships.forEach(scholarship => {
      const amount = scholarship.amount_max_usd || scholarship.amount_min_usd || 0;
      stats.totalValue += amount;
    });

    return stats;
  } catch (error) {
    console.error('Error in getScholarshipStats:', error);
    throw error;
  }
}


