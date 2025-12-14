import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, RefreshCw, CheckCircle2, Eye } from 'lucide-react';
import { useState } from 'react';
import { useApplicationTimeline } from '../../hooks/useDashboard';
import { useNavigate } from 'react-router-dom';

export function ApplicationWidget() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const { timelineData, loading, refetchTimeline, getDaysUntilDeadline } = useApplicationTimeline();

  const handleRefresh = async () => {
    await refetchTimeline();
  };

  if (loading) {
    return (
      <Card className="figma-card">
        <div className="figma-card-content">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  const applications = timelineData?.applications || [];
  const urgentCount = timelineData?.urgentCount || 0;
  const upcomingCount = timelineData?.upcomingDeadlines?.length || 0;
  const submittedCount = timelineData?.completedApplications?.length || 0;

  // Filter applications based on active tab
  const filteredApplications = activeTab === 'Urgent'
    ? applications.filter(app => {
        const daysLeft = getDaysUntilDeadline(app.deadline);
        return daysLeft <= 7 && daysLeft > 0 && app.status !== 'submitted';
      })
    : activeTab === 'Upcoming'
    ? timelineData?.upcomingDeadlines || []
    : applications.slice(0, 2); // Show first 2 for 'All'

  const tabs = [
    { label: 'All', count: applications.length },
    { label: 'Urgent', count: urgentCount },
    { label: 'Upcoming', count: upcomingCount },
  ];

  // Helper function to format application data for display
  const formatApplication = (app: any) => {
    const daysLeft = getDaysUntilDeadline(app.deadline);
    const isSubmitted = ['submitted', 'accepted', 'rejected'].includes(app.status);

    return {
      id: app.id,
      title: app.programs?.name || 'Unknown Program',
      university: `${app.programs?.university || 'Unknown'}, ${app.programs?.country || ''}`,
      dueDate: new Date(app.deadline).toLocaleDateString('en-GB'),
      timeLeft: daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Overdue',
      status: isSubmitted ? 'Submitted' : 'In Progress',
      statusColor: isSubmitted
        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
        : 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      borderColor: isSubmitted ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-orange-500',
      bgColor: isSubmitted ? 'bg-teal-50/80 dark:bg-teal-900/20' : 'bg-green-50/80 dark:bg-green-900/20',
      borderClass: isSubmitted ? 'border-teal-200 dark:border-teal-800/30' : 'border-green-200 dark:border-green-800/30',
    };
  };

  return (
    <Card className="figma-card">
      <div className="figma-card-content">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/40 dark:bg-indigo-500/20">
              <Calendar className="w-5 h-5 text-indigo-500 dark:text-indigo-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold figma-text-primary">Application Timeline</h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="figma-text-secondary hover:figma-text-primary"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        <p className="text-sm figma-text-secondary mb-6">Track deadlines and never miss an opportunity</p>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl bg-gray-100 dark:bg-white/5 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.label
                  ? 'bg-gray-900 dark:bg-white/10 text-white shadow-sm'
                  : 'figma-text-secondary hover:figma-text-primary'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 text-xs opacity-70">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Status Message */}
        {submittedCount > 0 && (
          <div className="mb-6 pl-4 border-l-2 border-indigo-500/60">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 dark:text-indigo-300" />
              <p className="figma-text-primary">{submittedCount} application{submittedCount !== 1 ? 's' : ''} submitted!</p>
            </div>
            <p className="text-sm text-indigo-600 dark:text-indigo-300">Explore more programs or prepare for interviews</p>
          </div>
        )}

        {/* Empty State */}
        {filteredApplications.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-sm figma-text-secondary mb-4">
              {activeTab === 'All'
                ? 'No applications yet. Save programs to get started!'
                : `No ${activeTab.toLowerCase()} applications`}
            </p>
            <Button
              onClick={() => navigate('/app/programs')}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Explore Programs
            </Button>
          </div>
        )}

        {/* Application Cards */}
        <div className="space-y-3">
          {filteredApplications.map((app) => {
            const formattedApp = formatApplication(app);
            return (
              <div
                key={formattedApp.id}
                className={`p-5 rounded-lg border text-left shadow-sm transition-all hover:shadow-md ${formattedApp.borderColor} ${formattedApp.bgColor} ${formattedApp.borderClass}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold figma-text-primary mb-1">{formattedApp.title}</h4>
                    <p className="text-sm figma-text-secondary">{formattedApp.university}</p>
                  </div>
                  <Badge className={`${formattedApp.statusColor} border px-3 py-1 rounded-full text-xs font-semibold shadow-none`}>
                    {formattedApp.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm figma-text-secondary mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {formattedApp.dueDate}</span>
                </div>

                <p className="text-sm figma-text-secondary mb-4">{formattedApp.timeLeft}</p>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/app/applications/${formattedApp.id}`)}
                  className="w-full justify-center rounded-lg bg-white/10 figma-text-primary hover:bg-white/20 border border-white/10"
                >
                  <Eye className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">View Details</span>
                  <span className="sm:hidden">Details</span>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}


