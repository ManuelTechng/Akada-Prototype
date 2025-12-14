import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckSquare, Circle, CheckCircle, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import { useState } from 'react';
import { useUserTasks } from '../../hooks/useUserTasks';
import { useNavigate } from 'react-router-dom';

export function TasksWidget() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pending' | 'in_progress' | 'all'>('pending');
  const { tasks, summary, loading, updateTask, refetch } = useUserTasks();

  const handleRefresh = async () => {
    await refetch();
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await updateTask(taskId, { status: newStatus });
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

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'pending') return task.status === 'pending';
    if (activeTab === 'in_progress') return task.status === 'in_progress';
    return task.status !== 'completed'; // 'all' shows non-completed
  }).slice(0, 5); // Limit to 5 tasks

  const tabs = [
    { value: 'pending', label: 'Pending', count: summary.pending },
    { value: 'in_progress', label: 'In Progress', count: summary.inProgress },
    { value: 'all', label: 'All', count: summary.pending + summary.inProgress },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
    }
  };

  const getTaskIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Circle className="w-4 h-4 text-blue-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Card className="figma-card">
      <div className="figma-card-content">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/40 dark:bg-green-500/20">
              <CheckSquare className="w-5 h-5 text-green-500 dark:text-green-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold figma-text-primary">Action Items</h3>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="figma-text-secondary hover:figma-text-primary"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>

        <p className="text-sm figma-text-secondary mb-6">Stay on top of your application tasks</p>

        {/* Summary Stats */}
        {summary.highPriority > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <p className="text-sm font-medium text-orange-600 dark:text-orange-300">
                {summary.highPriority} high priority task{summary.highPriority !== 1 ? 's' : ''} pending
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl bg-gray-100 dark:bg-white/5 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                activeTab === tab.value
                  ? 'bg-gray-900 dark:bg-white/10 text-white shadow-sm'
                  : 'figma-text-secondary hover:figma-text-primary'
              }`}
            >
              {tab.label}
              <span className="ml-1 opacity-70">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-8">
            <CheckSquare className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-sm figma-text-secondary mb-4">
              {activeTab === 'pending'
                ? 'No pending tasks. Great job!'
                : activeTab === 'in_progress'
                ? 'No tasks in progress'
                : 'No active tasks'}
            </p>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-all"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleTask(task.id, task.status)}
                  className="mt-0.5 hover:scale-110 transition-transform"
                >
                  {getTaskIcon(task.status)}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-medium figma-text-primary truncate">
                      {task.title}
                    </h4>
                    <Badge
                      className={`${getPriorityColor(task.priority)} border px-2 py-0.5 rounded-full text-xs font-semibold shadow-none shrink-0`}
                    >
                      {task.priority}
                    </Badge>
                  </div>

                  {task.description && (
                    <p className="text-xs figma-text-secondary mb-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {task.due_date && (
                    <p className="text-xs figma-text-secondary">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Tasks Button */}
        {tasks.length > 5 && (
          <Button
            variant="ghost"
            onClick={() => navigate('/app/applications')}
            className="w-full mt-4 figma-text-secondary hover:figma-text-primary"
          >
            View All Tasks ({tasks.length})
          </Button>
        )}
      </div>
    </Card>
  );
}
