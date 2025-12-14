import React from 'react';
import { Search, MessageSquareText, FileText, CheckSquare, Award, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const LandingFeaturesEnhanced: React.FC = () => {
  const features = [
    {
      icon: <Search className="h-8 w-8 md:h-10 md:w-10 text-white" />,
      title: "AI-Powered Program Search",
      description: "Find the perfect program with smart filters that match your academic profile, budget, and career goals.",
      highlight: "100+ top tech programs across 12 countries",
      gradient: "from-blue-500 to-violet-500",
      badgeColor: "bg-blue-600",
      iconBg: "from-blue-500 to-violet-500"
    },
    {
      icon: <MessageSquareText className="h-8 w-8 md:h-10 md:w-10 text-white" />,
      title: "GPT/Gemini Chat Assistant",
      description: "Get instant answers to your questions about programs, applications, visas, and more from our AI assistant.",
      highlight: "Available 24/7 for personalized guidance",
      gradient: "from-violet-500 to-purple-500",
      badgeColor: "bg-violet-600",
      iconBg: "from-violet-500 to-purple-500"
    },
    {
      icon: <FileText className="h-8 w-8 md:h-10 md:w-10 text-white" />,
      title: "Essay & SOP Review",
      description: "Receive AI-powered feedback on your essays and statements of purpose to improve your chances of acceptance.",
      highlight: "Detailed suggestions for improvement",
      gradient: "from-pink-500 to-rose-500",
      badgeColor: "bg-pink-600",
      iconBg: "from-pink-500 to-rose-500"
    },
    {
      icon: <CheckSquare className="h-8 w-8 md:h-10 md:w-10 text-white" />,
      title: "Application Tracker",
      description: "Stay organized with a comprehensive checklist and timeline for each application.",
      highlight: "Never miss a deadline again",
      gradient: "from-blue-600 to-indigo-600",
      badgeColor: "bg-blue-700",
      iconBg: "from-blue-600 to-indigo-600"
    },
    {
      icon: <Award className="h-8 w-8 md:h-10 md:w-10 text-white" />,
      title: "Scholarship & Visa Portal",
      description: "Access comprehensive information about scholarships and visa requirements for Nigerian students.",
      highlight: "Country-specific guidance and tips",
      gradient: "from-orange-500 to-amber-500",
      badgeColor: "bg-orange-600",
      iconBg: "from-orange-500 to-amber-500"
    }
  ];

  return (
    <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-white to-slate-50" id="features">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <Badge
            variant="outline"
            className="mb-4 md:mb-6 bg-blue-100 border-blue-200 text-blue-600"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">Powerful Features</span>
          </Badge>
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

        {/* Features Grid with shadcn Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:-translate-y-2 transition-all duration-500 cursor-default border-slate-200 hover:border-transparent hover:shadow-2xl bg-white"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-xl`}></div>

              <CardHeader className="relative">
                {/* Icon */}
                <div className="mb-4">
                  <div className={`inline-flex p-3 md:p-4 rounded-xl bg-gradient-to-br ${feature.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-500 relative`}>
                    {feature.icon}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.iconBg} opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500 rounded-xl`}></div>
                  </div>
                </div>

                {/* Title */}
                <CardTitle className="text-xl md:text-2xl group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-violet-600 transition-all duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="relative">
                {/* Description */}
                <CardDescription className="text-sm md:text-base mb-4 md:mb-6 leading-relaxed">
                  {feature.description}
                </CardDescription>

                {/* Highlight Badge */}
                <Badge
                  className={`${feature.badgeColor} text-white shadow-md group-hover:shadow-lg transition-all duration-300`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                  <span className="text-xs md:text-sm font-semibold">{feature.highlight}</span>
                </Badge>
              </CardContent>

              {/* Bottom Border Effect */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-xl`}></div>
            </Card>
          ))}
        </div>

        {/* CTA Banner with shadcn Card */}
        <Card className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 border-none shadow-2xl hover:shadow-blue-500/50 transition-all duration-500">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <CardContent className="relative z-10 p-8 md:p-12 text-white text-center">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">
              All Features Designed for African Students
            </h3>
            <p className="text-base md:text-lg lg:text-xl mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed opacity-90">
              Our platform is specifically tailored to address the unique challenges faced by African students
              applying to programs locally and internationally.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-600 hover:bg-slate-50 shadow-xl hover:shadow-2xl h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-bold"
            >
              <a href="#signup">
                Get Started Today
                <ArrowRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default LandingFeaturesEnhanced;
