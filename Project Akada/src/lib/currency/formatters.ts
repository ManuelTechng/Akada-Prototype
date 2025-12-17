// Enhanced currency formatters with real-time API integration
import type { CurrencyFormatOptions, CurrencyDisplayInfo, ConversionOptions, RateFetchOptions } from './types';
import { getCurrencyConfig, ALL_CURRENCIES, COMPACT_THRESHOLDS } from './config';
import { currencyService } from './CurrencyService';

/**
 * Internal NGN formatter to avoid circular dependencies
 */
function formatNGNInternal(amount: number, options: CurrencyFormatOptions = {}): string {
  const { compact = false, decimals = 0, includeSymbol = true } = options;
  
  if (compact && amount >= 1000000) {
    const millions = amount / 1000000;
    return `${includeSymbol ? '₦' : ''}${millions.toFixed(1)}M`;
  }
  
  if (compact && amount >= 1000) {
    const thousands = amount / 1000;
    return `${includeSymbol ? '₦' : ''}${thousands.toFixed(1)}K`;
  }
  
  return `${includeSymbol ? '₦' : ''}${amount.toLocaleString('en-NG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}

/**
 * Internal USD formatter to avoid circular dependencies
 */
function formatUSDInternal(amount: number, options: CurrencyFormatOptions = {}): string {
  const { compact = false, decimals = 2, includeSymbol = true } = options;
  
  if (compact && amount >= 1000000) {
    const millions = amount / 1000000;
    return `${includeSymbol ? '$' : ''}${millions.toFixed(1)}M`;
  }
  
  if (compact && amount >= 1000) {
    const thousands = amount / 1000;
    return `${includeSymbol ? '$' : ''}${thousands.toFixed(1)}K`;
  }
  
  return `${includeSymbol ? '$' : ''}${amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}

/**
 * Format NGN with optional real-time conversion display
 */
export async function formatNGNWithRealTime(
  amount: number,
  options: CurrencyFormatOptions & { showUSDEquivalent?: boolean } = {}
): Promise<string> {
  const { showUSDEquivalent = false, ...formatOptions } = options;
  
  // Format the NGN amount
  const ngnFormatted = formatNGNInternal(amount, formatOptions);
  
  // Add USD equivalent if requested
  if (showUSDEquivalent) {
    try {
      const conversion = await currencyService.convertAmount(amount, 'NGN', 'USD');
      const usdFormatted = formatUSDInternal(conversion.convertedAmount, { compact: true });
      return `${ngnFormatted} (~${usdFormatted})`;
    } catch (error) {
      console.warn('Failed to fetch USD equivalent:', error);
      return ngnFormatted;
    }
  }
  
  return ngnFormatted;
}

/**
 * Format USD with optional real-time NGN conversion display
 */
export async function formatUSDWithRealTime(
  amount: number,
  options: CurrencyFormatOptions & { showNGNEquivalent?: boolean } = {}
): Promise<string> {
  const { showNGNEquivalent = false, ...formatOptions } = options;
  
  // Format the USD amount
  const usdFormatted = formatUSDInternal(amount, formatOptions);
  
  // Add NGN equivalent if requested
  if (showNGNEquivalent) {
    try {
      const conversion = await currencyService.convertAmount(amount, 'USD', 'NGN');
      const ngnFormatted = formatNGNInternal(conversion.convertedAmount, { compact: true });
      return `${usdFormatted} (~${ngnFormatted})`;
    } catch (error) {
      console.warn('Failed to fetch NGN equivalent:', error);
      return usdFormatted;
    }
  }
  
  return usdFormatted;
}

/**
 * Convert and format currency with real-time rates
 */
export async function convertWithRealTime(
  amount: number,
  from: string,
  to: string,
  options: ConversionOptions = {}
): Promise<string | number> {
  try {
    // Convert ConversionOptions to RateFetchOptions
    const rateOptions: RateFetchOptions = {
      strategy: 'realtime',
      fallbackOnError: true
    };
    const conversion = await currencyService.convertAmount(amount, from, to, rateOptions);
    
    if (options.format) {
      return formatCurrency(conversion.convertedAmount, to, options.format);
    }
    
    return conversion.convertedAmount;
  } catch (error) {
    console.error('Real-time conversion failed:', error);
    
    // Fallback to static conversion if available
    if (from === 'USD' && to === 'NGN') {
      const fallbackAmount = amount * 1500; // Static rate
      return options.format ? formatNGNInternal(fallbackAmount, options.format) : fallbackAmount;
    }
    
    if (from === 'NGN' && to === 'USD') {
      const fallbackAmount = amount / 1500; // Static rate
      return options.format ? formatUSDInternal(fallbackAmount, options.format) : fallbackAmount;
    }
    
    throw error;
  }
}

/**
 * Format amount in multiple currencies simultaneously
 */
export async function formatMultiCurrency(
  amount: number,
  baseCurrency: string,
  targetCurrencies: string[],
  options: {
    layout?: 'inline' | 'stacked' | 'compact';
    showBaseCurrency?: boolean;
    maxCurrencies?: number;
  } = {}
): Promise<CurrencyDisplayInfo[]> {
  const {
    layout = 'inline',
    showBaseCurrency = true,
    maxCurrencies = 4
  } = options;

  const results: CurrencyDisplayInfo[] = [];
  
  // Add base currency if requested
  if (showBaseCurrency) {
    results.push({
      formatted: formatCurrency(amount, baseCurrency),
      value: amount,
      currency: baseCurrency,
      isCompact: amount >= COMPACT_THRESHOLDS.K,
      originalAmount: amount
    });
  }

  // Convert to target currencies
  try {
    const conversions = await currencyService.convertToMultiple(
      amount, 
      baseCurrency, 
      targetCurrencies.slice(0, maxCurrencies)
    );

    Object.entries(conversions).forEach(([currency, conversion]) => {
      const formatted = formatCurrency(conversion.convertedAmount, currency);
      results.push({
        formatted,
        value: conversion.convertedAmount,
        currency,
        isCompact: conversion.convertedAmount >= COMPACT_THRESHOLDS.K,
        originalAmount: amount,
        exchangeRate: conversion.exchangeRate
      });
    });
  } catch (error) {
    console.warn('Multi-currency conversion failed:', error);
  }

  return results;
}

/**
 * Smart currency formatter that detects amount and chooses appropriate format
 */
export function formatCurrency(
  amount: number,
  currency: string,
  options: CurrencyFormatOptions = {}
): string {
  const config = getCurrencyConfig(currency);
  if (!config) {
    console.warn(`Unknown currency: ${currency}`);
    return `${amount} ${currency}`;
  }

  // Auto-determine if compact formatting is needed
  const shouldUseCompact = options.compact !== false && amount >= COMPACT_THRESHOLDS.K;
  
  const formatOptions: CurrencyFormatOptions = {
    includeSymbol: true,
    decimals: config.decimals,
    locale: config.locale,
    compact: shouldUseCompact,
    ...options
  };

  // Use internal formatters for supported currencies
  switch (currency) {
    case 'NGN':
      return formatNGNInternal(amount, formatOptions);
    case 'USD':
      return formatUSDInternal(amount, formatOptions);
    default:
      return formatGenericCurrency(amount, currency, formatOptions);
  }
}

/**
 * Generic currency formatter for non-NGN/USD currencies
 */
function formatGenericCurrency(
  amount: number,
  currency: string,
  options: CurrencyFormatOptions
): string {
  const config = getCurrencyConfig(currency);
  if (!config) return `${amount} ${currency}`;

  const {
    includeSymbol = true,
    decimals = config.decimals,
    compact = false,
    showCode = false,
    locale = config.locale
  } = options;

  // Handle compact formatting
  if (compact) {
    if (amount >= 1000000) {
      const millions = amount / 1000000;
      const symbol = includeSymbol && !showCode ? config.symbol : '';
      return `${symbol}${millions.toFixed(1)}M${showCode ? ` ${currency}` : ''}`;
    }
    
    if (amount >= 1000) {
      const thousands = amount / 1000;
      const symbol = includeSymbol && !showCode ? config.symbol : '';
      return `${symbol}${thousands.toFixed(1)}K${showCode ? ` ${currency}` : ''}`;
    }
  }

  // Standard formatting
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: includeSymbol && !showCode ? 'currency' : 'decimal',
      currency: includeSymbol && !showCode ? currency : undefined,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: true
    });

    const formatted = formatter.format(amount);
    
    if (includeSymbol && showCode) {
      return `${currency} ${formatted}`;
    }
    
    if (includeSymbol && !showCode && !formatted.includes(config.symbol)) {
      return `${config.symbol}${formatted}`;
    }

    return formatted;
  } catch (error) {
    console.warn(`Formatting failed for ${currency}:`, error);
    const symbol = includeSymbol ? (showCode ? currency : config.symbol) : '';
    return `${symbol}${amount.toLocaleString(locale, { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals 
    })}`;
  }
}

