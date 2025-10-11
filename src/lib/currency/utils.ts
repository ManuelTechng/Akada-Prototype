// Enhanced currency utilities for Akada multicurrency system
import type { CurrencyConfig, CurrencyFormatOptions, CurrencyConversion } from './types';
import { ALL_CURRENCIES, AFRICAN_CURRENCIES, getSortedCurrencies, isValidCurrency } from './config';
import { currencyService } from './CurrencyService';
import { formatCurrency } from './formatters';

/**
 * Format currency with real-time API integration
 */
export async function formatCurrencyWithAPI(
  amount: number,
  currency: string,
  options: CurrencyFormatOptions & { convertTo?: string } = {}
): Promise<string> {
  const { convertTo, ...formatOptions } = options;
  
  if (convertTo && convertTo !== currency) {
    try {
      const conversion = await currencyService.convertAmount(amount, currency, convertTo);
      const convertedFormatted = formatCurrency(conversion.convertedAmount, convertTo, formatOptions);
      const originalFormatted = formatCurrency(amount, currency, { compact: true });
      return `${convertedFormatted} (${originalFormatted})`;
    } catch (error) {
      console.warn('Currency conversion failed, showing original:', error);
    }
  }
  
  return formatCurrency(amount, currency, formatOptions);
}

/**
 * Convert currency with API and return formatted result
 */
export async function convertCurrencyWithAPI(
  amount: number,
  from: string,
  to: string,
  formatted: boolean = true
): Promise<string | number> {
  try {
    const conversion = await currencyService.convertAmount(amount, from, to);
    
    if (formatted) {
      return formatCurrency(conversion.convertedAmount, to);
    }
    
    return conversion.convertedAmount;
  } catch (error) {
    console.error('Currency conversion failed:', error);
    throw error;
  }
}

/**
 * Get bulk conversions for multiple currency pairs
 */
export async function getBulkConversions(
  amounts: Array<{ amount: number; from: string; to: string }>,
  formatted: boolean = true
): Promise<Array<{ 
  original: { amount: number; currency: string }; 
  converted: { amount: number | string; currency: string };
  rate: number;
}>> {
  const results = [];
  
  for (const { amount, from, to } of amounts) {
    try {
      const conversion = await currencyService.convertAmount(amount, from, to);
      results.push({
        original: { amount, currency: from },
        converted: { 
          amount: formatted ? formatCurrency(conversion.convertedAmount, to) : conversion.convertedAmount,
          currency: to
        },
        rate: conversion.exchangeRate
      });
    } catch (error) {
      console.warn(`Conversion failed for ${from}/${to}:`, error);
      results.push({
        original: { amount, currency: from },
        converted: { amount: formatted ? `Error` : 0, currency: to },
        rate: 0
      });
    }
  }
  
  return results;
}

/**
 * Get currency symbol by code
 */
export function getCurrencySymbol(currencyCode: string): string {
  const config = ALL_CURRENCIES[currencyCode];
  return config?.symbol || currencyCode;
}

/**
 * Get currency name by code
 */
export function getCurrencyName(currencyCode: string): string {
  const config = ALL_CURRENCIES[currencyCode];
  return config?.name || currencyCode;
}

/**
 * Check if currency is African
 */
export function isAfricanCurrency(currencyCode: string): boolean {
  return currencyCode in AFRICAN_CURRENCIES;
}

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies(): CurrencyConfig[] {
  return getSortedCurrencies();
}

/**
 * Get African currencies only
 */
export function getAfricanCurrencies(): CurrencyConfig[] {
  return getSortedCurrencies('africa');
}

/**
 * Get international currencies only
 */
export function getInternationalCurrencies(): CurrencyConfig[] {
  return getSortedCurrencies('international');
}

/**
 * Detect currency from country code
 */
export function getCurrencyFromCountry(countryCode: string): string | null {
  const countryToCurrency: Record<string, string> = {
    // African currencies
    NG: 'NGN', GH: 'GHS', KE: 'KES', ZA: 'ZAR', EG: 'EGP',
    // Major international currencies
    US: 'USD', GB: 'GBP', CA: 'CAD', AU: 'AUD',
    // European currencies
    DE: 'EUR', FR: 'EUR', NL: 'EUR', IT: 'EUR', ES: 'EUR',
    AT: 'EUR', BE: 'EUR', IE: 'EUR', PT: 'EUR', FI: 'EUR',
    // Nordic currencies (non-EUR)
    SE: 'SEK', NO: 'NOK', DK: 'DKK',
    // Other currencies
    CH: 'CHF', JP: 'JPY', SG: 'SGD', NZ: 'NZD', HK: 'HKD'
  };
  
  return countryToCurrency[countryCode.toUpperCase()] || null;
}

/**
 * Detect currency from locale
 */
export function getCurrencyFromLocale(locale: string): string | null {
  const localeToCurrency: Record<string, string> = {
    'en-NG': 'NGN', 'en-GH': 'GHS', 'en-KE': 'KES', 'en-ZA': 'ZAR', 'ar-EG': 'EGP',
    'en-US': 'USD', 'en-GB': 'GBP', 'en-CA': 'CAD', 'en-AU': 'AUD',
    'de-DE': 'EUR', 'fr-FR': 'EUR', 'nl-NL': 'EUR', 'it-IT': 'EUR', 'es-ES': 'EUR'
  };
  
  return localeToCurrency[locale] || null;
}

/**
 * Calculate currency strength/performance
 */
export async function calculateCurrencyPerformance(
  baseCurrency: string,
  compareCurrencies: string[],
  timeframe: 'day' | 'week' | 'month' = 'day'
): Promise<Array<{
  currency: string;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}>> {
  // This would require historical data from the API
  // For now, return mock data structure
  console.warn('Historical currency performance requires premium API access');
  
  return compareCurrencies.map(currency => ({
    currency,
    change: 0,
    changePercent: 0,
    trend: 'stable' as const
  }));
}

