-- Fix user_profiles INSERT policy
-- Migration: Fix missing INSERT policy for user_profiles

-- Add INSERT policy for user_profiles
DROP POLICY IF EXISTS "Users can create their own profile" ON public.user_profiles;
CREATE POLICY "Users can create their own profile"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Ensure the trigger function handles missing metadata gracefully
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, education_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    COALESCE(NEW.raw_user_meta_data->>'education_level', 'Not specified')
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent errors if profile already exists
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a profile_completed column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'profile_completed') THEN
    ALTER TABLE user_profiles ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Update existing profiles to mark them as not completed if they have minimal data
UPDATE user_profiles 
SET profile_completed = FALSE 
WHERE profile_completed IS NULL 
   OR (current_university IS NULL AND field_of_study IS NULL);
