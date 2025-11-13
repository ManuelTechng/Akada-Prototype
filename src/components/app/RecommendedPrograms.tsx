import React, { useState, useEffect } from 'react'
import { 
  Sparkles, 
  Target, 
  Brain, 
  TrendingUp, 
  RefreshCw, 
  Search, 
  Settings,
  ExternalLink,
  Info,
  Star,
  DollarSign
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import ProgramCard from './ProgramCard'
import type { Program } from '../../lib/types'
import {
  fetchPersonalizedRecommendations,
  refreshRecommendations,
  getUserRecommendations,
  type RecommendationCategory
} from '../../lib/recommendations'
import CreateApplicationModal from './CreateApplicationModal'
import { useSavedPrograms } from '../../hooks/useSavedPrograms'
import { useMemo } from 'react'

// RecommendationCategory interface is now imported from recommendations.ts

const RecommendedPrograms: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { savedPrograms, saveProgram, unsaveProgram } = useSavedPrograms(user?.id)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<RecommendationCategory[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [refreshing, setRefreshing] = useState(false)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)

  // Create a Set of saved program IDs for O(1) lookup
  const savedProgramIds = useMemo(() => {
    return new Set(savedPrograms.map(sp => sp.program_id))
  }, [savedPrograms])

  // Icon mapping for categories
  const getCategoryIcon = (iconName: string) => {
    const iconMap = {
      Target: <Target className="h-5 w-5" />,
      DollarSign: <DollarSign className="h-5 w-5" />,
      TrendingUp: <TrendingUp className="h-5 w-5" />,
      Brain: <Brain className="h-5 w-5" />,
      Star: <Star className="h-5 w-5" />
    }
    return iconMap[iconName as keyof typeof iconMap] || <Star className="h-5 w-5" />
  }

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log('⏳ Fetching personalized recommendations...')
        const startTime = performance.now()

        // Create timeout promise (15 seconds for complex recommendation algorithm)
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Recommendations timeout after 15 seconds. Please try again or update your profile for faster results.')), 15000)
        )

        let recommendationsPromise: Promise<RecommendationCategory[]>

        if (user && profile) {
          // Fetch personalized recommendations for authenticated user
          recommendationsPromise = getUserRecommendations(user.id)
        } else {
          // Fetch general recommendations for non-authenticated users
          recommendationsPromise = fetchPersonalizedRecommendations({})
        }

        // Race the fetch against the timeout
        const recommendationsData = await Promise.race([recommendationsPromise, timeoutPromise])

        const endTime = performance.now()
        console.log(`✅ Recommendations loaded in ${(endTime - startTime).toFixed(0)}ms`)

        setRecommendations(recommendationsData)
        setLastUpdated(new Date())
      } catch (err: any) {
        console.error('❌ Error fetching recommendations:', err)
        setError(err.message || 'Failed to load recommendations. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [user, profile])

  const handleRefreshRecommendations = async () => {
    setRefreshing(true)

    try {
      console.log('🔄 Refreshing recommendations...')
      const startTime = performance.now()

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Refresh timeout after 15 seconds.')), 15000)
      )

      let refreshPromise: Promise<RecommendationCategory[]>

      if (user && profile) {
        // Refresh personalized recommendations for authenticated user
        refreshPromise = refreshRecommendations({}, user.id)
      } else {
        // Refresh general recommendations for non-authenticated users
        refreshPromise = refreshRecommendations({})
      }

      // Race the refresh against the timeout
      const recommendationsData = await Promise.race([refreshPromise, timeoutPromise])

      const endTime = performance.now()
      console.log(`✅ Recommendations refreshed in ${(endTime - startTime).toFixed(0)}ms`)

      setRecommendations(recommendationsData)
      setLastUpdated(new Date())
      setError(null) // Clear any previous errors
    } catch (err: any) {
      console.error('❌ Error refreshing recommendations:', err)
      setError(err.message || 'Failed to refresh recommendations. Please try again.')
    } finally {
      setRefreshing(false)
    }
  }

  const getTotalRecommendations = () => {
    return recommendations.reduce((total, category) => total + category.programs.length, 0)
  }

  // Handle save/unsave program
  const handleSaveToggle = async (programId: string) => {
    const isSaved = savedProgramIds.has(programId)
    if (isSaved) {
      await unsaveProgram(programId)
    } else {
      await saveProgram(programId)
    }
  }

  const handleApplyToProgram = (programId: string) => {
    // Find the program from the recommendations
    let foundProgram: Program | null = null

    for (const category of recommendations) {
      const program = category.programs.find((p: any) => p.id === programId)
      if (program) {
        foundProgram = program
        break
      }
    }

    if (foundProgram) {
      setSelectedProgram(foundProgram)
      setShowApplicationModal(true)
    }
  }

  const handleApplicationSuccess = () => {
    // Optionally refresh recommendations or show success message
    console.log('Application created successfully')
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary" />
        </div>
        <p className="text-muted-foreground mt-4">Generating personalized recommendations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-center">
        <div className="text-destructive mb-4">
          <Info className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-destructive mb-2">
          Unable to Load Recommendations
        </h3>
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground font-heading">
              Recommended Programs
            </h1>
          </div>
          <p className="text-muted-foreground">
            {getTotalRecommendations()} personalized recommendations based on your profile
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated: {lastUpdated.toLocaleDateString()} at {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="bg-card border border-border text-foreground px-4 py-2 rounded-lg hover:bg-accent transition-colors inline-flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Update Preferences
          </button>

          <button
            onClick={handleRefreshRecommendations}
            disabled={refreshing}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Profile Completeness Banner */}
      {(!profile?.profile_completed || !profile?.study_preferences) && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-amber-800 dark:text-amber-300">
                Improve Your Recommendations
              </h3>
              <p className="text-amber-700 dark:text-amber-400 text-sm mt-1">
                Complete your profile and preferences to get more accurate and personalized program recommendations.
              </p>
              <button
                onClick={() => navigate('/dashboard/profile')}
                className="mt-2 text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 font-medium text-sm underline"
              >
                Complete Profile →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation Categories */}
      <div className="space-y-6">
        {recommendations.map((category) => (
          <div
            key={category.id}
            className="bg-card rounded-xl shadow-sm border border-border"
          >
            {/* Category Header */}
            <div className="p-4 sm:p-6 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                    {getCategoryIcon(category.icon)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base sm:text-lg font-semibold text-foreground">
                        {category.title}
                      </h2>
                      {category.matchPercentage && (
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                          {category.matchPercentage}% Match
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">
                      {category.description}
                    </p>
                    {category.reason && (
                      <p className="text-primary text-xs sm:text-sm mt-1">
                        {category.reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 justify-between sm:justify-end">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {category.programs.length} program{category.programs.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setActiveCategory(
                      activeCategory === category.id ? null : category.id
                    )}
                    className="text-primary hover:text-primary/80 font-medium text-sm whitespace-nowrap"
                  >
                    {activeCategory === category.id ? 'Collapse' : 'View All'}
                  </button>
                </div>
              </div>
            </div>

            {/* Programs */}
            <div className="p-6">
              <div className={`
                grid gap-6
                ${activeCategory === category.id 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1 lg:grid-cols-2'
                }
              `}>
                {(activeCategory === category.id ? category.programs : category.programs.slice(0, 2))
                  .map((program) => (
                    <ProgramCard
                      key={program.id}
                      program={program}
                      showMatchScore={true}
                      showRecommendationBadge={true}
                      compact={activeCategory !== category.id}
                      isSaved={savedProgramIds.has(program.id)}
                      onSave={() => handleSaveToggle(program.id)}
                      onUnsave={() => handleSaveToggle(program.id)}
                      onViewDetails={() => navigate(`/app/programs/${program.id}`)}
                    />
                  ))}
              </div>
              
              {category.programs.length > 2 && activeCategory !== category.id && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setActiveCategory(category.id)}
                    className="text-primary hover:text-primary/80 font-medium text-sm inline-flex items-center gap-1"
                  >
                    View {category.programs.length - 2} more program{category.programs.length - 2 !== 1 ? 's' : ''}
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="bg-primary rounded-xl p-6 text-primary-foreground">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Want More Personalized Recommendations?
            </h3>
            <p className="opacity-90">
              Our AI gets smarter as you interact with programs. Save programs, update your preferences, and get even better recommendations.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard/search')}
              className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Browse All Programs
            </button>
            <button
              onClick={() => navigate('/dashboard/profile')}
              className="bg-background text-primary px-4 py-2 rounded-lg hover:bg-background/90 transition-colors inline-flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Update Profile
            </button>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <CreateApplicationModal
        isOpen={showApplicationModal}
        onClose={() => {
          setShowApplicationModal(false)
          setSelectedProgram(null)
        }}
        programId={selectedProgram?.id}
        programName={selectedProgram?.name}
        universityName={selectedProgram?.university}
        onSuccess={handleApplicationSuccess}
      />
    </div>
  )
}

export default RecommendedPrograms 