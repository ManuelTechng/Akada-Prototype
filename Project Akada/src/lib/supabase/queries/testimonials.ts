import { supabase } from '../../supabase';
import type { Database } from '../../database.types';

type Testimonial = Database['public']['Tables']['alumni_testimonials']['Row'];
type TestimonialInsert = Database['public']['Tables']['alumni_testimonials']['Insert'];
type TestimonialUpdate = Database['public']['Tables']['alumni_testimonials']['Update'];

export interface TestimonialWithInstitution extends Testimonial {
  university?: {
    id: string;
    name: string;
    country_code: string | null;
  };
}

/**
 * Get approved testimonials, optionally filtered by institution
 */
export async function getApprovedTestimonials(
  institutionId?: string,
  limit?: number
): Promise<TestimonialWithInstitution[]> {
  try {
    let query = supabase
      .from('alumni_testimonials')
      .select(`
        *,
        university:universities(
          id,
          name,
          country_code
        )
      `)
      .eq('status', 'approved')
      .order('featured', { ascending: false })
      .order('submitted_at', { ascending: false });

    // Filter by institution if provided
    if (institutionId) {
      query = query.eq('university_id', institutionId);
    }

    // Apply limit if provided
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching approved testimonials:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getApprovedTestimonials:', error);
    throw error;
  }
}

/**
 * Get featured testimonials for homepage display
 */
export async function getFeaturedTestimonials(limit: number = 6): Promise<TestimonialWithInstitution[]> {
  try {
    const { data, error } = await supabase
      .from('alumni_testimonials')
      .select(`
        *,
        university:universities(
          id,
          name,
          country_code
        )
      `)
      .eq('status', 'approved')
      .eq('featured', true)
      .order('submitted_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured testimonials:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFeaturedTestimonials:', error);
    throw error;
  }
}

/**
 * Get testimonials by tags for filtering
 */
export async function getTestimonialsByTags(
  tags: string[],
  institutionId?: string,
  limit?: number
): Promise<TestimonialWithInstitution[]> {
  try {
    let query = supabase
      .from('alumni_testimonials')
      .select(`
        *,
        university:universities(
          id,
          name,
          country_code
        )
      `)
      .eq('status', 'approved')
      .overlaps('tags', tags)
      .order('submitted_at', { ascending: false });

    // Filter by institution if provided
    if (institutionId) {
      query = query.eq('university_id', institutionId);
    }

    // Apply limit if provided
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching testimonials by tags:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTestimonialsByTags:', error);
    throw error;
  }
}

/**
 * Get testimonials by rating (high-rated testimonials)
 */
export async function getHighRatedTestimonials(
  minRating: number = 4.0,
  institutionId?: string,
  limit?: number
): Promise<TestimonialWithInstitution[]> {
  try {
    let query = supabase
      .from('alumni_testimonials')
      .select(`
        *,
        university:universities(
          id,
          name,
          country_code
        )
      `)
      .eq('status', 'approved')
      .gte('rating', minRating)
      .order('rating', { ascending: false })
      .order('submitted_at', { ascending: false });

    // Filter by institution if provided
    if (institutionId) {
      query = query.eq('university_id', institutionId);
    }

    // Apply limit if provided
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching high-rated testimonials:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getHighRatedTestimonials:', error);
    throw error;
  }
}

/**
 * Get all testimonials (including pending) for admin review
 */
export async function getAllTestimonials(
  status?: string,
  institutionId?: string,
  limit?: number
): Promise<TestimonialWithInstitution[]> {
  try {
    let query = supabase
      .from('alumni_testimonials')
      .select(`
        *,
        university:universities(
          id,
          name,
          country_code
        )
      `)
      .order('submitted_at', { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by institution if provided
    if (institutionId) {
      query = query.eq('university_id', institutionId);
    }

    // Apply limit if provided
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching all testimonials:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllTestimonials:', error);
    throw error;
  }
}

/**
 * Create a new testimonial
 */
export async function createTestimonial(testimonial: TestimonialInsert): Promise<Testimonial> {
  try {
    const { data, error } = await supabase
      .from('alumni_testimonials')
      .insert(testimonial)
      .select()
      .single();

    if (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createTestimonial:', error);
    throw error;
  }
}

/**
 * Update testimonial status (for approval workflow)
 */
export async function updateTestimonialStatus(
  testimonialId: string,
  status: 'pending' | 'approved' | 'rejected',
  approvedBy?: string
): Promise<Testimonial> {
  try {
    const updateData: TestimonialUpdate = {
      status,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
      approved_by: approvedBy || null
    };

    const { data, error } = await supabase
      .from('alumni_testimonials')
      .update(updateData)
      .eq('id', testimonialId)
      .select()
      .single();

    if (error) {
      console.error('Error updating testimonial status:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateTestimonialStatus:', error);
    throw error;
  }
}

/**
 * Update testimonial (general update)
 */
export async function updateTestimonial(
  testimonialId: string,
  updates: TestimonialUpdate
): Promise<Testimonial> {
  try {
    const { data, error } = await supabase
      .from('alumni_testimonials')
      .update(updates)
      .eq('id', testimonialId)
      .select()
      .single();

    if (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateTestimonial:', error);
    throw error;
  }
}

/**
 * Delete testimonial
 */
export async function deleteTestimonial(testimonialId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('alumni_testimonials')
      .delete()
      .eq('id', testimonialId);

    if (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteTestimonial:', error);
    throw error;
  }
}

/**
 * Get testimonial statistics for an institution
 */
export async function getTestimonialStats(institutionId: string): Promise<{
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  averageRating: number | null;
  wouldRecommendPercentage: number | null;
}> {
  try {
    const { data, error } = await supabase
      .from('alumni_testimonials')
      .select('status, rating, would_recommend')
      .eq('university_id', institutionId);

    if (error) {
      console.error('Error fetching testimonial stats:', error);
      throw error;
    }

    const testimonials = data || [];
    
    const stats = {
      total: testimonials.length,
      approved: testimonials.filter(t => t.status === 'approved').length,
      pending: testimonials.filter(t => t.status === 'pending').length,
      rejected: testimonials.filter(t => t.status === 'rejected').length,
      averageRating: null as number | null,
      wouldRecommendPercentage: null as number | null
    };

    // Calculate average rating from approved testimonials
    const approvedTestimonials = testimonials.filter(t => t.status === 'approved' && t.rating);
    if (approvedTestimonials.length > 0) {
      const totalRating = approvedTestimonials.reduce((sum, t) => sum + (t.rating || 0), 0);
      stats.averageRating = totalRating / approvedTestimonials.length;
    }

    // Calculate would recommend percentage
    const recommendTestimonials = testimonials.filter(t => t.status === 'approved' && t.would_recommend !== null);
    if (recommendTestimonials.length > 0) {
      const wouldRecommend = recommendTestimonials.filter(t => t.would_recommend).length;
      stats.wouldRecommendPercentage = (wouldRecommend / recommendTestimonials.length) * 100;
    }

    return stats;
  } catch (error) {
    console.error('Error in getTestimonialStats:', error);
    throw error;
  }
}


