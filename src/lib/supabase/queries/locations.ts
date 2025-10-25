import { supabase } from '../../supabase';
import type { Database } from '../../database.types';

type Country = Database['public']['Tables']['countries']['Row'];
type City = Database['public']['Tables']['cities']['Row'];
type CountryInsert = Database['public']['Tables']['countries']['Insert'];
type CityInsert = Database['public']['Tables']['cities']['Insert'];

/**
 * Get country information by country code
 */
export async function getCountryInfo(countryCode: string): Promise<Country | null> {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('country_code', countryCode)
      .single();

    if (error) {
      console.error('Error fetching country info:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getCountryInfo:', error);
    throw error;
  }
}

/**
 * Get all origin countries (African countries)
 */
export async function getOriginCountries(): Promise<Country[]> {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('is_origin_country', true)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching origin countries:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getOriginCountries:', error);
    throw error;
  }
}

/**
 * Get all destination countries (study destinations)
 */
export async function getDestinationCountries(): Promise<Country[]> {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('is_origin_country', false)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching destination countries:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getDestinationCountries:', error);
    throw error;
  }
}

/**
 * Get city information by city ID
 */
export async function getCityInfo(cityId: string): Promise<City | null> {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('id', cityId)
      .single();

    if (error) {
      console.error('Error fetching city info:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getCityInfo:', error);
    throw error;
  }
}

/**
 * Get cities by country code
 */
export async function getCitiesByCountry(countryCode: string): Promise<City[]> {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('country_code', countryCode)
      .order('name');

    if (error) {
      console.error('Error fetching cities by country:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCitiesByCountry:', error);
    throw error;
  }
}

/**
 * Get major cities (tier = 'major') by country
 */
export async function getMajorCitiesByCountry(countryCode: string): Promise<City[]> {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('country_code', countryCode)
      .eq('tier', 'major')
      .order('name');

    if (error) {
      console.error('Error fetching major cities by country:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMajorCitiesByCountry:', error);
    throw error;
  }
}

/**
 * Search cities by name or country
 */
export async function searchCities(filters: {
  query?: string;
  countryCode?: string;
  tier?: string;
  limit?: number;
}): Promise<City[]> {
  try {
    let query = supabase
      .from('cities')
      .select('*')
      .order('name');

    // Apply text search filter
    if (filters.query) {
      query = query.ilike('name', `%${filters.query}%`);
    }

    // Apply country filter
    if (filters.countryCode) {
      query = query.eq('country_code', filters.countryCode);
    }

    // Apply tier filter
    if (filters.tier) {
      query = query.eq('tier', filters.tier);
    }

    // Apply limit
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error searching cities:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchCities:', error);
    throw error;
  }
}

/**
 * Get cities with living cost information for cost calculator
 */
export async function getCitiesWithCosts(countryCode: string): Promise<City[]> {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('country_code', countryCode)
      .not('accommodation_min', 'is', null)
      .order('student_friendly_rating', { ascending: false, nullsLast: true });

    if (error) {
      console.error('Error fetching cities with costs:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCitiesWithCosts:', error);
    throw error;
  }
}

/**
 * Get country with visa and cost information for cost calculator
 */
export async function getCountryWithVisaInfo(countryCode: string): Promise<Country | null> {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('country_code', countryCode)
      .single();

    if (error) {
      console.error('Error fetching country with visa info:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getCountryWithVisaInfo:', error);
    throw error;
  }
}

/**
 * Create a new country
 */
export async function createCountry(country: CountryInsert): Promise<Country> {
  try {
    const { data, error } = await supabase
      .from('countries')
      .insert(country)
      .select()
      .single();

    if (error) {
      console.error('Error creating country:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createCountry:', error);
    throw error;
  }
}

/**
 * Create a new city
 */
export async function createCity(city: CityInsert): Promise<City> {
  try {
    const { data, error } = await supabase
      .from('cities')
      .insert(city)
      .select()
      .single();

    if (error) {
      console.error('Error creating city:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createCity:', error);
    throw error;
  }
}

/**
 * Update country
 */
export async function updateCountry(countryCode: string, updates: Partial<Country>): Promise<Country> {
  try {
    const { data, error } = await supabase
      .from('countries')
      .update(updates)
      .eq('country_code', countryCode)
      .select()
      .single();

    if (error) {
      console.error('Error updating country:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateCountry:', error);
    throw error;
  }
}

/**
 * Update city
 */
export async function updateCity(cityId: string, updates: Partial<City>): Promise<City> {
  try {
    const { data, error } = await supabase
      .from('cities')
      .update(updates)
      .eq('id', cityId)
      .select()
      .single();

    if (error) {
      console.error('Error updating city:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateCity:', error);
    throw error;
  }
}


