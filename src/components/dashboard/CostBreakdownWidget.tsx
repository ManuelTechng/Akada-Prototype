import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Calculator, MapPin, Clock, BookOpen } from 'lucide-react'
import { 
  calculateProgramCosts, 
  getCostComparison, 
  getBudgetRecommendations,
  formatNGN,
  type CostBreakdown 
} from '../../lib/costCalculation'
import { useAuth } from '../../contexts/AuthContext'

interface CostBreakdownWidgetProps {
  programId?: string
  programIds?: string[]
  maxBudget?: number
  className?: string
}

export function CostBreakdownWidget({ 
  programId, 
  programIds, 
  maxBudget,
  className = '' 
}: CostBreakdownWidgetProps) {
  const { user } = useAuth()
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null)
  const [costComparison, setCostComparison] = useState<any>(null)
  const [budgetRecommendations, setBudgetRecommendations] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'breakdown' | 'comparison' | 'recommendations'>('breakdown')

  useEffect(() => {
    if (programId) {
      loadCostBreakdown()
    } else if (programIds && programIds.length > 1) {
      loadCostComparison()
    } else if (user && maxBudget) {
      loadBudgetRecommendations()
    }
  }, [programId, programIds, maxBudget, user])

  const loadCostBreakdown = async () => {
    if (!programId) return

    setLoading(true)
    setError(null)

    try {
      const breakdown = await calculateProgramCosts(programId)
      if (breakdown) {
        setCostBreakdown(breakdown)
      } else {
        setError('Unable to calculate costs for this program')
      }
    } catch (err) {
      setError('Error loading cost breakdown')
      console.error('Error loading cost breakdown:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadCostComparison = async () => {
    if (!programIds || programIds.length < 2) return

    setLoading(true)
    setError(null)

    try {
      const comparison = await getCostComparison(programIds)
      if (comparison) {
        setCostComparison(comparison)
        setView('comparison')
      } else {
        setError('Unable to compare costs for these programs')
      }
    } catch (err) {
      setError('Error loading cost comparison')
      console.error('Error loading cost comparison:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadBudgetRecommendations = async () => {
    if (!user || !maxBudget) return

    setLoading(true)
    setError(null)

    try {
      const recommendations = await getBudgetRecommendations(user.id, maxBudget)
      if (recommendations) {
        setBudgetRecommendations(recommendations)
        setView('recommendations')
      } else {
        setError('Unable to load budget recommendations')
      }
    } catch (err) {
      setError('Error loading budget recommendations')
      console.error('Error loading budget recommendations:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderCostBreakdown = () => {
    if (!costBreakdown) return null

    const { tuition, living, visa, application, total, breakdown } = costBreakdown

    return (
      <div className="space-y-4">
        {/* Total Cost */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Estimated Cost</h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatNGN(total.amountNGN)}
              </p>
              <p className="text-sm text-gray-600">
                {total.amount.toLocaleString()} {total.currency}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tuition */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Tuition Fees</h4>
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatNGN(tuition.amountNGN)}
            </p>
            <p className="text-sm text-gray-600">
              {breakdown.tuitionPercentage.toFixed(1)}% of total cost
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${breakdown.tuitionPercentage}%` }}
              />
            </div>
          </div>

          {/* Living Costs */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Living Costs</h4>
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatNGN(living.amountNGN)}
            </p>
            <p className="text-sm text-gray-600">
              {breakdown.livingPercentage.toFixed(1)}% of total cost
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${breakdown.livingPercentage}%` }}
              />
            </div>
          </div>

          {/* Visa Fees */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Visa Fees</h4>
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatNGN(visa.amountNGN)}
            </p>
            <p className="text-sm text-gray-600">
              {breakdown.visaPercentage.toFixed(1)}% of total cost
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${breakdown.visaPercentage}%` }}
              />
            </div>
          </div>

          {/* Application Fees */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Application Fees</h4>
              <Calculator className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatNGN(application.amountNGN)}
            </p>
            <p className="text-sm text-gray-600">
              {breakdown.applicationPercentage.toFixed(1)}% of total cost
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-orange-600 h-2 rounded-full" 
                style={{ width: `${breakdown.applicationPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Monthly Living Cost */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Monthly Living Cost</h4>
          <p className="text-lg font-semibold text-gray-900">
            {formatNGN(living.monthlyNGN)} per month
          </p>
          <p className="text-sm text-gray-600">
            Based on average living costs in {living.currency}
          </p>
        </div>
      </div>
    )
  }

  const renderCostComparison = () => {
    if (!costComparison) return null

    const { programs, summary } = costComparison

    return (
      <div className="space-y-4">
        {/* Summary */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost Comparison Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Cheapest</p>
              <p className="text-lg font-bold text-green-600">
                {formatNGN(programs.find((p: any) => p.id === summary.cheapest)?.totalCostNGN || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Most Expensive</p>
              <p className="text-lg font-bold text-red-600">
                {formatNGN(programs.find((p: any) => p.id === summary.mostExpensive)?.totalCostNGN || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Average</p>
              <p className="text-lg font-bold text-blue-600">
                {formatNGN(summary.averageCost)}
              </p>
            </div>
          </div>
        </div>

        {/* Programs List */}
        <div className="space-y-3">
          {programs.map((program: any, index: number) => (
            <div key={program.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{program.name}</h4>
                  <p className="text-sm text-gray-600">{program.university}, {program.country}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatNGN(program.totalCostNGN)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {program.totalCostOriginal.toLocaleString()} {program.currency}
                  </p>
                </div>
              </div>
              {index === 0 && (
                <div className="mt-2 flex items-center text-green-600 text-sm">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  Most affordable option
                </div>
              )}
              {index === programs.length - 1 && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Most expensive option
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderBudgetRecommendations = () => {
    if (!budgetRecommendations) return null

    const { affordable, stretch, expensive, recommendations } = budgetRecommendations

    return (
      <div className="space-y-4">
        {/* Budget Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Analysis</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{affordable.length}</p>
              <p className="text-sm text-gray-600">Affordable</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stretch.length}</p>
              <p className="text-sm text-gray-600">Stretch Budget</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{expensive.length}</p>
              <p className="text-sm text-gray-600">Over Budget</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Recommended Programs</h4>
            {recommendations.slice(0, 5).map((rec: any) => (
              <div key={rec.programId} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{rec.name}</h5>
                    <p className="text-sm text-gray-600">{rec.university}, {rec.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatNGN(rec.totalCostNGN)}
                    </p>
                    <p className="text-sm text-green-600">
                      Saves {formatNGN(rec.savings)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${100 - rec.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-red-200 p-6 ${className}`}>
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Cost Analysis</h2>
          <div className="flex space-x-2">
            {programId && (
              <button
                onClick={() => setView('breakdown')}
                className={`px-3 py-1 text-sm rounded-md ${
                  view === 'breakdown'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Breakdown
              </button>
            )}
            {programIds && programIds.length > 1 && (
              <button
                onClick={() => setView('comparison')}
                className={`px-3 py-1 text-sm rounded-md ${
                  view === 'comparison'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Compare
              </button>
            )}
            {budgetRecommendations && (
              <button
                onClick={() => setView('recommendations')}
                className={`px-3 py-1 text-sm rounded-md ${
                  view === 'recommendations'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Recommendations
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {view === 'breakdown' && renderCostBreakdown()}
        {view === 'comparison' && renderCostComparison()}
        {view === 'recommendations' && renderBudgetRecommendations()}
      </div>
    </div>
  )
}

