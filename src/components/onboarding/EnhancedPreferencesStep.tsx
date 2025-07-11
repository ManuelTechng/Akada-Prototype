/**
 * Enhanced Preferences Step - Collects detailed preferences for improved matching
 */
import React, { useState } from 'react';
import { Target, Sparkles, Brain, TrendingUp, Globe, Users } from 'lucide-react';

interface EnhancedPreferencesStepProps {
  onComplete: (preferences: EnhancedPreferences) => void;
  initialData?: Partial<EnhancedPreferences>;
}

export interface EnhancedPreferences {
  // Program Details
  program_duration: string[];
  program_format: string[];
  university_ranking: string;
  
  // Academic Preferences
  preferred_gpa_requirement: string;
  test_requirements: {
    gre_required: boolean;
    ielts_minimum: number;
    toefl_minimum: number;
  };
  
  // Career & Life Goals
  career_goals: string[];
  industry_focus: string[];
  post_graduation_plans: string;
  climate_preference: string;
}

const EnhancedPreferencesStep: React.FC<EnhancedPreferencesStepProps> = ({ 
  onComplete, 
  initialData = {} 
}) => {
  const [preferences, setPreferences] = useState<EnhancedPreferences>({
    program_duration: initialData.program_duration || [],
    program_format: initialData.program_format || [],
    university_ranking: initialData.university_ranking || '',
    preferred_gpa_requirement: initialData.preferred_gpa_requirement || '',
    test_requirements: {
      gre_required: initialData.test_requirements?.gre_required || false,
      ielts_minimum: initialData.test_requirements?.ielts_minimum || 6.0,
      toefl_minimum: initialData.test_requirements?.toefl_minimum || 80
    },
    career_goals: initialData.career_goals || [],
    industry_focus: initialData.industry_focus || [],
    post_graduation_plans: initialData.post_graduation_plans || '',
    climate_preference: initialData.climate_preference || ''
  });

  const handleArrayToggle = (field: keyof EnhancedPreferences, value: string) => {
    setPreferences(prev => {
      const currentArray = prev[field] as string[];
      const updated = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [field]: updated
      };
    });
  };

  const handleInputChange = (field: keyof EnhancedPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestRequirementChange = (field: keyof EnhancedPreferences['test_requirements'], value: any) => {
    setPreferences(prev => ({
      ...prev,
      test_requirements: {
        ...prev.test_requirements,
        [field]: value
      }
    }));
  };

  const handleSubmit = () => {
    onComplete(preferences);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-indigo-600" />
        </div>
        <h3 className="text-2xl font-nunito-bold text-gray-900">Let's Get Specific</h3>
        <p className="mt-2 text-gray-600">
          Help us find the perfect programs with these detailed preferences
        </p>
      </div>

      {/* Program Characteristics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-blue-600" />
          <h4 className="text-lg font-nunito-bold text-gray-900">Program Characteristics</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-nunito-semibold text-gray-700 mb-3">
              Preferred Program Duration
            </label>
            <div className="space-y-2">
              {['1 year', '1.5 years', '2 years', '3+ years', 'Flexible'].map(duration => (
                <label key={duration} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.program_duration.includes(duration)}
                    onChange={() => handleArrayToggle('program_duration', duration)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{duration}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-nunito-semibold text-gray-700 mb-3">
              Program Format
            </label>
            <div className="space-y-2">
              {['Full-time', 'Part-time', 'Online', 'Hybrid', 'Evening classes'].map(format => (
                <label key={format} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.program_format.includes(format)}
                    onChange={() => handleArrayToggle('program_format', format)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{format}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-nunito-semibold text-gray-700 mb-2">
            University Ranking Importance
          </label>
          <select
            value={preferences.university_ranking}
            onChange={(e) => handleInputChange('university_ranking', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select importance level</option>
            <option value="Top 50 globally">Must be Top 50 globally</option>
            <option value="Top 100 globally">Prefer Top 100 globally</option>
            <option value="Top 200 globally">Top 200 globally is fine</option>
            <option value="Regional reputation">Strong regional reputation</option>
            <option value="Not important">Ranking not important</option>
          </select>
        </div>
      </div>

      {/* Academic Requirements */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-green-600" />
          <h4 className="text-lg font-nunito-bold text-gray-900">Academic Preferences</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-nunito-semibold text-gray-700 mb-2">
              Preferred GPA Requirement
            </label>
            <select
              value={preferences.preferred_gpa_requirement}
              onChange={(e) => handleInputChange('preferred_gpa_requirement', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Any GPA requirement</option>
              <option value="No minimum">No minimum GPA</option>
              <option value="2.5+">2.5 GPA or higher</option>
              <option value="3.0+">3.0 GPA or higher</option>
              <option value="3.5+">3.5 GPA or higher</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-nunito-semibold text-gray-700 mb-2">
              Climate Preference
            </label>
            <select
              value={preferences.climate_preference}
              onChange={(e) => handleInputChange('climate_preference', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">No preference</option>
              <option value="Tropical">Tropical (warm year-round)</option>
              <option value="Temperate">Temperate (mild seasons)</option>
              <option value="Cold">Cold (distinct winters)</option>
              <option value="Dry">Dry (low humidity)</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={preferences.test_requirements.gre_required}
              onChange={(e) => handleTestRequirementChange('gre_required', e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              I'm willing to take the GRE if required
            </span>
          </label>
        </div>
      </div>

      {/* Career Goals */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          <h4 className="text-lg font-nunito-bold text-gray-900">Career & Life Goals</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-nunito-semibold text-gray-700 mb-3">
              Career Goals (select up to 3)
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {[
                'Leadership role', 'Technical expertise', 'Entrepreneurship', 
                'Research career', 'Consulting', 'Finance/Banking', 
                'Technology/Software', 'Healthcare', 'Education', 
                'Government/Policy', 'Non-profit work', 'Creative industries'
              ].map(goal => (
                <label key={goal} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.career_goals.includes(goal)}
                    onChange={() => handleArrayToggle('career_goals', goal)}
                    disabled={preferences.career_goals.length >= 3 && !preferences.career_goals.includes(goal)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">{goal}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {preferences.career_goals.length}/3 selected
            </p>
          </div>

          <div>
            <label className="block text-sm font-nunito-semibold text-gray-700 mb-3">
              Industry Focus (select up to 2)
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {[
                'Technology', 'Finance', 'Healthcare', 'Education', 
                'Manufacturing', 'Energy', 'Retail', 'Media', 
                'Real Estate', 'Agriculture', 'Transportation', 'Government'
              ].map(industry => (
                <label key={industry} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.industry_focus.includes(industry)}
                    onChange={() => handleArrayToggle('industry_focus', industry)}
                    disabled={preferences.industry_focus.length >= 2 && !preferences.industry_focus.includes(industry)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">{industry}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {preferences.industry_focus.length}/2 selected
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-nunito-semibold text-gray-700 mb-2">
            Post-Graduation Plans
          </label>
          <select
            value={preferences.post_graduation_plans}
            onChange={(e) => handleInputChange('post_graduation_plans', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select your plans</option>
            <option value="Work in study country">Work in the country where I study</option>
            <option value="Return to Nigeria">Return to Nigeria</option>
            <option value="Work globally">Open to working anywhere globally</option>
            <option value="Further study">Pursue further education (PhD, etc.)</option>
            <option value="Start business">Start my own business</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <div className="text-sm text-gray-500">
          These preferences help us find programs that align with your long-term goals
        </div>
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-nunito-semibold"
        >
          Complete Enhanced Setup
        </button>
      </div>
    </div>
  );
};

export default EnhancedPreferencesStep; 