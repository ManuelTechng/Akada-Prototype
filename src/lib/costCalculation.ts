import { supabase } from './supabase'
import { convertCurrency } from './currency'

export interface CostBreakdown {
  tuition: {
    amount: number
    currency: string
    amountNGN: number
  }
  living: {
    amount: number
    currency: string
    amountNGN: number
    monthly: number
    monthlyNGN: number
  }
  visa: {
    amount: number
    currency: string
    amountNGN: number
  }
  application: {
    amount: number
    currency: string
    amountNGN: number
  }
  total: {
    amount: number
    currency: string
    amountNGN: number
  }
  breakdown: {
    tuitionPercentage: number
    livingPercentage: number
    visaPercentage: number
    applicationPercentage: number
  }
}

export interface CountryCostData {
  country: string
  currency: string
  avgMonthlyLiving: number
  studentVisaFee: number
  livingCostRange: {
    min: number
    max: number
  }
  notes?: string
  lastUpdated: string
}

export interface ProgramCostData {
  id: string
  name: string
  university: string
  country: string
  tuitionFee: number
  tuitionFeeCurrency: string
  applicationFee: number
  applicationFeeCurrency: string
  duration: string
  degreeType: string
  specialization: string
}

/**
 * Get country cost data
 */
export async function getCountryCostData(country: string): Promise<CountryCostData | null> {
  try {
    const { data, error } = await supabase
      .from('country_estimates')
      .select('*')
      .eq('country', country)
      .single()

    if (error) {
      console.error('Error fetching country cost data:', error)
      return null
    }

    return {
      country: data.country,
      currency: data.currency,
      avgMonthlyLiving: data.avg_monthly_living,
      studentVisaFee: data.student_visa_fee,
      livingCostRange: {
        min: data.living_cost_range_min || data.avg_monthly_living * 0.8,
        max: data.living_cost_range_max || data.avg_monthly_living * 1.2
      },
      notes: data.notes,
      lastUpdated: data.last_updated
    }
  } catch (error) {
    console.error('Error fetching country cost data:', error)
    return null
  }
}

/**
 * Get program cost data
 */
