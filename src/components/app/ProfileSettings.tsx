import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  BookOpen, 
  Save, 
  LogOut, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Camera,
  Upload
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile, signOut as signOutFn } from '../../lib/auth';
import type { UserProfile } from '../../lib/types';
import { uploadProfilePicture } from '../../lib/storage';
import { inputStyles } from '../../utils/inputStyles';
import Select from 'react-select';
import UnifiedPreferenceService from '../../lib/preferences';

const ProfileSettings: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(profile?.profile_picture_url || null);
  const [uploadingImage, setUploadingImage] = useState(false);
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
      start_date: '',
      goals: '',
      language_preference: '',
      preferred_cities: [] as string[]
    }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);


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

  
  // For debugging - log what's coming from auth context
  useEffect(() => {
    console.log('ProfileSettings: User data from auth context:', { user, profile });
  }, [user, profile]);
  
  // Update profile image when profile changes
  useEffect(() => {
    if (profile?.profile_picture_url) {
      setProfileImage(profile.profile_picture_url);
    }
  }, [profile?.profile_picture_url]);

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
            start_date: profile.study_preferences?.start_date || '',
            goals: profile.study_preferences?.goals || '',
            language_preference: profile.study_preferences?.language_preference || '',
            preferred_cities: profile.study_preferences?.preferred_cities || []
          }
        });
        console.log('🔄 Profile loaded - Study Goals:', profile.study_preferences?.goals);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);

      // Create preview URL for immediate feedback
      const previewUrl = URL.createObjectURL(file);
      setProfileImage(previewUrl);

      // Upload to Supabase Storage
      const uploadResult = await uploadProfilePicture(file, user.id);
      
      if (!uploadResult.success) {
        setError(uploadResult.error || 'Failed to upload image');
        setProfileImage(profile?.profile_picture_url || null); // Revert to original
        return;
      }

      // Update profile with new image URL
      const updatedProfile = await updateUserProfile(user.id, {
        profile_picture_url: uploadResult.url
      });

      if (updatedProfile) {
        console.log('Profile picture uploaded successfully:', uploadResult.url);
        // Refresh profile to get updated data
        await refreshProfile();
      }
      
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
      setProfileImage(profile?.profile_picture_url || null); // Revert to original
    } finally {
      setUploadingImage(false);
    }
  };

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
          max_tuition: formData.study_preferences.max_tuition || '',
          program_type: formData.study_preferences.program_type,
          start_date: formData.study_preferences.start_date,
          goals: formData.study_preferences.goals || '',
          language_preference: formData.study_preferences.language_preference || '',
          preferred_cities: Array.isArray(formData.study_preferences.preferred_cities) 
            ? formData.study_preferences.preferred_cities 
            : (formData.study_preferences.preferred_cities as string || '').split(',').map(c => c.trim()).filter(Boolean)
        }
      };

      // Calculate profile completion percentage
      const completionPercentage = calculateProfileCompletion(profileData);
      const isComplete = completionPercentage >= 90;

      // Add profile_completed flag
      profileData.profile_completed = isComplete;

      // Send the profile data to the database
      console.log('Sending profile data to database:', { userId: user.id, profileData, completionPercentage });
      console.log('🎯 Study Goals being saved:', formData.study_preferences.goals);

      // Add timeout to prevent hanging
      const updatePromise = updateUserProfile(user.id, profileData);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile update timed out after 30 seconds')), 30000)
      );

      const result = await Promise.race([updatePromise, timeoutPromise]);

      console.log('Profile updated successfully:', result);

      // Sync preferences to structured table via UnifiedPreferenceService
      console.log('Syncing preferences to structured table...');
      const preferencesResult = await UnifiedPreferenceService.updatePreferences(user.id, {
        specializations: formData.study_preferences.program_type || [],
        studyLevel: formData.study_preferences.program_type?.[0],
        countries: formData.study_preferences.countries || [],
        preferredCities: formData.study_preferences.preferred_cities || [],
        budgetRange: formData.study_preferences.max_tuition ? parseFloat(formData.study_preferences.max_tuition) : undefined,
        scholarshipNeeded: false,
        preferredDuration: formData.study_preferences.start_date,
        languagePreference: formData.study_preferences.language_preference,
        goals: formData.study_preferences.goals,
        profileCompleted: isComplete
      });

      if (!preferencesResult.success) {
        console.warn('Preferences sync warning:', preferencesResult.error);
        // Don't fail the save, just warn
      } else {
        console.log('✅ Preferences synced successfully to both storage systems');
      }

      // Refresh the profile data
      await refreshProfile();

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

  // Helper function to calculate profile completion percentage
  const calculateProfileCompletion = (profileData: Partial<UserProfile>): number => {
    let score = 0;
    const weights = {
      basicInfo: 20, // name, email, education level
      contactInfo: 15, // phone, address, country
      academicInfo: 20, // university, field, GPA
      testScores: 15, // any test score
      studyPreferences: 30 // countries, budget, program type, goals
    };

    // Basic info (20%)
    if (profileData.full_name) score += weights.basicInfo / 3;
    if (profileData.email) score += weights.basicInfo / 3;
    if (profileData.education_level) score += weights.basicInfo / 3;

    // Contact info (15%)
    if (profileData.phone_number) score += weights.contactInfo / 3;
    if (profileData.city || profileData.address_line1) score += weights.contactInfo / 3;
    if (profileData.country) score += weights.contactInfo / 3;

    // Academic info (20%)
    if (profileData.current_university) score += weights.academicInfo / 3;
    if (profileData.field_of_study) score += weights.academicInfo / 3;
    if (profileData.gpa) score += weights.academicInfo / 3;

    // Test scores (15%)
    const hasTestScores = profileData.test_scores && (
      profileData.test_scores.ielts ||
      profileData.test_scores.toefl ||
      (profileData.test_scores.gre && (
        profileData.test_scores.gre.verbal ||
        profileData.test_scores.gre.quantitative
      ))
    );
    if (hasTestScores) score += weights.testScores;

    // Study preferences (30%)
    const prefs = profileData.study_preferences;
    if (prefs) {
      if (prefs.countries && prefs.countries.length > 0) score += weights.studyPreferences / 4;
      if (prefs.max_tuition) score += weights.studyPreferences / 4;
      if (prefs.program_type && prefs.program_type.length > 0) score += weights.studyPreferences / 4;
      if (prefs.goals) score += weights.studyPreferences / 4;
    }

    return Math.round(score);
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
            start_date: profile.study_preferences?.start_date || '',
            goals: profile.study_preferences?.goals || '',
            language_preference: profile.study_preferences?.language_preference || '',
            preferred_cities: profile.study_preferences?.preferred_cities || []
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={inputStyles.standard}
              placeholder="Enter your full name"
            />
            <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={true}
              className={inputStyles.standard}
              placeholder="Enter your email"
            />
            <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              className={inputStyles.withIcon}
              placeholder="+234 801 234 5678"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={inputStyles.standard}
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
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="Tell us a bit about yourself..."
        />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mt-8 mb-4">Contact Address</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              className={inputStyles.withIcon}
              placeholder="Street address, P.O. box, etc."
            />
          </div>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Address Line 2
          </label>
          <input
            type="text"
            name="address_line2"
            value={formData.address_line2}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={inputStyles.standard}
            placeholder="Apartment, suite, unit, building, floor, etc."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            City
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={inputStyles.standard}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            State / Province
          </label>
          <input
            type="text"
            name="state_province"
            value={formData.state_province}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={inputStyles.standard}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Postal / Zip Code
          </label>
          <input
            type="text"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={inputStyles.standard}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Country
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={inputStyles.standard}
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              className={inputStyles.withIcon}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Field of Study
          </label>
          <input
            type="text"
            name="field_of_study"
            value={formData.field_of_study}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={inputStyles.standard}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            GPA
          </label>
          <input
            type="text"
            name="gpa"
            value={formData.gpa}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={inputStyles.standard}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Education Level
          </label>
          <select
            name="education_level"
            value={formData.education_level}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={inputStyles.standard}
          >
            <option value="">Select education level</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="graduate">Graduate</option>
            <option value="professional">Professional</option>
          </select>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Test Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              IELTS
            </label>
            <input
              type="text"
              name="test_scores.ielts"
              value={formData.test_scores.ielts}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={inputStyles.standard}
              placeholder="Overall score"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              TOEFL
            </label>
            <input
              type="text"
              name="test_scores.toefl"
              value={formData.test_scores.toefl}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={inputStyles.standard}
              placeholder="Total score"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              GRE Verbal
            </label>
            <input
              type="text"
              name="test_scores.gre.verbal"
              value={formData.test_scores.gre.verbal}
              onChange={handleGREInputChange}
              disabled={!isEditing}
              className={inputStyles.standard}
              placeholder="Verbal score"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              GRE Quantitative
            </label>
            <input
              type="text"
              name="test_scores.gre.quantitative"
              value={formData.test_scores.gre.quantitative}
              onChange={handleGREInputChange}
              disabled={!isEditing}
              className={inputStyles.standard}
              placeholder="Quantitative score"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              GRE Analytical
            </label>
            <input
              type="text"
              name="test_scores.gre.analytical"
              value={formData.test_scores.gre.analytical}
              onChange={handleGREInputChange}
              disabled={!isEditing}
              className={inputStyles.standard}
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: 'var(--select-bg)',
              borderColor: 'var(--select-border)',
              color: 'var(--select-text)'
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: 'var(--select-bg)',
              color: 'var(--select-text)'
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused ? 'var(--select-hover)' : 'var(--select-bg)',
              color: 'var(--select-text)'
            }),
            multiValue: (base) => ({
              ...base,
              backgroundColor: 'var(--select-multi-bg)'
            }),
            multiValueLabel: (base) => ({
              ...base,
              color: 'var(--select-multi-text)'
            })
          }}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">You can search and select multiple countries</p>
        {!isEditing && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-2">Click "Edit Profile" to update your study preferences.</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Maximum Tuition Budget (₦ NGN/year)
          </label>
          <select
            name="study_preferences.max_tuition"
            value={formData.study_preferences.max_tuition}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={inputStyles.standard}
          >
            <option value="">Select budget range</option>
            <option value="5000000">Under ₦5,000,000 (~$3,300)</option>
            <option value="10000000">₦5M - ₦10M (~$3,300 - $6,700)</option>
            <option value="15000000">₦10M - ₦15M (~$6,700 - $10,000)</option>
            <option value="25000000">₦15M - ₦25M (~$10,000 - $16,700)</option>
            <option value="40000000">₦25M - ₦40M (~$16,700 - $26,700)</option>
            <option value="60000000">₦40M - ₦60M (~$26,700 - $40,000)</option>
            <option value="75000000">₦60M - ₦75M (~$40,000 - $50,000)</option>
            <option value="100000000">₦75M+ (~$50,000+)</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            All amounts are in Nigerian Naira. USD equivalents shown for reference using current rates.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Preferred Start Date
          </label>
          <select
            name="study_preferences.start_date"
            value={formData.study_preferences.start_date}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Select start date</option>
            <option value="Fall 2025">Fall 2025</option>
            <option value="Spring 2026">Spring 2026</option>
            <option value="Fall 2026">Fall 2026</option>
            <option value="Spring 2027">Spring 2027</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Study Goals
          </label>
          <textarea
            name="study_preferences.goals"
            value={formData.study_preferences.goals || ''}
            onChange={handleInputChange}
            disabled={!isEditing}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="What do you hope to achieve with your studies abroad? (e.g., Career advancement, research opportunities, cultural experience)"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Share your academic and career aspirations
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Language Preference
          </label>
          <select
            name="study_preferences.language_preference"
            value={formData.study_preferences.language_preference || ''}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Select language preference</option>
            <option value="English">English</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Spanish">Spanish</option>
            <option value="Chinese">Chinese (Mandarin)</option>
            <option value="Japanese">Japanese</option>
            <option value="Other">Other</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Preferred language of instruction
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Preferred Cities
        </label>
        <input
          type="text"
          name="study_preferences.preferred_cities"
          value={
            Array.isArray(formData.study_preferences.preferred_cities)
              ? formData.study_preferences.preferred_cities.join(', ')
              : formData.study_preferences.preferred_cities || ''
          }
          onChange={(e) => {
            if (!isEditing) return;
            // Store as string while typing, will convert to array on save
            setFormData(prev => ({
              ...prev,
              study_preferences: {
                ...prev.study_preferences,
                preferred_cities: e.target.value as any
              }
            }));
          }}
          onBlur={(e) => {
            // Convert to array when user leaves the field
            if (!isEditing) return;
            const cities = e.target.value.split(',').map(c => c.trim()).filter(Boolean);
            setFormData(prev => ({
              ...prev,
              study_preferences: {
                ...prev.study_preferences,
                preferred_cities: cities as any
              }
            }));
          }}
          disabled={!isEditing}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="e.g., London, Berlin, Toronto, Melbourne"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Specific cities you'd like to study in (comma-separated)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: 'var(--select-bg)',
              borderColor: 'var(--select-border)',
              color: 'var(--select-text)'
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: 'var(--select-bg)',
              color: 'var(--select-text)'
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused ? 'var(--select-hover)' : 'var(--select-bg)',
              color: 'var(--select-text)'
            }),
            multiValue: (base) => ({
              ...base,
              backgroundColor: 'var(--select-multi-bg)'
            }),
            multiValueLabel: (base) => ({
              ...base,
              color: 'var(--select-multi-text)'
            })
          }}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">You can search and select multiple program types</p>
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 font-heading">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold flex-shrink-0 overflow-hidden">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    formData.full_name ? formData.full_name.split(' ').map(name => name[0]).join('') : '?'
                  )}
                </div>
                {isEditing && (
                  <>
                    <label className="absolute inset-0 w-24 h-24 rounded-full bg-black bg-opacity-50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      {uploadingImage ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <Camera className="w-6 h-6 text-white" />
                      )}
                    </label>
                    {/* Always visible upload button when editing */}
                    <button
                      onClick={() => document.getElementById('profile-image-upload')?.click()}
                      className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{formData.full_name || 'Not provided'}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{formData.email || 'No email address'}</p>
                
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
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveSection('personal')}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeSection === 'personal'
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <User className="h-5 w-5 flex-shrink-0" />
                    <span>Personal Information</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveSection('academic')}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeSection === 'academic'
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <BookOpen className="h-5 w-5 flex-shrink-0" />
                    <span>Academic Information</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveSection('preferences')}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeSection === 'preferences'
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <MapPin className="h-5 w-5 flex-shrink-0" />
                    <span>Study Preferences</span>
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
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                {isEditing && (
                  <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-center">
                    <User className="h-5 w-5 flex-shrink-0 mr-2" />
                    <div>
                      <p className="font-medium">Edit mode active</p>
                      <p className="text-sm text-blue-600">Make your changes, then click "Save Changes" when done.</p>
                    </div>
                  </div>
                )}
                
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  {activeSection === 'personal' && 'Personal Information'}
                  {activeSection === 'academic' && 'Academic Information'}
                  {activeSection === 'preferences' && 'Study Preferences'}
                </h2>
                
                {renderActiveSection()}
                
                {isEditing && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    {/* Edit mode indicator */}
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Edit mode active - Your changes will be saved when you click "Save Changes"
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
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