import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

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
    <section className="py-16 bg-gray-50" id="problem-solution">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The Challenge & Our Solution</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nigerian students face unique challenges when applying to international tech programs. 
            Akada was built specifically to address these pain points.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="inline-block bg-red-100 p-3 rounded-full mb-6">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Without Akada</h3>
            <ul className="space-y-4">
              {problems.map((problem, index) => (
                <li key={index} className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{problem}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 p-4 bg-red-50 rounded-lg border border-red-100">
              <p className="text-gray-700 italic">
                "I spent months researching programs, only to miss application deadlines and scholarship opportunities."
              </p>
              <p className="text-gray-500 text-sm mt-2">— Chioma O., Computer Science Student</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="inline-block bg-green-100 p-3 rounded-full mb-6">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">With Akada</h3>
            <ul className="space-y-4">
              {solutions.map((solution, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{solution}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-gray-700 italic">
                "Akada helped me find and apply to three perfect programs in just two weeks, with scholarship opportunities I never would have discovered on my own."
              </p>
              <p className="text-gray-500 text-sm mt-2">— Adebayo T., Software Engineering Graduate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingProblemSolution;