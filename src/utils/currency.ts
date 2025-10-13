// ======================================
// NGN CURRENCY FORMATTING SYSTEM
// Optimized for Nigerian users and mobile displays
// ======================================

// Constants from PRD specifications
export const CURRENCY_CONFIG = {
  // Exchange rates
  USD_TO_NGN_RATE: 1500, // 1 USD = 1500 NGN (from PRD)
  NGN_TO_USD_RATE: 1 / 1500,
  
  // Currency symbols
  NGN_SYMBOL: '₦',
  USD_SYMBOL: '$',
  SEK_SYMBOL: 'kr',
  EUR_SYMBOL: '€',
  GBP_SYMBOL: '£',
  CAD_SYMBOL: 'C$',
  AUD_SYMBOL: 'A$',
  CHF_SYMBOL: 'CHF',
  NOK_SYMBOL: 'kr',
  DKK_SYMBOL: 'kr',
  JPY_SYMBOL: '¥',
  SGD_SYMBOL: 'S$',
  NZD_SYMBOL: 'NZ$',
  HKD_SYMBOL: 'HK$',
  
  // Formatting options
  NGN_LOCALE: 'en-NG', // Nigerian English locale
  USD_LOCALE: 'en-US',
  
  // Mobile display thresholds
  COMPACT_THRESHOLD: 100000, // Format compactly above 100k
  LARGE_NUMBER_THRESHOLD: 1000000, // 1 million
  
  // Precision settings
  DEFAULT_DECIMALS: 2,
  COMPACT_DECIMALS: 1,
  WHOLE_NUMBER_THRESHOLD: 1, // Show as whole numbers if cents are 0
} as const;

// ======================================
// TYPES AND INTERFACES
// ======================================

export type CurrencyCode = 'NGN' | 'USD' | 'SEK' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'CHF' | 'NOK' | 'DKK' | 'JPY' | 'SGD' | 'NZD' | 'HKD';
export type CompactUnit = 'K' | 'M' | 'B' | 'T';

export interface CurrencyFormatOptions {
  /** Include currency symbol */
  includeSymbol?: boolean;
  /** Number of decimal places */
  decimals?: number;
  /** Use compact format (K, M, B) */
  compact?: boolean;
  /** Show full currency code instead of symbol */
  showCode?: boolean;
  /** Custom locale override */
  locale?: string;
  /** Force specific formatting style */
  style?: 'decimal' | 'currency' | 'percent';
}

export interface ConversionOptions {
  /** Round to nearest whole number */
  round?: boolean;
  /** Custom exchange rate override */
  exchangeRate?: number;
  /** Return formatting options */
  format?: CurrencyFormatOptions;
}

export interface CurrencyDisplayInfo {
  /** Formatted string ready for display */
  formatted: string;
  /** Raw numeric value */
  value: number;
  /** Currency code */
  currency: CurrencyCode;
  /** Whether compact formatting was applied */
  isCompact: boolean;
  /** Original amount before formatting */
  originalAmount: number;
}

// ======================================
// CORE FORMATTING FUNCTIONS
// ======================================

/**
 * Format amount in Nigerian Naira (NGN) with proper localization
 * Follows PRD specifications for Nigerian currency display
 * 
 * @param amount - Amount in Naira to format
 * @param options - Formatting options
 * @returns Formatted NGN string
 * 
 * @example
 * formatNGN(1500) // "₦1,500.00"
 * formatNGN(2500000) // "₦2,500,000.00"
 * formatNGN(1500, { compact: true }) // "₦1.5K"
 */
