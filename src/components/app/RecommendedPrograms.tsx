import React, { useState, useEffect } from 'react'
import { 
  Sparkles, 
  Target, 
  Brain, 
  TrendingUp, 
  RefreshCw, 
  Filter, 
  Search, 
  Settings,
  BookmarkIcon,
  ExternalLink,
  Info,
  CheckCircle,
  Star,
  Zap,
  Globe,
  Calendar,
  DollarSign
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { formatNGN } from '../../utils/currency'
import { useNavigate } from 'react-router-dom'
import ProgramCard from './ProgramCard'
import type { Program } from '../../lib/types'

interface RecommendationCategory {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  programs: Program[]
  matchPercentage?: number
  reason?: string
}

const RecommendedPrograms: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<RecommendationCategory[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [refreshing, setRefreshing] = useState(false)

  // Mock recommendation data - in a real app, this would come from an AI service
  const mockRecommendations: RecommendationCategory[] = [
    {
      id: 'perfect-match',
      title: 'Perfect Matches',
      description: 'Programs that align perfectly with your profile and preferences',
      icon: <Target className="h-5 w-5" />,
      matchPercentage: 95,
      reason: 'Based on your Computer Science background and preference for Canada',
      programs: [
        {
          id: '1',
          name: 'Master of Computer Science',
          university: 'University of Toronto',
          country: 'Canada',
          degree_type: 'Masters',
          tuition_fee: 45000,
          duration: '2 years',
          deadline: '2024-12-15',
          match: 98,
          has_scholarships: true,
          fields: ['Computer Science', 'AI', 'Machine Learning']
        },
        {
          id: '2',
          name: 'MSc Data Science',
          university: 'University of British Columbia',
          country: 'Canada',
          degree_type: 'Masters',
          tuition_fee: 42000,
          duration: '2 years',
          deadline: '2024-11-30',
          match: 96,
          has_scholarships: true,
          fields: ['Data Science', 'Analytics', 'Machine Learning']
        }
      ]
    },
    {
      id: 'budget-friendly',
      title: 'Budget-Friendly Options',
      description: 'High-quality programs within your budget range',
      icon: <DollarSign className="h-5 w-5" />,
      matchPercentage: 88,
      reason: 'These programs fit your ₦50M budget while maintaining quality',
      programs: [
        {
          id: '3',
          name: 'MS Computer Engineering',
          university: 'Technical University of Munich',
          country: 'Germany',
          degree_type: 'Masters',
          tuition_fee: 0, // Free tuition
          duration: '2 years',
          deadline: '2024-07-15',
          match: 90,
          has_scholarships: false,
          fields: ['Computer Engineering', 'Software Engineering']
        }
      ]
    },
    {
      id: 'rising-stars',
      title: 'Rising Star Programs',
      description: 'Emerging programs with excellent career prospects',
      icon: <TrendingUp className="h-5 w-5" />,
      matchPercentage: 85,
      reason: 'New programs with high industry demand and placement rates',
      programs: [
        {
          id: '4',
          name: 'MSc Artificial Intelligence',
          university: 'University of Amsterdam',
          country: 'Netherlands',
          degree_type: 'Masters',
          tuition_fee: 20000,
          duration: '2 years',
          deadline: '2024-09-01',
          match: 87,
          has_scholarships: true,
          fields: ['AI', 'Machine Learning', 'Robotics']
        }
      ]
    },
    {
      id: 'ai-suggested',
      title: 'AI Insights',
      description: 'Programs our AI thinks you might have overlooked',
      icon: <Brain className="h-5 w-5" />,
      matchPercentage: 82,
      reason: 'Based on successful profiles similar to yours',
      programs: [
        {
          id: '5',
          name: 'Master of Engineering in Software',
          university: 'University of Melbourne',
          country: 'Australia',
          degree_type: 'Masters',
          tuition_fee: 48000,
          duration: '2 years',
          deadline: '2024-10-31',
          match: 84,
          has_scholarships: true,
          fields: ['Software Engineering', 'Systems Design']
        }
      ]
    }
  ]

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // In a real app, this would be an API call to get personalized recommendations
        setRecommendations(mockRecommendations)
        setLastUpdated(new Date())
      } catch (err) {
        setError('Failed to load recommendations. Please try again.')
        console.error('Error fetching recommendations:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  const handleRefreshRecommendations = async () => {
    setRefreshing(true)
    
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, this would trigger a new recommendation generation
      setRecommendations(mockRecommendations.map(cat => ({
        ...cat,
        programs: [...cat.programs].sort(() => Math.random() - 0.5) // Shuffle for demo
      })))
      setLastUpdated(new Date())
    } catch (err) {
      setError('Failed to refresh recommendations. Please try again.')
    } finally {
      setRefreshing(false)
    }
  }

  const getTotalRecommendations = () => {
    return recommendations.reduce((total, category) => total + category.programs.length, 0)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-indigo-600" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-4">Generating personalized recommendations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <Info className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Unable to Load Recommendations
        </h3>
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
              Recommended Programs
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {getTotalRecommendations()} personalized recommendations based on your profile
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Last updated: {lastUpdated.toLocaleDateString()} at {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Update Preferences
          </button>
          
          <button
            onClick={handleRefreshRecommendations}
            disabled={refreshing}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Profile Completeness Banner */}
      {(!profile?.profile_completed || !profile?.study_preferences) && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-amber-800 dark:text-amber-200">
                Improve Your Recommendations
              </h3>
              <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                Complete your profile and preferences to get more accurate and personalized program recommendations.
              </p>
              <button
                onClick={() => navigate('/dashboard/profile')}
                className="mt-2 text-amber-800 dark:text-amber-200 hover:text-amber-900 dark:hover:text-amber-100 font-medium text-sm underline"
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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            {/* Category Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    {category.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {category.title}
                      </h2>
                      {category.matchPercentage && (
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                          {category.matchPercentage}% Match
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {category.description}
                    </p>
                    {category.reason && (
                      <p className="text-indigo-600 dark:text-indigo-400 text-sm mt-1">
                        {category.reason}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {category.programs.length} program{category.programs.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setActiveCategory(
                      activeCategory === category.id ? null : category.id
                    )}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm"
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
                    />
                  ))}
              </div>
              
              {category.programs.length > 2 && activeCategory !== category.id && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setActiveCategory(category.id)}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm inline-flex items-center gap-1"
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
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Want More Personalized Recommendations?
            </h3>
            <p className="text-indigo-100">
              Our AI gets smarter as you interact with programs. Save programs, update your preferences, and get even better recommendations.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard/search')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Browse All Programs
            </button>
            <button
              onClick={() => navigate('/dashboard/profile')}
              className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecommendedPrograms 