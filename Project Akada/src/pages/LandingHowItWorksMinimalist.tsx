import React from 'react';
import { Search, FileCheck, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const LandingHowItWorksMinimalist: React.FC = () => {
  const steps = [
    {
      number: "01",
      icon: Search,
      title: "Explore Programs",
      description: "Search 100+ programs tailored to your profile and goals."
    },
    {
      number: "02",
      icon: FileCheck,
      title: "Track Applications",
      description: "Manage deadlines and requirements in one organized place."
    },
    {
      number: "03",
      icon: Sparkles,
      title: "Get AI Guidance",
      description: "Receive personalized help for essays, visas, and more."
    }
  ];

  return (
    <section className="py-32 bg-white dark:bg-zinc-950 relative" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge
            variant="outline"
            className="mb-6 px-4 py-2 text-sm font-semibold border-2 border-zinc-200 dark:border-zinc-800"
          >
            How It Works
          </Badge>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-zinc-900 dark:text-white mb-6">
            Three Steps to
            <span className="block mt-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Your Dream Program
            </span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={index}
                className="relative p-10 border-2 border-zinc-200 dark:border-zinc-800 hover:border-primary transition-all duration-300 group"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.15}s both`
                }}
              >
                {/* Step Number */}
                <div className="absolute top-6 right-6 text-6xl font-black text-zinc-100 dark:text-zinc-900">
                  {step.number}
                </div>

                <div className="relative">
                  {/* Icon */}
                  <div className="mb-8 inline-flex p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Icon className="h-8 w-8" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6 font-medium">
            Ready to begin?
          </p>
          <Button
            asChild
            size="lg"
            className="h-14 px-10 text-base font-bold bg-primary hover:bg-primary/90"
          >
            <a href="#signup">
              Get Started Free
            </a>
          </Button>
        </div>
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

export default LandingHowItWorksMinimalist;
