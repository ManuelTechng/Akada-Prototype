"use client";

import React, { useState, useEffect } from 'react';
import { Bot, UserPlus, LogIn, Sparkles, Send, TrendingUp, Globe, GraduationCap, Zap, Target, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';

const LandingHeroRedesigned: React.FC = () => {
  const [demoMessage, setDemoMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [activeStatIndex, setActiveStatIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStatIndex((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoMessage.trim()) return;

    setIsTyping(true);
    setShowResponse(false);

    setTimeout(() => {
      setIsTyping(false);
      setShowResponse(true);
    }, 2000);
  };

  const stats = [
    {
      value: '200+',
      label: 'Students Empowered',
      icon: <Users className="h-6 w-6" />,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      textColor: 'text-amber-700 dark:text-amber-400'
    },
    {
      value: '12',
      label: 'Countries Connected',
      icon: <Globe className="h-6 w-6" />,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      textColor: 'text-emerald-700 dark:text-emerald-400'
    },
    {
      value: '100+',
      label: 'Opportunities Found',
      icon: <Target className="h-6 w-6" />,
      color: 'from-purple-500 to-fuchsia-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      textColor: 'text-purple-700 dark:text-purple-400'
    }
  ];

  const trustedLogos = [
    { name: 'MIT', symbol: '🎓' },
    { name: 'Oxford', symbol: '📚' },
    { name: 'Stanford', symbol: '🏛️' },
    { name: 'Cambridge', symbol: '🎯' },
    { name: 'Harvard', symbol: '⚡' }
  ];

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-emerald-50/30 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 pt-20 pb-16 overflow-hidden">
      {/* Organic Background Shapes - Afro-inspired patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large organic blob */}
        <div
          className="absolute top-0 right-0 w-[70vw] h-[70vw] max-w-2xl max-h-2xl bg-gradient-to-br from-amber-400/20 via-orange-500/10 to-transparent rounded-full blur-3xl"
          style={{
            animation: 'float 20s ease-in-out infinite',
            transform: 'translate(30%, -30%)'
          }}
        ></div>

        {/* Medium organic blob */}
        <div
          className="absolute bottom-20 left-0 w-[60vw] h-[60vw] max-w-xl max-h-xl bg-gradient-to-tr from-emerald-400/20 via-teal-500/10 to-transparent rounded-full blur-3xl"
          style={{
            animation: 'float 25s ease-in-out infinite reverse',
            animationDelay: '2s',
            transform: 'translate(-30%, 20%)'
          }}
        ></div>

        {/* Decorative geometric patterns */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-amber-500/20 rounded-lg rotate-45 animate-spin" style={{ animationDuration: '30s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 border-2 border-emerald-500/20 rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 pt-16 pb-12 sm:px-6 sm:pt-24 lg:px-8">
        {/* Animated Badge */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-700">
          <Badge
            variant="outline"
            className="mb-6 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950/50 dark:to-orange-950/50 backdrop-blur-sm px-6 py-3 text-amber-800 dark:text-amber-300 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 cursor-default border-amber-300/50 dark:border-amber-700/50 text-base font-bold"
          >
            <Sparkles className="h-5 w-5 animate-pulse" />
            African Excellence Meets Global Opportunity
          </Badge>
        </div>

        {/* Hero Headline with Staggered Animation */}
        <div className="text-center max-w-5xl mx-auto mb-12">
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1]"
            style={{
              animation: 'fadeInScale 1s ease-out 0.2s both',
              fontFamily: 'var(--font-sans)'
            }}
          >
            <span className="block mb-2 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 dark:from-amber-400 dark:via-orange-400 dark:to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
              Your Bridge to
            </span>
            <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-400 dark:via-teal-400 dark:to-emerald-500 bg-clip-text text-transparent">
              Global Education
            </span>
          </h1>

          <p
            className="text-xl sm:text-2xl md:text-3xl text-zinc-700 dark:text-zinc-300 mb-12 max-w-4xl mx-auto leading-relaxed font-medium"
            style={{
              animation: 'fadeInScale 1s ease-out 0.4s both'
            }}
          >
            Navigate tech programs, scholarships, and applications worldwide with
            <span className="text-amber-600 dark:text-amber-400 font-bold"> AI-powered guidance </span>
            built for African students.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            style={{
              animation: 'fadeInScale 1s ease-out 0.6s both'
            }}
          >
            <Button
              asChild
              size="lg"
              className="group relative bg-gradient-to-r from-amber-600 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white shadow-2xl hover:shadow-amber-500/40 transition-all duration-500 h-16 px-10 text-lg font-bold rounded-2xl overflow-hidden"
            >
              <Link to="/signup">
                <span className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <UserPlus className="h-6 w-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                <span className="relative z-10">Start Your Journey</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-16 px-10 text-lg font-bold border-3 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300"
            >
              <Link to="/login">
                <LogIn className="h-6 w-6" />
                Sign In
              </Link>
            </Button>
          </div>

          {/* Trusted By Section */}
          <div
            className="flex flex-col items-center gap-4 mb-12"
            style={{
              animation: 'fadeInScale 1s ease-out 0.8s both'
            }}
          >
            <p className="text-sm uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold">Connecting Students To</p>
            <div className="flex flex-wrap justify-center gap-6 items-center">
              {trustedLogos.map((logo, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  style={{
                    animation: `fadeIn 0.5s ease-out ${1 + index * 0.1}s both`
                  }}
                >
                  <span className="text-2xl">{logo.symbol}</span>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">{logo.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards - Staggered Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20 max-w-5xl mx-auto"
          style={{
            animation: 'fadeInScale 1s ease-out 1s both'
          }}
        >
          {stats.map((stat, index) => (
            <Card
              key={index}
              className={`group relative overflow-hidden border-2 transition-all duration-700 cursor-default ${
                activeStatIndex === index
                  ? 'scale-105 shadow-2xl border-transparent'
                  : 'hover:scale-105 border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-xl'
              } ${stat.bgColor}`}
            >
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

              <CardContent className="p-8 flex flex-col items-center gap-4 relative z-10">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  {stat.icon}
                </div>
                <div className={`text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className={`text-base font-bold ${stat.textColor} text-center`}>{stat.label}</div>
              </CardContent>

              {/* Bottom accent line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${stat.color} transform ${
                activeStatIndex === index ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              } transition-transform duration-500`}></div>
            </Card>
          ))}
        </div>

        {/* Interactive AI Demo */}
        <Card
          className="max-w-4xl mx-auto bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-2xl border-2 border-zinc-200 dark:border-zinc-800 hover:shadow-amber-500/20 transition-all duration-700 overflow-hidden"
          style={{
            animation: 'fadeInScale 1s ease-out 1.2s both'
          }}
        >
          {/* Decorative top border */}
          <div className="h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500"></div>

          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-zinc-100 dark:border-zinc-800">
              <div className="relative">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-2xl shadow-lg">
                  <Bot className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-black text-xl text-zinc-900 dark:text-zinc-100">Akada AI Assistant</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Ask me about programs, scholarships, or applications</p>
              </div>
              <Badge className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 px-3 py-1 font-bold">
                <Zap className="h-3 w-3" />
                Live
              </Badge>
            </div>

            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
              {/* Sample user message */}
              <div className="flex justify-start animate-in slide-in-from-left duration-500">
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-3xl rounded-tl-md p-5 max-w-[85%] shadow-md">
                  <p className="text-base text-zinc-800 dark:text-zinc-200 font-medium">
                    I'm looking for Computer Science programs in Canada with scholarships.
                  </p>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 block font-semibold">You</span>
                </div>
              </div>

              {showResponse && (
                <div className="flex justify-end animate-in slide-in-from-right duration-500">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 rounded-3xl rounded-tr-md p-5 max-w-[85%] shadow-md border-2 border-amber-200/50 dark:border-amber-800/50">
                    <p className="text-base text-zinc-800 dark:text-zinc-200 font-medium">
                      Great choice! I found <span className="font-black text-amber-700 dark:text-amber-400">12 CS programs</span> in Canada with scholarships for Nigerian students. The{' '}
                      <span className="font-black">University of Toronto</span> offers a Global Excellence Award covering up to{' '}
                      <span className="font-black text-emerald-600 dark:text-emerald-400">50% of tuition fees</span>. Would you like detailed breakdowns?
                    </p>
                    <span className="text-xs text-amber-700 dark:text-amber-400 mt-2 block font-black">Akada AI</span>
                  </div>
                </div>
              )}

              {isTyping && (
                <div className="flex justify-end animate-in slide-in-from-right duration-300">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 rounded-3xl rounded-tr-md p-5 shadow-md border-2 border-amber-200/50 dark:border-amber-800/50">
                    <div className="flex gap-2">
                      <span className="h-3 w-3 bg-amber-500 rounded-full animate-bounce"></span>
                      <span className="h-3 w-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="h-3 w-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleDemoSubmit} className="flex gap-3">
              <input
                type="text"
                value={demoMessage}
                onChange={(e) => setDemoMessage(e.target.value)}
                placeholder="Ask about programs, requirements, deadlines..."
                className="flex-1 px-5 py-4 text-base border-2 border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:border-amber-500 transition-all duration-300 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium placeholder:text-zinc-400"
              />
              <Button
                type="submit"
                disabled={!demoMessage.trim() || isTyping}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-orange-600 hover:to-amber-600 px-8 shadow-lg hover:shadow-amber-500/50 rounded-2xl h-14 font-bold"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-6 text-center font-medium">
              Demo mode active. <Link to="/signup" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-black underline decoration-2 underline-offset-2">Create free account</Link> for full AI access.
            </p>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(30%, -30%) rotate(0deg); }
          33% { transform: translate(35%, -25%) rotate(5deg); }
          66% { transform: translate(25%, -35%) rotate(-5deg); }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
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

export default LandingHeroRedesigned;
