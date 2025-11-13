/*
  # Subscription & Feature Management Migration

  Creates tables and policies for managing user subscriptions and feature access:
  - user_subscriptions: Tracks active subscriptions and tiers
  - usage_tracking: Monitors feature usage against limits
  - RLS policies for data security
  - Indexes for performance
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USER SUBSCRIPTIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Subscription details
  tier TEXT NOT NULL CHECK (tier IN ('free', 'basic', 'premium')) DEFAULT 'free',
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')) DEFAULT 'active',

  -- Billing period
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
  cancel_at_period_end BOOLEAN DEFAULT false,

  -- Payment info (encrypted/external reference)
  payment_method TEXT,
  payment_provider TEXT,
  external_subscription_id TEXT,

  -- Metadata
  trial_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one active subscription per user
  CONSTRAINT unique_active_subscription
    EXCLUDE USING gist (user_id WITH =)
    WHERE (status = 'active')
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id
  ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status
  ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier
  ON user_subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end
  ON user_subscriptions(current_period_end);

-- ==========================================
-- 2. USAGE TRACKING TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Feature usage
  feature_type TEXT NOT NULL CHECK (feature_type IN (
    'saved_programs',
    'applications',
    'document_reviews',
    'ai_recommendations',
    'api_calls',
    'exports'
  )),

  -- Counters
  usage_count INTEGER DEFAULT 0 NOT NULL,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),

  -- Period tracking (monthly reset)
  period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One tracking record per user per feature per period
  CONSTRAINT unique_user_feature_period
    UNIQUE (user_id, feature_type, period_start)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id
  ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_feature_type
  ON usage_tracking(feature_type);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period
  ON usage_tracking(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_feature
  ON usage_tracking(user_id, feature_type);

-- ==========================================
-- 3. DOCUMENT REVIEWS TABLE (for limit tracking)
-- ==========================================

CREATE TABLE IF NOT EXISTS document_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Document info
  document_type TEXT CHECK (document_type IN ('sop', 'cv', 'lor', 'essay', 'other')),
  document_name TEXT,
  document_url TEXT,

  -- Review details
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  reviewer_notes TEXT,
  ai_feedback JSONB,

  -- Feedback
  feedback_text TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_document_reviews_user_id
  ON document_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_document_reviews_status
  ON document_reviews(status);
CREATE INDEX IF NOT EXISTS idx_document_reviews_created_at
  ON document_reviews(created_at DESC);

-- ==========================================
-- 4. ROW LEVEL SECURITY POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_reviews ENABLE ROW LEVEL SECURITY;

-- User Subscriptions Policies
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Usage Tracking Policies
CREATE POLICY "Users can view own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- Document Reviews Policies
CREATE POLICY "Users can view own document reviews"
  ON document_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own document reviews"
  ON document_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own document reviews"
  ON document_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- ==========================================
-- 5. HELPER FUNCTIONS
-- ==========================================

-- Function to get user's current subscription tier
CREATE OR REPLACE FUNCTION get_user_subscription_tier(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tier TEXT;
BEGIN
  SELECT tier INTO v_tier
  FROM user_subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND current_period_end > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN COALESCE(v_tier, 'free');
END;
$$;

-- Function to check if user has feature access
CREATE OR REPLACE FUNCTION has_feature_access(
  p_user_id UUID,
  p_feature TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tier TEXT;
BEGIN
  v_tier := get_user_subscription_tier(p_user_id);

  -- Feature access logic (simplified - expand as needed)
  CASE v_tier
    WHEN 'premium' THEN
      RETURN TRUE; -- Premium has all features
    WHEN 'basic' THEN
      RETURN p_feature IN (
        'unlimited_program_search',
        'advanced_filters',
        'unlimited_ai_recommendations',
        'ai_document_review',
        'priority_support',
        'document_templates'
      );
    ELSE
      RETURN FALSE; -- Free tier has no gated features
  END CASE;
END;
$$;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_feature_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_period_start TIMESTAMPTZ;
  v_period_end TIMESTAMPTZ;
BEGIN
  -- Get current period bounds (monthly)
  v_period_start := date_trunc('month', NOW());
  v_period_end := v_period_start + INTERVAL '1 month';

  -- Insert or update usage tracking
  INSERT INTO usage_tracking (
    user_id,
    feature_type,
    usage_count,
    last_used_at,
    period_start,
    period_end
  )
  VALUES (
    p_user_id,
    p_feature_type,
    1,
    NOW(),
    v_period_start,
    v_period_end
  )
  ON CONFLICT (user_id, feature_type, period_start)
  DO UPDATE SET
    usage_count = usage_tracking.usage_count + 1,
    last_used_at = NOW(),
    updated_at = NOW();
END;
$$;

-- ==========================================
-- 6. TRIGGERS
-- ==========================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_reviews_updated_at
  BEFORE UPDATE ON document_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 7. INITIAL DATA SEED
-- ==========================================

-- Create default free subscription for existing users
INSERT INTO user_subscriptions (user_id, tier, status, current_period_start, current_period_end)
SELECT
  id,
  'free',
  'active',
  NOW(),
  NOW() + INTERVAL '100 years' -- Free tier doesn't expire
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM user_subscriptions WHERE user_subscriptions.user_id = auth.users.id
)
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON usage_tracking TO authenticated;
GRANT SELECT, INSERT, UPDATE ON document_reviews TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription_tier(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_feature_access(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_usage(UUID, TEXT) TO authenticated;
