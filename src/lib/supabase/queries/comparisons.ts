import { supabase } from '../../supabase';
import type { Database } from '../../database.types';

type Comparison = Database['public']['Tables']['program_comparisons']['Row'];
type ComparisonInsert = Database['public']['Tables']['program_comparisons']['Insert'];
type ComparisonUpdate = Database['public']['Tables']['program_comparisons']['Update'];

export interface ComparisonWithPrograms extends Comparison {
  programs: Array<{
    id: string;
    name: string;
    degree_type: string;
    university: string;
    country: string;
    tuition_fee: number;
    duration_years: number | null;
    program_url?: string;
    application_deadlines?: any;
    intake_periods?: string[];
    min_gpa?: number;
    language_requirements?: any;
    required_documents?: string[];
  }>;
}

/**
 * Save a new program comparison
 */
export async function saveComparison(
  userId: string,
  programIds: string[],
  comparisonName?: string,
  notes?: string
): Promise<Comparison> {
  try {
    // Validate program count (max 3)
    if (programIds.length < 2 || programIds.length > 3) {
      throw new Error('Comparison must include 2-3 programs');
    }

    // Deactivate any existing active comparison for this user
    await supabase
      .from('program_comparisons')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true);

    const { data, error } = await supabase
      .from('program_comparisons')
      .insert({
        user_id: userId,
        program_ids: programIds,
        comparison_name: comparisonName,
        notes: notes,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving comparison:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in saveComparison:', error);
    throw error;
  }
}

/**
 * Get all comparisons for a user
 */
export async function getUserComparisons(userId: string): Promise<ComparisonWithPrograms[]> {
  try {
    const { data, error } = await supabase
      .from('program_comparisons')
      .select(`
        *,
        programs:programs(
          id,
          name,
          degree_type,
          university,
          country,
          tuition_fee,
          duration_years,
          program_url,
          application_deadlines,
          intake_periods,
          min_gpa,
          language_requirements,
          required_documents
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user comparisons:', error);
      throw error;
    }

    // Transform the data to match the expected interface
    const comparisons = (data || []).map(comparison => ({
      ...comparison,
      programs: comparison.program_ids.map((programId: string) => {
        const program = comparison.programs?.find((p: any) => p.id === programId);
        return program || null;
      }).filter(Boolean)
    }));

    return comparisons;
  } catch (error) {
    console.error('Error in getUserComparisons:', error);
    throw error;
  }
}

/**
 * Get the most recent active comparison for a user
 */
export async function getActiveComparison(userId: string): Promise<ComparisonWithPrograms | null> {
  try {
    const { data, error } = await supabase
      .from('program_comparisons')
      .select(`
        *,
        programs:programs(
          id,
          name,
          degree_type,
          university,
          country,
          tuition_fee,
          duration_years,
          program_url,
          application_deadlines,
          intake_periods,
          min_gpa,
          language_requirements,
          required_documents
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No active comparison found
        return null;
      }
      console.error('Error fetching active comparison:', error);
      throw error;
    }

    // Transform the data to match the expected interface
    const comparison = {
      ...data,
      programs: data.program_ids.map((programId: string) => {
        const program = data.programs?.find((p: any) => p.id === programId);
        return program || null;
      }).filter(Boolean)
    };

    return comparison;
  } catch (error) {
    console.error('Error in getActiveComparison:', error);
    throw error;
  }
}

/**
 * Update an existing comparison
 */
export async function updateComparison(
  comparisonId: string,
  updates: {
    programIds?: string[];
    comparisonName?: string;
    notes?: string;
    isActive?: boolean;
  }
): Promise<Comparison> {
  try {
    // Validate program count if programIds is being updated
    if (updates.programIds && (updates.programIds.length < 2 || updates.programIds.length > 3)) {
      throw new Error('Comparison must include 2-3 programs');
    }

    // If making this comparison active, deactivate others
    if (updates.isActive) {
      const { data: comparison } = await supabase
        .from('program_comparisons')
        .select('user_id')
        .eq('id', comparisonId)
        .single();

      if (comparison) {
        await supabase
          .from('program_comparisons')
          .update({ is_active: false })
          .eq('user_id', comparison.user_id)
          .eq('is_active', true)
          .neq('id', comparisonId);
      }
    }

    const updateData: ComparisonUpdate = {};
    if (updates.programIds) updateData.program_ids = updates.programIds;
    if (updates.comparisonName !== undefined) updateData.comparison_name = updates.comparisonName;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('program_comparisons')
      .update(updateData)
      .eq('id', comparisonId)
      .select()
      .single();

    if (error) {
      console.error('Error updating comparison:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateComparison:', error);
    throw error;
  }
}

/**
 * Delete a comparison
 */
export async function deleteComparison(comparisonId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('program_comparisons')
      .delete()
      .eq('id', comparisonId);

    if (error) {
      console.error('Error deleting comparison:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteComparison:', error);
    throw error;
  }
}

/**
 * Add a program to an existing comparison
 */
export async function addProgramToComparison(
  comparisonId: string,
  programId: string
): Promise<Comparison> {
  try {
    // Get current comparison
    const { data: currentComparison, error: fetchError } = await supabase
      .from('program_comparisons')
      .select('program_ids')
      .eq('id', comparisonId)
      .single();

    if (fetchError) {
      console.error('Error fetching current comparison:', fetchError);
      throw fetchError;
    }

    const currentProgramIds = currentComparison.program_ids || [];
    
    // Check if program is already in comparison
    if (currentProgramIds.includes(programId)) {
      throw new Error('Program is already in this comparison');
    }

    // Check if adding would exceed limit
    if (currentProgramIds.length >= 3) {
      throw new Error('Cannot add more than 3 programs to a comparison');
    }

    // Add program to comparison
    const updatedProgramIds = [...currentProgramIds, programId];
    
    const { data, error } = await supabase
      .from('program_comparisons')
      .update({ program_ids: updatedProgramIds })
      .eq('id', comparisonId)
      .select()
      .single();

    if (error) {
      console.error('Error adding program to comparison:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addProgramToComparison:', error);
    throw error;
  }
}

/**
 * Remove a program from a comparison
 */
export async function removeProgramFromComparison(
  comparisonId: string,
  programId: string
): Promise<Comparison> {
  try {
    // Get current comparison
    const { data: currentComparison, error: fetchError } = await supabase
      .from('program_comparisons')
      .select('program_ids')
      .eq('id', comparisonId)
      .single();

    if (fetchError) {
      console.error('Error fetching current comparison:', fetchError);
      throw fetchError;
    }

    const currentProgramIds = currentComparison.program_ids || [];
    
    // Check if program is in comparison
    if (!currentProgramIds.includes(programId)) {
      throw new Error('Program is not in this comparison');
    }

    // Check if removing would leave less than 2 programs
    if (currentProgramIds.length <= 2) {
      throw new Error('Comparison must have at least 2 programs');
    }

    // Remove program from comparison
    const updatedProgramIds = currentProgramIds.filter(id => id !== programId);
    
    const { data, error } = await supabase
      .from('program_comparisons')
      .update({ program_ids: updatedProgramIds })
      .eq('id', comparisonId)
      .select()
      .single();

    if (error) {
      console.error('Error removing program from comparison:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in removeProgramFromComparison:', error);
    throw error;
  }
}

/**
 * Get comparison statistics for a user
 */
export async function getComparisonStats(userId: string): Promise<{
  totalComparisons: number;
  activeComparison: boolean;
  mostComparedPrograms: Array<{
    programId: string;
    programName: string;
    count: number;
  }>;
}> {
  try {
    const { data, error } = await supabase
      .from('program_comparisons')
      .select('program_ids, programs(name)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching comparison stats:', error);
      throw error;
    }

    const comparisons = data || [];
    
    // Count program appearances
    const programCounts: Record<string, { name: string; count: number }> = {};
    
    comparisons.forEach(comparison => {
      comparison.program_ids.forEach((programId: string) => {
        const program = comparison.programs?.find((p: any) => p.id === programId);
        if (program) {
          if (!programCounts[programId]) {
            programCounts[programId] = { name: program.name, count: 0 };
          }
          programCounts[programId].count++;
        }
      });
    });

    // Get most compared programs
    const mostComparedPrograms = Object.entries(programCounts)
      .map(([programId, data]) => ({
        programId,
        programName: data.name,
        count: data.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalComparisons: comparisons.length,
      activeComparison: comparisons.some(c => c.is_active),
      mostComparedPrograms
    };
  } catch (error) {
    console.error('Error in getComparisonStats:', error);
    throw error;
  }
}


