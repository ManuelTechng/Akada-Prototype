import { Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

export function GlassWelcomeCardDark() {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-gray-900/40 backdrop-blur-2xl border border-white/10 px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12 shadow-[0_40px_70px_-40px_rgba(14,20,45,0.8)] min-h-[200px] sm:min-h-[220px]">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-purple-600/25 to-sky-500/20" />
      
      {/* Decorative blurred circles */}
      <div className="absolute top-[-90px] right-[-120px] h-[220px] w-[220px] sm:h-[260px] sm:w-[260px] rounded-full bg-indigo-500/35 blur-[120px]" />
      <div className="absolute bottom-[-110px] left-[-100px] h-[200px] w-[200px] sm:h-[240px] sm:w-[240px] rounded-full bg-fuchsia-500/30 blur-[110px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_55%)]" />
      
      <div className="relative z-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-[2.2rem] font-semibold text-white leading-tight">
              Good afternoon, Tosin! Keep the momentum going 💪
            </h2>
            <p className="text-base sm:text-lg text-white/80 max-w-2xl">
              Every application brings you closer to success ✨
            </p>
          </div>
          <Button 
            variant="secondary" 
            size="icon"
            className="h-12 w-12 sm:h-14 sm:w-14 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white shadow-lg self-start sm:self-auto"
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}