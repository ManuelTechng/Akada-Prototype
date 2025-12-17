import { useState, useEffect, useMemo } from 'react';
import { useApplications } from './useApplications';
import { useAuth } from '../contexts/AuthContext';

export interface ProgressStats {
  totalApplications: number;
  inProgress: number;
  submitted: number;
  completionRate: number;
  averageDaysToDeadline: number;
  upcomingDeadlines: number;
}

export const useUserProgressStats = () => {
  const { user } = useAuth();
  const { applications, loading: applicationsLoading, error: applicationsError } = useApplications();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate stats from applications data
  const stats = useMemo<ProgressStats>(() => {
    if (!applications || applications.length === 0) {
      return {
        totalApplications: 0,
        inProgress: 0,
        submitted: 0,
        completionRate: 0,
        averageDaysToDeadline: 0,
        upcomingDeadlines: 0,
      };
    }

    const now = new Date();
    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);

    // Count applications by status
    const inProgress = applications.filter(
      (app) => app.status === 'planning' || app.status === 'in-progress'
    ).length;

    const submitted = applications.filter(
      (app) =>
        app.status === 'submitted' ||
        app.status === 'in-review' ||
        app.status === 'accepted' ||
        app.status === 'rejected' ||
        app.status === 'deferred'
    ).length;

    // Calculate completion rate (submitted / total)
    const completionRate = applications.length > 0
      ? Math.round((submitted / applications.length) * 100)
      : 0;

    // Calculate average days to deadline for active applications
    const activeApplications = applications.filter(
      (app) => app.status === 'planning' || app.status === 'in-progress'
    );

    let averageDaysToDeadline = 0;
    if (activeApplications.length > 0) {
      const totalDays = activeApplications.reduce((sum, app) => {
        const deadline = new Date(app.deadline);
        const daysUntil = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        return sum + daysUntil;
      }, 0);
      averageDaysToDeadline = Math.round(totalDays / activeApplications.length);
    }

    // Count upcoming deadlines (within 30 days)
    const upcomingDeadlines = activeApplications.filter((app) => {
      const deadline = new Date(app.deadline);
      return deadline >= now && deadline <= next30Days;
    }).length;

    return {
      totalApplications: applications.length,
      inProgress,
      submitted,
      completionRate,
      averageDaysToDeadline,
      upcomingDeadlines,
    };
  }, [applications]);

  // Sync loading and error states
  useEffect(() => {
    setLoading(applicationsLoading);
    setError(applicationsError);
  }, [applicationsLoading, applicationsError]);

  return {
    stats,
    loading,
    error,
  };
};
