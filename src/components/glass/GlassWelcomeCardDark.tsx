import { Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useTimeBasedGreeting, getMotivationalSubtitle } from '../../hooks/useTimeBasedGreeting';
import { useMemo } from 'react';

/**
 * Render a dark, glass-styled welcome card personalized with the current user's display name and a time-based greeting.
 *
 * The card shows the local time and time-of-day label, a greeting with an emoji, a motivational subtitle, and a circular action icon.
 *
 * @returns A JSX element representing the personalized welcome card.
 */
export function GlassWelcomeCardDark() {
  const { user } = useAuth();
  const greetingData = useTimeBasedGreeting();

  // Extract first name from user's full name or email
  const displayName = useMemo(() => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'there';
  }, [user]);

  const subtitle = getMotivationalSubtitle(greetingData.period);

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-gray-900/45 backdrop-blur-2xl border border-white/10 px-6 py-8 sm:px-10 sm:py-10 xl:px-14 xl:py-14 shadow-[0_38px_80px_-44px_rgba(14,20,45,0.85)] min-h-[180px] sm:min-h-[190px] xl:min-h-[210px]">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/28 via-purple-600/22 to-sky-500/16" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.22),transparent_55%)]" />
      <div className="absolute top-[-120px] right-[-140px] h-[240px] w-[240px] sm:h-[280px] sm:w-[280px] rounded-full bg-indigo-500/35 blur-[130px]" />
      <div className="absolute bottom-[-130px] left-[-120px] h-[220px] w-[220px] sm:h-[260px] sm:w-[260px] rounded-full bg-fuchsia-500/28 blur-[120px]" />

      <div className="relative z-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 space-y-3 xl:space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/55">
              {greetingData.timeOfDay} • {greetingData.localTime}
            </p>
            <h2 className="text-2xl sm:text-3xl xl:text-[2.25rem] font-semibold text-white leading-[1.1]">
              {greetingData.greeting}, {displayName}! Keep the momentum going {greetingData.emoji}
            </h2>
            <p className="text-sm sm:text-base xl:text-lg text-white/80 max-w-2xl">
              {subtitle}
            </p>
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="h-12 w-12 sm:h-14 sm:w-14 xl:h-[3.75rem] xl:w-[3.75rem] bg-white/12 hover:bg-white/22 backdrop-blur-md border border-white/25 text-white shadow-[0_20px_40px_-28px_rgba(79,114,255,0.8)] self-start lg:self-center"
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 xl:w-[1.65rem] xl:h-[1.65rem]" />
          </Button>
        </div>
      </div>
    </div>
  );
}