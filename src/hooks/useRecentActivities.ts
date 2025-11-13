import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Activity {
  id: string;
  user_id: string;
  action_type: 'saved_program' | 'updated_application' | 'set_deadline' | 'profile_update' | 'document_upload';
  description: string;
  related_entity_id?: string;
  created_at: string;
}

export interface ActivityDisplay {
  icon: any; // lucide-react icon component
  text: string;
  time: string;
  color: string;
  bg: string;
}

export const useRecentActivities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    if (!user) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Try to fetch from user_activities table
      const { data, error: fetchError } = await supabase
        .from('user_activities' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);

      if (fetchError) {
        console.warn('user_activities table not found, generating from recent changes');
        // Fallback: Generate activities from recent application updates
        await generateActivitiesFromChanges();
      } else {
        setActivities((data || []) as unknown as Activity[]);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      // Generate fallback activities
      await generateActivitiesFromChanges();
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const generateActivitiesFromChanges = async () => {
    try {
      // Get recent application updates
      const { data: apps } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          updated_at,
          programs (
            name,
            university
          )
        `)
        .eq('user_id', user?.id || '')
        .order('updated_at', { ascending: false })
        .limit(4);

      if (apps && apps.length > 0) {
        const generatedActivities: Activity[] = apps.map((app: any) => ({
          id: `generated-${app.id}`,
          user_id: user?.id || '',
          action_type: 'updated_application' as const,
          description: `Updated application for ${app.programs?.name || 'program'}`,
          related_entity_id: app.id,
          created_at: app.updated_at,
        }));

        setActivities(generatedActivities);
      } else {
        // If no applications, show empty state
        setActivities([]);
      }
    } catch (err) {
      console.error('Error generating activities:', err);
      setActivities([]);
    }
  };

  const logActivity = async (
    actionType: Activity['action_type'],
    description: string,
    relatedEntityId?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error: insertError } = await supabase
        .from('user_activities' as any)
        .insert([
          {
            user_id: user.id,
            action_type: actionType,
            description,
            related_entity_id: relatedEntityId,
            created_at: new Date().toISOString(),
          },
        ]);

      if (insertError) throw insertError;

      // Refresh activities
      await fetchActivities();
      return true;
    } catch (err) {
      console.error('Error logging activity:', err);
      return false;
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    fetchActivities();
  }, [user?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user_activities_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_activities',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    activities,
    loading,
    error,
    logActivity,
    formatTimeAgo,
    refetch: fetchActivities,
  };
};
