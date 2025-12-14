import { getFlightCost as getFlightCostFromDB, upsertFlightRoute } from '../supabase/queries/flights';
import type { FlightCostResult } from './types';
import { FlightDataNotFoundError, FlightApiError, FlightNetworkError } from './types';

export class FlightCostService {
  private readonly FRESHNESS_DAYS_MANUAL = 30;
  private readonly FRESHNESS_DAYS_API = 7;

  /**
   * Get flight cost between origin and destination countries
   * API-ready abstraction that supports both manual data and future API integration
   */
  async getFlightCost(originCountry: string, destCountry: string): Promise<FlightCostResult> {
    try {
      // 1. Try database first (both manual and cached API data)
      const cached = await this.getFromDatabase(originCountry, destCountry);
      if (cached && this.isFresh(cached)) {
        return cached;
      }

      // 2. If stale or missing, try API (only if enabled)
      if (this.isApiEnabled()) {
        try {
          const apiResult = await this.fetchFromApi(originCountry, destCountry);
          if (apiResult) {
            await this.cacheApiResult(apiResult, originCountry, destCountry);
            return apiResult;
          }
        } catch (error) {
          console.warn('API fetch failed, falling back to cached data:', error);
        }
      }

      // 3. Fallback to stale data if available
      if (cached) {
        return { ...cached, isStale: true };
      }

      // 4. No data available
      throw new FlightDataNotFoundError(originCountry, destCountry);
    } catch (error) {
      if (error instanceof FlightDataNotFoundError || 
          error instanceof FlightApiError || 
          error instanceof FlightNetworkError) {
        throw error;
      }
      throw new FlightApiError(originCountry, destCountry, `Unexpected error: ${error}`);
    }
  }

  /**
   * Get flight cost from database (cached data)
   */
  private async getFromDatabase(originCountry: string, destCountry: string): Promise<FlightCostResult | null> {
    try {
      return await getFlightCostFromDB(originCountry, destCountry);
    } catch (error) {
      console.error('Error fetching from database:', error);
      return null;
    }
  }

  /**
   * Check if flight data is fresh based on data source and last update
   */
  private isFresh(data: FlightCostResult): boolean {
    if (!data.lastUpdated) {
      return false;
    }

    const daysSinceUpdate = this.getDaysSinceUpdate(data.lastUpdated);
    const freshnessDays = data.dataSource === 'manual' 
      ? this.FRESHNESS_DAYS_MANUAL 
      : this.FRESHNESS_DAYS_API;

    return daysSinceUpdate < freshnessDays;
  }

  /**
   * Calculate days since last update
   */
  private getDaysSinceUpdate(lastUpdated: string): number {
    const lastUpdatedDate = new Date(lastUpdated);
    const now = new Date();
    return Math.floor((now.getTime() - lastUpdatedDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if API integration is enabled (Phase 3 feature)
   */
  private isApiEnabled(): boolean {
    return import.meta.env.VITE_FLIGHT_API_ENABLED === 'true';
  }

  /**
   * Fetch flight cost from external API (Phase 3 - currently placeholder)
   */
  private async fetchFromApi(originCountry: string, destCountry: string): Promise<FlightCostResult | null> {
    try {
      // Placeholder for future API integration
      // This would integrate with Skyscanner, Amadeus, or Google Flights API
      
      const apiProvider = import.meta.env.VITE_FLIGHT_API_PROVIDER || 'skyscanner';
      
      switch (apiProvider) {
        case 'skyscanner':
          return await this.fetchFromSkyscanner(originCountry, destCountry);
        case 'amadeus':
          return await this.fetchFromAmadeus(originCountry, destCountry);
        case 'google_flights':
          return await this.fetchFromGoogleFlights(originCountry, destCountry);
        default:
          console.warn(`Unknown API provider: ${apiProvider}`);
          return null;
      }
    } catch (error) {
      throw new FlightApiError(originCountry, destCountry, `API fetch failed: ${error}`);
    }
  }

  /**
   * Placeholder: Fetch from Skyscanner API
   */
  private async fetchFromSkyscanner(originCountry: string, destCountry: string): Promise<FlightCostResult | null> {
    // TODO: Implement Skyscanner API integration in Phase 3
    console.log(`[PLACEHOLDER] Fetching from Skyscanner: ${originCountry} → ${destCountry}`);
    return null;
  }

  /**
   * Placeholder: Fetch from Amadeus API
   */
  private async fetchFromAmadeus(originCountry: string, destCountry: string): Promise<FlightCostResult | null> {
    // TODO: Implement Amadeus API integration in Phase 3
    console.log(`[PLACEHOLDER] Fetching from Amadeus: ${originCountry} → ${destCountry}`);
    return null;
  }

  /**
   * Placeholder: Fetch from Google Flights API
   */
  private async fetchFromGoogleFlights(originCountry: string, destCountry: string): Promise<FlightCostResult | null> {
    // TODO: Implement Google Flights API integration in Phase 3
    console.log(`[PLACEHOLDER] Fetching from Google Flights: ${originCountry} → ${destCountry}`);
    return null;
  }

  /**
   * Cache API result in database for future use
   */
  private async cacheApiResult(result: FlightCostResult, originCountry: string, destCountry: string): Promise<void> {
    try {
      await upsertFlightRoute({
        origin_country_code: originCountry,
        destination_country_code: destCountry,
        avg_economy_cost: result.cost,
        currency_code: result.currency,
        data_source: result.dataSource as any, // Type assertion needed for now
        confidence_score: result.confidenceScore || 85,
        last_updated: new Date().toISOString(),
        peak_season_multiplier: result.peakSeasonMultiplier,
        typical_layovers: result.typicalLayovers,
        avg_flight_duration_hours: result.avgFlightDurationHours,
        budget_airline_available: result.budgetAirlineAvailable,
      });
    } catch (error) {
      console.error('Error caching API result:', error);
      // Don't throw here - caching failure shouldn't break the main flow
    }
  }

  /**
   * Get flight cost with peak season multiplier applied
   */
  async getFlightCostWithSeason(originCountry: string, destCountry: string, isPeakSeason: boolean = false): Promise<FlightCostResult> {
    const result = await this.getFlightCost(originCountry, destCountry);
    
    if (isPeakSeason && result.peakSeasonMultiplier) {
      return {
        ...result,
        cost: result.cost * result.peakSeasonMultiplier
      };
    }

    return result;
  }

  /**
   * Batch fetch multiple flight routes
   */
  async getMultipleFlightCosts(routes: Array<{ origin: string; destination: string }>): Promise<Array<FlightCostResult | null>> {
    const promises = routes.map(route => 
      this.getFlightCost(route.origin, route.destination)
        .catch(() => null) // Return null for failed fetches
    );

    return Promise.all(promises);
  }
}

// Export singleton instance
export const flightCostService = new FlightCostService();
