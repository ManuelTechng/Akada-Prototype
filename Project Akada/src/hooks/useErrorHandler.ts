import { useState, useCallback } from 'react';

interface ErrorState {
  message: string;
  code?: string;
  details?: unknown;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState | null>(null);
  const [loading, setLoading] = useState(false);

  const handleError = useCallback((err: unknown) => {
    console.error('Error caught by useErrorHandler:', err);
    
    let errorMessage = 'An unexpected error occurred';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (err instanceof Error) {
      errorMessage = err.message;
      if ('code' in err) {
        errorCode = (err as any).code;
      }
    } else if (typeof err === 'string') {
      errorMessage = err;
    }

    // Handle specific error types
    if (errorMessage.includes('network')) {
      errorMessage = 'Please check your internet connection and try again';
      errorCode = 'NETWORK_ERROR';
    } else if (errorMessage.includes('timeout')) {
      errorMessage = 'The request timed out. Please try again';
      errorCode = 'TIMEOUT_ERROR';
    } else if (errorMessage.toLowerCase().includes('unauthorized')) {
      errorMessage = 'Please sign in to continue';
      errorCode = 'AUTH_ERROR';
    }

    setError({ message: errorMessage, code: errorCode, details: err });
    setLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandler = useCallback(async <T>(
    fn: () => Promise<T>,
    customErrorMessage?: string
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await fn();
      setLoading(false);
      return result;
    } catch (err) {
      handleError(customErrorMessage || err);
      return null;
    }
  }, [handleError]);

  return {
    error,
    loading,
    handleError,
    clearError,
    withErrorHandler,
    setLoading
  };
};