export function formatNGN(
  amount: number, 
  options: CurrencyFormatOptions = {}
): string {
  const {
    includeSymbol = true,
    decimals = CURRENCY_CONFIG.DEFAULT_DECIMALS,
    compact = false,
    showCode = false,
    locale = CURRENCY_CONFIG.NGN_LOCALE,
    style = 'currency'
  } = options;

  // Handle edge cases
  if (!isValidNumber(amount)) return formatInvalidAmount('NGN', includeSymbol, showCode);
  
  // Apply compact formatting if requested or amount is large
  if (compact || (amount >= CURRENCY_CONFIG.COMPACT_THRESHOLD && compact !== false)) {
    return formatCompactCurrency(amount, 'NGN', options);
  }

  // Determine if we should show decimals
  const shouldShowDecimals = decimals > 0 && (
    amount % 1 !== 0 || 
    amount < CURRENCY_CONFIG.WHOLE_NUMBER_THRESHOLD
  );

  const finalDecimals = shouldShowDecimals ? decimals : 0;

  try {
    if (style === 'currency' && includeSymbol && !showCode) {
      // Use Intl.NumberFormat for proper Nigerian formatting
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: finalDecimals,
        maximumFractionDigits: finalDecimals,
        currencyDisplay: 'symbol'
      });
      
      return formatter.format(amount);
    } else {
      // Custom formatting for more control
      const formatter = new Intl.NumberFormat(locale, {
        style: 'decimal',
        minimumFractionDigits: finalDecimals,
        maximumFractionDigits: finalDecimals,
        useGrouping: true // Nigerian thousands separators
      });
      
      const formatted = formatter.format(amount);
      
      if (includeSymbol) {
        const symbol = showCode ? 'NGN' : CURRENCY_CONFIG.NGN_SYMBOL;
        return `${symbol}${formatted}`;
      }
      
      return formatted;
    }
  } catch (error) {
    // Fallback formatting if Intl fails
    console.warn('Currency formatting failed, using fallback:', error);
    return fallbackFormatNGN(amount, options);
  }
}

/**
 * Convert USD amount to NGN using PRD exchange rate
 * 
 * @param usdAmount - Amount in USD to convert
 * @param options - Conversion and formatting options
 * @returns Converted amount in NGN
 * 
 * @example
 * convertUSDToNGN(100) // 150000
 * convertUSDToNGN(100, { format: { compact: true } }) // "₦150K"
 */
export function convertUSDToNGN(
  usdAmount: number,
  options: ConversionOptions = {}
): number | string {
  const {
    round = false,
    exchangeRate = CURRENCY_CONFIG.USD_TO_NGN_RATE,
    format
  } = options;

  if (!isValidNumber(usdAmount)) {
    return format ? formatInvalidAmount('NGN', true, false) : 0;
  }

  // Convert using exchange rate
  let ngnAmount = usdAmount * exchangeRate;
  
  // Round if requested
  if (round) {
    ngnAmount = Math.round(ngnAmount);
  }

  // Format if formatting options provided
  if (format) {
    return formatNGN(ngnAmount, format);
  }

  return ngnAmount;
}

/**
 * Convert NGN amount to USD using PRD exchange rate
 * 
 * @param ngnAmount - Amount in NGN to convert
 * @param options - Conversion and formatting options
 * @returns Converted amount in USD
 * 
 * @example
 * convertNGNToUSD(150000) // 100
 * convertNGNToUSD(150000, { format: { includeSymbol: true } }) // "$100.00"
 */
export function convertNGNToUSD(
  ngnAmount: number,
  options: ConversionOptions = {}
): number | string {
  const {
    round = false,
    exchangeRate = CURRENCY_CONFIG.NGN_TO_USD_RATE,
    format
  } = options;

  if (!isValidNumber(ngnAmount)) {
    return format ? formatInvalidAmount('USD', true, false) : 0;
  }

  // Convert using exchange rate
  let usdAmount = ngnAmount * exchangeRate;
  
  // Round if requested
  if (round) {
    usdAmount = Math.round(usdAmount);
  }

  // Format if formatting options provided
  if (format) {
    return formatUSD(usdAmount, format);
  }

  return usdAmount;
}

/**
 * Format large amounts in compact form for mobile displays
 * Optimized for Nigerian context and mobile screens
 * 
 * @param amount - Amount to format compactly
 * @param currency - Currency code (NGN or USD)
 * @param options - Formatting options
 * @returns Compact formatted string
 * 
 * @example
 * formatCompactCurrency(1500000, 'NGN') // "₦1.5M"
 * formatCompactCurrency(2500000, 'NGN') // "₦2.5M"
 * formatCompactCurrency(1000, 'NGN') // "₦1K"
 */
