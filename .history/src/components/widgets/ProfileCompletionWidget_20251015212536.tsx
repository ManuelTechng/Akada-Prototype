import { Card } from '../ui/card';
import { CheckCircle2 } from 'lucide-react';

const profileItems = [
  { label: 'Personal Information', progress: 100, complete: true },
  { label: 'Study Preferences', progress: 100, complete: true },
  { label: 'English Test Scores', progress: 100, complete: true },
  { label: 'Academic Timeline', progress: 90, complete: false },
  { label: 'Financial Budget', progress: 75, complete: false },
  { label: 'Personal Profile', progress: 100, complete: true },
];

const cardClass =
  'relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-lg shadow-slate-200/40 dark:border-white/10 dark:bg-gradient-to-br dark:from-[#121d3f]/95 dark:via-[#0b1227]/95 dark:to-[#050914]/95 dark:shadow-[0_28px_60px_-28px_rgba(7,12,28,0.85)]';

export function ProfileCompletionWidget() {
  const overallProgress = Math.round(
    profileItems.reduce((acc, item) => acc + item.progress, 0) / profileItems.length
  );

  return (
    <Card className={`${cardClass} p-5 sm:p-6`}
      >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mb-6">
        <div className="relative self-center sm:self-auto">
          <svg className="w-20 sm:w-24 h-20 sm:h-24 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="32"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-slate-200/30 dark:text-slate-800/80"
            />
            <circle
              cx="40"
              cy="40"
              r="32"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 32}`}
              strokeDashoffset={`${2 * Math.PI * 32 * (1 - overallProgress / 100)}`}
              className="text-emerald-500"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">{overallProgress}%</div>
            </div>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Profile Completion</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300/80 mb-2 sm:mb-3">
            Profile completion: {overallProgress}%
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-green-400">
            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
            <span className="text-emerald-400">Profile complete! 🎉</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {profileItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-xl px-3 py-2 bg-slate-100/40 dark:bg-white/5 border border-transparent dark:border-white/5">
            <div className="flex items-center gap-2 sm:gap-3">
              <CheckCircle2
                className={`w-3 h-3 sm:w-4 sm:h-4 ${item.complete ? 'text-emerald-400' : 'text-slate-400'}`}
              />
              <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">{item.progress}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
