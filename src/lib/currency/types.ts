// Currency system types and interfaces for Akada multicurrency support

export interface CurrencyConfig {
  code: string;           // ISO 4217 currency code (e.g., 'NGN', 'USD')
  symbol: string;         // Currency symbol (e.g., '₦', '$')
  name: string;          // Full currency name (e.g., 'Nigerian Naira')
  locale: string;        // Locale for formatting (e.g., 'en-NG')
  decimals: number;      // Number of decimal places
  region: 'africa' | 'international';
  countries: string[];   // ISO country codes
  priority: number;      // Display priority (lower = higher priority)
}

export interface ExchangeRate {
  from: string;          // Source currency code
  to: string;           // Target currency code
  rate: number;         // Exchange rate (1 from = rate * to)
  timestamp: Date;      // When the rate was fetched
  source: 'api' | 'fallback' | 'cache';
  validUntil?: Date;    // Cache expiration
}

export interface CurrencyFormatOptions {
  includeSymbol?: boolean;    // Include currency symbol (default: true)
  decimals?: number;         // Number of decimal places (default: from config)
  compact?: boolean;         // Use compact format (K, M, B) (default: false)
  showCode?: boolean;        // Show currency code instead of symbol (default: false)
  locale?: string;          // Custom locale override
  style?: 'decimal' | 'currency' | 'percent';
}

export interface ConversionOptions {
  round?: boolean;           // Round to nearest whole number (default: false)
  exchangeRate?: number;     // Custom exchange rate override
  format?: CurrencyFormatOptions; // Return formatted string if provided
}

export interface CurrencyDisplayInfo {
  formatted: string;         // Formatted string ready for display
  value: number;            // Raw numeric value
  currency: string;         // Currency code
  isCompact: boolean;       // Whether compact formatting was applied
  originalAmount: number;   // Original amount before formatting
  exchangeRate?: number;    // Exchange rate used (if converted)
}

export interface CurrencyServiceConfig {
  apiKey?: string;          // Fixer.io API key
  baseUrl: string;          // API base URL
  cacheTTL: number;         // Cache time-to-live in seconds
  fallbackEnabled: boolean; // Enable fallback to static rates
  defaultCurrency: string;  // Default currency (NGN for Akada)
  retryAttempts: number;    // Number of retry attempts for API calls
  timeout: number;          // Request timeout in milliseconds
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: Date;
  expiry: Date;
  key: string;
}

export interface CurrencyConversion {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  convertedAmount: number;
  exchangeRate: number;
  timestamp: Date;
}

export interface APIResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: Record<string, number>;
  error?: {
    code: number;
    type: string;
    info: string;
  };
}

export interface CurrencyError extends Error {
  code: 'API_ERROR' | 'NETWORK_ERROR' | 'INVALID_CURRENCY' | 'RATE_LIMIT' | 'CACHE_ERROR';
  currency?: string;
  originalError?: Error;
  retryable: boolean;
}

// User preferences for currency display
export interface UserCurrencyPreferences {
  primary: string;           // Primary currency (NGN for most African users)
  secondary?: string;        // Secondary currency for comparison (USD)
  display: string[];         // Currencies to show in multi-currency displays
  autoDetect: boolean;       // Auto-detect currency based on location
  compactThreshold: number;  // Amount above which to use compact formatting
}

// Supported African currencies configuration
export type AfricanCurrencyCode = 'NGN' | 'GHS' | 'KES' | 'ZAR' | 'EGP' | 'MAD' | 'TND' | 'XOF' | 'XAF';
export type InternationalCurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'SEK' | 'NOK' | 'DKK' | 'CHF' | 'JPY' | 'SGD' | 'NZD' | 'HKD';
export type SupportedCurrencyCode = AfricanCurrencyCode | InternationalCurrencyCode;

// Event types for currency service
export interface CurrencyEvent {
  type: 'rate_updated' | 'cache_cleared' | 'api_error' | 'fallback_used';
  timestamp: Date;
  data?: any;
  error?: CurrencyError;
}

export type CurrencyEventListener = (event: CurrencyEvent) => void;

// Rate fetching strategies
export type RateFetchStrategy = 'realtime' | 'cached' | 'fallback' | 'hybrid';

export interface RateFetchOptions {
  strategy?: RateFetchStrategy;
  maxAge?: number;           // Maximum age of cached rates in seconds
  forceRefresh?: boolean;    // Force refresh from API
  fallbackOnError?: boolean; // Use fallback rates if API fails
}