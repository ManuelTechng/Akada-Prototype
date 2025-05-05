import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Define validation schemas
export const onboardingSchema = z.object({
  current_university: z.string().min(1, 'University is required'),
  field_of_study: z.string().min(1, 'Field of study is required'),
  gpa: z.string().optional().refine((val) => {
    if (!val) return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 4;
  }, 'GPA must be between 0 and 4'),
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

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const useFormValidation = () => {
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onChange'
  });

  return {
    form,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting
  };
};