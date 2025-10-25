import { supabase } from '../../supabase';
import type { Database } from '../../database.types';

type Institution = Database['public']['Tables']['universities']['Row'];
type InstitutionInsert = Database['public']['Tables']['universities']['Insert'];
type InstitutionUpdate = Database['public']['Tables']['universities']['Update'];

export interface InstitutionWithDetails extends Institution {
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
    program_url?: string;
    application_deadlines?: any;
    intake_periods?: string[];
    min_gpa?: number;
    language_requirements?: any;
    required_documents?: string[];
  }>;
  testimonials?: Array<{
    id: string;
    student_name: string;
    graduation_year: number | null;
    degree_obtained: string | null;
    current_position: string | null;
    current_company: string | null;
    testimonial_text: string;
    rating: number | null;
    would_recommend: boolean | null;
    tags: string[];
    featured: boolean;
    submitted_at: string;
  }>;
}

/**
 * Get institution by ID with full details including city, country, programs, and testimonials
 */
export async function getInstitutionById(id: string): Promise<InstitutionWithDetails | null> {
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
          tuition_fee,
          program_url,
          application_deadlines,
          intake_periods,
          min_gpa,
          language_requirements,
          required_documents
        ),
        testimonials:alumni_testimonials(
          id,
          student_name,
          graduation_year,
          degree_obtained,
          current_position,
          current_company,
          testimonial_text,
          rating,
          would_recommend,
          tags,
          featured,
          submitted_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching institution with details:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getInstitutionById:', error);
    throw error;
  }
}

/**
 * Get all programs for a specific institution
 */
export async function getInstitutionPrograms(institutionId: string): Promise<Array<{
  id: string;
  name: string;
  degree_type: string;
  tuition_fee: number;
  program_url?: string;
  application_deadlines?: any;
  intake_periods?: string[];
  min_gpa?: number;
  language_requirements?: any;
  required_documents?: string[];
}>> {
  try {
    const { data, error } = await supabase
      .from('programs')
      .select(`
        id,
        name,
        degree_type,
        tuition_fee,
        program_url,
        application_deadlines,
        intake_periods,
        min_gpa,
        language_requirements,
        required_documents
      `)
      .eq('university_id', institutionId)
      .order('name');

    if (error) {
      console.error('Error fetching institution programs:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getInstitutionPrograms:', error);
    throw error;
  }
}

/**
 * Get approved testimonials for a specific institution
 */
export async function getInstitutionTestimonials(
  institutionId: string,
  limit?: number
): Promise<Array<{
  id: string;
  student_name: string;
  graduation_year: number | null;
  degree_obtained: string | null;
  current_position: string | null;
  current_company: string | null;
  testimonial_text: string;
  rating: number | null;
  would_recommend: boolean | null;
  tags: string[];
  featured: boolean;
  submitted_at: string;
}>> {
  try {
    let query = supabase
      .from('alumni_testimonials')
      .select(`
        id,
        student_name,
        graduation_year,
        degree_obtained,
        current_position,
        current_company,
        testimonial_text,
        rating,
        would_recommend,
        tags,
        featured,
        submitted_at
      `)
      .eq('university_id', institutionId)
      .eq('status', 'approved')
      .order('featured', { ascending: false })
      .order('submitted_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching institution testimonials:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getInstitutionTestimonials:', error);
    throw error;
  }
}

/**
 * Search institutions by name, country, or city
 */
export async function searchInstitutions(filters: {
  query?: string;
  countryCode?: string;
  cityId?: string;
  limit?: number;
}): Promise<Institution[]> {
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
      console.error('Error searching institutions:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchInstitutions:', error);
    throw error;
  }
}

/**
 * Get top institutions by world ranking
 */
export async function getTopInstitutions(
  countryCode?: string,
  limit: number = 20
): Promise<Institution[]> {
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
      console.error('Error fetching top institutions:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTopInstitutions:', error);
    throw error;
  }
}

/**
 * Get institutions by city
 */
export async function getInstitutionsByCity(cityId: string): Promise<Institution[]> {
  try {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .eq('city_id', cityId)
      .order('ranking_world', { ascending: true, nullsLast: true });

    if (error) {
      console.error('Error fetching institutions by city:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getInstitutionsByCity:', error);
    throw error;
  }
}

/**
 * Get institutions by country
 */
export async function getInstitutionsByCountry(countryCode: string): Promise<Institution[]> {
  try {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .eq('country_code', countryCode)
      .order('ranking_world', { ascending: true, nullsLast: true });

    if (error) {
      console.error('Error fetching institutions by country:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getInstitutionsByCountry:', error);
    throw error;
  }
}


