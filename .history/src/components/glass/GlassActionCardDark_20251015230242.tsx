import { Button } from '../ui/button';
import { ArrowRight, Target } from 'lucide-react';

export function GlassActionCardDark() {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gray-900/45 backdrop-blur-2xl px-6 py-8 sm:px-8 sm:py-9 shadow-[0_30px_80px_-44px_rgba(16,24,64,0.88)] max-w-[440px] w-full">
      <div className="absolute inset-0 bg-gradient-to-br from-[#342f9d]/55 via-[#4b30b3]/45 to-[#6431bd]/38" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.12)_52%,rgba(255,255,255,0)_100%)] opacity-70" />
      <div className="absolute bottom-[-110px] right-[-120px] h-[240px] w-[240px] rounded-full bg-purple-400/25 blur-[120px]" />
      <div className="absolute bottom-[-55px] right-[-55px] h-32 w-32 rounded-full bg-white/12" />

      <div className="relative z-10 flex gap-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/18 bg-white/12 text-indigo-200 shadow-lg">
          <Target className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-5">
          <div className="flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.28em] text-white/60">
            <span>Next Best Action</span>
            <span aria-hidden="true" className="text-white/50">•</span>
            <span className="tracking-[0.24em]">Recommended</span>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl sm:text-[1.5rem] font-semibold text-white leading-7">
              Continue building your profile
            </h3>
            <p className="text-sm sm:text-base text-white/75">
              Complete your profile to unlock more opportunities
            </p>
          </div>
          <Button className="inline-flex items-center gap-2 rounded-2xl bg-[#615FFF] px-5 py-2 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(97,95,255,0.85)] hover:bg-[#6f6cff]">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}