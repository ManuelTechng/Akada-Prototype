import { 
  LayoutDashboard, 
  GraduationCap, 
  Bookmark, 
  Star, 
  FileText, 
  Library, 
  Users, 
  Calculator, 
  FileSearch, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  active?: boolean;
}

export function DashboardSidebar() {
  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: GraduationCap, label: 'Programs' },
    { icon: Bookmark, label: 'Saved', badge: 4 },
    { icon: Star, label: 'Recommended' },
    { icon: FileText, label: 'Applications' },
    { icon: Library, label: 'Resources' },
    { icon: Users, label: 'Community' },
  ];

  const toolItems: NavItem[] = [
    { icon: Calculator, label: 'Cost Calculator' },
    { icon: FileSearch, label: 'AI Document Review' },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl text-gray-900">Kada</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        <div className="mb-6">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant={item.active ? "secondary" : "ghost"}
              className={`w-full justify-start mb-1 ${
                item.active 
                  ? 'bg-purple-50 text-purple-700 hover:bg-purple-100' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-4 h-4 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="px-2 py-0.5 text-xs bg-purple-600 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </Button>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          <p className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider">Tools</p>
          {toolItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <item.icon className="w-4 h-4 mr-3" />
              <span className="text-left">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>

      {/* Account Section */}
      <div className="p-3 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50 mb-1"
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Log out
        </Button>
      </div>
    </div>
  );
}
