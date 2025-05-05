import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  Plus,
  Search,
  Filter,
  MapPin,
  GraduationCap,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Star,
  Trash,
  X,
  DollarSign,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getApplications } from '../../lib/application';
import { useNavigate } from 'react-router-dom';

const Applications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('deadline');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Sample data for development
  const sampleApplications = [
    {
      id: '1',
      program: {
        id: '101',
        name: 'MSc Computer Science',
        university: 'University of Toronto',
        country: 'Canada',
        degree_type: 'Masters',
        tuition_fee: 42000,
        has_scholarships: true
      },
      status: 'in_progress',
      deadline: '2025-06-10',
      progress: 65,
      created_at: '2024-01-10T10:30:00Z',
      notes: 'Need to request recommendation letters',
      steps: [
        { name: 'Create account', completed: true },
        { name: 'Fill personal information', completed: true },
        { name: 'Upload transcripts', completed: true },
        { name: 'Request recommendation letters', completed: false },
        { name: 'Write statement of purpose', completed: false },
        { name: 'Pay application fee', completed: false },
        { name: 'Submit application', completed: false }
      ]
    },
    {
      id: '2',
      program: {
        id: '102',
        name: 'MSc Artificial Intelligence',
        university: 'University of Edinburgh',
        country: 'UK',
        degree_type: 'Masters',
        tuition_fee: 38000,
        has_scholarships: true
      },
      status: 'in_progress',
      deadline: '2025-05-30',
      progress: 40,
      created_at: '2024-02-15T14:20:00Z',
      notes: 'Need to complete personal statement',
      steps: [
        { name: 'Create account', completed: true },
        { name: 'Fill personal information', completed: true },
        { name: 'Upload transcripts', completed: false },
        { name: 'Request recommendation letters', completed: false },
        { name: 'Write personal statement', completed: false },
        { name: 'Pay application fee', completed: false },
        { name: 'Submit application', completed: false }
      ]
    },
    {
      id: '3',
      program: {
        id: '103',
        name: 'MSc Data Science',
        university: 'TU Munich',
        country: 'Germany',
        degree_type: 'Masters',
        tuition_fee: 32000,
        has_scholarships: false
      },
      status: 'planning',
      deadline: '2025-07-15',
      progress: 0,
      created_at: '2024-03-05T09:45:00Z',
      notes: 'Need to start application',
      steps: [
        { name: 'Create account', completed: false },
        { name: 'Fill personal information', completed: false },
        { name: 'Upload transcripts', completed: false },
        { name: 'Request recommendation letters', completed: false },
        { name: 'Write motivation letter', completed: false },
        { name: 'Submit application', completed: false }
      ]
    },
    {
      id: '4',
      program: {
        id: '104',
        name: 'MSc Robotics',
        university: 'ETH Zurich',
        country: 'Switzerland',
        degree_type: 'Masters',
        tuition_fee: 45000,
        has_scholarships: true
      },
      status: 'submitted',
      deadline: '2025-04-20',
      progress: 100,
      created_at: '2024-01-25T11:15:00Z',
      notes: 'Waiting for decision',
      steps: [
        { name: 'Create account', completed: true },
        { name: 'Fill personal information', completed: true },
        { name: 'Upload transcripts', completed: true },
        { name: 'Request recommendation letters', completed: true },
        { name: 'Write motivation letter', completed: true },
        { name: 'Pay application fee', completed: true },
        { name: 'Submit application', completed: true }
      ]
    },
    {
      id: '5',
      program: {
        id: '105',
        name: 'MSc Software Engineering',
        university: 'University of British Columbia',
        country: 'Canada',
        degree_type: 'Masters',
        tuition_fee: 39000,
        has_scholarships: false
      },
      status: 'planning',
      deadline: '2025-08-01',
      progress: 0,
      created_at: '2024-03-15T16:30:00Z',
      notes: 'Need to check requirements',
      steps: [
        { name: 'Create account', completed: false },
        { name: 'Fill personal information', completed: false },
        { name: 'Upload transcripts', completed: false },
        { name: 'Request recommendation letters', completed: false },
        { name: 'Write statement of purpose', completed: false },
        { name: 'Pay application fee', completed: false },
        { name: 'Submit application', completed: false }
      ]
    }
  ];

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        // In a real implementation, fetch from API with server-side filtering and sorting
        if (user) {
          const data = await getApplications(
            user.id,
            sortField,
            sortDirection,
            filterStatus,
            searchQuery
          );
          setApplications(data || sampleApplications);
        } else {
          // Fallback to sample data if no user
          setApplications(sampleApplications);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading applications:', err);
        setError('Failed to load applications. Please try again.');
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user, sortField, sortDirection, filterStatus, searchQuery]);

  const handleNewApplication = () => {
    navigate('/dashboard/search');
  };

  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'planning':
        return <ClipboardList className="h-5 w-5 text-indigo-400" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-600';
      case 'in_progress':
        return 'bg-amber-100 text-amber-600';
      case 'planning':
        return 'bg-indigo-100 text-indigo-600';
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const isUrgent = (deadline: string) => {
    if (!deadline) return false;
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return days <= 7 && days >= 0;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 font-heading">Application Tracker</h1>
        <p className="text-gray-600">Track and manage your program applications</p>
      </div>
      
      {/* Filters & Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search applications..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
          
          <button
            onClick={handleNewApplication}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors sm:self-start"
          >
            <Plus className="h-5 w-5" />
            <span>New Application</span>
          </button>
        </div>
        
        {showFilters && (
          <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="submitted">Submitted</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortField}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="deadline">Deadline</option>
                <option value="university">University</option>
                <option value="program">Program</option>
                <option value="progress">Progress</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Direction</label>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-gray-700 bg-white hover:bg-gray-50"
              >
                <span>{sortDirection === 'asc' ? 'Ascending' : 'Descending'}</span>
                {sortDirection === 'asc' ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </button>
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={() => {
                  setFilterStatus('all');
                  setSortField('deadline');
                  setSortDirection('asc');
                  setSearchQuery('');
                }}
                className="text-indigo-600 border border-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors w-full"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Applications List */}
      <div className="space-y-6 mb-8">
        {loading ? (
          <div className="bg-white rounded-xl p-8 shadow-sm flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading applications...</span>
          </div>
        ) : applications.length > 0 ? (
          applications.map((app) => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center 
                      ${app.status === 'submitted' ? 'bg-green-100 text-green-500' : 
                        app.status === 'in_progress' ? 'bg-amber-100 text-amber-500' : 
                        app.status === 'planning' ? 'bg-indigo-100 text-indigo-500' : 
                        app.status === 'accepted' ? 'bg-green-100 text-green-600' : 
                        'bg-red-100 text-red-500'}`
                    }>
                      {getStatusIcon(app.status)}
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg text-gray-900 break-words">{app.program.name}</h2>
                      <p className="text-gray-600 break-words">{app.program.university}</p>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full mt-2 text-xs font-medium
                        ${getStatusColor(app.status)}`
                      }>
                        {app.status === 'in_progress' ? 'In Progress' : 
                          app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className={isUrgent(app.deadline) ? "text-red-500 font-medium" : "text-gray-500"}>
                        Due: {new Date(app.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Star className="h-5 w-5" />
                      </button>
                      <div className="relative">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{app.program.country}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{app.program.degree_type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">${app.program.tuition_fee.toLocaleString()}/year</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                {app.status !== "planning" && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">Application Progress</span>
                      <span>{app.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${app.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Tasks */}
              <div className="p-6">
                <h3 className="font-medium mb-4 text-gray-800">Application Checklist</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {app.steps.slice(0, 4).map((task, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        task.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {task.completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Clock className="h-5 w-5" />
                        )}
                      </div>
                      <span className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {task.name}
                      </span>
                    </div>
                  ))}
                  {app.steps.length > 4 && (
                    <div className="text-indigo-600 font-medium text-sm">
                      +{app.steps.length - 4} more tasks
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="bg-gray-50 p-4 flex justify-between">
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                  {app.status === "planning" ? "Start Application" : "Continue Application"}
                </button>
                <button className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="bg-gray-50 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Applications Found</h3>
            <p className="text-gray-500 mb-6">
              {filterStatus === 'all' && !searchQuery
                ? "You haven't created any applications yet."
                : `No applications match your current filters.`}
            </p>
            {filterStatus !== 'all' || searchQuery ? (
              <button 
                onClick={() => {
                  setFilterStatus('all');
                  setSearchQuery('');
                }}
                className="text-indigo-600 font-medium hover:text-indigo-700 mr-4"
              >
                Clear Filters
              </button>
            ) : null}
            <button 
              onClick={handleNewApplication}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Start New Application</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Add New Application Button */}
      {applications.length > 0 && (
        <div className="mb-10">
          <button 
            onClick={handleNewApplication}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Application</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Helper Icons
const ChevronUp = (props: React.SVGProps<SVGSVGElement>) => (
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
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

const ChevronDown = (props: React.SVGProps<SVGSVGElement>) => (
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
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default Applications;