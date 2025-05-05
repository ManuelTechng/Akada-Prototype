import React from 'react';

const LandingHowItWorks: React.FC = () => {
  const steps = [
    {
      number: "1",
      title: "Explore Programs",
      description: "Search our curated database of international tech programs."
    },
    {
      number: "2",
      title: "Manage Applications",
      description: "Track your application progress and deadlines seamlessly."
    },
    {
      number: "3",
      title: "Get Guidance",
      description: "Leverage AI assistance for essays, visas, and more."
    }
  ];

  return (
    <section className="py-20 bg-white" id="how-it-works">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-4">How Akada Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Getting started with Akada is simple. Follow these steps to begin your journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl font-bold mb-6">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingHowItWorks;