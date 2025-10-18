import { useMemo, useState, KeyboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { UserDropdown } from '../user/UserDropdown';

interface DarkHeaderProps {
  onMenuClick?: () => void;
}

export function DarkHeader({ onMenuClick }: DarkHeaderProps) {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const pageTitle = useMemo(() => {
    const path = location.pathname;

    if (path === '/app' || path === '/app/') return 'Dashboard';
    if (path.startsWith('/app/programs')) return 'Programs';
    if (path.startsWith('/app/saved')) return 'Saved Programs';
    if (path.startsWith('/app/recommended')) return 'Recommended';
    if (path.startsWith('/app/applications')) return 'Applications';
    if (path.startsWith('/app/documents')) return 'Documents';
    if (path.startsWith('/app/resources')) return 'Resources';
    if (path.startsWith('/app/community')) return 'Community';
    if (path.startsWith('/app/calculator')) return 'Cost Calculator';
    if (path.startsWith('/app/assistant')) return 'AI Assistant';
    if (path.startsWith('/app/profile')) return 'Profile';
    if (path.startsWith('/app/settings')) return 'Settings';

    return 'Dashboard';
  }, [location.pathname]);

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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/app/programs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header
      className={cn(
        'relative z-[80] flex h-20 sm:h-24 items-center justify-between border-b px-4 lg:px-8 backdrop-blur-xl transition-colors duration-300',
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

        <div className="flex flex-col justify-center">
          <h1
            className={cn(
              'text-lg sm:text-2xl font-semibold tracking-tight transition-colors',
              isDarkTheme ? 'text-white' : 'text-slate-900'
            )}
          >
            {pageTitle}
          </h1>
          <p
            className={cn(
              'hidden text-xs sm:text-sm transition-colors sm:block',
              isDarkTheme ? 'text-gray-500' : 'text-slate-500'
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
              'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform pointer-events-none',
              isDarkTheme ? 'text-gray-500' : 'text-slate-400'
            )}
          />
          <Input
            type="search"
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className={cn(
              'w-80 pl-10 pr-3 transition-colors duration-300',
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
          onClick={() => navigate('/app/programs')}
          className={cn(
            'lg:hidden transition-colors',
            isDarkTheme
              ? 'text-gray-400 hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          )}
        >
          <Search className="w-5 h-5" />
        </Button>

        <NotificationDropdown />

        <UserDropdown />
      </div>
    </header>
  );
}
