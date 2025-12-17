import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { BarChart3, TrendingUp, Trophy } from 'lucide-react';
import { useCostAnalysis } from '../../hooks/useDashboard';
import { useNavigate } from 'react-router-dom';
import { formatNGN } from '../../utils/currency';

export function CostAnalysisWidget() {
  const navigate = useNavigate();
  const { costData, loading, getBudgetInsights } = useCostAnalysis();

  if (loading) {
    return (
      <Card className="figma-card">
        <div className="figma-card-content">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="flex gap-4">
              <div className="h-28 w-28 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (!costData || !costData.budgetAnalysis) {
    return (
      <Card className="figma-card">
        <div className="figma-card-content">
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-sm figma-text-secondary mb-4">No cost data available</p>
            <Button
              onClick={() => navigate('/app/programs')}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Save Programs
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const { budgetAnalysis, savedProgramsCosts, scholarshipOpportunities } = costData;
  const budgetUtilization = Math.round(budgetAnalysis.budgetUtilization);
  const budgetUsed = formatNGN(budgetAnalysis.averageProgramCost);
  const budgetTotal = formatNGN(budgetAnalysis.totalBudget);
  const insights = getBudgetInsights();

  // Calculate cost breakdown
  const totalTuition = savedProgramsCosts.reduce((sum, p) => sum + (p.breakdown?.tuition || 0), 0);
  const totalLiving = savedProgramsCosts.reduce((sum, p) => sum + (p.breakdown?.living || 0), 0);
  const totalVisa = savedProgramsCosts.reduce((sum, p) => sum + (p.breakdown?.visa || 0), 0);
  const grandTotal = totalTuition + totalLiving + totalVisa;

  const costBreakdown = [
    {
      label: 'Tuition',
      amount: formatNGN(totalTuition),
      percentage: grandTotal > 0 ? Math.round((totalTuition / grandTotal) * 100) : 0,
      color: 'bg-indigo-400'
    },
    {
      label: 'Living Costs',
      amount: formatNGN(totalLiving),
      percentage: grandTotal > 0 ? Math.round((totalLiving / grandTotal) * 100) : 0,
      color: 'bg-emerald-400'
    },
    {
      label: 'Visa Fees',
      amount: formatNGN(totalVisa),
      percentage: grandTotal > 0 ? Math.round((totalVisa / grandTotal) * 100) : 0,
      color: 'bg-amber-400'
    },
  ];

  return (
    <Card className="figma-card">
      <div className="figma-card-content">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-indigo-500 dark:text-indigo-300" />
            <h3 className="text-lg font-semibold figma-text-primary">Cost Analysis</h3>
          </div>
          <p className="text-sm figma-text-secondary">Budget utilization and breakdown</p>
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
                  className="text-gray-800 dark:text-gray-800"
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
                <span className="text-2xl font-semibold figma-text-primary">{budgetUtilization}%</span>
              </div>
            </div>

            {/* Budget Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-base font-semibold figma-text-primary mb-1">Budget Utilization</h4>
                  <p className="text-sm figma-text-secondary">{budgetUsed} of {budgetTotal}</p>
                </div>
                <span className="text-2xl font-semibold text-emerald-500">{budgetUtilization}%</span>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <div className="text-2xl font-semibold text-emerald-500 mb-1">{budgetAnalysis.affordablePrograms}</div>
                  <div className="text-xs figma-text-secondary">Affordable Programs</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-amber-400 mb-1">{scholarshipOpportunities.length}</div>
                  <div className="text-xs figma-text-secondary">With Scholarships</div>
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
          <h4 className="text-base font-semibold figma-text-primary mb-4">Average Cost Breakdown</h4>
          <div className="space-y-3">
            {costBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm figma-text-primary">{item.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold figma-text-primary">{item.amount}</div>
                  <div className="text-xs figma-text-secondary">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Insights */}
        {insights.length > 0 && (
          <div className="mb-6">
            <h4 className="text-base font-semibold figma-text-primary mb-3">Smart Insights</h4>
            <div className="space-y-3">
              {insights.slice(0, 2).map((insight, index) => {
                const isHighPriority = insight.priority === 'high';
                const isMediumPriority = insight.priority === 'medium';
                const borderColor = isHighPriority
                  ? 'border-l-red-500'
                  : isMediumPriority
                  ? 'border-l-orange-500'
                  : 'border-l-green-500';
                const bgColor = isHighPriority
                  ? 'bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800/30'
                  : isMediumPriority
                  ? 'bg-orange-50/80 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/30'
                  : 'bg-green-50/80 dark:bg-green-900/20 border-green-200 dark:border-green-800/30';
                const iconBg = isHighPriority
                  ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                  : isMediumPriority
                  ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400'
                  : 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400';
                const Icon = insight.type === 'scholarship_available' ? Trophy : TrendingUp;

                return (
                  <div key={index} className={`p-3 rounded-lg border border-l-4 ${borderColor} ${bgColor}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium figma-text-primary mb-1">{insight.message}</p>
                        <p className="text-xs figma-text-secondary">{insight.suggestion}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Button
            onClick={() => navigate('/app/calculator')}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all shadow-none !px-2 sm:!px-4"
          >
            <BarChart3 className="w-4 h-4 mr-1 sm:mr-2 shrink-0" />
            <span className="text-xs sm:text-sm">Cost Comparison</span>
          </Button>
          <Button
            onClick={() => navigate('/app/scholarships')}
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all shadow-none !px-2 sm:!px-4"
          >
            <Trophy className="w-4 h-4 mr-1 sm:mr-2 shrink-0" />
            <span className="text-xs sm:text-sm">Scholarships</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}


