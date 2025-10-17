import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, RefreshCw, CheckCircle2, Eye } from 'lucide-react';
import { useState } from 'react';

const applications = [
  {
    title: 'Master in Informatics - Program...',
    university: 'University of Oslo, Norway',
    dueDate: '28/12/2025',
    timeLeft: '2 months left',
    status: 'Submitted',
    statusColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    gradient: 'from-[#1a2f56]/70 to-[#152344]/80',
  },
  {
    title: 'Computer Science Masters',
    university: 'Stanford University, USA',
    dueDate: '15/11/2025',
    timeLeft: '1 month left',
    status: 'In Progress',
    statusColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    gradient: 'from-[#33263d]/70 to-[#211731]/80',
  },
];

const tabs = [
  { label: 'All', count: 1 },
  { label: 'Urgent', count: null },
  { label: 'Upcoming', count: null },
];

const cardClass =
  'relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-lg shadow-slate-200/40 dark:border-white/10 dark:bg-gradient-to-br dark:from-[#151f42]/95 dark:via-[#0c152d]/95 dark:to-[#060c19]/95 dark:shadow-[0_28px_60px_-28px_rgba(7,12,28,0.85)]';

export function ApplicationWidget() {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <Card className={`${cardClass} p-5 sm:p-6`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/40 dark:bg-indigo-500/20">
            <Calendar className="w-5 h-5 text-indigo-500 dark:text-indigo-300" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Application Timeline</h3>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white">
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300/80 mb-6">Track deadlines and never miss an opportunity</p>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-2xl bg-slate-100/70 dark:bg-white/5 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`flex-1 px-4 py-2 rounded-md text-sm transition-all ${
              activeTab === tab.label
                ? 'bg-white shadow-sm text-slate-900 dark:bg-[#1f2d55]/90 dark:text-white dark:shadow-[0_18px_34px_-20px_rgba(20,38,76,0.8)]'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-300/80 dark:hover:text-white'
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
      <div className="mb-6 pl-4 border-l-2 border-indigo-500/60">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-4 h-4 text-indigo-500 dark:text-indigo-300" />
          <p className="text-slate-900 dark:text-white">1 application submitted!</p>
        </div>
        <p className="text-sm text-indigo-600 dark:text-indigo-300">Explore more programs or prepare for interviews</p>
      </div>

      {/* Application Cards */}
      <div className="space-y-3">
        {applications.map((app, index) => (
          <div
            key={index}
            className={`p-5 rounded-2xl border border-slate-200/60 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg bg-gradient-to-br ${app.gradient} dark:border-white/8 dark:hover:border-white/16 dark:text-white dark:shadow-[0_22px_36px_-26px_rgba(18,33,63,0.85)]`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-1">{app.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300/80">{app.university}</p>
              </div>
              <Badge className={`${app.statusColor} border px-3 py-1 rounded-full text-xs font-semibold shadow-none`}>
                {app.status}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300/80 mb-2">
              <Calendar className="w-4 h-4" />
              <span>Due: {app.dueDate}</span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-200 mb-4">{app.timeLeft}</p>

            <Button 
              variant="secondary"
              className="w-full justify-center rounded-xl bg-slate-900/10 text-slate-900 hover:bg-slate-900/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 border border-slate-200/60 dark:border-white/10"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

