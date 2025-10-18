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

export function ProfileCompletionWidgetLight() {
  const overallProgress = Math.round(
    profileItems.reduce((acc, item) => acc + item.progress, 0) / profileItems.length
  );

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-indigo-100 p-6 shadow-sm">
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
              className="text-gray-200"
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
              <div className="text-2xl text-gray-900">{overallProgress}%</div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-gray-900 mb-1">Profile Completion</h3>
          <p className="text-sm text-gray-600">
            You're almost there! Keep building momentum
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {profileItems.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.complete ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                )}
                <span className={`text-sm ${item.complete ? 'text-gray-900' : 'text-gray-600'}`}>
                  {item.label}
                </span>
              </div>
              <span className="text-xs text-gray-500">{item.progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  item.complete ? 'bg-green-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
