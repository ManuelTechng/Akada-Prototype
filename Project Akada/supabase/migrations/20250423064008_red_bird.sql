/*
  # Enable Google OAuth and Update User Profile Handling

  1. Updates
    - Update user profile trigger to handle OAuth sign-ins
    - Add support for extracting user data from Google OAuth

  2. Changes
    - Modify handle_new_user function to better handle OAuth data
    - Add fallback for education level
*/

-- Update handle_new_user function to handle OAuth providers
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  full_name text;
  raw_data jsonb;
BEGIN
  -- Handle both direct sign-ups and OAuth
  raw_data := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  
  -- Get full name from various possible sources
  full_name := COALESCE(
    raw_data->>'full_name',
    raw_data->>'name',
    raw_data->>'user_name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    education_level,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    full_name,
    COALESCE(raw_data->>'education_level', 'unknown'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();