export async function getProgramCostData(programId: string): Promise<ProgramCostData | null> {
  try {
    const { data, error } = await supabase
      .from('programs')
      .select(`
        id,
        name,
        university,
        country,
        tuition_fee,
        tuition_fee_currency,
        application_fee,
        application_fee_currency,
        duration,
        degree_type,
        specialization
      `)
      .eq('id', programId)
      .single()

    if (error) {
      console.error('Error fetching program cost data:', error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      university: data.university,
      country: data.country,
      tuitionFee: data.tuition_fee,
      tuitionFeeCurrency: data.tuition_fee_currency,
      applicationFee: data.application_fee || 0,
      applicationFeeCurrency: data.application_fee_currency || data.tuition_fee_currency,
      duration: data.duration,
      degreeType: data.degree_type,
      specialization: data.specialization
    }
  } catch (error) {
    console.error('Error fetching program cost data:', error)
    return null
  }
}

/**
 * Calculate comprehensive cost breakdown for a program
 */
export async function calculateProgramCosts(
  programId: string,
  durationInMonths?: number
): Promise<CostBreakdown | null> {
  try {
    const programData = await getProgramCostData(programId)
    if (!programData) return null

    const countryData = await getCountryCostData(programData.country)
    if (!countryData) return null

    // Calculate duration in months if not provided
    const duration = durationInMonths || calculateDurationInMonths(programData.duration)

    // Convert all amounts to NGN
    const tuitionNGN = await convertCurrency(
      programData.tuitionFee,
      programData.tuitionFeeCurrency,
      'NGN'
    )

    const applicationFeeNGN = await convertCurrency(
      programData.applicationFee,
      programData.applicationFeeCurrency,
      'NGN'
    )

    const livingCostNGN = await convertCurrency(
      countryData.avgMonthlyLiving,
      countryData.currency,
      'NGN'
    )

    const visaFeeNGN = await convertCurrency(
      countryData.studentVisaFee,
      countryData.currency,
      'NGN'
    )

    // Calculate totals
    const totalLivingCost = livingCostNGN * duration
    const totalCost = tuitionNGN + totalLivingCost + visaFeeNGN + applicationFeeNGN

    // Calculate percentages
    const tuitionPercentage = (tuitionNGN / totalCost) * 100
    const livingPercentage = (totalLivingCost / totalCost) * 100
    const visaPercentage = (visaFeeNGN / totalCost) * 100
    const applicationPercentage = (applicationFeeNGN / totalCost) * 100

    return {
      tuition: {
        amount: programData.tuitionFee,
        currency: programData.tuitionFeeCurrency,
        amountNGN: tuitionNGN
      },
      living: {
        amount: countryData.avgMonthlyLiving,
        currency: countryData.currency,
        amountNGN: livingCostNGN,
        monthly: countryData.avgMonthlyLiving,
        monthlyNGN: livingCostNGN
      },
      visa: {
        amount: countryData.studentVisaFee,
        currency: countryData.currency,
        amountNGN: visaFeeNGN
      },
      application: {
        amount: programData.applicationFee,
        currency: programData.applicationFeeCurrency,
        amountNGN: applicationFeeNGN
      },
      total: {
        amount: totalCost / (await convertCurrency(1, 'NGN', programData.tuitionFeeCurrency)),
        currency: programData.tuitionFeeCurrency,
        amountNGN: totalCost
      },
      breakdown: {
        tuitionPercentage,
        livingPercentage,
        visaPercentage,
        applicationPercentage
      }
    }
  } catch (error) {
    console.error('Error calculating program costs:', error)
    return null
  }
}

/**
 * Calculate duration in months from duration string
 */
function calculateDurationInMonths(duration: string): number {
  const durationLower = duration.toLowerCase()
  
  // Extract number and unit
  const match = durationLower.match(/(\d+(?:\.\d+)?)\s*(year|month|semester|term)s?/)
  if (!match) return 12 // Default to 1 year

  const value = parseFloat(match[1])
  const unit = match[2]

  switch (unit) {
    case 'year':
    case 'years':
      return Math.round(value * 12)
    case 'month':
    case 'months':
      return Math.round(value)
    case 'semester':
    case 'semesters':
      return Math.round(value * 6) // Assume 6 months per semester
    case 'term':
    case 'terms':
      return Math.round(value * 4) // Assume 4 months per term
    default:
      return 12
  }
}

/**
 * Get cost comparison for multiple programs
 */
export async function getCostComparison(programIds: string[]): Promise<{
  programs: Array<{
    id: string
    name: string
    university: string
    country: string
    totalCostNGN: number
    totalCostOriginal: number
    currency: string
    breakdown: CostBreakdown
  }>
  summary: {
    cheapest: string
    mostExpensive: string
    averageCost: number
    costRange: {
      min: number
      max: number
    }
  }
} | null> {
  try {
    const programCosts = await Promise.all(
      programIds.map(async (programId) => {
        const breakdown = await calculateProgramCosts(programId)
        const programData = await getProgramCostData(programId)
        
        if (!breakdown || !programData) return null

        return {
          id: programId,
          name: programData.name,
          university: programData.university,
          country: programData.country,
          totalCostNGN: breakdown.total.amountNGN,
          totalCostOriginal: breakdown.total.amount,
          currency: breakdown.total.currency,
          breakdown
        }
      })
    )

    const validCosts = programCosts.filter(Boolean)
    if (validCosts.length === 0) return null

    // Sort by cost
    validCosts.sort((a, b) => a!.totalCostNGN - b!.totalCostNGN)

    const costs = validCosts.map(c => c!.totalCostNGN)
    const averageCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length

    return {
      programs: validCosts as any,
      summary: {
        cheapest: validCosts[0]!.id,
        mostExpensive: validCosts[validCosts.length - 1]!.id,
        averageCost,
        costRange: {
          min: Math.min(...costs),
          max: Math.max(...costs)
        }
      }
    }
  } catch (error) {
    console.error('Error getting cost comparison:', error)
    return null
  }
}

/**
 * Get budget recommendations based on user preferences
 */
export async function getBudgetRecommendations(
  userId: string,
  maxBudgetNGN: number
): Promise<{
  affordable: string[]
  stretch: string[]
  expensive: string[]
  recommendations: Array<{
    programId: string
    name: string
    university: string
    country: string
    totalCostNGN: number
    savings: number
    percentage: number
  }>
} | null> {
  try {
    // Get user's saved programs
    const { data: savedPrograms, error } = await supabase
      .from('saved_programs')
      .select(`
        program_id,
        programs!inner(
          id,
          name,
          university,
          country,
          tuition_fee,
          tuition_fee_currency,
          application_fee,
          application_fee_currency,
          duration
        )
      `)
      .eq('user_id', userId)

    if (error || !savedPrograms) {
      console.error('Error fetching saved programs:', error)
      return null
    }

    const programCosts = await Promise.all(
      savedPrograms.map(async (saved) => {
        const breakdown = await calculateProgramCosts(saved.program_id)
        if (!breakdown) return null

        return {
          programId: saved.program_id,
          name: saved.programs.name,
          university: saved.programs.university,
          country: saved.programs.country,
          totalCostNGN: breakdown.total.amountNGN,
          savings: maxBudgetNGN - breakdown.total.amountNGN,
          percentage: (breakdown.total.amountNGN / maxBudgetNGN) * 100
        }
      })
    )

    const validCosts = programCosts.filter(Boolean) as any[]
    
    // Categorize by budget
    const affordable = validCosts.filter(c => c.totalCostNGN <= maxBudgetNGN * 0.8)
    const stretch = validCosts.filter(c => 
      c.totalCostNGN > maxBudgetNGN * 0.8 && c.totalCostNGN <= maxBudgetNGN * 1.2
    )
    const expensive = validCosts.filter(c => c.totalCostNGN > maxBudgetNGN * 1.2)

    // Sort by savings (most savings first)
    const recommendations = validCosts
      .filter(c => c.totalCostNGN <= maxBudgetNGN)
      .sort((a, b) => b.savings - a.savings)

    return {
      affordable: affordable.map(c => c.programId),
      stretch: stretch.map(c => c.programId),
      expensive: expensive.map(c => c.programId),
      recommendations
    }
  } catch (error) {
    console.error('Error getting budget recommendations:', error)
    return null
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string, locale: string = 'en-NG'): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })

  return formatter.format(amount)
}

/**
 * Format NGN currency specifically
 */
export function formatNGN(amount: number): string {
  return formatCurrency(amount, 'NGN', 'en-NG')
}

