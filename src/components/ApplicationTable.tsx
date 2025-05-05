import React from 'react';
import { Clock, CheckCircle, AlertCircle, ChevronRight, Calendar } from 'lucide-react';

interface Application {
  id: string;
  program: string;
  university: string;
  status: 'planning' | 'in_progress' | 'submitted' | 'accepted' | 'rejected';
  deadline: string;
}

const ApplicationTable: React.FC = () => {
  const applications: Application[] = [
    {
      id: '1',
      program: 'MSc Computer Science',
      university: 'University of Toronto',
      status: 'in_progress',
      deadline: '2025-06-10'
    },
    {
      id: '2',
      program: 'MSc Artificial Intelligence',
      university: 'University of Edinburgh',
      status: 'planning',
      deadline: '2025-05-30'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'planning':
        return <Clock className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const isUrgent = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return days <= 7;
  };

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <div key={app.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <div>
                  <h3 className="font-heading font-medium text-gray-800">{app.program}</h3>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-500">{app.university}</p>
                    <div className="relative flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <span className={`text-sm ${isUrgent(app.deadline) ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                        {new Date(app.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  {getStatusIcon(app.status)}
                  <span className={`capitalize ${
                    app.status === 'submitted' ? 'text-green-600' :
                    app.status === 'in_progress' ? 'text-amber-600' :
                    'text-gray-600'
                  }`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            
            <button className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium">
              View Details
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: app.status === 'in_progress' ? '65%' : '40%' }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApplicationTable;