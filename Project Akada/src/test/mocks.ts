import { vi } from 'vitest';
import type { UserProfile } from '../lib/types';

// Mock the profile fetcher
export const mockProfile: UserProfile = {
  id: '123',
  email: 'test@example.com',
  full_name: 'Test User',
  education_level: 'Bachelor',
  current_university: 'Test University',
  field_of_study: 'Computer Science',
  gpa: 3.8,
  phone_number: '+1234567890',
  address_line1: '123 Test St',
  address_line2: 'Apt 4B',
  city: 'Test City',
  state_province: 'Test State',
  postal_code: '12345',
  country: 'Test Country',
  date_of_birth: '1990-01-01',
  bio: 'Test bio',
  test_scores: {
    ielts: 7.5,
    toefl: 100,
    gre: {
      verbal: 160,
      quantitative: 165,
      analytical: 5.0
    }
  },
  study_preferences: {
    countries: ['USA', 'UK'],
    max_tuition: 50000,
    program_type: ['Masters'],
    start_date: '2024-09'
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

vi.mock('../hooks/useProfileFetcher', () => {
  const mockFn = vi.fn().mockResolvedValue(mockProfile);
  return {
    useProfileFetcher: () => mockFn
  };
}); 