import React from 'react';
import { X, Check } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const LandingProblemSolutionMinimalist: React.FC = () => {
  const problems = [
    "Overwhelming application processes",
    "No personalized guidance",
    "Hard to find matching programs",
    "Limited scholarship access",
    "Visa requirement uncertainty"
  ];

  const solutions = [
    "Step-by-step application guidance",
    "AI-powered recommendations",
    "Smart matching algorithm",
    "Comprehensive scholarship database",
    "Detailed visa checklists"
  ];

  return (
    <section className="py-32 bg-zinc-50 dark:bg-zinc-900 relative overflow-hidden" id="problem-solution">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge
            variant="outline"
            className="mb-6 px-4 py-2 text-sm font-semibold border-2 border-zinc-200 dark:border-zinc-800"
          >
            The Problem & Solution
          </Badge>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-zinc-900 dark:text-white mb-6">
            Stop Struggling.
            <span className="block mt-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Start Succeeding.
            </span>
          </h2>
        </div>

        {/* Two Column Comparison */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Without Akada */}
          <Card className="p-10 border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                <X className="h-8 w-8 text-zinc-900 dark:text-white" />
              </div>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-white">Without Akada</h3>
            </div>

            <ul className="space-y-4 mb-8">
              {problems.map((problem, index) => (
                <li key={index} className="flex items-start gap-3">
                  <X className="h-6 w-6 text-zinc-400 flex-shrink-0 mt-0.5" />
                  <span className="text-base text-zinc-600 dark:text-zinc-400">{problem}</span>
                </li>
              ))}
            </ul>

            <Card className="p-6 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 italic leading-relaxed mb-4">
                "I spent months researching programs, only to miss deadlines and opportunities."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white font-bold">
                  C
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">Chioma O.</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">CS Student</p>
                </div>
              </div>
            </Card>
          </Card>

          {/* With Akada */}
          <Card className="p-10 border-2 border-primary bg-white dark:bg-zinc-950 relative overflow-hidden">
            {/* Accent gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl"></div>

            <div className="relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-primary text-white">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white">With Akada</h3>
              </div>

              <ul className="space-y-4 mb-8">
                {solutions.map((solution, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-base text-zinc-600 dark:text-zinc-400 font-medium">{solution}</span>
                  </li>
                ))}
              </ul>

              <Card className="p-6 bg-primary/5 dark:bg-primary/10 border-2 border-primary/20">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 italic leading-relaxed mb-4">
                  "Found and applied to three programs in two weeks, with scholarships I never knew existed."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">Adebayo T.</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">Software Engineer</p>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LandingProblemSolutionMinimalist;
