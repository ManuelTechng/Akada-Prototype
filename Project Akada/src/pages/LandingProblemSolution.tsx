import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const LandingProblemSolution: React.FC = () => {
  const problems = [
    "Overwhelming and confusing application processes",
    "Lack of personalized guidance for Nigerian students",
    "Difficulty finding programs that match academic profiles",
    "Limited access to scholarship information",
    "Uncertainty about visa requirements and processes"
  ];

  const solutions = [
    "Step-by-step guidance through the entire application journey",
    "AI-powered personalized recommendations based on your profile",
    "Smart matching algorithm to find your perfect program fit",
    "Comprehensive scholarship database with eligibility filters",
    "Detailed visa guidance with document checklists"
  ];

  return (
    <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white" id="problem-solution">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full mb-4 md:mb-6">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-600">The Challenge & Our Solution</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
            From{' '}
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Confusion
            </span>{' '}
            to{' '}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Clarity
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Nigerian students face unique challenges when applying to international tech programs.
            Akada was built specifically to address these pain points.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Without Akada */}
          <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 md:p-8 border-2 border-red-100 hover:border-red-200 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-50"></div>

            <div className="relative">
              <div className="inline-block bg-gradient-to-br from-red-100 to-orange-100 p-3 md:p-4 rounded-2xl mb-6 shadow-inner">
                <XCircle className="h-8 w-8 md:h-10 md:w-10 text-red-600" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Without Akada</h3>
              <ul className="space-y-4 md:space-y-5 mb-8">
                {problems.map((problem, index) => (
                  <li key={index} className="flex items-start group/item">
                    <div className="flex-shrink-0 mt-1">
                      <XCircle className="h-5 w-5 md:h-6 md:w-6 text-red-500 group-hover/item:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="ml-3 text-sm md:text-base text-gray-700 leading-relaxed">{problem}</span>
                  </li>
                ))}
              </ul>

              {/* Testimonial */}
              <div className="relative p-5 md:p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border-2 border-red-100 shadow-inner">
                <div className="absolute top-4 left-4 text-6xl text-red-200 font-serif">"</div>
                <p className="relative text-sm md:text-base text-gray-800 italic mb-3 pl-6 leading-relaxed">
                  I spent months researching programs, only to miss application deadlines and scholarship opportunities.
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-md">
                    C
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold text-sm">Chioma O.</p>
                    <p className="text-gray-600 text-xs">Computer Science Student</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* With Akada */}
          <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 md:p-8 border-2 border-green-100 hover:border-green-200 overflow-hidden md:translate-y-8">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl opacity-50"></div>

            <div className="relative">
              <div className="inline-block bg-gradient-to-br from-green-100 to-emerald-100 p-3 md:p-4 rounded-2xl mb-6 shadow-inner">
                <CheckCircle className="h-8 w-8 md:h-10 md:w-10 text-green-600" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">With Akada</h3>
              <ul className="space-y-4 md:space-y-5 mb-8">
                {solutions.map((solution, index) => (
                  <li key={index} className="flex items-start group/item">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-500 group-hover/item:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="ml-3 text-sm md:text-base text-gray-700 leading-relaxed">{solution}</span>
                  </li>
                ))}
              </ul>

              {/* Testimonial */}
              <div className="relative p-5 md:p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-100 shadow-inner">
                <div className="absolute top-4 left-4 text-6xl text-green-200 font-serif">"</div>
                <p className="relative text-sm md:text-base text-gray-800 italic mb-3 pl-6 leading-relaxed">
                  Akada helped me find and apply to three perfect programs in just two weeks, with scholarship opportunities I never would have discovered on my own.
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white font-bold shadow-md">
                    A
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold text-sm">Adebayo T.</p>
                    <p className="text-gray-600 text-xs">Software Engineering Graduate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingProblemSolution;
