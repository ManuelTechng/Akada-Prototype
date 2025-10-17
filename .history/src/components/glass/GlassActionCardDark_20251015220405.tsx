import { Button } from '../ui/button';
import { ArrowRight, Target } from 'lucide-react';

export function GlassActionCardDark() {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-gray-900/40 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-[0_34px_70px_-42px_rgba(16,28,58,0.9)] min-h-[220px] flex flex-col justify-between">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/35 via-purple-600/25 to-sky-500/20" />
      
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-lg">
            <Target className="w-7 h-7 text-indigo-300" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-[0.2em] text-white/50">
              <span>Next Best Action</span>
              <div className="h-1 w-1 rounded-full bg-white/40" />
              <span>Recommended</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">Continue building your profile</h3>
            <p className="text-sm sm:text-base text-white/75 mb-5 max-w-xl">
              Complete your profile to unlock more opportunities
            </p>
            
            <Button 
              className="rounded-xl bg-indigo-500 text-white hover:bg-indigo-400 shadow-[0_22px_40px_-24px_rgba(76,114,255,0.75)] px-5 py-2 text-sm font-semibold"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Decorative corner */}
      <div className="absolute bottom-[-80px] right-[-80px] h-44 w-44 rounded-full border border-white/10 bg-white/15 blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-tl-[32px]" />
    </div>
  );
}