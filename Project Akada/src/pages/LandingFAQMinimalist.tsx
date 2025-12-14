import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const LandingFAQMinimalist: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does Akada's AI work?",
      answer: "Our AI analyzes your academic profile, budget, and goals to match you with the best programs. The more information you provide, the better the recommendations."
    },
    {
      question: "Is Akada only for CS programs?",
      answer: "While we specialize in technology fields, Akada supports all STEM programs including Data Science, AI/ML, Cybersecurity, and Software Engineering."
    },
    {
      question: "How accurate is the essay review?",
      answer: "Our AI provides detailed feedback on structure, clarity, and content based on successful applications. Premium users get additional expert human review."
    },
    {
      question: "Can you help with scholarships?",
      answer: "Yes! We maintain a comprehensive database of scholarships for Nigerian students with guidance on applications and deadlines."
    },
    {
      question: "Do you guarantee admission?",
      answer: "We can't guarantee admissions, but our users report significantly higher acceptance rates compared to applying independently."
    },
    {
      question: "How does visa guidance work?",
      answer: "Premium users get step-by-step guidance including document checklists, sample statements, and country-specific requirements for Nigerian students."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-32 bg-white dark:bg-zinc-950" id="faq">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge
            variant="outline"
            className="mb-6 px-4 py-2 text-sm font-semibold border-2 border-zinc-200 dark:border-zinc-800"
          >
            FAQ
          </Badge>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-zinc-900 dark:text-white mb-6">
            Got Questions?
            <span className="block mt-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              We've Got Answers.
            </span>
          </h2>
        </div>

        {/* FAQ List */}
        <div className="space-y-4 mb-16">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="border-2 border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              <button
                className="w-full px-8 py-6 text-left flex justify-between items-center focus:outline-none group"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-bold text-zinc-900 dark:text-white pr-8">
                  {faq.question}
                </span>
                <div className={`flex-shrink-0 p-2 rounded-full transition-all duration-300 ${
                  openIndex === index
                    ? 'bg-primary text-white'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white'
                }`}>
                  {openIndex === index ? (
                    <Minus className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-8 pb-6">
                  <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Contact CTA */}
        <Card className="p-12 border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-center">
          <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-4">
            Still Have Questions?
          </h3>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
            Our support team is here to help.
          </p>
          <Button
            asChild
            size="lg"
            className="h-12 px-8 font-bold bg-primary hover:bg-primary/90"
          >
            <a href="mailto:support@akada.edu.ng">Contact Support</a>
          </Button>
        </Card>
      </div>
    </section>
  );
};

export default LandingFAQMinimalist;
