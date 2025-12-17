export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      alumni_testimonials: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          current_company: string | null
          current_position: string | null
          degree_obtained: string | null
          featured: boolean | null
          graduation_year: number | null
          id: string
          profile_photo_url: string | null
          rating: number | null
          status: string
          student_name: string
          submitted_at: string | null
          tags: string[] | null
          testimonial_text: string
          university_id: string
          updated_at: string | null
          would_recommend: boolean | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          current_company?: string | null
          current_position?: string | null
          degree_obtained?: string | null
          featured?: boolean | null
          graduation_year?: number | null
          id?: string
          profile_photo_url?: string | null
          rating?: number | null
          status?: string
          student_name: string
          submitted_at?: string | null
          tags?: string[] | null
          testimonial_text: string
          university_id: string
          updated_at?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          current_company?: string | null
          current_position?: string | null
          degree_obtained?: string | null
          featured?: boolean | null
          graduation_year?: number | null
          id?: string
          profile_photo_url?: string | null
          rating?: number | null
          status?: string
          student_name?: string
          submitted_at?: string | null
          tags?: string[] | null
          testimonial_text?: string
          university_id?: string
          updated_at?: string | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "alumni_testimonials_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      application_guides: {
        Row: {
          application_fee_usd: number | null
          created_at: string | null
          id: string
          overview: string | null
          required_documents: string[] | null
          steps: Json
          tips: string[] | null
          title: string
          typical_response_weeks: number | null
          university_id: string | null
          updated_at: string | null
        }
        Insert: {
          application_fee_usd?: number | null
          created_at?: string | null
          id?: string
          overview?: string | null
          required_documents?: string[] | null
          steps: Json
          tips?: string[] | null
          title: string
          typical_response_weeks?: number | null
          university_id?: string | null
          updated_at?: string | null
        }
        Update: {
          application_fee_usd?: number | null
          created_at?: string | null
          id?: string
          overview?: string | null
          required_documents?: string[] | null
          steps?: Json
          tips?: string[] | null
          title?: string
          typical_response_weeks?: number | null
          university_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_guides_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      application_status_history: {
        Row: {
          application_id: string
          created_at: string | null
          id: string
          notes: string | null
          status: string
          updated_by: string
        }
        Insert: {
          application_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          status: string
          updated_by: string
        }
        Update: {
          application_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          created_at: string | null
          deadline: string | null
          id: string
          notes: string | null
          program_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deadline?: string | null
          id?: string
          notes?: string | null
          program_id: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deadline?: string | null
          id?: string
          notes?: string | null
          program_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "program_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs_legacy_compat"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_ai: boolean | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_ai?: boolean | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_ai?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          accommodation_max: number | null
          accommodation_min: number | null
          climate: string | null
          country_code: string | null
          created_at: string | null
          currency_code: string
          entertainment_monthly: number | null
          food_monthly: number | null
          id: string
          last_updated: string | null
          latitude: number | null
          longitude: number | null
          name: string
          population: number | null
          public_transport_quality: string | null
          student_friendly_rating: number | null
          tier: string | null
          transport_monthly: number | null
          utilities_monthly: number | null
        }
        Insert: {
          accommodation_max?: number | null
          accommodation_min?: number | null
          climate?: string | null
          country_code?: string | null
          created_at?: string | null
          currency_code: string
          entertainment_monthly?: number | null
          food_monthly?: number | null
          id?: string
          last_updated?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          population?: number | null
          public_transport_quality?: string | null
          student_friendly_rating?: number | null
          tier?: string | null
          transport_monthly?: number | null
          utilities_monthly?: number | null
        }
        Update: {
          accommodation_max?: number | null
          accommodation_min?: number | null
          climate?: string | null
          country_code?: string | null
          created_at?: string | null
          currency_code?: string
          entertainment_monthly?: number | null
          food_monthly?: number | null
          id?: string
          last_updated?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          population?: number | null
          public_transport_quality?: string | null
          student_friendly_rating?: number | null
          tier?: string | null
          transport_monthly?: number | null
          utilities_monthly?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["country_code"]
          },
        ]
      }
      countries: {
        Row: {
          avg_living_cost_monthly_usd: number | null
          climate: string | null
          country_code: string
          created_at: string | null
          currency_code: string | null
          currency_symbol: string | null
          healthcare_cost_monthly_usd: number | null
          id: string
          is_active: boolean | null
          is_origin_country: boolean | null
          language_requirements: string | null
          living_cost_max_usd: number | null
          living_cost_min_usd: number | null
          name: string
          post_study_work_duration: string | null
          region: string | null
          requires_biometrics: boolean | null
          requires_medical: boolean | null
          safety_index: number | null
          timezone: string | null
          updated_at: string | null
          visa_fee_usd: number | null
          visa_processing_days: number | null
          visa_type: string | null
          work_permit_hours_weekly: number | null
        }
        Insert: {
          avg_living_cost_monthly_usd?: number | null
          climate?: string | null
          country_code: string
          created_at?: string | null
          currency_code?: string | null
          currency_symbol?: string | null
          healthcare_cost_monthly_usd?: number | null
          id?: string
          is_active?: boolean | null
          is_origin_country?: boolean | null
          language_requirements?: string | null
          living_cost_max_usd?: number | null
          living_cost_min_usd?: number | null
          name: string
          post_study_work_duration?: string | null
          region?: string | null
          requires_biometrics?: boolean | null
          requires_medical?: boolean | null
          safety_index?: number | null
          timezone?: string | null
          updated_at?: string | null
          visa_fee_usd?: number | null
          visa_processing_days?: number | null
          visa_type?: string | null
          work_permit_hours_weekly?: number | null
        }
        Update: {
          avg_living_cost_monthly_usd?: number | null
          climate?: string | null
          country_code?: string
          created_at?: string | null
          currency_code?: string | null
          currency_symbol?: string | null
          healthcare_cost_monthly_usd?: number | null
          id?: string
          is_active?: boolean | null
          is_origin_country?: boolean | null
          language_requirements?: string | null
          living_cost_max_usd?: number | null
          living_cost_min_usd?: number | null
          name?: string
          post_study_work_duration?: string | null
          region?: string | null
          requires_biometrics?: boolean | null
          requires_medical?: boolean | null
          safety_index?: number | null
          timezone?: string | null
          updated_at?: string | null
          visa_fee_usd?: number | null
          visa_processing_days?: number | null
          visa_type?: string | null
          work_permit_hours_weekly?: number | null
        }
        Relationships: []
      }
      country_estimates: {
        Row: {
          avg_monthly_living: number
          country: string
          currency: string
          last_updated: string | null
          living_cost_range_max: number | null
          living_cost_range_min: number | null
          notes: string | null
          student_visa_fee: number
        }
        Insert: {
          avg_monthly_living: number
          country: string
          currency: string
          last_updated?: string | null
          living_cost_range_max?: number | null
          living_cost_range_min?: number | null
          notes?: string | null
          student_visa_fee: number
        }
        Update: {
          avg_monthly_living?: number
          country?: string
          currency?: string
          last_updated?: string | null
          living_cost_range_max?: number | null
          living_cost_range_min?: number | null
          notes?: string | null
          student_visa_fee?: number
        }
        Relationships: []
      }
      courses: {
        Row: {
          assessment_breakdown: Json | null
          course_code: string
          course_description: string | null
          course_level: string | null
          course_name: string
          created_at: string | null
          credits: number
          id: string
          is_active: boolean | null
          prerequisites: string[] | null
          syllabus_topics: string[] | null
          updated_at: string | null
        }
        Insert: {
          assessment_breakdown?: Json | null
          course_code: string
          course_description?: string | null
          course_level?: string | null
          course_name: string
          created_at?: string | null
          credits: number
          id?: string
          is_active?: boolean | null
          prerequisites?: string[] | null
          syllabus_topics?: string[] | null
          updated_at?: string | null
        }
        Update: {
          assessment_breakdown?: Json | null
          course_code?: string
          course_description?: string | null
          course_level?: string | null
          course_name?: string
          created_at?: string | null
          credits?: number
          id?: string
          is_active?: boolean | null
          prerequisites?: string[] | null
          syllabus_topics?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dashboard_preferences: {
        Row: {
          created_at: string | null
          date_format: string | null
          default_currency: string | null
          id: string
          notification_preferences: Json
          number_format: string | null
          theme_preferences: Json
          timezone: string | null
          updated_at: string | null
          user_id: string
          widget_layout: Json
          widget_visibility: Json
        }
        Insert: {
          created_at?: string | null
          date_format?: string | null
          default_currency?: string | null
          id?: string
          notification_preferences?: Json
          number_format?: string | null
          theme_preferences?: Json
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          widget_layout?: Json
          widget_visibility?: Json
        }
        Update: {
          created_at?: string | null
          date_format?: string | null
          default_currency?: string | null
          id?: string
          notification_preferences?: Json
          number_format?: string | null
          theme_preferences?: Json
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          widget_layout?: Json
          widget_visibility?: Json
        }
        Relationships: []
      }
      deadline_reminders: {
        Row: {
          application_id: string
          created_at: string | null
          days_until_deadline: number
          deadline: string
          id: string
          program_name: string
          reminder_sent: boolean | null
          reminder_sent_at: string | null
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string | null
          days_until_deadline: number
          deadline: string
          id?: string
          program_name: string
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string | null
          days_until_deadline?: number
          deadline?: string
          id?: string
          program_name?: string
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deadline_reminders_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      essay_reviews: {
        Row: {
          content: string
          created_at: string | null
          essay_type: string
          feedback: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          essay_type: string
          feedback?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          essay_type?: string
          feedback?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          program_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          program_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          program_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "program_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs_legacy_compat"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_routes: {
        Row: {
          api_provider: string | null
          api_route_id: string | null
          avg_business_cost: number | null
          avg_economy_cost: number
          avg_flight_duration_hours: number | null
          budget_airline_available: boolean | null
          confidence_score: number | null
          created_at: string | null
          currency_code: string
          data_source: string
          destination_country_code: string | null
          id: string
          last_updated: string | null
          origin_country_code: string | null
          peak_season_multiplier: number | null
          real_time_available: boolean | null
          typical_layovers: number | null
        }
        Insert: {
          api_provider?: string | null
          api_route_id?: string | null
          avg_business_cost?: number | null
          avg_economy_cost: number
          avg_flight_duration_hours?: number | null
          budget_airline_available?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          currency_code?: string
          data_source: string
          destination_country_code?: string | null
          id?: string
          last_updated?: string | null
          origin_country_code?: string | null
          peak_season_multiplier?: number | null
          real_time_available?: boolean | null
          typical_layovers?: number | null
        }
        Update: {
          api_provider?: string | null
          api_route_id?: string | null
          avg_business_cost?: number | null
          avg_economy_cost?: number
          avg_flight_duration_hours?: number | null
          budget_airline_available?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          currency_code?: string
          data_source?: string
          destination_country_code?: string | null
          id?: string
          last_updated?: string | null
          origin_country_code?: string | null
          peak_season_multiplier?: number | null
          real_time_available?: boolean | null
          typical_layovers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "flight_routes_destination_country_code_fkey"
            columns: ["destination_country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["country_code"]
          },
          {
            foreignKeyName: "flight_routes_origin_country_code_fkey"
            columns: ["origin_country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["country_code"]
          },
        ]
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          category: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_archived: boolean | null
          is_read: boolean | null
          message: string
          metadata: Json | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          category: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          category?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      program_comparisons: {
        Row: {
          comparison_name: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          program_ids: string[]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comparison_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          program_ids: string[]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comparison_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          program_ids?: string[]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      program_courses: {
        Row: {
          course_id: string
          course_order: number | null
          created_at: string | null
          id: string
          is_required: boolean | null
          program_id: string
          semester: number | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          course_id: string
          course_order?: number | null
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          program_id: string
          semester?: number | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          course_id?: string
          course_order?: number | null
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          program_id?: string
          semester?: number | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "program_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_courses_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "program_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_courses_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_courses_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs_legacy_compat"
            referencedColumns: ["id"]
          },
        ]
      }
      program_scholarships: {
        Row: {
          amount_max_usd: number | null
          amount_min_usd: number | null
          application_deadline: string | null
          application_url: string | null
          coverage_details: string | null
          created_at: string | null
          eligibility_criteria: string
          eligible_countries: string[] | null
          id: string
          is_active: boolean | null
          min_gpa: number | null
          program_id: string | null
          renewable: boolean | null
          scholarship_name: string
          type: string
          university_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount_max_usd?: number | null
          amount_min_usd?: number | null
          application_deadline?: string | null
          application_url?: string | null
          coverage_details?: string | null
          created_at?: string | null
          eligibility_criteria: string
          eligible_countries?: string[] | null
          id?: string
          is_active?: boolean | null
          min_gpa?: number | null
          program_id?: string | null
          renewable?: boolean | null
          scholarship_name: string
          type: string
          university_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_max_usd?: number | null
          amount_min_usd?: number | null
          application_deadline?: string | null
          application_url?: string | null
          coverage_details?: string | null
          created_at?: string | null
          eligibility_criteria?: string
          eligible_countries?: string[] | null
          id?: string
          is_active?: boolean | null
          min_gpa?: number | null
          program_id?: string | null
          renewable?: boolean | null
          scholarship_name?: string
          type?: string
          university_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_scholarships_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "program_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_scholarships_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_scholarships_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs_legacy_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_scholarships_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      program_university_mappings: {
        Row: {
          id: string
          mapped_at: string | null
          mapped_by: string | null
          new_university_id: string
          notes: string | null
          old_university_text: string
          program_id: string
        }
        Insert: {
          id?: string
          mapped_at?: string | null
          mapped_by?: string | null
          new_university_id: string
          notes?: string | null
          old_university_text: string
          program_id: string
        }
        Update: {
          id?: string
          mapped_at?: string | null
          mapped_by?: string | null
          new_university_id?: string
          notes?: string | null
          old_university_text?: string
          program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_university_mappings_new_university_id_fkey"
            columns: ["new_university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_university_mappings_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: true
            referencedRelation: "program_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_university_mappings_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: true
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_university_mappings_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: true
            referencedRelation: "programs_legacy_compat"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          application_deadline: string | null
          application_deadlines: Json | null
          application_fee: number | null
          application_fee_currency: string | null
          application_fee_original: number | null
          city: string | null
          city_id: string | null
          country: string
          created_at: string | null
          currency_source: string | null
          deadline: string | null
          degree_type: string
          description: string | null
          duration: string | null
          entry_requirements: string | null
          has_scholarships: boolean | null
          id: string
          intake_periods: string[] | null
          language_requirements: Json | null
          language_requirements_text_backup: string | null
          last_currency_update: string | null
          location: string | null
          min_gpa: number | null
          name: string
          program_url: string | null
          program_website: string | null
          required_documents: string[] | null
          requirements: string[] | null
          scholarship_available: boolean | null
          specialization: string | null
          study_level: string | null
          tuition_fee: number
          tuition_fee_currency: string | null
          tuition_fee_original: number | null
          university: string
          university_id: string | null
          university_website: string | null
          website: string | null
        }
        Insert: {
          application_deadline?: string | null
          application_deadlines?: Json | null
          application_fee?: number | null
          application_fee_currency?: string | null
          application_fee_original?: number | null
          city?: string | null
          city_id?: string | null
          country: string
          created_at?: string | null
          currency_source?: string | null
          deadline?: string | null
          degree_type: string
          description?: string | null
          duration?: string | null
          entry_requirements?: string | null
          has_scholarships?: boolean | null
          id?: string
          intake_periods?: string[] | null
          language_requirements?: Json | null
          language_requirements_text_backup?: string | null
          last_currency_update?: string | null
          location?: string | null
          min_gpa?: number | null
          name: string
          program_url?: string | null
          program_website?: string | null
          required_documents?: string[] | null
          requirements?: string[] | null
          scholarship_available?: boolean | null
          specialization?: string | null
          study_level?: string | null
          tuition_fee: number
          tuition_fee_currency?: string | null
          tuition_fee_original?: number | null
          university: string
          university_id?: string | null
          university_website?: string | null
          website?: string | null
        }
        Update: {
          application_deadline?: string | null
          application_deadlines?: Json | null
          application_fee?: number | null
          application_fee_currency?: string | null
          application_fee_original?: number | null
          city?: string | null
          city_id?: string | null
          country?: string
          created_at?: string | null
          currency_source?: string | null
          deadline?: string | null
          degree_type?: string
          description?: string | null
          duration?: string | null
          entry_requirements?: string | null
          has_scholarships?: boolean | null
          id?: string
          intake_periods?: string[] | null
          language_requirements?: Json | null
          language_requirements_text_backup?: string | null
          last_currency_update?: string | null
          location?: string | null
          min_gpa?: number | null
          name?: string
          program_url?: string | null
          program_website?: string | null
          required_documents?: string[] | null
          requirements?: string[] | null
          scholarship_available?: boolean | null
          specialization?: string | null
          study_level?: string | null
          tuition_fee?: number
          tuition_fee_currency?: string | null
          tuition_fee_original?: number | null
          university?: string
          university_id?: string | null
          university_website?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_jobs: {
        Row: {
          application_id: string | null
          created_at: string | null
          data: Json | null
          id: string
          processed_at: string | null
          program_id: string | null
          scheduled_for: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          processed_at?: string | null
          program_id?: string | null
          scheduled_for: string
          status?: string
          type: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          processed_at?: string | null
          program_id?: string | null
          scheduled_for?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_jobs_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_jobs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "program_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_jobs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_jobs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs_legacy_compat"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_rules: {
        Row: {
          created_at: string | null
          days_before_deadline: number[]
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          notification_types: string[]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          days_before_deadline: number[]
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notification_types: string[]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          days_before_deadline?: number[]
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notification_types?: string[]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_programs: {
        Row: {
          id: string
          notes: string | null
          program_id: string | null
          saved_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          notes?: string | null
          program_id?: string | null
          saved_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          notes?: string | null
          program_id?: string | null
          saved_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "program_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs_legacy_compat"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarship_opportunities: {
        Row: {
          amount_max_usd: number | null
          amount_min_usd: number | null
          application_deadline: string | null
          country_code: string | null
          coverage: string[] | null
          created_at: string | null
          eligible_countries: string[] | null
          id: string
          name: string
          provider: string | null
          requirements: string[] | null
          type: string | null
          university_id: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          amount_max_usd?: number | null
          amount_min_usd?: number | null
          application_deadline?: string | null
          country_code?: string | null
          coverage?: string[] | null
          created_at?: string | null
          eligible_countries?: string[] | null
          id?: string
          name: string
          provider?: string | null
          requirements?: string[] | null
          type?: string | null
          university_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          amount_max_usd?: number | null
          amount_min_usd?: number | null
          application_deadline?: string | null
          country_code?: string | null
          coverage?: string[] | null
          created_at?: string | null
          eligible_countries?: string[] | null
          id?: string
          name?: string
          provider?: string | null
          requirements?: string[] | null
          type?: string | null
          university_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scholarship_opportunities_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["country_code"]
          },
          {
            foreignKeyName: "scholarship_opportunities_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          acceptance_rate: number | null
          accreditations: string[] | null
          city_id: string | null
          contact_email: string | null
          country_code: string | null
          created_at: string | null
          description: string | null
          founded_year: number | null
          id: string
          institution_type: string | null
          international_students: number | null
          logo_url: string | null
          name: string
          ranking_national: number | null
          ranking_world: number | null
          total_students: number | null
          type: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          acceptance_rate?: number | null
          accreditations?: string[] | null
          city_id?: string | null
          contact_email?: string | null
          country_code?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          institution_type?: string | null
          international_students?: number | null
          logo_url?: string | null
          name: string
          ranking_national?: number | null
          ranking_world?: number | null
          total_students?: number | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          acceptance_rate?: number | null
          accreditations?: string[] | null
          city_id?: string | null
          contact_email?: string | null
          country_code?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          institution_type?: string | null
          international_students?: number | null
          logo_url?: string | null
          name?: string
          ranking_national?: number | null
          ranking_world?: number | null
          total_students?: number | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "universities_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "universities_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["country_code"]
          },
        ]
      }
      user_behavior: {
        Row: {
          created_at: string | null
          id: string
          last_updated: string | null
          search_history: Json | null
          time_spent: Json | null
          user_id: string
          viewed_programs: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_updated?: string | null
          search_history?: Json | null
          time_spent?: Json | null
          user_id: string
          viewed_programs?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_updated?: string | null
          search_history?: Json | null
          time_spent?: Json | null
          user_id?: string
          viewed_programs?: Json | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          budget_range: number | null
          countries: string[] | null
          created_at: string | null
          goals: string | null
          id: string
          language_preference: string | null
          preferred_cities: string[] | null
          preferred_duration: string | null
          scholarship_needed: boolean | null
          specializations: string[] | null
          study_level: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          budget_range?: number | null
          countries?: string[] | null
          created_at?: string | null
          goals?: string | null
          id?: string
          language_preference?: string | null
          preferred_cities?: string[] | null
          preferred_duration?: string | null
          scholarship_needed?: boolean | null
          specializations?: string[] | null
          study_level?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          budget_range?: number | null
          countries?: string[] | null
          created_at?: string | null
          goals?: string | null
          id?: string
          language_preference?: string | null
          preferred_cities?: string[] | null
          preferred_duration?: string | null
          scholarship_needed?: boolean | null
          specializations?: string[] | null
          study_level?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string | null
          current_university: string | null
          date_of_birth: string | null
          education_level: string
          email: string | null
          field_of_study: string | null
          full_name: string
          gpa: number | null
          id: string
          phone_number: string | null
          postal_code: string | null
          profile_completed: boolean | null
          profile_picture_url: string | null
          state_province: string | null
          study_preferences: Json | null
          test_scores: Json | null
          updated_at: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          current_university?: string | null
          date_of_birth?: string | null
          education_level: string
          email?: string | null
          field_of_study?: string | null
          full_name: string
          gpa?: number | null
          id: string
          phone_number?: string | null
          postal_code?: string | null
          profile_completed?: boolean | null
          profile_picture_url?: string | null
          state_province?: string | null
          study_preferences?: Json | null
          test_scores?: Json | null
          updated_at?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          current_university?: string | null
          date_of_birth?: string | null
          education_level?: string
          email?: string | null
          field_of_study?: string | null
          full_name?: string
          gpa?: number | null
          id?: string
          phone_number?: string | null
          postal_code?: string | null
          profile_completed?: boolean | null
          profile_picture_url?: string | null
          state_province?: string | null
          study_preferences?: Json | null
          test_scores?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          priority: string
          related_entity_id: string | null
          related_entity_type: string | null
          status: string
          task_type: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          status?: string
          task_type: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          status?: string
          task_type?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      program_recommendations: {
        Row: {
          acceptance_rate: number | null
          accommodation_max: number | null
          accommodation_min: number | null
          application_deadline: string | null
          application_deadlines: Json | null
          application_fee: number | null
          avg_monthly_living: number | null
          city: string | null
          country: string | null
          country_currency: string | null
          created_at: string | null
          deadline: string | null
          degree_type: string | null
          description: string | null
          duration: string | null
          entry_requirements: string | null
          has_scholarships: boolean | null
          id: string | null
          intake_periods: string[] | null
          language_requirements: Json | null
          location: string | null
          min_gpa: number | null
          name: string | null
          program_url: string | null
          program_website: string | null
          ranking_world: number | null
          required_documents: string[] | null
          requirements: string[] | null
          scholarship_available: boolean | null
          specialization: string | null
          student_friendly_rating: number | null
          student_visa_fee: number | null
          study_level: string | null
          total_cost_ngn: number | null
          tuition_fee: number | null
          university: string | null
          university_description: string | null
          university_website: string | null
          website: string | null
        }
        Relationships: []
      }
      programs_legacy_compat: {
        Row: {
          application_deadline: string | null
          application_deadlines: Json | null
          application_fee: number | null
          application_fee_currency: string | null
          city: string | null
          city_id: string | null
          city_name_resolved: string | null
          country: string | null
          created_at: string | null
          deadline: string | null
          degree_type: string | null
          description: string | null
          duration: string | null
          entry_requirements: string | null
          has_any_scholarships: boolean | null
          has_scholarships: boolean | null
          id: string | null
          intake_periods: string[] | null
          language_requirements: Json | null
          language_requirements_text_backup: string | null
          last_currency_update: string | null
          location: string | null
          min_gpa: number | null
          name: string | null
          primary_deadline: string | null
          program_url: string | null
          program_website: string | null
          required_documents: string[] | null
          requirements: string[] | null
          scholarship_available: boolean | null
          specialization: string | null
          study_level: string | null
          tuition_fee: number | null
          tuition_fee_currency: string | null
          tuition_fee_original: number | null
          university: string | null
          university_id: string | null
          university_name_resolved: string | null
          university_website: string | null
          website: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_search_query: {
        Args: { query_text: string; user_uuid: string }
        Returns: undefined
      }
      add_viewed_program: {
        Args: { program_uuid: string; user_uuid: string }
        Returns: undefined
      }
      calculate_program_match_score:
        | {
            Args: {
              needs_scholarship: boolean
              program_id: string
              user_budget: number
              user_countries: string[]
              user_specializations: string[]
              user_study_level: string
            }
            Returns: number
          }
        | { Args: never; Returns: number }
      cleanup_expired_notifications: { Args: never; Returns: undefined }
      cleanup_old_reminder_jobs: { Args: never; Returns: undefined }
      complete_user_task: { Args: { task_id: string }; Returns: undefined }
      get_application_status_timeline: {
        Args: { app_id: string }
        Returns: {
          created_at: string
          id: string
          notes: string
          status: string
          updated_by: string
        }[]
      }
      get_or_create_dashboard_preferences: {
        Args: { user_uuid: string }
        Returns: {
          created_at: string | null
          date_format: string | null
          default_currency: string | null
          id: string
          notification_preferences: Json
          number_format: string | null
          theme_preferences: Json
          timezone: string | null
          updated_at: string | null
          user_id: string
          widget_layout: Json
          widget_visibility: Json
        }
        SetofOptions: {
          from: "*"
          to: "dashboard_preferences"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_primary_deadline: { Args: { program_id: string }; Returns: string }
      get_recommended_programs: {
        Args: {
          needs_scholarship: boolean
          result_limit?: number
          user_budget: number
          user_countries: string[]
          user_specializations: string[]
          user_study_level: string
        }
        Returns: {
          country: string
          description: string
          duration: string
          id: string
          match_score: number
          name: string
          scholarship_available: boolean
          specialization: string
          study_level: string
          total_cost_ngn: number
          tuition_fee: number
          university: string
        }[]
      }
      mark_notification_as_read: {
        Args: { notification_id: string }
        Returns: undefined
      }
      process_deadline_reminders: { Args: never; Returns: number }
      search_programs_with_score: {
        Args: {
          filter_countries?: string[]
          filter_specializations?: string[]
          filter_study_level?: string
          max_budget?: number
          min_budget?: number
          needs_scholarship?: boolean
          requires_scholarship?: boolean
          result_limit?: number
          search_query?: string
          user_budget?: number
          user_countries?: string[]
          user_specializations?: string[]
          user_study_level?: string
        }
        Returns: {
          country: string
          description: string
          duration: string
          id: string
          match_score: number
          name: string
          scholarship_available: boolean
          specialization: string
          study_level: string
          total_cost_ngn: number
          tuition_fee: number
          university: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
