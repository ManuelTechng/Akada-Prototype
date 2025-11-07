import { useTheme } from '../../contexts/ThemeContext';
import { GlassWelcomeCardDark } from '../glass/GlassWelcomeCardDark';
import { GlassWelcomeCard } from '../glass/GlassWelcomeCard';
import { GlassStatsGridDark } from '../glass/GlassStatsGridDark';
import { GlassStatsGrid } from '../glass/GlassStatsGrid';
import { GlassActionCardDark } from '../glass/GlassActionCardDark';
import { GlassActionCard } from '../glass/GlassActionCard';
import { ProfileCompletionWidget } from '../widgets/ProfileCompletionWidget';
import { NotificationsWidget } from '../widgets/NotificationsWidget';
import { RecentActivitiesWidget } from '../widgets/RecentActivitiesWidget';
import { ApplicationWidget } from '../widgets/ApplicationWidget';
import { CostAnalysisWidget } from '../widgets/CostAnalysisWidget';
import { QuickActionsWidget } from '../widgets/QuickActionsWidget';
import { ProgramRecommendationsWidget } from '../widgets/ProgramRecommendationsWidget';

export default function FigmaDashboard() {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 sm:space-y-6">
        {/* Hero Section with Glass Cards */}
        <div className="space-y-4 sm:space-y-5">
          {isDarkTheme ? <GlassWelcomeCardDark /> : <GlassWelcomeCard />}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
            <div className="xl:col-span-2">
              {isDarkTheme ? <GlassStatsGridDark /> : <GlassStatsGrid />}
            </div>
            <div>
              {isDarkTheme ? <GlassActionCardDark /> : <GlassActionCard />}
            </div>
          </div>
        </div>

        {/* Profile Completion | Notifications | Recent Activities */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          <ProfileCompletionWidget />
          <NotificationsWidget />
          <RecentActivitiesWidget />
        </div>

        {/* Application Timeline | Cost Analysis | Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          <ApplicationWidget />
          <CostAnalysisWidget />
          <QuickActionsWidget />
        </div>

        {/* Program Recommendations */}
        <div className="grid grid-cols-1">
          <ProgramRecommendationsWidget />
        </div>

        {/* Footer */}
        <footer className="mt-10 sm:mt-12 pt-5 sm:pt-6 border-t border-white/10 text-center">
          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">
            © 2025 Akada - All rights Reserved
          </p>
        </footer>
    </div>
  );
}
