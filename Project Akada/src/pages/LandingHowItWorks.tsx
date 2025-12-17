import React from 'react';
import { Search, FileCheck, Sparkles, ArrowRight } from 'lucide-react';

const LandingHowItWorks: React.FC = () => {
  const steps = [
    {
      number: "1",
      icon: <Search className="h-6 w-6 md:h-8 md:w-8" />,
      title: "Explore Programs",
      description: "Search our curated database of international tech programs tailored to your profile.",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      number: "2",
      icon: <FileCheck className="h-6 w-6 md:h-8 md:w-8" />,
      title: "Manage Applications",
      description: "Track your application progress and deadlines seamlessly with our smart tracker.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      number: "3",
      icon: <Sparkles className="h-6 w-6 md:h-8 md:w-8" />,
      title: "Get AI Guidance",
      description: "Leverage AI assistance for essays, visas, and personalized recommendations.",
      gradient: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-white to-indigo-50" id="how-it-works">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-4 md:mb-6">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-600">Simple Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
            How{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Akada Works
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Getting started with Akada is simple. Follow these three steps to begin your journey.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-6 lg:gap-10 max-w-6xl mx-auto relative">
          {/* Connecting Lines (desktop only) */}
          <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 mx-auto" style={{ width: 'calc(100% - 200px)', left: '100px' }}></div>

          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Step Card */}
              <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 md:p-8 border-2 border-gray-100 hover:border-transparent hover:-translate-y-2">
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>

                <div className="relative">
                  {/* Step Number Badge */}
                  <div className={`absolute -top-10 md:-top-12 left-1/2 transform -translate-x-1/2 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 z-10`}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center mb-6 mt-8 md:mt-10">
                    <div className={`inline-flex p-4 md:p-5 rounded-2xl bg-gradient-to-br ${step.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      {step.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 text-center group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Arrow Connector (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-12 -right-5 lg:-right-8 items-center justify-center z-20">
                  <div className="bg-white rounded-full p-2 shadow-md">
                    <ArrowRight className={`h-5 w-5 text-purple-600`} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-gray-600 mb-6 text-base md:text-lg">
            Ready to start your journey?
          </p>
          <a
            href="#signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 font-bold text-base md:text-lg hover:scale-105 active:scale-95"
          >
            Get Started Now
            <Sparkles className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default LandingHowItWorks;
