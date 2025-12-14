// React hook for program tuition formatting with real-time currency conversion
import { useState, useEffect, useCallback } from 'react';
import { formatProgramTuitionAsync, formatProgramTuition } from '../lib/utils';
import { CurrencyErrorBoundary } from '../components/currency/ErrorBoundary';
import { FallbackCurrencyDisplay } from '../components/currency/FallbackDisplay';

interface TuitionDisplay {
  primary: string;
  secondary?: string;
  isNigerian: boolean;
  isRealTime: boolean;
  isLoading: boolean;
  error: Error | null;
  hasError: boolean;
}

interface UseProgramTuitionOptions {
  showConversion?: boolean;
  enableRealTime?: boolean;
  cacheTime?: number; // Cache time in milliseconds
}

/**
 * Hook for formatting program tuition with real-time currency conversion
 */
export function useProgramTuition(
  amount: number,
  country: string,
  options: UseProgramTuitionOptions = {}
): TuitionDisplay {
  const {
    showConversion = true,
    enableRealTime = true, // ✅ API enabled by default
    cacheTime = 300000 // 5 minutes default cache
  } = options;

  const [display, setDisplay] = useState<TuitionDisplay>({
    primary: '',
    secondary: undefined,
    isNigerian: false,
    isRealTime: false,
    isLoading: true,
    error: null,
    hasError: false
  });

  // Cache key for this specific request
  const cacheKey = `tuition_${amount}_${country}_${showConversion}`;

  const formatTuition = useCallback(async () => {
    if (!amount || amount <= 0) {
      setDisplay({
        primary: 'Fee not specified',
        isNigerian: false,
        isRealTime: false,
        isLoading: false,
        error: null,
        hasError: false
      });
      return;
    }

    // Check cache first
    if (cacheTime > 0) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          
          if (age < cacheTime) {
            setDisplay({
              ...data,
              isLoading: false
            });
            return;
          }
        }
      } catch (error) {
        console.warn('Cache read failed:', error);
      }
    }

    setDisplay(prev => ({ ...prev, isLoading: true, error: null, hasError: false }));

    try {
      if (enableRealTime) {
        // Try real-time API first
        const result = await formatProgramTuitionAsync(amount, country, showConversion);
        
        const newDisplay: TuitionDisplay = {
          primary: result.primary,
          secondary: result.secondary,
          isNigerian: result.isNigerian,
          isRealTime: result.isRealTime,
          isLoading: false,
          error: null,
          hasError: false
        };

        setDisplay(newDisplay);

        // Cache the result
        if (cacheTime > 0 && result.isRealTime) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify({
              data: newDisplay,
              timestamp: Date.now()
            }));
          } catch (error) {
            console.warn('Cache write failed:', error);
          }
        }
      } else {
        // Use static rates only
        const result = formatProgramTuition(amount, country, showConversion);
        
        setDisplay({
          primary: result.primary,
          secondary: result.secondary,
          isNigerian: result.isNigerian,
          isRealTime: false,
          isLoading: false,
          error: null,
          hasError: false
        });
      }
    } catch (error) {
      console.error('Tuition formatting failed:', error);
      
      // Fallback to static rates
      try {
        const fallbackResult = formatProgramTuition(amount, country, showConversion);
        
        setDisplay({
          primary: fallbackResult.primary,
          secondary: fallbackResult.secondary,
          isNigerian: fallbackResult.isNigerian,
          isRealTime: false,
          isLoading: false,
          error: error as Error,
          hasError: true
        });
      } catch (fallbackError) {
        // Ultimate fallback
        setDisplay({
          primary: `${amount} (${country})`,
          isNigerian: country === 'Nigeria',
          isRealTime: false,
          isLoading: false,
          error: fallbackError as Error,
          hasError: true
        });
      }
    }
  }, [amount, country, showConversion, enableRealTime, cacheKey, cacheTime]);

  // Initial load
  useEffect(() => {
    formatTuition();
  }, [formatTuition]);

  return display;
}

/**
 * Hook for batch formatting multiple program tuitions
 */
export function useBatchProgramTuition(
  programs: Array<{ amount: number; country: string; id: string }>,
  options: UseProgramTuitionOptions = {}
): Record<string, TuitionDisplay> {
  const [displays, setDisplays] = useState<Record<string, TuitionDisplay>>({});

  useEffect(() => {
    const formatAll = async () => {
      const results: Record<string, TuitionDisplay> = {};
      
      // Process in batches to avoid overwhelming the API
      const batchSize = 5;
      for (let i = 0; i < programs.length; i += batchSize) {
        const batch = programs.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (program) => {
          try {
            if (options.enableRealTime !== false) {
              const result = await formatProgramTuitionAsync(program.amount, program.country, options.showConversion);
              return {
                id: program.id,
                display: {
                  primary: result.primary,
                  secondary: result.secondary,
                  isNigerian: result.isNigerian,
                  isRealTime: result.isRealTime,
                  isLoading: false,
                  error: null,
                  hasError: false
                }
              };
            } else {
              const result = formatProgramTuition(program.amount, program.country, options.showConversion);
              return {
                id: program.id,
                display: {
                  primary: result.primary,
                  secondary: result.secondary,
                  isNigerian: result.isNigerian,
                  isRealTime: false,
                  isLoading: false,
                  error: null,
                  hasError: false
                }
              };
            }
          } catch (error) {
            // Fallback for individual program
            const fallback = formatProgramTuition(program.amount, program.country, options.showConversion);
            return {
              id: program.id,
              display: {
                primary: fallback.primary,
                secondary: fallback.secondary,
                isNigerian: fallback.isNigerian,
                isRealTime: false,
                isLoading: false,
                error: error as Error,
                hasError: true
              }
            };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        
        batchResults.forEach(({ id, display }) => {
          results[id] = display;
        });

        // Update state with batch results
        setDisplays(prev => ({ ...prev, ...results }));
        
        // Small delay between batches to be gentle on the API
        if (i + batchSize < programs.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    };

    if (programs.length > 0) {
      formatAll();
    }
  }, [programs, options]);

  return displays;
}

/**
 * Simplified hook that returns a formatted string directly
 */
export function useProgramTuitionString(
  amount: number,
  country: string,
  options: UseProgramTuitionOptions = {}
): string {
  const display = useProgramTuition(amount, country, options);
  
  if (display.isLoading) {
    return 'Loading...';
  }
  
  if (display.hasError) {
    return display.primary || 'Error loading fee';
  }
  
  if (display.secondary) {
    return `${display.primary} (${display.secondary})`;
  }
  
  return display.primary;
}

export default {
  useProgramTuition,
  useBatchProgramTuition,
  useProgramTuitionString
};