import { Card } from './ui/card';
import { Progress } from './ui/progress';

interface StatItem {
  label: string;
  value: number;
  total: number;
  color: string;
}

const stats: StatItem[] = [
  { label: 'Profile Completion', value: 100, total: 100, color: 'bg-green-500' },
  { label: 'Applications Submitted', value: 18, total: 25, color: 'bg-indigo-500' },
  { label: 'Documents Ready', value: 12, total: 15, color: 'bg-purple-500' },
  { label: 'Recommendations', value: 3, total: 5, color: 'bg-blue-500' },
];

export function QuickStatsCard() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg text-gray-900 mb-1">Quick Stats</h3>
        <p className="text-sm text-gray-500">Application readiness overview</p>
      </div>

      <div className="space-y-5">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">{stat.label}</span>
              <span className="text-sm text-gray-500">
                {stat.value}/{stat.total}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${stat.color} rounded-full transition-all`}
                style={{ width: `${(stat.value / stat.total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
