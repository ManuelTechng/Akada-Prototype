import { Search, Bell, Settings, ChevronDown } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';

export function ModernHeader() {
  const navItems = ['Overview', 'Programs', 'Applications', 'Resources', 'Analytics'];

  return (
    <div className="bg-white border-b border-gray-100">
      {/* Top Bar */}
      <div className="px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg" />
            <span className="text-xl text-gray-900">Kada</span>
          </div>

          {/* Search */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search programs, applications..."
              className="pl-10 bg-gray-50 border-0"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-red-500 text-white text-[10px]">
              3
            </Badge>
          </Button>

          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5 text-gray-600" />
          </Button>

          <div className="h-6 w-px bg-gray-200" />

          <Button variant="ghost" className="gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm">
                TO
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-700">Tosin</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-8 flex items-center gap-6 border-t border-gray-100">
        {navItems.map((item, index) => (
          <button
            key={item}
            className={`py-4 px-1 text-sm border-b-2 transition-colors ${
              index === 0
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
