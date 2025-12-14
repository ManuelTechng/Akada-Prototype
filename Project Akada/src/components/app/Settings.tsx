import React, { useState } from 'react';
import { 
  Lock, 
  Bell, 
  LogOut, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { signOut as signOutFn } from '../../lib/auth';

const Settings: React.FC = () => {
  const { user, profile } = useAuth();
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('security');

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

  // Handle checkbox changes for notification preferences
  const handleCheckboxChange = (section: 'email' | 'inApp', prefName: string, checked: boolean) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [prefName]: checked
      }
    }));
  };

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-3">Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="password"
                className="pl-10 w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-input text-foreground"
                placeholder="Enter current password"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-input text-foreground"
              placeholder="Enter new password"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-input text-foreground"
              placeholder="Confirm new password"
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-foreground mb-3">Two-Factor Authentication</h3>
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Enhance your account security</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
            </div>
            <button
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Enable
            </button>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-foreground mb-3">Account Deletion</h3>
        <div className="bg-destructive/10 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Delete your account</p>
              <p className="text-sm text-destructive mt-1">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
            <button
              className="bg-destructive text-white px-4 py-2 rounded-lg hover:bg-destructive/90 transition-colors"
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
        <h3 className="text-lg font-medium text-foreground mb-3">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Application Updates</p>
              <p className="text-sm text-muted-foreground">Receive emails about your application status changes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationPrefs.email.applicationUpdates}
                onChange={(e) => handleCheckboxChange('email', 'applicationUpdates', e.target.checked)}
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Deadlines</p>
              <p className="text-sm text-muted-foreground">Receive reminders about upcoming deadlines</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationPrefs.email.deadlines}
                onChange={(e) => handleCheckboxChange('email', 'deadlines', e.target.checked)}
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Document Reviews</p>
              <p className="text-sm text-muted-foreground">Receive notifications when your documents are reviewed</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationPrefs.email.documentReviews}
                onChange={(e) => handleCheckboxChange('email', 'documentReviews', e.target.checked)}
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Marketing</p>
              <p className="text-sm text-muted-foreground">Receive emails about new features and promotions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationPrefs.email.marketing}
                onChange={(e) => handleCheckboxChange('email', 'marketing', e.target.checked)}
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-foreground mb-3">In-App Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Application Updates</p>
              <p className="text-sm text-muted-foreground">Receive in-app notifications about your applications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationPrefs.inApp.applicationUpdates}
                onChange={(e) => handleCheckboxChange('inApp', 'applicationUpdates', e.target.checked)}
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">New Messages</p>
              <p className="text-sm text-muted-foreground">Receive notifications for new messages</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationPrefs.inApp.newMessages}
                onChange={(e) => handleCheckboxChange('inApp', 'newMessages', e.target.checked)}
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">System Announcements</p>
              <p className="text-sm text-muted-foreground">Receive important system announcements</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationPrefs.inApp.systemAnnouncements}
                onChange={(e) => handleCheckboxChange('inApp', 'systemAnnouncements', e.target.checked)}
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'security':
        return renderSecuritySection();
      case 'notifications':
        return renderNotificationsSection();
      default:
        return renderSecuritySection();
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      // Here you would save the notification preferences to the database
      // For now, we'll just simulate a save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4 p-6 bg-destructive/10 rounded-lg">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <p className="text-destructive">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-destructive text-white rounded hover:bg-destructive/90 transition-colors"
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
        <h1 className="text-2xl font-bold text-foreground mb-2 font-heading">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>
      
      {/* Settings Header */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold flex-shrink-0">
            {profile?.full_name ? profile.full_name.split(' ').map(name => name[0]).join('') : user?.email?.substring(0, 2).toUpperCase() || '?'}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold text-foreground mb-1">{profile?.full_name || user?.email || 'User'}</h2>
            <p className="text-muted-foreground mb-4">Account Settings</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:bg-primary/60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
        
        {saveError && (
          <div className="mt-4 bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{saveError}</span>
          </div>
        )}
        
        {saveSuccess && (
          <div className="mt-4 bg-chart-1/10 border border-chart-1 text-chart-1 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>Settings updated successfully!</span>
          </div>
        )}
      </div>
      
      {/* Settings Tabs and Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-card rounded-xl shadow-sm border border-border p-4">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveSection('security')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                  activeSection === 'security' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Lock className="h-5 w-5 flex-shrink-0" />
                <span>Security</span>
              </button>
              
              <button
                onClick={() => setActiveSection('notifications')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                  activeSection === 'notifications' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Bell className="h-5 w-5 flex-shrink-0" />
                <span>Notifications</span>
              </button>
              
              <hr className="my-2 border-border" />
              
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                onClick={async () => { await signOutFn(); window.location.href = '/login'; }}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-3">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              {activeSection === 'security' && 'Security Settings'}
              {activeSection === 'notifications' && 'Notification Preferences'}
            </h2>
            
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
