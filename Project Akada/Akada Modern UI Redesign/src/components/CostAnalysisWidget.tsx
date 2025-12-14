import { Card } from './ui/card';
import { Button } from './ui/button';
import { BarChart3, TrendingUp, Trophy } from 'lucide-react';

const costBreakdown = [
  { label: 'Tuition', amount: '₦902K', percentage: 98, color: 'bg-purple-500' },
  { label: 'Living Costs', amount: '₦19K', percentage: 2, color: 'bg-green-500' },
  { label: 'Visa Fees', amount: '₦328', percentage: 0, color: 'bg-orange-500' },
];

export function CostAnalysisWidget() {
  const budgetUtilization = 1;
  const budgetUsed = '₦920.8K';
  const budgetTotal = '₦75M';

  return (
    <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <h3 className="text-white">Cost Analysis</h3>
        </div>
        <p className="text-sm text-gray-400">Budget utilization and breakdown</p>
      </div>

      {/* Budget Utilization */}
      <div className="mb-4">
        <div className="flex items-start gap-6">
          {/* Circular Progress */}
          <div className="relative">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-800"
              />
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 48}`}
                strokeDashoffset={`${2 * Math.PI * 48 * (1 - budgetUtilization / 100)}`}
                className="text-green-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl text-white">{budgetUtilization}%</span>
            </div>
          </div>

          {/* Budget Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-white mb-1">Budget Utilization</h4>
                <p className="text-sm text-gray-400">{budgetUsed} of {budgetTotal}</p>
              </div>
              <span className="text-2xl text-green-400">{budgetUtilization}%</span>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl text-green-400 mb-1">4</div>
                <div className="text-xs text-gray-400">Affordable Programs</div>
              </div>
              <div>
                <div className="text-2xl text-yellow-400 mb-1">3</div>
                <div className="text-xs text-gray-400">With Scholarships</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="mb-6 p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-center">
        <p className="text-green-400">Well within budget</p>
      </div>

      {/* Average Cost Breakdown */}
      <div className="mb-6">
        <h4 className="text-white mb-4">Average Cost Breakdown</h4>
        <div className="space-y-3">
          {costBreakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm text-gray-300">{item.label}</span>
              </div>
              <div className="text-right">
                <div className="text-white">{item.amount}</div>
                <div className="text-xs text-gray-400">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Insights */}
      <div className="mb-6">
        <h4 className="text-white mb-3">Smart Insights</h4>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-gray-800/50 border border-white/5">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-white mb-1">You have budget room for additional programs</p>
                <p className="text-xs text-gray-400">Consider premium programs or longer durations</p>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gray-800/50 border border-white/5">
            <div className="flex items-start gap-3">
              <Trophy className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-white mb-1">3 scholarship opportunities in your saved programs</p>
                <p className="text-xs text-gray-400">Apply for scholarships to reduce costs significantly</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-auto py-2 px-3">
          <BarChart3 className="w-4 h-4 mr-1.5 shrink-0" />
          <span className="text-xs leading-tight">View Cost Comparison</span>
        </Button>
        <Button className="bg-green-600 hover:bg-green-700 text-white h-auto py-2 px-3">
          <Trophy className="w-4 h-4 mr-1.5 shrink-0" />
          <span className="text-xs leading-tight">View Scholarships</span>
        </Button>
      </div>
    </Card>
  );
}
