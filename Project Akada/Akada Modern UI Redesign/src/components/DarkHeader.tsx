import { Search, Bell, Settings, HelpCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function DarkHeader() {
  return (
    <header className="h-16 bg-gray-900/30 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-sm text-gray-400">Dashboard</h1>
          <p className="text-xs text-gray-500">Wednesday, October 15, 2025</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search anything..."
            className="pl-10 w-80 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>

        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white relative">
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-indigo-500 text-white text-[10px] border-0">
            3
          </Badge>
        </Button>

        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <Settings className="w-5 h-5" />
        </Button>

        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <HelpCircle className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
