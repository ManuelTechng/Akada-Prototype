import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useUserPreferences } from './usePreferences'

export interface CostBreakdownData {
  programId: string
  programName: string
  university: string
  country: string
  tuition: number
  living: number
  visa: number
  application: number
  total: number
  currency: string
  isAffordable: boolean
  scholarshipAvailable: boolean
}

export interface CountryComparisonData {
  country: string
  averageTuition: number
  averageLiving: number
  averageVisa: number
  averageTotal: number
  programCount: number
  scholarshipPrograms: number
  affordabilityRating: 'high' | 'medium' | 'low'
}

export interface BudgetAnalysisData {
  userBudget: number
  totalCost: number
  breakdown: {
    tuition: number
    living: number
    visa: number
    other: number
  }
  savings: {
    needed: number
    monthly: number
    timeline: number // months
  }
  recommendations: string[]
}

/**
 * Hook for cost visualization and chart data preparation
 * Optimized for Nigerian students studying abroad
 */
export const useCostVisualization = () => {
  const { user } = useAuth()
  const { preferences } = useUserPreferences()
  const [costBreakdowns, setCostBreakdowns] = useState<CostBreakdownData[]>([])
  const [countryComparisons, setCountryComparisons] = useState<CountryComparisonData[]>([])
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch and process cost data for visualizations
  const fetchCostVisualizationData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch user's saved programs with cost calculations
      const { data: savedPrograms, error: savedError } = await supabase
        .from('saved_programs')
        .select(`
          programs!inner(
            id, name, university, country, tuition_fee, duration,
            scholarship_available, application_fee
          )
        `)
        .eq('user_id', user.id)

      if (savedError) throw savedError

      // Get country cost estimates
      const countries = [...new Set(savedPrograms?.map(sp => sp.programs.country) || [])]
      const { data: countryEstimates, error: estimatesError } = await supabase
        .from('country_estimates')
        .select('*')
        .in('country', countries)

      if (estimatesError) throw estimatesError

      // Process cost breakdowns for each program
      const breakdowns: CostBreakdownData[] = savedPrograms?.map(sp => {
        const program = sp.programs
        const countryData = countryEstimates?.find(ce => ce.country === program.country)
        
        // Calculate duration in months
        const durationMonths = program.duration?.includes('year') ? 
          parseInt(program.duration) * 12 : 
          parseInt(program.duration?.replace(/[^\d]/g, '') || '24')

        const costs = {
          tuition: program.tuition_fee || 0,
          living: (countryData?.avg_monthly_living || 0) * durationMonths,
          visa: countryData?.student_visa_fee || 0,
          application: program.application_fee || 0
        }

        const total = Object.values(costs).reduce((sum, cost) => sum + cost, 0)
        const userBudget = preferences?.budgetRange || 0

        return {
          programId: program.id,
          programName: program.name,
          university: program.university,
          country: program.country,
          ...costs,
          total,
          currency: 'NGN',
          isAffordable: userBudget > 0 ? total <= userBudget : true,
          scholarshipAvailable: program.scholarship_available || false
        }
      }) || []

      setCostBreakdowns(breakdowns)

      // Process country comparisons
      const countryStats = countries.map(country => {
        const countryPrograms = breakdowns.filter(b => b.country === country)
        const countryEstimate = countryEstimates?.find(ce => ce.country === country)
        
        if (countryPrograms.length === 0) return null

        const avgTuition = countryPrograms.reduce((sum, p) => sum + p.tuition, 0) / countryPrograms.length
        const avgLiving = countryPrograms.reduce((sum, p) => sum + p.living, 0) / countryPrograms.length
        const avgVisa = countryEstimate?.student_visa_fee || 0
        const avgTotal = avgTuition + avgLiving + avgVisa

        // Affordability rating for Nigerian students
        let affordabilityRating: 'high' | 'medium' | 'low' = 'medium'
        const avgTotalUSD = avgTotal / 1500 // Convert to USD for comparison
        
        if (avgTotalUSD < 20000) affordabilityRating = 'high'
        else if (avgTotalUSD > 50000) affordabilityRating = 'low'

        return {
          country,
          averageTuition: avgTuition,
          averageLiving: avgLiving,
          averageVisa: avgVisa,
          averageTotal: avgTotal,
          programCount: countryPrograms.length,
          scholarshipPrograms: countryPrograms.filter(p => p.scholarshipAvailable).length,
          affordabilityRating
        }
      }).filter(Boolean) as CountryComparisonData[]

      setCountryComparisons(countryStats)

      // Budget analysis
      if (preferences?.budgetRange && breakdowns.length > 0) {
        const totalCost = breakdowns.reduce((sum, b) => sum + b.total, 0) / breakdowns.length
        const userBudget = preferences.budgetRange

        const budgetBreakdown = {
          tuition: breakdowns.reduce((sum, b) => sum + b.tuition, 0) / breakdowns.length,
          living: breakdowns.reduce((sum, b) => sum + b.living, 0) / breakdowns.length,
          visa: breakdowns.reduce((sum, b) => sum + b.visa, 0) / breakdowns.length,
          other: breakdowns.reduce((sum, b) => sum + b.application, 0) / breakdowns.length
        }

        // Savings calculations
        const shortfall = Math.max(0, totalCost - userBudget)
        const timeToSave = 24 // months - typical timeline for Nigerian students
        const monthlySavingsNeeded = shortfall / timeToSave

        // Generate recommendations
        const recommendations = []
        
        if (shortfall > 0) {
          recommendations.push(`Save ₦${Math.round(monthlySavingsNeeded).toLocaleString()} monthly for ${timeToSave} months`)
          
          const scholarshipPrograms = breakdowns.filter(b => b.scholarshipAvailable).length
          if (scholarshipPrograms > 0) {
            recommendations.push(`Apply for scholarships - ${scholarshipPrograms} programs offer funding`)
          }
          
          const affordableCountries = countryStats.filter(c => c.affordabilityRating === 'high')
          if (affordableCountries.length > 0) {
            recommendations.push(`Consider ${affordableCountries.map(c => c.country).join(', ')} for lower costs`)
          }
        } else {
          recommendations.push('Your budget is sufficient for your selected programs')
          recommendations.push('Consider adding more programs or premium options')
        }

        const analysis: BudgetAnalysisData = {
          userBudget,
          totalCost,
          breakdown: budgetBreakdown,
          savings: {
            needed: shortfall,
            monthly: monthlySavingsNeeded,
            timeline: timeToSave
          },
          recommendations
        }

        setBudgetAnalysis(analysis)
      }

    } catch (err) {
      console.error('Error fetching cost visualization data:', err)
      setError('Failed to load cost analysis data')
    } finally {
      setLoading(false)
    }
  }, [user?.id, preferences])

  // Get chart data for cost breakdown visualization
  const getCostBreakdownChartData = useCallback(() => {
    return costBreakdowns.map(breakdown => ({
      name: `${breakdown.university} (${breakdown.country})`,
      tuition: breakdown.tuition,
      living: breakdown.living,
      visa: breakdown.visa,
      application: breakdown.application,
      total: breakdown.total,
      affordable: breakdown.isAffordable
    }))
  }, [costBreakdowns])

  // Get chart data for country comparison
  const getCountryComparisonChartData = useCallback(() => {
    return countryComparisons.map(country => ({
      country: country.country,
      averageTotal: country.averageTotal,
      tuition: country.averageTuition,
      living: country.averageLiving,
      visa: country.averageVisa,
      programCount: country.programCount,
      scholarshipPrograms: country.scholarshipPrograms,
      affordabilityRating: country.affordabilityRating
    }))
  }, [countryComparisons])

  // Get budget utilization data for pie chart
  const getBudgetUtilizationData = useCallback(() => {
    if (!budgetAnalysis) return []

    const { breakdown, userBudget } = budgetAnalysis
    const totalAllocated = Object.values(breakdown).reduce((sum, val) => sum + val, 0)
    const remaining = Math.max(0, userBudget - totalAllocated)

    return [
      { name: 'Tuition', value: breakdown.tuition, color: '#4f46e5' },
      { name: 'Living Costs', value: breakdown.living, color: '#10b981' },
      { name: 'Visa Fees', value: breakdown.visa, color: '#f59e0b' },
      { name: 'Application Fees', value: breakdown.other, color: '#ef4444' },
      { name: 'Remaining Budget', value: remaining, color: '#6b7280' }
    ].filter(item => item.value > 0)
  }, [budgetAnalysis])

  // Get savings timeline data
  const getSavingsTimelineData = useCallback(() => {
    if (!budgetAnalysis || budgetAnalysis.savings.needed <= 0) return []

    const { monthly, timeline } = budgetAnalysis.savings
    const timelineData = []

    for (let month = 0; month <= timeline; month++) {
      timelineData.push({
        month,
        saved: month * monthly,
        target: budgetAnalysis.savings.needed,
        percentage: Math.min(100, (month * monthly / budgetAnalysis.savings.needed) * 100)
      })
    }

    return timelineData
  }, [budgetAnalysis])

  // Get insights for Nigerian students
  const getCostInsights = useCallback(() => {
    const insights = []

    // Most expensive cost category
    if (budgetAnalysis) {
      const { breakdown } = budgetAnalysis
      const maxCategory = Object.entries(breakdown).reduce((max, [key, value]) => 
        value > max.value ? { category: key, value } : max, 
        { category: '', value: 0 }
      )

      insights.push({
        type: 'cost_breakdown',
        message: `${maxCategory.category} represents your largest expense category`,
        detail: `₦${Math.round(maxCategory.value).toLocaleString()} on average`
      })
    }

    // Most affordable country
    if (countryComparisons.length > 0) {
      const mostAffordable = countryComparisons.reduce((min, country) => 
        country.averageTotal < min.averageTotal ? country : min
      )

      insights.push({
        type: 'country_comparison',
        message: `${mostAffordable.country} offers the most affordable option`,
        detail: `Average total cost: ₦${Math.round(mostAffordable.averageTotal).toLocaleString()}`
      })
    }

    // Scholarship opportunities
    const totalScholarshipPrograms = costBreakdowns.filter(b => b.scholarshipAvailable).length
    if (totalScholarshipPrograms > 0) {
      insights.push({
        type: 'scholarships',
        message: `${totalScholarshipPrograms} of your saved programs offer scholarships`,
        detail: 'Apply early to increase your chances of funding'
      })
    }

    // Budget efficiency
    if (budgetAnalysis && budgetAnalysis.savings.needed <= 0) {
      insights.push({
        type: 'budget_efficient',
        message: 'Your budget efficiently covers your program choices',
        detail: 'Consider adding more programs or upgrading to premium options'
      })
    }

    return insights
  }, [budgetAnalysis, countryComparisons, costBreakdowns])

  useEffect(() => {
    fetchCostVisualizationData()
  }, [fetchCostVisualizationData])

  return {
    costBreakdowns,
    countryComparisons,
    budgetAnalysis,
    loading,
    error,
    refetchCostData: fetchCostVisualizationData,
    
    // Chart data methods
    getCostBreakdownChartData,
    getCountryComparisonChartData,
    getBudgetUtilizationData,
    getSavingsTimelineData,
    getCostInsights,

    // Utility methods
    formatCurrency: (amount: number) => `₦${Math.round(amount).toLocaleString()}`,
    convertToUSD: (ngnAmount: number) => ngnAmount / 1500,
    
    // Quick stats
    totalPrograms: costBreakdowns.length,
    averageCost: costBreakdowns.length > 0 ? 
      costBreakdowns.reduce((sum, b) => sum + b.total, 0) / costBreakdowns.length : 0,
    affordablePrograms: costBreakdowns.filter(b => b.isAffordable).length
  }
}

export default useCostVisualization
