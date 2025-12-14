import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckIcon, XIcon, TrendingUpIcon, AlertCircleIcon, SparklesIcon } from 'lucide-react'
import CircularProgress from './ui/CircularProgress'
import SkeletonLoader from './ui/SkeletonLoader'
import { useProfileCompletion } from '../hooks/useDashboard'
import { akadaTokens } from '../styles/tokens'
import { cn } from '../lib/utils'

interface ProfileSection {
  name: string
  completed: boolean
  weight: number
  icon?: React.ReactNode
  route?: string
}

export const ProfileCompletionWidget: React.FC<{ className?: string }> = ({ className }) => {
  const navigate = useNavigate()
  const { completionData, loading, getCompletionBenefits, isProfileOptimal } = useProfileCompletion()
  const [showConfetti, setShowConfetti] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Check if widget was previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('akada_profile_widget_dismissed')
    if (dismissed === 'true' && completionData?.percentage === 100) {
      setIsDismissed(true)
    }
  }, [completionData?.percentage])

  // Trigger animation when percentage changes
  useEffect(() => {
    if (completionData && !loading) {
      setIsAnimating(true)
      if (completionData.percentage === 100 && !showConfetti) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 5000)
      }
    }
  }, [completionData?.percentage])

  // Get progress color based on percentage
  const getProgressColor = (percentage: number) => {
    if (percentage >= 70) return akadaTokens.colors.status.success
    if (percentage >= 30) return akadaTokens.colors.status.warning
    return akadaTokens.colors.status.error
  }

  // Get motivational message based on percentage
  const getMotivationalMessage = (percentage: number) => {
    if (percentage === 100) return { text: "Profile complete! 🎉", subtext: "You're getting the best matches" }
    if (percentage >= 70) return { text: "Profile optimized!", subtext: "Just a few more details for perfection" }
    if (percentage >= 50) return { text: "Making great progress!", subtext: "Keep going to unlock more opportunities" }
    if (percentage >= 30) return { text: "Good start!", subtext: "Add more details for better matches" }
    return { text: "Just getting started", subtext: "Complete your profile to unlock ₦50M+ in scholarships" }
  }

  // Map completion data sections to display format
  const getSectionDetails = (): ProfileSection[] => {
    if (!completionData) return []
    
    return [
      {
        name: 'Study Preferences',
        completed: completionData.completedSections.includes('Study Preferences'),
        weight: 25,
        route: '/preferences'
      },
      {
        name: 'Budget & Scholarships',
        completed: completionData.completedSections.includes('Budget & Scholarships'),
        weight: 25,
        route: '/preferences'
      },
      {
        name: 'Academic Timeline',
        completed: completionData.completedSections.includes('Academic Timeline'),
        weight: 15,
        route: '/preferences'
      },
      {
        name: 'Location Preferences',
        completed: completionData.completedSections.includes('Location Preferences'),
        weight: 15,
        route: '/preferences'
      },
      {
        name: 'Personal Profile',
        completed: completionData.completedSections.includes('Personal Profile'),
        weight: 20,
        route: '/profile'
      }
    ]
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('akada_profile_widget_dismissed', 'true')
  }

  const handleSectionClick = (route?: string) => {
    if (route) {
      navigate(route)
    }
  }

  if (loading) {
    return <SkeletonLoader.DashboardWidget variant="stats" className={className} />
  }

  if (!completionData || isDismissed) {
    return null
  }

  const benefits = getCompletionBenefits(completionData.percentage)
  const message = getMotivationalMessage(completionData.percentage)
  const sections = getSectionDetails()

  return (
    <div 
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4 relative overflow-hidden",
        "transition-all duration-300 hover:shadow-md",
        className
      )}
    >
      {/* Confetti effect for 100% completion */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="animate-pulse text-center text-4xl">🎉</div>
        </div>
      )}

      {/* Header with dismiss button */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            Profile Completion
            {isProfileOptimal && <SparklesIcon className="w-4 h-4 text-yellow-500" />}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {message.subtext}
          </p>
        </div>
        {completionData.percentage === 100 && (
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Dismiss widget"
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Progress section */}
      <div className="flex items-center space-x-4">
        {/* Circular progress */}
        <div className={cn(
          "transition-transform duration-500",
          isAnimating && "scale-110"
        )}>
          <CircularProgress
            percentage={completionData.percentage}
            size={80}
            strokeWidth={6}
            color={getProgressColor(completionData.percentage)}
          />
        </div>

        {/* Progress message */}
        <div className="flex-1">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {message.text}
          </p>
          <div className={cn(
            "mt-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden",
            "relative"
          )}>
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-out",
                completionData.percentage >= 70 ? "bg-green-500" :
                completionData.percentage >= 30 ? "bg-orange-500" : "bg-red-500"
              )}
              style={{ width: `${completionData.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Section breakdown */}
      <div className="space-y-2 mt-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Profile Sections:
        </p>
        {sections.map((section, index) => (
          <div
            key={index}
            onClick={() => handleSectionClick(section.route)}
            className={cn(
              "flex items-center justify-between p-2 rounded-md transition-all duration-200",
              "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700",
              section.completed 
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" 
                : "bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
            )}
          >
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                section.completed 
                  ? "bg-green-500 text-white" 
                  : "bg-gray-300 dark:bg-gray-600"
              )}>
                {section.completed ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  <XIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                )}
              </div>
              <span className={cn(
                "text-sm",
                section.completed 
                  ? "text-green-700 dark:text-green-400 font-medium" 
                  : "text-gray-600 dark:text-gray-400"
              )}>
                {section.name}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {section.weight}%
            </span>
          </div>
        ))}
      </div>

      {/* Next steps - only show if not complete */}
      {completionData.percentage < 100 && completionData.nextSteps.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <TrendingUpIcon className="w-4 h-4" />
            Complete These Fields:
          </p>
          <div className="space-y-3">
            {completionData.nextSteps.slice(0, 3).map((step, index) => (
              <div 
                key={index}
                className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 dark:text-yellow-400 text-xs font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">{step}</p>
                  <button 
                    onClick={() => {
                      // Navigate to profile for personal/academic/preferences
                      // Navigate to settings for security/notifications
                      const missingSection = completionData?.missingSections.find((section: string) => 
                        section.includes('Security') || section.includes('Notification')
                      );
                      if (missingSection) {
                        navigate('/dashboard/settings');
                      } else {
                        navigate('/dashboard/profile');
                      }
                    }}
                    className="mt-1 text-xs text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 underline"
                  >
                    Complete now →
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* CTA Button */}
          <button
            onClick={() => navigate('/dashboard/profile')}
            className={cn(
              "mt-3 w-full py-2 px-4 rounded-md font-medium text-sm",
              "bg-indigo-600 text-white hover:bg-indigo-700",
              "transition-colors duration-200",
              "flex items-center justify-center gap-2"
            )}
          >
            Complete Profile
            <TrendingUpIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Benefits reminder */}
      {completionData.percentage < 70 && benefits.urgency === 'high' && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
          <div className="flex items-start space-x-2">
            <AlertCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Unlock Premium Features
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Complete your profile to access 50+ more program matches and ₦50M+ in scholarship opportunities
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile optimizations */}
        <style>{`
        @media (max-width: 375px) {
          .text-2xl {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  )
}

export default ProfileCompletionWidget