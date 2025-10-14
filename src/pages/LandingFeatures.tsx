import React from 'react';
import { Search, MessageSquareText, FileText, CheckSquare, Award, Sparkles } from 'lucide-react';

const LandingFeatures: React.FC = () => {
  const features = [
    {
      icon: <Search className="h-8 w-8 md:h-10 md:w-10 text-white" />,
      title: "AI-Powered Program Search",
      description: "Find the perfect program with smart filters that match your academic profile, budget, and career goals.",
      highlight: "100+ top tech programs across 12 countries",
      gradient: "from-blue-500 to-violet-500",
      badgeColor: "bg-blue-600",
      badgeText: "text-white"
    },
    {
      icon: <MessageSquareText className="h-8 w-8 md:h-10 md:w-10 text-white" />,
      title: "GPT/Gemini Chat Assistant",
      description: "Get instant answers to your questions about programs, applications, visas, and more from our AI assistant.",
      highlight: "Available 24/7 for personalized guidance",
      gradient: "from-violet-500 to-purple-500",
      badgeColor: "bg-violet-600",
      badgeText: "text-white"
    },
    {
      icon: <FileText className="h-8 w-8 md:h-10 md:w-10 text-white" />,
      title: "Essay & SOP Review",
      description: "Receive AI-powered feedback on your essays and statements of purpose to improve your chances of acceptance.",
      highlight: "Detailed suggestions for improvement",
      gradient: "from-pink-500 to-rose-500",
      badgeColor: "bg-pink-600",
      badgeText: "text-white"
    },
    {
      icon: <CheckSquare className="h-8 w-8 md:h-10 md:w-10 text-white" />,
      title: "Application Tracker",
      description: "Stay organized with a comprehensive checklist and timeline for each application.",
      highlight: "Never miss a deadline again",
      gradient: "from-blue-600 to-indigo-600",
      badgeColor: "bg-blue-700",
      badgeText: "text-white"
    },
    {
      icon: <Award className="h-8 w-8 md:h-10 md:w-10 text-white" />,
      title: "Scholarship & Visa Portal",
      description: "Access comprehensive information about scholarships and visa requirements for Nigerian students.",
      highlight: "Country-specific guidance and tips",
      gradient: "from-orange-500 to-amber-500",
      badgeColor: "bg-orange-600",
      badgeText: "text-white"
    }
  ];

  return (
    <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-white to-slate-50" id="features">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-4 md:mb-6">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">Powerful Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 md:mb-6">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Our AI-powered platform provides everything you need to navigate the international education journey with confidence.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 p-6 md:p-8 hover:-translate-y-2 border border-slate-200 hover:border-transparent overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

              {/* Icon with white icon on gradient background */}
              <div className="relative mb-4 md:mb-6">
                <div className={`inline-flex p-3 md:p-4 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform duration-500 relative`}>
                  {feature.icon}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500`}></div>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-violet-600 transition-all duration-300">
                {feature.title}
              </h3>
              <p className="text-sm md:text-base text-slate-600 mb-4 md:mb-6 leading-relaxed">
                {feature.description}
              </p>

              {/* Highlight Badge with better contrast */}
              <div className={`inline-flex items-center gap-2 ${feature.badgeColor} ${feature.badgeText} px-3 py-2 rounded-full text-xs md:text-sm font-semibold shadow-md group-hover:shadow-lg transition-all duration-300`}>
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                {feature.highlight}
              </div>

              {/* Bottom Border Effect */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white text-center shadow-2xl hover:shadow-blue-500/50 transition-all duration-500">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">
              All Features Designed for African Students
            </h3>
            <p className="text-base md:text-lg lg:text-xl mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed opacity-90">
              Our platform is specifically tailored to address the unique challenges faced by African students
              applying to programs locally and internationally.
            </p>
            <a
              href="#signup"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-slate-50 transition-all duration-300 font-bold text-base md:text-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
            >
              Get Started Today
              <Sparkles className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
