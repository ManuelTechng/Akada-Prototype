import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { BarChart3, TrendingUp, Trophy } from 'lucide-react';

const costBreakdown = [
  { label: 'Tuition', amount: '₦902K', percentage: 98, color: 'bg-indigo-400' },
  { label: 'Living Costs', amount: '₦19K', percentage: 2, color: 'bg-emerald-400' },
  { label: 'Visa Fees', amount: '₦328', percentage: 0, color: 'bg-amber-400' },
];

const cardClass =
  'relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-lg shadow-slate-200/40 dark:border-white/10 dark:bg-gradient-to-br dark:from-[#151f42]/95 dark:via-[#0b1328]/95 dark:to-[#060b18]/95 dark:shadow-[0_28px_60px_-28px_rgba(7,12,28,0.85)]';

export function CostAnalysisWidget() {
  const budgetUtilization = 1;
  const budgetUsed = '₦920.8K';
  const budgetTotal = '₦75M';

  return (
    <Card className={`${cardClass} p-5 sm:p-6`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-indigo-500 dark:text-indigo-300" />
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Cost Analysis</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300/80">Budget utilization and breakdown</p>
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
                className="text-slate-200/40 dark:text-slate-800/70"
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
                className="text-emerald-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-semibold text-slate-900 dark:text-white">{budgetUtilization}%</span>
            </div>
          </div>

          {/* Budget Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Budget Utilization</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300/80">{budgetUsed} of {budgetTotal}</p>
              </div>
              <span className="text-2xl font-semibold text-emerald-500">{budgetUtilization}%</span>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl font-semibold text-emerald-500 mb-1">4</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Affordable Programs</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-amber-400 mb-1">3</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">With Scholarships</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="mb-6 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-center dark:border-emerald-500/40 dark:bg-emerald-500/20">
        <p className="text-emerald-500 font-medium">Well within budget</p>
      </div>

      {/* Average Cost Breakdown */}
      <div className="mb-6">
        <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Average Cost Breakdown</h4>
        <div className="space-y-3">
          {costBreakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm text-slate-600 dark:text-slate-200">{item.label}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.amount}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Insights */}
      <div className="mb-6">
        <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-3">Smart Insights</h4>
        <div className="space-y-3">
          <div className="p-4 rounded-2xl border border-slate-200/60 bg-slate-100/60 dark:border-white/8 dark:bg-[#182448]/80">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">You have budget room for additional programs</p>
                <p className="text-xs text-slate-600 dark:text-slate-300/80">Consider premium programs or longer durations</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200/60 bg-slate-100/60 dark:border-white/8 dark:bg-[#182448]/80">
            <div className="flex items-start gap-3">
              <Trophy className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">3 scholarship opportunities in your saved programs</p>
                <p className="text-xs text-slate-600 dark:text-slate-300/80">Apply for scholarships to reduce costs significantly</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white h-auto py-3 px-4 text-sm font-medium shadow-[0_18px_36px_-20px_rgba(54,88,182,0.75)]">
          <BarChart3 className="w-4 h-4 mr-2 shrink-0" />
          <span>View Cost Comparison</span>
        </Button>
        <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white h-auto py-3 px-4 text-sm font-medium shadow-[0_18px_36px_-20px_rgba(24,160,112,0.65)]">
          <Trophy className="w-4 h-4 mr-2 shrink-0" />
          <span>View Scholarships</span>
        </Button>
      </div>
    </Card>
  );
}

