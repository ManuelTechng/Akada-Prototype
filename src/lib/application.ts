import { supabase } from './supabase';
import { Application } from './types';

export const getApplications = async (
  userId: string,
  sortBy: string = 'deadline',
  sortOrder: 'asc' | 'desc' = 'asc',
  filterStatus: string = 'all',
  searchQuery: string = ''
) => {
  try {
    console.log('Applications: Fetching applications with filters', {
      userId,
      sortBy,
      sortOrder,
      filterStatus,
      searchQuery
    });
    
    let query = supabase
      .from('applications')
      .select(`
        *,
        programs (*)
      `)
      .eq('user_id', userId);

    // Apply filter by status if not "all"
    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }

    // Apply search filter if provided
    if (searchQuery && searchQuery.trim() !== '') {
      query = query.or(
        `programs.name.ilike.%${searchQuery}%,` + 
        `programs.university.ilike.%${searchQuery}%`
      );
    }

    // Determine what field to sort by
    let sortField = 'deadline';
    if (sortBy === 'university') {
      sortField = 'programs.university';
    } else if (sortBy === 'program') {
      sortField = 'programs.name';
    } else if (sortBy === 'progress') {
      sortField = 'progress';
    } else if (sortBy === 'deadline') {
      sortField = 'deadline';
    }

    // Apply sorting
    const { data, error } = await query
      .order(sortField, { ascending: sortOrder === 'asc' });

    if (error) {
      console.error('Applications: Error fetching applications', error);
      throw error;
    }
    
    console.log('Applications: Fetched', data?.length || 0, 'applications');
    return data;
  } catch (error) {
    console.error('Applications: Error getting applications:', error);
    throw error;
  }
};

export const createApplication = async (userId: string, programId: string, deadline?: string) => {
  try {
    console.log('Applications: Creating application', { userId, programId, deadline });
    
    const { data, error } = await supabase
      .from('applications')
      .insert({
        user_id: userId,
        program_id: programId,
        deadline: deadline || null
      })
      .select()
      .single();

    if (error) {
      console.error('Applications: Error creating application', error);
      throw error;
    }
    
    console.log('Applications: Created application successfully', data);
    return data;
  } catch (error) {
    console.error('Applications: Error creating application:', error);
    throw error;
  }
};

export const updateApplication = async (
  userId: string,
  applicationId: string,
  updates: Partial<Application>
) => {
  try {
    console.log('Applications: Updating application', { userId, applicationId, updates });
    
    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', applicationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Applications: Error updating application', error);
      throw error;
    }
    
    console.log('Applications: Updated application successfully', data);
    return data;
  } catch (error) {
    console.error('Applications: Error updating application:', error);
    throw error;
  }
};

export const deleteApplication = async (userId: string, applicationId: string) => {
  try {
    console.log('Applications: Deleting application', { userId, applicationId });
    
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Applications: Error deleting application', error);
      throw error;
    }
    
    console.log('Applications: Deleted application successfully');
  } catch (error) {
    console.error('Applications: Error deleting application:', error);
    throw error;
  }
};