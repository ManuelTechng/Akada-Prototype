import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { 
  Menu, X, Bell, Calendar, User, Search, 
  LayoutDashboard, FileText, Folder, BookOpen, 
  Users, MessageSquare, Calculator, Clock, 
  Award, Settings, LogOut, HelpCircle, Home
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationDropdown from '../NotificationDropdown';

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsDrawerOpen(!isDrawerOpen);

  const menuItems = [
    {
      title: "Main Navigation",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "search", label: "Program Search", icon: Search },
        { id: "applications", label: "Applications", icon: FileText },
        { id: "documents", label: "Documents", icon: Folder },
        { id: "resources", label: "Resources", icon: BookOpen },
        { id: "community", label: "Community", icon: Users }
      ]
    },
    {
      title: "Tools",
      items: [
        { id: "chat", label: "AI Assistant", icon: MessageSquare },
        { id: "calculator", label: "Cost Calculator", icon: Calculator },
        { id: "timeline", label: "Timeline Builder", icon: Clock }
      ]
    },
    {
      title: "Account",
      items: [
        { id: "profile", label: "Profile Settings", icon: User },
        { id: "subscription", label: "Subscription", icon: Award },
        { id: "help", label: "Help & Support", icon: HelpCircle },
        { id: "signout", label: "Sign Out", icon: LogOut }
      ]
    }
  ];

  const handleNavigation = (id: string) => {
    setIsDrawerOpen(false);
    switch (id) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'search':
        navigate('/dashboard/search');
        break;
      case 'applications':
        navigate('/dashboard/applications');
        break;
      case 'documents':
        navigate('/dashboard/documents');
        break;
      case 'resources':
        navigate('/dashboard/resources');
        break;
      case 'community':
        navigate('/dashboard/community');
        break;
      case 'profile':
        navigate('/dashboard/profile');
        break;
      case 'signout':
        // Handle sign out
        break;
      default:
        navigate(`/dashboard/${id}`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white shadow-md transform transition-transform duration-300 ease-in-out lg:transform-none ${
        isDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-xl">
              A
            </div>
            <span className="font-heading font-bold text-xl text-gray-900">Akada</span>
          </div>
          <button 
            className="lg:hidden p-2 ml-auto rounded-md hover:bg-gray-100 text-gray-500"
            onClick={toggleSidebar}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="p-6 space-y-8 overflow-y-auto h-[calc(100%-5rem-5rem)]">
          {menuItems.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2 font-heading">
                {section.title}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className="flex items-center gap-3 w-full p-3 rounded-xl text-left text-gray-700 font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-white shadow-sm">
                      <Icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 w-full p-6 bg-white">
          <div className="pt-4 border-t border-gray-100 w-full">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-600 font-medium">
                OA
              </div>
              <div className="overflow-hidden">
                <div className="font-medium text-gray-900 truncate">Oluwaseun Adeyemi</div>
                <div className="text-sm text-indigo-600 font-medium">Premium Plan</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white shadow-sm px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 text-gray-500"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div>
              <h1 className="text-xl font-semibold text-gray-900 font-heading">Dashboard</h1>
              <p className="text-sm text-gray-500 hidden sm:block">Welcome back, Oluwaseun</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-indigo-50"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full -mt-1 -mr-1">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <NotificationDropdown 
                  isOpen={isNotificationsOpen}
                  onClose={() => setIsNotificationsOpen(false)} 
                />
              )}
            </div>
            
            <button className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-indigo-50">
              <Calendar className="h-6 w-6" />
            </button>
            
            <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>
            
            <button 
              className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-xl"
              onClick={() => navigate('/dashboard/profile')}
            >
              <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                OA
              </div>
              <span className="font-medium text-gray-700 hidden md:inline">Oluwaseun A.</span>
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-28">
          <div className="p-6">
            {/* Use the Outlet component to render child routes */}
            <Outlet />
            {/* Support for passing children directly (for backwards compatibility) */}
            {children}
          </div>
        </main>
      </div>

      {/* Floating Chat Button */}
      <button className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-40">
        <MessageSquare className="h-6 w-6" />
      </button>
    </div>
  );
};

// Custom ChevronDown Icon
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default AppLayout;