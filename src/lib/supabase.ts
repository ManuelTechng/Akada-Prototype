import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables are present and correctly formatted
if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
  console.error('Invalid or missing VITE_SUPABASE_URL. Must be a valid HTTPS URL.');
}

if (!supabaseAnonKey || supabaseAnonKey.length === 0) {
  console.error('Invalid or missing VITE_SUPABASE_ANON_KEY. Please check your .env file.');
}

console.log("Supabase: Initializing with URL", supabaseUrl);

// In-memory fallback storage
const memoryStorage = new Map<string, string>();

const STORAGE_KEYS = {
  AUTH_TOKEN: 'akada-auth-token',
  SESSION: 'akada-auth-session',
  LAST_ERROR: 'akada-auth-last-error'
} as const;

const createFallbackStorage = () => ({
  getItem: (key: string) => {
    console.log("Supabase Storage: Fallback getItem", key);
    return memoryStorage.get(key) ?? null;
  },
  setItem: (key: string, value: string) => {
    console.log("Supabase Storage: Fallback setItem", key);
    memoryStorage.set(key, value);
  },
  removeItem: (key: string) => {
    console.log("Supabase Storage: Fallback removeItem", key);
    memoryStorage.delete(key);
  }
});

const handleStorageError = (operation: string, error: unknown) => {
  console.error(`Supabase Storage: ${operation} error:`, error);
  try {
    memoryStorage.set(STORAGE_KEYS.LAST_ERROR, JSON.stringify({ operation, timestamp: Date.now() }));
  } catch (jsonError) {
    console.error('Failed to stringify error for storage:', jsonError);
    memoryStorage.set(STORAGE_KEYS.LAST_ERROR, `${operation}-error-${Date.now()}`);
  }
};

const getStorage = () => {
  try {
    // Simplified storage setup - try localStorage first, fallback to memory
    console.log("Supabase: Setting up storage");

    // Quick test for localStorage availability
    try {
      const testKey = 'supabase-test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      console.log("Supabase Storage: Using localStorage");

      return {
        getItem: (key: string) => localStorage.getItem(key),
        setItem: (key: string, value: string) => localStorage.setItem(key, value),
        removeItem: (key: string) => localStorage.removeItem(key)
      };
    } catch (e) {
      console.warn("Supabase Storage: localStorage not available, using memory storage");
      return createFallbackStorage();
    }
  } catch (error) {
    console.warn('Supabase Storage: localStorage not available, using in-memory storage', error);
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

console.log("Supabase: Creating client");

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

console.log("Supabase: Client created");

export { supabase };