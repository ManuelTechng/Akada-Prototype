-- Create user_tasks table for action items and task management
CREATE TABLE IF NOT EXISTS user_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('application', 'document', 'profile', 'deadline', 'general')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date TIMESTAMPTZ,
  related_application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_status ON user_tasks(status);
CREATE INDEX IF NOT EXISTS idx_user_tasks_priority ON user_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_user_tasks_due_date ON user_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_user_tasks_related_application ON user_tasks(related_application_id);

-- Enable Row Level Security
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_tasks
CREATE POLICY "Users can view their own tasks"
  ON user_tasks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
  ON user_tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON user_tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON user_tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_user_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function on update
CREATE TRIGGER update_user_tasks_updated_at_trigger
  BEFORE UPDATE ON user_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_user_tasks_updated_at();

-- Helper function to get task summary for a user
CREATE OR REPLACE FUNCTION get_user_task_summary(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
    'completed', COUNT(*) FILTER (WHERE status = 'completed'),
    'overdue', COUNT(*) FILTER (
      WHERE status != 'completed'
      AND due_date IS NOT NULL
      AND due_date < now()
    ),
    'high_priority', COUNT(*) FILTER (
      WHERE (priority = 'high' OR priority = 'urgent')
      AND status != 'completed'
    )
  ) INTO result
  FROM user_tasks
  WHERE user_id = p_user_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_task_summary(UUID) TO authenticated;

-- Helper function to get overdue tasks
CREATE OR REPLACE FUNCTION get_overdue_tasks(p_user_id UUID)
RETURNS SETOF user_tasks AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM user_tasks
  WHERE user_id = p_user_id
    AND status != 'completed'
    AND due_date IS NOT NULL
    AND due_date < now()
  ORDER BY due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_overdue_tasks(UUID) TO authenticated;

-- Helper function to get upcoming tasks (within N days)
CREATE OR REPLACE FUNCTION get_upcoming_tasks(p_user_id UUID, p_days INTEGER DEFAULT 7)
RETURNS SETOF user_tasks AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM user_tasks
  WHERE user_id = p_user_id
    AND status != 'completed'
    AND due_date IS NOT NULL
    AND due_date BETWEEN now() AND (now() + (p_days || ' days')::INTERVAL)
  ORDER BY due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_upcoming_tasks(UUID, INTEGER) TO authenticated;

-- Comment on table and columns for documentation
COMMENT ON TABLE user_tasks IS 'User action items and tasks for application management';
COMMENT ON COLUMN user_tasks.type IS 'Task category: application, document, profile, deadline, or general';
COMMENT ON COLUMN user_tasks.priority IS 'Task urgency level: low, medium, high, or urgent';
COMMENT ON COLUMN user_tasks.status IS 'Current state: pending, in_progress, or completed';
COMMENT ON COLUMN user_tasks.related_application_id IS 'Optional link to specific application';
