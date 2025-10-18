import { Card } from './ui/card';
import { Activity, FileText, BookMarked, Calendar, UserCheck } from 'lucide-react';

const activities = [
  {
    icon: BookMarked,
    text: 'Saved Computer Science at MIT',
    time: '2 hours ago',
    color: 'text-blue-600',
    bg: 'bg-blue-500/20',
  },
  {
    icon: FileText,
    text: 'Updated application documents',
    time: '5 hours ago',
    color: 'text-purple-600',
    bg: 'bg-purple-500/20',
  },
  {
    icon: Calendar,
    text: 'Set deadline reminder for Stanford',
    time: '1 day ago',
    color: 'text-green-600',
    bg: 'bg-green-500/20',
  },
  {
    icon: UserCheck,
    text: 'Completed profile verification',
    time: '2 days ago',
    color: 'text-orange-600',
    bg: 'bg-orange-500/20',
  },
];

export function RecentActivitiesWidgetLight() {
  return (
    <Card className="bg-white/80 backdrop-blur-xl border-indigo-100 p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5 text-indigo-600" />
          <h3 className="text-gray-900">Recent Activities</h3>
        </div>
        <p className="text-sm text-gray-600">Your latest actions</p>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg ${activity.bg} flex items-center justify-center border border-indigo-200 shrink-0`}>
              <activity.icon className={`w-5 h-5 ${activity.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 mb-1">{activity.text}</p>
              <p className="text-xs text-gray-600">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
