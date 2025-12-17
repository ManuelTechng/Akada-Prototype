import { Card } from './ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  subtitle?: string;
  trend?: 'up' | 'down';
}

export function MetricCard({ title, value, change, subtitle, trend }: MetricCardProps) {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm text-gray-500">{title}</span>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className="text-3xl text-gray-900 mb-2">{value}</div>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </Card>
  );
}
