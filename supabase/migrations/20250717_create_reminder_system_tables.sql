-- Create reminder_rules table
CREATE TABLE public.reminder_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  description text,
  days_before_deadline integer[] NOT NULL,
  notification_types text[] NOT NULL CHECK (notification_types <@ ARRAY['email', 'push', 'in_app']),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create deadline_reminders table
CREATE TABLE public.deadline_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  application_id uuid NOT NULL REFERENCES public.applications(id),
  program_name text NOT NULL,
  deadline date NOT NULL,
  days_until_deadline integer NOT NULL,
  reminder_sent boolean DEFAULT false,
  reminder_sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create reminder_jobs table
CREATE TABLE public.reminder_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('deadline', 'status_update', 'custom')),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  application_id uuid REFERENCES public.applications(id),
  program_id uuid REFERENCES public.programs(id),
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Enable RLS
ALTER TABLE public.reminder_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadline_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reminder_rules
CREATE POLICY "Users can view their own reminder rules." ON public.reminder_rules 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminder rules." ON public.reminder_rules 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminder rules." ON public.reminder_rules 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminder rules." ON public.reminder_rules 
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for deadline_reminders
CREATE POLICY "Users can view their own deadline reminders." ON public.deadline_reminders 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deadline reminders." ON public.deadline_reminders 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deadline reminders." ON public.deadline_reminders 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deadline reminders." ON public.deadline_reminders 
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for reminder_jobs
CREATE POLICY "Users can view their own reminder jobs." ON public.reminder_jobs 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminder jobs." ON public.reminder_jobs 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminder jobs." ON public.reminder_jobs 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminder jobs." ON public.reminder_jobs 
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_reminder_rules_user_id ON public.reminder_rules(user_id);
CREATE INDEX idx_reminder_rules_active ON public.reminder_rules(is_active) WHERE is_active = true;

CREATE INDEX idx_deadline_reminders_user_id ON public.deadline_reminders(user_id);
CREATE INDEX idx_deadline_reminders_deadline ON public.deadline_reminders(deadline);
CREATE INDEX idx_deadline_reminders_application_id ON public.deadline_reminders(application_id);

CREATE INDEX idx_reminder_jobs_user_id ON public.reminder_jobs(user_id);
CREATE INDEX idx_reminder_jobs_status ON public.reminder_jobs(status);
CREATE INDEX idx_reminder_jobs_scheduled_for ON public.reminder_jobs(scheduled_for);
CREATE INDEX idx_reminder_jobs_type ON public.reminder_jobs(type);

-- Create function to automatically create default reminder rules for new users
CREATE OR REPLACE FUNCTION create_default_reminder_rules()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.reminder_rules (user_id, name, description, days_before_deadline, notification_types, is_active)
  VALUES 
    (NEW.id, 'Final Deadline Reminder', 'Reminder sent 1 day before application deadline', ARRAY[1], ARRAY['email', 'push', 'in_app'], true),
    (NEW.id, 'Urgent Deadline Reminder', 'Reminder sent 3 days before application deadline', ARRAY[3], ARRAY['email', 'push', 'in_app'], true),
    (NEW.id, 'Weekly Deadline Reminder', 'Reminder sent 7 days before application deadline', ARRAY[7], ARRAY['email', 'in_app'], true),
    (NEW.id, 'Monthly Deadline Reminder', 'Reminder sent 30 days before application deadline', ARRAY[30], ARRAY['email'], true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create default reminder rules
CREATE TRIGGER create_default_reminder_rules_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_reminder_rules();

-- Create function to clean up old reminder jobs
CREATE OR REPLACE FUNCTION cleanup_old_reminder_jobs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.reminder_jobs 
  WHERE status IN ('sent', 'failed', 'cancelled') 
    AND processed_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to process deadline reminders
CREATE OR REPLACE FUNCTION process_deadline_reminders()
RETURNS integer AS $$
DECLARE
  reminders_created integer := 0;
  app_record RECORD;
  days_until_deadline integer;
  rule_record RECORD;
  existing_reminder boolean;
BEGIN
  -- Loop through applications with deadlines in the next 30 days
  FOR app_record IN 
    SELECT 
      a.id,
      a.user_id,
      a.deadline,
      a.status,
      p.name as program_name
    FROM public.applications a
    JOIN public.programs p ON a.program_id = p.id
    WHERE a.deadline >= CURRENT_DATE 
      AND a.deadline <= CURRENT_DATE + INTERVAL '30 days'
      AND a.status IN ('planning', 'draft', 'submitted')
  LOOP
    days_until_deadline := app_record.deadline - CURRENT_DATE;
    
    -- Get user's reminder rules
    FOR rule_record IN 
      SELECT days_before_deadline, notification_types
      FROM public.reminder_rules
      WHERE user_id = app_record.user_id 
        AND is_active = true
    LOOP
      -- Check if this day matches any of the rule's days
      IF days_until_deadline = ANY(rule_record.days_before_deadline) THEN
        -- Check if reminder already exists
        SELECT EXISTS(
          SELECT 1 FROM public.deadline_reminders
          WHERE user_id = app_record.user_id
            AND application_id = app_record.id
            AND days_until_deadline = days_until_deadline
        ) INTO existing_reminder;
        
        IF NOT existing_reminder THEN
          -- Create reminder
          INSERT INTO public.deadline_reminders (
            user_id, application_id, program_name, deadline, days_until_deadline
          ) VALUES (
            app_record.user_id, app_record.id, app_record.program_name, 
            app_record.deadline, days_until_deadline
          );
          
          -- Create reminder job for email notifications
          IF 'email' = ANY(rule_record.notification_types) THEN
            INSERT INTO public.reminder_jobs (
              type, user_id, application_id, scheduled_for, status, data
            ) VALUES (
              'deadline', app_record.user_id, app_record.id, NOW(), 'pending',
              jsonb_build_object(
                'program_name', app_record.program_name,
                'deadline', app_record.deadline,
                'days_until_deadline', days_until_deadline,
                'reminder_type', 'email'
              )
            );
          END IF;
          
          reminders_created := reminders_created + 1;
        END IF;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN reminders_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

