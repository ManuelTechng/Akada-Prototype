import { supabase } from './supabase';

export interface ConnectionHealth {
  isHealthy: boolean;
  latency?: number;
  error?: string;
}

/**
 * Check if Supabase connection is healthy by performing a simple query
 */
export const checkConnectionHealth = async (): Promise<ConnectionHealth> => {
  try {
    const startTime = performance.now();
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('programs')
      .select('id')
      .limit(1);
    
    const endTime = performance.now();
    const latency = endTime - startTime;
    
    if (error) {
      return {
        isHealthy: false,
        latency,
        error: error.message
      };
    }
    
    return {
      isHealthy: true,
      latency
    };
  } catch (err: any) {
    return {
      isHealthy: false,
      error: err.message || 'Connection test failed'
    };
  }
};

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`🔄 Retry attempt ${attempt + 1}/${maxRetries + 1} after ${delay}ms delay`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Check if an error is likely due to connection issues
 */
export const isConnectionError = (error: any): boolean => {
  const message = error?.message?.toLowerCase() || '';
  return (
    message.includes('timeout') ||
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('port closed') ||
    message.includes('aborted')
  );
};

