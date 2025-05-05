import React from 'react';
import { CheckCircle, Clock, AlertCircle, FileText, Calendar, DollarSign, MapPin, GraduationCap } from 'lucide-react';

const ApplicationTracker: React.FC = () => {
  const applications = [
    {
      id: 1,
      program: "MSc Computer Science",
      university: "University of Toronto",
      country: "Canada",
      status: "In Progress",
      deadline: "June 10, 2025",
      progress: 65,
      tasks: [
        { name: "Create account", completed: true },
        { name: "Fill personal information", completed: true },
        { name: "Upload transcripts", completed: true },
        { name: "Request recommendation letters", completed: false },
        { name: "Write statement of purpose", completed: false },
        { name: "Pay application fee", completed: false },
        { name: "Submit application", completed: false }
      ]
    },
    {
      id: 2,
      program: "MSc Artificial Intelligence",
      university: "University of Edinburgh",
      country: "UK",
      status: "In Progress",
      deadline: "May 30, 2025",
      progress: 40,
      tasks: [
        { name: "Create account", completed: true },
        { name: "Fill personal information", completed: true },
        { name: "Upload transcripts", completed: false },
        { name: "Request recommendation letters", completed: false },
        { name: "Write statement of purpose", completed: false },
        { name: "Pay application fee", completed: false },
        { name: "Submit application", completed: false }
      ]
    },
    {
      id: 3,
      program: "MSc Data Science",
      university: "TU Munich",
      country: "Germany",
      status: "Saved",
      deadline: "July 15, 2025",
      progress: 0,
      tasks: [
        { name: "Create account", completed: false },
        { name: "Fill personal information", completed: false },
        { name: "Upload transcripts", completed: false },
        { name: "Request recommendation letters", completed: false },
        { name: "Write statement of purpose", completed: false },
        { name: "Pay application fee", completed: false },
        { name: "Submit application", completed: false }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Submitted":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "In Progress":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "Saved":
        return <FileText className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Application Tracker</h1>
        <p className="text-gray-600">Track and manage your program applications</p>
      </div>

      {/* Applications */}
      <div className="space-y-6">
        {applications.map((app) => (
          <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                <div>
                  <h2 className="font-semibold text-lg break-words">{app.program}</h2>
                  <p className="text-gray-600 break-words">{app.university}</p>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(app.status)}
                  <span className={`text-sm font-medium ${
                    app.status === "Submitted" ? "text-green-600" : 
                    app.status === "In Progress" ? "text-amber-600" : 
                    "text-gray-500"
                  }`}>
                    {app.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{app.country}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">Due: {app.deadline}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <GraduationCap className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">Master's</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              {app.status !== "Saved" && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Application Progress</span>
                    <span>{app.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${app.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Tasks */}
            <div className="p-4">
              <h3 className="font-medium mb-3">Application Checklist</h3>
              <div className="space-y-2">
                {app.tasks.slice(0, 4).map((task, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      task.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}>
                      {task.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <span className={`text-sm ${task.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
                      {task.name}
                    </span>
                  </div>
                ))}
                {app.tasks.length > 4 && (
                  <div className="text-sm text-indigo-600 mt-1">
                    +{app.tasks.length - 4} more tasks
                  </div>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="bg-gray-50 p-4 flex justify-between">
              <button className="text-indigo-600 text-sm font-medium">
                {app.status === "Saved" ? "Start Application" : "Continue Application"}
              </button>
              <button className="text-gray-500 text-sm">View Details</button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Add New Application */}
      <div className="mt-6">
        <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
          <FileText className="h-5 w-5" />
          <span>Add New Application</span>
        </button>
      </div>
    </div>
  );
};

export default ApplicationTracker;