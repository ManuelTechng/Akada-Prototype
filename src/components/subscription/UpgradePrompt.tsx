import { Crown, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SubscriptionTier, SUBSCRIPTION_PLANS } from '../../lib/subscription-types';
import { cn } from '../../lib/utils';

interface UpgradePromptProps {
  requiredTier: SubscriptionTier;
  message?: string;
  feature?: string;
  variant?: 'banner' | 'modal' | 'inline';
  className?: string;
}

export function UpgradePrompt({
  requiredTier,
  message,
  feature,
  variant = 'inline',
  className,
}: UpgradePromptProps) {
  const navigate = useNavigate();
  const plan = SUBSCRIPTION_PLANS[requiredTier];

  const handleUpgrade = () => {
    navigate('/app/billing');
  };

  const Icon = requiredTier === 'premium' ? Crown : Sparkles;

  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-4 shadow-lg',
          className
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-foreground/20 rounded-lg">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">
                Upgrade to {plan.displayName}
              </h3>
              <p className="text-sm text-primary-foreground/90">
                {message || `Unlock ${feature || 'this feature'} and more`}
              </p>
            </div>
          </div>
          <button
            onClick={handleUpgrade}
            className="px-4 py-2 bg-primary-foreground text-primary rounded-lg hover:bg-primary-foreground/90 transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
          >
            Upgrade Now
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className={cn('bg-card rounded-xl border border-border p-6 shadow-xl max-w-md', className)}>
        <div className="flex flex-col items-center text-center">
          <div className="p-4 bg-primary/10 rounded-full mb-4">
            <Icon className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">
            Upgrade to {plan.displayName}
          </h2>

          <p className="text-muted-foreground mb-6">
            {message || `This feature requires a ${plan.displayName} subscription`}
          </p>

          <div className="w-full bg-muted rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Monthly Price</span>
              <span className="text-2xl font-bold text-foreground">
                {plan.currency} {plan.price.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {plan.features.length} features included
            </p>
          </div>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={handleUpgrade}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
            >
              Upgrade to {plan.displayName}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant (default)
  return (
    <div
      className={cn(
        'bg-muted rounded-lg p-4 border border-border',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">
            {plan.displayName} Feature
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {message || `Upgrade to ${plan.displayName} to access ${feature || 'this feature'}`}
          </p>
          <button
            onClick={handleUpgrade}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2"
          >
            View Plans
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
