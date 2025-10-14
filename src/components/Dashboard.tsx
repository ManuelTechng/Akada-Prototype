import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  BookOpen, 
  Calendar, 
  Plus, 
  ChevronRight,
  ArrowRight,
  GraduationCap,
  Target,
  Calculator
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Update date every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Sample recommended programs with Nigerian pricing
  const recommendedPrograms = [
    {
      id: '1',
      name: 'Master of Science in Computer Science',
      university: 'University of British Columbia',
      country: 'Canada',
      tuition_fee: 81000000, // NGN
      degree_type: 'Masters',
      match: 65,
      deadline: 'N/A',
      color: 'from-purple-500 to-purple-700',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-700'
    },
    {
      id: '2',
      name: 'Master of Information Technology',
      university: 'University of Melbourne',
      country: 'Australia',
      tuition_fee: 67500000, // NGN
      degree_type: 'Masters',
      match: 65,
      deadline: 'N/A',
      color: 'from-blue-500 to-blue-700',
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-700'
    },
    {
      id: '3',
      name: 'MEng Software Engineering',
      university: 'McGill University',
      country: 'Canada',
      tuition_fee: 38000000, // NGN
      degree_type: 'Masters',
      match: 65,
      deadline: 'N/A',
      color: 'from-green-500 to-green-700',
      bgColor: 'bg-gradient-to-br from-green-500 to-green-700'
    }
  ];

  const activeApplications = [
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
    }
  ];

  const progressStats = [
    { 
      label: 'Programs Matched', 
      value: 24, 
      description: 'Based on your profile',
      icon: Target,
      color: 'text-purple-600'
    },
    { 
      label: 'Documents Ready', 
      value: 12, 
      description: 'Reviewed and approved',
      icon: FileText,
      color: 'text-green-600'
    }
  ];

  const tasksToComplete = [
    {
      id: 1,
      title: 'Complete IELTS preparation',
      category: 'Test Preparation',
      dueDate: 'Due Jul 4',
      priority: 'high',
      icon: '🎯'
    },
    {
      id: 2,
      title: 'Review SOP draft',
      category: 'Document Review',
      dueDate: 'Due Jul 2',
      priority: 'medium',
      icon: '📝'
    },
    {
      id: 3,
      title: 'Schedule visa appointment',
      category: 'Visa Process',
      dueDate: 'Due Jul 9',
      priority: 'low',
      icon: '🎯'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFirstName = () => {
    if (profile?.full_name) return profile.full_name.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return 'Student';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hello, {getFirstName()}! 🎓</h1>
          <p className="text-gray-600">Today is {formatDate(currentDate)}</p>
        </div>
        
        <button
          onClick={() => navigate('/dashboard/applications')}
          className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 self-start"
        >
          <Plus className="h-5 w-5" />
          Add New Application
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Content - Left Side */}
        <div className="xl:col-span-3 space-y-8">
          {/* Recommended Programs */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recommended Programs</h2>
              <p className="text-sm text-gray-500">Showing 3 of 5 recommended programs</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedPrograms.map((program) => (
                <div 
                  key={program.id} 
                  className={`${program.bgColor} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer`}
                  onClick={() => navigate('/dashboard/search')}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                      {program.match}% Match
                    </div>
                    <button className="text-white/80 hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
                      </svg>
                    </button>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2 leading-tight">{program.name}</h3>
                  <p className="text-white/90 text-sm mb-1">{program.university}</p>
                  <p className="text-white/80 text-sm mb-6">{program.country}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Tuition:</span>
                      <span className="font-bold">{formatCurrency(program.tuition_fee)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Deadline:</span>
                      <span className="font-medium">{program.deadline}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Save
                    </button>
                    <button className="w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl transition-colors flex items-center justify-center">
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Applications */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Active Applications</h2>
              <button 
                onClick={() => navigate('/dashboard/applications')}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            {activeApplications.map((app) => (
              <div key={app.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="font-bold text-lg text-gray-900">{app.program}</h3>
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                        {app.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{app.university}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="h-4 w-4 mr-2" />
                      Due: 2025-06-10
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Progress</span>
                        <span className="font-medium">{app.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${app.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="text-sm text-gray-500">
                      ✅ Create Account<br/>
                      ✅ Personal Information<br/>
                      ✅ Academic Records<br/>
                      <span className="text-gray-400">+3 more steps</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          {/* Your Progress */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-6">Your Progress</h3>
            
            <div className="space-y-6">
              {progressStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="relative">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={index === 0 ? "#8b5cf6" : "#10b981"}
                          strokeWidth="2"
                          strokeDasharray="90, 100"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                        <span className="font-medium text-gray-700">{stat.label}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tasks to Complete */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-900">Tasks to Complete</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All Tasks
              </button>
            </div>
            
            <div className="space-y-4">
              {tasksToComplete.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{task.icon}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                    <p className="text-xs text-gray-500">{task.category} • {task.dueDate}</p>
                  </div>
                  
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${
                    task.priority === 'high' ? 'bg-red-400' :
                    task.priority === 'medium' ? 'bg-yellow-400' :
                    'bg-green-400'
                  }`} />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/dashboard/search')}
                className="w-full bg-purple-600 text-white p-4 rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center gap-3"
              >
                <GraduationCap className="h-5 w-5" />
                Find Programs
              </button>
              
              <button 
                onClick={() => navigate('/dashboard/calculator')}
                className="w-full bg-blue-600 text-white p-4 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-3"
              >
                <Calculator className="h-5 w-5" />
                Cost Calculator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
