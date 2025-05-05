import React, { useState, useEffect } from 'react';
import { 
  Bell, Calendar, BookOpen, Award, FileText, ChevronRight, MoreVertical, 
  Clock, CheckCircle, Plus, Star, Trash2, Share2, MessageSquare, AlertCircle,
  ChevronDown, GripVertical
} from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAuth } from '../../contexts/AuthContext';
import { getFavoritePrograms } from '../../lib/program';
import { getApplications } from '../../lib/application';
import type { Program } from '../../lib/types';

interface ApplicationStep {
  name: string;
  completed: boolean;
}

interface ApplicationData {
  id: number;
  program: string;
  university: string;
  deadline: string;
  status: string;
  progress: number;
  steps: ApplicationStep[];
}

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<Program[]>([]);
  const [applications, setApplications] = useState<ApplicationData[]>([
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
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const [favoritesData, applicationsData] = await Promise.all([
          getFavoritePrograms(user.id),
          // TODO: Implement real API call
          Promise.resolve(applications)
        ]);

        setFavorites(favoritesData);
        setApplications(applicationsData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user && !authLoading) {
      loadDashboardData();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const recommendations = [
    {
      id: 2,
      name: "MSc Artificial Intelligence",
      university: "University of Edinburgh",
      deadline: "2025-05-30",
      match: 92,
      requirements: ["IELTS: 6.5+", "GPA: 3.3+", "Research Experience"],
      lastUpdated: "2024-04-21"
    },
    {
      id: 3,
      name: "MSc Data Science",
      university: "TU Munich",
      deadline: "2025-07-15",
      match: 88,
      requirements: ["GRE: 310+", "TestDaF/DSH", "GPA: 3.0+"],
      lastUpdated: "2024-04-20"
    }
  ];

  const recommendations2 = [
    {
      name: "MSc Software Engineering",
      university: "University of British Columbia",
      deadline: "2025-08-01",
      match: 94,
      requirements: ["IELTS: 7.0+", "GPA: 3.4+"],
      color: "bg-purple-500"
    },
    {
      name: "MSc Machine Learning",
      university: "KTH Royal Institute",
      deadline: "2025-07-30",
      match: 91,
      requirements: ["GRE: 315+", "IELTS: 6.5+"],
      color: "bg-blue-500"
    },
    {
      name: "MSc Cloud Computing",
      university: "TU Delft",
      deadline: "2025-06-30",
      match: 89,
      requirements: ["IELTS: 6.5+", "Work Experience"],
      color: "bg-indigo-500"
    },
    {
      name: "MSc Robotics",
      university: "ETH Zurich",
      deadline: "2025-09-15",
      match: 87,
      requirements: ["GRE: 320+", "Research Background"],
      color: "bg-cyan-500"
    }
  ];

  const applications2 = [
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

  const moveCard = (dragIndex: number, hoverIndex: number) => {
    const newFavorites = [...favorites];
    const draggedItem = newFavorites[dragIndex];
    newFavorites.splice(dragIndex, 1);
    newFavorites.splice(hoverIndex, 0, draggedItem);
    setFavorites(newFavorites);
  };

  return (
    <div className="px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 font-heading">Welcome back, Oluwaseun!</h1>
            <p className="text-gray-500">Track your applications and stay on top of deadlines</p>
          </div>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">New Application</span>
          </button>
        </div>

        {/* Program Recommendations */}
        <div className="mb-8 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold font-heading">Recommended Programs</h2>
            <button className="text-indigo-600 text-sm hover:text-indigo-700">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
            {recommendations2.map((program, index) => (
              <div key={index} className={`${program.color} rounded-xl p-6 text-white min-w-[250px]`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-white/20 px-2 py-1 rounded text-sm">
                    {program.match}% Match
                  </div>
                  <button className="text-white/80 hover:text-white">
                    <Star className="h-5 w-5" />
                  </button>
                </div>
                <h3 className="font-heading font-semibold mb-1 break-words">{program.name}</h3>
                <p className="text-white/80 text-sm mb-4 break-words">{program.university}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Deadline: {program.deadline}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {program.requirements.map((req, i) => (
                      <span key={i} className="bg-white/20 px-2 py-1 rounded-full text-xs">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Progress */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {applications2.map((app) => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-heading font-semibold break-words">{app.program}</h3>
                  <p className="text-gray-500 text-sm break-words">{app.university}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 hidden sm:inline">Due: {app.deadline}</span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Application Progress</span>
                  <span>{app.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${app.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                {app.steps.slice(0, 3).map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <span className={`text-sm ${step.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      {step.name}
                    </span>
                  </div>
                ))}
                {app.steps.length > 3 && (
                  <button className="text-sm text-indigo-600 font-medium">
                    +{app.steps.length - 3} more steps
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
          <h2 className="text-lg font-semibold mb-6 font-heading">Upcoming Deadlines</h2>
          <div className="space-y-4">
            {timeline.map((event, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                  event.priority === 'critical' ? 'bg-red-500' :
                  event.priority === 'upcoming' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div>
                      <h4 className="font-heading font-medium break-words">{event.description}</h4>
                      <p className="text-gray-500 text-sm break-words">{event.program}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm mt-2 sm:mt-0 inline-block ${
                      event.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      event.priority === 'upcoming' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {event.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Favorites - Added mb-20 for extra space at bottom */}
        <DndProvider backend={HTML5Backend}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-20">
            <h2 className="text-lg font-semibold mb-6 font-heading">Saved Programs</h2>
            <div className="space-y-4">
              {favorites.map((program, index) => (
                <DraggableCard
                  key={program.id}
                  index={index}
                  program={program}
                  moveCard={moveCard}
                />
              ))}
            </div>
          </div>
        </DndProvider>
      </div>
    </div>
  );
};

interface DraggableCardProps {
  program: any;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ program, index, moveCard }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'CARD',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'CARD',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveCard(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`bg-white border border-gray-200 rounded-lg p-4 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <GripVertical className="h-5 w-5 text-gray-400 cursor-move flex-shrink-0" />
            <div>
              <h3 className="font-heading font-medium truncate">{program.name}</h3>
              <p className="text-sm text-gray-500 truncate">{program.university}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {program.requirements && program.requirements.map((req: string, i: number) => (
              <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {req}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
            {program.match}% Match
          </div>
          <div className="flex gap-2">
            <button className="text-gray-400 hover:text-gray-600">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="text-gray-400 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;