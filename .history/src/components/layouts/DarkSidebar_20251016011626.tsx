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
  Sun,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';
import darkMainLogo from '../../assets/430a52e73dc288723ed79d46ec10415bf74e2494.png';
import darkMiniLogo from '../../assets/33a5db83050df89685f494eda5d3b2bfe7baef28.png';
import lightMainLogo from '../../assets/8a98d98a4de9f43fe1d2f143a82daf20405de5b4.png';
import lightMiniLogo from '../../assets/c6c86106cf320bf8a749490dc3051da0953af25f.png';
import Rectangle1 from '../ui/Rectangle1';

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
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isDarkTheme = theme === 'dark';
  const mainLogo = isDarkTheme ? darkMainLogo : lightMainLogo;
  const miniLogo = isDarkTheme ? darkMiniLogo : lightMiniLogo;

  const sidebarClasses = cn(
    'fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out border-r backdrop-blur-xl lg:translate-x-0',
  isCollapsed ? 'w-24' : 'w-72',
    isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    theme === 'dark'
      ? 'bg-gray-900/60 border-white/10'
      : 'bg-white/80 border-gray-200 shadow-lg supports-[backdrop-filter]:bg-white/60'
  );

  const activeButtonClasses = (isActive: boolean) =>
    cn(
      'w-full transition-colors rounded-lg',
      isCollapsed ? 'justify-center px-2' : 'justify-start px-3',
      isActive
        ? theme === 'dark'
          ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
          : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
        : theme === 'dark'
        ? 'text-gray-400 hover:text-white hover:bg-white/5'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    );

  const secondaryButtonClasses = (isActive: boolean) =>
    cn(
      'w-full justify-start rounded-lg transition-colors',
      isActive
        ? theme === 'dark'
          ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
          : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
        : theme === 'dark'
        ? 'text-gray-400 hover:text-white hover:bg-white/5'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    );

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
      <div className={sidebarClasses}>
        {/* Logo & Toggle */}
        <div
          className={cn(
            'p-6 flex items-center border-b transition-colors',
            isCollapsed ? 'justify-center flex-col gap-4' : 'justify-between',
            theme === 'dark' ? 'border-white/10' : 'border-gray-200'
          )}
        >
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
              className={cn(
                'hover:bg-transparent',
                theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              )}
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
              className={cn(
                'hover:bg-transparent',
                theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              )}
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
                className={activeButtonClasses(isActive)}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon
                  className={cn(
                    isCollapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3',
                    isActive && theme !== 'dark' ? 'text-indigo-600' : undefined
                  )}
                />
                {!isCollapsed && (
                  <span
                    className={cn(
                      'truncate',
                      theme === 'dark' ? 'text-sm' : 'text-sm font-medium'
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        {!isCollapsed && (
          <>
            <div className="mb-2">
              <p className={cn('px-3 py-2 text-xs uppercase tracking-wider transition-colors', theme === 'dark' ? 'text-gray-500' : 'text-slate-500')}>Tools</p>
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
                      className={secondaryButtonClasses(isActive)}
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
        <div
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg transition-colors border',
            isCollapsed ? 'justify-center' : 'justify-between',
            isDarkTheme
              ? 'bg-white/5 border-white/10'
              : 'bg-white border-gray-200 shadow-sm'
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              {isDarkTheme ? (
                <Moon className="w-4 h-4 text-gray-300" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span
                className={cn(
                  'text-sm font-medium transition-colors',
                  isDarkTheme ? 'text-gray-200' : 'text-slate-700'
                )}
              >
                {isDarkTheme ? 'Dark' : 'Light'} Mode
              </span>
            </div>
          )}
          <Rectangle1 />
        </div>
      </div>

      {/* User Section */}
      <div
        className={cn(
          'p-4 border-t transition-colors',
          theme === 'dark' ? 'border-white/10' : 'border-gray-200'
        )}
      >
        {!isCollapsed ? (
          <>
            <div
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer',
                theme === 'dark'
                  ? 'bg-white/5 hover:bg-white/10'
                  : 'bg-white hover:bg-slate-100 border border-gray-200 shadow-sm'
              )}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-indigo-500 text-white">TO</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm truncate font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-800')}>
                  Tosin
                </p>
                <p className={cn('text-xs', theme === 'dark' ? 'text-gray-400' : 'text-slate-500')}>
                  tosin@example.com
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>

                  <div className="mt-2 space-y-1">
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/app/settings')}
                      className={cn(
                        'w-full justify-start rounded-lg transition-colors',
                        theme === 'dark'
                          ? 'text-gray-300 hover:text-white hover:bg-white/5'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      )}
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
                      className={cn(
                        'w-full justify-start rounded-lg transition-colors',
                        theme === 'dark'
                          ? 'text-gray-300 hover:text-white hover:bg-white/5'
                          : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
                      )}
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
              className={cn(
                theme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
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
              className={cn(
                theme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
              )}
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
