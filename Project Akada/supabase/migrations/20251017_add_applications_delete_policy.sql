-- Add missing DELETE policy for applications table
-- This allows users to delete their own application tracking entries

DROP POLICY IF EXISTS "Users can delete their own applications" ON public.applications;
CREATE POLICY "Users can delete their own applications"
  ON public.applications FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);
