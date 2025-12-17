import React, { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const LandingSignupMinimalist: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with backend API
    setSubmitted(true);
  };

  const benefits = [
    'Priority access at launch',
    '30% off Premium for 3 months',
    'Early access to new features',
    'Shape the platform with feedback'
  ];

  return (
    <section className="py-32 bg-gradient-to-br from-primary via-blue-600 to-primary relative overflow-hidden" id="signup">
      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            <h2 className="text-5xl sm:text-6xl font-black tracking-tighter mb-6">
              Join the Waitlist
            </h2>
            <p className="text-xl mb-8 leading-relaxed opacity-90">
              Be among the first to experience the future of international education planning.
            </p>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                    <Check className="h-5 w-5" />
                  </div>
                  <span className="text-lg font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            <p className="text-base opacity-75 font-semibold">
              Private beta • Full launch August 2025
            </p>
          </div>

          {/* Right Form */}
          <Card className="p-10 border-2 border-white/20 bg-white dark:bg-zinc-950 shadow-2xl">
            {submitted ? (
              <div className="text-center py-8">
                <div className="inline-flex p-6 rounded-full bg-primary/10 mb-6">
                  <Check className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-4">
                  You're On The List!
                </h3>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
                  We've added you to our waitlist. You'll be first to know when Akada launches.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                  className="border-2 font-bold"
                >
                  Add Another Email
                </Button>
              </div>
            ) : (
              <>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-8">
                  Get Early Access
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition-all duration-300"
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition-all duration-300"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="educationLevel" className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">
                      Education Level
                    </label>
                    <select
                      id="educationLevel"
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition-all duration-300"
                      required
                    >
                      <option value="">Select your level</option>
                      <option value="undergraduate">Undergraduate Student</option>
                      <option value="graduate">Recent Graduate</option>
                      <option value="professional">Working Professional</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 font-bold bg-primary hover:bg-primary/90 text-lg group"
                  >
                    Join Waitlist
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>

                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-6 text-center">
                  By signing up, you agree to our Terms & Privacy Policy.
                </p>
              </>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LandingSignupMinimalist;
