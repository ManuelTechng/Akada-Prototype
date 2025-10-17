import { Button } from '../ui/button';
import { ArrowRight, Target } from 'lucide-react';

export function GlassActionCardDark() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gray-900/40 backdrop-blur-2xl border border-white/10 p-5 sm:p-6 shadow-lg">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/35 via-purple-600/25 to-sky-500/20" />

      {/* Animated shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-sm">
            <Target className="w-6 h-6 text-indigo-300" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-indigo-300 uppercase tracking-wider">Next Best Action</span>
              <div className="h-1 w-1 rounded-full bg-indigo-400/60" />
              <span className="text-xs text-white/60">Recommended</span>
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">Continue building your profile</h3>
            <p className="text-white/75 text-sm mb-4">
              Complete your profile to unlock more opportunities
            </p>

            <Button
              size="sm"
              className="rounded-xl bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg"
            >
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative corner */}
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-tl-full" />
    </div>
  );
}