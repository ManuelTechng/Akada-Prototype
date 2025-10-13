-- USER PROFILES
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

-- APPLICATIONS
DROP POLICY IF EXISTS "Users can create their own applications" ON public.applications;
CREATE POLICY "Users can create their own applications"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own applications" ON public.applications;
CREATE POLICY "Users can update their own applications"
  ON public.applications FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own applications" ON public.applications;
CREATE POLICY "Users can view their own applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- CHAT MESSAGES
DROP POLICY IF EXISTS "Users can create chat messages" ON public.chat_messages;
CREATE POLICY "Users can create chat messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own chat messages" ON public.chat_messages;
CREATE POLICY "Users can view their own chat messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ESSAY REVIEWS
DROP POLICY IF EXISTS "Users can create essays" ON public.essay_reviews;
CREATE POLICY "Users can create essays"
  ON public.essay_reviews FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own essays" ON public.essay_reviews;
CREATE POLICY "Users can update their own essays"
  ON public.essay_reviews FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own essays" ON public.essay_reviews;
CREATE POLICY "Users can view their own essays"
  ON public.essay_reviews FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- FAVORITES
DROP POLICY IF EXISTS "Users can create their own favorites" ON public.favorites;
CREATE POLICY "Users can create their own favorites"
  ON public.favorites FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;
CREATE POLICY "Users can delete their own favorites"
  ON public.favorites FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- If you have other policies using auth.uid(), update them similarly. 