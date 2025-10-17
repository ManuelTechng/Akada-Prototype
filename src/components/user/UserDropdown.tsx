import { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown, CreditCard } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export function UserDropdown() {
  const { theme } = useTheme();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isDarkTheme = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    // Logout will be implemented with auth context
    console.log('Logout clicked');
    setIsOpen(false);
  };

  // Get user initials
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const displayName = profile?.full_name || 'User';
  const displayEmail = user?.email || 'user@example.com';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 transition-colors',
          isDarkTheme
            ? 'hover:bg-white/5'
            : 'hover:bg-slate-100'
        )}
      >
        <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
          <AvatarFallback className="bg-indigo-500 text-white text-xs font-semibold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:flex flex-col items-start min-w-0">
          <p
            className={cn(
              'text-sm font-semibold truncate max-w-[120px]',
              isDarkTheme ? 'text-white' : 'text-slate-900'
            )}
          >
            {displayName}
          </p>
          <p
            className={cn(
              'text-xs truncate max-w-[120px]',
              isDarkTheme ? 'text-slate-400' : 'text-slate-600'
            )}
          >
            {displayEmail}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform hidden sm:block',
            isOpen && 'rotate-180',
            isDarkTheme ? 'text-gray-400' : 'text-slate-500'
          )}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[90]"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div
            className={cn(
              'absolute right-0 z-[100] mt-2 w-52 rounded-lg shadow-xl border',
              isDarkTheme
                ? 'bg-gray-900/95 backdrop-blur-xl border-white/10'
                : 'bg-white border-slate-200'
            )}
          >
            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => handleNavigation('/app/profile')}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                  isDarkTheme
                    ? 'text-white hover:bg-white/5'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <User className="w-4 h-4" />
                Profile
              </button>

              <button
                onClick={() => handleNavigation('/app/settings')}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                  isDarkTheme
                    ? 'text-white hover:bg-white/5'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>

              <button
                onClick={() => handleNavigation('/app/billing')}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                  isDarkTheme
                    ? 'text-white hover:bg-white/5'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <CreditCard className="w-4 h-4" />
                Billing
              </button>

              <div
                className={cn(
                  'my-2 border-t',
                  isDarkTheme ? 'border-white/10' : 'border-slate-200'
                )}
              />

              <button
                onClick={handleLogout}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                  isDarkTheme
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-red-600 hover:bg-red-50'
                )}
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
