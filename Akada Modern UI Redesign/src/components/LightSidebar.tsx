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
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Switch } from './ui/switch';
import { useState } from 'react';
import { useTheme } from './ThemeProvider';
import mainLogo from 'figma:asset/8a98d98a4de9f43fe1d2f143a82daf20405de5b4.png';
import miniLogo from 'figma:asset/c6c86106cf320bf8a749490dc3051da0953af25f.png';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: GraduationCap, label: 'Programs' },
  { icon: Bookmark, label: 'Saved' },
  { icon: Users, label: 'Recommended' },
  { icon: FileText, label: 'Applications' },
  { icon: Library, label: 'Resources' },
  { icon: Users, label: 'Community' },
];

const toolItems = [
  { icon: Calculator, label: 'Cost Calculator' },
  { icon: FileSearch, label: 'AI Document Review' },
  { icon: Library, label: 'AI Assistant (Amara)' },
];

export function LightSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`h-screen bg-white/70 backdrop-blur-xl border-r border-gray-200 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo & Toggle */}
      <div className={`p-6 border-b border-gray-200 flex items-center ${isCollapsed ? 'justify-center flex-col gap-4' : 'justify-between'}`}>
        {!isCollapsed ? (
          <>
            <img src={mainLogo} alt="Akada" className="h-8" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1 mb-6">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} ${
                item.active 
                  ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3'}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </div>

        {!isCollapsed && (
          <>
            <div className="mb-2">
              <p className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider">Tools</p>
            </div>

            <div className="space-y-1">
              {toolItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Dark Mode Toggle */}
      <div className="px-4 py-3 border-t border-gray-200">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-lg bg-gray-100`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-gray-600" />
              ) : (
                <Sun className="w-4 h-4 text-gray-600" />
              )}
              <span className="text-sm text-gray-700">{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
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
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-indigo-500 text-white">TO</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">Tosin</p>
                <p className="text-xs text-gray-500">tosin@example.com</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </div>

            <div className="mt-2 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
