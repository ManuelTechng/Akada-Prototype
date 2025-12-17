import React from 'react';

const LandingSuccessStories: React.FC = () => {
  const stories = [
    {
      quote: "Akada made finding the right Master's program so much easier. The application tracker was a lifesaver!",
      name: "Chidi Okonkwo",
      position: "MSc AI Student, Canada",
      initials: "CO",
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-600"
    },
    {
      quote: "I wasn't sure where to start, but Akada helped me discover amazing computer science programs in the UK I hadn't considered.",
      name: "Aisha Bello",
      position: "BSc CompSci Applicant, UK",
      initials: "AB",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600"
    },
    {
      quote: "The platform is user-friendly, even on my phone with spotty internet. Highly recommend it to fellow Nigerian students!",
      name: "Femi Adekunle",
      position: "Prospective Engineering Student",
      initials: "FA",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600"
    }
  ];

  return (
    <section className="py-20 bg-gray-50" id="success-stories">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from students who transformed their futures with Akada.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {stories.map((story, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-8">
              <p className="italic text-gray-700 mb-6">"{story.quote}"</p>
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full ${story.bgColor} ${story.textColor} flex items-center justify-center font-medium mr-4`}>
                  {story.initials}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{story.name}</h4>
                  <p className="text-sm text-gray-600">{story.position}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingSuccessStories;