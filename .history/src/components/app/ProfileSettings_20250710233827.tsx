import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  BookOpen, 
  Save, 
  Lock, 
  Bell, 
  LogOut, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile, signOut as signOutFn } from '../../lib/auth';
import type { UserProfile } from '../../lib/types';
import Select from 'react-select';

const ProfileSettings: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    current_university: '',
    field_of_study: '',
    gpa: '',
    education_level: '',
    // New profile fields
    phone_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
    date_of_birth: '',
    bio: '',
    // Existing fields
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
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Initialize notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: {
      applicationUpdates: true,
      deadlines: true,
      documentReviews: true,
      marketing: false
    },
    inApp: {
      applicationUpdates: true,
      newMessages: true,
      systemAnnouncements: true
    }
  });

  // Define options for countries and program types
  const countryOptions = [
    { value: 'USA', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Germany', label: 'Germany' },
    { value: 'Netherlands', label: 'Netherlands' },
    { value: 'Sweden', label: 'Sweden' },
    { value: 'Switzerland', label: 'Switzerland' },
  ];
  const programTypeOptions = [
    { value: 'Masters', label: "Master's Degree" },
    { value: 'PhD', label: 'PhD' },
    { value: 'Certificate', label: 'Certificate/Diploma' },
    { value: 'Undergraduate', label: 'Undergraduate' },
    { value: 'Research', label: 'Research Program' },
    { value: 'Professional', label: 'Professional Degree' },
  ];

  // Handle checkbox changes for notification preferences
  const handleCheckboxChange = (section: 'email' | 'inApp', prefName: string, checked: boolean) => {
    if (!isEditing) return;
    
    setNotificationPrefs(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [prefName]: checked
      }
    }));
  };
  
  // For debugging - log what's coming from auth context
  useEffect(() => {
    console.log('ProfileSettings: User data from auth context:', { user, profile });
  }, [user, profile]);
  
  // Explicitly refresh profile data when component mounts - only once
  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (user && !profile) {
          console.log('ProfileSettings: Explicitly refreshing profile data for user:', user.id);
          await refreshProfile();
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    // Only load if we have a user but no profile yet
    if (user && !initialLoadComplete && !profile) {
      loadProfileData();
    }
  }, [user?.id]); // Only depend on user ID, not the refreshProfile function
  
  // Populate form with user data when available - only on initial load
  useEffect(() => {
    if (!initialLoadComplete && profile) {
      try {
        console.log('Setting form data from profile:', profile);
        setFormData({
          full_name: profile.full_name || '',
          email: profile.email || (user?.email || ''),
          education_level: profile.education_level || '',
          current_university: profile.current_university || '',
          field_of_study: profile.field_of_study || '',
          gpa: profile.gpa?.toString() || '',
          // New profile fields
          phone_number: profile.phone_number || '',
          address_line1: profile.address_line1 || '',
          address_line2: profile.address_line2 || '',
          city: profile.city || '',
          state_province: profile.state_province || '',
          postal_code: profile.postal_code || '',
          country: profile.country || '',
          date_of_birth: profile.date_of_birth || '',
          bio: profile.bio || '',
          // Existing fields
          test_scores: {
            ielts: profile.test_scores?.ielts?.toString() || '',
            toefl: profile.test_scores?.toefl?.toString() || '',
            gre: {
              verbal: profile.test_scores?.gre?.verbal?.toString() || '',
              quantitative: profile.test_scores?.gre?.quantitative?.toString() || '',
              analytical: profile.test_scores?.gre?.analytical?.toString() || ''
            }
          },
          study_preferences: {
            countries: profile.study_preferences?.countries || [],
            max_tuition: profile.study_preferences?.max_tuition?.toString() || '',
            program_type: profile.study_preferences?.program_type || [],
            start_date: profile.study_preferences?.start_date || ''
          }
        });
        setInitialLoadComplete(true);
      } catch (err) {
        console.error('Error setting form data:', err);
        setError('Failed to load profile data. Please try refreshing the page.');
      }
    } else if (!initialLoadComplete && user) {
      try {
        setFormData(prev => ({
          ...prev,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          education_level: user.user_metadata?.education_level || ''
        }));
        setInitialLoadComplete(true);
      } catch (err) {
        console.error('Error setting initial form data:', err);
        setError('Failed to load user data. Please try refreshing the page.');
      }
    }
    setLoading(false);
  }, [profile, user, initialLoadComplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!isEditing) return;
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...((typeof prev[section as keyof typeof prev] === 'object' && prev[section as keyof typeof prev] !== null) ? prev[section as keyof typeof prev] as object : {}),
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!isEditing) return;
    const { name, options } = e.target;
    const [section, field] = name.split('.');
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...((typeof prev[section as keyof typeof prev] === 'object' && prev[section as keyof typeof prev] !== null) ? prev[section as keyof typeof prev] as object : {}),
        [field]: selectedValues
      }
    }));
  };

  const handleGREInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    
    const { name, value } = e.target;
    const field = name.split('.')[2]; // Get the GRE field name (verbal, quantitative, analytical)
    
    setFormData(prev => ({
      ...prev,
      test_scores: {
        ...prev.test_scores,
        gre: {
          ...prev.test_scores.gre,
          [field]: value
        }
      }
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) {
      setError('You must be logged in to save your profile');
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    setError(null);
    
    try {
      // Convert string values to numbers where needed
      const profileData: Partial<UserProfile> = {
        full_name: formData.full_name,
        email: formData.email,
        education_level: formData.education_level,
        current_university: formData.current_university,
        field_of_study: formData.field_of_study,
        gpa: formData.gpa ? parseFloat(formData.gpa) : undefined,
        phone_number: formData.phone_number,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        state_province: formData.state_province,
        postal_code: formData.postal_code,
        country: formData.country,
        date_of_birth: formData.date_of_birth,
        bio: formData.bio,
        test_scores: {
          ielts: formData.test_scores.ielts ? parseFloat(formData.test_scores.ielts) : '',
          toefl: formData.test_scores.toefl ? parseFloat(formData.test_scores.toefl) : '',
          gre: {
            verbal: formData.test_scores.gre.verbal ? parseFloat(formData.test_scores.gre.verbal) : '',
            quantitative: formData.test_scores.gre.quantitative ? parseFloat(formData.test_scores.gre.quantitative) : '',
            analytical: formData.test_scores.gre.analytical ? parseFloat(formData.test_scores.gre.analytical) : ''
          }
        },
        study_preferences: {
          countries: formData.study_preferences.countries,
          max_tuition: formData.study_preferences.max_tuition ? parseFloat(formData.study_preferences.max_tuition) : '',
          program_type: formData.study_preferences.program_type,
          start_date: formData.study_preferences.start_date
        }
      };

      // Send the profile data to the database
      const result = await updateUserProfile(user.id, profileData);
      
      console.log('Profile updated successfully:', result);
      
      // Show success message and exit edit mode
      setSaveSuccess(true);
      setIsEditing(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save profile. Please try again.';
      setSaveError(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // If we're exiting edit mode without saving, reset the form data
      if (profile) {
        const resetFormData = {
          full_name: profile.full_name || '',
          email: profile.email || (user?.email || ''),
          education_level: profile.education_level || '',
          current_university: profile.current_university || '',
          field_of_study: profile.field_of_study || '',
          gpa: profile.gpa?.toString() || '',
          phone_number: profile.phone_number || '',
          address_line1: profile.address_line1 || '',
          address_line2: profile.address_line2 || '',
          city: profile.city || '',
          state_province: profile.state_province || '',
          postal_code: profile.postal_code || '',
          country: profile.country || '',
          date_of_birth: profile.date_of_birth || '',
          bio: profile.bio || '',
          test_scores: {
            ielts: profile.test_scores?.ielts?.toString() || '',
            toefl: profile.test_scores?.toefl?.toString() || '',
            gre: {
              verbal: profile.test_scores?.gre?.verbal?.toString() || '',
              quantitative: profile.test_scores?.gre?.quantitative?.toString() || '',
              analytical: profile.test_scores?.gre?.analytical?.toString() || ''
            }
          },
          study_preferences: {
            countries: profile.study_preferences?.countries || [],
            max_tuition: profile.study_preferences?.max_tuition?.toString() || '',
            program_type: profile.study_preferences?.program_type || [],
            start_date: profile.study_preferences?.start_date || ''
          }
        };
        setFormData(resetFormData);
      }
    }
    setIsEditing(!isEditing);
  };

  const renderPersonalInfoSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Enter your full name"
            />
            <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={true}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Enter your email"
            />
            <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="+234 801 234 5678"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bio / Personal Statement
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          disabled={!isEditing}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
          placeholder="Tell us a bit about yourself..."
        />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">Contact Address</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 1
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Street address, P.O. box, etc."
            />
          </div>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 2
          </label>
          <input
            type="text"
            name="address_line2"
            value={formData.address_line2}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="Apartment, suite, unit, building, floor, etc."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State / Province
          </label>
          <input
            type="text"
            name="state_province"
            value={formData.state_province}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal / Zip Code
          </label>
          <input
            type="text"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
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

  const renderAcademicInfoSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current/Previous University
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BookOpen className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="current_university"
              value={formData.current_university}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field of Study
          </label>
          <input
            type="text"
            name="field_of_study"
            value={formData.field_of_study}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GPA
          </label>
          <input
            type="text"
            name="gpa"
            value={formData.gpa}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Education Level
          </label>
          <select
            name="education_level"
            value={formData.education_level}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Select education level</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="graduate">Graduate</option>
            <option value="professional">Professional</option>
          </select>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Test Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IELTS
            </label>
            <input
              type="text"
              name="test_scores.ielts"
              value={formData.test_scores.ielts}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Overall score"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TOEFL
            </label>
            <input
              type="text"
              name="test_scores.toefl"
              value={formData.test_scores.toefl}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Total score"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GRE Verbal
            </label>
            <input
              type="text"
              name="test_scores.gre.verbal"
              value={formData.test_scores.gre.verbal}
              onChange={handleGREInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Verbal score"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GRE Quantitative
            </label>
            <input
              type="text"
              name="test_scores.gre.quantitative"
              value={formData.test_scores.gre.quantitative}
              onChange={handleGREInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Quantitative score"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GRE Analytical
            </label>
            <input
              type="text"
              name="test_scores.gre.analytical"
              value={formData.test_scores.gre.analytical}
              onChange={handleGREInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Analytical score"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Countries
        </label>
        <Select
          isMulti
          isDisabled={!isEditing}
          options={countryOptions}
          value={countryOptions.filter(opt => formData.study_preferences.countries.includes(opt.value))}
          onChange={selected => {
            if (!isEditing) return;
            setFormData(prev => ({
              ...prev,
              study_preferences: {
                ...prev.study_preferences,
                countries: selected ? selected.map(opt => opt.value) : []
              }
            }));
          }}
          classNamePrefix="react-select"
          placeholder="Select preferred countries..."
        />
        <p className="text-xs text-gray-500 mt-1">You can search and select multiple countries</p>
        {!isEditing && (
          <p className="text-xs text-red-500 mt-2">Click "Edit Profile" to update your study preferences.</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Tuition Budget (USD/year)
          </label>
          <select
            name="study_preferences.max_tuition"
            value={formData.study_preferences.max_tuition}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
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
            Preferred Start Date
          </label>
          <select
            name="study_preferences.start_date"
            value={formData.study_preferences.start_date}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Select start date</option>
            <option value="Fall 2025">Fall 2025</option>
            <option value="Spring 2026">Spring 2026</option>
            <option value="Fall 2026">Fall 2026</option>
            <option value="Spring 2027">Spring 2027</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Program Types
        </label>
        <Select
          isMulti
          isDisabled={!isEditing}
          options={programTypeOptions}
          value={programTypeOptions.filter(opt => formData.study_preferences.program_type.includes(opt.value))}
          onChange={selected => {
            if (!isEditing) return;
            setFormData(prev => ({
              ...prev,
              study_preferences: {
                ...prev.study_preferences,
                program_type: selected ? selected.map(opt => opt.value) : []
              }
            }));
          }}
          classNamePrefix="react-select"
          placeholder="Select program types..."
        />
        <p className="text-xs text-gray-500 mt-1">You can search and select multiple program types</p>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                disabled={!isEditing}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="Enter current password"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Enter new password"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Confirm new password"
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Two-Factor Authentication</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enhance your account security</p>
              <p className="text-sm text-gray-600 mt-1">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
            </div>
            <button
              disabled={!isEditing}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Enable
            </button>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Account Deletion</h3>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-700">Delete your account</p>
              <p className="text-sm text-red-600 mt-1">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
            <button
              disabled={!isEditing}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Application Updates</p>
              <p className="text-sm text-gray-600">Receive emails about your application status changes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationPrefs.email.applicationUpdates}
                onChange={(e) => handleCheckboxChange('email', 'applicationUpdates', e.target.checked)}
                disabled={!isEditing}
              />
              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer ${isEditing ? 'peer-checked:bg-indigo-600' : 'peer-checked:bg-gray-400'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Deadlines</p>
              <p className="text-sm text-gray-600">Receive reminders about upcoming deadlines</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationPrefs.email.deadlines}
                onChange={(e) => handleCheckboxChange('email', 'deadlines', e.target.checked)}
                disabled={!isEditing}
              />
              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer ${isEditing ? 'peer-checked:bg-indigo-600' : 'peer-checked:bg-gray-400'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Document Reviews</p>
              <p className="text-sm text-gray-600">Receive notifications when your documents are reviewed</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationPrefs.email.documentReviews}
                onChange={(e) => handleCheckboxChange('email', 'documentReviews', e.target.checked)}
                disabled={!isEditing}
              />
              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer ${isEditing ? 'peer-checked:bg-indigo-600' : 'peer-checked:bg-gray-400'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Marketing</p>
              <p className="text-sm text-gray-600">Receive emails about new features and promotions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationPrefs.email.marketing}
                onChange={(e) => handleCheckboxChange('email', 'marketing', e.target.checked)}
                disabled={!isEditing}
              />
              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer ${isEditing ? 'peer-checked:bg-indigo-600' : 'peer-checked:bg-gray-400'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
            </label>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">In-App Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Application Updates</p>
              <p className="text-sm text-gray-600">Receive in-app notifications about your applications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationPrefs.inApp.applicationUpdates}
                onChange={(e) => handleCheckboxChange('inApp', 'applicationUpdates', e.target.checked)}
                disabled={!isEditing}
              />
              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer ${isEditing ? 'peer-checked:bg-indigo-600' : 'peer-checked:bg-gray-400'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">New Messages</p>
              <p className="text-sm text-gray-600">Receive notifications for new messages</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationPrefs.inApp.newMessages}
                onChange={(e) => handleCheckboxChange('inApp', 'newMessages', e.target.checked)}
                disabled={!isEditing}
              />
              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer ${isEditing ? 'peer-checked:bg-indigo-600' : 'peer-checked:bg-gray-400'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">System Announcements</p>
              <p className="text-sm text-gray-600">Receive important system announcements</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationPrefs.inApp.systemAnnouncements}
                onChange={(e) => handleCheckboxChange('inApp', 'systemAnnouncements', e.target.checked)}
                disabled={!isEditing}
              />
              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer ${isEditing ? 'peer-checked:bg-indigo-600' : 'peer-checked:bg-gray-400'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalInfoSection();
      case 'academic':
        return renderAcademicInfoSection();
      case 'preferences':
        return renderPreferencesSection();
      case 'security':
        return renderSecuritySection();
      case 'notifications':
        return renderNotificationsSection();
      default:
        return renderPersonalInfoSection();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4 p-6 bg-red-50 rounded-lg">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 font-heading">Profile Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>
      
      {/* Loading state */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 mb-8 flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading your profile data...</p>
        </div>
      ) : (
        <>
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold flex-shrink-0">
                {formData.full_name ? formData.full_name.split(' ').map(name => name[0]).join('') : '?'}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{formData.full_name || 'Not provided'}</h2>
                <p className="text-gray-600 mb-4">{formData.email || 'No email address'}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{formData.current_university || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate capitalize">{formData.education_level || 'Not provided'}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:bg-indigo-400"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleEditToggle}
                      disabled={isSaving}
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditToggle}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <User className="h-5 w-5" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
            
            {saveError && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{saveError}</span>
              </div>
            )}
            
            {saveSuccess && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span>Profile updated successfully!</span>
              </div>
            )}
          </div>
          
          {/* Settings Tabs and Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveSection('personal')}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeSection === 'personal' 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <User className="h-5 w-5 flex-shrink-0" />
                    <span>Personal Information</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveSection('academic')}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeSection === 'academic' 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <BookOpen className="h-5 w-5 flex-shrink-0" />
                    <span>Academic Information</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveSection('preferences')}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeSection === 'preferences' 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <MapPin className="h-5 w-5 flex-shrink-0" />
                    <span>Study Preferences</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveSection('security')}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeSection === 'security' 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Lock className="h-5 w-5 flex-shrink-0" />
                    <span>Security</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveSection('notifications')}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeSection === 'notifications' 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Bell className="h-5 w-5 flex-shrink-0" />
                    <span>Notifications</span>
                  </button>
                  
                  <hr className="my-2 border-gray-200" />
                  
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    onClick={async () => { await signOutFn(); window.location.href = '/login'; }}
                  >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </nav>
              </div>
              
              <div className="bg-indigo-600 rounded-xl shadow-sm p-4 mt-4 text-white">
                <h3 className="font-medium mb-2">Need Help?</h3>
                <p className="text-sm text-indigo-200 mb-3">
                  Our support team is here to assist you with any questions about your account settings.
                </p>
                <button className="w-full bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors text-sm">
                  Contact Support
                </button>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {isEditing && (
                  <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-center">
                    <User className="h-5 w-5 flex-shrink-0 mr-2" />
                    <div>
                      <p className="font-medium">Edit mode active</p>
                      <p className="text-sm text-blue-600">Make your changes, then click "Save Changes" when done.</p>
                    </div>
                  </div>
                )}
                
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {activeSection === 'personal' && 'Personal Information'}
                  {activeSection === 'academic' && 'Academic Information'}
                  {activeSection === 'preferences' && 'Study Preferences'}
                  {activeSection === 'security' && 'Security Settings'}
                  {activeSection === 'notifications' && 'Notification Preferences'}
                </h2>
                
                {renderActiveSection()}
                
                {isEditing && (
                  <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:bg-indigo-400"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileSettings;