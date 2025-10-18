import React from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Trophy, ArrowRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useTheme } from '../../contexts/ThemeContext'

interface QuickActionsWidgetProps {
  className?: string
}

export function GlassQuickActionsWidget({ className }: QuickActionsWidgetProps) {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const quickActions = [
    {
      id: 'search-programs',
      title: 'Search Programs',
      description: 'Find your perfect university match',
      icon: <GraduationCap className="w-5 h-5" />,
      onClick: () => navigate('/programs/search'),
      color: 'blue'
    },
    {
      id: 'view-scholarships',
      title: 'View Scholarships',
      description: 'Discover funding opportunities',
      icon: <Trophy className="w-5 h-5" />,
      onClick: () => navigate('/scholarships'),
      color: 'green'
    }
  ]

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl backdrop-blur-xl border p-6 space-y-4",
      isDark 
        ? 'bg-gray-900/40 border-white/10' 
        : 'bg-white/80 border-gray-200',
      className
    )}>
      {/* Glass effect overlay */}
      <div className={cn(
        "absolute inset-0",
        isDark 
          ? 'bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20' 
          : 'bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50'
      )} />
      
      {/* Header */}
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
          Quick Actions
          <div className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <ArrowRight className="w-3 h-3 text-white" />
          </div>
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Shortcuts to common tasks
        </p>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 space-y-3">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-md",
              isDark 
                ? 'bg-gray-800/40 border-white/10 hover:bg-gray-700/50' 
                : 'bg-white/60 border-gray-200 hover:bg-white/80'
            )}
          >
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                action.color === 'blue' 
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              )}>
                {action.icon}
              </div>
              <div className="text-left">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </button>
        ))}
      </div>
    </div>
  )
}

export default GlassQuickActionsWidget



