/*
  # Disable Authentication Requirements for MVP

  1. Changes
    - Remove RLS policies temporarily
    - Add public access to required tables
    - Keep table structure intact for future auth implementation

  2. Purpose
    - Allow development and testing without auth requirements
    - Maintain data structure for future auth implementation
*/

-- Temporarily disable RLS
ALTER TABLE programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE essay_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Add public access policies
CREATE POLICY "Public read access to programs"
  ON programs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to favorites"
  ON favorites FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to applications"
  ON applications FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to essay_reviews"
  ON essay_reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to chat_messages"
  ON chat_messages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to user_profiles"
  ON user_profiles FOR SELECT
  TO public
  USING (true);