/**
 * Format currency amount with automatic best practices
 */
export function formatCurrencyAuto(
  amount: number,
  currency: string,
  context: 'display' | 'input' | 'comparison' | 'mobile' = 'display'
): string {
  const config = getCurrencyConfig(currency);
  if (!config) return `${amount} ${currency}`;

  const options: CurrencyFormatOptions = {};

  switch (context) {
    case 'mobile':
      options.compact = amount >= 100000; // More aggressive compacting for mobile
      options.decimals = amount >= 100000 ? 1 : 2;
      break;
      
    case 'comparison':
      options.compact = amount >= 1000000; // Only compact very large amounts
      options.decimals = 0; // No decimals for cleaner comparison
      break;
      
    case 'input':
      options.compact = false; // Never compact in input fields
      options.decimals = 2; // Always show decimals for precision
      break;
      
    case 'display':
    default:
      options.compact = amount >= COMPACT_THRESHOLDS.K;
      options.decimals = config.decimals;
      break;
  }

  return formatCurrency(amount, currency, options);
}

/**
 * Format currency range (e.g., "₦5M - ₦10M")
 */
export function formatCurrencyRange(
  minAmount: number,
  maxAmount: number,
  currency: string,
  options: CurrencyFormatOptions = {}
): string {
  const minFormatted = formatCurrency(minAmount, currency, { ...options, compact: true });
  const maxFormatted = formatCurrency(maxAmount, currency, { ...options, compact: true });
  
  return `${minFormatted} - ${maxFormatted}`;
}

/**
 * Format percentage change with currency context
 */
export function formatCurrencyChange(
  oldAmount: number,
  newAmount: number,
  currency: string,
  options: { showAmount?: boolean; showPercentage?: boolean } = {}
): string {
  const { showAmount = true, showPercentage = true } = options;
  
  const amountChange = newAmount - oldAmount;
  const percentChange = oldAmount !== 0 ? (amountChange / oldAmount) * 100 : 0;
  
  const parts: string[] = [];
  
  if (showAmount) {
    const changeFormatted = formatCurrency(Math.abs(amountChange), currency, { compact: true });
    const sign = amountChange >= 0 ? '+' : '-';
    parts.push(`${sign}${changeFormatted}`);
  }
  
  if (showPercentage) {
    const sign = percentChange >= 0 ? '+' : '';
    parts.push(`${sign}${percentChange.toFixed(1)}%`);
  }
  
  return parts.join(' ');
}

export default {
  formatNGNWithRealTime,
  formatUSDWithRealTime,
  convertWithRealTime,
  formatMultiCurrency,
  formatCurrency,
  formatCurrencyAuto,
  formatCurrencyRange,
  formatCurrencyChange
};