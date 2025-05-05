export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string
          user_id: string
          program_id: string
          status: string
          deadline: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          program_id: string
          status?: string
          deadline?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          program_id?: string
          status?: string
          deadline?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      programs: {
        Row: {
          id: string
          university: string
          name: string
          degree_type: string
          country: string
          tuition_fee: number
          created_at: string | null
        }
        Insert: {
          id?: string
          university: string
          name: string
          degree_type: string
          country: string
          tuition_fee: number
          created_at?: string | null
        }
        Update: {
          id?: string
          university?: string
          name?: string
          degree_type?: string
          country?: string
          tuition_fee?: number
          created_at?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          education_level: string
          current_university: string | null
          field_of_study: string | null
          gpa: number | null
          test_scores: Json | null
          study_preferences: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name: string
          education_level: string
          current_university?: string | null
          field_of_study?: string | null
          gpa?: number | null
          test_scores?: Json | null
          study_preferences?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          education_level?: string
          current_university?: string | null
          field_of_study?: string | null
          gpa?: number | null
          test_scores?: Json | null
          study_preferences?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}