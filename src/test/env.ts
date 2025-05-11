import { vi } from 'vitest';

// Mock environment variables for testing
const env = {
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-key',
  VITE_OPENAI_API_KEY: 'sk-test'
};

// Mock import.meta.env
vi.stubGlobal('import.meta', {
  env
});

export default env; 