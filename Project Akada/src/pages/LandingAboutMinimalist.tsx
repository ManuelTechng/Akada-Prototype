import React from 'react';
import { Target, Users } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const LandingAboutMinimalist: React.FC = () => {
  return (
    <section className="py-32 bg-zinc-50 dark:bg-zinc-900" id="about">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge
            variant="outline"
            className="mb-6 px-4 py-2 text-sm font-semibold border-2 border-zinc-200 dark:border-zinc-800"
          >
            About Akada
          </Badge>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-zinc-900 dark:text-white mb-6">
            Built by Students.
            <span className="block mt-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              For Students.
            </span>
          </h2>
        </div>

        {/* Story & Mission Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {/* Our Story */}
          <Card className="p-10 border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                <Users className="h-8 w-8 text-zinc-900 dark:text-white" />
              </div>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-white">Our Story</h3>
            </div>

            <div className="space-y-4 text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>
                Akada was born from our founder's personal struggle with international applications.
                After experiencing the confusion and lack of guidance firsthand, he built the solution he wished he had.
              </p>
              <p>
                The name "Akada" comes from the Yoruba word for student, reflecting our deep connection
                to Nigerian education and commitment to helping students achieve their global academic dreams.
              </p>
              <p className="font-medium text-zinc-900 dark:text-white">
                Today, we're Nigeria's first AI-powered platform for international education.
              </p>
            </div>
          </Card>

          {/* Our Mission */}
          <Card className="p-10 border-2 border-primary bg-white dark:bg-zinc-950 relative overflow-hidden">
            {/* Accent gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl"></div>

            <div className="relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-primary text-white">
                  <Target className="h-8 w-8" />
                </div>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white">Our Mission</h3>
              </div>

              <div className="space-y-4 text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <p className="font-medium text-zinc-900 dark:text-white">
                  Empower Nigerian students with the tools and guidance they need to access world-class technology education globally.
                </p>
                <p>
                  We believe talent is universal, but opportunity is not. Our platform bridges this gap by making
                  international applications transparent, accessible, and achievable.
                </p>
                <div className="pt-4 border-t-2 border-zinc-200 dark:border-zinc-800">
                  <p className="text-2xl font-black text-zinc-900 dark:text-white">
                    10,000 students
                  </p>
                  <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                    Our 2025 Goal
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Accessibility', description: 'Education opportunities for every Nigerian student' },
            { title: 'Transparency', description: 'Clear, honest guidance every step of the way' },
            { title: 'Excellence', description: 'World-class tools powered by cutting-edge AI' }
          ].map((value, index) => (
            <Card
              key={index}
              className="p-8 border-2 border-zinc-200 dark:border-zinc-800 text-center hover:border-primary transition-all duration-300"
            >
              <h4 className="text-xl font-black text-zinc-900 dark:text-white mb-3">{value.title}</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{value.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingAboutMinimalist;
