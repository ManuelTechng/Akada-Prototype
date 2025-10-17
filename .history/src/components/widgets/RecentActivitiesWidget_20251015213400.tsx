import { Card } from '../ui/card';
import { Activity, FileText, BookMarked, Calendar, UserCheck } from 'lucide-react';

const activities = [
  {
    icon: BookMarked,
    text: 'Saved Computer Science at MIT',
    time: '2 hours ago',
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
  },
  {
    icon: FileText,
    text: 'Updated application documents',
    time: '5 hours ago',
    color: 'text-purple-400',
    bg: 'bg-purple-500/15',
  },
  {
    icon: Calendar,
    text: 'Set deadline reminder for Stanford',
    time: '1 day ago',
    color: 'text-green-400',
    bg: 'bg-emerald-500/15',
  },
  {
    icon: UserCheck,
    text: 'Completed profile verification',
    time: '2 days ago',
    color: 'text-orange-400',
    bg: 'bg-orange-500/15',
  },
];

const cardClass =
  'relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-lg shadow-slate-200/40 dark:border-white/10 dark:bg-gradient-to-br dark:from-[#141f41]/95 dark:via-[#0c142b]/95 dark:to-[#060b19]/95 dark:shadow-[0_28px_60px_-28px_rgba(7,12,28,0.85)]';

export function RecentActivitiesWidget() {
  return (
    <Card className={`${cardClass} p-5 sm:p-6`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5 text-indigo-500 dark:text-indigo-300" />
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Recent Activities</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300/80">Your latest actions</p>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl border border-slate-200/60 dark:border-white/10 bg-slate-100/70 dark:bg-[#182448]/80 flex items-center justify-center shrink-0 ${activity.bg}`}>
              <activity.icon className={`w-5 h-5 ${activity.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">{activity.text}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

