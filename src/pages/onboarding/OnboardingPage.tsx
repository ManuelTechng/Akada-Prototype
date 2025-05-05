import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../lib/auth';
import { GraduationCap, Check, ChevronRight, BookOpen, MapPin, DollarSign, Calendar, School, AlertCircle } from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  
  const totalSteps = 4;
  
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
      countries: [] as string[],
      max_tuition: '',
      program_type: [] as string[],
      start_date: ''
    }
  });

  // Debug current state
  useEffect(() => {
    console.log('OnboardingPage: Current Step:', step);
    console.log('OnboardingPage: Form Data:', formData);
  }, [step, formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`OnboardingPage: Input Change - Field: ${name}, Value: ${value}`);
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const updated = {...prev};
        delete updated[name];
        return updated;
      });
    }
    
    if (name.includes('.')) {
      const [section, field, subfield] = name.split('.');
      
      if (subfield) {
        setFormData(prev => ({
          ...prev,
          [section]: {
            ...prev[section as keyof typeof prev],
            [field]: {
              ...prev[section as keyof typeof prev][field as keyof typeof prev[keyof typeof prev]],
              [subfield]: value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [section]: {
            ...prev[section as keyof typeof prev],
            [field]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const [section, field] = name.split('.');
    
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    
    console.log(`OnboardingPage: Multi-Select Change - Field: ${name}, Values:`, selectedValues);
    
    // Clear validation error
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const updated = {...prev};
        delete updated[name];
        return updated;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: selectedValues
      }
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    const errors: { [key: string]: string } = {};
    
    // Step-specific validation
    if (currentStep === 1) {
      // Educational Background validation
      if (!formData.current_university.trim()) {
        errors['current_university'] = 'Current/Previous University is required';
      }
      if (!formData.field_of_study.trim()) {
        errors['field_of_study'] = 'Field of Study is required';
      }
      // GPA is optional, but if provided, validate format
      if (formData.gpa && isNaN(Number(formData.gpa))) {
        errors['gpa'] = 'GPA must be a number';
      }
    } else if (currentStep === 2) {
      // Test scores are optional for this step
      // Additional validation could be added for score ranges if needed
    } else if (currentStep === 3) {
      // Study Preferences validation
      if (formData.study_preferences.countries.length === 0) {
        errors['study_preferences.countries'] = 'Please select at least one country';
      }
      if (formData.study_preferences.program_type.length === 0) {
        errors['study_preferences.program_type'] = 'Please select at least one program type';
      }
    } else if (currentStep === 4) {
      // Budget and Timeline validation
      if (!formData.study_preferences.max_tuition) {
        errors['study_preferences.max_tuition'] = 'Please select a tuition budget';
      }
      if (!formData.study_preferences.start_date) {
        errors['study_preferences.start_date'] = 'Please select a preferred start date';
      }
    }
    
    if (Object.keys(errors).length > 0) {
      console.log('OnboardingPage: Validation Errors:', errors);
      setValidationErrors(errors);
      return false;
    }
    
    return true;
  };

  const nextStep = () => {
    console.log(`OnboardingPage: Attempting to move from step ${step} to ${step + 1}`);
    
    // Validate current step before proceeding
    if (!validateStep(step)) {
      console.log('OnboardingPage: Validation failed');
      return;
    }
    
    window.scrollTo(0, 0);
    setStep(prev => {
      const nextStepValue = Math.min(prev + 1, totalSteps);
      console.log(`OnboardingPage: Moving to step ${nextStepValue}`);
      return nextStepValue;
    });
    setValidationErrors({});
  };
  
  const prevStep = () => {
    console.log(`OnboardingPage: Moving back from step ${step} to ${step - 1}`);
    window.scrollTo(0, 0);
    setStep(prev => Math.max(prev - 1, 1));
    setValidationErrors({});
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation before submission
    if (!validateStep(step)) {
      console.log('OnboardingPage: Final validation failed');
      return;
    }
    
    if (!user) {
      setError('You must be logged in to complete onboarding');
      return;
    }
    
    console.log('OnboardingPage: Submitting profile data:', formData);
    setLoading(true);
    setError(null);
    
    try {
      await updateUserProfile(user.id, formData);
      console.log('OnboardingPage: Profile updated successfully');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine if a field has an error
  const hasError = (fieldName: string): boolean => {
    return Object.keys(validationErrors).includes(fieldName);
  };
  
  // Helper to get error message for a field
  const getErrorMessage = (fieldName: string): string => {
    return validationErrors[fieldName] || '';
  };
  
  const renderEducationStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Educational Background</h3>
        <p className="mt-1 text-sm text-gray-500">
          Tell us about your educational history to help us match you with suitable programs.
        </p>
      </div>

      <div>
        <label htmlFor="current_university" className="block text-sm font-medium text-gray-700">
          Current/Previous University <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <School className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="current_university"
            name="current_university"
            value={formData.current_university}
            onChange={handleInputChange}
            className={`block w-full pl-10 pr-3 py-2 border ${hasError('current_university') ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm sm:text-sm`}
            placeholder="e.g., University of Lagos"
          />
        </div>
        {hasError('current_university') && (
          <p className="mt-1 text-sm text-red-600">{getErrorMessage('current_university')}</p>
        )}
      </div>

      <div>
        <label htmlFor="field_of_study" className="block text-sm font-medium text-gray-700">
          Field of Study <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <BookOpen className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="field_of_study"
            name="field_of_study"
            value={formData.field_of_study}
            onChange={handleInputChange}
            className={`block w-full pl-10 pr-3 py-2 border ${hasError('field_of_study') ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm sm:text-sm`}
            placeholder="e.g., Computer Science"
          />
        </div>
        {hasError('field_of_study') && (
          <p className="mt-1 text-sm text-red-600">{getErrorMessage('field_of_study')}</p>
        )}
      </div>

      <div>
        <label htmlFor="gpa" className="block text-sm font-medium text-gray-700">
          GPA (on 4.0 scale)
        </label>
        <input
          type="text"
          id="gpa"
          name="gpa"
          value={formData.gpa}
          onChange={handleInputChange}
          className={`mt-1 block w-full py-2 px-3 border ${hasError('gpa') ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm sm:text-sm`}
          placeholder="e.g., 3.5"
        />
        {hasError('gpa') && (
          <p className="mt-1 text-sm text-red-600">{getErrorMessage('gpa')}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">Optional. Leave blank if not applicable.</p>
      </div>
    </div>
  );
  
  const renderTestScoresStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Test Scores</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add your standardized test scores if available. These help us match you with programs where you meet the requirements.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="test_scores.ielts" className="block text-sm font-medium text-gray-700">
            IELTS Score (if applicable)
          </label>
          <input
            type="text"
            id="test_scores.ielts"
            name="test_scores.ielts"
            value={formData.test_scores.ielts}
            onChange={handleInputChange}
            className={`mt-1 block w-full py-2 px-3 border ${hasError('test_scores.ielts') ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm sm:text-sm`}
            placeholder="e.g., 7.5"
          />
          {hasError('test_scores.ielts') && (
            <p className="mt-1 text-sm text-red-600">{getErrorMessage('test_scores.ielts')}</p>
          )}
        </div>

        <div>
          <label htmlFor="test_scores.toefl" className="block text-sm font-medium text-gray-700">
            TOEFL Score (if applicable)
          </label>
          <input
            type="text"
            id="test_scores.toefl"
            name="test_scores.toefl"
            value={formData.test_scores.toefl}
            onChange={handleInputChange}
            className={`mt-1 block w-full py-2 px-3 border ${hasError('test_scores.toefl') ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm sm:text-sm`}
            placeholder="e.g., 100"
          />
          {hasError('test_scores.toefl') && (
            <p className="mt-1 text-sm text-red-600">{getErrorMessage('test_scores.toefl')}</p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">GRE Scores (if applicable)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="test_scores.gre.verbal" className="block text-sm font-medium text-gray-700">
                GRE Verbal
              </label>
              <input
                type="text"
                id="test_scores.gre.verbal"
                name="test_scores.gre.verbal"
                value={formData.test_scores.gre.verbal}
                onChange={handleInputChange}
                className={`mt-1 block w-full py-2 px-3 border ${hasError('test_scores.gre.verbal') ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm sm:text-sm`}
                placeholder="e.g., 155"
              />
              {hasError('test_scores.gre.verbal') && (
                <p className="mt-1 text-sm text-red-600">{getErrorMessage('test_scores.gre.verbal')}</p>
              )}
            </div>
            <div>
              <label htmlFor="test_scores.gre.quantitative" className="block text-sm font-medium text-gray-700">
                GRE Quantitative
              </label>
              <input
                type="text"
                id="test_scores.gre.quantitative"
                name="test_scores.gre.quantitative"
                value={formData.test_scores.gre.quantitative}
                onChange={handleInputChange}
                className={`mt-1 block w-full py-2 px-3 border ${hasError('test_scores.gre.quantitative') ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm sm:text-sm`}
                placeholder="e.g., 160"
              />
              {hasError('test_scores.gre.quantitative') && (
                <p className="mt-1 text-sm text-red-600">{getErrorMessage('test_scores.gre.quantitative')}</p>
              )}
            </div>
            <div>
              <label htmlFor="test_scores.gre.analytical" className="block text-sm font-medium text-gray-700">
                GRE Analytical Writing
              </label>
              <input
                type="text"
                id="test_scores.gre.analytical"
                name="test_scores.gre.analytical"
                value={formData.test_scores.gre.analytical}
                onChange={handleInputChange}
                className={`mt-1 block w-full py-2 px-3 border ${hasError('test_scores.gre.analytical') ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm sm:text-sm`}
                placeholder="e.g., 4.5"
              />
              {hasError('test_scores.gre.analytical') && (
                <p className="mt-1 text-sm text-red-600">{getErrorMessage('test_scores.gre.analytical')}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-sm text-indigo-700 mt-4">
        <p>
          <strong>Note:</strong> You can skip this section if you haven't taken these tests yet. You can always update your scores later.
        </p>
      </div>
    </div>
  );
  
  const renderStudyPreferencesStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Study Preferences</h3>
        <p className="mt-1 text-sm text-gray-500">
          Tell us about your preferred study destinations and program types.
        </p>
      </div>

      <div>
        <label htmlFor="study_preferences.countries" className="block text-sm font-medium text-gray-700">
          Preferred Countries <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="study_preferences.countries"
            name="study_preferences.countries"
            multiple
            value={formData.study_preferences.countries}
            onChange={handleMultiSelectChange}
            className={`block w-full pl-10 pr-3 py-2 border ${hasError('study_preferences.countries') ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm sm:text-sm h-32 md:h-40`}
          >
            <option value="Nigeria">Nigeria</option>
            <option value="USA">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Germany">Germany</option>
            <option value="Australia">Australia</option>
            <option value="France">France</option>
            <option value="Netherlands">Netherlands</option>
            <option value="Sweden">Sweden</option>
            <option value="Switzerland">Switzerland</option>
            <option value="Ireland">Ireland</option>
            <option value="Japan">Japan</option>
            <option value="South Korea">South Korea</option>
            <option value="China">China</option>
          </select>
        </div>
        {hasError('study_preferences.countries') && (
          <p className="mt-1 text-sm text-red-600">{getErrorMessage('study_preferences.countries')}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple countries</p>
      </div>

      <div>
        <label htmlFor="study_preferences.program_type" className="block text-sm font-medium text-gray-700">
          Program Types <span className="text-red-500">*</span>
        </label>
        <select
          id="study_preferences.program_type"
          name="study_preferences.program_type"
          multiple
          value={formData.study_preferences.program_type}
          onChange={handleMultiSelectChange}
          className={`mt-1 block w-full py-2 px-3 border ${hasError('study_preferences.program_type') ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm sm:text-sm h-28`}
        >
          <option value="Masters">Master's</option>
          <option value="PhD">PhD</option>
          <option value="Bachelor">Bachelor's</option>
          <option value="Certificate">Certificate/Diploma</option>
          <option value="Professional">Professional Degree</option>
        </select>
        {hasError('study_preferences.program_type') && (
          <p className="mt-1 text-sm text-red-600">{getErrorMessage('study_preferences.program_type')}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple program types</p>
      </div>
    </div>
  );
  
  const renderBudgetStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Budget & Timeline</h3>
        <p className="mt-1 text-sm text-gray-500">
          Help us understand your budget constraints and timeline for beginning your studies.
        </p>
      </div>

      <div>
        <label htmlFor="study_preferences.max_tuition" className="block text-sm font-medium text-gray-700">
          Maximum Annual Tuition Budget <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="study_preferences.max_tuition"
            name="study_preferences.max_tuition"
            value={formData.study_preferences.max_tuition}
            onChange={handleInputChange}
            className={`block w-full pl-10 pr-3 py-2 border ${hasError('study_preferences.max_tuition') ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm sm:text-sm`}
          >
            <option value="">Select your budget</option>
            <option value="5000">Less than $5,000 USD</option>
            <option value="10000">$5,000 - $10,000 USD</option>
            <option value="20000">$10,000 - $20,000 USD</option>
            <option value="30000">$20,000 - $30,000 USD</option>
            <option value="40000">$30,000 - $40,000 USD</option>
            <option value="50000">$40,000 - $50,000 USD</option>
            <option value="100000">More than $50,000 USD</option>
            <option value="any">No specific budget</option>
          </select>
        </div>
        {hasError('study_preferences.max_tuition') && (
          <p className="mt-1 text-sm text-red-600">{getErrorMessage('study_preferences.max_tuition')}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">This helps us filter programs within your financial reach</p>
      </div>

      <div>
        <label htmlFor="study_preferences.start_date" className="block text-sm font-medium text-gray-700">
          Preferred Start Date <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="study_preferences.start_date"
            name="study_preferences.start_date"
            value={formData.study_preferences.start_date}
            onChange={handleInputChange}
            className={`block w-full pl-10 pr-3 py-2 border ${hasError('study_preferences.start_date') ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm sm:text-sm`}
          >
            <option value="">Select preferred start date</option>
            <option value="Fall 2024">Fall 2024</option>
            <option value="Spring 2025">Spring 2025</option>
            <option value="Summer 2025">Summer 2025</option>
            <option value="Fall 2025">Fall 2025</option>
            <option value="Spring 2026">Spring 2026</option>
            <option value="Fall 2026">Fall 2026</option>
          </select>
        </div>
        {hasError('study_preferences.start_date') && (
          <p className="mt-1 text-sm text-red-600">{getErrorMessage('study_preferences.start_date')}</p>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-700 mt-6">
        <div className="font-medium mb-1">Did you know?</div>
        <p>
          Many universities in countries like Germany and Norway have minimal or no tuition fees for international students.
          Our program search can help you discover these affordable options.
        </p>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <GraduationCap className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Welcome to Akada</h2>
          <p className="mt-2 text-gray-600">
            Let's set up your profile to help you find the perfect academic programs.
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="mb-10">
          <div className="relative">
            <div className="overflow-hidden h-2 flex rounded-full bg-gray-200">
              <div 
                className="transition-all duration-500 ease-out h-full bg-indigo-600 rounded-full"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
            <div className="absolute top-0 inset-x-0 flex justify-between transform -translate-y-6">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    step > index + 1 ? 'border-indigo-600 bg-indigo-600 text-white' : 
                    step === index + 1 ? 'border-indigo-600 text-indigo-600' : 
                    'border-gray-300 text-gray-500'
                  }`}>
                    {step > index + 1 ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Debug information in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-gray-800 text-white rounded-md text-sm font-mono overflow-x-auto">
            <div>Current Step: {step}</div>
            <div>Validation Errors: {JSON.stringify(validationErrors, null, 2)}</div>
          </div>
        )}
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {/* If there are validation errors, show a summary */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <h4 className="font-medium flex items-center mb-2">
              <AlertCircle className="h-5 w-5 mr-2" />
              Please fix the following errors:
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {Object.values(validationErrors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={step === totalSteps ? handleSubmit : e => { e.preventDefault(); nextStep(); }}>
              {step === 1 && renderEducationStep()}
              {step === 2 && renderTestScoresStep()}
              {step === 3 && renderStudyPreferencesStep()}
              {step === 4 && renderBudgetStep()}
              
              <div className="flex justify-between mt-8 pt-5 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={step === 1 || loading}
                  className={`${
                    step === 1 ? 'invisible' : ''
                  } inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Previous
                </button>
                <button
                  type={step === totalSteps ? "submit" : "button"}
                  disabled={loading}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Processing...' : step === totalSteps ? 'Complete Setup' : (
                    <>
                      Continue
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            Step {step} of {totalSteps}: {
              step === 1 ? 'Educational Background' : 
              step === 2 ? 'Test Scores' : 
              step === 3 ? 'Study Preferences' :
              'Budget & Timeline'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;