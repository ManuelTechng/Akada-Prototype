import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const LandingFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does Akada's AI recommendation system work?",
      answer: "Our AI analyzes your academic profile, budget, location preferences, and career goals to match you with programs that best fit your needs. The more information you provide, the more accurate our recommendations become."
    },
    {
      question: "Is Akada only for Computer Science programs?",
      answer: "While we specialize in technology and computer science fields, Akada supports a wide range of STEM programs including Data Science, AI/ML, Cybersecurity, Software Engineering, and related disciplines."
    },
    {
      question: "How accurate is the AI essay review tool?",
      answer: "Our AI essay review tool provides feedback on structure, clarity, grammar, and content relevance based on successful application essays. It's designed to complement human review, not replace it. Premium users get additional expert human review."
    },
    {
      question: "Can Akada help with scholarship applications?",
      answer: "Yes! We maintain a comprehensive database of scholarships available to Nigerian students and provide guidance on application requirements, deadlines, and tips for increasing your chances of success."
    },
    {
      question: "Does Akada guarantee admission to programs?",
      answer: "While we provide powerful tools and guidance to strengthen your applications, we cannot guarantee admissions as final decisions rest with the universities. However, our users report significantly higher acceptance rates compared to applying independently."
    },
    {
      question: "How does the visa guidance work?",
      answer: "Premium users receive step-by-step guidance for student visa applications, including document checklists, sample statements, interview preparation, and country-specific requirements for Nigerian students."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-gray-50" id="faq">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">
            Find answers to common questions about Akada.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-indigo-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-indigo-600" />
                )}
              </button>
              <div 
                className={`px-6 pb-4 ${openIndex === index ? 'block' : 'hidden'}`}
              >
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a 
            href="mailto:support@akada.edu.ng" 
            className="inline-block text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
          >
            Contact our support team
          </a>
        </div>
      </div>
    </section>
  );
};

export default LandingFAQ;