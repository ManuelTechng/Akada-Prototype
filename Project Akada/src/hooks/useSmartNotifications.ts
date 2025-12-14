import { useMemo } from 'react';
import { useApplications } from './useApplications';
import { useUserProgressStats } from './useUserProgressStats';
import { useUserTasks } from './useUserTasks';
import { useProfileCompletion } from './useDashboard';
import { AlertCircle, TrendingUp, Wallet, Clock, Target, Award } from 'lucide-react';

export interface SmartNotification {
  id: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  actionLabel: string;
  actionBg: string;
  actionPath: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
}

export const useSmartNotifications = () => {
  const { applications } = useApplications();
  const { stats } = useUserProgressStats();
  const { summary: taskSummary } = useUserTasks();
  const { completionData } = useProfileCompletion();

  const notifications = useMemo<SmartNotification[]>(() => {
    const notifs: SmartNotification[] = [];

    // 1. Urgent Deadlines
    if (stats.upcomingDeadlines > 0) {
      notifs.push({
        id: 'urgent-deadlines',
        icon: Clock,
        iconBg: 'bg-red-500/20 dark:bg-red-500/10',
        iconColor: 'text-red-500 dark:text-red-400',
        title: 'Urgent Deadlines',
        description: `${stats.upcomingDeadlines} application${stats.upcomingDeadlines !== 1 ? 's' : ''} due within 30 days`,
        actionLabel: 'Review applications',
        actionBg: 'bg-red-500 hover:bg-red-600',
        actionPath: '/app/applications',
        priority: 'urgent',
      });
    }

    // 2. High Priority Tasks
    if (taskSummary.highPriority > 0) {
      notifs.push({
        id: 'high-priority-tasks',
        icon: Target,
        iconBg: 'bg-orange-500/20 dark:bg-orange-500/10',
        iconColor: 'text-orange-500 dark:text-orange-400',
        title: 'High Priority Tasks',
        description: `${taskSummary.highPriority} important task${taskSummary.highPriority !== 1 ? 's' : ''} need your attention`,
        actionLabel: 'View tasks',
        actionBg: 'bg-orange-500 hover:bg-orange-600',
        actionPath: '/app/applications',
        priority: 'high',
      });
    }

    // 3. Profile Completion
    if (completionData && completionData.percentage < 100) {
      const missingSections = completionData.missingSections.length;
      notifs.push({
        id: 'complete-profile',
        icon: AlertCircle,
        iconBg: 'bg-yellow-500/20 dark:bg-yellow-500/10',
        iconColor: 'text-yellow-500 dark:text-yellow-400',
        title: 'Complete Your Profile',
        description: `${missingSections} section${missingSections !== 1 ? 's' : ''} remaining to unlock full features`,
        actionLabel: 'Complete profile',
        actionBg: 'bg-yellow-500 hover:bg-yellow-600',
        actionPath: '/app/settings',
        priority: completionData.percentage < 50 ? 'high' : 'medium',
      });
    }

    // 4. Application Progress
    if (stats.inProgress > 0) {
      notifs.push({
        id: 'continue-applications',
        icon: TrendingUp,
        iconBg: 'bg-blue-500/20 dark:bg-blue-500/10',
        iconColor: 'text-blue-500 dark:text-blue-400',
        title: 'Applications In Progress',
        description: `${stats.inProgress} application${stats.inProgress !== 1 ? 's' : ''} ready to submit`,
        actionLabel: 'Continue applications',
        actionBg: 'bg-blue-500 hover:bg-blue-600',
        actionPath: '/app/applications',
        priority: 'medium',
      });
    }

    // 5. Success Milestone
    if (stats.submitted > 0 && stats.completionRate >= 50) {
      notifs.push({
        id: 'great-progress',
        icon: TrendingUp,
        iconBg: 'bg-green-500/20 dark:bg-green-500/10',
        iconColor: 'text-green-500 dark:text-green-400',
        title: 'Great Progress!',
        description: `${stats.submitted} application${stats.submitted !== 1 ? 's' : ''} submitted - ${stats.completionRate}% completion rate`,
        actionLabel: 'Explore more programs',
        actionBg: 'bg-green-500 hover:bg-green-600',
        actionPath: '/app/programs',
        priority: 'low',
      });
    }

    // 6. Scholarship Opportunities (if available)
    // Note: scholarship_available field needs to be added to programs table
    // const scholarshipPrograms = applications.filter(
    //   (app) => (app.programs as any).scholarship_available
    // );
    // if (scholarshipPrograms.length > 0) {
    //   notifs.push({
    //     id: 'scholarship-opportunities',
    //     icon: Award,
    //     iconBg: 'bg-purple-500/20 dark:bg-purple-500/10',
    //     iconColor: 'text-purple-500 dark:text-purple-400',
    //     title: 'Scholarship Opportunities',
    //     description: `${scholarshipPrograms.length} scholarship${scholarshipPrograms.length !== 1 ? 's' : ''} available in your saved programs`,
    //     actionLabel: 'View scholarships',
    //     actionBg: 'bg-purple-500 hover:bg-purple-600',
    //     actionPath: '/app/programs?scholarshipsOnly=true',
    //     priority: 'medium',
    //   });
    // }

    // 7. Budget Consideration
    if (stats.totalApplications === 0 && completionData && completionData.percentage >= 70) {
      notifs.push({
        id: 'start-exploring',
        icon: Wallet,
        iconBg: 'bg-indigo-500/20 dark:bg-indigo-500/10',
        iconColor: 'text-indigo-500 dark:text-indigo-400',
        title: 'Ready to Explore',
        description: 'Your profile is ready. Start exploring programs that match your goals',
        actionLabel: 'Find programs',
        actionBg: 'bg-indigo-500 hover:bg-indigo-600',
        actionPath: '/app/programs',
        priority: 'medium',
      });
    }

    // Sort by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return notifs.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }, [applications, stats, taskSummary, completionData]);

  const urgentCount = notifications.filter((n) => n.priority === 'urgent').length;

  return {
    notifications,
    urgentCount,
  };
};
