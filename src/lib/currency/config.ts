// Currency configuration for Akada multicurrency system
import type { CurrencyConfig, CurrencyServiceConfig, SupportedCurrencyCode } from './types';

// African currencies configuration - prioritizing key markets
export const AFRICAN_CURRENCIES: Record<string, CurrencyConfig> = {
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    locale: 'en-NG',
    decimals: 2,
    region: 'africa',
    countries: ['NG'],
    priority: 1
  },
  GHS: {
    code: 'GHS',
    symbol: '₵',
    name: 'Ghanaian Cedi',
    locale: 'en-GH',
    decimals: 2,
    region: 'africa',
    countries: ['GH'],
    priority: 2
  },
  KES: {
    code: 'KES',
    symbol: 'KSh',
    name: 'Kenyan Shilling',
    locale: 'en-KE',
    decimals: 2,
    region: 'africa',
    countries: ['KE'],
    priority: 3
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    locale: 'en-ZA',
    decimals: 2,
    region: 'africa',
    countries: ['ZA'],
    priority: 4
  },
  EGP: {
    code: 'EGP',
    symbol: 'E£',
    name: 'Egyptian Pound',
    locale: 'ar-EG',
    decimals: 2,
    region: 'africa',
    countries: ['EG'],
    priority: 5
  }
};

// International currencies for comparison and international students
export const INTERNATIONAL_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    decimals: 2,
    region: 'international',
    countries: ['US'],
    priority: 10
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'en-EU',
    decimals: 2,
    region: 'international',
    countries: ['DE', 'FR', 'NL', 'IT', 'ES'],
    priority: 11
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    decimals: 2,
    region: 'international',
    countries: ['GB'],
    priority: 12
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    locale: 'en-CA',
    decimals: 2,
    region: 'international',
    countries: ['CA'],
    priority: 13
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    locale: 'en-AU',
    decimals: 2,
    region: 'international',
    countries: ['AU'],
    priority: 14
  },
  SEK: {
    code: 'SEK',
    symbol: 'kr',
    name: 'Swedish Krona',
    locale: 'sv-SE',
    decimals: 2,
    region: 'international',
    countries: ['SE'],
    priority: 15
  },
  NOK: {
    code: 'NOK',
    symbol: 'kr',
    name: 'Norwegian Krone',
    locale: 'nb-NO',
    decimals: 2,
    region: 'international',
    countries: ['NO'],
    priority: 16
  },
  DKK: {
    code: 'DKK',
    symbol: 'kr',
    name: 'Danish Krone',
    locale: 'da-DK',
    decimals: 2,
    region: 'international',
    countries: ['DK'],
    priority: 17
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    locale: 'de-CH',
    decimals: 2,
    region: 'international',
    countries: ['CH'],
    priority: 18
  }
};

// Combined currency configuration
export const ALL_CURRENCIES: Record<string, CurrencyConfig> = {
  ...AFRICAN_CURRENCIES,
  ...INTERNATIONAL_CURRENCIES
};

// Get sorted currencies by priority
export const getSortedCurrencies = (region?: 'africa' | 'international'): CurrencyConfig[] => {
  const currencies = Object.values(ALL_CURRENCIES);
  
  if (region) {
    return currencies
      .filter(currency => currency.region === region)
      .sort((a, b) => a.priority - b.priority);
  }
  
  return currencies.sort((a, b) => a.priority - b.priority);
};

// Currency service configuration
export const getCurrencyServiceConfig = (): CurrencyServiceConfig => ({
  apiKey: import.meta.env.VITE_FIXER_API_KEY || '',
  baseUrl: import.meta.env.VITE_CURRENCY_API_BASE_URL || 'https://api.fixer.io/v1',
  cacheTTL: parseInt(import.meta.env.VITE_CURRENCY_CACHE_TTL || '3600', 10),
  fallbackEnabled: import.meta.env.VITE_CURRENCY_FALLBACK_ENABLED === 'true',
  defaultCurrency: 'NGN', // Akada's primary focus on Nigerian market
  retryAttempts: 3,
  timeout: 10000 // 10 seconds
});

