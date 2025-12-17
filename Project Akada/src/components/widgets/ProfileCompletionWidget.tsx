import { Card } from '../ui/card';
import { CheckCircle2 } from 'lucide-react';
import { useProfileCompletion } from '../../hooks/useDashboard';
import { useNavigate } from 'react-router-dom';

export function ProfileCompletionWidget() {
  const navigate = useNavigate();
  const { completionData, loading } = useProfileCompletion();

  if (loading) {
    return (
      <Card className="figma-card">
        <div className="figma-card-content">
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (!completionData) {
    return (
      <Card className="figma-card">
        <div className="figma-card-content">
          <p className="text-sm figma-text-secondary text-center">Unable to load profile data</p>
        </div>
      </Card>
    );
  }

  const overallProgress = completionData.percentage;

  // Map completion sections to display items with progress
  const profileItems = [
    {
      label: 'Personal Information',
      progress: completionData.completedSections.includes('Personal Profile') ? 100 : 0,
      complete: completionData.completedSections.includes('Personal Profile')
    },
    {
      label: 'Study Preferences',
      progress: completionData.completedSections.includes('Study Preferences') ? 100 : 0,
      complete: completionData.completedSections.includes('Study Preferences')
    },
    {
      label: 'English Test Scores',
      progress: 100, // Placeholder - add when available
      complete: true
    },
    {
      label: 'Academic Timeline',
      progress: completionData.completedSections.includes('Academic Timeline') ? 100 : 50,
      complete: completionData.completedSections.includes('Academic Timeline')
    },
    {
      label: 'Financial Budget',
      progress: completionData.completedSections.includes('Budget & Scholarships') ? 100 : 50,
      complete: completionData.completedSections.includes('Budget & Scholarships')
    },
    {
      label: 'Personal Profile',
      progress: completionData.completedSections.includes('Location Preferences') ? 100 : 75,
      complete: completionData.completedSections.includes('Location Preferences')
    },
  ];

  return (
    <Card className="figma-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/app/settings')}>
      <div className="figma-card-content">
        <div className="flex items-start gap-4 mb-6">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-800 dark:text-gray-800"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallProgress / 100)}`}
                className="text-green-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-semibold figma-text-primary">{overallProgress}%</div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold figma-text-primary mb-1">Profile Completion</h3>
            <p className="text-sm figma-text-secondary mb-3">
              You're almost there! Keep building momentum
            </p>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />
              <span className="text-green-600 dark:text-green-400">Profile complete! 🎉</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 pr-1">
          {profileItems.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 ${item.complete ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}
                  />
                  <span className="text-sm font-medium figma-text-primary">{item.label}</span>
                </div>
                <span className="text-sm font-medium figma-text-secondary">{item.progress}%</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    item.progress === 100
                      ? 'bg-green-500'
                      : item.progress >= 90
                      ? 'bg-indigo-500'
                      : 'bg-indigo-500'
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
