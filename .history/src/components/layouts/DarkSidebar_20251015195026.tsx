import { 
  LayoutDashboard, 
  GraduationCap, 
  Bookmark, 
  Users, 
  FileText, 
  Library,
  Settings,
  Calculator,
  FileSearch,
  LogOut,
  ChevronDown,
  Menu,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Switch } from '../ui/switch';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import mainLogo from '../../assets/430a52e73dc288723ed79d46ec10415bf74e2494.png';
import miniLogo from '../../assets/33a5db83050df89685f494eda5d3b2bfe7baef28.png';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
  { icon: GraduationCap, label: 'Programs', path: '/app/programs' },
  { icon: Bookmark, label: 'Saved', path: '/app/saved' },
  { icon: Users, label: 'Recommended', path: '/app/recommended' },
  { icon: FileText, label: 'Applications', path: '/app/applications' },
  { icon: Library, label: 'Resources', path: '/app/resources' },
  { icon: Users, label: 'Community', path: '/app/community' },
];

const toolItems = [
  { icon: Calculator, label: 'Cost Calculator', path: '/app/calculator' },
  { icon: FileSearch, label: 'AI Document Review', path: '/app/assistant' },
  { icon: Library, label: 'AI Assistant (Amara)', path: '/app/assistant' },
];

interface DarkSidebarProps {
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export function DarkSidebar({ isMobileOpen = false, onMobileToggle }: DarkSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 
        bg-gray-900/50 backdrop-blur-xl border-r border-white/5 
        flex flex-col transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo & Toggle */}
        <div className={`p-6 border-b border-white/5 flex items-center ${isCollapsed ? 'justify-center flex-col gap-4' : 'justify-between'}`}>
        {!isCollapsed ? (
          <>
            <img src={mainLogo} alt="Akada" className="h-8" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsCollapsed(!isCollapsed);
                onMobileToggle?.();
              }}
              className="text-gray-400 hover:text-white hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </>
        ) : (
          <>
            <img src={miniLogo} alt="Akada" className="h-12 w-12" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsCollapsed(!isCollapsed);
                onMobileToggle?.();
              }}
              className="text-gray-400 hover:text-white hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1 mb-6">
          {navItems.map((item) => {
            // Check if current path matches exactly or starts with the item path (for nested routes)
            const isActive = location.pathname === item.path || 
                           (item.path !== '/app' && location.pathname.startsWith(item.path));
            
            return (
              <Button
                key={item.label}
                variant="ghost"
                onClick={() => {
                  navigate(item.path);
                  onMobileToggle?.();
                }}
                className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3'}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            );
          })}
        </div>

        {!isCollapsed && (
          <>
            <div className="mb-2">
              <p className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider">Tools</p>
            </div>

              <div className="space-y-1">
                {toolItems.map((item) => {
                  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);
                  
                  return (
                    <Button
                      key={item.label}
                      variant="ghost"
                      onClick={() => {
                        navigate(item.path);
                        onMobileToggle?.();
                      }}
                      className={`w-full justify-start ${
                        isActive
                          ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      <span>{item.label}</span>
                    </Button>
                  );
                })}
              </div>
          </>
        )}
      </nav>

      {/* Dark Mode Toggle */}
      <div className="px-4 py-3 border-t border-white/5">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-lg bg-white/5`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-gray-400" />
              ) : (
                <Sun className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm text-gray-300">{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
            </div>
          )}
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
            className="data-[state=checked]:bg-indigo-500"
          />
        </div>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-white/5">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-indigo-500 text-white">TO</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">Tosin</p>
                <p className="text-xs text-gray-400">tosin@example.com</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>

                  <div className="mt-2 space-y-1">
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/app/settings')}
                      className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        // Add logout functionality here
                        console.log('Logout clicked');
                      }}
                      className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Log out
                    </Button>
                  </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-indigo-500 text-white">TO</AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/app/settings')}
              className="text-gray-400 hover:text-white hover:bg-white/5"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // Add logout functionality here
                console.log('Logout clicked');
              }}
              className="text-gray-400 hover:text-white hover:bg-white/5"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