/**
 * Suggest optimal currencies for user based on location and preferences
 */
export function suggestCurrencies(
  userLocation?: string,
  userPreferences?: string[]
): string[] {
  const suggestions: string[] = [];
  
  // Always suggest NGN for African users (Akada's primary market)
  suggestions.push('NGN');
  
  // Add location-based currency
  if (userLocation) {
    const locationCurrency = getCurrencyFromCountry(userLocation);
    if (locationCurrency && !suggestions.includes(locationCurrency)) {
      suggestions.push(locationCurrency);
    }
  }
  
  // Add USD as international reference
  if (!suggestions.includes('USD')) {
    suggestions.push('USD');
  }
  
  // Add user preferences
  if (userPreferences) {
    userPreferences.forEach(currency => {
      if (isValidCurrency(currency) && !suggestions.includes(currency)) {
        suggestions.push(currency);
      }
    });
  }
  
  // Add popular African currencies
  const popularAfrican = ['GHS', 'KES', 'ZAR'];
  popularAfrican.forEach(currency => {
    if (suggestions.length < 6 && !suggestions.includes(currency)) {
      suggestions.push(currency);
    }
  });
  
  return suggestions.slice(0, 6); // Limit to 6 currencies
}

/**
 * Validate currency amount for specific currency
 */
export function validateCurrencyAmount(
  amount: number,
  currency: string
): { valid: boolean; error?: string; suggestion?: string } {
  if (!isValidCurrency(currency)) {
    return { valid: false, error: `Invalid currency code: ${currency}` };
  }
  
  if (!isFinite(amount) || isNaN(amount)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }
  
  if (amount < 0) {
    return { valid: false, error: 'Amount cannot be negative' };
  }
  
  // Currency-specific validations
  if (currency === 'NGN') {
    if (amount > 0 && amount < 100) {
      return { 
        valid: false, 
        error: 'NGN amount too small', 
        suggestion: 'Minimum meaningful amount is ₦100' 
      };
    }
    
    if (amount > 1000000000) { // 1 billion NGN
      return { 
        valid: false, 
        error: 'NGN amount too large', 
        suggestion: 'Maximum supported amount is ₦1B' 
      };
    }
  }
  
  return { valid: true };
}

/**
 * Format currency for different contexts
 */
export function formatForContext(
  amount: number,
  currency: string,
  context: 'table' | 'card' | 'input' | 'tooltip' | 'mobile'
): string {
  const config = ALL_CURRENCIES[currency];
  if (!config) return `${amount} ${currency}`;
  
  switch (context) {
    case 'table':
      return formatCurrency(amount, currency, { 
        compact: amount >= 1000000,
        decimals: amount >= 1000000 ? 1 : 2
      });
      
    case 'card':
      return formatCurrency(amount, currency, { 
        compact: amount >= 100000,
        decimals: amount >= 100000 ? 1 : 2
      });
      
    case 'input':
      return formatCurrency(amount, currency, { 
        compact: false,
        decimals: 2
      });
      
    case 'tooltip':
      return formatCurrency(amount, currency, { 
        compact: false,
        decimals: 2,
        showCode: true
      });
      
    case 'mobile':
      return formatCurrency(amount, currency, { 
        compact: amount >= 10000,
        decimals: amount >= 100000 ? 0 : 1
      });
      
    default:
      return formatCurrency(amount, currency);
  }
}

/**
 * Compare currency amounts accounting for exchange rates
 */
export async function compareCurrencyAmounts(
  amount1: number,
  currency1: string,
  amount2: number,
  currency2: string,
  baseCurrency: string = 'NGN'
): Promise<{
  comparison: 'greater' | 'less' | 'equal';
  difference: number;
  differenceFormatted: string;
}> {
  try {
    // Convert both amounts to base currency
    const conversion1 = currency1 === baseCurrency ? 
      { convertedAmount: amount1 } : 
      await currencyService.convertAmount(amount1, currency1, baseCurrency);
      
    const conversion2 = currency2 === baseCurrency ? 
      { convertedAmount: amount2 } : 
      await currencyService.convertAmount(amount2, currency2, baseCurrency);
    
    const baseAmount1 = conversion1.convertedAmount;
    const baseAmount2 = conversion2.convertedAmount;
    
    const difference = Math.abs(baseAmount1 - baseAmount2);
    const comparison = baseAmount1 > baseAmount2 ? 'greater' : 
                     baseAmount1 < baseAmount2 ? 'less' : 'equal';
    
    const differenceFormatted = formatCurrency(difference, baseCurrency, { compact: true });
    
    return {
      comparison,
      difference,
      differenceFormatted
    };
  } catch (error) {
    console.error('Currency comparison failed:', error);
    throw error;
  }
}

/**
 * Get currency exchange rate trend (requires historical data)
 */
export function getCurrencyTrend(
  from: string,
  to: string,
  days: number = 30
): Promise<Array<{ date: Date; rate: number }>> {
  // This would require historical API data
  console.warn('Currency trend analysis requires historical data API');
  return Promise.resolve([]);
}

export default {
  formatCurrencyWithAPI,
  convertCurrencyWithAPI,
  getBulkConversions,
  getCurrencySymbol,
  getCurrencyName,
  isAfricanCurrency,
  getSupportedCurrencies,
  getAfricanCurrencies,
  getInternationalCurrencies,
  getCurrencyFromCountry,
  getCurrencyFromLocale,
  calculateCurrencyPerformance,
  suggestCurrencies,
  validateCurrencyAmount,
  formatForContext,
  compareCurrencyAmounts,
  getCurrencyTrend
};