export function formatCompactCurrency(
  amount: number,
  currency: CurrencyCode = 'NGN',
  options: CurrencyFormatOptions = {}
): string {
  const {
    includeSymbol = true,
    decimals = CURRENCY_CONFIG.COMPACT_DECIMALS,
    showCode = false,
    locale = currency === 'NGN' ? CURRENCY_CONFIG.NGN_LOCALE : CURRENCY_CONFIG.USD_LOCALE
  } = options;

  if (!isValidNumber(amount)) {
    return formatInvalidAmount(currency, includeSymbol, showCode);
  }

  // Determine the appropriate unit and divisor
  const { value, unit } = getCompactUnit(amount);
  
  // Format the number with appropriate decimals
  const shouldShowDecimals = decimals > 0 && value % 1 !== 0;
  const finalDecimals = shouldShowDecimals ? decimals : 0;
  
  try {
    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: finalDecimals,
      maximumFractionDigits: finalDecimals,
      useGrouping: false // No grouping for compact format
    });
    
    const formattedValue = formatter.format(value);
    const symbol = getCurrencySymbol(currency, showCode);
    
    if (includeSymbol) {
      return `${symbol}${formattedValue}${unit}`;
    }
    
    return `${formattedValue}${unit}`;
  } catch (error) {
    console.warn('Compact currency formatting failed, using fallback:', error);
    return fallbackFormatCompact(amount, currency, options);
  }
}

/**
 * Format any currency amount with proper localization
 * 
 * @param amount - Amount to format
 * @param currency - Currency code
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'USD',
  options: CurrencyFormatOptions = {}
): string {
  // Delegate to specific formatters for NGN and USD for backward compatibility
  if (currency === 'NGN') {
    return formatNGN(amount, options);
  }
  
  if (currency === 'USD') {
    return formatUSD(amount, options);
  }

  // Generic formatter for other currencies
  const {
    includeSymbol = true,
    decimals = CURRENCY_CONFIG.DEFAULT_DECIMALS,
    compact = false,
    showCode = false,
    locale = 'en-US', // Default locale
    style = 'currency'
  } = options;

  if (!isValidNumber(amount)) return formatInvalidAmount(currency, includeSymbol, showCode);
  
  if (compact || (amount >= CURRENCY_CONFIG.COMPACT_THRESHOLD && compact !== false)) {
    return formatCompactCurrency(amount, currency, options);
  }

  const shouldShowDecimals = decimals > 0 && (
    amount % 1 !== 0 || 
    amount < CURRENCY_CONFIG.WHOLE_NUMBER_THRESHOLD
  );

  const finalDecimals = shouldShowDecimals ? decimals : 0;

  try {
    // Use Intl.NumberFormat for proper localization
    const formatter = new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: finalDecimals,
      maximumFractionDigits: finalDecimals,
      useGrouping: true
    });
    
    const formatted = formatter.format(amount);
    
    if (includeSymbol) {
      const symbol = getCurrencySymbol(currency, showCode);
      return `${symbol}${formatted}`;
    }
    
    return formatted;
  } catch (error) {
    console.warn(`Currency formatting failed for ${currency}, using fallback:`, error);
    const symbol = getCurrencySymbol(currency, showCode);
    const formatted = amount.toFixed(finalDecimals);
    return includeSymbol ? `${symbol}${formatted}` : formatted;
  }
}

/**
 * Format USD amount with proper US formatting
 * 
 * @param amount - Amount in USD to format
 * @param options - Formatting options
 * @returns Formatted USD string
 */
