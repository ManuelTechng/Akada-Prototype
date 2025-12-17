// Fallback currency display components for when API fails
import React, { useMemo } from 'react';
import { FallbackRateProvider } from '../../lib/currency/errors';
import { formatCurrency } from '../../lib/currency/formatters';
import { isValidCurrency } from '../../lib/currency/config';

interface FallbackCurrencyProps {
  amount: number;
  fromCurrency: string;
  toCurrency?: string;
  showFallbackNotice?: boolean;
  className?: string;
}

/**
 * Currency display using static fallback rates
 */
export function FallbackCurrencyDisplay({
  amount,
  fromCurrency,
  toCurrency,
  showFallbackNotice = true,
  className = ''
}: FallbackCurrencyProps) {
  const conversion = useMemo(() => {
    if (!isValidCurrency(fromCurrency)) {
      return null;
    }

    // If no target currency, just format the original amount
    if (!toCurrency || toCurrency === fromCurrency) {
      return {
        amount,
        currency: fromCurrency,
        formatted: formatCurrency(amount, fromCurrency),
        isConverted: false
      };
    }

    if (!isValidCurrency(toCurrency)) {
      return null;
    }

    // Try to get fallback rate
    const rate = FallbackRateProvider.getRate(fromCurrency, toCurrency);
    if (!rate) {
      return {
        amount,
        currency: fromCurrency,
        formatted: formatCurrency(amount, fromCurrency),
        isConverted: false,
        error: `No fallback rate available for ${fromCurrency}/${toCurrency}`
      };
    }

    const convertedAmount = amount * rate;
    return {
      amount: convertedAmount,
      currency: toCurrency,
      formatted: formatCurrency(convertedAmount, toCurrency),
      isConverted: true,
      rate,
      originalAmount: amount,
      originalCurrency: fromCurrency
    };
  }, [amount, fromCurrency, toCurrency]);

  if (!conversion) {
    return (
      <span className={`text-gray-500 ${className}`}>
        Invalid currency
      </span>
    );
  }

  if (conversion.error) {
    return (
      <span className={`text-gray-500 ${className}`} title={conversion.error}>
        {formatCurrency(amount, fromCurrency)}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-1 ${className}`}>
      <span>
        {conversion.formatted}
      </span>
      
      {conversion.isConverted && showFallbackNotice && (
        <span 
          className="text-xs text-yellow-600 bg-yellow-100 px-1 rounded"
          title={`Approximate rate: 1 ${conversion.originalCurrency} = ${conversion.rate} ${conversion.currency}`}
        >
          ~
        </span>
      )}
    </div>
  );
}

interface MultiFallbackProps {
  amount: number;
  baseCurrency: string;
  targetCurrencies: string[];
  maxDisplay?: number;
  layout?: 'horizontal' | 'vertical';
  showNotice?: boolean;
  className?: string;
}

/**
 * Multi-currency display using fallback rates
 */
export function MultiFallbackDisplay({
  amount,
  baseCurrency,
  targetCurrencies,
  maxDisplay = 3,
  layout = 'horizontal',
  showNotice = true,
  className = ''
}: MultiFallbackProps) {
  const conversions = useMemo(() => {
    if (!isValidCurrency(baseCurrency)) {
      return [];
    }

    const results = [];
    
    // Add base currency
    results.push({
      currency: baseCurrency,
      amount,
      formatted: formatCurrency(amount, baseCurrency),
      isBase: true
    });

    // Add conversions for target currencies
    for (const targetCurrency of targetCurrencies.slice(0, maxDisplay - 1)) {
      if (!isValidCurrency(targetCurrency) || targetCurrency === baseCurrency) {
        continue;
      }

      const rate = FallbackRateProvider.getRate(baseCurrency, targetCurrency);
      if (rate) {
        const convertedAmount = amount * rate;
        results.push({
          currency: targetCurrency,
          amount: convertedAmount,
          formatted: formatCurrency(convertedAmount, targetCurrency),
          isBase: false,
          rate
        });
      }
    }

    return results;
  }, [amount, baseCurrency, targetCurrencies, maxDisplay]);

  if (conversions.length === 0) {
    return (
      <div className={`text-gray-500 ${className}`}>
        Invalid currency configuration
      </div>
    );
  }

  const containerClass = layout === 'vertical' 
    ? 'flex flex-col space-y-1' 
    : 'flex flex-wrap items-center space-x-2';

  return (
    <div className={`${containerClass} ${className}`}>
      {conversions.map((conversion, index) => (
        <div key={conversion.currency} className="flex items-center space-x-1">
          <span className={conversion.isBase ? 'font-medium' : ''}>
            {conversion.formatted}
          </span>
          
          {index < conversions.length - 1 && layout === 'horizontal' && (
            <span className="text-gray-400">•</span>
          )}
        </div>
      ))}
      
      {showNotice && conversions.some(c => !c.isBase) && (
        <span 
          className="text-xs text-yellow-600 bg-yellow-100 px-1 rounded ml-2"
          title="Using approximate exchange rates"
        >
          Approx.
        </span>
      )}
    </div>
  );
}

interface OfflineNoticeProps {
  className?: string;
}

/**
 * Notice component for offline/fallback mode
 */
export function OfflineRatesNotice({ className = '' }: OfflineNoticeProps) {
  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-md p-3 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Using Offline Rates
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Currency rates are currently unavailable. Showing approximate values based on recent averages.
              Rates will update automatically when the service is restored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FallbackProviderProps {
  children: React.ReactNode;
  showGlobalNotice?: boolean;
}

/**
 * Provider that adds fallback context to children
 */
export function FallbackProvider({ children, showGlobalNotice = false }: FallbackProviderProps) {
  return (
    <div className="currency-fallback-provider">
      {showGlobalNotice && (
        <OfflineRatesNotice className="mb-4" />
      )}
      {children}
    </div>
  );
}

/**
 * Hook to check if fallback rates are available for currency pair
 */
export function useFallbackAvailable(fromCurrency: string, toCurrency: string): boolean {
  return useMemo(() => {
    if (!fromCurrency || !toCurrency) return false;
    if (fromCurrency === toCurrency) return true;
    return FallbackRateProvider.hasRate(fromCurrency, toCurrency);
  }, [fromCurrency, toCurrency]);
}

/**
 * Get list of currencies with fallback support
 */
export function getSupportedFallbackCurrencies(): string[] {
  return FallbackRateProvider.getSupportedCurrencies();
}

export default {
  FallbackCurrencyDisplay,
  MultiFallbackDisplay,
  OfflineRatesNotice,
  FallbackProvider,
  useFallbackAvailable,
  getSupportedFallbackCurrencies
};