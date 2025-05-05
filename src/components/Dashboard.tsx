import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  BookOpen, 
  Calendar, 
  Plus, 
  ChevronRight,
  Star,
  Share2,
  Clock,
  CheckCircle,
  ArrowUp,
  ArrowRight,
  GraduationCap,
  MapPin,
  DollarSign,
  Bell,
  BarChart,
  Users,
  MessageSquare,
  Calculator
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const suggestedPrograms = [
    {
      id: '1',
      name: 'MSc Software Engineering',
      university: 'University of British Columbia',
      country: 'Canada', 
      tuition_fee: 42000,
      degree_type: 'Masters',
      created_at: new Date().toISOString(),
      has_scholarships: true,
      match: 94,
      color: 'bg-indigo-500'
    },
    {
      id: '2',
      name: 'MSc Machine Learning',
      university: 'KTH Royal Institute',
      country: 'Sweden',
      tuition_fee: 38000,
      degree_type: 'Masters',
      created_at: new Date().toISOString(),
      has_scholarships: false,
      match: 91,
      color: 'bg-blue-500'
    },
    {
      id: '3',
      name: 'MSc Computer Science',
      university: 'University of Lagos',
      abbreviation: 'UNILAG',
      country: 'Nigeria',
      tuition_fee: 500000, // in Nigerian Naira
      degree_type: 'Masters',
      created_at: new Date().toISOString(),
      has_scholarships: true,
      match: 97,
      color: 'bg-green-500'
    },
    {
      id: '4',
      name: 'MSc Artificial Intelligence',
      university: 'University of Ibadan',
      abbreviation: 'UI',
      country: 'Nigeria',
      tuition_fee: 450000, // in Nigerian Naira
      degree_type: 'Masters',
      created_at: new Date().toISOString(),
      has_scholarships: true,
      match: 95,
      color: 'bg-purple-500'
    }
  ];

  const applications = [
    {
      id: 1,
      program: "MSc Computer Science",
      university: "University of Toronto",
      deadline: "2025-06-10",
      status: "In Progress",
      progress: 65,
      steps: [
        { name: "Create Account", completed: true },
        { name: "Personal Information", completed: true },
        { name: "Academic Records", completed: true },
        { name: "Statement of Purpose", completed: false },
        { name: "References", completed: false },
        { name: "Pay Application Fee", completed: false }
      ]
    },
    {
      id: 2,
      program: "MSc Artificial Intelligence",
      university: "University of Edinburgh",
      deadline: "2025-05-30",
      status: "In Progress",
      progress: 40,
      steps: [
        { name: "Create Account", completed: true },
        { name: "Personal Information", completed: true },
        { name: "Academic Records", completed: false },
        { name: "Statement of Purpose", completed: false },
        { name: "References", completed: false }
      ]
    }
  ];

  const stats = [
    { 
      label: 'Applications', 
      value: '4', 
      icon: FileText, 
      color: 'bg-indigo-500 text-white',
      changePercent: 33,
      changeType: 'increase' 
    },
    { 
      label: 'Saved Programs', 
      value: '12', 
      icon: Star, 
      color: 'bg-orange-500 text-white',
      changePercent: 20,
      changeType: 'increase'
    },
    { 
      label: 'Documents', 
      value: '8', 
      icon: BookOpen, 
      color: 'bg-cyan-500 text-white',
      changePercent: 50,
      changeType: 'increase'
    },
    { 
      label: 'Upcoming Deadlines', 
      value: '2', 
      icon: Calendar, 
      color: 'bg-rose-500 text-white',
      changePercent: 0,
      changeType: 'neutral'
    }
  ];

  const timeline = [
    {
      date: "2024-05-15",
      type: "deadline",
      program: "University of Toronto",
      description: "Application Deadline",
      priority: "critical"
    },
    {
      date: "2024-05-01",
      type: "document",
      program: "University of Edinburgh",
      description: "Submit IELTS Scores",
      priority: "upcoming"
    },
    {
      date: "2024-04-25",
      type: "interview",
      program: "TU Munich",
      description: "Online Interview",
      priority: "upcoming"
    },
    {
      date: "2024-04-20",
      type: "document",
      program: "University of Toronto",
      description: "Reference Letters Due",
      priority: "completed"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section with Stats */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-heading mb-1">Hello, Oluwaseun! 👋</h1>
        <p className="text-gray-600 mb-8">Track your applications and stay on top of deadlines</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 card-hover transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.changeType === 'increase' ? 'text-green-600' :
                  stat.changeType === 'decrease' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {stat.changeType === 'increase' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : stat.changeType === 'decrease' ? (
                    <ArrowDown className="h-4 w-4" />
                  ) : null}
                  {stat.changePercent > 0 && `${stat.changePercent}%`}
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h2>
              <p className="text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Program Recommendations */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-heading">Recommended Programs</h2>
            <p className="text-gray-500 text-sm">Based on your profile and preferences</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard/search')}
            className="text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-700 transition-colors"
          >
            View All
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {suggestedPrograms.map((program) => (
            <div 
              key={program.id} 
              className={`${program.color} rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-all`}
            >
              <div className="flex justify-between items-start mb-5">
                <div className="bg-white/20 px-2 py-1 rounded text-sm font-medium">
                  {program.match}% Match
                </div>
                <button className="text-white/80 hover:text-white transition-colors">
                  <Star className="h-5 w-5" />
                </button>
              </div>
              
              <h3 className="font-heading font-semibold text-lg mb-1 break-words">{program.name}</h3>
              <p className="text-white/80 text-sm mb-4 break-words">
                {program.university} 
                {program.abbreviation ? ` (${program.abbreviation})` : ''}
              </p>
              
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{program.country}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {program.country === 'Nigeria' 
                      ? `₦${program.tuition_fee.toLocaleString()}/year`
                      : `$${program.tuition_fee.toLocaleString()}/year`
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{program.degree_type}</span>
                </div>
              </div>
              
              <button className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2 rounded-lg transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Applications */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-heading">Active Applications</h2>
            <p className="text-gray-500 text-sm">Track your progress and upcoming deadlines</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard/applications')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Application</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all card-hover">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="font-heading font-semibold text-lg break-words text-gray-900">{app.program}</h3>
                  <p className="text-gray-600 text-sm break-words">{app.university}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Due: {new Date(app.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span>Application Progress</span>
                  <span className="font-medium">{app.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-bar-fill bg-indigo-600"
                    style={{ width: `${app.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {app.steps.slice(0, 3).map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`text-sm ${step.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-2 transition-colors">
                  Continue Application
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-heading">Upcoming Deadlines</h2>
              <p className="text-gray-500 text-sm">Stay on top of important dates</p>
            </div>
            <button className="text-indigo-600 hover:text-indigo-700 transition-colors">
              <Calendar className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            {timeline.map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="relative">
                  <div className={`w-4 h-4 rounded-full ${
                    event.priority === 'critical' ? 'bg-red-500' :
                    event.priority === 'upcoming' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  {index < timeline.length - 1 && (
                    <div className="absolute top-4 bottom-0 left-1/2 w-0.5 -ml-px bg-gray-200"></div>
                  )}
                </div>
                
                <div className="flex-1 pb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{event.description}</h3>
                        <p className="text-gray-500 text-sm">{event.program}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm inline-block ${
                        event.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        event.priority === 'upcoming' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 font-heading">Activity</h2>
            <select className="text-sm border border-gray-200 rounded-lg p-2">
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-16 text-xs text-gray-500">Mon</div>
              <div className="flex-1 h-16 relative">
                <div 
                  className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 h-4 bg-indigo-200 rounded-full"
                ></div>
                <div 
                  className="absolute top-1/2 left-0 transform -translate-y-1/2 h-4 bg-indigo-600 rounded-full"
                  style={{ width: '60%' }}
                ></div>
              </div>
              <div className="w-16 text-right text-sm font-medium">12</div>
            </div>
            
            <div className="flex items-center">
              <div className="w-16 text-xs text-gray-500">Tue</div>
              <div className="flex-1 h-16 relative">
                <div 
                  className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 h-4 bg-indigo-200 rounded-full"
                ></div>
                <div 
                  className="absolute top-1/2 left-0 transform -translate-y-1/2 h-4 bg-indigo-600 rounded-full"
                  style={{ width: '40%' }}
                ></div>
              </div>
              <div className="w-16 text-right text-sm font-medium">8</div>
            </div>
            
            <div className="flex items-center">
              <div className="w-16 text-xs text-gray-500">Wed</div>
              <div className="flex-1 h-16 relative">
                <div 
                  className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 h-4 bg-indigo-200 rounded-full"
                ></div>
                <div 
                  className="absolute top-1/2 left-0 transform -translate-y-1/2 h-4 bg-indigo-600 rounded-full"
                  style={{ width: '75%' }}
                ></div>
              </div>
              <div className="w-16 text-right text-sm font-medium">15</div>
            </div>
            
            <div className="flex items-center">
              <div className="w-16 text-xs text-gray-500">Thu</div>
              <div className="flex-1 h-16 relative">
                <div 
                  className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 h-4 bg-indigo-200 rounded-full"
                ></div>
                <div 
                  className="absolute top-1/2 left-0 transform -translate-y-1/2 h-4 bg-indigo-600 rounded-full"
                  style={{ width: '90%' }}
                ></div>
              </div>
              <div className="w-16 text-right text-sm font-medium">18</div>
            </div>
            
            <div className="flex items-center">
              <div className="w-16 text-xs text-gray-500">Fri</div>
              <div className="flex-1 h-16 relative">
                <div 
                  className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 h-4 bg-indigo-200 rounded-full"
                ></div>
                <div 
                  className="absolute top-1/2 left-0 transform -translate-y-1/2 h-4 bg-indigo-600 rounded-full"
                  style={{ width: '45%' }}
                ></div>
              </div>
              <div className="w-16 text-right text-sm font-medium">9</div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="text-gray-500">Total Activity</div>
              <div className="font-medium text-gray-900">62 hours</div>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-bar-fill bg-indigo-600"
                style={{ width: '75%' }}
              ></div>
            </div>
            <div className="mt-4 text-center">
              <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors">
                View Detailed Report
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-indigo-600 text-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-medium text-lg">Apply Now</h3>
          </div>
          <p className="text-indigo-100 mb-4">
            Start a new application for your target program
          </p>
          <button 
            className="flex justify-center items-center gap-2 bg-white text-indigo-600 w-full py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
            onClick={() => navigate('/dashboard/search')}
          >
            Find Programs
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
        
        <div className="bg-orange-500 text-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="font-medium text-lg">Resources</h3>
          </div>
          <p className="text-orange-100 mb-4">
            Access guides, templates, and helpful materials
          </p>
          <button 
            className="flex justify-center items-center gap-2 bg-white text-orange-500 w-full py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors"
            onClick={() => navigate('/dashboard/resources')}
          >
            Browse Resources
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
        
        <div className="bg-cyan-500 text-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Calculator className="h-6 w-6" />
            </div>
            <h3 className="font-medium text-lg">Cost Calculator</h3>
          </div>
          <p className="text-cyan-100 mb-4">
            Estimate tuition and living costs in Nigerian Naira
          </p>
          <button 
            className="flex justify-center items-center gap-2 bg-white text-cyan-500 w-full py-2 rounded-lg font-medium hover:bg-cyan-50 transition-colors"
            onClick={() => navigate('/dashboard/calculator')}
          >
            Calculate Costs
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
        
        <div className="bg-purple-500 text-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="font-medium text-lg">AI Assistant</h3>
          </div>
          <p className="text-purple-100 mb-4">
            Get instant answers to your application questions
          </p>
          <button 
            className="flex justify-center items-center gap-2 bg-white text-purple-500 w-full py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
            onClick={() => navigate('/dashboard/chat')}
          >
            Chat Now
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ArrowDown icon
const ArrowDown = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
);

export default Dashboard;