import { Bell, Search, ChevronDown } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';

export function LightHeader() {
  return (
    <header className="border-b border-gray-200 bg-white/70 backdrop-blur-xl relative z-20">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search programs, resources, or applications..." 
                className="pl-10 bg-white/80 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-indigo-300 focus:ring-indigo-200"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-gray-100 text-gray-700"
            >
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-indigo-500 text-white border-2 border-white">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-indigo-500 text-white">TO</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm text-gray-900">Tosin</p>
                <p className="text-xs text-gray-500">Student</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
