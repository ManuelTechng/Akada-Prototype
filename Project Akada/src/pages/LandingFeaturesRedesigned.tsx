import React, { useState } from 'react';
import { Search, MessageSquareText, FileText, CheckSquare, Award, Sparkles, ArrowRight, Zap, Target, Brain, Trophy, Rocket } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const LandingFeaturesRedesigned: React.FC = () => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: <Brain className="h-10 w-10 md:h-12 md:w-12 text-white" />,
      title: "AI-Powered Search",
      description: "Stop endless scrolling. Our AI matches you with programs that actually fit your profile, budget, and dreams.",
      highlight: "Smart matching across 100+ programs",
      gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
      accentColor: "violet",
      emoji: "🧠"
    },
    {
      icon: <MessageSquareText className="h-10 w-10 md:h-12 md:w-12 text-white" />,
      title: "24/7 AI Assistant",
      description: "Your personal guidance counselor that never sleeps. Ask anything about applications, visas, or requirements.",
      highlight: "Instant answers, anytime",
      gradient: "from-amber-500 via-orange-500 to-rose-500",
      accentColor: "orange",
      emoji: "💬"
    },
    {
      icon: <FileText className="h-10 w-10 md:h-12 md:w-12 text-white" />,
      title: "Essay Coach",
      description: "Get detailed feedback on essays and SOPs. Our AI helps you craft compelling stories that admissions teams love.",
      highlight: "Level up your writing",
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      accentColor: "emerald",
      emoji: "✍️"
    },
    {
      icon: <Target className="h-10 w-10 md:h-12 md:w-12 text-white" />,
      title: "Application Tracker",
      description: "Never miss a deadline again. Track everything from essays to rec letters in one organized dashboard.",
      highlight: "Stay on top of deadlines",
      gradient: "from-blue-500 via-indigo-500 to-violet-500",
      accentColor: "blue",
      emoji: "🎯"
    },
    {
      icon: <Trophy className="h-10 w-10 md:h-12 md:w-12 text-white" />,
      title: "Scholarship Finder",
      description: "Discover funding opportunities tailored for African students. We do the research so you don't have to.",
      highlight: "Unlock financial aid",
      gradient: "from-yellow-500 via-amber-500 to-orange-500",
      accentColor: "yellow",
      emoji: "🏆"
    },
    {
      icon: <Rocket className="h-10 w-10 md:h-12 md:w-12 text-white" />,
      title: "Visa Guidance",
      description: "Navigate visa requirements with confidence. Country-specific tips and timelines for Nigerian students.",
      highlight: "Streamline your process",
      gradient: "from-pink-500 via-rose-500 to-red-500",
      accentColor: "pink",
      emoji: "🚀"
    }
  ];

  const testimonialHighlights = [
    { stat: "4.9/5", label: "Student Rating", icon: "⭐" },
    { stat: "95%", label: "Success Rate", icon: "✅" },
    { stat: "<24h", label: "Response Time", icon: "⚡" }
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-emerald-50/30 via-white to-amber-50/30 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 relative overflow-hidden" id="features">
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 border-4 border-amber-400/20 rounded-full animate-bounce" style={{ animationDuration: '3s', animationDelay: '0s' }}></div>
      <div className="absolute bottom-40 right-20 w-16 h-16 border-4 border-emerald-400/20 rotate-45 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 right-10 w-12 h-12 bg-purple-400/10 rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <Badge
            variant="outline"
            className="mb-6 bg-gradient-to-r from-purple-100 to-fuchsia-100 dark:from-purple-950/50 dark:to-fuchsia-950/50 border-purple-300/50 dark:border-purple-700/50 text-purple-800 dark:text-purple-300 px-6 py-2 text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="h-4 w-4 animate-pulse" />
            Everything You Need, Nothing You Don't
          </Badge>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-zinc-900 dark:text-zinc-100 mb-6 leading-tight tracking-tight">
            <span className="block mb-2">Features That</span>
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-400 dark:via-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
              Actually Work
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed font-medium">
            No fluff, no overwhelm. Just powerful tools designed specifically for students navigating international education.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`group relative overflow-hidden border-2 transition-all duration-500 cursor-pointer ${
                hoveredFeature === index
                  ? 'scale-105 shadow-2xl border-transparent -translate-y-2'
                  : 'border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-xl'
              } bg-white dark:bg-zinc-900`}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

              {/* Floating emoji */}
              <div
                className="absolute top-4 right-4 text-3xl opacity-20 group-hover:opacity-40 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12"
                style={{
                  animation: hoveredFeature === index ? 'float 2s ease-in-out infinite' : 'none'
                }}
              >
                {feature.emoji}
              </div>

              <CardHeader className="relative z-10 pb-4">
                {/* Icon with morphing effect */}
                <div className="mb-6 relative">
                  <div
                    className={`inline-flex p-5 rounded-3xl bg-gradient-to-br ${feature.gradient} shadow-xl group-hover:shadow-2xl transition-all duration-500 relative`}
                    style={{
                      transform: hoveredFeature === index ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
                      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  >
                    {feature.icon}
                    {/* Glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-60 blur-2xl transition-opacity duration-500 rounded-3xl`}></div>
                  </div>

                  {/* Animated pulse ring */}
                  {hoveredFeature === index && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-24 h-24 rounded-full border-4 border-${feature.accentColor}-400 animate-ping opacity-30`}></div>
                    </div>
                  )}
                </div>

                {/* Title */}
                <CardTitle className="text-2xl md:text-3xl mb-3 font-black text-zinc-900 dark:text-zinc-100 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-violet-600 group-hover:to-fuchsia-600 dark:group-hover:from-violet-400 dark:group-hover:to-fuchsia-400 transition-all duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="relative z-10">
                {/* Description */}
                <CardDescription className="text-base md:text-lg mb-6 leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                  {feature.description}
                </CardDescription>

                {/* Highlight Badge */}
                <Badge
                  className={`bg-gradient-to-r ${feature.gradient} text-white shadow-md group-hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-bold border-none`}
                >
                  <Zap className="h-4 w-4" />
                  {feature.highlight}
                </Badge>
              </CardContent>

              {/* Animated bottom accent */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r ${feature.gradient} transition-all duration-500 origin-left`}
                style={{
                  transform: hoveredFeature === index ? 'scaleX(1)' : 'scaleX(0)'
                }}
              ></div>

              {/* Corner decoration */}
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`}
              ></div>
            </Card>
          ))}
        </div>

        {/* Social Proof Banner */}
        <div
          className="mb-20 flex flex-wrap justify-center gap-8 items-center"
          style={{
            animation: 'fadeIn 1s ease-out 0.8s both'
          }}
        >
          {testimonialHighlights.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-white dark:bg-zinc-900 px-8 py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-zinc-200 dark:border-zinc-800"
            >
              <span className="text-4xl">{item.icon}</span>
              <div>
                <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{item.stat}</div>
                <div className="text-sm font-bold text-zinc-600 dark:text-zinc-400">{item.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <Card
          className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 border-none shadow-2xl hover:shadow-purple-500/50 transition-all duration-500"
          style={{
            animation: 'fadeInUp 1s ease-out 1s both'
          }}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>

          {/* Decorative dots */}
          <div className="absolute inset-0 opacity-10">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${3 + Math.random() * 3}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              ></div>
            ))}
          </div>

          <CardContent className="relative z-10 p-12 md:p-16 text-white text-center">
            <div className="max-w-3xl mx-auto">
              <Badge className="mb-8 bg-white/20 backdrop-blur-sm text-white border-white/30 px-6 py-2 text-base font-bold shadow-lg">
                <Rocket className="h-5 w-5" />
                Ready to Get Started?
              </Badge>

              <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                Join 200+ Students Already Winning
              </h3>

              <p className="text-lg md:text-xl lg:text-2xl mb-10 leading-relaxed opacity-95 font-medium">
                Stop dreaming. Start applying. Your future in global education begins with one click.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="group bg-white text-purple-600 hover:bg-amber-400 hover:text-white shadow-2xl hover:shadow-white/30 h-16 px-10 text-lg font-black rounded-2xl transition-all duration-300 hover:scale-105"
                >
                  <a href="#signup">
                    Start Free Today
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </a>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-16 px-10 text-lg font-black border-3 border-white/50 text-white hover:bg-white/20 backdrop-blur-sm rounded-2xl transition-all duration-300"
                >
                  <a href="#how-it-works">
                    See How It Works
                  </a>
                </Button>
              </div>

              <p className="text-sm mt-8 opacity-80 font-semibold">
                No credit card required • Get started in 60 seconds • Join free
              </p>
            </div>
          </CardContent>

          {/* Bottom wave decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400"></div>
        </Card>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
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

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
};

export default LandingFeaturesRedesigned;
