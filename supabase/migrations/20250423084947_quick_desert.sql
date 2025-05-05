/*
  # Test Application Setup

  1. Drop todos table
    - Remove the test todos table since we're not using it
  
  2. Verify Required Tables
    - Ensure all core tables exist
    - Add any missing tables
*/

-- Drop the todos table if it exists
DROP TABLE IF EXISTS todos;

-- Verify user_profiles table exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    CREATE TABLE user_profiles (
      id uuid PRIMARY KEY REFERENCES auth.users(id),
      email text UNIQUE NOT NULL,
      full_name text NOT NULL,
      education_level text NOT NULL,
      current_university text,
      field_of_study text,
      gpa numeric,
      test_scores jsonb,
      study_preferences jsonb,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view own profile"
      ON user_profiles FOR SELECT
      TO authenticated
      USING (auth.uid() = id);

    CREATE POLICY "Users can update own profile"
      ON user_profiles FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;