// Fallback exchange rates (updated periodically)
// These rates are used when API is unavailable
export const FALLBACK_RATES: Record<string, Record<string, number>> = {
  USD: {
    NGN: 1500,    // 1 USD = 1500 NGN (as specified in PRD)
    GHS: 12.5,    // 1 USD = 12.5 GHS
    KES: 129,     // 1 USD = 129 KES
    ZAR: 18.5,    // 1 USD = 18.5 ZAR
    EGP: 31,      // 1 USD = 31 EGP
    EUR: 0.85,    // 1 USD = 0.85 EUR
    GBP: 0.73,    // 1 USD = 0.73 GBP
    CAD: 1.35,    // 1 USD = 1.35 CAD
    AUD: 1.45,    // 1 USD = 1.45 AUD
    SEK: 11.25,   // 1 USD = 11.25 SEK
    NOK: 11.85,   // 1 USD = 11.85 NOK
    DKK: 7.02,    // 1 USD = 7.02 DKK
    CHF: 0.92,    // 1 USD = 0.92 CHF
    JPY: 154.50,  // 1 USD = 154.50 JPY
    SGD: 1.36,    // 1 USD = 1.36 SGD
    NZD: 1.73,    // 1 USD = 1.73 NZD
    HKD: 7.78     // 1 USD = 7.78 HKD
  },
  NGN: {
    USD: 1/1500,      // 1 NGN = 0.000667 USD
    GHS: 12.5/1500,   // 1 NGN = 0.0083 GHS
    KES: 129/1500,    // 1 NGN = 0.086 KES
    ZAR: 18.5/1500,   // 1 NGN = 0.0123 ZAR
    EGP: 31/1500,     // 1 NGN = 0.0207 EGP
    SEK: 11.25/1500,  // 1 NGN = 0.0075 SEK
    NOK: 11.85/1500,  // 1 NGN = 0.0079 NOK
    DKK: 7.02/1500,   // 1 NGN = 0.0047 DKK
    CHF: 0.92/1500,   // 1 NGN = 0.00061 CHF
    JPY: 154.50/1500, // 1 NGN = 0.103 JPY
    SGD: 1.36/1500,   // 1 NGN = 0.00091 SGD
    NZD: 1.73/1500,   // 1 NGN = 0.00115 NZD
    HKD: 7.78/1500    // 1 NGN = 0.00519 HKD
  }
};

// Country to currency mapping for auto-detection
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  NG: 'NGN', // Nigeria
  GH: 'GHS', // Ghana
  KE: 'KES', // Kenya
  ZA: 'ZAR', // South Africa
  EG: 'EGP', // Egypt
  US: 'USD', // United States
  GB: 'GBP', // United Kingdom
  CA: 'CAD', // Canada
  AU: 'AUD', // Australia
  DE: 'EUR', // Germany
  FR: 'EUR', // France
  NL: 'EUR', // Netherlands
  IT: 'EUR', // Italy
  ES: 'EUR', // Spain
  SE: 'SEK', // Sweden
  NO: 'NOK', // Norway
  DK: 'DKK', // Denmark
  CH: 'CHF', // Switzerland
  JP: 'JPY', // Japan
  SG: 'SGD', // Singapore
  NZ: 'NZD', // New Zealand
  HK: 'HKD', // Hong Kong
};

// Locale to currency mapping
export const LOCALE_CURRENCY_MAP: Record<string, string> = {
  'en-NG': 'NGN',
  'en-GH': 'GHS',
  'en-KE': 'KES',
  'en-ZA': 'ZAR',
  'ar-EG': 'EGP',
  'en-US': 'USD',
  'en-GB': 'GBP',
  'en-CA': 'CAD',
  'en-AU': 'AUD',
  'de-DE': 'EUR',
  'fr-FR': 'EUR',
  'nl-NL': 'EUR',
  'it-IT': 'EUR',
  'es-ES': 'EUR',
};

// Validation helpers
export const isValidCurrency = (code: string): code is SupportedCurrencyCode => {
  return code in ALL_CURRENCIES;
};

export const isAfricanCurrency = (code: string): boolean => {
  return code in AFRICAN_CURRENCIES;
};

export const getCurrencyConfig = (code: string): CurrencyConfig | null => {
  return ALL_CURRENCIES[code] || null;
};

// Compact formatting thresholds
export const COMPACT_THRESHOLDS = {
  K: 1000,           // 1K+
  M: 1000000,        // 1M+
  B: 1000000000,     // 1B+
  T: 1000000000000   // 1T+
};

// API rate limits
export const API_LIMITS = {
  FIXER_FREE: {
    monthly: 1000,
    daily: 100,
    hourly: 10
  },
  FIXER_BASIC: {
    monthly: 10000,
    daily: 1000,
    hourly: 100
  }
};

// Cache keys
export const CACHE_KEYS = {
  EXCHANGE_RATE: (from: string, to: string) => `exchange_rate_${from}_${to}`,
  RATES_BULK: (base: string) => `rates_bulk_${base}`,
  LAST_UPDATE: 'currency_last_update',
  USER_PREFERENCES: (userId: string) => `currency_prefs_${userId}`,
  API_QUOTA: 'currency_api_quota'
};

export default {
  AFRICAN_CURRENCIES,
  INTERNATIONAL_CURRENCIES,
  ALL_CURRENCIES,
  getSortedCurrencies,
  getCurrencyServiceConfig,
  FALLBACK_RATES,
  COUNTRY_CURRENCY_MAP,
  LOCALE_CURRENCY_MAP,
  isValidCurrency,
  isAfricanCurrency,
  getCurrencyConfig,
  COMPACT_THRESHOLDS,
  API_LIMITS,
  CACHE_KEYS
};