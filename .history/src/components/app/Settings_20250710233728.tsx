import React from 'react';
import ProfileSettings from './ProfileSettings';

interface SettingsSection {
  id: string
  title: string
  icon: React.ReactNode
  component: React.ReactNode
}

const Settings: React.FC = () => {
  const { user, profile, updateProfile, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  
  const [activeSection, setActiveSection] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Form states
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    country: profile?.country || 'Nigeria',
    city: profile?.city || '',
    timezone: profile?.timezone || 'Africa/Lagos'
  })

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    application_updates: true,
    program_recommendations: true,
    deadline_reminders: true,
    scholarship_alerts: true,
    marketing_emails: false
  })

  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: 'private',
    show_application_status: false,
    allow_program_suggestions: true,
    share_analytics: true
  })

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        email: user?.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        country: profile.country || 'Nigeria',
        city: profile.city || '',
        timezone: profile.timezone || 'Africa/Lagos'
      })
    }
  }, [profile, user])

  const handleSaveProfile = async () => {
    setSaveStatus('saving')
    setLoading(true)
    
    try {
      await updateProfile(profileData)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Failed to update profile:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = () => {
    const data = {
      profile: profileData,
      settings: {
        notifications: notificationSettings,
        privacy: privacySettings,
        theme: theme
      },
      exported_at: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `akada-data-${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const ProfileSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={profileData.full_name}
              onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Contact support to change your email address
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Country
            </label>
            <select
              value={profileData.country}
              onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="Nigeria">Nigeria</option>
              <option value="Ghana">Ghana</option>
              <option value="Kenya">Kenya</option>
              <option value="South Africa">South Africa</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              City
            </label>
            <input
              type="text"
              value={profileData.city}
              onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Timezone
            </label>
            <select
              value={profileData.timezone}
              onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="Africa/Lagos">West Africa Time (Lagos)</option>
              <option value="Africa/Cairo">Central Africa Time (Cairo)</option>
              <option value="Africa/Johannesburg">South Africa Time (Johannesburg)</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bio
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Tell us a bit about yourself and your study abroad goals..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={handleSaveProfile}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : saveStatus === 'saved' ? (
            <Check className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {loading ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
        </button>
        
        {saveStatus === 'error' && (
          <p className="text-red-600 dark:text-red-400 text-sm">
            Failed to save changes. Please try again.
          </p>
        )}
      </div>
    </div>
  )

  const NotificationsSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {Object.entries({
            email_notifications: 'Email Notifications',
            push_notifications: 'Push Notifications',
            application_updates: 'Application Status Updates',
            program_recommendations: 'Program Recommendations',
            deadline_reminders: 'Application Deadline Reminders',
            scholarship_alerts: 'Scholarship Opportunity Alerts',
            marketing_emails: 'Marketing Emails & Newsletter'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {key === 'marketing_emails' 
                    ? 'Receive updates about new features and offers'
                    : `Get notified about ${label.toLowerCase()}`
                  }
                </p>
              </div>
              <button
                onClick={() => setNotificationSettings(prev => ({
                  ...prev,
                  [key]: !prev[key as keyof typeof prev]
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings[key as keyof typeof notificationSettings]
                    ? 'bg-indigo-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings[key as keyof typeof notificationSettings]
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const AppearanceSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
        <div className="space-y-4">
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-3">Theme</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'system', label: 'System', icon: Monitor }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value as any)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    theme === value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <Icon className={`h-5 w-5 mx-auto mb-2 ${
                    theme === value ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium ${
                    theme === value ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const PrivacySection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacy & Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Profile Visibility</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Control who can see your profile information
              </p>
            </div>
            <select
              value={privacySettings.profile_visibility}
              onChange={(e) => setPrivacySettings(prev => ({
                ...prev,
                profile_visibility: e.target.value
              }))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="private">Private</option>
              <option value="friends">Friends Only</option>
              <option value="public">Public</option>
            </select>
          </div>
          
          {Object.entries({
            show_application_status: 'Show Application Status',
            allow_program_suggestions: 'Allow Program Suggestions',
            share_analytics: 'Share Anonymous Analytics'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {key === 'share_analytics' 
                    ? 'Help us improve by sharing anonymous usage data'
                    : `Allow ${label.toLowerCase()} to be visible`
                  }
                </p>
              </div>
              <button
                onClick={() => setPrivacySettings(prev => ({
                  ...prev,
                  [key]: !prev[key as keyof typeof prev]
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacySettings[key as keyof typeof privacySettings]
                    ? 'bg-indigo-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacySettings[key as keyof typeof privacySettings]
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Account Actions</h4>
        <div className="space-y-3">
          <button
            onClick={handleExportData}
            className="w-full text-left p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Export My Data</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Download all your data in JSON format</p>
              </div>
            </div>
          </button>
          
          <button className="w-full text-left p-3 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">Delete Account</p>
                <p className="text-sm text-amber-600 dark:text-amber-400">Permanently delete your account and all data</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )

  const sections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Profile',
      icon: <User className="h-5 w-5" />,
      component: <ProfileSection />
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
      component: <NotificationsSection />
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: <Monitor className="h-5 w-5" />,
      component: <AppearanceSection />
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: <Shield className="h-5 w-5" />,
      component: <PrivacySection />
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-600">
              <h2 className="font-semibold text-gray-900 dark:text-white">Settings</h2>
            </div>
            <nav className="p-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                    activeSection === section.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {section.icon}
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {sections.find(s => s.id === activeSection)?.component}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings 