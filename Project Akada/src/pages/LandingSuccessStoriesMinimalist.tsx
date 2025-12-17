import React from 'react';
import { Star } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const LandingSuccessStoriesMinimalist: React.FC = () => {
  const stories = [
    {
      quote: "Akada made the entire process simple. Found my perfect program and got accepted within weeks.",
      name: "Chidi Okonkwo",
      position: "MSc AI, Canada",
      initials: "CO",
      rating: 5
    },
    {
      quote: "I discovered programs I never knew existed. The AI guidance was exactly what I needed.",
      name: "Aisha Bello",
      position: "BSc CompSci, UK",
      initials: "AB",
      rating: 5
    },
    {
      quote: "Works perfectly even with slow internet. Built for Nigerian students by people who understand.",
      name: "Femi Adekunle",
      position: "Engineering Student",
      initials: "FA",
      rating: 5
    }
  ];

  return (
    <section className="py-32 bg-zinc-50 dark:bg-zinc-900" id="success-stories">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge
            variant="outline"
            className="mb-6 px-4 py-2 text-sm font-semibold border-2 border-zinc-200 dark:border-zinc-800"
          >
            Student Success
          </Badge>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-zinc-900 dark:text-white mb-6">
            Real Stories.
            <span className="block mt-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Real Results.
            </span>
          </h2>
        </div>

        {/* Stories Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <Card
              key={index}
              className="p-8 border-2 border-zinc-200 dark:border-zinc-800 hover:border-primary transition-all duration-300 bg-white dark:bg-zinc-950"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Rating Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(story.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8 italic">
                "{story.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t-2 border-zinc-100 dark:border-zinc-800">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                  {story.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">{story.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">{story.position}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { value: '200+', label: 'Success Stories' },
            { value: '4.9/5', label: 'Average Rating' },
            { value: '95%', label: 'Acceptance Rate' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
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

export default LandingSuccessStoriesMinimalist;
