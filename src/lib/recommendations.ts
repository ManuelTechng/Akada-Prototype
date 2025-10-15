import { supabase } from './supabase'
import type { Program } from './types'

export interface RecommendationCategory {
  id: string
  title: string
  description: string
  icon: string
  programs: Program[]
  matchPercentage?: number
  reason?: string
}

export interface UserPreferences {
  budget_range?: [number, number]
  countries?: string[]
  degree_type?: string[]
  specialization?: string[]
  duration?: string[]
  study_level?: string
  language_preference?: string
  scholarship_needed?: boolean
  preferred_cities?: string[]
  goals?: string
}

export interface UserBehavior {
  viewed_programs?: string[]
  saved_programs?: string[]
  applied_programs?: string[]
  search_history?: string[]
  time_spent?: Record<string, number>
}

export interface ProgramMatch {
  program: Program
  matchScore: number
  reasons: string[]
  confidence: 'high' | 'medium' | 'low'
  category: string
}

/**
 * Calculate advanced match score for a program based on user preferences and behavior
 */
async function calculateAdvancedMatchScore(
  program: Program, 
  preferences: UserPreferences, 
  behavior?: UserBehavior
): Promise<ProgramMatch> {
  let score = 0
  let factors = 0
  const reasons: string[] = []
  let confidence: 'high' | 'medium' | 'low' = 'low'

  // Country preference (25% weight) - Reduced from 40% to make room for other factors
  if (preferences.countries && preferences.countries.length > 0) {
    factors++
    if (preferences.countries.includes(program.country)) {
      score += 25
      reasons.push(`Matches your preferred country: ${program.country}`)
    } else {
      // Enhanced similar regions with cultural and economic factors
      const similarRegions = {
        'Canada': ['USA', 'UK', 'Australia', 'New Zealand'],
        'USA': ['Canada', 'UK', 'Australia', 'Ireland'],
        'UK': ['Canada', 'USA', 'Ireland', 'Netherlands'],
        'Germany': ['Netherlands', 'Sweden', 'Norway', 'Denmark', 'Austria'],
        'Australia': ['New Zealand', 'Canada', 'USA', 'UK'],
        'France': ['Belgium', 'Switzerland', 'Luxembourg', 'Canada'],
        'Netherlands': ['Germany', 'Belgium', 'Denmark', 'Sweden'],
        'Sweden': ['Norway', 'Denmark', 'Finland', 'Netherlands'],
        'Norway': ['Sweden', 'Denmark', 'Finland', 'Iceland']
      }
      
      const similar = similarRegions[program.country as keyof typeof similarRegions] || []
      if (similar.some(region => preferences.countries!.includes(region))) {
        score += 15
        reasons.push(`Similar to your preferred regions: ${similar.filter(r => preferences.countries!.includes(r)).join(', ')}`)
      }
    }
  }

  // Study level preference (20% weight) - New factor
  if (preferences.study_level && program.study_level) {
    factors++
    if (preferences.study_level === program.study_level) {
      score += 20
      reasons.push(`Matches your study level: ${program.study_level}`)
    } else if (isCompatibleStudyLevel(preferences.study_level, program.study_level)) {
      score += 12
      reasons.push(`Compatible study level: ${program.study_level}`)
    }
  }

  // Degree type preference (15% weight) - Reduced from 25%
  if (preferences.degree_type && preferences.degree_type.length > 0) {
    factors++
    if (preferences.degree_type.includes(program.degree_type)) {
      score += 15
      reasons.push(`Matches your degree preference: ${program.degree_type}`)
    }
  }

  // Budget preference (15% weight) - Reduced from 20%
  if (preferences.budget_range && program.tuition_fee) {
    factors++
    // Handle budget_range as either array or single number
    const [minBudget, maxBudget] = Array.isArray(preferences.budget_range)
      ? preferences.budget_range
      : [0, preferences.budget_range]
    const tuition = program.tuition_fee
    
    if (tuition >= minBudget && tuition <= maxBudget) {
      score += 15
      reasons.push(`Within your budget range: ₦${tuition.toLocaleString()}`)
    } else if (tuition < minBudget) {
      score += 12
      reasons.push(`Under budget: ₦${tuition.toLocaleString()} (saves ₦${(minBudget - tuition).toLocaleString()})`)
    } else if (tuition <= maxBudget * 1.2) {
      score += 8
      reasons.push(`Slightly over budget: ₦${tuition.toLocaleString()}`)
    } else {
      score += 3
      reasons.push(`Above budget: ₦${tuition.toLocaleString()}`)
    }
  }

  // Specialization preference (10% weight) - Reduced from 15%
  if (preferences.specialization && preferences.specialization.length > 0 && program.specialization) {
    factors++
    const programSpecializations = program.specialization.toLowerCase().split(',').map(s => s.trim())
    const matchingSpecs = preferences.specialization.filter(spec => 
      programSpecializations.some(progSpec => 
        progSpec.includes(spec.toLowerCase()) || spec.toLowerCase().includes(progSpec)
      )
    )
    
    if (matchingSpecs.length > 0) {
      score += 10
      reasons.push(`Matches your specialization interests: ${matchingSpecs.join(', ')}`)
    }
  }

  // City preference (8% weight) - New factor
  if (preferences.preferred_cities && preferences.preferred_cities.length > 0 && program.city) {
    factors++
    if (preferences.preferred_cities.includes(program.city)) {
      score += 8
      reasons.push(`In your preferred city: ${program.city}`)
    }
  }

  // Duration preference (5% weight) - Reduced from 10%
  if (preferences.duration && preferences.duration.length > 0 && program.duration) {
    factors++
    if (preferences.duration.includes(program.duration)) {
      score += 5
      reasons.push(`Matches your preferred duration: ${program.duration}`)
    }
  }

  // Scholarship preference (7% weight) - Increased from 5%
  if (preferences.scholarship_needed && program.scholarship_available) {
    score += 7
    reasons.push('Offers scholarships (matches your need)')
  } else if (program.scholarship_available) {
    score += 3
    reasons.push('Offers scholarships')
  }

  // Language preference (5% weight) - New factor
  if (preferences.language_preference && program.language_requirements) {
    factors++
    if (program.language_requirements.toLowerCase().includes(preferences.language_preference.toLowerCase())) {
      score += 5
      reasons.push(`Matches your language preference: ${preferences.language_preference}`)
    }
  }

  // User behavior analysis (10% weight) - New factor
  if (behavior) {
    let behaviorScore = 0
    
    // Boost for similar programs user has viewed
    if (behavior.viewed_programs && behavior.viewed_programs.length > 0) {
      const similarPrograms = await findSimilarPrograms(program.id, behavior.viewed_programs)
      if (similarPrograms.length > 0) {
        behaviorScore += 5
        reasons.push('Similar to programs you\'ve viewed')
      }
    }
    
    // Boost for programs in countries user has shown interest in
    if (behavior.saved_programs && behavior.saved_programs.length > 0) {
      const countryInterest = await getCountryInterest(behavior.saved_programs)
      if (countryInterest.includes(program.country)) {
        behaviorScore += 3
        reasons.push('In a country you\'re interested in')
      }
    }
    
    // Boost for programs with similar specializations to saved ones
    if (behavior.saved_programs && behavior.saved_programs.length > 0) {
      const specializationInterest = await getSpecializationInterest(behavior.saved_programs)
      if (specializationInterest.some(spec => 
        program.specialization?.toLowerCase().includes(spec.toLowerCase())
      )) {
        behaviorScore += 2
        reasons.push('Matches your field of interest')
      }
    }
    
    score += behaviorScore
  }

  // Calculate confidence based on factors and score
  if (factors >= 4 && score >= 70) {
    confidence = 'high'
  } else if (factors >= 2 && score >= 50) {
    confidence = 'medium'
  }

  // Determine category based on score and characteristics
  let category = 'general'
  if (score >= 90) {
    category = 'perfect-match'
  } else if (score >= 80 && preferences.budget_range && program.tuition_fee && program.tuition_fee <= preferences.budget_range[1]) {
    category = 'budget-friendly'
  } else if (score >= 75 && program.scholarship_available) {
    category = 'rising-stars'
  } else if (score >= 70) {
    category = 'ai-suggested'
  }

  return {
    program,
    matchScore: Math.min(Math.round(score), 100),
    reasons,
    confidence,
    category
  }
}

