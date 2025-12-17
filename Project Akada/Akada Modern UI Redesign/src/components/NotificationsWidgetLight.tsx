import { Card } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, TrendingUp, Wallet, X } from 'lucide-react';

const notifications = [
  {
    icon: AlertCircle,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    title: '🌟 Scholarship Opportunities',
    description: '3 scholarship opportunities in your saved programs',
    actionLabel: 'Apply for scholarships',
    actionBg: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    icon: TrendingUp,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    title: '📈 Great Progress',
    description: '1 application submitted',
    actionLabel: 'Explore more programs',
    actionBg: 'bg-green-500 hover:bg-green-600',
  },
  {
    icon: Wallet,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: '💰 Budget Comfortable',
    description: 'You have budget room for additional programs',
    actionLabel: 'Consider premium programs',
    actionBg: 'bg-blue-500 hover:bg-blue-600',
  },
];

export function NotificationsWidgetLight() {
  return (
    <Card className="bg-white/80 backdrop-blur-xl border-indigo-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-gray-900 mb-1">Notifications</h3>
          <p className="text-sm text-gray-500">1 urgent</p>
        </div>
        <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((notification, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg bg-gradient-to-br from-white to-gray-50 border border-gray-200 p-4 group hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg ${notification.iconBg} flex items-center justify-center shrink-0`}>
                <notification.icon className={`w-5 h-5 ${notification.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm text-gray-900 mb-1">{notification.title}</h4>
                <p className="text-xs text-gray-600 mb-3">{notification.description}</p>
                <Button
                  size="sm"
                  className={`${notification.actionBg} text-white text-xs h-7`}
                >
                  {notification.actionLabel}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
