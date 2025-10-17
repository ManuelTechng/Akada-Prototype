import { useMemo } from 'react';
import { Search, Bell, Settings, HelpCircle, Menu } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';

interface DarkHeaderProps {
  onMenuClick?: () => void;
}

export function DarkHeader({ onMenuClick }: DarkHeaderProps) {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date()),
    []
  );

  return (
    <header
      className={cn(
        'flex h-16 items-center justify-between border-b px-4 lg:px-8 backdrop-blur-xl transition-colors duration-300',
        isDarkTheme
          ? 'bg-gray-900/40 border-white/5'
          : 'bg-white/90 border-slate-200 shadow-sm supports-[backdrop-filter]:bg-white/80'
      )}
    >
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className={cn(
            'lg:hidden transition-colors',
            isDarkTheme
              ? 'text-gray-400 hover:text-white hover:bg-white/10'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          )}
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div>
          <h1
            className={cn(
              'text-sm font-medium transition-colors',
              isDarkTheme ? 'text-gray-300' : 'text-slate-600'
            )}
          >
            Dashboard
          </h1>
          <p
            className={cn(
              'hidden text-xs transition-colors sm:block',
              isDarkTheme ? 'text-gray-500' : 'text-slate-400'
            )}
          >
            {todayLabel}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        {/* Desktop Search */}
        <div className="relative hidden lg:block">
          <Search
            className={cn(
              'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform',
              isDarkTheme ? 'text-gray-500' : 'text-slate-400'
            )}
          />
          <Input
            placeholder="Search anything..."
            className={cn(
              'w-80 pl-10 transition-colors duration-300',
              isDarkTheme
                ? 'border-white/10 bg-white/5 text-white placeholder:text-gray-500'
                : 'border-slate-200 bg-white text-slate-800 placeholder:text-slate-400'
            )}
          />
        </div>

        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'lg:hidden transition-colors',
            isDarkTheme
              ? 'text-gray-400 hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          )}
        >
          <Search className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative transition-colors',
            isDarkTheme
              ? 'text-gray-400 hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          )}
        >
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center border-0 bg-indigo-500 p-0 text-[10px] text-white">
            3
          </Badge>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'hidden transition-colors sm:block',
            isDarkTheme
              ? 'text-gray-400 hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          )}
        >
          <Settings className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'hidden transition-colors lg:block',
            isDarkTheme
              ? 'text-gray-400 hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          )}
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