/**
 * Check if study levels are compatible
 */
function isCompatibleStudyLevel(userLevel: string, programLevel: string): boolean {
  const compatibility = {
    'undergraduate': ['bachelor', 'foundation'],
    'bachelor': ['undergraduate', 'foundation'],
    'master': ['graduate', 'postgraduate', 'masters'],
    'graduate': ['master', 'postgraduate', 'masters'],
    'phd': ['doctoral', 'doctorate'],
    'doctoral': ['phd', 'doctorate']
  }
  
  const userCompatible = compatibility[userLevel.toLowerCase() as keyof typeof compatibility] || []
  return userCompatible.some(level => programLevel.toLowerCase().includes(level))
}

/**
 * Find similar programs based on user behavior
 */
async function findSimilarPrograms(programId: string, viewedProgramIds: string[]): Promise<string[]> {
  // This would typically use a more sophisticated similarity algorithm
  // For now, we'll use a simple approach based on shared characteristics
  try {
    const { data: program } = await supabase
      .from('programs')
      .select('country, degree_type, specialization')
      .eq('id', programId)
      .single()

    if (!program) return []

    const { data: similarPrograms } = await supabase
      .from('programs')
      .select('id')
      .in('id', viewedProgramIds)
      .or(`country.eq.${program.country},degree_type.eq.${program.degree_type}`)

    return similarPrograms?.map(p => p.id) || []
  } catch {
    return []
  }
}

