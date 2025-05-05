import { supabase } from './supabase';
import { EssayReview } from './types';
import { getAssistantResponse } from './openai';

export const getEssayReviews = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('essay_reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting essay reviews:', error);
    throw error;
  }
};

export const createEssayReview = async (
  userId: string,
  essayType: 'sop' | 'cv',
  content: string
) => {
  try {
    // First, create the essay review
    const { data: essay, error: essayError } = await supabase
      .from('essay_reviews')
      .insert({
        user_id: userId,
        essay_type: essayType,
        content
      })
      .select()
      .single();

    if (essayError) throw essayError;

    // Get AI feedback
    const prompt = `Please review this ${essayType === 'sop' ? 'Statement of Purpose' : 'CV'} and provide constructive feedback:\n\n${content}`;
    const feedback = await getAssistantResponse(prompt);

    // Update the essay review with AI feedback
    const { data: updatedEssay, error: updateError } = await supabase
      .from('essay_reviews')
      .update({ feedback })
      .eq('id', essay.id)
      .select()
      .single();

    if (updateError) throw updateError;
    return updatedEssay;
  } catch (error) {
    console.error('Error creating essay review:', error);
    throw error;
  }
};

export const updateEssayReview = async (
  userId: string,
  essayId: string,
  updates: Partial<EssayReview>
) => {
  try {
    const { data, error } = await supabase
      .from('essay_reviews')
      .update(updates)
      .eq('id', essayId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating essay review:', error);
    throw error;
  }
};