// React hooks for currency functionality in Akada
import { useState, useEffect, useCallback, useRef } from 'react';
import { currencyService } from './CurrencyService';
import type { 
  ExchangeRate, 
  CurrencyConversion, 
  UserCurrencyPreferences,
  CurrencyEvent,
  CurrencyDisplayInfo
} from './types';
import { getCurrencyConfig, isValidCurrency } from './config';
import { formatCurrency, formatMultiCurrency } from './formatters';

/**
 * Main currency hook for basic currency operations
 */
export function useCurrency() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventListenerRef = useRef<((event: CurrencyEvent) => void) | null>(null);

  // Set up event listener for currency service events
  useEffect(() => {
    const listener = (event: CurrencyEvent) => {
      if (event.type === 'api_error') {
        setError(event.error?.message || 'Currency API error');
      } else if (event.type === 'rate_updated') {
        setError(null); // Clear error on successful update
      }
    };

    eventListenerRef.current = listener;
    currencyService.addEventListener(listener);

    return () => {
      if (eventListenerRef.current) {
        currencyService.removeEventListener(eventListenerRef.current);
      }
    };
  }, []);

  const getExchangeRate = useCallback(async (from: string, to: string): Promise<ExchangeRate | null> => {
    try {
      setLoading(true);
      setError(null);
      const rate = await currencyService.getExchangeRate(from, to);
      return rate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get exchange rate';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const convertAmount = useCallback(async (
    amount: number, 
    from: string, 
    to: string
  ): Promise<CurrencyConversion | null> => {
    try {
      setLoading(true);
      setError(null);
      const conversion = await currencyService.convertAmount(amount, from, to);
      return conversion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to convert amount';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const convertToMultiple = useCallback(async (
    amount: number,
    from: string,
    targets: string[]
  ): Promise<Record<string, CurrencyConversion>> => {
    try {
      setLoading(true);
      setError(null);
      const conversions = await currencyService.convertToMultiple(amount, from, targets);
      return conversions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to convert to multiple currencies';
      setError(errorMessage);
      return {};
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCache = useCallback(() => {
    currencyService.clearCache();
  }, []);

  const getApiQuota = useCallback(() => {
    return currencyService.getAPIQuota();
  }, []);

  return {
    loading,
    error,
    getExchangeRate,
    convertAmount,
    convertToMultiple,
    clearCache,
    getApiQuota,
    // Utility functions
    format: formatCurrency,
    isValidCurrency
  };
}

/**
 * Hook for single currency conversion with caching
 */
export function useCurrencyConversion(
  amount: number,
  from: string,
  to: string,
  options: { autoUpdate?: boolean; updateInterval?: number } = {}
) {
  const { autoUpdate = false, updateInterval = 300000 } = options; // 5 minutes default
  const [conversion, setConversion] = useState<CurrencyConversion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const performConversion = useCallback(async () => {
    if (!amount || amount <= 0 || !isValidCurrency(from) || !isValidCurrency(to)) {
      return;
    }

    if (from === to) {
      setConversion({
        amount,
        fromCurrency: from,
        toCurrency: to,
        convertedAmount: amount,
        exchangeRate: 1,
        timestamp: new Date()
      });
      setLastUpdated(new Date());
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await currencyService.convertAmount(amount, from, to);
      setConversion(result);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Conversion failed';
      setError(errorMessage);
      setConversion(null);
    } finally {
      setLoading(false);
    }
  }, [amount, from, to]);

  // Initial conversion
  useEffect(() => {
    performConversion();
  }, [performConversion]);

  // Auto-update interval
  useEffect(() => {
    if (!autoUpdate) return;

    const interval = setInterval(() => {
      performConversion();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [autoUpdate, updateInterval, performConversion]);

  const refresh = useCallback(() => {
    performConversion();
  }, [performConversion]);

  const formattedAmount = conversion ? formatCurrency(conversion.convertedAmount, to) : null;

  return {
    conversion,
    formattedAmount,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

/**
 * Hook for multi-currency display
 */
export function useMultiCurrency(
  amount: number,
  baseCurrency: string,
  targetCurrencies: string[],
  options: {
    maxDisplay?: number;
    autoUpdate?: boolean;
    updateInterval?: number;
  } = {}
) {
  const { maxDisplay = 4, autoUpdate = false, updateInterval = 300000 } = options;
  const [currencies, setCurrencies] = useState<CurrencyDisplayInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const updateCurrencies = useCallback(async () => {
    if (!amount || amount <= 0 || !isValidCurrency(baseCurrency)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await formatMultiCurrency(
        amount,
        baseCurrency,
        targetCurrencies.slice(0, maxDisplay),
        { showBaseCurrency: true }
      );
      setCurrencies(results);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Multi-currency update failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [amount, baseCurrency, targetCurrencies, maxDisplay]);

  // Initial load
  useEffect(() => {
    updateCurrencies();
  }, [updateCurrencies]);

  // Auto-update
  useEffect(() => {
    if (!autoUpdate) return;

    const interval = setInterval(() => {
      updateCurrencies();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [autoUpdate, updateInterval, updateCurrencies]);

  const refresh = useCallback(() => {
    updateCurrencies();
  }, [updateCurrencies]);

  return {
    currencies,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

/**
 * Hook for managing user currency preferences
 */
export function useCurrencyPreferences(userId?: string) {
  const [preferences, setPreferences] = useState<UserCurrencyPreferences>({
    primary: 'NGN',
    secondary: 'USD',
    display: ['NGN', 'USD'],
    autoDetect: true,
    compactThreshold: 100000
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load preferences from localStorage or API
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);
        
        // Try localStorage first
        const stored = localStorage.getItem(`currency_preferences_${userId || 'default'}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setPreferences(parsed);
        } else if (userId) {
          // TODO: Load from user profile API
          // const userPrefs = await loadUserPreferencesFromAPI(userId);
          // setPreferences(userPrefs);
        }
      } catch (err) {
        console.warn('Failed to load currency preferences:', err);
        setError('Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [userId]);

  const updatePreferences = useCallback(async (updates: Partial<UserCurrencyPreferences>) => {
    try {
      setLoading(true);
      setError(null);
      
      const newPreferences = { ...preferences, ...updates };
      setPreferences(newPreferences);
      
      // Save to localStorage
      localStorage.setItem(
        `currency_preferences_${userId || 'default'}`,
        JSON.stringify(newPreferences)
      );
      
      // TODO: Save to user profile API if userId exists
      // if (userId) {
      //   await saveUserPreferencesToAPI(userId, newPreferences);
      // }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [preferences, userId]);

  const resetToDefaults = useCallback(() => {
    const defaults: UserCurrencyPreferences = {
      primary: 'NGN',
      secondary: 'USD',
      display: ['NGN', 'USD'],
      autoDetect: true,
      compactThreshold: 100000
    };
    updatePreferences(defaults);
  }, [updatePreferences]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    resetToDefaults
  };
}

/**
 * Hook for currency rate monitoring and alerts
 */
export function useCurrencyMonitor(
  pairs: Array<{ from: string; to: string }>,
  thresholds?: Array<{ pair: string; threshold: number; direction: 'above' | 'below' }>
) {
  const [rates, setRates] = useState<Record<string, ExchangeRate>>({});
  const [alerts, setAlerts] = useState<Array<{ pair: string; message: string; timestamp: Date }>>([]);
  const [loading, setLoading] = useState(false);

  const checkRates = useCallback(async () => {
    setLoading(true);
    const newRates: Record<string, ExchangeRate> = {};
    
    try {
      for (const pair of pairs) {
        const rate = await currencyService.getExchangeRate(pair.from, pair.to);
        const pairKey = `${pair.from}/${pair.to}`;
        newRates[pairKey] = rate;
        
        // Check thresholds
        if (thresholds) {
          const threshold = thresholds.find(t => t.pair === pairKey);
          if (threshold) {
            const shouldAlert = 
              (threshold.direction === 'above' && rate.rate > threshold.threshold) ||
              (threshold.direction === 'below' && rate.rate < threshold.threshold);
              
            if (shouldAlert) {
              setAlerts(prev => [...prev, {
                pair: pairKey,
                message: `Rate ${rate.rate.toFixed(4)} is ${threshold.direction} threshold ${threshold.threshold}`,
                timestamp: new Date()
              }]);
            }
          }
        }
      }
      
      setRates(newRates);
    } catch (err) {
      console.error('Rate monitoring failed:', err);
    } finally {
      setLoading(false);
    }
  }, [pairs, thresholds]);

  useEffect(() => {
    checkRates();
    
    // Check every 5 minutes
    const interval = setInterval(checkRates, 300000);
    return () => clearInterval(interval);
  }, [checkRates]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    rates,
    alerts,
    loading,
    refresh: checkRates,
    clearAlerts
  };
}

export default {
  useCurrency,
  useCurrencyConversion,
  useMultiCurrency,
  useCurrencyPreferences,
  useCurrencyMonitor
};