/**
 * Get country interest from saved programs
 */
async function getCountryInterest(savedProgramIds: string[]): Promise<string[]> {
  try {
    const { data: programs } = await supabase
      .from('programs')
      .select('country')
      .in('id', savedProgramIds)

    return [...new Set(programs?.map(p => p.country) || [])]
  } catch {
    return []
  }
}

/**
 * Get specialization interest from saved programs
 */
async function getSpecializationInterest(savedProgramIds: string[]): Promise<string[]> {
  try {
    const { data: programs } = await supabase
      .from('programs')
      .select('specialization')
      .in('id', savedProgramIds)
      .not('specialization', 'is', null)

    const specializations = programs
      ?.map(p => p.specialization?.split(',').map((s: string) => s.trim()))
      .flat()
      .filter(Boolean) || []

    return [...new Set(specializations)]
  } catch {
    return []
  }
}

/**
 * Fetch user behavior data for enhanced recommendations
 */
async function getUserBehavior(userId: string): Promise<UserBehavior> {
  try {
    const [viewedPrograms, savedPrograms, appliedPrograms] = await Promise.all([
      // Get viewed programs (this would need to be tracked in a separate table)
      supabase.from('user_behavior').select('viewed_programs').eq('user_id', userId).single(),
      // Get saved programs
      supabase.from('saved_programs').select('program_id').eq('user_id', userId),
      // Get applied programs
      supabase.from('applications').select('program_id').eq('user_id', userId)
    ])

    return {
      viewed_programs: viewedPrograms.data?.viewed_programs || [],
      saved_programs: savedPrograms.data?.map(sp => sp.program_id) || [],
      applied_programs: appliedPrograms.data?.map(ap => ap.program_id) || [],
      search_history: [], // This would need to be tracked separately
      time_spent: {} // This would need to be tracked separately
    }
  } catch {
    return {}
  }
}

/**
 * Fetch programs from database and categorize them with advanced AI matching
 */
