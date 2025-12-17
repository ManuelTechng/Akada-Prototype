import { Card } from './ui/card';
import { CheckCircle, Clock, FileText, Star } from 'lucide-react';

const activities = [
  {
    icon: CheckCircle,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    title: 'Application Submitted',
    description: 'MIT Computer Science Program',
    time: '2 hours ago',
  },
  {
    icon: Star,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    title: 'Program Saved',
    description: 'Stanford Data Science Masters',
    time: '5 hours ago',
  },
  {
    icon: FileText,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Document Uploaded',
    description: 'Transcript for Harvard Application',
    time: '1 day ago',
  },
  {
    icon: Clock,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    title: 'Deadline Approaching',
    description: 'Berkeley PhD Program - 7 days left',
    time: '2 days ago',
  },
];

export function ActivityFeed() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg text-gray-900 mb-1">Recent Activity</h3>
        <p className="text-sm text-gray-500">Your latest actions and updates</p>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex gap-4">
            <div className={`w-10 h-10 rounded-lg ${activity.iconBg} flex items-center justify-center shrink-0`}>
              <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 mb-0.5">{activity.title}</p>
              <p className="text-sm text-gray-500">{activity.description}</p>
              <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
