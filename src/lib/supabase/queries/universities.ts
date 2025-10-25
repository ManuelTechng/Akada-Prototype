import { supabase } from '../../supabase';
import type { Database } from '../../database.types';

type University = Database['public']['Tables']['universities']['Row'];
type UniversityInsert = Database['public']['Tables']['universities']['Insert'];
type UniversityUpdate = Database['public']['Tables']['universities']['Update'];

export interface UniversityWithDetails extends University {
  city?: {
    id: string;
    name: string;
    country_code: string | null;
    tier: string | null;
    accommodation_min: number | null;
    accommodation_max: number | null;
    food_monthly: number | null;
    transport_monthly: number | null;
    utilities_monthly: number | null;
    entertainment_monthly: number | null;
    currency_code: string;
    student_friendly_rating: number | null;
  } | null;
  country?: {
    id: string;
    country_code: string;
    name: string;
    currency_code: string | null;
    currency_symbol: string | null;
    visa_fee_usd: number | null;
    visa_processing_days: number | null;
    work_permit_hours_weekly: number | null;
    post_study_work_duration: string | null;
    avg_living_cost_monthly_usd: number | null;
  } | null;
  programs?: Array<{
    id: string;
    name: string;
    degree_type: string;
    tuition_fee: number;
  }>;
}

/**
 * Get university with full details including city, country, and programs
 */
export async function getUniversityWithDetails(id: string): Promise<UniversityWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from('universities')
      .select(`
        *,
        city:cities(
          id,
          name,
          country_code,
          tier,
          accommodation_min,
          accommodation_max,
          food_monthly,
          transport_monthly,
          utilities_monthly,
          entertainment_monthly,
          currency_code,
          student_friendly_rating
        ),
        country:countries(
          id,
          country_code,
          name,
          currency_code,
          currency_symbol,
          visa_fee_usd,
          visa_processing_days,
          work_permit_hours_weekly,
          post_study_work_duration,
          avg_living_cost_monthly_usd
        ),
        programs(
          id,
          name,
          degree_type,
          tuition_fee
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching university with details:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getUniversityWithDetails:', error);
    throw error;
  }
}

/**
 * Search universities by name, country, or city
 */
export async function searchUniversities(filters: {
  query?: string;
  countryCode?: string;
  cityId?: string;
  limit?: number;
}): Promise<University[]> {
  try {
    let query = supabase
      .from('universities')
      .select('*')
      .order('ranking_world', { ascending: true, nullsLast: true });

    // Apply text search filter
    if (filters.query) {
      query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
    }

    // Apply country filter
    if (filters.countryCode) {
      query = query.eq('country_code', filters.countryCode);
    }

    // Apply city filter
    if (filters.cityId) {
      query = query.eq('city_id', filters.cityId);
    }

    // Apply limit
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error searching universities:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchUniversities:', error);
    throw error;
  }
}

/**
 * Get top universities by world ranking
 */
export async function getTopUniversities(
  countryCode?: string,
  limit: number = 20
): Promise<University[]> {
  try {
    let query = supabase
      .from('universities')
      .select('*')
      .not('ranking_world', 'is', null)
      .order('ranking_world', { ascending: true })
      .limit(limit);

    if (countryCode) {
      query = query.eq('country_code', countryCode);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching top universities:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTopUniversities:', error);
    throw error;
  }
}

/**
 * Get universities by city
 */
export async function getUniversitiesByCity(cityId: string): Promise<University[]> {
  try {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .eq('city_id', cityId)
      .order('ranking_world', { ascending: true, nullsLast: true });

    if (error) {
      console.error('Error fetching universities by city:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUniversitiesByCity:', error);
    throw error;
  }
}

/**
 * Get universities by country
 */
export async function getUniversitiesByCountry(countryCode: string): Promise<University[]> {
  try {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .eq('country_code', countryCode)
      .order('ranking_world', { ascending: true, nullsLast: true });

    if (error) {
      console.error('Error fetching universities by country:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUniversitiesByCountry:', error);
    throw error;
  }
}

/**
 * Create a new university
 */
export async function createUniversity(university: UniversityInsert): Promise<University> {
  try {
    const { data, error } = await supabase
      .from('universities')
      .insert(university)
      .select()
      .single();

    if (error) {
      console.error('Error creating university:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createUniversity:', error);
    throw error;
  }
}

/**
 * Update university
 */
export async function updateUniversity(id: string, updates: UniversityUpdate): Promise<University> {
  try {
    const { data, error } = await supabase
      .from('universities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating university:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUniversity:', error);
    throw error;
  }
}

/**
 * Delete university
 */
export async function deleteUniversity(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('universities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting university:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteUniversity:', error);
    throw error;
  }
}


