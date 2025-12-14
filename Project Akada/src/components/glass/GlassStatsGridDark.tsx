import { GlassMetricCardDark } from './GlassMetricCardDark';
import { useUserProgressStats } from '../../hooks/useUserProgressStats';
import { useProfileCompletion } from '../../hooks/useDashboard';

export function GlassStatsGridDark() {
  const { stats, loading: statsLoading } = useUserProgressStats();
  const { completionData, loading: profileLoading } = useProfileCompletion();

  const metrics = [
    {
      value: profileLoading ? '...' : `${completionData?.percentage || 0}%`,
      label: 'Profile Complete',
      accentColor: 'green'
    },
    {
      value: statsLoading ? '...' : stats.upcomingDeadlines,
      label: 'Urgent Deadlines',
      accentColor: 'blue'
    },
    {
      value: statsLoading ? '...' : stats.totalApplications,
      label: 'Applications',
      accentColor: 'purple'
    },
    {
      value: statsLoading ? '...' : `${stats.completionRate}%`,
      label: 'Completion Rate',
      accentColor: 'orange'
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {metrics.map((metric, index) => (
        <GlassMetricCardDark
          key={index}
          value={metric.value}
          label={metric.label}
          accentColor={metric.accentColor}
        />
      ))}
    </div>
  );
}