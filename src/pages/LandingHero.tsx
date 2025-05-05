import React from 'react';
import { ArrowRight, Bot, GraduationCap, Globe } from 'lucide-react';

const LandingHero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white">
      {/* Background Gradient Blobs */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-100 rounded-full opacity-20 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-indigo-200 rounded-full opacity-20 blur-3xl translate-x-1/2"></div>

      <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-16 sm:px-6 sm:pt-32 sm:pb-24 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8 inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-indigo-100 text-indigo-600">
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm font-medium">Empowering Nigerian Students</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-8">
            Your AI-Powered Gateway to{' '}
            <span className="text-indigo-600">Global Tech Education</span>
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Akada helps Nigerian students explore, plan, and apply to international academic programs in technology with personalized AI guidance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg font-medium group">
              Join Waitlist
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-indigo-50 transition-all duration-300 border-2 border-indigo-600 font-medium">
              Watch Demo
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-1">200+</div>
              <div className="text-gray-600">Students Joined</div>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-1">12</div>
              <div className="text-gray-600">Countries</div>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-1">100+</div>
              <div className="text-gray-600">Programs</div>
            </div>
          </div>
        </div>

        {/* AI Chat Demo */}
        <div className="mt-20 max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Bot className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-lg">AI Assistant</h3>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 max-w-[80%]">
              <p className="text-gray-700">I'm looking for Computer Science programs in Canada with scholarships.</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 ml-auto max-w-[80%]">
              <p className="text-gray-800">I found 12 CS programs in Canada with scholarships for Nigerian students. The University of Toronto offers a Global Excellence Award covering up to 50% of tuition fees.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask about programs, requirements, or applications..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;