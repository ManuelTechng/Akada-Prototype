import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const LandingSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would connect to your backend
    console.log({ name, email, educationLevel });
    setSubmitted(true);
  };

  return (
    <section className="py-16 md:py-24 bg-indigo-600" id="signup">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the Akada Waitlist</h2>
            <p className="text-xl mb-8">
              Be among the first to experience the future of international education planning. 
              Sign up for early access and receive:
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <div className="bg-indigo-500 rounded-full p-1 mr-3 mt-1">
                  <ArrowRight className="h-4 w-4" />
                </div>
                <span>Priority access when we launch</span>
              </li>
              <li className="flex items-start">
                <div className="bg-indigo-500 rounded-full p-1 mr-3 mt-1">
                  <ArrowRight className="h-4 w-4" />
                </div>
                <span>Exclusive 30% discount on Premium plan for 3 months</span>
              </li>
              <li className="flex items-start">
                <div className="bg-indigo-500 rounded-full p-1 mr-3 mt-1">
                  <ArrowRight className="h-4 w-4" />
                </div>
                <span>Early access to new features before public release</span>
              </li>
              <li className="flex items-start">
                <div className="bg-indigo-500 rounded-full p-1 mr-3 mt-1">
                  <ArrowRight className="h-4 w-4" />
                </div>
                <span>Opportunity to provide feedback and shape the platform</span>
              </li>
            </ul>
            <p className="text-indigo-200">
              Currently in private beta. Full launch expected in August 2025.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="bg-green-100 text-green-800 rounded-full p-3 inline-block mb-4">
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Thank You for Joining!</h3>
                <p className="text-gray-600 mb-6">
                  We've added you to our waitlist. You'll be among the first to know when Akada launches.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
                >
                  Add another email
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Get Early Access</h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="educationLevel" className="block text-gray-700 mb-2">Current Education Level</label>
                    <select
                      id="educationLevel"
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select your education level</option>
                      <option value="undergraduate">Undergraduate Student</option>
                      <option value="graduate">Recent Graduate</option>
                      <option value="professional">Working Professional</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Join Waitlist
                  </button>
                </form>
                <p className="text-gray-500 text-sm mt-4 text-center">
                  By signing up, you agree to our Terms of Service and Privacy Policy.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingSignup;