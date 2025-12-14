import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useApplications } from './useApplications';

export interface UserTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: 'application' | 'document' | 'profile' | 'deadline' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
  related_application_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskSummary {
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  highPriority: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  type: UserTask['type'];
  priority: UserTask['priority'];
  due_date?: string;
  related_application_id?: string;
}

export const useUserTasks = () => {
  const { user } = useAuth();
  const { applications } = useApplications();
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks from database
  const fetchTasks = async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_tasks' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        // If table doesn't exist, generate tasks from applications
        console.warn('user_tasks table not found, generating tasks from applications');
        const generatedTasks = generateTasksFromApplications();
        setTasks(generatedTasks);
        setError(null);
      } else {
        setTasks((data || []) as unknown as UserTask[]);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      // Fallback to generated tasks
      const generatedTasks = generateTasksFromApplications();
      setTasks(generatedTasks);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Generate tasks from applications (fallback when no database table)
  const generateTasksFromApplications = (): UserTask[] => {
    if (!applications || !user) return [];

    const now = new Date();
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);

    return applications
      .filter((app) => app.status === 'planning' || app.status === 'in-progress')
      .map((app) => {
        const deadline = new Date(app.deadline);
        const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Determine priority based on deadline
        let priority: UserTask['priority'] = 'low';
        if (daysUntil < 0) {
          priority = 'urgent';
        } else if (daysUntil <= 7) {
          priority = 'high';
        } else if (daysUntil <= 30) {
          priority = 'medium';
        }

        return {
          id: `generated-${app.id}`,
          user_id: user.id,
          title: `Complete application for ${app.programs.name}`,
          description: `Deadline: ${deadline.toLocaleDateString()}`,
          type: 'application' as const,
          priority,
          status: app.status === 'planning' ? ('pending' as const) : ('in_progress' as const),
          due_date: app.deadline,
          related_application_id: app.id,
          created_at: app.created_at,
          updated_at: app.updated_at,
        };
      });
  };

  // Create new task
  const createTask = async (taskData: CreateTaskData): Promise<UserTask | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    try {
      const newTask = {
        user_id: user.id,
        ...taskData,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error: createError } = await supabase
        .from('user_tasks' as any)
        .insert([newTask])
        .select()
        .single();

      if (createError) throw createError;

      const createdTask = data as unknown as UserTask;
      setTasks((prev) => [createdTask, ...prev]);
      return createdTask;
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task');
      return null;
    }
  };

  // Update task
  const updateTask = async (
    taskId: string,
    updates: Partial<Omit<UserTask, 'id' | 'user_id' | 'created_at'>>
  ): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    try {
      const { error: updateError } = await supabase
        .from('user_tasks' as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, ...updates, updated_at: new Date().toISOString() }
            : task
        )
      );
      return true;
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task');
      return false;
    }
  };

  // Delete task
  const deleteTask = async (taskId: string): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    try {
      const { error: deleteError } = await supabase
        .from('user_tasks' as any)
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      return true;
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      return false;
    }
  };

  // Calculate task summary
  const summary = useMemo<TaskSummary>(() => {
    const now = new Date();
    return {
      pending: tasks.filter((t) => t.status === 'pending').length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      overdue: tasks.filter((t) => {
        if (!t.due_date || t.status === 'completed') return false;
        return new Date(t.due_date) < now;
      }).length,
      highPriority: tasks.filter(
        (t) => (t.priority === 'high' || t.priority === 'urgent') && t.status !== 'completed'
      ).length,
    };
  }, [tasks]);

  // Fetch tasks on mount and when user changes
  useEffect(() => {
    fetchTasks();
  }, [user?.id]);

  // Real-time subscription for task updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user_tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_tasks',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    tasks,
    summary,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  };
};
