import { GlassMetricCard } from './GlassMetricCard';

interface Metric {
  value: string | number;
  label: string;
  accentColor: string;
}

interface GlassStatsGridProps {
  metrics?: Metric[];
}

const defaultMetrics: Metric[] = [
  { 
    value: '100%', 
    label: 'Profile Complete',
    accentColor: 'green'
  },
  { 
    value: '0', 
    label: 'Urgent Deadlines',
    accentColor: 'blue'
  },
  { 
    value: '5', 
    label: 'Program Matches',
    accentColor: 'purple'
  },
  { 
    value: 'Set', 
    label: 'Budget Status',
    accentColor: 'orange'
  },
];

export function GlassStatsGrid({ metrics = defaultMetrics }: GlassStatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {metrics.map((metric, index) => (
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



