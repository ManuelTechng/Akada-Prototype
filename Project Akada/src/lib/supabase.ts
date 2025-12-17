import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { logger } from '../utils/logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables are present and correctly formatted
if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
  logger.error('Invalid or missing VITE_SUPABASE_URL. Must be a valid HTTPS URL.');
}

if (!supabaseAnonKey || supabaseAnonKey.length === 0) {
  logger.error('Invalid or missing VITE_SUPABASE_ANON_KEY. Please check your .env file.');
}

logger.debug("Supabase: Initializing");

// In-memory fallback storage
const memoryStorage = new Map<string, string>();

const STORAGE_KEYS = {
  AUTH_TOKEN: 'akada-auth-token',
  SESSION: 'akada-auth-session',
  LAST_ERROR: 'akada-auth-last-error'
} as const;

const createFallbackStorage = () => ({
  getItem: (key: string) => {
    logger.debug("Supabase Storage: Fallback getItem");
    return memoryStorage.get(key) ?? null;
  },
  setItem: (key: string, value: string) => {
    logger.debug("Supabase Storage: Fallback setItem");
    memoryStorage.set(key, value);
  },
  removeItem: (key: string) => {
    logger.debug("Supabase Storage: Fallback removeItem");
    memoryStorage.delete(key);
  }
});

const handleStorageError = (operation: string, error: unknown) => {
  logger.error(`Supabase Storage: ${operation} error:`, error);
  try {
    memoryStorage.set(STORAGE_KEYS.LAST_ERROR, JSON.stringify({ operation, timestamp: Date.now() }));
  } catch (jsonError) {
    logger.error('Failed to stringify error for storage:', jsonError);
    memoryStorage.set(STORAGE_KEYS.LAST_ERROR, `${operation}-error-${Date.now()}`);
  }
};

const getStorage = () => {
  try {
    // SECURITY: Use sessionStorage instead of localStorage to mitigate XSS attacks
    // sessionStorage is cleared when the tab/window closes, reducing the attack surface
    // compared to localStorage which persists indefinitely
    logger.debug("Supabase: Setting up storage");

    // Quick test for sessionStorage availability
    try {
      const testKey = 'supabase-test';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      logger.debug("Supabase Storage: Using sessionStorage (secure)");

      return {
        getItem: (key: string) => sessionStorage.getItem(key),
        setItem: (key: string, value: string) => sessionStorage.setItem(key, value),
        removeItem: (key: string) => sessionStorage.removeItem(key)
      };
    } catch (e) {
      logger.warn("Supabase Storage: sessionStorage not available, using memory storage");
      return createFallbackStorage();
    }
  } catch (error) {
    logger.warn('Supabase Storage: sessionStorage not available, using in-memory storage', error);
    return createFallbackStorage();
  }
};

// Custom fetch function to ensure proper content type
const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const headers = new Headers(init?.headers);
  if (init?.method === 'POST' || init?.method === 'PUT' || init?.method === 'PATCH') {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(input, { ...init, headers });
};

logger.debug("Supabase: Creating client");

// Create a single instance of the Supabase client
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: getStorage(),
    storageKey: STORAGE_KEYS.AUTH_TOKEN,
    flowType: 'pkce',
  },
  global: {
    headers: { 
      'x-application-name': 'akada',
      'apikey': supabaseAnonKey 
    },
    fetch: customFetch
  },
  db: {
    schema: 'public'
  }
});

logger.debug("Supabase: Client created");

export { supabase };