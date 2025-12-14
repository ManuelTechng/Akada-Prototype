import React, { useState, useEffect } from 'react'
import { 
  TrendingUpIcon, 
  AlertCircleIcon, 
  DollarSignIcon, 
  TrophyIcon,
  InfoIcon,
  ChevronRightIcon,
  BarChart3Icon,
  PiggyBankIcon,
  TargetIcon
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CircularProgress from '../ui/CircularProgress'
import SkeletonLoader from '../ui/SkeletonLoader'
import { useCostAnalysis } from '../../hooks/useDashboard'
import { formatNGN } from '../../utils/currency'
import { akadaTokens } from '../../styles/tokens'
import { cn } from '../../lib/utils'

interface CostInsight {
  type: 'budget_exceeded' | 'budget_tight' | 'budget_comfortable' | 'scholarship_available'
  message: string
  suggestion: string
  priority: 'high' | 'medium' | 'low'
  icon: React.ReactNode
  color: string
}

export const CostAnalysisWidget: React.FC<{ className?: string }> = ({ className }) => {
  const navigate = useNavigate()
  const { costData, loading, getBudgetInsights } = useCostAnalysis()
  const [insights, setInsights] = useState<CostInsight[]>([])
  const [isAnimating, setIsAnimating] = useState(false)

  // Process insights when data changes
  useEffect(() => {
    if (costData) {
      const budgetInsights = getBudgetInsights()
      const processedInsights: CostInsight[] = budgetInsights.map((insight: any) => {
        const iconMap = {
          budget_exceeded: <AlertCircleIcon className="w-4 h-4" />,
          budget_tight: <TargetIcon className="w-4 h-4" />,
          budget_comfortable: <PiggyBankIcon className="w-4 h-4" />,
          scholarship_available: <TrophyIcon className="w-4 h-4" />
        }

        const colorMap = {
          high: 'text-destructive',
          medium: 'text-chart-3',
          low: 'text-chart-1'
        }

        return {
          ...insight,
          icon: iconMap[insight.type as keyof typeof iconMap] || <InfoIcon className="w-4 h-4" />,
          color: colorMap[insight.priority as keyof typeof colorMap] || colorMap.medium
        }
      })
      
      setInsights(processedInsights)
      setIsAnimating(true)
    }
  }, [costData, getBudgetInsights])

  // Get budget utilization color
  const getBudgetUtilizationColor = (percentage: number) => {
    if (percentage <= 70) return akadaTokens.colors.status.success
    if (percentage <= 90) return akadaTokens.colors.status.warning
    if (percentage <= 100) return '#f59e0b' // Orange
    return akadaTokens.colors.status.error
  }

  // Get affordability status
  const getAffordabilityStatus = (budgetUtilization: number) => {
    if (budgetUtilization <= 70) return { text: 'Well within budget', color: 'text-chart-1' }
    if (budgetUtilization <= 90) return { text: 'Approaching limit', color: 'text-chart-3' }
    if (budgetUtilization <= 100) return { text: 'At budget limit', color: 'text-chart-3' }
    return { text: 'Over budget', color: 'text-destructive' }
  }

  // Calculate cost breakdown
  const getCostBreakdown = () => {
    if (!costData?.savedProgramsCosts.length) return []
    
    const totals = costData.savedProgramsCosts.reduce((acc, program) => {
      acc.tuition += program.breakdown.tuition
      acc.living += program.breakdown.living  
      acc.visa += program.breakdown.visa
      return acc
    }, { tuition: 0, living: 0, visa: 0 })

    const count = costData.savedProgramsCosts.length
    const avgTuition = totals.tuition / count
    const avgLiving = totals.living / count
    const avgVisa = totals.visa / count
    const total = avgTuition + avgLiving + avgVisa

    return [
      {
        category: 'Tuition',
        amount: avgTuition,
        percentage: total > 0 ? (avgTuition / total) * 100 : 0,
        color: 'hsl(var(--chart-2))'
      },
      {
        category: 'Living Costs',
        amount: avgLiving,
        percentage: total > 0 ? (avgLiving / total) * 100 : 0,
        color: 'hsl(var(--chart-1))'
      },
      {
        category: 'Visa Fees',
        amount: avgVisa,
        percentage: total > 0 ? (avgVisa / total) * 100 : 0,
        color: 'hsl(var(--chart-3))'
      }
    ].filter(item => item.amount > 0)
  }

  if (loading) {
    return <SkeletonLoader.DashboardWidget variant="stats" className={className} />
  }

  if (!costData?.budgetAnalysis) {
    return (
      <div className={cn(
        "bg-card rounded-lg border border-border p-4 sm:p-6",
        className
      )}>
        <div className="text-center py-8">
          <DollarSignIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Cost Data Available
          </h3>
          <p className="text-muted-foreground mb-4">
            Save some programs and set your budget to see cost analysis
          </p>
          <button
            onClick={() => navigate('/dashboard/search')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Search Programs
          </button>
        </div>
      </div>
    )
  }

  const { budgetAnalysis, scholarshipOpportunities } = costData
  const budgetColor = getBudgetUtilizationColor(budgetAnalysis.budgetUtilization)
  const affordabilityStatus = getAffordabilityStatus(budgetAnalysis.budgetUtilization)
  const costBreakdown = getCostBreakdown()

  return (
    <div
      className={cn(
        "bg-card rounded-lg border border-border p-4 sm:p-6 space-y-6",
        "transition-all duration-300 hover:shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3Icon className="w-5 h-5 text-primary" />
            Cost Analysis
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Budget utilization and breakdown
          </p>
        </div>
      </div>

      {/* Budget Overview Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-6">
          {/* Circular Progress */}
          <div className={cn(
            "transition-transform duration-500",
            isAnimating && "scale-110"
          )}>
            <CircularProgress
              percentage={Math.min(budgetAnalysis.budgetUtilization, 100)}
              size={100}
              strokeWidth={8}
              color={budgetColor}
            />
          </div>

          {/* Budget Stats */}
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">
                  Budget Utilization
                </span>
                <span className={cn("text-sm font-medium", affordabilityStatus.color)}>
                  {Math.round(budgetAnalysis.budgetUtilization)}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatNGN(budgetAnalysis.averageProgramCost, { compact: true })} of {formatNGN(budgetAnalysis.totalBudget, { compact: true })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-chart-1">
                  {budgetAnalysis.affordablePrograms}
                </div>
                <div className="text-xs text-muted-foreground">
                  Affordable Programs
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-chart-3">
                  {scholarshipOpportunities.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  With Scholarships
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Affordability Status */}
        <div className={cn(
          "p-3 rounded-md border text-center",
          budgetAnalysis.budgetUtilization <= 70
            ? "bg-chart-1/10 border-chart-1"
            : budgetAnalysis.budgetUtilization <= 100
            ? "bg-chart-3/10 border-chart-3"
            : "bg-destructive/10 border-destructive"
        )}>
          <div className={cn("font-medium", affordabilityStatus.color)}>
            {affordabilityStatus.text}
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      {costBreakdown.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">
            Average Cost Breakdown
          </h4>
          <div className="space-y-2">
            {costBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.category}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {formatNGN(item.amount, { compact: true, decimals: 0 })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(item.percentage)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Insights */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">
            Smart Insights
          </h4>
          <div className="space-y-2">
            {insights.slice(0, 2).map((insight, index) => (
              <div 
                key={index}
                className="p-3 bg-muted/50 rounded-md border border-border"
              >
                <div className="flex items-start space-x-2">
                  <div className={insight.color}>
                    {insight.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {insight.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {insight.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
        <button
          onClick={() => navigate('/programs/search')}
          className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <BarChart3Icon className="w-4 h-4" />
          <span>View Cost Comparison</span>
        </button>
        
        {scholarshipOpportunities.length > 0 && (
          <button
            onClick={() => navigate('/dashboard/search')}
            className="flex-1 bg-chart-1 text-primary-foreground px-4 py-2 rounded-md hover:bg-chart-1/90 transition-colors flex items-center justify-center gap-2"
          >
            <TrophyIcon className="w-4 h-4" />
            <span>View Scholarships</span>
          </button>
        )}
      </div>

      {/* Nigerian-specific savings tip */}
      {budgetAnalysis.budgetUtilization > 100 && (
        <div className="mt-4 p-3 bg-chart-2/10 rounded-md border border-chart-2">
          <div className="flex items-start space-x-2">
            <InfoIcon className="w-5 h-5 text-chart-2 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-chart-2">
                💡 Savings Tip for Nigerian Students
              </p>
              <p className="text-xs text-chart-2 mt-1">
                Consider programs in Germany or Canada - they offer quality education at 30-40% lower costs.
                Save ₦{formatNGN((budgetAnalysis.averageProgramCost - budgetAnalysis.totalBudget) / 24, { decimals: 0, includeSymbol: false })}/month for 2 years to bridge the gap.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CostAnalysisWidget 