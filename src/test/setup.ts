import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import './env';
import { setupMocks } from './utils';
import type { SupabaseClient } from '@supabase/supabase-js';
import { mockProfile } from './mocks';

// Create a mock Supabase client with proper typing
const mockSupabase = {
  auth: {
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockImplementation((callback) => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    })),
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null })
  },
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
      download: vi.fn().mockResolvedValue({ error: null }),
      remove: vi.fn().mockResolvedValue({ error: null })
    })
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockImplementation(() => 
          Promise.resolve({
            data: mockProfile,
            error: null
          })
        )
      })
    }),
    insert: vi.fn().mockImplementation((data) => 
      Promise.resolve({
        data: Array.isArray(data) ? data[0] : data,
        error: null
      })
    ),
    update: vi.fn().mockImplementation((data) => 
      Promise.resolve({
        data: { ...mockProfile, ...data },
        error: null
      })
    ).mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockImplementation(() => 
          Promise.resolve({
            data: { ...mockProfile },
            error: null
          })
        )
      })
    })
  })
} as unknown as SupabaseClient;

// Mock the Supabase client
vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase
}));

// Setup mocks
setupMocks();

// Extend Vitest's expect method with matchers from @testing-library/jest-dom
expect.extend({});

// Clean up after each test case
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Add type declarations for the mock functions
declare global {
  namespace jest {
    interface Mock<TResult = any, TArgs extends any[] = any[]> {
      mockResolvedValueOnce(value: TResult): Mock<TResult, TArgs>;
      mockImplementation(fn: (...args: TArgs) => TResult): Mock<TResult, TArgs>;
      mockReturnValue(value: TResult): Mock<TResult, TArgs>;
      mockReturnValueOnce(value: TResult): Mock<TResult, TArgs>;
    }
  }
}

// Add type declarations for vi
declare module 'vitest' {
  interface Mock<TResult = any, TArgs extends any[] = any[]> {
    mockResolvedValueOnce(value: TResult): Mock<TResult, TArgs>;
    mockImplementation(fn: (...args: TArgs) => TResult): Mock<TResult, TArgs>;
    mockReturnValue(value: TResult): Mock<TResult, TArgs>;
    mockReturnValueOnce(value: TResult): Mock<TResult, TArgs>;
  }
}

// Add type declarations for the mock functions
declare module '@testing-library/react' {
  interface Mock<TResult = any, TArgs extends any[] = any[]> {
    mockResolvedValueOnce(value: TResult): Mock<TResult, TArgs>;
    mockImplementation(fn: (...args: TArgs) => TResult): Mock<TResult, TArgs>;
    mockReturnValue(value: TResult): Mock<TResult, TArgs>;
    mockReturnValueOnce(value: TResult): Mock<TResult, TArgs>;
  }
} 