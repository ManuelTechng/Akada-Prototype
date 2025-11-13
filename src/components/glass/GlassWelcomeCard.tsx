import { Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useTimeBasedGreeting, getMotivationalSubtitle } from '../../hooks/useTimeBasedGreeting';
import { useMemo } from 'react';

interface GlassWelcomeCardProps {
  userName?: string;
  greeting?: string;
  subtitle?: string;
}

/**
 * Render a glass-style welcome card that displays a time-aware greeting, a derived or provided display name, the current local time, and a motivational subtitle.
 *
 * @param userName - Optional override for the displayed user name; if omitted the component derives a first name from authenticated user metadata or email, falling back to "there"
 * @param greeting - Optional override for the greeting text (e.g., "Good afternoon"); if omitted the component uses the time-based greeting
 * @param subtitle - Optional override for the subtitle; if omitted the component selects a motivational subtitle based on the current time period
 * @returns A JSX element representing the styled welcome card containing the time-of-day and local time line, the greeting line with emoji, a subtitle paragraph, and an action button with a sparkles icon
 */
export function GlassWelcomeCard({
  userName,
  greeting: customGreeting,
  subtitle: customSubtitle,
}: GlassWelcomeCardProps) {
  const { user } = useAuth();
  const greetingData = useTimeBasedGreeting();

  // Extract first name from user's full name or email
  const displayName = useMemo(() => {
    if (userName) return userName;
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'there';
  }, [userName, user]);

  const greeting = customGreeting || greetingData.greeting;
  const subtitle = customSubtitle || getMotivationalSubtitle(greetingData.period);

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 px-6 py-8 sm:px-10 sm:py-10 xl:px-14 xl:py-14 shadow-xl min-h-[180px] sm:min-h-[190px] xl:min-h-[210px]">
      {/* Decorative blurred circles for depth */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl -ml-24 -mb-24" />

      <div className="relative z-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 space-y-3 xl:space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/70">
              {greetingData.timeOfDay} • {greetingData.localTime}
            </p>
            <h2 className="text-2xl sm:text-3xl xl:text-[2.25rem] font-semibold text-white leading-[1.1]">
              {greeting}, {displayName}! Keep the momentum going {greetingData.emoji}
            </h2>
            <p className="text-sm sm:text-base xl:text-lg text-white/90 max-w-2xl">
              {subtitle}
            </p>
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="h-12 w-12 sm:h-14 sm:w-14 xl:h-[3.75rem] xl:w-[3.75rem] bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white shadow-lg self-start lg:self-center"
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 xl:w-[1.65rem] xl:h-[1.65rem]" />
          </Button>
        </div>
      </div>
    </div>
  );
}


