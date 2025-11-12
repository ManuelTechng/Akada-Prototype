import { useState } from 'react';
import {
  CreditCard,
  Download,
  CheckCircle,
  Calendar,
  DollarSign,
  Users,
  Sparkles,
  Crown,
  Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const Billing = () => {
  const { user, profile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('free');

  // Dummy data - can be replaced with real API calls
  const currentPlan = {
    name: 'Free Plan',
    price: 0,
    billingCycle: 'monthly',
    nextBillingDate: 'N/A',
    status: 'active'
  };

  const billingHistory = [
    { id: 1, date: '2025-01-15', amount: 0, status: 'paid', description: 'Free Plan' },
    { id: 2, date: '2024-12-15', amount: 0, status: 'paid', description: 'Free Plan' },
    { id: 3, date: '2024-11-15', amount: 0, status: 'paid', description: 'Free Plan' },
  ];

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      icon: Users,
      features: [
        'Search up to 10 programs',
        'Basic application tracking',
        'Email support',
        'Limited AI recommendations'
      ],
      limitations: 'Perfect for exploring the platform'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19.99,
      icon: Sparkles,
      popular: true,
      features: [
        'Unlimited program searches',
        'Advanced application tracking',
        'Priority email support',
        'AI-powered recommendations',
        'Document review assistance',
        'Deadline reminders'
      ],
      limitations: 'Best for serious applicants'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 49.99,
      icon: Crown,
      features: [
        'Everything in Pro',
        'One-on-one consultation',
        'Dedicated success manager',
        'Custom application strategies',
        'Unlimited document reviews',
        'Priority application processing',
        'Exclusive scholarship alerts'
      ],
      limitations: 'For maximum success'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-semibold text-foreground">Current Plan</h2>
              <span className="px-3 py-1 bg-chart-1/10 text-chart-1 text-xs font-medium rounded-full">
                Active
              </span>
            </div>
            <p className="text-2xl font-bold text-primary mb-1">
              ${currentPlan.price.toFixed(2)}<span className="text-sm text-muted-foreground font-normal">/month</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {currentPlan.nextBillingDate !== 'N/A' ? `Next billing date: ${currentPlan.nextBillingDate}` : 'No upcoming charges'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors">
              Change Plan
            </button>
            {currentPlan.price > 0 && (
              <button className="px-4 py-2 border border-destructive/50 text-destructive rounded-lg hover:bg-destructive/10 transition-colors">
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={cn(
                  'relative bg-card rounded-xl border-2 p-6 transition-all cursor-pointer hover:shadow-lg',
                  selectedPlan === plan.id
                    ? 'border-primary shadow-lg'
                    : 'border-border',
                  plan.popular && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                )}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    'p-2 rounded-lg',
                    plan.popular
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-3xl font-bold text-foreground">
                    ${plan.price.toFixed(2)}
                    <span className="text-sm text-muted-foreground font-normal">/month</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{plan.limitations}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-chart-1 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={cn(
                    'w-full py-2.5 rounded-lg font-medium transition-colors',
                    plan.id === 'free'
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : plan.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-card border-2 border-primary text-primary hover:bg-primary/10'
                  )}
                  disabled={plan.id === 'free'}
                >
                  {plan.id === 'free' ? 'Current Plan' : 'Upgrade Now'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Payment Method</h2>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">
            Add Payment Method
          </button>
        </div>

        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <CreditCard className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">No payment method added</p>
              <p className="text-xs text-muted-foreground mt-1">Add a payment method to upgrade your plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Billing History</h2>
          <button className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((invoice) => (
                <tr key={invoice.id} className="border-b border-border last:border-0">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-foreground">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{invoice.date}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-foreground">{invoice.description}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1 text-foreground">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{invoice.amount.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-chart-1/10 text-chart-1 text-xs font-medium rounded-full">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-primary hover:text-primary/80 text-sm flex items-center gap-1 ml-auto">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Billing;
