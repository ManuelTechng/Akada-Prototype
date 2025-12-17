import React from 'react';
import { Check, X } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const LandingPricingMinimalist: React.FC = () => {
  const plans = [
    {
      name: "Free",
      price: "₦0",
      period: "forever",
      description: "Try Akada risk-free",
      features: [
        { name: "Basic program search", included: true },
        { name: "Save up to 3 programs", included: true },
        { name: "5 AI questions/day", included: true },
        { name: "Application checklist", included: true },
        { name: "Essay review", included: false },
        { name: "Scholarship matching", included: false },
        { name: "Visa guidance", included: false },
        { name: "Priority support", included: false }
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Standard",
      price: "₦3,000",
      period: "month",
      description: "Best for most students",
      features: [
        { name: "Advanced search", included: true },
        { name: "Unlimited saves", included: true },
        { name: "Unlimited AI chat", included: true },
        { name: "Full application tracker", included: true },
        { name: "Essay review", included: true },
        { name: "Scholarship matching", included: true },
        { name: "Visa guidance", included: false },
        { name: "Priority support", included: false }
      ],
      cta: "Get Started",
      popular: true
    },
    {
      name: "Premium",
      price: "₦7,000",
      period: "month",
      description: "Maximum support",
      features: [
        { name: "Everything in Standard", included: true },
        { name: "Unlimited saves", included: true },
        { name: "Unlimited AI chat", included: true },
        { name: "Full application tracker", included: true },
        { name: "Advanced essay review", included: true },
        { name: "Scholarship matching", included: true },
        { name: "Complete visa guidance", included: true },
        { name: "Priority support", included: true }
      ],
      cta: "Get Started",
      popular: false
    }
  ];

  return (
    <section className="py-32 bg-white dark:bg-zinc-950" id="pricing">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge
            variant="outline"
            className="mb-6 px-4 py-2 text-sm font-semibold border-2 border-zinc-200 dark:border-zinc-800"
          >
            Pricing
          </Badge>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-zinc-900 dark:text-white mb-6">
            Simple Pricing.
            <span className="block mt-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Start Free.
            </span>
          </h2>

          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium">
            Choose your plan. Upgrade anytime. No commitments.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative p-8 border-2 transition-all duration-300 ${
                plan.popular
                  ? 'border-primary shadow-2xl shadow-primary/20 scale-105'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              } bg-white dark:bg-zinc-950`}
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white border-none px-4 py-1 font-bold">
                  Most Popular
                </Badge>
              )}

              {/* Plan Header */}
              <div className="mb-8">
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-5xl font-black text-zinc-900 dark:text-white">{plan.price}</span>
                  <span className="text-lg text-zinc-500 dark:text-zinc-500">/{plan.period}</span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">{plan.description}</p>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-zinc-300 dark:text-zinc-700 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${
                      feature.included
                        ? 'text-zinc-700 dark:text-zinc-300 font-medium'
                        : 'text-zinc-400 dark:text-zinc-600'
                    }`}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                asChild
                size="lg"
                className={`w-full h-12 font-bold ${
                  plan.popular
                    ? 'bg-primary hover:bg-primary/90'
                    : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'
                }`}
              >
                <a href="#signup">{plan.cta}</a>
              </Button>
            </Card>
          ))}
        </div>

        {/* Enterprise CTA */}
        <Card className="p-12 border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-center">
          <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-4">
            Need a Custom Solution?
          </h3>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
            Special rates for schools and organizations. Let's talk.
          </p>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 px-8 font-bold border-2"
          >
            <a href="mailto:contact@akada.edu.ng">Contact Us</a>
          </Button>
        </Card>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default LandingPricingMinimalist;
