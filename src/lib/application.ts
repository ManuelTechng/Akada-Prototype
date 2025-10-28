import { supabase } from './supabase';
import { Application } from './types';

// ======================================
// TYPES AND INTERFACES
// ======================================

export interface CreateApplicationData {
  program_id: string;
  status?: Application['status'];
  deadline: string;
  notes?: string;
}

export interface UpdateApplicationData {
  status?: Application['status'];
  deadline?: string;
  notes?: string;
}

export interface ApplicationFilters {
  status?: string;
  searchQuery?: string;
  sortBy?: 'deadline' | 'created_at' | 'status' | 'university';
  sortOrder?: 'asc' | 'desc';
}

// ======================================
// APPLICATION CRUD OPERATIONS
// ======================================

/**
 * Get all applications for a user with optional filtering and sorting
 */
export const getApplications = async (
  userId: string,
  filters: ApplicationFilters = {}
): Promise<Application[]> => {
  try {
    const {
      status = 'all',
      searchQuery = '',
      sortBy = 'deadline',
      sortOrder = 'asc'
    } = filters;

    console.log('Applications: Fetching applications with filters', {
      userId,
      status,
      searchQuery,
      sortBy,
      sortOrder
    });
    
    let query = supabase
      .from('applications')
      .select(`
        *,
        programs!inner(
          id, name, university, country, tuition_fee, 
          application_fee, degree_type, duration, specialization
        )
      `)
      .eq('user_id', userId);

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply search filter
    if (searchQuery && searchQuery.trim() !== '') {
      const searchTerm = searchQuery.trim();
      query = query.or(
        `programs.name.ilike.%${searchTerm}%,` + 
        `programs.university.ilike.%${searchTerm}%,` +
        `programs.country.ilike.%${searchTerm}%`
      );
    }

    // Apply sorting
    let orderColumn: string = sortBy;
    if (sortBy === 'university') {
      orderColumn = 'programs.university';
    }

    const { data, error } = await query.order(orderColumn, { ascending: sortOrder === 'asc' });

    if (error) {
      console.error('Applications: Error fetching applications', error);
      throw new Error(`Failed to fetch applications: ${error.message}`);
    }
    
    console.log('Applications: Fetched', data?.length || 0, 'applications');
    return (data || []) as Application[];
  } catch (error) {
    console.error('Applications: Error getting applications:', error);
    throw error;
  }
};

/**
 * Get a single application by ID
 */
