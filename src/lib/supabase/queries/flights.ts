import { supabase } from '../../supabase';
import type { Database } from '../../database.types';

type FlightRoute = Database['public']['Tables']['flight_routes']['Row'];
type FlightRouteInsert = Database['public']['Tables']['flight_routes']['Insert'];

export interface FlightCostResult {
  cost: number;
  currency: string;
  isStale?: boolean;
  dataSource: string;
  confidenceScore?: number;
  lastUpdated?: string;
  peakSeasonMultiplier?: number;
  typicalLayovers?: number;
  avgFlightDurationHours?: number;
  budgetAirlineAvailable?: boolean;
}

/**
 * Get flight cost between origin and destination countries
 */
export async function getFlightCost(
  originCountryCode: string,
  destinationCountryCode: string
): Promise<FlightCostResult | null> {
  try {
    const { data, error } = await supabase
      .from('flight_routes')
      .select('*')
      .eq('origin_country_code', originCountryCode)
      .eq('destination_country_code', destinationCountryCode)
      .order('last_updated', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching flight cost:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const route = data[0];
    
    // Check if data is stale (older than 30 days for manual data, 7 days for API data)
    const lastUpdated = new Date(route.last_updated || route.created_at || '');
    const now = new Date();
    const daysSinceUpdate = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
    
    const isStale = route.data_source === 'manual' 
      ? daysSinceUpdate > 30 
      : daysSinceUpdate > 7;

    return {
      cost: route.avg_economy_cost,
      currency: route.currency_code,
      isStale,
      dataSource: route.data_source,
      confidenceScore: route.confidence_score || undefined,
      lastUpdated: route.last_updated || undefined,
      peakSeasonMultiplier: route.peak_season_multiplier || undefined,
      typicalLayovers: route.typical_layovers || undefined,
      avgFlightDurationHours: route.avg_flight_duration_hours || undefined,
      budgetAirlineAvailable: route.budget_airline_available || undefined,
    };
  } catch (error) {
    console.error('Error in getFlightCost:', error);
    throw error;
  }
}

/**
 * Get all available flight routes from origin country
 */
export async function getFlightRoutesFromOrigin(originCountryCode: string): Promise<FlightRoute[]> {
  try {
    const { data, error } = await supabase
      .from('flight_routes')
      .select('*')
      .eq('origin_country_code', originCountryCode)
      .order('avg_economy_cost', { ascending: true });

    if (error) {
      console.error('Error fetching flight routes from origin:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFlightRoutesFromOrigin:', error);
    throw error;
  }
}

/**
 * Get all available flight routes to destination country
 */
export async function getFlightRoutesToDestination(destinationCountryCode: string): Promise<FlightRoute[]> {
  try {
    const { data, error } = await supabase
      .from('flight_routes')
      .select('*')
      .eq('destination_country_code', destinationCountryCode)
      .order('avg_economy_cost', { ascending: true });

    if (error) {
      console.error('Error fetching flight routes to destination:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFlightRoutesToDestination:', error);
    throw error;
  }
}

/**
 * Get flight routes with country details for cost calculator display
 */
export async function getFlightRoutesWithCountries(
  originCountryCode: string,
  destinationCountryCode?: string
): Promise<Array<FlightRoute & {
  origin_country?: { name: string; country_code: string };
  destination_country?: { name: string; country_code: string };
}>> {
  try {
    let query = supabase
      .from('flight_routes')
      .select(`
        *,
        origin_country:countries!flight_routes_origin_country_code_fkey(name, country_code),
        destination_country:countries!flight_routes_destination_country_code_fkey(name, country_code)
      `)
      .eq('origin_country_code', originCountryCode);

    if (destinationCountryCode) {
      query = query.eq('destination_country_code', destinationCountryCode);
    }

    query = query.order('avg_economy_cost', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching flight routes with countries:', error);
      throw error;
    }

    return (data || []) as any;
  } catch (error) {
    console.error('Error in getFlightRoutesWithCountries:', error);
    throw error;
  }
}

/**
 * Check if flight data is fresh (not stale)
 */
export function isFlightDataFresh(lastUpdated: string, dataSource: string): boolean {
  const lastUpdatedDate = new Date(lastUpdated);
  const now = new Date();
  const daysSinceUpdate = Math.floor((now.getTime() - lastUpdatedDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return dataSource === 'manual' ? daysSinceUpdate <= 30 : daysSinceUpdate <= 7;
}

/**
 * Get stale flight routes that need updating
 */
export async function getStaleFlightRoutes(limit: number = 50): Promise<FlightRoute[]> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('flight_routes')
      .select('*')
      .or(`and(data_source.eq.manual,last_updated.lt.${thirtyDaysAgo.toISOString()}),and(data_source.neq.manual,last_updated.lt.${sevenDaysAgo.toISOString()})`)
      .order('last_updated', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching stale flight routes:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getStaleFlightRoutes:', error);
    throw error;
  }
}

/**
 * Create or update flight route
 */
export async function upsertFlightRoute(route: FlightRouteInsert): Promise<FlightRoute> {
  try {
    const { data, error } = await supabase
      .from('flight_routes')
      .upsert(route, {
        onConflict: 'origin_country_code,destination_country_code,data_source'
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting flight route:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in upsertFlightRoute:', error);
    throw error;
  }
}

/**
 * Create a new flight route
 */
export async function createFlightRoute(route: FlightRouteInsert): Promise<FlightRoute> {
  try {
    const { data, error } = await supabase
      .from('flight_routes')
      .insert(route)
      .select()
      .single();

    if (error) {
      console.error('Error creating flight route:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createFlightRoute:', error);
    throw error;
  }
}

/**
 * Update flight route
 */
export async function updateFlightRoute(id: string, updates: Partial<FlightRouteInsert>): Promise<FlightRoute> {
  try {
    const { data, error } = await supabase
      .from('flight_routes')
      .update({
        ...updates,
        last_updated: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating flight route:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateFlightRoute:', error);
    throw error;
  }
}

/**
 * Delete flight route
 */
export async function deleteFlightRoute(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('flight_routes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting flight route:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteFlightRoute:', error);
    throw error;
  }
}


