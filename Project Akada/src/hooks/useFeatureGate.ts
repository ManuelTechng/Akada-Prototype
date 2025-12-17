import { useCallback } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { FeatureGate, SubscriptionTier } from '../lib/subscription-types';

interface FeatureGateResult {
  hasAccess: boolean;
  tier: SubscriptionTier;
  requiresUpgrade: boolean;
  upgradeMessage: string;
  requiredTier: SubscriptionTier;
}

/**
 * Hook for checking feature access with subscription gates
 *
 * @example
 * ```tsx
 * const { hasAccess, requiresUpgrade, upgradeMessage } = useFeatureGate(FeatureGate.UNLIMITED_AI_RECOMMENDATIONS);
 *
 * if (!hasAccess) {
 *   return <UpgradePrompt message={upgradeMessage} />;
 * }
 * ```
 */
export function useFeatureGate(feature: FeatureGate): FeatureGateResult {
  const { tier, hasFeature, upgradePrompt } = useSubscription();

  const hasAccess = hasFeature(feature);
  const requiresUpgrade = !hasAccess;

  const { required, message } = upgradePrompt(feature);

  return {
    hasAccess,
    tier,
    requiresUpgrade,
    upgradeMessage: message,
    requiredTier: required,
  };
}

/**
 * Hook for checking usage limits
 *
 * @example
 * ```tsx
 * const { checkLimit } = useUsageLimit();
 *
 * const { current, max, canUse } = await checkLimit('savedPrograms');
 * if (!canUse) {
 *   // Show upgrade prompt
 * }
 * ```
 */
export function useUsageLimit() {
  const { checkLimit: checkLimitFn, tier } = useSubscription();

  const checkLimit = useCallback(
    async (limitType: 'savedPrograms' | 'applications' | 'documentReviews') => {
      return await checkLimitFn(limitType);
    },
    [checkLimitFn]
  );

  return {
    checkLimit,
    tier,
  };
}
