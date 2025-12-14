/*
  # Create Programs and Favorites Schema

  1. New Tables
    - `programs`
      - `id` (uuid, primary key)
      - `university` (text)
      - `name` (text)
      - `degree_type` (text)
      - `country` (text)
      - `tuition_fee` (integer)
      - `created_at` (timestamptz)

    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `program_id` (uuid, references programs)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university text NOT NULL,
  name text NOT NULL,
  degree_type text NOT NULL,
  country text NOT NULL,
  tuition_fee integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  program_id uuid REFERENCES programs(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, program_id)
);

-- Enable RLS
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Programs are viewable by all authenticated users" ON programs;
  DROP POLICY IF EXISTS "Users can create their own favorites" ON favorites;
  DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;
  DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policies for programs
CREATE POLICY "Programs are viewable by all authenticated users"
  ON programs
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for favorites
CREATE POLICY "Users can create their own favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for program search
DROP INDEX IF EXISTS programs_search_idx;
CREATE INDEX programs_search_idx ON programs USING gin(
  to_tsvector('english', name || ' ' || university)
);

-- Create index for favorites lookup
DROP INDEX IF EXISTS favorites_user_program_idx;
CREATE INDEX favorites_user_program_idx ON favorites(user_id, program_id);