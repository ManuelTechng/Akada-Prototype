import { Card } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, TrendingUp, Wallet, X } from 'lucide-react';

const notifications = [
  {
    icon: AlertCircle,
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
    title: '🌟 Scholarship Opportunities',
    description: '3 scholarship opportunities in your saved programs',
    actionLabel: 'Apply for scholarships',
    actionBg: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    icon: TrendingUp,
    iconBg: 'bg-green-500/20',
    iconColor: 'text-green-400',
    title: '📈 Great Progress',
    description: '1 application submitted',
    actionLabel: 'Explore more programs',
    actionBg: 'bg-green-500 hover:bg-green-600',
  },
  {
    icon: Wallet,
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    title: '💰 Budget Comfortable',
    description: 'You have budget room for additional programs',
    actionLabel: 'Consider premium programs',
    actionBg: 'bg-blue-500 hover:bg-blue-600',
  },
];

export function NotificationsWidget() {
  return (
    <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white mb-1">Notifications</h3>
          <p className="text-sm text-gray-400">1 urgent</p>
        </div>
        <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300">
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((notification, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${notification.iconBg} shrink-0`}>
                <notification.icon className={`w-4 h-4 ${notification.iconColor}`} />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm text-white mb-1">{notification.title}</h4>
                <p className="text-sm text-gray-400 mb-3">{notification.description}</p>

                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    className={`${notification.actionBg} text-white text-xs h-7`}
                  >
                    {notification.actionLabel}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7 text-gray-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
