import { Search, Bell, Settings as SettingsIcon } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

export function DashboardHeader() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search programs..."
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
            1
          </Badge>
        </Button>

        <Button variant="ghost" size="icon">
          <SettingsIcon className="w-5 h-5 text-gray-600" />
        </Button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm text-gray-900">Tosin</p>
            <p className="text-xs text-gray-500">Student</p>
          </div>
          <Avatar>
            <AvatarFallback className="bg-purple-600 text-white">TO</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
