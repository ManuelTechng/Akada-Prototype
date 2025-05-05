import React from 'react';
import { Search, MessageSquareText, FileText, CheckSquare, Award } from 'lucide-react';

const LandingFeatures: React.FC = () => {
  const features = [
    {
      icon: <Search className="h-10 w-10 text-indigo-600" />,
      title: "AI-Powered Program Search",
      description: "Find the perfect program with smart filters that match your academic profile, budget, and career goals.",
      highlight: "100+ top tech programs across 12 countries"
    },
    {
      icon: <MessageSquareText className="h-10 w-10 text-indigo-600" />,
      title: "GPT/Gemini Chat Assistant",
      description: "Get instant answers to your questions about programs, applications, visas, and more from our AI assistant.",
      highlight: "Available 24/7 for personalized guidance"
    },
    {
      icon: <FileText className="h-10 w-10 text-indigo-600" />,
      title: "Essay & SOP Review",
      description: "Receive AI-powered feedback on your essays and statements of purpose to improve your chances of acceptance.",
      highlight: "Detailed suggestions for improvement"
    },
    {
      icon: <CheckSquare className="h-10 w-10 text-indigo-600" />,
      title: "Application Tracker",
      description: "Stay organized with a comprehensive checklist and timeline for each application.",
      highlight: "Never miss a deadline again"
    },
    {
      icon: <Award className="h-10 w-10 text-indigo-600" />,
      title: "Scholarship & Visa Portal",
      description: "Access comprehensive information about scholarships and visa requirements for Nigerian students.",
      highlight: "Country-specific guidance and tips"
    }
  ];

  return (
    <section className="py-16 md:py-24" id="features">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform provides everything you need to navigate the international education journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm inline-block">
                {feature.highlight}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-indigo-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">All Features Designed for Nigerian Students</h3>
          <p className="text-lg mb-6">
            Our platform is specifically tailored to address the unique challenges faced by Nigerian students 
            applying to international tech programs.
          </p>
          <a 
            href="#signup" 
            className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors font-medium"
          >
            Get Started Today
          </a>
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;