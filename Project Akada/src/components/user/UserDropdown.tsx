import { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown, CreditCard } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export function UserDropdown() {
  const { theme } = useTheme();
  const { user, profile, signOut } = useAuth();
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

  const handleLogout = async () => {
    try {
      console.log('UserDropdown: Logout button clicked');
      setIsOpen(false);
      console.log('UserDropdown: Calling signOut...');
      await signOut();
      console.log('UserDropdown: signOut complete, navigating to login');
      navigate('/login');
    } catch (error) {
      console.error('UserDropdown: Error logging out:', error);
    }
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
        className="flex items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 transition-colors hover:bg-accent"
      >
        <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:flex flex-col items-start min-w-0">
          <p className="text-sm font-semibold truncate max-w-[120px] text-foreground">
            {displayName}
          </p>
          <p className="text-xs truncate max-w-[120px] text-muted-foreground">
            {displayEmail}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform hidden sm:block text-muted-foreground',
            isOpen && 'rotate-180'
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
          <div className="absolute right-0 z-[100] mt-2 w-52 rounded-lg shadow-xl border bg-popover/95 backdrop-blur-xl border-border">
            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => handleNavigation('/app/profile')}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-foreground hover:bg-accent"
              >
                <User className="w-4 h-4" />
                Profile
              </button>

              <button
                onClick={() => handleNavigation('/app/settings')}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-foreground hover:bg-accent"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>

              <button
                onClick={() => handleNavigation('/app/billing')}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-foreground hover:bg-accent"
              >
                <CreditCard className="w-4 h-4" />
                Billing
              </button>

              <div className="my-2 border-t border-border" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-destructive hover:bg-destructive/10"
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
