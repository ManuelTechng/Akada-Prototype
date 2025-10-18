import { Button } from '../ui/button';
import { ArrowRight, Target } from 'lucide-react';

export function GlassActionCardDark() {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-gray-900/45 backdrop-blur-2xl border border-white/10 px-6 py-8 sm:px-8 sm:py-10 shadow-[0_34px_70px_-42px_rgba(16,28,58,0.9)] max-w-[440px] w-full min-h-[200px]">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/28 via-indigo-600/25 to-purple-500/20" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0)_100%)] opacity-60" />
      <div className="absolute bottom-[-84px] right-[-84px] h-40 w-40 rounded-full bg-white/12" />

      <div className="relative z-10 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/12 border border-white/20 flex items-center justify-center text-indigo-200 shadow-lg">
          <Target className="h-5 w-5" />
        </div>

        <div className="flex-1 space-y-5">
          <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.3em] text-white/55">
            <span>Next Best Action</span>
            <span className="inline-block h-1 w-1 rounded-full bg-white/45" />
            <span className="tracking-[0.24em]">Recommended</span>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl sm:text-[1.45rem] font-semibold text-white leading-7">
              Continue building your profile
            </h3>
            <p className="text-sm sm:text-base text-white/75">
              Complete your profile to unlock more opportunities
            </p>
          </div>

          <Button className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_18px_36px_-22px_rgba(76,114,255,0.85)] hover:bg-indigo-400">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}