// React hook for handling currency errors gracefully
import { useState, useCallback, useEffect } from 'react';
import { CurrencyError, CurrencyErrorType, FallbackRateProvider } from '../lib/currency/errors';
import { currencyService } from '../lib/currency/CurrencyService';

interface ErrorState {
  hasError: boolean;
  error: CurrencyError | null;
  isRetrying: boolean;
  retryCount: number;
  fallbackAvailable: boolean;
}

interface ErrorHandlerOptions {
  maxRetries?: number;
  retryDelay?: number;
  enableFallback?: boolean;
  onError?: (error: CurrencyError) => void;
  onFallback?: (fromCurrency: string, toCurrency: string) => void;
}

/**
 * Hook for handling currency errors with automatic retry and fallback
 */
export function useCurrencyErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    enableFallback = true,
    onError,
    onFallback
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    isRetrying: false,
    retryCount: 0,
    fallbackAvailable: false
  });

  const checkFallbackAvailability = useCallback((fromCurrency?: string, toCurrency?: string) => {
    if (!fromCurrency || !toCurrency || !enableFallback) {
      return false;
    }
    return FallbackRateProvider.hasRate(fromCurrency, toCurrency);
  }, [enableFallback]);

  const handleError = useCallback(async (
    error: Error,
    operation: () => Promise<any>,
    context?: { fromCurrency?: string; toCurrency?: string }
  ) => {
    const currencyError = error instanceof CurrencyError 
      ? error 
      : new CurrencyError(CurrencyErrorType.SERVICE_ERROR, error.message);

    const fallbackAvailable = checkFallbackAvailability(context?.fromCurrency, context?.toCurrency);

    setErrorState(prev => ({
      hasError: true,
      error: currencyError,
      isRetrying: false,
      retryCount: prev.retryCount,
      fallbackAvailable
    }));

    onError?.(currencyError);

    // Auto-retry for retryable errors
    if (currencyError.retryable && errorState.retryCount < maxRetries) {
      setTimeout(async () => {
        setErrorState(prev => ({
          ...prev,
          isRetrying: true,
          retryCount: prev.retryCount + 1
        }));

        try {
          await operation();
          clearError();
        } catch (retryError) {
          setErrorState(prev => ({
            ...prev,
            isRetrying: false,
            error: retryError instanceof CurrencyError 
              ? retryError 
              : new CurrencyError(CurrencyErrorType.SERVICE_ERROR, (retryError as Error).message)
          }));
        }
      }, retryDelay * Math.pow(2, errorState.retryCount)); // Exponential backoff
    }
  }, [errorState.retryCount, maxRetries, retryDelay, onError, checkFallbackAvailability]);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      isRetrying: false,
      retryCount: 0,
      fallbackAvailable: false
    });
  }, []);

  const manualRetry = useCallback(async (operation: () => Promise<any>) => {
    if (!errorState.error?.retryable || errorState.retryCount >= maxRetries) {
      return;
    }

    setErrorState(prev => ({
      ...prev,
      isRetrying: true
    }));

    try {
      await operation();
      clearError();
    } catch (error) {
      setErrorState(prev => ({
        ...prev,
        isRetrying: false,
        error: error instanceof CurrencyError 
          ? error 
          : new CurrencyError(CurrencyErrorType.SERVICE_ERROR, (error as Error).message)
      }));
    }
  }, [errorState.error, errorState.retryCount, maxRetries, clearError]);

  const useFallback = useCallback(async (fromCurrency: string, toCurrency: string) => {
    if (!enableFallback || !FallbackRateProvider.hasRate(fromCurrency, toCurrency)) {
      return null;
    }

    onFallback?.(fromCurrency, toCurrency);
    return FallbackRateProvider.getRate(fromCurrency, toCurrency);
  }, [enableFallback, onFallback]);

  // Listen for global currency service errors
  useEffect(() => {
    const handleServiceError = (event: any) => {
      if (event.type === 'api_error') {
        setErrorState(prev => ({
          hasError: true,
          error: event.error,
          isRetrying: false,
          retryCount: 0,
          fallbackAvailable: false
        }));
      }
    };

    currencyService.addEventListener(handleServiceError);
    return () => currencyService.removeEventListener(handleServiceError);
  }, []);

  return {
    // Error state
    hasError: errorState.hasError,
    error: errorState.error,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    canRetry: errorState.error?.retryable && errorState.retryCount < maxRetries,
    fallbackAvailable: errorState.fallbackAvailable,

    // Error handling methods
    handleError,
    clearError,
    manualRetry,
    useFallback,
    checkFallbackAvailability,

    // Helper methods
    getErrorMessage: () => errorState.error?.message || 'Unknown error',
    getErrorType: () => errorState.error?.type || CurrencyErrorType.SERVICE_ERROR,
    shouldShowFallbackOption: () => enableFallback && errorState.fallbackAvailable
  };
}

/**
 * Hook for wrapping currency operations with error handling
 */
export function useResilientCurrencyOperation<T>(options: ErrorHandlerOptions = {}) {
  const errorHandler = useCurrencyErrorHandler(options);

  const executeOperation = useCallback(async (
    operation: () => Promise<T>,
    context?: { fromCurrency?: string; toCurrency?: string }
  ): Promise<T | null> => {
    try {
      const result = await operation();
      errorHandler.clearError();
      return result;
    } catch (error) {
      await errorHandler.handleError(error as Error, operation, context);
      return null;
    }
  }, [errorHandler]);

  return {
    ...errorHandler,
    executeOperation
  };
}

/**
 * Hook for currency conversion with automatic fallback
 */
export function useResilientConversion(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  options: ErrorHandlerOptions = {}
) {
  const [result, setResult] = useState<{
    value: number | null;
    formatted: string | null;
    usingFallback: boolean;
    source: 'api' | 'cache' | 'fallback';
  }>({
    value: null,
    formatted: null,
    usingFallback: false,
    source: 'api'
  });

  const errorHandler = useResilientCurrencyOperation({
    ...options,
    onFallback: (from, to) => {
      setResult(prev => ({ ...prev, usingFallback: true, source: 'fallback' }));
      options.onFallback?.(from, to);
    }
  });

  const performConversion = useCallback(async () => {
    if (!amount || amount <= 0 || !fromCurrency || !toCurrency) {
      return;
    }

    const conversion = await errorHandler.executeOperation(
      () => currencyService.convertAmount(amount, fromCurrency, toCurrency),
      { fromCurrency, toCurrency }
    );

    if (conversion && typeof conversion === 'object' && 'convertedAmount' in conversion && typeof conversion.convertedAmount === 'number') {
      setResult({
        value: conversion.convertedAmount,
        formatted: conversion.convertedAmount.toFixed(2),
        usingFallback: false,
        source: 'api'
      });
    } else if (errorHandler.fallbackAvailable) {
      const fallbackRate = await errorHandler.useFallback(fromCurrency, toCurrency);
      if (fallbackRate) {
        const fallbackValue = amount * fallbackRate;
        setResult({
          value: fallbackValue,
          formatted: fallbackValue.toFixed(2),
          usingFallback: true,
          source: 'fallback'
        });
      }
    }
  }, [amount, fromCurrency, toCurrency, errorHandler]);

  useEffect(() => {
    performConversion();
  }, [performConversion]);

  return {
    ...result,
    ...errorHandler,
    refresh: performConversion
  };
}

export default {
  useCurrencyErrorHandler,
  useResilientCurrencyOperation,
  useResilientConversion
};