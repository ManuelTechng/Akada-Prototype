import { ModernHeader } from './components/ModernHeader';
import { MetricCard } from './components/MetricCard';
import { ProgressChart } from './components/ProgressChart';
import { ActivityFeed } from './components/ActivityFeed';
import { QuickStatsCard } from './components/QuickStatsCard';
import { UpcomingDeadlines } from './components/UpcomingDeadlines';
import { GlassWelcomeCardDark } from './components/GlassWelcomeCardDark';
import { GlassStatsGridDark } from './components/GlassStatsGridDark';
import { GlassActionCardDark } from './components/GlassActionCardDark';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { 
  GraduationCap, 
  FileText, 
  Target, 
  Award,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function AppDark() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Dark background pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.05),transparent_50%)]" />
      
      <div className="relative z-10">
        <ModernHeader />
        
        <main className="max-w-[1400px] mx-auto px-8 py-8">
          {/* Glass Hero Section */}
          <div className="mb-8 space-y-4">
            <GlassWelcomeCardDark />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <GlassStatsGridDark />
              </div>
              <div>
                <GlassActionCardDark />
              </div>
            </div>
          </div>

          {/* Top Metrics - Dark Mode Adapted */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 p-6 hover:shadow-2xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm text-gray-400">Total Applications</span>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <span>↑ 12%</span>
                </div>
              </div>
              <div className="text-3xl text-white mb-2">18</div>
              <p className="text-sm text-gray-400">vs last month</p>
            </Card>

            <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 p-6 hover:shadow-2xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm text-gray-400">Saved Programs</span>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <span>↑ 8%</span>
                </div>
              </div>
              <div className="text-3xl text-white mb-2">24</div>
              <p className="text-sm text-gray-400">5 new this week</p>
            </Card>

            <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 p-6 hover:shadow-2xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm text-gray-400">Profile Score</span>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <span>↑ 5%</span>
                </div>
              </div>
              <div className="text-3xl text-white mb-2">95%</div>
              <p className="text-sm text-gray-400">Above average</p>
            </Card>

            <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 p-6 hover:shadow-2xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm text-gray-400">Response Rate</span>
                <div className="flex items-center gap-1 text-xs text-red-400">
                  <span>↓ 3%</span>
                </div>
              </div>
              <div className="text-3xl text-white mb-2">72%</div>
              <p className="text-sm text-gray-400">Awaiting 5 responses</p>
            </Card>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 p-6">
                <div className="mb-6">
                  <h3 className="text-lg text-white mb-1">Application Progress</h3>
                  <p className="text-sm text-gray-400">Your activity over the last 6 months</p>
                </div>
                <ProgressChart />
              </Card>
            </div>
            <div>
              <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 p-6">
                <div className="mb-6">
                  <h3 className="text-lg text-white mb-1">Quick Stats</h3>
                  <p className="text-sm text-gray-400">Application readiness overview</p>
                </div>
                <div className="space-y-5">
                  {[
                    { label: 'Profile Completion', value: 100, total: 100, color: 'bg-green-500' },
                    { label: 'Applications Submitted', value: 18, total: 25, color: 'bg-indigo-500' },
                    { label: 'Documents Ready', value: 12, total: 15, color: 'bg-purple-500' },
                    { label: 'Recommendations', value: 3, total: 5, color: 'bg-blue-500' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">{stat.label}</span>
                        <span className="text-sm text-gray-400">
                          {stat.value}/{stat.total}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${stat.color} rounded-full transition-all`}
                          style={{ width: `${(stat.value / stat.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div>
            <h2 className="text-lg text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 p-6 hover:shadow-2xl hover:border-indigo-500/50 transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors border border-indigo-500/30">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-white mb-1">Browse Programs</h3>
                <p className="text-sm text-gray-400 mb-4">Discover new opportunities</p>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </Card>

              <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 p-6 hover:shadow-2xl hover:border-purple-500/50 transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:text-white transition-colors border border-purple-500/30">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-white mb-1">Submit Application</h3>
                <p className="text-sm text-gray-400 mb-4">Continue your progress</p>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </Card>

              <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 p-6 hover:shadow-2xl hover:border-green-500/50 transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center mb-4 group-hover:bg-green-500 group-hover:text-white transition-colors border border-green-500/30">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-white mb-1">Track Progress</h3>
                <p className="text-sm text-gray-400 mb-4">Monitor applications</p>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
              </Card>

              <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 p-6 hover:shadow-2xl hover:border-orange-500/50 transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors border border-orange-500/30">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-white mb-1">Scholarships</h3>
                <p className="text-sm text-gray-400 mb-4">Find financial aid</p>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
