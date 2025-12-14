/*
  # Add Row Level Security Policies

  1. Security Policies
    - Applications table policies
      - Create, read, update own applications
    - Essay reviews table policies
      - Create, read, update own essays
    - Chat messages table policies
      - Create and read own messages

  2. Purpose
    - Ensure users can only access their own data
    - Prevent unauthorized access to sensitive information
*/

-- Create policies for applications
CREATE POLICY "Applications insert policy"
  ON applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Applications select policy"
  ON applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Applications update policy"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for essay reviews
CREATE POLICY "Essay reviews insert policy"
  ON essay_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Essay reviews select policy"
  ON essay_reviews
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Essay reviews update policy"
  ON essay_reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for chat messages
CREATE POLICY "Chat messages insert policy"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Chat messages select policy"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);