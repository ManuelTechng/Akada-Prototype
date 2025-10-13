import React, { useState, useEffect } from 'react';
import { Bot, GraduationCap, UserPlus, LogIn, Sparkles, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingHero: React.FC = () => {
  const [demoMessage, setDemoMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoMessage.trim()) return;

    setIsTyping(true);
    setShowResponse(false);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      setShowResponse(true);
    }, 2000);
  };

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-white pt-20 pb-16">
      {/* Animated Background Gradient Blobs */}
      <div className="absolute top-0 left-0 w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-indigo-200 dark:bg-indigo-900/20 rounded-full opacity-20 blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute top-1/2 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-purple-200 dark:bg-purple-800/20 rounded-full opacity-20 blur-3xl translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-pink-200 dark:bg-pink-800/20 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-12 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="mb-6 md:mb-8 inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-indigo-200 text-indigo-600 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 cursor-default">
            <Sparkles className="h-4 w-4 md:h-5 md:w-5 animate-pulse" />
            <span className="text-xs md:text-sm font-semibold">Empowering Nigerian Students</span>
          </div>

          {/* Headline - Fixed for visibility */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6 md:mb-8 leading-tight">
            Your Gateway to{' '}
            <span className="text-blue-600">
              Global Tech Education
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed">
            Akada helps Nigerian students explore, plan, and apply to international academic programs in technology with personalized AI guidance.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-10 md:mb-16 px-4 sm:px-0">
            <Link
              to="/signup"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 font-semibold text-base md:text-lg hover:scale-105 active:scale-95 relative overflow-hidden"
              tabIndex={0}
              aria-label="Sign up for Akada"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <UserPlus className="h-5 w-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative z-10">Get Started Free</span>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 border-2 border-indigo-200 font-semibold text-base md:text-lg shadow-sm hover:shadow-lg hover:scale-105 active:scale-95"
              tabIndex={0}
              aria-label="Log in to Akada"
            >
              <LogIn className="h-5 w-5" />
              <span>Log In</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-8 md:mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-8 text-center">
            <div className="group hover:scale-110 transition-transform duration-300 cursor-default">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">200+</div>
              <div className="text-sm md:text-base text-gray-600 font-medium">Students Joined</div>
            </div>
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            <div className="group hover:scale-110 transition-transform duration-300 cursor-default">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">12</div>
              <div className="text-sm md:text-base text-gray-600 font-medium">Countries</div>
            </div>
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            <div className="group hover:scale-110 transition-transform duration-300 cursor-default">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-indigo-600 bg-clip-text text-transparent mb-1">100+</div>
              <div className="text-sm md:text-base text-gray-600 font-medium">Programs</div>
            </div>
          </div>
        </div>

        {/* Interactive AI Chat Demo */}
        <div className="mt-12 md:mt-20 max-w-3xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-4 md:p-6 border border-gray-200 hover:shadow-indigo-200/50 transition-all duration-500">
          <div className="flex items-center gap-3 mb-4 md:mb-6 pb-4 border-b border-gray-100">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-2 md:p-2.5 rounded-xl shadow-inner">
              <Bot className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg text-gray-900">AI Assistant</h3>
              <p className="text-xs md:text-sm text-gray-500">Try asking me anything!</p>
            </div>
            <div className="ml-auto">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-gray-500 font-medium">Online</span>
              </div>
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
            <button
              type="submit"
              disabled={!demoMessage.trim() || isTyping}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Send className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4 text-center">
            This is a demo. <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold underline">Sign up</Link> to get full access to our AI assistant.
          </p>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;