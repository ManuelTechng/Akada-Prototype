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

export function RecentActivitiesWidget() {
  return (
    <Card className="figma-card">
      <div className="figma-card-content">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-indigo-500 dark:text-indigo-300" />
            <h3 className="text-lg font-semibold figma-text-primary">Recent Activities</h3>
          </div>
          <p className="text-sm figma-text-secondary">Your latest actions</p>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center shrink-0 ${activity.bg}`}>
                <activity.icon className={`w-5 h-5 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium figma-text-primary mb-1">{activity.text}</p>
                <p className="text-xs figma-text-secondary">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}


