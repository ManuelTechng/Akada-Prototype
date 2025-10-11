export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  education_level: string;
  current_university?: string;
  field_of_study?: string;
  gpa?: number;
  // New profile fields
  phone_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  date_of_birth?: string; // ISO date string format
  bio?: string;
  // Existing fields
  test_scores?: {
    ielts?: number | string;
    toefl?: number | string;
    gre?: {
      verbal: number | string;
      quantitative: number | string;
      analytical: number | string;
    };
  };
  study_preferences?: {
    countries: string[];
    max_tuition: number | string;
    program_type: string[];
    start_date: string;
  };
  profile_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthError extends Error {
  status?: string | number;
  code?: string;
  originalError?: Error;
  retryable?: boolean;
  networkError?: boolean;
  attempts?: number;
}

import type { Session, User } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: Error | null | undefined;
  status?: 'success' | 'error' | 'timeout' | 'network_error';
  attempts?: number;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  educationLevel: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionRequired?: boolean;
  actionUrl?: string;
}

export interface AuthConfig {
  maxRetries: number;
  baseTimeout: number;
  maxTimeout: number;
  backoffFactor: number;
  minRetryDelay: number;
  maxRetryDelay: number;
}

export interface Program {
  id: string;
  university: string;
  name: string;
  degree_type: string;
  country: string;
  tuition_fee: number;
  // Multicurrency support
  tuition_fee_currency?: string;
  tuition_fee_original?: number;
  application_fee_currency?: string;
  application_fee_original?: number;
  last_currency_update?: string;
  currency_source?: string;
  // End multicurrency fields
  has_scholarships?: boolean;
  scholarship_available?: boolean;
  created_at: string;
  abbreviation?: string;
  location?: string;
  city?: string;
  description?: string;
  website?: string;
  program_website?: string;
  university_website?: string;
  logo?: string;
  faculties?: string[];
  fields?: string[];
  specialization?: string;
  duration?: string;
  study_level?: string;
  deadline?: string;
  application_deadline?: string;
  term?: string;
  requirements?: string[];
  entry_requirements?: string;
  language_requirements?: string;
  application_fee?: string;
  match?: number;
}

export interface Application {
  id: string;
  user_id: string;
  program_id: string;
  status: 'planning' | 'in_progress' | 'submitted' | 'accepted' | 'rejected';
  deadline?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EssayReview {
  id: string;
  user_id: string;
  essay_type: 'sop' | 'cv';
  content: string;
  feedback?: string;
  created_at: string;
  updated_at: string;
}