import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, getUserProfile } from '../../lib/auth';
import { useAuth } from '../../contexts/AuthContext';

const OnboardingFlow: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    // Basic info (these should already exist from signup)
    full_name: '',
    email: '',
    education_level: '',
    
    // Academic info
    current_university: '',
    field_of_study: '',
    gpa: '',
    
    // Contact info
    phone_number: '',
    
    // Location info
    address_line1: '',
    address_line2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
    
    // Personal info
    date_of_birth: '',
    bio: '',
    
    // Test scores
    test_scores: {
      ielts: '',
      toefl: '',
      gre: {
        verbal: '',
        quantitative: '',
        analytical: ''
      }
    },
    
    // Study preferences
    study_preferences: {
      countries: [] as string[],
      max_tuition: '',
      program_type: [] as string[],
      start_date: ''
    }
  });

  // Fetch existing profile data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const profileData = await getUserProfile(user.id);
        if (profileData) {
          setFormData(prevData => ({
            ...prevData,
            ...profileData,
            // Ensure nested objects are properly merged
            test_scores: {
              ...prevData.test_scores,
              ...(profileData.test_scores || {}),
              gre: {
                ...prevData.test_scores?.gre,
                ...(profileData.test_scores?.gre || {}),
                // Ensure all values are properly typed
                verbal: profileData.test_scores?.gre?.verbal ?? prevData.test_scores?.gre?.verbal ?? '',
                quantitative: profileData.test_scores?.gre?.quantitative ?? prevData.test_scores?.gre?.quantitative ?? '',
                analytical: profileData.test_scores?.gre?.analytical ?? prevData.test_scores?.gre?.analytical ?? ''
              }
            },
            study_preferences: {
              ...prevData.study_preferences,
              ...(profileData.study_preferences || {}),
              // Ensure arrays are properly handled
              countries: profileData.study_preferences?.countries || [],
              program_type: profileData.study_preferences?.program_type || []
            }
          }));
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      // Update the user's profile with all form data
      const profileData = {
        ...formData,
        gpa: formData.gpa ? parseFloat(formData.gpa) : undefined
      }
      await updateUserProfile(user.id, profileData);
      
      // Navigate to dashboard after successful onboarding
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfoStep = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Basic Information</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          value={formData.full_name}
          onChange={(e) => setFormData({
            ...formData,
            full_name: e.target.value
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={true} // Name is set during signup
        />
        <p className="text-xs text-gray-500 mt-1">Set during signup. Contact support to change.</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Education Level
        </label>
        <select
          value={formData.education_level}
          onChange={(e) => setFormData({
            ...formData,
            education_level: e.target.value
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select education level</option>
          <option value="undergraduate">Undergraduate</option>
          <option value="graduate">Graduate</option>
          <option value="professional">Professional</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          value={formData.phone_number}
          onChange={(e) => setFormData({
            ...formData,
            phone_number: e.target.value
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="+234 801 234 5678"
        />
      </div>
    </div>
  );

  const renderAcademicInfoStep = () => (
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
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Brief Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({
            ...formData,
            bio: e.target.value
          })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Tell us a bit about yourself..."
        />
      </div>
    </div>
  );

  const renderTestScoresStep = () => (
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
          placeholder="Overall score (e.g. 7.5)"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          TOEFL Score
        </label>
        <input
          type="number"
          value={formData.test_scores.toefl}
          onChange={(e) => setFormData({
            ...formData,
            test_scores: {
              ...formData.test_scores,
              toefl: e.target.value
            }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Total score (e.g. 95)"
        />
      </div>
      
      <div>
        <h3 className="text-md font-medium text-gray-800 mb-2">GRE Scores</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verbal
            </label>
            <input
              type="number"
              value={formData.test_scores.gre.verbal}
              onChange={(e) => setFormData({
                ...formData,
                test_scores: {
                  ...formData.test_scores,
                  gre: {
                    ...formData.test_scores.gre,
                    verbal: e.target.value
                  }
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantitative
            </label>
            <input
              type="number"
              value={formData.test_scores.gre.quantitative}
              onChange={(e) => setFormData({
                ...formData,
                test_scores: {
                  ...formData.test_scores,
                  gre: {
                    ...formData.test_scores.gre,
                    quantitative: e.target.value
                  }
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Analytical
            </label>
            <input
              type="number"
              step="0.5"
              value={formData.test_scores.gre.analytical}
              onChange={(e) => setFormData({
                ...formData,
                test_scores: {
                  ...formData.test_scores,
                  gre: {
                    ...formData.test_scores.gre,
                    analytical: e.target.value
                  }
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudyPreferencesStep = () => (
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
        >
          <option value="USA">United States</option>
          <option value="UK">United Kingdom</option>
          <option value="Canada">Canada</option>
          <option value="Australia">Australia</option>
          <option value="Germany">Germany</option>
          <option value="Netherlands">Netherlands</option>
          <option value="Sweden">Sweden</option>
          <option value="Switzerland">Switzerland</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple countries</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Maximum Tuition Budget (USD/year)
        </label>
        <select
          value={formData.study_preferences.max_tuition}
          onChange={(e) => setFormData({
            ...formData,
            study_preferences: {
              ...formData.study_preferences,
              max_tuition: e.target.value
            }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select budget range</option>
          <option value="10000">Under $10,000</option>
          <option value="20000">$10,000 - $20,000</option>
          <option value="30000">$20,000 - $30,000</option>
          <option value="40000">$30,000 - $40,000</option>
          <option value="50000">$40,000 - $50,000</option>
          <option value="100000">$50,000+</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Program Types
        </label>
        <select
          multiple
          value={formData.study_preferences.program_type}
          onChange={(e) => setFormData({
            ...formData,
            study_preferences: {
              ...formData.study_preferences,
              program_type: Array.from(e.target.selectedOptions, option => option.value)
            }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
        >
          <option value="Masters">Master's Degree</option>
          <option value="PhD">PhD</option>
          <option value="Certificate">Certificate/Diploma</option>
          <option value="Undergraduate">Undergraduate</option>
          <option value="Research">Research Program</option>
          <option value="Professional">Professional Degree</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple program types</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Start Date
        </label>
        <select
          value={formData.study_preferences.start_date}
          onChange={(e) => setFormData({
            ...formData,
            study_preferences: {
              ...formData.study_preferences,
              start_date: e.target.value
            }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select start date</option>
          <option value="Fall 2025">Fall 2025</option>
          <option value="Spring 2026">Spring 2026</option>
          <option value="Fall 2026">Fall 2026</option>
          <option value="Spring 2027">Spring 2027</option>
        </select>
      </div>
    </div>
  );

  const renderContactInfoStep = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Contact Information</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 1
        </label>
        <input
          type="text"
          value={formData.address_line1}
          onChange={(e) => setFormData({
            ...formData,
            address_line1: e.target.value
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Street address, P.O. box, etc."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 2
        </label>
        <input
          type="text"
          value={formData.address_line2}
          onChange={(e) => setFormData({
            ...formData,
            address_line2: e.target.value
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Apartment, suite, unit, building, floor, etc."
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({
              ...formData,
              city: e.target.value
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State / Province
          </label>
          <input
            type="text"
            value={formData.state_province}
            onChange={(e) => setFormData({
              ...formData,
              state_province: e.target.value
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal / Zip Code
          </label>
          <input
            type="text"
            value={formData.postal_code}
            onChange={(e) => setFormData({
              ...formData,
              postal_code: e.target.value
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            value={formData.country}
            onChange={(e) => setFormData({
              ...formData,
              country: e.target.value
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a country</option>
            <option value="Nigeria">Nigeria</option>
            <option value="Ghana">Ghana</option>
            <option value="Kenya">Kenya</option>
            <option value="South Africa">South Africa</option>
            <option value="USA">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
            <option value="China">China</option>
            <option value="India">India</option>
            <option value="Japan">Japan</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderAcademicInfoStep();
      case 3:
        return renderTestScoresStep();
      case 4:
        return renderStudyPreferencesStep();
      case 5:
        return renderContactInfoStep();
      default:
        return null;
    }
  };

  const totalSteps = 5;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Complete Your Profile</h1>
            <span className="text-sm text-gray-500">Step {step} of {totalSteps}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {renderStep()}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              disabled={step === 1 || loading}
              className={`px-4 py-2 rounded-md ${
                step === 1 || loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Previous
            </button>
            
            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Complete Profile'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingFlow;