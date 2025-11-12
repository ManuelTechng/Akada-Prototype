import React from 'react';
import { FeatureGate as FeatureGateEnum } from '../../lib/subscription-types';
import { useFeatureGate } from '../../hooks/useFeatureGate';
import { UpgradePrompt } from './UpgradePrompt';

interface FeatureGateProps {
  feature: FeatureGateEnum;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  upgradeVariant?: 'banner' | 'modal' | 'inline';
}

/**
 * Feature Gate Component
 *
 * Wraps content that requires specific subscription tiers.
 * Shows upgrade prompt if user doesn't have access.
 *
 * @example
 * ```tsx
 * <FeatureGate feature={FeatureGate.UNLIMITED_AI_RECOMMENDATIONS}>
 *   <AIRecommendations />
 * </FeatureGate>
 * ```
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  upgradeVariant = 'inline',
}: FeatureGateProps) {
  const { hasAccess, requiresUpgrade, upgradeMessage, requiredTier } = useFeatureGate(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <UpgradePrompt
      requiredTier={requiredTier}
      message={upgradeMessage}
      variant={upgradeVariant}
    />
  );
}
