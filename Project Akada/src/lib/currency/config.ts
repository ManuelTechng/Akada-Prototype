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
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    locale: 'en-SG',
    decimals: 2,
    region: 'international',
    countries: ['SG'],
    priority: 19
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    locale: 'ja-JP',
    decimals: 0,
    region: 'international',
    countries: ['JP'],
    priority: 20
  },
  NZD: {
    code: 'NZD',
    symbol: 'NZ$',
    name: 'New Zealand Dollar',
    locale: 'en-NZ',
    decimals: 2,
    region: 'international',
    countries: ['NZ'],
    priority: 21
  },
  HKD: {
    code: 'HKD',
    symbol: 'HK$',
    name: 'Hong Kong Dollar',
    locale: 'en-HK',
    decimals: 2,
    region: 'international',
    countries: ['HK'],
    priority: 22
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

// Fallback exchange rates (updated October 2025)
// These rates are used when API is unavailable
// CRITICAL: Updated CAD to NGN rate from 616 to 1050 (40% fix)
export const FALLBACK_RATES: Record<string, Record<string, number>> = {
  USD: {
    NGN: 1500,    // 1 USD = 1500 NGN (as specified in PRD)
    GHS: 12.5,    // 1 USD = 12.5 GHS
    KES: 129,     // 1 USD = 129 KES
    ZAR: 18.5,    // 1 USD = 18.5 ZAR
    EGP: 31,      // 1 USD = 31 EGP
    EUR: 0.92,    // 1 USD = 0.92 EUR (updated from 0.85)
    GBP: 0.79,    // 1 USD = 0.79 GBP (updated from 0.73)
    CAD: 1.43,    // 1 USD = 1.43 CAD (updated from 1.35)
    AUD: 1.52,    // 1 USD = 1.52 AUD (updated from 1.45)
    SEK: 10.85,   // 1 USD = 10.85 SEK (updated from 11.25)
    NOK: 10.95,   // 1 USD = 10.95 NOK (updated from 11.85)
    DKK: 6.85,    // 1 USD = 6.85 DKK (updated from 7.02)
    CHF: 0.88,    // 1 USD = 0.88 CHF (updated from 0.92)
    JPY: 149.50,  // 1 USD = 149.50 JPY (updated from 154.50)
    SGD: 1.34,    // 1 USD = 1.34 SGD (updated from 1.36)
    NZD: 1.68,    // 1 USD = 1.68 NZD (updated from 1.73)
    HKD: 7.78     // 1 USD = 7.78 HKD
  },
  CAD: {
    NGN: 1050,        // 1 CAD = 1050 NGN (CRITICAL FIX - was missing, caused 40% error)
    USD: 0.699,       // 1 CAD = 0.699 USD (1/1.43)
    EUR: 0.64,        // 1 CAD = 0.64 EUR
    GBP: 0.55,        // 1 CAD = 0.55 GBP
    AUD: 1.06,        // 1 CAD = 1.06 AUD
    GHS: 8.75,        // 1 CAD = 8.75 GHS
    KES: 90.9,        // 1 CAD = 90.9 KES
    ZAR: 12.9,        // 1 CAD = 12.9 ZAR
    EGP: 21.67,       // 1 CAD = 21.67 EGP
    SEK: 7.58,        // 1 CAD = 7.58 SEK
    NOK: 7.65,        // 1 CAD = 7.65 NOK
    DKK: 4.79,        // 1 CAD = 4.79 DKK
    CHF: 0.615,       // 1 CAD = 0.615 CHF
    JPY: 104.5,       // 1 CAD = 104.5 JPY
    SGD: 0.937,       // 1 CAD = 0.937 SGD
    NZD: 1.174,       // 1 CAD = 1.174 NZD
    HKD: 5.44         // 1 CAD = 5.44 HKD
  },
  NGN: {
    USD: 1/1500,      // 1 NGN = 0.000667 USD
    CAD: 1/1050,      // 1 NGN = 0.000952 CAD (CRITICAL FIX - was missing)
    EUR: 1/1620,      // 1 NGN = 0.000617 EUR
    GBP: 1/1905,      // 1 NGN = 0.000525 GBP
    GHS: 12.5/1500,   // 1 NGN = 0.0083 GHS
    KES: 129/1500,    // 1 NGN = 0.086 KES
    ZAR: 18.5/1500,   // 1 NGN = 0.0123 ZAR
    EGP: 31/1500,     // 1 NGN = 0.0207 EGP
    SEK: 10.85/1500,  // 1 NGN = 0.00723 SEK
    NOK: 10.95/1500,  // 1 NGN = 0.0073 NOK
    DKK: 6.85/1500,   // 1 NGN = 0.00457 DKK
    CHF: 0.88/1500,   // 1 NGN = 0.000587 CHF
    JPY: 149.50/1500, // 1 NGN = 0.0997 JPY
    SGD: 1.34/1500,   // 1 NGN = 0.000893 SGD
    NZD: 1.68/1500,   // 1 NGN = 0.00112 NZD
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
  HK: 'HKD'  // Hong Kong
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