import React from 'react';
import { Check, X } from 'lucide-react';

const LandingPricing: React.FC = () => {
  const plans = [
    {
      name: "Free",
      price: "₦0",
      period: "forever",
      description: "Basic features to get started",
      features: [
        { name: "Basic program search", included: true },
        { name: "Save up to 3 programs", included: true },
        { name: "Limited AI chat (5 questions/day)", included: true },
        { name: "Basic application checklist", included: true },
        { name: "AI essay review", included: false },
        { name: "Scholarship matching", included: false },
        { name: "Visa application guidance", included: false },
        { name: "Priority support", included: false }
      ],
      buttonText: "Get Started",
      buttonClass: "bg-white text-indigo-600 border border-indigo-600"
    },
    {
      name: "Standard",
      price: "₦3,000",
      period: "per month",
      description: "Everything you need for successful applications",
      features: [
        { name: "Advanced program search", included: true },
        { name: "Unlimited program saves", included: true },
        { name: "Unlimited AI chat", included: true },
        { name: "Detailed application checklist", included: true },
        { name: "Basic AI essay review", included: true },
        { name: "Scholarship matching", included: true },
        { name: "Visa application guidance", included: false },
        { name: "Priority support", included: false }
      ],
      buttonText: "Subscribe",
      buttonClass: "bg-indigo-600 text-white",
      popular: true
    },
    {
      name: "Premium",
      price: "₦7,000",
      period: "per month",
      description: "Maximum support for serious applicants",
      features: [
        { name: "Advanced program search", included: true },
        { name: "Unlimited program saves", included: true },
        { name: "Unlimited AI chat", included: true },
        { name: "Detailed application checklist", included: true },
        { name: "Advanced AI essay review", included: true },
        { name: "Scholarship matching", included: true },
        { name: "Visa application guidance", included: true },
        { name: "Priority support", included: true }
      ],
      buttonText: "Subscribe",
      buttonClass: "bg-white text-indigo-600 border border-indigo-600"
    }
  ];

  return (
    <section className="py-16 md:py-24" id="pricing">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl shadow-md p-8 relative ${plan.popular ? 'ring-2 ring-indigo-600' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-500">/{plan.period}</span>
              </div>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300 mt-0.5 mr-3 flex-shrink-0" />
                    )}
                    <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
              <a 
                href="#signup" 
                className={`block w-full py-3 rounded-md text-center font-medium transition-colors ${plan.buttonClass}`}
              >
                {plan.buttonText}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gray-100 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Need a Custom Solution?</h3>
          <p className="text-gray-600 mb-6">
            We offer special rates for schools and organizations. Contact us to learn more.
          </p>
          <a 
            href="mailto:contact@akada.edu.ng" 
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
};

export default LandingPricing;