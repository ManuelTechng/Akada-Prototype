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
  Loader2,
  HelpCircle,
  Shield,
  Eye,
  EyeOff,
  Home,
  ChevronRight,
  Camera,
  X,
  Upload,
  Facebook,
  Linkedin,
  Github
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../lib/auth';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

interface PrivacySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const Profile: React.FC = () => {
  const { user, profile } = useAuth();
  
  // Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
    fullName: 'Oluwaseun Adeyemi',
    email: 'oluwaseun.a@example.com',
    phoneNumber: '+234 801 234 5678',
    location: 'Lagos, Nigeria',
    bio: 'Computer Science student passionate about AI and machine learning. Looking to pursue graduate studies abroad.',
    currentUniversity: 'University of Lagos',
    fieldOfStudy: 'Computer Science',
    gpa: '4.2',
  });
  
  // Account Settings State
  const [accountSettings, setAccountSettings] = useState({
    username: 'oluwaseun_a',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    language: 'english',
    timezone: 'Africa/Lagos',
  });
  
  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: 'application_updates',
      title: 'Application Updates',
      description: 'Get notified about your application status changes',
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: 'deadlines',
      title: 'Deadline Reminders',
      description: 'Receive reminders about upcoming application deadlines',
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: 'document_reviews',
      title: 'Document Reviews',
      description: 'Get notified when your documents are reviewed',
      email: true,
      push: false,
      inApp: true,
    },
    {
      id: 'new_programs',
      title: 'New Program Matches',
      description: 'Be alerted when new programs match your preferences',
      email: false,
      push: true,
      inApp: true,
    },
    {
      id: 'community',
      title: 'Community Activity',
      description: 'Updates about community posts and messages',
      email: false,
      push: false,
      inApp: true,
    },
  ]);
  
  // Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState<PrivacySetting[]>([
    {
      id: 'profile_visibility',
      title: 'Profile Visibility',
      description: 'Make your profile visible to other users in the community',
      enabled: true,
    },
    {
      id: 'show_applications',
      title: 'Application Visibility',
      description: 'Share your application progress with the community',
      enabled: false,
    },
    {
      id: 'data_analytics',
      title: 'Data Analytics',
      description: 'Allow us to analyze your data for platform improvements',
      enabled: true,
    },
    {
      id: 'personalized_recommendations',
      title: 'Personalized Recommendations',
      description: 'Enable AI-powered program recommendations based on your profile',
      enabled: true,
    },
  ]);
  
  // Connected Accounts State
  const [connectedAccounts, setConnectedAccounts] = useState([
    { id: 'google', name: 'Google', connected: true, email: 'oluwaseun.a@gmail.com' },
    { id: 'facebook', name: 'Facebook', connected: false, email: null },
    { id: 'linkedin', name: 'LinkedIn', connected: true, email: 'oluwaseunadeyemi@linkedin.com' },
    { id: 'github', name: 'GitHub', connected: false, email: null },
  ]);
  
  const [activeSection, setActiveSection] = useState('personal');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  
  // Handle Personal Info Form Submit
  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real implementation, this would update the profile in the database
      // await updateUserProfile(user.id, personalInfo);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Personal information updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage('Failed to update personal information');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };
  
  // Handle Account Settings Form Submit
  const handleAccountSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (accountSettings.newPassword !== accountSettings.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // In a real implementation, this would update the account settings
      // await updateAccountSettings(user.id, accountSettings);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Account settings updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update account settings');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };
  
  // Handle notification setting toggle
  const handleNotificationToggle = (settingId: string, type: 'email' | 'push' | 'inApp') => {
    setNotificationSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === settingId
          ? { ...setting, [type]: !setting[type] }
          : setting
      )
    );
  };
  
  // Handle privacy setting toggle
  const handlePrivacyToggle = (settingId: string) => {
    setPrivacySettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === settingId
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  };
  
  // Handle connecting/disconnecting an account
  const handleAccountConnection = (accountId: string) => {
    setConnectedAccounts(prevAccounts =>
      prevAccounts.map(account =>
        account.id === accountId
          ? { ...account, connected: !account.connected }
          : account
      )
    );
  };
  
  // Render section tabs
  const renderSectionTabs = () => (
    <div className="flex overflow-x-auto mb-6 border-b border-gray-200">
      <button
        onClick={() => setActiveSection('personal')}
        className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
          activeSection === 'personal'
            ? 'text-indigo-600 border-b-2 border-indigo-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Personal Information
      </button>
      <button
        onClick={() => setActiveSection('account')}
        className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
          activeSection === 'account'
            ? 'text-indigo-600 border-b-2 border-indigo-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Account Settings
      </button>
      <button
        onClick={() => setActiveSection('notifications')}
        className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
          activeSection === 'notifications'
            ? 'text-indigo-600 border-b-2 border-indigo-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Notification Preferences
      </button>
      <button
        onClick={() => setActiveSection('privacy')}
        className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
          activeSection === 'privacy'
            ? 'text-indigo-600 border-b-2 border-indigo-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Privacy Settings
      </button>
      <button
        onClick={() => setActiveSection('connected')}
        className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
          activeSection === 'connected'
            ? 'text-indigo-600 border-b-2 border-indigo-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Connected Accounts
      </button>
    </div>
  );
  
  // Render success and error messages
  const renderMessages = () => (
    <>
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </>
  );
  
  // Render breadcrumb navigation
  const renderBreadcrumbs = () => (
    <div className="flex items-center mb-6 text-sm">
      <a href="/dashboard" className="text-gray-500 hover:text-indigo-600 transition-colors">
        <Home className="h-4 w-4 inline-block mr-1" />
        <span>Dashboard</span>
      </a>
      <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
      <span className="text-gray-900 font-medium">Profile Settings</span>
    </div>
  );
  
  // Render profile picture modal
  const renderProfilePictureModal = () => (
    showProfilePictureModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Update Profile Picture</h3>
            <button
              onClick={() => setShowProfilePictureModal(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="bg-gray-100 rounded-xl p-8 text-center">
              <div className="w-32 h-32 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-4 relative">
                <span className="text-3xl font-medium text-indigo-600">OA</span>
                <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full">
                  <Camera className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-2">
                Upload a new photo or take a picture.
              </p>
              <p className="text-gray-500 text-sm mb-4">
                JPG, GIF or PNG. Max size of 5MB.
              </p>
              <div className="flex justify-center">
                <label className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors cursor-pointer">
                  <Upload className="h-5 w-5" />
                  <span>Upload Image</span>
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowProfilePictureModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowProfilePictureModal(false);
                setSuccessMessage('Profile picture updated successfully');
                setTimeout(() => setSuccessMessage(null), 3000);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )
  );
  
  // Render tooltip component
  const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => (
    <div className="group relative inline-block">
      {children}
      <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity absolute z-10 w-48 bg-gray-800 text-white text-xs rounded-md p-2 -mt-1 ml-2">
        {text}
        <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 -ml-1 mt-1"></div>
      </div>
    </div>
  );
  
  // Render Personal Information Section
  const renderPersonalInformation = () => (
    <div className={`${activeSection === 'personal' ? 'block' : 'hidden'}`}>
      <form onSubmit={handlePersonalInfoSubmit}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-6">
            <div
              className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl font-bold relative flex-shrink-0"
              onClick={() => setShowProfilePictureModal(true)}
            >
              OA
              <button
                type="button"
                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors"
                aria-label="Change profile picture"
              >
                <Camera className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Profile Photo</h3>
              <p className="text-gray-600 text-sm mb-3">
                Click on the avatar to upload a custom profile photo
              </p>
              <button
                type="button"
                onClick={() => setShowProfilePictureModal(true)}
                className="text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors"
              >
                Upload New Photo
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={personalInfo.fullName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={personalInfo.phoneNumber}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phoneNumber: e.target.value })}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="location"
                  type="text"
                  value={personalInfo.location}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              value={personalInfo.bio}
              onChange={(e) => setPersonalInfo({ ...personalInfo, bio: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
              placeholder="Tell us about yourself..."
            />
          </div>
          
          <hr className="my-6 border-gray-200" />
          
          <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="currentUniversity" className="block text-sm font-medium text-gray-700 mb-1">
                Current/Previous University
              </label>
              <input
                id="currentUniversity"
                type="text"
                value={personalInfo.currentUniversity}
                onChange={(e) => setPersonalInfo({ ...personalInfo, currentUniversity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="fieldOfStudy" className="block text-sm font-medium text-gray-700 mb-1">
                Field of Study
              </label>
              <input
                id="fieldOfStudy"
                type="text"
                value={personalInfo.fieldOfStudy}
                onChange={(e) => setPersonalInfo({ ...personalInfo, fieldOfStudy: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="gpa" className="block text-sm font-medium text-gray-700 mb-1">
                GPA
              </label>
              <input
                id="gpa"
                type="text"
                value={personalInfo.gpa}
                onChange={(e) => setPersonalInfo({ ...personalInfo, gpa: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Save className="h-5 w-5" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
  
  // Render Account Settings Section
  const renderAccountSettings = () => (
    <div className={`${activeSection === 'account' ? 'block' : 'hidden'}`}>
      <form onSubmit={handleAccountSettingsSubmit}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sign-In Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={accountSettings.username}
                onChange={(e) => setAccountSettings({ ...accountSettings, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={accountSettings.currentPassword}
                  onChange={(e) => setAccountSettings({ ...accountSettings, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={accountSettings.newPassword}
                onChange={(e) => setAccountSettings({ ...accountSettings, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={accountSettings.confirmPassword}
                onChange={(e) => setAccountSettings({ ...accountSettings, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <hr className="my-6 border-gray-200" />
          
          <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                id="language"
                value={accountSettings.language}
                onChange={(e) => setAccountSettings({ ...accountSettings, language: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="english">English</option>
                <option value="french">French</option>
                <option value="spanish">Spanish</option>
                <option value="portuguese">Portuguese</option>
                <option value="yoruba">Yoruba</option>
                <option value="hausa">Hausa</option>
                <option value="igbo">Igbo</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                id="timezone"
                value={accountSettings.timezone}
                onChange={(e) => setAccountSettings({ ...accountSettings, timezone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
                <option value="Europe/London">Europe/London (GMT+0)</option>
                <option value="America/New_York">America/New York (GMT-5)</option>
                <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Save className="h-5 w-5" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
  
  // Render Notification Preferences Section
  const renderNotificationPreferences = () => (
    <div className={`${activeSection === 'notifications' ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
          <Tooltip text="Control how and when you receive notifications from Akada">
            <HelpCircle className="h-5 w-5 text-gray-400" />
          </Tooltip>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-4 text-sm font-medium">
          <div className="col-span-2">Type</div>
          <div className="text-center">Email</div>
          <div className="text-center">Push</div>
          <div className="text-center hidden">In-App</div>
        </div>
        
        <hr className="mb-4 border-gray-200" />
        
        {notificationSettings.map((setting) => (
          <div key={setting.id} className="mb-6 last:mb-0">
            <div className="grid grid-cols-4 gap-4 items-center">
              <div className="col-span-2">
                <h4 className="font-medium text-gray-900">{setting.title}</h4>
                <p className="text-sm text-gray-500">{setting.description}</p>
              </div>
              
              <div className="flex justify-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={setting.email}
                    onChange={() => handleNotificationToggle(setting.id, 'email')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              
              <div className="flex justify-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={setting.push}
                    onChange={() => handleNotificationToggle(setting.id, 'push')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setSuccessMessage('Notification preferences saved successfully');
            setTimeout(() => setSuccessMessage(null), 3000);
          }}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Save className="h-5 w-5" />
          Save Preferences
        </button>
      </div>
    </div>
  );
  
  // Render Privacy Settings Section
  const renderPrivacySettings = () => (
    <div className={`${activeSection === 'privacy' ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Privacy Settings</h3>
          <Tooltip text="Control who can see your information and how your data is used">
            <HelpCircle className="h-5 w-5 text-gray-400" />
          </Tooltip>
        </div>
        
        {privacySettings.map((setting) => (
          <div key={setting.id} className="mb-6 last:mb-0 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{setting.title}</h4>
                <p className="text-sm text-gray-500">{setting.description}</p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={setting.enabled}
                  onChange={() => handlePrivacyToggle(setting.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
          <h4 className="text-indigo-700 font-medium mb-2 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Protection
          </h4>
          <p className="text-indigo-600 text-sm">
            Your data is protected under our privacy policy and complies with GDPR, CCPA, and NDPR regulations.
          </p>
          <a href="#" className="text-indigo-700 text-sm font-medium mt-2 inline-block hover:text-indigo-800">
            View Privacy Policy
          </a>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setSuccessMessage('Privacy settings saved successfully');
            setTimeout(() => setSuccessMessage(null), 3000);
          }}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Save className="h-5 w-5" />
          Save Settings
        </button>
      </div>
    </div>
  );
  
  // Render Connected Accounts Section
  const renderConnectedAccounts = () => (
    <div className={`${activeSection === 'connected' ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Connected Accounts</h3>
          <Tooltip text="Connect your social accounts for easier login and sharing">
            <HelpCircle className="h-5 w-5 text-gray-400" />
          </Tooltip>
        </div>
        
        <div className="space-y-6">
          {connectedAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  account.connected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {account.id === 'google' && <Google className="h-6 w-6" />}
                  {account.id === 'facebook' && <Facebook className="h-6 w-6" />}
                  {account.id === 'linkedin' && <Linkedin className="h-6 w-6" />}
                  {account.id === 'github' && <Github className="h-6 w-6" />}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{account.name}</h4>
                  {account.connected ? (
                    <p className="text-sm text-gray-500">{account.email}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Not connected</p>
                  )}
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => handleAccountConnection(account.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  account.connected
                    ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {account.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Connecting accounts allows for easier sign-in and can help personalize your experience on Akada.
            We never post to your accounts without your permission.
          </p>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="max-w-4xl mx-auto">
      {renderBreadcrumbs()}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">Profile Settings</h1>
          <p className="text-gray-600">Manage your personal information and account preferences</p>
        </div>
      </div>
      
      {renderMessages()}
      {renderSectionTabs()}
      
      {renderPersonalInformation()}
      {renderAccountSettings()}
      {renderNotificationPreferences()}
      {renderPrivacySettings()}
      {renderConnectedAccounts()}
      
      {renderProfilePictureModal()}
    </div>
  );
};

// Google icon component
const Google = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

export default Profile;