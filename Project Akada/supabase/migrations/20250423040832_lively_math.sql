/*
  # Add Application Management Tables

  1. New Tables
    - `applications`
      - Track application status and deadlines
      - Store notes and progress
    - `essay_reviews`
      - Store and manage essay content
      - Track AI feedback
    - `chat_messages`
      - Store chat history with AI assistant

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for authenticated users
*/

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  program_id uuid REFERENCES programs(id) NOT NULL,
  status text NOT NULL DEFAULT 'planning',
  deadline date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create essay_reviews table
CREATE TABLE IF NOT EXISTS essay_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  essay_type text NOT NULL CHECK (essay_type IN ('sop', 'cv')),
  content text NOT NULL,
  feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  content text NOT NULL,
  is_ai boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE essay_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_essay_reviews_updated_at
  BEFORE UPDATE ON essay_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();