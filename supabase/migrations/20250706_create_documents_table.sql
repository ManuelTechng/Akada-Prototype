/*
  # Create Documents Table and Storage Bucket

  1. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `filename` (text)
      - `url` (text)
      - `type` (enum: sop, cv, transcript, recommendation, other)
      - `status` (enum: uploading, pending, reviewed, error)
      - `feedback` (text, nullable)
      - `file_size` (bigint, nullable)
      - `mime_type` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Storage Bucket
    - Create 'documents' bucket for file storage
    - Set appropriate policies for authenticated users

  3. Security
    - Enable RLS on documents table
    - Add policies for authenticated users
    - Storage policies for document uploads
*/

-- Create enum types for documents
CREATE TYPE document_type AS ENUM ('sop', 'cv', 'transcript', 'recommendation', 'other');
CREATE TYPE document_status AS ENUM ('uploading', 'pending', 'reviewed', 'error');

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  url text NOT NULL,
  type document_type NOT NULL DEFAULT 'other',
  status document_status NOT NULL DEFAULT 'pending',
  feedback text,
  file_size bigint,
  mime_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX documents_user_id_idx ON documents(user_id);
CREATE INDEX documents_type_idx ON documents(type);
CREATE INDEX documents_status_idx ON documents(status);
CREATE INDEX documents_created_at_idx ON documents(created_at DESC);

-- Create RLS policies for documents table
CREATE POLICY "Users can view own documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for documents (this needs to be run in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage policies (these need to be created in Supabase dashboard or via API)
-- Allow authenticated users to upload their own documents
-- CREATE POLICY "Users can upload documents" ON storage.objects 
--   FOR INSERT TO authenticated 
--   WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their own documents
-- CREATE POLICY "Users can view own documents" ON storage.objects 
--   FOR SELECT TO authenticated 
--   USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own documents
-- CREATE POLICY "Users can delete own documents" ON storage.objects 
--   FOR DELETE TO authenticated 
--   USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

COMMENT ON TABLE documents IS 'User-uploaded documents for AI review and application purposes';
