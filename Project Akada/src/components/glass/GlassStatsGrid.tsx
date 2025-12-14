import { GlassMetricCard } from './GlassMetricCard';
import { useUserProgressStats } from '../../hooks/useUserProgressStats';
import { useProfileCompletion } from '../../hooks/useDashboard';

interface Metric {
  value: string | number;
  label: string;
  accentColor: string;
}

interface GlassStatsGridProps {
  metrics?: Metric[];
}

export function GlassStatsGrid({ metrics }: GlassStatsGridProps) {
  const { stats, loading: statsLoading } = useUserProgressStats();
  const { completionData, loading: profileLoading } = useProfileCompletion();

  // Use provided metrics or generate from real data
  const displayMetrics: Metric[] = metrics || [
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
      {displayMetrics.map((metric, index) => (
        <GlassMetricCard
          key={index}
          value={metric.value}
          label={metric.label}
          accentColor={metric.accentColor}
        />
      ))}
    </div>
  );
}



