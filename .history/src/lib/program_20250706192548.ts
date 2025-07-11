import { supabase } from './supabase';
import { Program } from './types';

export const searchPrograms = async (filters: {
  query?: string;
  country?: string;
  maxTuition?: number;
  degreeType?: string;
  field?: string;
  scholarshipsOnly?: boolean;
  sortBy?: string;
}) => {
  try {
    let query = supabase
      .from('programs')
      .select('*');

    // Apply text search filter
    if (filters.query) {
      query = query.or(
        `name.ilike.%${filters.query}%,` +
        `university.ilike.%${filters.query}%,` +
        `country.ilike.%${filters.query}%`
      );
    }

    // Apply country filter
    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    // Apply tuition filter
    if (filters.maxTuition) {
      query = query.lte('tuition_fee', filters.maxTuition);
    }

    // Apply degree type filter
    if (filters.degreeType) {
      query = query.eq('degree_type', filters.degreeType);
    }

    // Apply field filter (simplified - in a real app, you might have a separate fields table)
    if (filters.field) {
      query = query.ilike('name', `%${filters.field}%`);
    }

    // Apply scholarship filter
    if (filters.scholarshipsOnly) {
      query = query.eq('has_scholarships', true);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'tuition-low':
        query = query.order('tuition_fee', { ascending: true });
        break;
      case 'tuition-high':
        query = query.order('tuition_fee', { ascending: false });
        break;
      case 'deadline':
        // This assumes you have a deadline field - adjust as needed
        query = query.order('created_at', { ascending: true });
        break;
      case 'match':
      default:
        // Default sorting by creation date (most recent first)
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;
    
    return data as Program[];
  } catch (error) {
    console.error('Error searching programs:', error);
    throw error;
  }
};

export const getFavoritePrograms = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        programs (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    
    // Transform the data to match the Program type
    return data.map(favorite => favorite.programs);
  } catch (error) {
    console.error('Error getting favorite programs:', error);
    return [];
  }
};

export const toggleFavoriteProgram = async (userId: string, programId: string) => {
  try {
    // First, check if the favorite already exists
    const { data: existingFavorite, error: checkError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('program_id', programId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {  // PGRST116 is "no rows returned"
      throw checkError;
    }

    if (existingFavorite) {
      // If favorite exists, remove it
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existingFavorite.id);
      
      if (deleteError) throw deleteError;
      return { added: false, programId };
    } else {
      // If favorite doesn't exist, add it
      const { error: insertError } = await supabase
        .from('favorites')
        .insert({ user_id: userId, program_id: programId });
      
      if (insertError) throw insertError;
      return { added: true, programId };
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};