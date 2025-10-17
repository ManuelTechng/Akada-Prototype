import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { AlertCircle, TrendingUp, Wallet, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const notifications = [
  {
    id: 1,
    icon: AlertCircle,
    iconBg: 'bg-orange-500/20 dark:bg-orange-500/10',
    iconColor: 'text-orange-500 dark:text-orange-400',
    title: 'Scholarship Opportunities',
    description: '3 scholarship opportunities in your saved programs',
    actionLabel: 'Apply for scholarships',
    actionBg: 'bg-orange-500 hover:bg-orange-600',
    actionPath: '/app/scholarships',
  },
  {
    id: 2,
    icon: TrendingUp,
    iconBg: 'bg-green-500/20 dark:bg-green-500/10',
    iconColor: 'text-green-500 dark:text-green-400',
    title: 'Great Progress',
    description: '1 application submitted',
    actionLabel: 'Explore more programs',
    actionBg: 'bg-green-500 hover:bg-green-600',
    actionPath: '/app/programs',
  },
  {
    id: 3,
    icon: Wallet,
    iconBg: 'bg-blue-500/20 dark:bg-blue-500/10',
    iconColor: 'text-blue-500 dark:text-blue-400',
    title: 'Budget Comfortable',
    description: 'You have budget room for additional programs',
    actionLabel: 'Consider premium programs',
    actionBg: 'bg-blue-500 hover:bg-blue-600',
    actionPath: '/app/programs',
  },
];

export function NotificationsWidget() {
  const navigate = useNavigate();
  const [visibleNotifications, setVisibleNotifications] = useState(notifications);

  const handleActionClick = (path: string) => {
    navigate(path);
  };

  const handleDismiss = (id: number) => {
    setVisibleNotifications(prev => prev.filter(notif => notif.id !== id));
  };
  return (
    <Card className="figma-card">
      <div className="figma-card-content">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold figma-text-primary mb-1">Notifications</h3>
            <p className="text-sm figma-text-secondary">1 urgent</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 !px-2 sm:!px-4"
          >
            <span className="hidden sm:inline">View All</span>
            <span className="sm:hidden">All</span>
          </Button>
        </div>

        <div className="space-y-3">
          {visibleNotifications.map((notification) => (
            <div
              key={notification.id}
              className="figma-notification-card"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${notification.iconBg} shrink-0`}>
                  <notification.icon className={`w-4 h-4 ${notification.iconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold figma-text-primary mb-1">{notification.title}</h4>
                  <p className="text-sm figma-text-secondary mb-3">{notification.description}</p>

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


