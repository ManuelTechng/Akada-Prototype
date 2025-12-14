export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string;
  education_level: string;
  current_university?: string | null;
  field_of_study?: string | null;
  gpa?: number | null;
  // New profile fields
  phone_number?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state_province?: string | null;
  postal_code?: string | null;
  country?: string | null;
  date_of_birth?: string | null; // ISO date string format
  bio?: string | null;
  profile_picture_url?: string | null;
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
    goals?: string;
    language_preference?: string;
    preferred_cities?: string[];
  };
  profile_completed?: boolean | null;
  created_at: string | null;
  updated_at: string | null;
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
  tuition_fee_currency?: string | null;
  tuition_fee_original?: number | null;
  application_fee_currency?: string | null;
  application_fee_original?: number | null;
  last_currency_update?: string | null;
  currency_source?: string | null;
  // End multicurrency fields
  has_scholarships?: boolean | null;
  scholarship_available?: boolean | null;
  created_at: string | null;
  abbreviation?: string | null;
  location?: string | null;
  city?: string | null;
  city_id?: string | null;
  description?: string | null;
  website?: string | null;
  program_website?: string | null;
  university_website?: string | null;
  logo?: string | null;
  faculties?: string[] | null;
  fields?: string[] | null;
  field_of_study?: string | null;
  specialization?: string | null;
  duration?: string | null;
  study_level?: string | null;
  deadline?: string | null;
  application_deadline?: string | null;
  application_deadlines?: any; // Json type
  term?: string | null;
  requirements?: string[] | null;
  entry_requirements?: string | null;
  language_requirements?: string | null;
  application_fee?: number | null;
  match?: number | null;
  currency?: string | null;
  updated_at?: string | null;
}

export interface Application {
  id: string;
  user_id: string;
  program_id: string;
  status: 'planning' | 'in-progress' | 'submitted' | 'accepted' | 'rejected' | 'deferred' | 'in-review' | string;
  deadline?: string | null;
  notes?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SavedProgram {
  id: string;
  user_id: string | null;
  program_id: string | null;
  saved_at: string | null;
  notes: string | null;
  program?: Program | null;
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