"use client";

import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Play, CheckCircle2, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';

const LandingHeroMinimalist: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const stats = [
    { value: '200+', label: 'Active Students' },
    { value: '12', label: 'Countries' },
    { value: '100+', label: 'Programs' }
  ];

  const quickWins = [
    'AI-powered matching',
    'Instant recommendations',
    'Application tracking',
    'Free to start'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % stats.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [stats.length]);

  return (
    <section className="relative min-h-screen bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Minimal grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

      {/* Single accent gradient */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>

      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20 lg:px-8">
        {/* Badge */}
        <div className="flex justify-center mb-12 animate-in fade-in slide-in-from-top duration-700">
          <Badge
            variant="outline"
            className="px-4 py-2 text-sm font-semibold border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-primary transition-colors"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            Trusted by 200+ students worldwide
          </Badge>
        </div>

        {/* Hero Headline - Sharp & Direct */}
        <div className="text-center mb-16 space-y-8">
          <h1
            className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-none"
            style={{ animation: 'fadeIn 0.8s ease-out 0.2s both' }}
          >
            <span className="block text-zinc-900 dark:text-white mb-2">
              Democratizing
            </span>
            <span className="block bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
              Global Education
            </span>
            <span className="block text-zinc-900 dark:text-white text-5xl sm:text-6xl lg:text-7xl mt-2">
              For African Students
            </span>
          </h1>

          <p
            className="text-xl sm:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto font-medium leading-relaxed"
            style={{ animation: 'fadeIn 0.8s ease-out 0.4s both' }}
          >
            Explore, plan, and apply to programs worldwide with personalized AI guidance.
            <span className="block mt-2 text-lg text-zinc-500 dark:text-zinc-500">Tech, business, and beyond—all in one place.</span>
          </p>

          {/* CTAs - Bold & Simple */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            style={{ animation: 'fadeIn 0.8s ease-out 0.6s both' }}
          >
            <Button
              asChild
              size="lg"
              className="group h-14 px-8 text-base font-bold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300"
            >
              <Link to="/signup">
                Start Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-8 text-base font-bold border-2 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <Link to="/demo">
                <Play className="h-5 w-5" />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Quick wins list */}
          <div
            className="flex flex-wrap justify-center gap-6 pt-8"
            style={{ animation: 'fadeIn 0.8s ease-out 0.8s both' }}
          >
            {quickWins.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Stats - Minimal Cards */}
        <div
          className="grid grid-cols-3 gap-6 max-w-4xl mx-auto mb-20"
          style={{ animation: 'fadeIn 0.8s ease-out 1s both' }}
        >
          {stats.map((stat, index) => (
            <Card
              key={index}
              className={`relative p-8 text-center border-2 transition-all duration-500 cursor-default ${
                activeIndex === index
                  ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-lg'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                {stat.label}
              </div>

              {activeIndex === index && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              )}
            </Card>
          ))}
        </div>

        {/* Social Proof - Minimal */}
        <div
          className="max-w-5xl mx-auto"
          style={{ animation: 'fadeIn 0.8s ease-out 1.2s both' }}
        >
          <Card className="p-12 border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                  <span className="ml-2 text-lg font-bold text-zinc-900 dark:text-white">4.9/5</span>
                </div>
                <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">
                  "Akada simplified my entire application process. Got into my dream program in Canada!"
                </p>
                <p className="mt-3 text-sm font-semibold text-zinc-500 dark:text-zinc-500">
                  — Chioma O., University of Toronto
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 min-w-[180px]">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">95% Success Rate</span>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 font-bold">
                  Join 200+ Students
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Minimal CTA Strip */}
        <div
          className="mt-20 text-center"
          style={{ animation: 'fadeIn 0.8s ease-out 1.4s both' }}
        >
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-4">
            FEATURED IN
          </p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-40">
            {['TechCrunch', 'Forbes', 'EdTech', 'StartupWeekly', 'VentureBeat'].map((brand, index) => (
              <div key={index} className="text-lg font-black text-zinc-400 dark:text-zinc-600">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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

export default LandingHeroMinimalist;
