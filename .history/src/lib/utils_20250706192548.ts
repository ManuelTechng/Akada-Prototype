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
    rate: 1500,
    symbol: '₦',
    format: (amount) => `₦${amount.toLocaleString('en-NG')}`
  },
  GBP: {
    rate: 0.79,
    symbol: '£',
    format: (amount) => `£${amount.toLocaleString('en-GB')}`
  },
  EUR: {
    rate: 0.92,
    symbol: '€',
    format: (amount) => `€${amount.toLocaleString('de-DE')}`
  },
  CAD: {
    rate: 1.35,
    symbol: 'C$',
    format: (amount) => `C$${amount.toLocaleString('en-CA')}`
  },
  AUD: {
    rate: 1.52,
    symbol: 'A$',
    format: (amount) => `A$${amount.toLocaleString('en-AU')}`
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
    'Sweden': 'EUR',
    'Nigeria': 'NGN'
  };
  return currencyMap[country] || 'USD';
};