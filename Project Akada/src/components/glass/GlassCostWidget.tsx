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
import { useTheme } from '../../contexts/ThemeContext'

interface CostInsight {
  type: 'budget_exceeded' | 'budget_tight' | 'budget_comfortable' | 'scholarship_available'
  message: string
  suggestion: string
  priority: 'high' | 'medium' | 'low'
  icon: React.ReactNode
  color: string
}

export const GlassCostWidget: React.FC<{ className?: string }> = ({ className }) => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
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
          high: 'text-red-600 dark:text-red-400',
          medium: 'text-orange-600 dark:text-orange-400', 
          low: 'text-green-600 dark:text-green-400'
        }

        return {
          type: insight.type,
          message: insight.message,
          suggestion: insight.suggestion,
          priority: insight.priority,
          icon: iconMap[insight.type as keyof typeof iconMap] || <InfoIcon className="w-4 h-4" />,
          color: colorMap[insight.priority as keyof typeof colorMap] || colorMap.low
        }
      })
      
      setInsights(processedInsights)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)
    }
  }, [costData, getBudgetInsights])

  // Get budget health color
  const getBudgetHealthColor = (percentage: number) => {
    if (percentage >= 80) return akadaTokens.colors.status.error
    if (percentage >= 60) return akadaTokens.colors.status.warning
    return akadaTokens.colors.status.success
  }

  // Get budget health message
  const getBudgetHealthMessage = (percentage: number) => {
    if (percentage >= 80) return "Budget Exceeded"
    if (percentage >= 60) return "Budget Tight"
    return "Budget Healthy"
  }

  if (loading) {
    return <SkeletonLoader.DashboardWidget variant="stats" className={className} />
  }

  if (!costData) {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-2xl backdrop-blur-xl border p-6 text-center",
        isDark 
          ? 'bg-gray-900/40 border-white/10' 
          : 'bg-white/80 border-gray-200',
        className
      )}>
        <div className="relative z-10">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Cost Data Available
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Save some programs to analyze your costs
          </p>
          <button
            onClick={() => navigate('/dashboard/search')}
            className="bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            Explore Programs
          </button>
        </div>
      </div>
    )
  }

  const budgetHealthPercentage = costData.budgetAnalysis?.budgetUtilization || 0
  const totalCost = costData.budgetAnalysis?.totalBudget || 0
  const savedProgramsCount = costData.savedProgramsCosts?.length || 0
  const scholarshipCount = costData.scholarshipOpportunities?.length || 0

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl backdrop-blur-xl border p-6 space-y-4",
      isDark 
        ? 'bg-gray-900/40 border-white/10' 
        : 'bg-white/80 border-gray-200',
      className
    )}>
      {/* Glass effect overlay */}
      <div className={cn(
        "absolute inset-0",
        isDark 
          ? 'bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20' 
          : 'bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50'
      )} />
      
      {/* Header */}
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
          Cost Analysis
          <BarChart3Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Budget utilization and breakdown
        </p>
      </div>

      {/* Budget Utilization Section */}
      <div className="relative z-10 mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Budget Utilization
        </h4>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <CircularProgress
              size={80}
              strokeWidth={6}
              percentage={budgetHealthPercentage}
              color={getBudgetHealthColor(budgetHealthPercentage)}
              className="transition-all duration-500"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {budgetHealthPercentage}%
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formatNGN(totalCost)} of {formatNGN(totalCost * 100 / Math.max(budgetHealthPercentage, 1))}
            </div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
              {budgetHealthPercentage}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {savedProgramsCount} Affordable Programs
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {scholarshipCount} With Scholarships
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                Well within budget
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="relative z-10 space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Cost Breakdown
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Cost</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatNGN(totalCost)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Saved Programs</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {savedProgramsCount}
            </span>
          </div>
          
          {scholarshipCount > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Scholarships Available</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {scholarshipCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="relative z-10 space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Smart Insights
          </h4>
          <div className="space-y-2">
            {insights.slice(0, 2).map((insight, index) => {
              // Get border and icon background colors based on priority/type
              const getBorderColor = () => {
                if (insight.priority === 'high') return 'border-l-4 border-l-red-500'
                if (insight.priority === 'medium') return 'border-l-4 border-l-orange-500'
                return 'border-l-4 border-l-green-500'
              }

              const getIconBackground = () => {
                if (insight.priority === 'high')
                  return isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                if (insight.priority === 'medium')
                  return isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'
                return isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
              }

              const getCardBackground = () => {
                if (insight.priority === 'high')
                  return isDark ? 'bg-gray-800/40 border-gray-700' : 'bg-red-50/40 border-red-100'
                if (insight.priority === 'medium')
                  return isDark ? 'bg-gray-800/40 border-gray-700' : 'bg-orange-50/40 border-orange-100'
                return isDark ? 'bg-gray-800/40 border-gray-700' : 'bg-green-50/40 border-green-100'
              }

              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-start space-x-3 p-3 rounded-lg backdrop-blur-sm border",
                    getBorderColor(),
                    getCardBackground()
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                    getIconBackground()
                  )}>
                    {insight.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {insight.message}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {insight.suggestion}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="relative z-10 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/dashboard/calculator')}
            className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <BarChart3Icon className="w-4 h-4" />
            <span>Calculator</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/scholarships')}
            className="flex items-center space-x-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <TrophyIcon className="w-4 h-4" />
            <span>Scholarships</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default GlassCostWidget
