import { useState, useRef, useEffect } from 'react';
import { Bell, AlertCircle, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  icon: typeof AlertCircle;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  actionLabel: string;
  actionRoute: string;
  timestamp: string;
}

const notifications: Notification[] = [
  {
    id: '1',
    icon: AlertCircle,
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
    title: 'Scholarship Opportunities',
    description: '3 scholarship opportunities in your saved programs',
    actionLabel: 'View Scholarships',
    actionRoute: '/app/saved',
    timestamp: '5 min ago',
  },
  {
    id: '2',
    icon: TrendingUp,
    iconBg: 'bg-green-500/20',
    iconColor: 'text-green-400',
    title: 'Application Submitted',
    description: 'Your application to University of Oslo has been submitted',
    actionLabel: 'View Application',
    actionRoute: '/app/applications',
    timestamp: '1 hour ago',
  },
  {
    id: '3',
    icon: Wallet,
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    title: 'Budget Update',
    description: 'You have budget room for 2 additional programs',
    actionLabel: 'Explore Programs',
    actionRoute: '/app/programs',
    timestamp: '3 hours ago',
  },
];

export function NotificationDropdown() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDarkTheme = theme === 'dark';
  const unreadCount = notifications.length;
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

  const handleNotificationClick = (route: string) => {
    navigate(route);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative transition-colors text-muted-foreground hover:text-foreground"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center border-0 bg-primary p-0 text-[10px] text-primary-foreground">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[90]"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="fixed sm:absolute right-2 sm:right-0 z-[100] mt-2 w-full max-w-[min(22rem,calc(100vw-2rem))] sm:w-[22rem] rounded-2xl shadow-xl border bg-popover/95 backdrop-blur-xl border-border">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Notifications
                </h3>
                <button
                  onClick={() => handleNotificationClick('/app/applications')}
                  className="text-xs font-medium text-primary hover:text-primary/80"
                >
                  View all
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.actionRoute)}
                  className="w-full px-4 py-3 text-left transition-colors hover:bg-accent"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg shrink-0', notification.iconBg)}>
                      <notification.icon className={cn('w-4 h-4', notification.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-1 text-foreground">
                        {notification.title}
                      </p>
                      <p className="text-xs mb-2 text-muted-foreground">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {notification.timestamp}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Empty State */}
            {notifications.length === 0 && (
              <div className="px-4 py-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No new notifications
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
