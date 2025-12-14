import React, { useMemo } from 'react'
import {
  SparklesIcon,
  ChevronRightIcon,
  AlertCircleIcon
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRecommendations } from '../../hooks/useDashboard'
import { cn } from '../../lib/utils'
import SkeletonLoader from '../ui/SkeletonLoader'
import ProgramCard from '../app/ProgramCard'
import { useSavedPrograms } from '../../hooks/useSavedPrograms'
import { useAuth } from '../../contexts/AuthContext'

export const ProgramRecommendationsWidget: React.FC<{ className?: string }> = ({ className }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { recommendationsData, loading, error } = useRecommendations()
  const { savedPrograms, saveProgram, unsaveProgram } = useSavedPrograms(user?.id)

  // Create a Set of saved program IDs for O(1) lookup
  const savedProgramIds = useMemo(() => {
    return new Set(savedPrograms.map(sp => sp.program_id))
  }, [savedPrograms])

  if (loading) {
    return <SkeletonLoader.DashboardWidget className={className} />
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

  // Handle save/unsave program
  const handleSaveToggle = async (programId: string) => {
    const isSaved = savedProgramIds.has(programId)
    if (isSaved) {
      await unsaveProgram(programId)
    } else {
      await saveProgram(programId)
    }
  }

  // Handle view details
  const handleViewDetails = (programId: string) => {
    navigate(`/app/programs/${programId}`)
  }

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
          onClick={() => navigate('/app/recommended')}
          className="text-primary hover:text-primary/80 transition-colors text-sm font-medium flex items-center gap-1"
        >
          View All
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topMatches.slice(0, 3).map((program: any) => (
          <ProgramCard
            key={program.id}
            program={program}
            showMatchScore={true}
            showRecommendationBadge={true}
            compact={true}
            isSaved={savedProgramIds.has(program.id)}
            onSave={() => handleSaveToggle(program.id)}
            onUnsave={() => handleSaveToggle(program.id)}
            onViewDetails={() => handleViewDetails(program.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default ProgramRecommendationsWidget