export function formatUSD(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    includeSymbol = true,
    decimals = CURRENCY_CONFIG.DEFAULT_DECIMALS,
    compact = false,
    showCode = false,
    locale = CURRENCY_CONFIG.USD_LOCALE,
    style = 'currency'
  } = options;

  if (!isValidNumber(amount)) return formatInvalidAmount('USD', includeSymbol, showCode);
  
  if (compact || (amount >= CURRENCY_CONFIG.COMPACT_THRESHOLD && compact !== false)) {
    return formatCompactCurrency(amount, 'USD', options);
  }

  const shouldShowDecimals = decimals > 0 && (
    amount % 1 !== 0 || 
    amount < CURRENCY_CONFIG.WHOLE_NUMBER_THRESHOLD
  );

  const finalDecimals = shouldShowDecimals ? decimals : 0;

  try {
    if (style === 'currency' && includeSymbol && !showCode) {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: finalDecimals,
        maximumFractionDigits: finalDecimals
      });
      
      return formatter.format(amount);
    } else {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'decimal',
        minimumFractionDigits: finalDecimals,
        maximumFractionDigits: finalDecimals,
        useGrouping: true
      });
      
      const formatted = formatter.format(amount);
      
      if (includeSymbol) {
        const symbol = showCode ? 'USD' : CURRENCY_CONFIG.USD_SYMBOL;
        return `${symbol}${formatted}`;
      }
      
      return formatted;
    }
  } catch (error) {
    console.warn('USD formatting failed, using fallback:', error);
    return fallbackFormatUSD(amount, options);
  }
}

// ======================================
// ADVANCED UTILITY FUNCTIONS
// ======================================

/**
 * Get comprehensive currency display information
 * Useful for components that need detailed formatting data
 */
export function getCurrencyDisplayInfo(
  amount: number,
  currency: CurrencyCode,
  options: CurrencyFormatOptions = {}
): CurrencyDisplayInfo {
  const isCompact = options.compact || amount >= CURRENCY_CONFIG.COMPACT_THRESHOLD;
  
  const formatted = currency === 'NGN' 
    ? formatNGN(amount, options)
    : formatUSD(amount, options);

  return {
    formatted,
    value: amount,
    currency,
    isCompact,
    originalAmount: amount
  };
}

/**
 * Parse formatted currency string back to number
 * Handles both NGN and USD formats
 */
export function parseCurrencyString(
  currencyString: string,
  currency: CurrencyCode = 'NGN'
): number {
  if (!currencyString || typeof currencyString !== 'string') return 0;
  
  // Remove currency symbols and codes
  let cleaned = currencyString
    .replace(/[₦$]/g, '')
    .replace(/NGN|USD/gi, '')
    .trim();
  
  // Handle compact notation
  const compactMatch = cleaned.match(/^([\d,]+\.?\d*)\s*([KMBT])$/i);
  if (compactMatch) {
    const [, numberPart, unit] = compactMatch;
    const baseNumber = parseFloat(numberPart.replace(/,/g, ''));
    
    const multipliers = { K: 1000, M: 1000000, B: 1000000000, T: 1000000000000 };
    return baseNumber * (multipliers[unit.toUpperCase() as keyof typeof multipliers] || 1);
  }
  
  // Regular number parsing
  cleaned = cleaned.replace(/,/g, ''); // Remove thousands separators
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Compare two currency amounts with proper precision handling
 */
export function compareCurrencyAmounts(
  amount1: number,
  amount2: number,
  precision: number = 2
): number {
  const factor = Math.pow(10, precision);
  const rounded1 = Math.round(amount1 * factor) / factor;
  const rounded2 = Math.round(amount2 * factor) / factor;
  
  if (rounded1 < rounded2) return -1;
  if (rounded1 > rounded2) return 1;
  return 0;
}

/**
 * Calculate percentage change between two amounts
 */
export function calculatePercentageChange(
  oldAmount: number,
  newAmount: number,
  formatOptions: CurrencyFormatOptions = {}
): string {
  if (!isValidNumber(oldAmount) || oldAmount === 0) return '0%';
  
  const percentChange = ((newAmount - oldAmount) / oldAmount) * 100;
  const formatter = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
  
  const sign = percentChange > 0 ? '+' : '';
  return `${sign}${formatter.format(percentChange)}%`;
}

// ======================================
// HELPER FUNCTIONS
// ======================================

/**
 * Validate if a number is valid for currency operations
 */
function isValidNumber(value: any): value is number {
  return typeof value === 'number' && 
         !isNaN(value) && 
         isFinite(value);
}

/**
 * Get appropriate compact unit and value for large numbers
 */
function getCompactUnit(amount: number): { value: number; unit: CompactUnit | '' } {
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 1000000000000) { // Trillion
    return { value: amount / 1000000000000, unit: 'T' };
  } else if (absAmount >= 1000000000) { // Billion
    return { value: amount / 1000000000, unit: 'B' };
  } else if (absAmount >= 1000000) { // Million
    return { value: amount / 1000000, unit: 'M' };
  } else if (absAmount >= 1000) { // Thousand
    return { value: amount / 1000, unit: 'K' };
  }
  
  return { value: amount, unit: '' };
}

/**
 * Get currency symbol or code
 */
function getCurrencySymbol(currency: CurrencyCode, showCode: boolean): string {
  if (showCode) return currency;
  
  const symbolMap: Record<CurrencyCode, string> = {
    NGN: CURRENCY_CONFIG.NGN_SYMBOL,
    USD: CURRENCY_CONFIG.USD_SYMBOL,
    SEK: CURRENCY_CONFIG.SEK_SYMBOL,
    EUR: CURRENCY_CONFIG.EUR_SYMBOL,
    GBP: CURRENCY_CONFIG.GBP_SYMBOL,
    CAD: CURRENCY_CONFIG.CAD_SYMBOL,
    AUD: CURRENCY_CONFIG.AUD_SYMBOL,
    CHF: CURRENCY_CONFIG.CHF_SYMBOL,
    NOK: CURRENCY_CONFIG.NOK_SYMBOL,
    DKK: CURRENCY_CONFIG.DKK_SYMBOL,
    JPY: CURRENCY_CONFIG.JPY_SYMBOL,
    SGD: CURRENCY_CONFIG.SGD_SYMBOL,
    NZD: CURRENCY_CONFIG.NZD_SYMBOL,
    HKD: CURRENCY_CONFIG.HKD_SYMBOL
  };
  
  return symbolMap[currency] || currency;
}

/**
 * Format invalid amount placeholder
 */
function formatInvalidAmount(currency: CurrencyCode, includeSymbol: boolean, showCode: boolean): string {
  if (!includeSymbol) return '0';
  const symbol = getCurrencySymbol(currency, showCode);
  return `${symbol}0`;
}

// ======================================
// FALLBACK FORMATTERS (for older browsers)
// ======================================

/**
 * Fallback NGN formatter for browsers without full Intl support
 */
function fallbackFormatNGN(amount: number, options: CurrencyFormatOptions): string {
  const { includeSymbol = true, decimals = 2, showCode = false } = options;
  
  const formatted = amount.toLocaleString('en', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  if (includeSymbol) {
    const symbol = showCode ? 'NGN' : CURRENCY_CONFIG.NGN_SYMBOL;
    return `${symbol}${formatted}`;
  }
  
  return formatted;
}

/**
 * Fallback USD formatter
 */
function fallbackFormatUSD(amount: number, options: CurrencyFormatOptions): string {
  const { includeSymbol = true, decimals = 2, showCode = false } = options;
  
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  if (includeSymbol) {
    const symbol = showCode ? 'USD' : CURRENCY_CONFIG.USD_SYMBOL;
    return `${symbol}${formatted}`;
  }
  
  return formatted;
}

/**
 * Fallback compact formatter
 */
function fallbackFormatCompact(
  amount: number, 
  currency: CurrencyCode, 
  options: CurrencyFormatOptions
): string {
  const { value, unit } = getCompactUnit(amount);
  const { includeSymbol = true, decimals = 1, showCode = false } = options;
  
  const formatted = value.toFixed(decimals);
  const symbol = getCurrencySymbol(currency, showCode);
  
  if (includeSymbol) {
    return `${symbol}${formatted}${unit}`;
  }
  
  return `${formatted}${unit}`;
}

// ======================================
// EXPORT ALL UTILITIES
// ======================================

export default {
  // Main formatting functions
  formatNGN,
  formatUSD,
  formatCompactCurrency,
  
  // Conversion functions
  convertUSDToNGN,
  convertNGNToUSD,
  
  // Utility functions
  getCurrencyDisplayInfo,
  parseCurrencyString,
  compareCurrencyAmounts,
  calculatePercentageChange,
  
  // Constants
  CURRENCY_CONFIG,
  
  // Helper functions
  isValidNumber
};