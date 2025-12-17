import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import {
  SubscriptionTier,
  UserSubscription,
  FeatureGate,
  SUBSCRIPTION_PLANS,
  FEATURE_ACCESS,
} from '../lib/subscription-types';

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  tier: SubscriptionTier;
  loading: boolean;
  error: Error | null;

  // Feature gates
  hasFeature: (feature: FeatureGate) => boolean;
  canAccessFeature: (feature: FeatureGate) => boolean;

  // Usage tracking
  checkLimit: (limitType: 'savedPrograms' | 'applications' | 'documentReviews') => Promise<{
    current: number;
    max: number;
    canUse: boolean;
    isUnlimited: boolean;
  }>;

  // Subscription management
  refreshSubscription: () => Promise<void>;
  upgradePrompt: (feature: FeatureGate) => {
    required: SubscriptionTier;
    message: string;
  };
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  tier: 'free',
  loading: true,
  error: null,
  hasFeature: () => false,
  canAccessFeature: () => false,
  checkLimit: async () => ({ current: 0, max: 0, canUse: false, isUnlimited: false }),
  refreshSubscription: async () => {},
  upgradePrompt: () => ({ required: 'basic', message: '' }),
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user subscription
  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setTier('free');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_subscriptions' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        throw error;
      }

      if (data) {
        setSubscription(data as unknown as UserSubscription);
        setTier((data as unknown as UserSubscription).tier);
      } else {
        setSubscription(null);
        setTier('free');
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
      setSubscription(null);
      setTier('free');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user, isAuthenticated]);

  // Check if user has a specific feature
  const hasFeature = (feature: FeatureGate): boolean => {
    const tierFeatures = FEATURE_ACCESS[tier];
    return tierFeatures.includes(feature);
  };

  // Alias for hasFeature (semantic clarity)
  const canAccessFeature = (feature: FeatureGate): boolean => {
    return hasFeature(feature);
  };

  // Check usage limits
  const checkLimit = async (limitType: 'savedPrograms' | 'applications' | 'documentReviews') => {
    if (!user) {
      return { current: 0, max: 0, canUse: false, isUnlimited: false };
    }

    const plan = SUBSCRIPTION_PLANS[tier];
    let max: number;
    let tableName: string;

    switch (limitType) {
      case 'savedPrograms':
        max = plan.limits.maxSavedPrograms;
        tableName = 'saved_programs';
        break;
      case 'applications':
        max = plan.limits.maxApplications;
        tableName = 'applications';
        break;
      case 'documentReviews':
        max = plan.limits.maxDocumentReviews;
        tableName = 'document_reviews';
        break;
      default:
        return { current: 0, max: 0, canUse: false, isUnlimited: false };
    }

    // Check if unlimited (-1 means unlimited)
    const isUnlimited = max === -1;

    if (isUnlimited) {
      return { current: 0, max: -1, canUse: true, isUnlimited: true };
    }

    // Get current usage
    try {
      const { count, error } = await supabase
        .from(tableName as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;

      const current = count || 0;
      const canUse = current < max;

      return { current, max, canUse, isUnlimited };
    } catch (err) {
      console.error(`Error checking ${limitType} limit:`, err);
      return { current: 0, max, canUse: false, isUnlimited };
    }
  };

  // Get upgrade prompt for a feature
  const upgradePrompt = (feature: FeatureGate) => {
    // Check which tier has this feature
    let requiredTier: SubscriptionTier = 'basic';

    if (FEATURE_ACCESS.basic.includes(feature)) {
      requiredTier = 'basic';
    }
    if (FEATURE_ACCESS.premium.includes(feature)) {
      requiredTier = 'premium';
    }

    const plan = SUBSCRIPTION_PLANS[requiredTier];

    return {
      required: requiredTier,
      message: `This feature is available on the ${plan.displayName} plan (${plan.currency} ${plan.price.toLocaleString()}/${plan.interval})`,
    };
  };

  const value: SubscriptionContextType = {
    subscription,
    tier,
    loading,
    error,
    hasFeature,
    canAccessFeature,
    checkLimit,
    refreshSubscription: fetchSubscription,
    upgradePrompt,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
