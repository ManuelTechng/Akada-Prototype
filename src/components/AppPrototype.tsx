import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { 
  Search, Home, User, BookOpen, MessageSquare, FileText, Bell, Settings, Menu, X,
  LayoutDashboard, Folder, Users, Calendar, BarChart, LogOut, Calculator,
  Clock, HelpCircle, BookmarkIcon, BellRing, Headphones, ArrowLeft
} from 'lucide-react';
import ProgramSearch from './app/ProgramSearch';
import Dashboard from './app/Dashboard';
import Profile from './app/Profile';
import Resources from './app/Resources';
import ChatAssistant from './app/ChatAssistant';
import ApplicationTracker from './app/ApplicationTracker';
import Documents from './app/Documents';
import Community from './app/Community';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

const AppPrototype: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const menuItems = [
    {
      title: "Main Navigation",
      items: [
        { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
        { id: "search", label: "Program Search", icon: <Search className="h-5 w-5" /> },
        { id: "applications", label: "Applications", icon: <FileText className="h-5 w-5" /> },
        { id: "documents", label: "Documents", icon: <Folder className="h-5 w-5" /> },
        { id: "resources", label: "Resources", icon: <BookOpen className="h-5 w-5" /> },
        { id: "community", label: "Community", icon: <Users className="h-5 w-5" /> },
        { id: "counseling", label: "Counseling", icon: <Headphones className="h-5 w-5" /> }
      ]
    },
    {
      title: "Tools",
      items: [
        { id: "chat", label: "AI Assistant", icon: <MessageSquare className="h-5 w-5" /> },
        { id: "calculator", label: "Cost Calculator", icon: <Calculator className="h-5 w-5" /> },
        { id: "timeline", label: "Timeline Builder", icon: <Clock className="h-5 w-5" /> }
      ]
    },
    {
      title: "Account",
      items: [
        { id: "profile", label: "Profile Settings", icon: <User className="h-5 w-5" /> },
        { id: "subscription", label: "Subscription", icon: <BarChart className="h-5 w-5" /> },
        { id: "notifications", label: "Notifications", icon: <BellRing className="h-5 w-5" /> },
        { id: "saved", label: "Saved Programs", icon: <BookmarkIcon className="h-5 w-5" /> },
        { id: "help", label: "Help & Support", icon: <HelpCircle className="h-5 w-5" /> }
      ]
    }
  ];

  const handleReturnToDashboard = () => {
    setActiveTab("dashboard");
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Left Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-200 ease-in-out lg:transform-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo Area */}
        <div className="h-16 border-b border-gray-200 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
            <span className="font-bold text-xl text-gray-900 font-heading">Akada</span>
          </div>
          <button 
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={toggleSidebar}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 px-3 py-6 space-y-8 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="h-full">
            <TabsList className="flex flex-col space-y-6 bg-transparent w-full">
              {menuItems.map((section, index) => (
                <div key={index} className="space-y-1">
                  <div className="px-3 mb-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-heading">
                      {section.title}
                    </h3>
                  </div>
                  {section.items.map((item) => (
                    <TabsTrigger 
                      key={item.id}
                      value={item.id} 
                      className="w-full flex items-center gap-3 px-3 py-2 text-left data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 rounded-lg justify-start"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </TabsTrigger>
                  ))}
                </div>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* User Area - Removed border-t */}
        <div className="p-4">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
              OA
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Oluwaseun A.</div>
              <div className="text-sm text-gray-500">Premium Plan</div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </button>
            {activeTab !== "dashboard" && (
              <button
                onClick={handleReturnToDashboard}
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
                aria-label="Return to dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Dashboard</span>
              </button>
            )}
            <h1 className="text-xl font-semibold text-gray-900 font-heading">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell className="h-5 w-5" />
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
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <Calendar className="h-5 w-5" />
            </button>
            <div className="h-8 border-l border-gray-200 hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm text-gray-600">Connected to Supabase</span>
            </div>
          </div>
        </header>

        {/* Content Area - added padding to bottom to prevent overlap */}
        <div className="flex-1 overflow-y-auto pb-28">
          <Tabs value={activeTab} className="h-full">
            <TabsContent value="dashboard" className="h-full m-0">
              <Dashboard />
            </TabsContent>
            <TabsContent value="search" className="h-full m-0">
              <ProgramSearch />
            </TabsContent>
            <TabsContent value="applications" className="h-full m-0">
              <ApplicationTracker />
            </TabsContent>
            <TabsContent value="documents" className="h-full m-0">
              <Documents />
            </TabsContent>
            <TabsContent value="resources" className="h-full m-0">
              <Resources />
            </TabsContent>
            <TabsContent value="community" className="h-full m-0">
              <Community />
            </TabsContent>
            <TabsContent value="chat" className="h-full m-0">
              <ChatAssistant />
            </TabsContent>
            <TabsContent value="profile" className="h-full m-0">
              <Profile />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer - no top border */}
        <footer className="py-4 px-6 bg-white z-10 shadow-sm">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} Akada - All Rights Reserved</p>
            <div className="flex items-center gap-3">
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                Connected to Supabase
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Chat Button - positioned above footer */}
      <button className="fixed bottom-20 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 z-40">
        <MessageSquare className="h-6 w-6" />
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
      </button>
    </div>
  );
};

// Graduation cap icon component
const GraduationCap = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);

export default AppPrototype;