"use client";

import React, { useState } from 'react';
import { Bot, UserPlus, LogIn, Sparkles, Send, TrendingUp, Globe, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';

const LandingHeroEnhanced: React.FC = () => {
  const [demoMessage, setDemoMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

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
      label: 'Students Joined',
      icon: <GraduationCap className="h-5 w-5" />,
      gradient: 'from-indigo-600 to-purple-600'
    },
    {
      value: '12',
      label: 'Countries',
      icon: <Globe className="h-5 w-5" />,
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      value: '100+',
      label: 'Programs',
      icon: <TrendingUp className="h-5 w-5" />,
      gradient: 'from-pink-600 to-indigo-600'
    }
  ];

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-white pt-20 pb-16 overflow-hidden">
      {/* Animated Background Gradient Blobs */}
      <div className="absolute top-0 left-0 w-[60vw] max-w-xs sm:max-w-md lg:max-w-xl aspect-square bg-indigo-200 dark:bg-indigo-900/20 rounded-full opacity-20 blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute top-1/2 right-0 w-[55vw] max-w-xs sm:max-w-lg aspect-square bg-purple-200 dark:bg-purple-800/20 rounded-full opacity-20 blur-3xl translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-0 left-1/4 w-[50vw] max-w-[18rem] aspect-square bg-pink-200 dark:bg-pink-800/20 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-12 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge with shadcn */}
          <Badge
            variant="outline"
            className="mb-6 md:mb-8 bg-white/90 backdrop-blur-md px-4 py-2 text-indigo-600 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 cursor-default border-indigo-200"
          >
            <Sparkles className="h-4 w-4 md:h-5 md:w-5 animate-pulse" />
            <span className="text-xs md:text-sm font-semibold">Empowering Nigerian Students</span>
          </Badge>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6 md:mb-8 leading-tight">
            <span className="text-blue-600">
              Democratizing Global Education
            </span>{' '}
            for African Students
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed">
            Explore, plan, and apply to programs across tech, business and more both locally and internationally with personalized AI guidance.
          </p>

          {/* CTA Buttons with shadcn */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-10 md:mb-16 px-4 sm:px-0">
            <Button
              asChild
              size="lg"
              className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-semibold"
            >
              <Link to="/signup">
                <UserPlus className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                Get Started Free
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-semibold border-2 border-indigo-200 text-indigo-600 hover:bg-gray-50 shadow-sm hover:shadow-lg"
            >
              <Link to="/login">
                <LogIn className="h-5 w-5" />
                Log In
              </Link>
            </Button>
          </div>

          {/* Stats with shadcn Card */}
          <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="group hover:scale-110 transition-all duration-300 cursor-default border-none shadow-lg hover:shadow-xl bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-6 flex flex-col items-center gap-2">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white mb-2 group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base text-gray-600 font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Interactive AI Chat Demo with shadcn Card */}
        <Card className="mt-12 md:mt-20 max-w-3xl mx-auto bg-white/80 backdrop-blur-md shadow-2xl border-gray-200 hover:shadow-indigo-200/50 transition-all duration-500">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4 md:mb-6 pb-4 border-b border-gray-100">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-2 md:p-2.5 rounded-xl shadow-inner">
                <Bot className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-base md:text-lg text-gray-900">AI Assistant</h3>
                <p className="text-xs md:text-sm text-gray-500">Try asking me anything!</p>
              </div>
              <div className="ml-auto">
                <Badge variant="outline" className="border-green-200 bg-green-50">
                  <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-green-700 font-medium">Online</span>
                </Badge>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4 mb-4 md:mb-6 max-h-[300px] overflow-y-auto">
              {/* Sample conversation */}
              <div className="flex justify-start animate-fade-in">
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 md:p-4 max-w-[85%] shadow-sm">
                  <p className="text-sm md:text-base text-gray-800">I'm looking for Computer Science programs in Canada with scholarships.</p>
                  <span className="text-xs text-gray-500 mt-1 block">Student</span>
                </div>
              </div>

              {showResponse && (
                <div className="flex justify-end animate-fade-in">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl rounded-tr-sm p-3 md:p-4 max-w-[85%] shadow-sm border border-indigo-100">
                    <p className="text-sm md:text-base text-gray-800">
                      I found <span className="font-semibold text-indigo-600">12 CS programs</span> in Canada with scholarships for Nigerian students. The{' '}
                      <span className="font-semibold">University of Toronto</span> offers a Global Excellence Award covering up to{' '}
                      <span className="font-semibold text-green-600">50% of tuition fees</span>. Would you like more details?
                    </p>
                    <span className="text-xs text-indigo-600 mt-1 block font-medium">Akada AI</span>
                  </div>
                </div>
              )}

              {isTyping && (
                <div className="flex justify-end">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl rounded-tr-sm p-3 md:p-4 shadow-sm border border-indigo-100">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce"></span>
                      <span className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleDemoSubmit} className="flex gap-2">
              <input
                type="text"
                value={demoMessage}
                onChange={(e) => setDemoMessage(e.target.value)}
                placeholder="Ask about programs, requirements, or applications..."
                className="flex-1 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
              />
              <Button
                type="submit"
                disabled={!demoMessage.trim() || isTyping}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600 px-4 md:px-6 shadow-lg hover:shadow-indigo-500/50"
              >
                <Send className="h-4 w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>

            <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4 text-center">
              This is a demo. <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold underline">Sign up</Link> to get full access to our AI assistant.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default LandingHeroEnhanced;