export const getApplication = async (
  userId: string, 
  applicationId: string
): Promise<Application | null> => {
  try {
    console.log('Applications: Fetching application', { userId, applicationId });
    
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        programs!inner(
          id, name, university, country, tuition_fee, 
          application_fee, degree_type, duration, specialization
        )
      `)
      .eq('id', applicationId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Applications: Error fetching application', error);
      throw new Error(`Failed to fetch application: ${error.message}`);
    }
    
    console.log('Applications: Fetched application successfully', data);
    return data as Application;
  } catch (error) {
    console.error('Applications: Error getting application:', error);
    throw error;
  }
};

/**
 * Create a new application
 */
export const createApplication = async (
  userId: string, 
  applicationData: CreateApplicationData
): Promise<Application> => {
  try {
    console.log('Applications: Creating application', { userId, applicationData });
    
    // Validate required fields
    if (!applicationData.program_id) {
      throw new Error('Program ID is required');
    }
    if (!applicationData.deadline) {
      throw new Error('Deadline is required');
    }

    const { data, error } = await supabase
      .from('applications')
      .insert({
        user_id: userId,
        program_id: applicationData.program_id,
        status: applicationData.status || 'planning',
        deadline: applicationData.deadline,
        notes: applicationData.notes || null
      })
      .select(`
        *,
        programs!inner(
          id, name, university, country, tuition_fee, 
          application_fee, degree_type, duration, specialization
        )
      `)
      .single();

    if (error) {
      console.error('Applications: Error creating application', error);
      throw new Error(`Failed to create application: ${error.message}`);
    }
    
    console.log('Applications: Created application successfully', data);
    return data as Application;
  } catch (error) {
    console.error('Applications: Error creating application:', error);
    throw error;
  }
};

/**
 * Update an existing application
 */
export const updateApplication = async (
  userId: string,
  applicationId: string,
  updates: UpdateApplicationData
): Promise<Application> => {
  try {
    console.log('Applications: Updating application', { userId, applicationId, updates });
    
    // Remove undefined values from updates
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdates).length === 0) {
      throw new Error('No valid fields to update');
    }

    const { data, error } = await supabase
      .from('applications')
      .update({
        ...cleanUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .eq('user_id', userId)
      .select(`
        *,
        programs!inner(
          id, name, university, country, tuition_fee, 
          application_fee, degree_type, duration, specialization
        )
      `)
      .single();

    if (error) {
      console.error('Applications: Error updating application', error);
      throw new Error(`Failed to update application: ${error.message}`);
    }
    
    console.log('Applications: Updated application successfully', data);
    return data as Application;
  } catch (error) {
    console.error('Applications: Error updating application:', error);
    throw error;
  }
};

/**
 * Update application status only
 */
export const updateApplicationStatus = async (
  userId: string,
  applicationId: string,
  status: Application['status']
): Promise<Application> => {
  try {
    console.log('Applications: Updating application status', { userId, applicationId, status });
    
    return await updateApplication(userId, applicationId, { status });
  } catch (error) {
    console.error('Applications: Error updating application status:', error);
    throw error;
  }
};

/**
 * Delete an application
 */
export const deleteApplication = async (
  userId: string, 
  applicationId: string
): Promise<void> => {
  try {
    console.log('Applications: Deleting application', { userId, applicationId });
    
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Applications: Error deleting application', error);
      throw new Error(`Failed to delete application: ${error.message}`);
    }
    
    console.log('Applications: Deleted application successfully');
  } catch (error) {
    console.error('Applications: Error deleting application:', error);
    throw error;
  }
};

/**
 * Check if user already has an application for a specific program
 */
export const hasApplicationForProgram = async (
  userId: string,
  programId: string
): Promise<boolean> => {
  try {
    console.log('Applications: Checking for existing application', { userId, programId });
    
    const { data, error } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', userId)
      .eq('program_id', programId)
      .limit(1);

    if (error) {
      console.error('Applications: Error checking for existing application', error);
      throw new Error(`Failed to check for existing application: ${error.message}`);
    }
    
    const exists = (data && data.length > 0);
    console.log('Applications: User has existing application for program:', exists);
    return exists;
  } catch (error) {
    console.error('Applications: Error checking for existing application:', error);
    throw error;
  }
};

// ======================================
// APPLICATION STATISTICS
// ======================================

/**
 * Get application statistics for a user
 */
export const getApplicationStats = async (userId: string) => {
  try {
    console.log('Applications: Fetching application statistics', { userId });
    
    const { data, error } = await supabase
      .from('applications')
      .select('status')
      .eq('user_id', userId);

    if (error) {
      console.error('Applications: Error fetching application stats', error);
      throw new Error(`Failed to fetch application stats: ${error.message}`);
    }

    // Count applications by status
    const stats = {
      total: data.length,
      planning: 0,
      'in-progress': 0,
      submitted: 0,
      'in-review': 0,
      accepted: 0,
      rejected: 0,
      deferred: 0
    };

    data.forEach(app => {
      if (app.status in stats) {
        stats[app.status as keyof typeof stats]++;
      }
    });

    console.log('Applications: Application statistics', stats);
    return stats;
  } catch (error) {
    console.error('Applications: Error getting application stats:', error);
    throw error;
  }
};

/**
 * Get upcoming deadlines for a user
 */
export const getUpcomingDeadlines = async (
  userId: string,
  daysAhead: number = 30
): Promise<Application[]> => {
  try {
    console.log('Applications: Fetching upcoming deadlines', { userId, daysAhead });
    
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        programs!inner(
          id, name, university, country, tuition_fee, 
          application_fee, degree_type, duration, specialization
        )
      `)
      .eq('user_id', userId)
      .gte('deadline', today.toISOString().split('T')[0])
      .lte('deadline', futureDate.toISOString().split('T')[0])
      .in('status', ['planning', 'in-progress'])
      .order('deadline', { ascending: true });

    if (error) {
      console.error('Applications: Error fetching upcoming deadlines', error);
      throw new Error(`Failed to fetch upcoming deadlines: ${error.message}`);
    }
    
    console.log('Applications: Fetched', data?.length || 0, 'upcoming deadlines');
    return (data || []) as Application[];
  } catch (error) {
    console.error('Applications: Error getting upcoming deadlines:', error);
    throw error;
  }
};

