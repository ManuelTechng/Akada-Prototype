import React, { useState } from 'react';
import { updateUserProfile } from '../../lib/auth';
import { useAuth } from '../../contexts/AuthContext';

const OnboardingFlow: React.FC = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    current_university: '',
    field_of_study: '',
    gpa: '',
    test_scores: {
      ielts: '',
      toefl: '',
      gre: {
        verbal: '',
        quantitative: '',
        analytical: ''
      }
    },
    study_preferences: {
      countries: [],
      max_tuition: '',
      program_type: [],
      start_date: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateUserProfile(user.id, formData);
      // Navigate to dashboard or next step
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Academic Background</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current/Previous University
              </label>
              <input
                type="text"
                value={formData.current_university}
                onChange={(e) => setFormData({
                  ...formData,
                  current_university: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field of Study
              </label>
              <input
                type="text"
                value={formData.field_of_study}
                onChange={(e) => setFormData({
                  ...formData,
                  field_of_study: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GPA
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.gpa}
                onChange={(e) => setFormData({
                  ...formData,
                  gpa: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Test Scores</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IELTS Score
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.test_scores.ielts}
                onChange={(e) => setFormData({
                  ...formData,
                  test_scores: {
                    ...formData.test_scores,
                    ielts: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            {/* Add other test score fields */}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Study Preferences</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Countries
              </label>
              <select
                multiple
                value={formData.study_preferences.countries}
                onChange={(e) => setFormData({
                  ...formData,
                  study_preferences: {
                    ...formData.study_preferences,
                    countries: Array.from(e.target.selectedOptions, option => option.value)
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="usa">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="canada">Canada</option>
                <option value="australia">Australia</option>
                <option value="germany">Germany</option>
              </select>
            </div>
            {/* Add other preference fields */}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Complete Your Profile</h1>
            <span className="text-sm text-gray-500">Step {step} of 3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {renderStep()}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className={`px-4 py-2 rounded-md ${
                step === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Previous
            </button>
            <button
              type={step === 3 ? 'submit' : 'button'}
              onClick={() => step < 3 && setStep(step + 1)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {step === 3 ? 'Complete' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingFlow;