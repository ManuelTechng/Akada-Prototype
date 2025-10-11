import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ExchangeRates {
  [key: string]: {
    rate: number;
    symbol: string;
    format: (amount: number) => string;
  };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const EXCHANGE_RATES: ExchangeRates = {
  USD: {
    rate: 1,
    symbol: '$',
    format: (amount) => `$${amount.toLocaleString('en-US')}`
  },
  NGN: {
    rate: 850, // Updated to realistic 2025 rate (1 USD = 850 NGN)
    symbol: '₦',
    format: (amount) => `₦${amount.toLocaleString('en-NG')}`
  },
  GBP: {
    rate: 0.78, // Updated rate
    symbol: '£',
    format: (amount) => `£${amount.toLocaleString('en-GB')}`
  },
  EUR: {
    rate: 0.94, // Updated rate  
    symbol: '€',
    format: (amount) => `€${amount.toLocaleString('en-US')}`
  },
  CAD: {
    rate: 1.38, // Updated rate
    symbol: 'C$',
    format: (amount) => `C$${amount.toLocaleString('en-CA')}`
  },
  AUD: {
    rate: 1.55, // Updated rate
    symbol: 'A$',
    format: (amount) => `A$${amount.toLocaleString('en-AU')}`
  },
  CHF: {
    rate: 0.92, // Swiss Franc rate
    symbol: 'CHF',
    format: (amount) => `CHF ${amount.toLocaleString('en-US')}`
  },
  SEK: {
    rate: 11.25, // Swedish Krona rate (1 USD = 11.25 SEK approx)
    symbol: 'kr',
    format: (amount) => `${amount.toLocaleString('sv-SE')} kr`
  },
  NOK: {
    rate: 11.85, // Norwegian Krone rate (1 USD = 11.85 NOK approx)
    symbol: 'kr',
    format: (amount) => `${amount.toLocaleString('nb-NO')} kr`
  },
  DKK: {
    rate: 7.02, // Danish Krone rate (1 USD = 7.02 DKK approx)
    symbol: 'kr',
    format: (amount) => `${amount.toLocaleString('da-DK')} kr`
  },
  JPY: {
    rate: 154.50, // Japanese Yen rate (1 USD = 154.50 JPY approx)
    symbol: '¥',
    format: (amount) => `¥${amount.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}`
  },
  SGD: {
    rate: 1.36, // Singapore Dollar rate (1 USD = 1.36 SGD approx)
    symbol: 'S$',
    format: (amount) => `S$${amount.toLocaleString('en-SG')}`
  },
  NZD: {
    rate: 1.73, // New Zealand Dollar rate (1 USD = 1.73 NZD approx)
    symbol: 'NZ$',
    format: (amount) => `NZ$${amount.toLocaleString('en-NZ')}`
  },
  HKD: {
    rate: 7.78, // Hong Kong Dollar rate (1 USD = 7.78 HKD approx)
    symbol: 'HK$',
    format: (amount) => `HK$${amount.toLocaleString('en-HK')}`
  }
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  const fromRate = EXCHANGE_RATES[fromCurrency]?.rate || 1;
  const toRate = EXCHANGE_RATES[toCurrency]?.rate || 1;
  return Math.round((amount / fromRate) * toRate);
};

export const formatCurrency = (amount: number, currency: string): string => {
  const formatter = EXCHANGE_RATES[currency]?.format;
  if (!formatter) {
    return `${amount}`;
  }
  return formatter(amount);
};

export const getCountryCurrency = (country: string): string => {
  const currencyMap: { [key: string]: string } = {
    'USA': 'USD',
    'United States': 'USD',
    'UK': 'GBP',
    'United Kingdom': 'GBP',
    'Canada': 'CAD',
    'Australia': 'AUD',
    'Germany': 'EUR',
    'France': 'EUR',
    'Ireland': 'EUR',
    'Netherlands': 'EUR',
    'Sweden': 'SEK',
    'Switzerland': 'CHF',
    'Norway': 'NOK',
    'Denmark': 'DKK',
    'Japan': 'JPY',
    'Singapore': 'SGD',
    'New Zealand': 'NZD',
    'Hong Kong': 'HKD',
    'Nigeria': 'NGN'
  };
  return currencyMap[country] || 'USD';
};

/**
 * Smart currency display for program cards with real-time rates
 * Nigerian schools: Show only Naira
 * International schools: Show original currency + NGN conversion
 * 
 * @deprecated Use formatProgramTuitionAsync for real-time rates
 */
export const formatProgramTuition = (
  amount: number, 
  country: string, 
  showConversion: boolean = true
): { primary: string; secondary?: string; isNigerian: boolean } => {
  const isNigerian = country === 'Nigeria';
  const originalCurrency = getCountryCurrency(country);
  
  if (isNigerian) {
    return {
      primary: formatCurrency(amount, 'NGN'),
      isNigerian: true
    };
  }
  
  // For international schools - fallback to static rates
  const primaryDisplay = formatCurrency(amount, originalCurrency);
  
  if (showConversion) {
    const ngnAmount = convertCurrency(amount, originalCurrency, 'NGN');
    const secondaryDisplay = `~${formatCurrency(ngnAmount, 'NGN')}`;
    
    return {
      primary: primaryDisplay,
      secondary: secondaryDisplay,
      isNigerian: false
    };
  }
  
  return {
    primary: primaryDisplay,
    isNigerian: false
  };
};

/**
 * Modern async currency display for program cards with real-time API rates
 * Uses the new multicurrency system with fallback support
 */
export const formatProgramTuitionAsync = async (
  amount: number, 
  country: string, 
  showConversion: boolean = true
): Promise<{ primary: string; secondary?: string; isNigerian: boolean; isRealTime: boolean }> => {
  const isNigerian = country === 'Nigeria';
  const originalCurrency = getCountryCurrency(country);
  
  // Import currency utilities dynamically to avoid circular dependencies
  const { formatCurrencyWithAPI, convertCurrencyWithAPI } = await import('./currency/utils');
  
  if (isNigerian) {
    return {
      primary: await formatCurrencyWithAPI(amount, 'NGN'),
      isNigerian: true,
      isRealTime: true
    };
  }
  
  try {
    // For international schools - use real-time rates
    const primaryDisplay = await formatCurrencyWithAPI(amount, originalCurrency);
    
    if (showConversion) {
      const ngnAmount = await convertCurrencyWithAPI(amount, originalCurrency, 'NGN', false) as number;
      const secondaryDisplay = `~${await formatCurrencyWithAPI(ngnAmount, 'NGN')}`;
      
      return {
        primary: primaryDisplay,
        secondary: secondaryDisplay,
        isNigerian: false,
        isRealTime: true
      };
    }
    
    return {
      primary: primaryDisplay,
      isNigerian: false,
      isRealTime: true
    };
  } catch (error) {
    console.warn('Real-time currency conversion failed, falling back to static rates:', error);
    
    // Fallback to static rates on error
    const fallbackResult = formatProgramTuition(amount, country, showConversion);
    return {
      ...fallbackResult,
      isRealTime: false
    };
  }
};

/**
 * Format currency in a compact way for smaller displays
 */
export const formatCompactCurrency = (amount: number, currency: string): string => {
  const formatter = EXCHANGE_RATES[currency];
  if (!formatter) return `${amount}`;
  
  if (amount >= 1000000) {
    return `${formatter.symbol}${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${formatter.symbol}${(amount / 1000).toFixed(0)}K`;
  }
  
  return formatter.format(amount);
};