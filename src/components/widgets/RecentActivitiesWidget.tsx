import { Card } from '../ui/card';
import { Activity, FileText, BookMarked, Calendar, UserCheck, Clock } from 'lucide-react';
import { useRecentActivities } from '../../hooks/useRecentActivities';

const getActivityIcon = (actionType: string) => {
  switch (actionType) {
    case 'saved_program':
      return BookMarked;
    case 'updated_application':
      return FileText;
    case 'set_deadline':
      return Calendar;
    case 'profile_update':
      return UserCheck;
    case 'document_upload':
      return FileText;
    default:
      return Activity;
  }
};

const getActivityColors = (actionType: string) => {
  switch (actionType) {
    case 'saved_program':
      return { color: 'text-blue-400', bg: 'bg-blue-500/15' };
    case 'updated_application':
      return { color: 'text-purple-400', bg: 'bg-purple-500/15' };
    case 'set_deadline':
      return { color: 'text-green-400', bg: 'bg-emerald-500/15' };
    case 'profile_update':
      return { color: 'text-orange-400', bg: 'bg-orange-500/15' };
    case 'document_upload':
      return { color: 'text-indigo-400', bg: 'bg-indigo-500/15' };
    default:
      return { color: 'text-gray-400', bg: 'bg-gray-500/15' };
  }
};

/**
 * Renders a "Recent Activities" widget showing the user's latest actions.
 *
 * Displays a skeleton while activities are loading, an empty-state message when there are no activities,
 * and up to four recent activity items each with an icon, color badge, description, and relative timestamp.
 *
 * @returns The Recent Activities widget UI element.
 */
export function RecentActivitiesWidget() {
  const { activities, loading, formatTimeAgo } = useRecentActivities();

  if (loading) {
    return (
      <Card className="figma-card">
        <div className="figma-card-content">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

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

        {/* Empty State */}
        {activities.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-sm figma-text-secondary">
              No recent activities. Start exploring programs!
            </p>
          </div>
        )}

        {/* Activities List */}
        <div className="space-y-4">
          {activities.slice(0, 4).map((activity) => {
            const Icon = getActivityIcon(activity.action_type);
            const colors = getActivityColors(activity.action_type);

            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center shrink-0 ${colors.bg}`}>
                  <Icon className={`w-5 h-5 ${colors.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium figma-text-primary mb-1">{activity.description}</p>
                  <p className="text-xs figma-text-secondary">{formatTimeAgo(activity.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

