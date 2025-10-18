import { Card } from '../ui/card';
import { Button } from '../ui/button';
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

const cardClass =
  'relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-lg shadow-slate-200/40 dark:border-white/10 dark:bg-gradient-to-br dark:from-[#151f42]/95 dark:via-[#0d162f]/95 dark:to-[#070d1b]/95 dark:shadow-[0_28px_60px_-28px_rgba(7,12,28,0.85)]';

export function NotificationsWidget() {
  return (
    <Card className={`${cardClass} p-5 sm:p-6`}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Notifications</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300/80">1 urgent</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
        >
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((notification, index) => (
          <div
            key={index}
            className="p-4 rounded-2xl bg-slate-100/60 border border-slate-200/60 shadow-sm transition-colors hover:border-slate-300/70 dark:bg-[#162347]/80 dark:border-white/8 dark:hover:border-white/16 dark:shadow-[0_24px_40px_-28px_rgba(16,33,68,0.85)]"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl border border-slate-200/60 dark:border-white/10 ${notification.iconBg} shrink-0`}>
                <notification.icon className={`w-4 h-4 ${notification.iconColor}`} />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{notification.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300/80 mb-3">{notification.description}</p>

                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    className={`${notification.actionBg} text-white text-xs h-8 rounded-lg px-3 font-medium shadow-[0_10px_20px_-10px_rgba(0,0,0,0.6)]`}
                  >
                    {notification.actionLabel}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white"
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