/**
 * Get overdue applications for a user
 */
export const getOverdueApplications = async (userId: string): Promise<Application[]> => {
  try {
    console.log('Applications: Fetching overdue applications', { userId });
    
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        programs!inner(
          id, name, university, country, tuition_fee, 
          application_fee, degree_type, duration, specialization
        )
      `)
      .eq('user_id', userId)
      .lt('deadline', today)
      .in('status', ['planning', 'in-progress'])
      .order('deadline', { ascending: true });

    if (error) {
      console.error('Applications: Error fetching overdue applications', error);
      throw new Error(`Failed to fetch overdue applications: ${error.message}`);
    }
    
    console.log('Applications: Fetched', data?.length || 0, 'overdue applications');
    return (data || []) as Application[];
  } catch (error) {
    console.error('Applications: Error getting overdue applications:', error);
    throw error;
  }
};

// ======================================
// BULK OPERATIONS
// ======================================

/**
 * Bulk update application statuses
 */
export const bulkUpdateApplicationStatus = async (
  userId: string,
  applicationIds: string[],
  status: Application['status']
): Promise<void> => {
  try {
    console.log('Applications: Bulk updating application statuses', { 
      userId, 
      applicationIds, 
      status 
    });
    
    if (applicationIds.length === 0) {
      return;
    }

    const { error } = await supabase
      .from('applications')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .in('id', applicationIds);

    if (error) {
      console.error('Applications: Error bulk updating application statuses', error);
      throw new Error(`Failed to bulk update application statuses: ${error.message}`);
    }
    
    console.log('Applications: Bulk updated', applicationIds.length, 'application statuses');
  } catch (error) {
    console.error('Applications: Error bulk updating application statuses:', error);
    throw error;
  }
};

/**
 * Bulk delete applications
 */
export const bulkDeleteApplications = async (
  userId: string,
  applicationIds: string[]
): Promise<void> => {
  try {
    console.log('Applications: Bulk deleting applications', { userId, applicationIds });
    
    if (applicationIds.length === 0) {
      return;
    }

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('user_id', userId)
      .in('id', applicationIds);

    if (error) {
      console.error('Applications: Error bulk deleting applications', error);
      throw new Error(`Failed to bulk delete applications: ${error.message}`);
    }
    
    console.log('Applications: Bulk deleted', applicationIds.length, 'applications');
  } catch (error) {
    console.error('Applications: Error bulk deleting applications:', error);
    throw error;
  }
};

// ======================================
// HELPER FUNCTIONS
// ======================================

/**
 * Calculate days until deadline
 */
export const getDaysUntilDeadline = (deadline: string): number => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const timeDiff = deadlineDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Get urgency level for an application
 */
export const getApplicationUrgency = (
  deadline: string,
  status: Application['status']
): 'overdue' | 'urgent' | 'upcoming' | 'future' | 'completed' => {
  if (['submitted', 'in-review', 'accepted', 'rejected', 'deferred'].includes(status)) {
    return 'completed';
  }

  const daysLeft = getDaysUntilDeadline(deadline);
  
  if (daysLeft < 0) return 'overdue';
  if (daysLeft <= 7) return 'urgent';
  if (daysLeft <= 30) return 'upcoming';
  return 'future';
};

// ======================================
// LEGACY COMPATIBILITY
// ======================================

/**
 * Legacy function for backward compatibility
 * @deprecated Use getApplications with filters instead
 */
export const getApplicationsLegacy = async (
  userId: string,
  sortBy: string = 'deadline',
  sortOrder: 'asc' | 'desc' = 'asc',
  filterStatus: string = 'all',
  searchQuery: string = ''
) => {
  return getApplications(userId, {
    status: filterStatus,
    searchQuery,
    sortBy: sortBy as ApplicationFilters['sortBy'],
    sortOrder
  });
};

export default {
  // Main CRUD operations
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
  
  // Utility functions
  hasApplicationForProgram,
  getApplicationStats,
  getUpcomingDeadlines,
  getOverdueApplications,
  
  // Bulk operations
  bulkUpdateApplicationStatus,
  bulkDeleteApplications,
  
  // Helper functions
  getDaysUntilDeadline,
  getApplicationUrgency
};