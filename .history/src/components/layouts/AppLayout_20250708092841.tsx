import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { 
  Menu, X, Bell, Search, 
  LayoutDashboard, FileText, Bookmark, BookOpen, 
  Users, MessageSquare, Calculator, 
  Settings, LogOut, ChevronDown, Home
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationDropdown from '../NotificationDropdown';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ChatButton from '../ChatButton';
import DarkModeToggle from '../ui/DarkModeToggle';
import { useDesignTokens } from '../../hooks/useDesignTokens';

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const { theme } = useTheme();
  // const { colors, spacing, currency } = useDesignTokens();

  const toggleSidebar = () => setIsDrawerOpen(!isDrawerOpen);

  const menuSections = [
    {
      title: "OVERVIEW",
      items: [
        { 
          id: "dashboard", 
          label: "Dashboard", 
          icon: LayoutDashboard, 
          path: "/dashboard",
          count: null
        },
        { 
          id: "programs", 
          label: "Programs", 
          icon: Search, 
          path: "/dashboard/search",
          count: null
        },
        { 
          id: "saved", 
          label: "Saved", 
          icon: Bookmark, 
          path: "/dashboard/saved",
          count: 3
        },
        { 
          id: "recommended", 
          label: "Recommended", 
          icon: BookOpen, 
          path: "/dashboard/recommended",
          count: null
        },
        { 
          id: "applications", 
          label: "Applications", 
          icon: FileText, 
          path: "/dashboard/applications",
          count: null
        },
        { 
          id: "resources", 
          label: "Resources", 
          icon: BookOpen, 
          path: "/dashboard/resources",
          count: null
        },
        { 
          id: "community", 
          label: "Community", 
          icon: Users, 
          path: "/dashboard/community",
          count: null
        }
      ]
    },
    {
      title: "TOOLS",
      items: [
        { 
          id: "calculator", 
          label: "Cost Calculator", 
          icon: Calculator, 
          path: "/dashboard/calculator",
          count: null
        },
        { 
          id: "documents", 
          label: "AI Document Review", 
          icon: FileText, 
          path: "/dashboard/documents",
          count: null
        },
        { 
          id: "assistant", 
          label: "AI Assistant (Advisor)", 
          icon: MessageSquare, 
          path: "/dashboard/assistant",
          count: null
        }
      ]
    },
    {
      title: "ACCOUNT",
      items: [
        { 
          id: "settings", 
          label: "Settings", 
          icon: Settings, 
          path: "/dashboard/settings",
          count: null
        },
        { 
          id: "logout", 
          label: "Log out", 
          icon: LogOut, 
          path: null,
          count: null
        }
      ]
    }
  ];

  const handleNavigation = async (item: any) => {
    setIsDrawerOpen(false);
    
    if (item.id === 'logout') {
      // Handle logout - you can implement signOut here
      navigate('/login');
      return;
    }
    
    if (item.path) {
      navigate(item.path);
    }
  };

  const isActiveRoute = (path: string | null) => {
    if (!path) return false;
    if (path === "/dashboard" && location.pathname === "/dashboard") return true;
    if (path !== "/dashboard" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const getFirstName = () => {
    if (profile?.full_name) return profile.full_name.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getCurrentPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.includes('/search')) return 'Programs';
    if (path.includes('/applications')) return 'Applications';
    if (path.includes('/documents')) return 'Documents';
    if (path.includes('/calculator')) return 'Cost Calculator';
    if (path.includes('/resources')) return 'Resources';
    if (path.includes('/community')) return 'Community';
    if (path.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 sm:w-72 lg:w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:transform-none ${
        isDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg">
              A
            </div>
            <div>
              <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Akada</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Study Abroad Platform</p>
            </div>
          </div>
          <button 
            className="lg:hidden p-2 ml-auto rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            onClick={toggleSidebar}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Theme Toggle */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <DarkModeToggle />
        </div>

        {/* Navigation Menu */}
        <div className="py-4 pb-2">
          {menuSections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="mb-6">
              <div className="px-6 mb-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {section.title}
                </p>
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.path);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item)}
                      className={`flex items-center justify-between w-full px-6 py-2.5 text-left transition-colors ${
                        isActive
                          ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-r-2 border-indigo-600'
                          : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'}`} />
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      {item.count && (
                        <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-medium px-2 py-1 rounded-full">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
            <div className="h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-medium text-xs">
              {getUserInitials()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-medium text-gray-900 dark:text-gray-100 text-xs truncate">
                {profile?.full_name || user?.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="h-20 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <button 
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{getCurrentPageTitle()}</h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                {getCurrentPageTitle() === 'Dashboard' ? formatDate() : `Welcome back, ${getFirstName()}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Bar */}
            <div className="hidden lg:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 w-48 xl:w-64">
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
              <input 
                type="text" 
                placeholder="Search programs..."
                className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 outline-none flex-1"
              />
            </div>

            {/* Mobile Search Button */}
            <button className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {isNotificationsOpen && (
                <NotificationDropdown 
                  isOpen={isNotificationsOpen}
                  onClose={() => setIsNotificationsOpen(false)} 
                />
              )}
            </div>

            {/* User Avatar */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-medium text-xs">
                {getUserInitials()}
              </div>
              <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                {getFirstName()}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500 hidden sm:block" />
            </div>

            {/* Home Button */}
            <button
              onClick={() => navigate('/')}
              className="hidden sm:flex p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Go to Home"
            >
              <Home className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Main Content Area - Single scrollable container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 sm:p-4 pb-4 min-h-full">
            <Outlet />
            {children}
          </div>

          {/* Footer */}
          <footer className="mt-8 py-4 px-4 sm:px-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} Akada - All Rights Reserved</p>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-full border border-green-200 dark:border-green-800">
                  Connected to Supabase
                </span>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Chat Button */}
      <ChatButton />
    </div>
  );
};

// Helper function to format date
const formatDate = () => {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default AppLayout;