export async function fetchPersonalizedRecommendations(
  preferences: UserPreferences,
  userId?: string
): Promise<RecommendationCategory[]> {
  try {
    // Fetch all programs from database with additional fields
    const { data: programs, error } = await supabase
      .from('programs')
      .select(`
        id,
        name,
        university,
        country,
        degree_type,
        tuition_fee,
        tuition_fee_currency,
        tuition_fee_original,
        duration,
        specialization,
        deadline,
        scholarship_available,
        website,
        description,
        study_level,
        language_requirements,
        city,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching programs:', error)
      throw new Error('Failed to fetch programs')
    }

    if (!programs || programs.length === 0) {
      return []
    }

    // Get user behavior data if userId is provided
    const behavior = userId ? await getUserBehavior(userId) : undefined

    // Calculate advanced match scores for all programs
    const programMatches = await Promise.all(
      programs.map(async (program: any) => {
        // Ensure program has required properties
        const programWithRequiredFields = {
          ...program,
          created_at: program.created_at || new Date().toISOString()
        }
        return await calculateAdvancedMatchScore(programWithRequiredFields, preferences, behavior)
      })
    )

    // Sort by match score
    programMatches.sort((a, b) => b.matchScore - a.matchScore)

    // Categorize programs using the new algorithm
    const categories: RecommendationCategory[] = []

    // Perfect Matches (90%+ match, high confidence)
    const perfectMatches = programMatches.filter(p => 
      p.matchScore >= 90 && p.confidence === 'high'
    )
    if (perfectMatches.length > 0) {
      categories.push({
        id: 'perfect-match',
        title: 'Perfect Matches',
        description: 'Programs that align perfectly with your profile and preferences',
        icon: 'Target',
        programs: perfectMatches.slice(0, 6).map(p => p.program),
        matchPercentage: Math.round(perfectMatches.reduce((sum, p) => sum + p.matchScore, 0) / perfectMatches.length),
        reason: perfectMatches[0]?.reasons.slice(0, 2).join(', ') || 'Based on your preferences'
      })
    }

    // Budget-Friendly Options (80%+ match, under budget)
    const budgetFriendly = programMatches.filter(p => 
      p.matchScore >= 80 && 
      preferences.budget_range && 
      p.program.tuition_fee && 
      p.program.tuition_fee <= preferences.budget_range[1]
    )
    if (budgetFriendly.length > 0) {
      categories.push({
        id: 'budget-friendly',
        title: 'Budget-Friendly Options',
        description: 'High-quality programs within your budget range',
        icon: 'DollarSign',
        programs: budgetFriendly.slice(0, 4).map(p => p.program),
        matchPercentage: Math.round(budgetFriendly.reduce((sum, p) => sum + p.matchScore, 0) / budgetFriendly.length),
        reason: `These programs fit your ₦${preferences.budget_range?.[1]?.toLocaleString() || 'budget'} budget while maintaining quality`
      })
    }

    // Rising Star Programs (75%+ match, with scholarships)
    const risingStars = programMatches.filter(p => 
      p.matchScore >= 75 && 
      p.program.scholarship_available
    )
    if (risingStars.length > 0) {
      categories.push({
        id: 'rising-stars',
        title: 'Rising Star Programs',
        description: 'Emerging programs with excellent career prospects and scholarships',
        icon: 'TrendingUp',
        programs: risingStars.slice(0, 4).map(p => p.program),
        matchPercentage: Math.round(risingStars.reduce((sum, p) => sum + p.matchScore, 0) / risingStars.length),
        reason: 'Programs with high industry demand and scholarship opportunities'
      })
    }

    // AI Insights (70%+ match, diverse options)
    const aiInsights = programMatches.filter(p => 
      p.matchScore >= 70 && 
      !perfectMatches.includes(p) && 
      !budgetFriendly.includes(p) && 
      !risingStars.includes(p)
    )
    if (aiInsights.length > 0) {
      categories.push({
        id: 'ai-suggested',
        title: 'AI Insights',
        description: 'Programs our AI thinks you might have overlooked',
        icon: 'Brain',
        programs: aiInsights.slice(0, 4).map(p => p.program),
        matchPercentage: Math.round(aiInsights.reduce((sum, p) => sum + p.matchScore, 0) / aiInsights.length),
        reason: 'Based on successful profiles similar to yours'
      })
    }

    // Hidden Gems (60-70% match, unique opportunities)
    const hiddenGems = programMatches.filter(p => 
      p.matchScore >= 60 && 
      p.matchScore < 70 &&
      !perfectMatches.includes(p) && 
      !budgetFriendly.includes(p) && 
      !risingStars.includes(p) &&
      !aiInsights.includes(p)
    )
    if (hiddenGems.length > 0) {
      categories.push({
        id: 'hidden-gems',
        title: 'Hidden Gems',
        description: 'Unique programs that might surprise you',
        icon: 'Gem',
        programs: hiddenGems.slice(0, 3).map(p => p.program),
        matchPercentage: Math.round(hiddenGems.reduce((sum, p) => sum + p.matchScore, 0) / hiddenGems.length),
        reason: 'Lesser-known programs with great potential'
      })
    }

    // If no specific categories, create a general "Recommended" category
    if (categories.length === 0) {
      categories.push({
        id: 'general',
        title: 'Recommended Programs',
        description: 'Programs that might interest you',
        icon: 'Star',
        programs: programMatches.slice(0, 8).map(p => p.program),
        matchPercentage: Math.round(programMatches.reduce((sum, p) => sum + p.matchScore, 0) / programMatches.length),
        reason: 'Based on available programs in our database'
      })
    }

    return categories

  } catch (error) {
    console.error('Error generating recommendations:', error)
    throw new Error('Failed to generate recommendations')
  }
}

/**
 * Refresh recommendations (useful for real-time updates)
 */
export async function refreshRecommendations(
  preferences: UserPreferences,
  userId?: string
): Promise<RecommendationCategory[]> {
  return fetchPersonalizedRecommendations(preferences, userId)
}

/**
 * Track user behavior for improved recommendations
 */
export async function trackUserBehavior(
  userId: string, 
  action: 'view' | 'save' | 'apply' | 'search',
  programId?: string,
  searchQuery?: string
): Promise<void> {
  try {
    if (action === 'view' && programId) {
      // Track program view
      await supabase
        .from('user_behavior')
        .upsert({
          user_id: userId,
          viewed_programs: [programId],
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
    } else if (action === 'search' && searchQuery) {
      // Track search query
      await supabase
        .from('user_behavior')
        .upsert({
          user_id: userId,
          search_history: [searchQuery],
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
    }
  } catch (error) {
    console.error('Error tracking user behavior:', error)
    // Don't throw error as this is not critical functionality
  }
}

/**
 * Get recommendation categories for a specific user
 */
export async function getUserRecommendations(userId: string): Promise<RecommendationCategory[]> {
  try {
    // Fetch user preferences
    const { data: preferences, error: prefError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (prefError) {
      console.error('Error fetching user preferences:', prefError)
      // Return default recommendations if no preferences found
      return fetchPersonalizedRecommendations({})
    }

    const userPrefs: UserPreferences = {
      budget_range: preferences.budget_range,
      countries: preferences.countries,
      degree_type: preferences.degree_type,
      specialization: preferences.specialization,
      duration: preferences.duration,
      study_level: preferences.study_level,
      language_preference: preferences.language_preference,
      scholarship_needed: preferences.scholarship_needed,
      preferred_cities: preferences.preferred_cities,
      goals: preferences.goals
    }

    return fetchPersonalizedRecommendations(userPrefs, userId)

  } catch (error) {
    console.error('Error getting user recommendations:', error)
    throw new Error('Failed to get user recommendations')
  }
}

/**
 * Get program match details for a specific program
 */
export async function getProgramMatchDetails(
  programId: string,
  userId: string
): Promise<ProgramMatch | null> {
  try {
    // Fetch program details
    const { data: program, error: programError } = await supabase
      .from('programs')
      .select('*')
      .eq('id', programId)
      .single()

    if (programError || !program) {
      return null
    }

    // Fetch user preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!preferences) {
      return null
    }

    const userPrefs: UserPreferences = {
      budget_range: preferences.budget_range,
      countries: preferences.countries,
      degree_type: preferences.degree_type,
      specialization: preferences.specialization,
      duration: preferences.duration,
      study_level: preferences.study_level,
      language_preference: preferences.language_preference,
      scholarship_needed: preferences.scholarship_needed,
      preferred_cities: preferences.preferred_cities,
      goals: preferences.goals
    }

    // Get user behavior
    const behavior = await getUserBehavior(userId)

    // Calculate match details
    return await calculateAdvancedMatchScore(program, userPrefs, behavior)

  } catch (error) {
    console.error('Error getting program match details:', error)
    return null
  }
}
