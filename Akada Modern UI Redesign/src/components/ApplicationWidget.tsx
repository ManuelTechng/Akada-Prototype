import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, RefreshCw, CheckCircle2, Eye } from 'lucide-react';
import { useState } from 'react';

const applications = [
  {
    title: 'Master in Informatics - Program...',
    university: 'University of Oslo, Norway',
    dueDate: '28/12/2025',
    timeLeft: '2 months left',
    status: 'Submitted',
    statusColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    title: 'Computer Science Masters',
    university: 'Stanford University, USA',
    dueDate: '15/11/2025',
    timeLeft: '1 month left',
    status: 'In Progress',
    statusColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
];

const tabs = [
  { label: 'All', count: 1 },
  { label: 'Urgent', count: null },
  { label: 'Upcoming', count: null },
];

export function ApplicationWidget() {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <Card className="bg-gray-900/40 backdrop-blur-xl border-white/10 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Calendar className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white text-lg">Application Timeline</h3>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>

      <p className="text-sm text-gray-400 mb-6">Track deadlines and never miss an opportunity</p>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-800/50 rounded-lg mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`flex-1 px-4 py-2 rounded-md text-sm transition-all ${
              activeTab === tab.label
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white'
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
      <div className="mb-6 pl-4 border-l-2 border-indigo-500">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          <p className="text-white">1 application submitted!</p>
        </div>
        <p className="text-sm text-indigo-400">Explore more programs or prepare for interviews</p>
      </div>

      {/* Application Cards */}
      <div className="space-y-3">
        {applications.map((app, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/30 hover:border-green-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-white mb-1">{app.title}</h4>
                <p className="text-sm text-gray-400">{app.university}</p>
              </div>
              <Badge className={`${app.statusColor} border`}>
                {app.status}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <Calendar className="w-4 h-4" />
              <span>Due: {app.dueDate}</span>
            </div>

            <p className="text-sm text-gray-300 mb-4">{app.timeLeft}</p>

            <Button 
              variant="secondary"
              className="w-full bg-gray-700/50 hover:bg-gray-700 text-white border border-white/10"
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
