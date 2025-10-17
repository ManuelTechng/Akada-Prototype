import { GlassWelcomeCardDark } from '../glass/GlassWelcomeCardDark';
import { GlassStatsGridDark } from '../glass/GlassStatsGridDark';
import { GlassActionCardDark } from '../glass/GlassActionCardDark';
import { ProfileCompletionWidget } from '../widgets/ProfileCompletionWidget';
import { NotificationsWidget } from '../widgets/NotificationsWidget';
import { RecentActivitiesWidget } from '../widgets/RecentActivitiesWidget';
import { ApplicationWidget } from '../widgets/ApplicationWidget';
import { CostAnalysisWidget } from '../widgets/CostAnalysisWidget';
import { QuickActionsWidget } from '../widgets/QuickActionsWidget';

export default function FigmaDashboard() {
  return (
    <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
        {/* Hero Section with Glass Cards */}
        <div className="space-y-4">
          <GlassWelcomeCardDark />
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <GlassStatsGridDark />
            </div>
            <div>
              <GlassActionCardDark />
            </div>
          </div>
        </div>

        {/* Profile Completion | Notifications | Recent Activities */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <ProfileCompletionWidget />
          <NotificationsWidget />
          <RecentActivitiesWidget />
        </div>

        {/* Application Timeline | Cost Analysis | Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <ApplicationWidget />
          <CostAnalysisWidget />
          <QuickActionsWidget />
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-gray-400">
            © 2025 Akada - All rights Reserved
          </p>
        </footer>
      </div>
    </main>
  );
}
