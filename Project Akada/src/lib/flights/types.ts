export interface FlightRoute {
  id: string;
  origin_country_code: string;
  destination_country_code: string;
  avg_economy_cost: number;
  currency_code: string;
  data_source: 'manual' | 'skyscanner_api' | 'google_flights' | 'user_reported' | 'amadeus_api';
  last_updated: string;
  confidence_score?: number; // 0-100
  api_provider?: string; // 'skyscanner', 'amadeus', 'kiwi'
  api_route_id?: string; // External API reference
  real_time_available?: boolean;
  avg_business_cost?: number;
  peak_season_multiplier?: number;
  typical_layovers?: number;
  avg_flight_duration_hours?: number;
  budget_airline_available?: boolean;
}

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

export interface FlightCostError extends Error {
  originCountry: string;
  destinationCountry: string;
  code: 'FLIGHT_DATA_NOT_FOUND' | 'API_ERROR' | 'NETWORK_ERROR';
}

export class FlightDataNotFoundError extends Error implements FlightCostError {
  public readonly originCountry: string;
  public readonly destinationCountry: string;
  public readonly code: 'FLIGHT_DATA_NOT_FOUND' = 'FLIGHT_DATA_NOT_FOUND';

  constructor(originCountry: string, destinationCountry: string) {
    super(`No flight data found for route: ${originCountry} → ${destinationCountry}`);
    this.name = 'FlightDataNotFoundError';
    this.originCountry = originCountry;
    this.destinationCountry = destinationCountry;
  }
}

export class FlightApiError extends Error implements FlightCostError {
  public readonly originCountry: string;
  public readonly destinationCountry: string;
  public readonly code: 'API_ERROR' = 'API_ERROR';

  constructor(originCountry: string, destinationCountry: string, message: string) {
    super(`Flight API error for route ${originCountry} → ${destinationCountry}: ${message}`);
    this.name = 'FlightApiError';
    this.originCountry = originCountry;
    this.destinationCountry = destinationCountry;
  }
}

export class FlightNetworkError extends Error implements FlightCostError {
  public readonly originCountry: string;
  public readonly destinationCountry: string;
  public readonly code: 'NETWORK_ERROR' = 'NETWORK_ERROR';

  constructor(originCountry: string, destinationCountry: string, message: string) {
    super(`Network error for route ${originCountry} → ${destinationCountry}: ${message}`);
    this.name = 'FlightNetworkError';
    this.originCountry = originCountry;
    this.destinationCountry = destinationCountry;
  }
}


