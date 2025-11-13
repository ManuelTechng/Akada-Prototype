import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useSmartNotifications } from '../../hooks/useSmartNotifications';

/**
 * Renders a notifications widget that shows up to three non-dismissed notifications with actions and a dismiss option.
 *
 * The header displays an urgent count when greater than zero and an empty state when there are no visible notifications.
 * Clicking an action navigates to the notification's action path; dismissing a notification hides it locally.
 *
 * @returns A React element rendering the notifications widget
 */
export function NotificationsWidget() {
  const navigate = useNavigate();
  const { notifications, urgentCount } = useSmartNotifications();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const visibleNotifications = notifications
    .filter((notif) => !dismissedIds.includes(notif.id))
    .slice(0, 3); // Show top 3

  const handleActionClick = (path: string) => {
    navigate(path);
  };

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };
  return (
    <Card className="figma-card">
      <div className="figma-card-content">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-5 h-5 text-indigo-500 dark:text-indigo-300" />
              <h3 className="text-lg font-semibold figma-text-primary">Notifications</h3>
            </div>
            <p className="text-sm figma-text-secondary">
              {urgentCount > 0 ? `${urgentCount} urgent` : 'All up to date'}
            </p>
          </div>
        </div>

        {/* Empty State */}
        {visibleNotifications.length === 0 && (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-sm figma-text-secondary">
              No notifications at the moment
            </p>
          </div>
        )}

        <div className="space-y-3">
          {visibleNotifications.map((notification) => (
            <div key={notification.id} className="figma-notification-card">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${notification.iconBg} shrink-0`}>
                  <notification.icon className={`w-4 h-4 ${notification.iconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold figma-text-primary mb-1">
                    {notification.title}
                  </h4>
                  <p className="text-sm figma-text-secondary mb-3">
                    {notification.description}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant={null as any}
                      size="xs"
                      onClick={() => handleActionClick(notification.actionPath)}
                      className={`${notification.actionBg} text-white rounded-md font-medium transition-colors flex-shrink-0`}
                    >
                      <span className="hidden sm:inline">{notification.actionLabel}</span>
                      <span className="sm:hidden">{notification.actionLabel.split(' ')[0]}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleDismiss(notification.id)}
                      className="figma-text-secondary hover:figma-text-primary !w-7 !h-7 !min-w-0 !min-h-0 flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

