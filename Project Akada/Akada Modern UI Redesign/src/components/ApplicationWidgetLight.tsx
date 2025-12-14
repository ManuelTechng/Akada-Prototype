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
    statusColor: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  },
  {
    title: 'Computer Science Masters',
    university: 'Stanford University, USA',
    dueDate: '15/11/2025',
    timeLeft: '1 month left',
    status: 'In Progress',
    statusColor: 'bg-orange-500/20 text-orange-600 border-orange-500/30',
  },
];

const tabs = [
  { label: 'All', count: 1 },
  { label: 'Urgent', count: null },
  { label: 'Upcoming', count: null },
];

export function ApplicationWidgetLight() {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-indigo-100 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-gray-900 text-lg">Application Timeline</h3>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>

      <p className="text-sm text-gray-600 mb-6">Track deadlines and never miss an opportunity</p>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-200/70 rounded-lg mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`flex-1 px-4 py-2 rounded-md text-sm transition-all ${
              activeTab === tab.label
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
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
          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          <p className="text-gray-900">1 application submitted!</p>
        </div>
        <p className="text-sm text-indigo-600">Explore more programs or prepare for interviews</p>
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
                <h4 className="text-gray-900 mb-1">{app.title}</h4>
                <p className="text-sm text-gray-600">{app.university}</p>
              </div>
              <Badge className={`${app.statusColor} border`}>
                {app.status}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Calendar className="w-4 h-4" />
              <span>Due: {app.dueDate}</span>
            </div>

            <p className="text-sm text-gray-700 mb-4">{app.timeLeft}</p>

            <Button 
              variant="secondary"
              className="w-full bg-gray-200/70 hover:bg-gray-300/70 text-gray-900 border border-gray-300"
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
