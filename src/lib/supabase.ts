import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables are present and correctly formatted
if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
  console.error('Invalid or missing VITE_SUPABASE_URL. Must be a valid HTTPS URL.');
}

if (!supabaseAnonKey || supabaseAnonKey.length < 1) {
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
  memoryStorage.set(STORAGE_KEYS.LAST_ERROR, JSON.stringify({ operation, timestamp: Date.now() }));
};

const getStorage = () => {
  try {
    console.log("Supabase: Setting up storage");
    const testKey = `test-${Date.now()}`;
    const testValue = 'storage-test';
    
    // Test storage chain
    const storageChain = [localStorage, sessionStorage];
    let workingStorage = null;
    
    for (const storage of storageChain) {
      try {
        storage.setItem(testKey, testValue);
        const value = storage.getItem(testKey);
        storage.removeItem(testKey);
        
        if (value === testValue) {
          workingStorage = storage;
          console.log("Supabase Storage: Using", 
            storage === localStorage ? "localStorage" : "sessionStorage");
          break;
        }
      } catch (e) {
        console.warn("Supabase Storage: Failed to use", 
          storage === localStorage ? "localStorage" : "sessionStorage", e);
        continue;
      }
    }
    
    return {
      getItem: (key: string) => {
        try {
          if (workingStorage) {
            const value = workingStorage.getItem(key);
            if (value) return value;
          }
          return memoryStorage.get(key) ?? null;
        } catch (error) {
          handleStorageError('getItem', error);
          return memoryStorage.get(key) ?? null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          if (workingStorage) {
            workingStorage.setItem(key, value);
          }
          memoryStorage.set(key, value); // Backup to memory
        } catch (error) {
          handleStorageError('setItem', error);
          memoryStorage.set(key, value);
        }
      },
      removeItem: (key: string) => {
        try {
          if (workingStorage) {
            workingStorage.removeItem(key);
          }
          memoryStorage.delete(key);
        } catch (error) {
          handleStorageError('removeItem', error);
          memoryStorage.delete(key);
        }
      }
    };
  } catch (error) {
    console.warn('Supabase Storage: localStorage not available, using in-memory storage', error);
    return createFallbackStorage();
  }
};

const customFetch = (input: RequestInfo | URL, init?: RequestInit) => {
  console.log("Supabase Fetch: Sending request to", typeof input === 'string' ? input : input.toString());
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log("Supabase Fetch: Request timed out");
    controller.abort();
  }, 10000); // 10 second timeout
  
  return fetch(input, {
    ...init,
    signal: controller.signal,
    headers: {
      ...init?.headers,
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'x-custom-retry': 'false'
    }
  })
  .then(response => {
    console.log("Supabase Fetch: Response received", response.status);
    clearTimeout(timeoutId);
    return response;
  })
  .catch(error => {
    console.error("Supabase Fetch: Error", error);
    clearTimeout(timeoutId);
    throw error;
  });
};

console.log("Supabase: Creating client");

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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