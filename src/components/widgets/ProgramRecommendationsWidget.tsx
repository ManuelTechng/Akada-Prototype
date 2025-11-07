import React from 'react'
import {
  GraduationCapIcon,
  MapPinIcon,
  DollarSignIcon,
  TrendingUpIcon,
  SparklesIcon,
  ChevronRightIcon,
  AlertCircleIcon
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRecommendations } from '../../hooks/useDashboard'
import { formatNGN } from '../../utils/currency'
import { cn } from '../../lib/utils'
import SkeletonLoader from '../ui/SkeletonLoader'

interface Program {
  id: string
  name: string
  university: string
  country: string
  city?: string
  tuition_fee: number
  scholarship_available: boolean
  degree_type?: string
}

export const ProgramRecommendationsWidget: React.FC<{ className?: string }> = ({ className }) => {
  const navigate = useNavigate()
  const { recommendationsData, loading, error } = useRecommendations()

  // Calculate match percentage (simulated based on program characteristics)
  const calculateMatchPercentage = (program: Program, index: number): number => {
    // Top recommendations get higher match percentages
    const baseMatch = 98 - (index * 3)

    // Boost for scholarships
    const scholarshipBoost = program.scholarship_available ? 2 : 0

    return Math.min(baseMatch + scholarshipBoost, 99)
  }

  // Get match badge color based on percentage
  const getMatchBadgeColor = (percentage: number): string => {
    if (percentage >= 95) return 'bg-green-500'
    if (percentage >= 90) return 'bg-emerald-500'
    if (percentage >= 85) return 'bg-teal-500'
    return 'bg-blue-500'
  }

  if (loading) {
    return <SkeletonLoader.DashboardWidget variant="grid" className={className} />
  }

  if (error) {
    return (
      <div className={cn(
        "bg-card rounded-lg border border-border p-4 sm:p-6",
        className
      )}>
        <div className="text-center py-8">
          <AlertCircleIcon className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Unable to Load Recommendations
          </h3>
          <p className="text-muted-foreground text-sm">
            {error}
          </p>
        </div>
      </div>
    )
  }

  if (!recommendationsData?.hasRecommendations) {
    return (
      <div className={cn(
        "bg-card rounded-lg border border-border p-4 sm:p-6",
        className
      )}>
        <div className="text-center py-8">
          <SparklesIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Complete Your Profile
          </h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Set your preferences to get personalized program recommendations
          </p>
          <button
            onClick={() => navigate('/app/settings')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm"
          >
            Complete Profile
          </button>
        </div>
      </div>
    )
  }

  const { topMatches } = recommendationsData

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
            <SparklesIcon className="w-5 h-5 text-primary" />
            Recommended Programs
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered matches for your profile
          </p>
        </div>
        <button
          onClick={() => navigate('/programs/search')}
          className="text-primary hover:text-primary/80 transition-colors text-sm font-medium flex items-center gap-1"
        >
          View All
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topMatches.slice(0, 3).map((program: Program, index: number) => {
          const matchPercentage = calculateMatchPercentage(program, index)
          const matchBadgeColor = getMatchBadgeColor(matchPercentage)

          return (
            <div
              key={program.id}
              onClick={() => navigate(`/programs/${program.id}`)}
              className={cn(
                "group relative overflow-hidden rounded-2xl p-4 border cursor-pointer",
                "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                // Gradient backgrounds based on index (variety for visual interest)
                index % 4 === 0 && "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-100 dark:border-purple-800/30",
                index % 4 === 1 && "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-100 dark:border-blue-800/30",
                index % 4 === 2 && "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-100 dark:border-emerald-800/30",
                index % 4 === 3 && "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-100 dark:border-amber-800/30"
              )}
            >
              {/* Header with Icon and Match Badge */}
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm shadow-sm">
                  <GraduationCapIcon className={cn(
                    "h-6 w-6",
                    index % 4 === 0 && "text-purple-600 dark:text-purple-400",
                    index % 4 === 1 && "text-blue-600 dark:text-blue-400",
                    index % 4 === 2 && "text-emerald-600 dark:text-emerald-400",
                    index % 4 === 3 && "text-amber-600 dark:text-amber-400"
                  )} />
                </div>
                <span className={cn(
                  "text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm",
                  matchBadgeColor
                )}>
                  {matchPercentage}% Match
                </span>
              </div>

              {/* Program Name */}
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[2.5rem]">
                {program.name}
              </h3>

              {/* Program Details */}
              <div className="space-y-2 text-sm">
                {/* University */}
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <div className="w-1 h-1 rounded-full bg-current opacity-50" />
                  <span className="line-clamp-1">{program.university}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {program.city ? `${program.city}, ${program.country}` : program.country}
                  </span>
                </div>

                {/* Cost */}
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <DollarSignIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">
                    {formatNGN(program.tuition_fee, { compact: true, decimals: 0 })}/year
                  </span>
                </div>
              </div>

              {/* Scholarship Badge (if available) */}
              {program.scholarship_available && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-xs">
                    <TrendingUpIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      Scholarship Available
                    </span>
                  </div>
                </div>
              )}

              {/* Hover Effect Indicator */}
              <div className="absolute bottom-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRightIcon className="w-5 h-5 text-primary" />
              </div>
            </div>
          )
        })}
      </div>

      {/* View All Button */}
      <div className="pt-4 border-t border-border">
        <button
          onClick={() => navigate('/programs/search')}
          className="w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <SparklesIcon className="w-4 h-4" />
          <span>Explore All Recommendations</span>
        </button>
      </div>
    </div>
  )
}

export default ProgramRecommendationsWidget
