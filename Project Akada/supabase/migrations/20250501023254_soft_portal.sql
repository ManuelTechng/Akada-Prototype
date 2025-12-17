/*
  # Fix Favorites Table Policies

  1. Changes:
    - Use DO $$ block to check if policies exist before creating
    - Ensure RLS is enabled
    - Create index for efficient queries

  2. Security:
    - Maintain proper access control for authenticated users
    - Add public read access for development
*/

-- Enable RLS if not already enabled
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create policies safely
DO $$
BEGIN
    -- Check and create "Users can create their own favorites" policy
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'favorites' 
        AND policyname = 'Users can create their own favorites'
    ) THEN
        CREATE POLICY "Users can create their own favorites"
        ON favorites
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Check and create "Users can delete their own favorites" policy
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'favorites' 
        AND policyname = 'Users can delete their own favorites'
    ) THEN
        CREATE POLICY "Users can delete their own favorites"
        ON favorites
        FOR DELETE
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    -- Check and create "Users can view their own favorites" policy
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'favorites' 
        AND policyname = 'Users can view their own favorites'
    ) THEN
        CREATE POLICY "Users can view their own favorites"
        ON favorites
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    -- Check and create "Public read access to favorites" policy
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'favorites' 
        AND policyname = 'Public read access to favorites'
    ) THEN
        CREATE POLICY "Public read access to favorites"
        ON favorites
        FOR SELECT
        TO public
        USING (true);
    END IF;
END $$;

-- Create index for efficient queries if it doesn't exist
CREATE INDEX IF NOT EXISTS favorites_user_program_idx 
ON favorites(user_id, program_id);