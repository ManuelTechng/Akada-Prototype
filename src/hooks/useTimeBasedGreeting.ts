import { useState, useEffect } from 'react';

export interface TimeBasedGreeting {
  greeting: string;
  emoji: string;
  period: 'morning' | 'afternoon' | 'evening' | 'night';
  timeOfDay: string;
  localTime: string;
}

export const useTimeBasedGreeting = () => {
  const [greetingData, setGreetingData] = useState<TimeBasedGreeting>(() =>
    calculateGreeting()
  );

  /**
   * Create a TimeBasedGreeting object that reflects the current local time.
   *
   * The returned object includes a human-friendly greeting and emoji chosen from the local hour,
   * a period label (`morning` | `afternoon` | `evening` | `night`), a `timeOfDay` string (weekday, month, day),
   * and `localTime` formatted for en-US with hour and minute in 12-hour notation.
   *
   * @returns A TimeBasedGreeting containing `greeting`, `emoji`, `period`, `timeOfDay`, and `localTime` for the current local time.
   */
  function calculateGreeting(): TimeBasedGreeting {
    const now = new Date();
    const hour = now.getHours();

    let greeting: string;
    let emoji: string;
    let period: TimeBasedGreeting['period'];

    // Determine greeting based on hour (using user's local time)
    if (hour >= 5 && hour < 12) {
      greeting = 'Good morning';
      emoji = '🌅';
      period = 'morning';
    } else if (hour >= 12 && hour < 17) {
      greeting = 'Good afternoon';
      emoji = '☀️';
      period = 'afternoon';
    } else if (hour >= 17 && hour < 21) {
      greeting = 'Good evening';
      emoji = '🌆';
      period = 'evening';
    } else {
      greeting = 'Good night';
      emoji = '🌙';
      period = 'night';
    }

    // Format local time
    const localTime = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // Get time of day description
    const timeOfDay = now.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    return {
      greeting,
      emoji,
      period,
      timeOfDay,
      localTime,
    };
  }

  // Update greeting every minute to keep it current
  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingData(calculateGreeting());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return greetingData;
};

export const getMotivationalSubtitle = (
  period: TimeBasedGreeting['period']
): string => {
  const subtitles = {
    morning: [
      'Start your day strong! Every application brings you closer to success ✨',
      'Rise and shine! Your dream university awaits 🎓',
      'A new day, new opportunities! Let\'s make it count 🌟',
      'Fresh start, fresh goals! You\'ve got this 💪',
    ],
    afternoon: [
      'Keep the momentum going! You\'re making great progress 💪',
      'Halfway through the day - stay focused on your goals 🎯',
      'Every step counts! Keep pushing forward 🚀',
      'You\'re doing amazing! Keep up the great work ⭐',
    ],
    evening: [
      'Finish strong! A little progress each day adds up 🌟',
      'Evening hustle! Your future self will thank you 🙌',
      'Great time to review your applications and plan ahead 📝',
      'Winding down with purpose! Tomorrow starts today 🌆',
    ],
    night: [
      'Night owl? Your dedication is impressive! 🦉',
      'Late-night planning pays off! Rest well after this 💤',
      'Burning the midnight oil? Don\'t forget to rest too 🌙',
      'Your hard work will pay off! But remember to sleep 😴',
    ],
  };

  const options = subtitles[period];
  return options[Math.floor(Math.random() * options.length)];
};