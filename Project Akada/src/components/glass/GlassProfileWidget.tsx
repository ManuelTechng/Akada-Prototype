import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckIcon, XIcon, TrendingUpIcon, AlertCircleIcon, SparklesIcon } from 'lucide-react'
import CircularProgress from '../ui/CircularProgress'
import SkeletonLoader from '../ui/SkeletonLoader'
import { useProfileCompletion } from '../../hooks/useDashboard'
import { akadaTokens } from '../../styles/tokens'
import { cn } from '../../lib/utils'
import { useTheme } from '../../contexts/ThemeContext'

interface ProfileSection {
  name: string
  completed: boolean
  weight: number
  icon?: React.ReactNode
  route?: string
}

export const GlassProfileWidget: React.FC<{ className?: string }> = ({ className }) => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
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
        "relative overflow-hidden rounded-2xl backdrop-blur-xl border p-4 sm:p-6 space-y-4 transition-all duration-300 hover:shadow-lg",
        isDark 
          ? 'bg-gray-900/40 border-white/10' 
          : 'bg-white/80 border-gray-200',
        className
      )}
    >
      {/* Glass effect overlay */}
      <div className={cn(
        "absolute inset-0",
        isDark 
          ? 'bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20' 
          : 'bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50'
      )} />
      
      {/* Confetti effect for 100% completion */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="animate-pulse text-center text-4xl">🎉</div>
        </div>
      )}

      {/* Header with dismiss button */}
      <div className="relative z-10 flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            Profile Completion
            {isProfileOptimal && <SparklesIcon className="w-4 h-4 text-yellow-500" />}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {message.subtext}
          </p>
        </div>
        {completionData.percentage === 100 && (
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Dismiss profile completion widget"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress Circle */}
      <div className="relative z-10 flex items-center space-x-4 py-4">
        <div className="relative">
          <CircularProgress
            size={100}
            strokeWidth={8}
            percentage={completionData.percentage}
            color={getProgressColor(completionData.percentage)}
            className="transition-all duration-500"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {completionData.percentage}%
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Profile Completion
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Profile completion: {completionData.percentage}%
          </p>
          <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
            <CheckIcon className="w-4 h-4" />
            {message.text}
          </p>
        </div>
      </div>


      {/* Section Breakdown */}
      <div className="relative z-10 space-y-3">
        <div className="space-y-2">
          {sections.map((section, index) => (
            <div
              key={section.name}
              onClick={() => handleSectionClick(section.route)}
              className="flex items-center justify-between py-2 cursor-pointer transition-all duration-200 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 rounded-lg px-2"
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs",
                  section.completed 
                    ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                )}>
                  {section.completed ? (
                    <CheckIcon className="w-3 h-3" />
                  ) : (
                    <span className="text-xs">{Math.round(section.weight * completionData.percentage / 100)}%</span>
                  )}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  section.completed 
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400"
                )}>
                  {section.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {section.completed ? '100%' : `${Math.round(section.weight * completionData.percentage / 100)}%`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      {completionData.percentage < 100 && (
        <div className="relative z-10 pt-2">
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="w-full bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-medium py-2.5 px-4 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <span>Complete Profile</span>
            <TrendingUpIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Benefits List */}
      {benefits.benefits.length > 1 && (
        <div className="relative z-10 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            {benefits.benefits.slice(1).map((benefit: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckIcon className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default GlassProfileWidget
