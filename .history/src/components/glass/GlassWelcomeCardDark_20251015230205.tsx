import { Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

export function GlassWelcomeCardDark() {
  return (
    <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gray-900/45 backdrop-blur-2xl px-8 py-10 sm:px-12 sm:py-12 shadow-[0_36px_90px_-42px_rgba(16,22,58,0.85)]">
      <div className="absolute inset-0 bg-gradient-to-r from-[#1f2a68]/65 via-[#4b2f93]/55 to-[#6031b8]/50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.18),transparent_58%)]" />
      <div className="absolute bottom-[-140px] right-[-100px] h-[260px] w-[260px] rounded-full bg-indigo-500/35 blur-[120px]" />

      <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-[2.6rem] font-semibold text-white leading-[1.1]">
            Good afternoon, Tosin! Keep the momentum going 💪
          </h2>
          <p className="text-base sm:text-lg text-white/80 max-w-2xl">
            Every application brings you closer to success ✨
          </p>
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="h-12 w-12 sm:h-14 sm:w-14 bg-white/12 hover:bg-white/22 backdrop-blur-md border border-white/25 text-white shadow-[0_20px_40px_-28px_rgba(79,114,255,0.8)]"
        >
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>
    </div>
  );
}