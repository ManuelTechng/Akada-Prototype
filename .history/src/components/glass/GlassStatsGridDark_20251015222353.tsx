import { GlassMetricCardDark } from './GlassMetricCardDark';

const metrics = [
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

export function GlassStatsGridDark() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 xl:gap-7">
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