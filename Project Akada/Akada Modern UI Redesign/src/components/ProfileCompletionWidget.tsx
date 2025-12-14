import { Card } from './ui/card';
import { CheckCircle2 } from 'lucide-react';

const profileItems = [
  { label: 'Personal Information', progress: 100, complete: true },
  { label: 'Study Preferences', progress: 100, complete: true },
  { label: 'English Test Scores', progress: 100, complete: true },
  { label: 'Academic Timeline', progress: 90, complete: false },
  { label: 'Financial Budget', progress: 75, complete: false },
  { label: 'Personal Profile', progress: 100, complete: true },
];

export function ProfileCompletionWidget() {
  const overallProgress = Math.round(
    profileItems.reduce((acc, item) => acc + item.progress, 0) / profileItems.length
  );

  return (
    <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 p-6">
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
              className="text-gray-800"
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
              <div className="text-2xl text-white">{overallProgress}%</div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-white mb-1">Profile Completion</h3>
          <p className="text-sm text-gray-400 mb-3">
            Profile completion: {overallProgress}%
          </p>
          <div className="flex items-center gap-2 text-xs text-green-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile complete! 🎉</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {profileItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 
                className={`w-4 h-4 ${item.complete ? 'text-green-500' : 'text-gray-600'}`}
              />
              <span className="text-sm text-gray-300">{item.label}</span>
            </div>
            <span className="text-sm text-gray-500">{item.progress}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
