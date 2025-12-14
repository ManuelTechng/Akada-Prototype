import { DarkSidebar } from './components/DarkSidebar';
import { LightSidebar } from './components/LightSidebar';
import { DarkHeader } from './components/DarkHeader';
import { LightHeader } from './components/LightHeader';
import { GlassWelcomeCardDark } from './components/GlassWelcomeCardDark';
import { GlassStatsGridDark } from './components/GlassStatsGridDark';
import { GlassActionCardDark } from './components/GlassActionCardDark';
import { GlassWelcomeCard } from './components/GlassWelcomeCard';
import { GlassStatsGrid } from './components/GlassStatsGrid';
import { GlassActionCard } from './components/GlassActionCard';
import { NotificationsWidget } from './components/NotificationsWidget';
import { NotificationsWidgetLight } from './components/NotificationsWidgetLight';
import { RecentActivitiesWidget } from './components/RecentActivitiesWidget';
import { RecentActivitiesWidgetLight } from './components/RecentActivitiesWidgetLight';
import { QuickActionsWidget } from './components/QuickActionsWidget';
import { QuickActionsWidgetLight } from './components/QuickActionsWidgetLight';
import { ProfileCompletionWidget } from './components/ProfileCompletionWidget';
import { ProfileCompletionWidgetLight } from './components/ProfileCompletionWidgetLight';
import { ApplicationWidget } from './components/ApplicationWidget';
import { ApplicationWidgetLight } from './components/ApplicationWidgetLight';
import { CostAnalysisWidget } from './components/CostAnalysisWidget';
import { CostAnalysisWidgetLight } from './components/CostAnalysisWidgetLight';
import { ThemeProvider, useTheme } from './components/ThemeProvider';

function AppContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`flex h-screen overflow-hidden ${
      isDark 
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' 
        : 'bg-gradient-to-br from-indigo-50/30 via-purple-50/20 to-pink-50/30'
    }`}>
      {/* Background Effects */}
      {isDark ? (
        <>
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.08),transparent_50%)]" />
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(139,92,246,0.08),transparent_50%)]" />
        </>
      ) : (
        <>
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_60%)]" />
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.12),transparent_60%)]" />
        </>
      )}
      
      {isDark ? <DarkSidebar /> : <LightSidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {isDark ? <DarkHeader /> : <LightHeader />}
        
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Hero Section with Glass Cards */}
            <div className="space-y-4">
              {isDark ? <GlassWelcomeCardDark /> : <GlassWelcomeCard />}
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  {isDark ? <GlassStatsGridDark /> : <GlassStatsGrid />}
                </div>
                <div>
                  {isDark ? <GlassActionCardDark /> : <GlassActionCard />}
                </div>
              </div>
            </div>

            {/* Profile Completion | Notifications | Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {isDark ? <ProfileCompletionWidget /> : <ProfileCompletionWidgetLight />}
              {isDark ? <NotificationsWidget /> : <NotificationsWidgetLight />}
              {isDark ? <RecentActivitiesWidget /> : <RecentActivitiesWidgetLight />}
            </div>

            {/* Application Timeline | Cost Analysis | Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                {isDark ? <ApplicationWidget /> : <ApplicationWidgetLight />}
              </div>

              <div>
                {isDark ? <CostAnalysisWidget /> : <CostAnalysisWidgetLight />}
              </div>

              <div>
                {isDark ? <QuickActionsWidget /> : <QuickActionsWidgetLight />}
              </div>
            </div>

            {/* Footer */}
            <footer className={`mt-12 pt-6 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} text-center`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                © 2025 Akada - All rights Reserved
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
