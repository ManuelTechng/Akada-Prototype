import React, { useState } from 'react';
import { Search, MessageSquare, FileCheck, Target, Award, Rocket, ArrowRight, Zap } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const LandingFeaturesMinimalist: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features = [
    {
      icon: Search,
      title: "Smart Search",
      description: "Find programs that match your profile in seconds. AI filters through 100+ options.",
      stat: "100+",
      statLabel: "Programs"
    },
    {
      icon: MessageSquare,
      title: "24/7 AI Chat",
      description: "Get instant answers about applications, requirements, and deadlines.",
      stat: "24/7",
      statLabel: "Available"
    },
    {
      icon: FileCheck,
      title: "Essay Review",
      description: "AI-powered feedback to make your essays stand out from the competition.",
      stat: "95%",
      statLabel: "Improved"
    },
    {
      icon: Target,
      title: "Track Progress",
      description: "Never miss a deadline. Monitor every step from draft to submission.",
      stat: "0",
      statLabel: "Missed Deadlines"
    },
    {
      icon: Award,
      title: "Find Funding",
      description: "Discover scholarships tailored for African students studying abroad.",
      stat: "50+",
      statLabel: "Scholarships"
    },
    {
      icon: Rocket,
      title: "Visa Guide",
      description: "Step-by-step visa guidance with country-specific requirements.",
      stat: "12",
      statLabel: "Countries"
    }
  ];

  return (
    <section className="py-32 bg-white dark:bg-zinc-950 relative overflow-hidden" id="features">
      {/* Minimal accent */}
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header - Sharp */}
        <div className="text-center mb-20">
          <Badge
            variant="outline"
            className="mb-6 px-4 py-2 text-sm font-semibold border-2 border-zinc-200 dark:border-zinc-800"
          >
            Features
          </Badge>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-zinc-900 dark:text-white mb-6">
            Everything You Need.
            <span className="block mt-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Nothing You Don't.
            </span>
          </h2>

          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium">
            Powerful tools designed specifically for students applying to international programs.
          </p>
        </div>

        {/* Features Grid - Minimal Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className={`group relative p-8 border-2 transition-all duration-300 cursor-default ${
                  hoveredIndex === index
                    ? 'border-primary shadow-2xl shadow-primary/10 -translate-y-2'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Icon */}
                <div className="mb-6">
                  <div className={`inline-flex p-4 rounded-2xl transition-all duration-300 ${
                    hoveredIndex === index
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white'
                  }`}>
                    <Icon className="h-7 w-7" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Stat Badge */}
                <div className="mt-6 inline-flex items-baseline gap-2">
                  <span className="text-3xl font-black text-primary">{feature.stat}</span>
                  <span className="text-sm font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
                    {feature.statLabel}
                  </span>
                </div>

                {/* Accent line */}
                {hoveredIndex === index && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Social Proof Numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 max-w-5xl mx-auto">
          {[
            { value: '95%', label: 'Success Rate' },
            { value: '<24h', label: 'Response Time' },
            { value: '4.9/5', label: 'Student Rating' },
            { value: '$10M+', label: 'Scholarships Found' }
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center"
              style={{
                animation: `fadeIn 0.6s ease-out ${1 + index * 0.1}s both`
              }}
            >
              <div className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section - Bold & Minimal */}
        <Card className="relative overflow-hidden border-2 border-primary bg-gradient-to-br from-primary via-blue-600 to-primary">
          {/* Subtle pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>

          <CardContent className="relative p-16 text-center text-white">
            <Badge className="mb-8 bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 font-bold">
              <Zap className="h-4 w-4" />
              Ready to Start?
            </Badge>

            <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
              Join 200+ Students
              <span className="block mt-2">Already Winning</span>
            </h3>

            <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto font-medium">
              Stop researching. Start applying. Your international education journey begins now.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="group h-14 px-10 text-base font-black bg-white text-primary hover:bg-zinc-50 shadow-2xl"
              >
                <a href="#signup">
                  Get Started Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 px-10 text-base font-black border-2 border-white/50 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <a href="#how-it-works">
                  Learn More
                </a>
              </Button>
            </div>

            <p className="text-sm mt-8 opacity-75 font-semibold">
              Free forever • No credit card • 2 min setup
            </p>
          </CardContent>
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

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </section>
  );
};

export default LandingFeaturesMinimalist;
