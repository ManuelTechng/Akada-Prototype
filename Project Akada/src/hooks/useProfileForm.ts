import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { UserProfile } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import { useErrorHandler } from './useErrorHandler';
import { useLogger } from './useLogger';

// Profile form validation schema
const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  education_level: z.string().min(1, 'Education level is required'),
  current_university: z.string().optional(),
  field_of_study: z.string().optional(),
  gpa: z.string().optional().refine((val) => {
    if (!val) return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 4;
  }, 'GPA must be between 0 and 4'),
  phone_number: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state_province: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  date_of_birth: z.string().optional(),
  bio: z.string().optional(),
  test_scores: z.object({
    ielts: z.string().optional().refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 9;
    }, 'IELTS score must be between 0 and 9'),
    toefl: z.string().optional().refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 120;
    }, 'TOEFL score must be between 0 and 120'),
    gre: z.object({
      verbal: z.string().optional(),
      quantitative: z.string().optional(),
      analytical: z.string().optional()
    }).optional()
  }).optional(),
  study_preferences: z.object({
    countries: z.array(z.string()).min(1, 'Select at least one country'),
    max_tuition: z.string().min(1, 'Select a tuition range'),
    program_type: z.array(z.string()).min(1, 'Select at least one program type'),
    start_date: z.string().min(1, 'Select a start date')
  }).optional()
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const useProfileForm = () => {
  const { profile, updateProfile } = useAuth();
  const { handleError } = useErrorHandler();
  const logger = useLogger();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      full_name: profile?.full_name || '',
      email: profile?.email || '',
      education_level: profile?.education_level || '',
      current_university: profile?.current_university || '',
      field_of_study: profile?.field_of_study || '',
      gpa: profile?.gpa?.toString() || '',
      phone_number: profile?.phone_number || '',
      address_line1: profile?.address_line1 || '',
      address_line2: profile?.address_line2 || '',
      city: profile?.city || '',
      state_province: profile?.state_province || '',
      postal_code: profile?.postal_code || '',
      country: profile?.country || '',
      date_of_birth: profile?.date_of_birth || '',
      bio: profile?.bio || '',
      test_scores: {
        ielts: profile?.test_scores?.ielts?.toString() || '',
        toefl: profile?.test_scores?.toefl?.toString() || '',
        gre: {
          verbal: profile?.test_scores?.gre?.verbal?.toString() || '',
          quantitative: profile?.test_scores?.gre?.quantitative?.toString() || '',
          analytical: profile?.test_scores?.gre?.analytical?.toString() || ''
        }
      },
      study_preferences: {
        countries: profile?.study_preferences?.countries || [],
        max_tuition: profile?.study_preferences?.max_tuition?.toString() || '',
        program_type: profile?.study_preferences?.program_type || [],
        start_date: profile?.study_preferences?.start_date || ''
      }
    }
  });

  const onSubmit = useCallback(async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      logger.info('Submitting profile form', { data });
      
      // Convert string values to numbers where needed
      const profileData: Partial<UserProfile> = {
        ...data,
        gpa: data.gpa ? parseFloat(data.gpa) : undefined,
        test_scores: {
          ielts: data.test_scores?.ielts ? parseFloat(data.test_scores.ielts) : '',
          toefl: data.test_scores?.toefl ? parseFloat(data.test_scores.toefl) : '',
          gre: {
            verbal: data.test_scores?.gre?.verbal ? parseFloat(data.test_scores.gre.verbal) : '',
            quantitative: data.test_scores?.gre?.quantitative ? parseFloat(data.test_scores.gre.quantitative) : '',
            analytical: data.test_scores?.gre?.analytical ? parseFloat(data.test_scores.gre.analytical) : ''
          }
        },
        study_preferences: {
          countries: data.study_preferences?.countries || [],
          max_tuition: data.study_preferences?.max_tuition ? parseFloat(data.study_preferences.max_tuition) : '',
          program_type: data.study_preferences?.program_type || [],
          start_date: data.study_preferences?.start_date || ''
        }
      };

      await updateProfile(profileData);
      setSubmitSuccess(true);
      logger.info('Profile updated successfully');
    } catch (error) {
      logger.error('Error updating profile', { error });
      handleError(error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  }, [updateProfile, handleError, logger]);

  const resetForm = useCallback(() => {
    form.reset();
    setSubmitError(null);
    setSubmitSuccess(false);
  }, [form]);

  return {
    form,
    isSubmitting,
    submitError,
    submitSuccess,
    onSubmit: form.handleSubmit(onSubmit),
    resetForm,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    isDirty: form.formState.isDirty
  };
}; 