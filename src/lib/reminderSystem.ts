import { supabase } from './supabase'
import { 
  createDeadlineNotification, 
  createApplicationStatusNotification,
  type NotificationPreferences 
} from './notifications'

export interface ReminderRule {
  id: string
  user_id: string
  name: string
  description: string
  days_before_deadline: number[]
  notification_types: ('email' | 'push' | 'in_app')[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DeadlineReminder {
  id: string
  user_id: string
  application_id: string
  program_name: string
  deadline: string
  days_until_deadline: number
  reminder_sent: boolean
  reminder_sent_at?: string
  created_at: string
}

export interface ReminderJob {
  id: string
  type: 'deadline' | 'status_update' | 'custom'
  user_id: string
  application_id?: string
  program_id?: string
  scheduled_for: string
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  data: Record<string, any>
  created_at: string
  processed_at?: string
}

/**
 * Create default reminder rules for a user
 */
export async function createDefaultReminderRules(userId: string): Promise<boolean> {
  try {
    const defaultRules: Omit<ReminderRule, 'id' | 'created_at' | 'updated_at'>[] = [
      {
        user_id: userId,
        name: 'Final Deadline Reminder',
        description: 'Reminder sent 1 day before application deadline',
        days_before_deadline: [1],
        notification_types: ['email', 'push', 'in_app'],
        is_active: true
      },
      {
        user_id: userId,
        name: 'Urgent Deadline Reminder',
        description: 'Reminder sent 3 days before application deadline',
        days_before_deadline: [3],
        notification_types: ['email', 'push', 'in_app'],
        is_active: true
      },
      {
        user_id: userId,
        name: 'Weekly Deadline Reminder',
        description: 'Reminder sent 7 days before application deadline',
        days_before_deadline: [7],
        notification_types: ['email', 'in_app'],
        is_active: true
      },
      {
        user_id: userId,
        name: 'Monthly Deadline Reminder',
        description: 'Reminder sent 30 days before application deadline',
        days_before_deadline: [30],
        notification_types: ['email'],
        is_active: true
      }
    ]

    const { error } = await supabase
      .from('reminder_rules')
      .insert(defaultRules)

    if (error) {
      console.error('Error creating default reminder rules:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error creating default reminder rules:', error)
    return false
  }
}

/**
 * Get user's reminder rules
 */
export async function getUserReminderRules(userId: string): Promise<ReminderRule[]> {
  try {
    const { data, error } = await supabase
      .from('reminder_rules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('days_before_deadline', { ascending: true })

    if (error) {
      console.error('Error fetching reminder rules:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching reminder rules:', error)
    return []
  }
}

/**
 * Check for applications approaching deadlines and create reminders
 */
export async function checkDeadlineReminders(): Promise<number> {
  try {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Get all applications with deadlines in the next 30 days
    const { data: applications, error: fetchError } = await supabase
      .from('applications')
      .select(`
        id,
        user_id,
        deadline,
        status,
        programs!inner(
          name,
          university
        )
      `)
      .gte('deadline', now.toISOString().split('T')[0])
      .lte('deadline', thirtyDaysFromNow.toISOString().split('T')[0])
      .in('status', ['planning', 'draft', 'submitted'])

    if (fetchError || !applications) {
      console.error('Error fetching applications for reminders:', fetchError)
      return 0
    }

    let remindersCreated = 0

    for (const application of applications) {
      const deadline = new Date(application.deadline)
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      // Get user's reminder rules
      const rules = await getUserReminderRules(application.user_id)
      
      for (const rule of rules) {
        if (rule.days_before_deadline.includes(daysUntilDeadline)) {
          // Check if reminder already exists
          const { data: existingReminder } = await supabase
            .from('deadline_reminders')
            .select('id')
            .eq('user_id', application.user_id)
            .eq('application_id', application.id)
            .eq('days_until_deadline', daysUntilDeadline)
            .single()

          if (!existingReminder) {
            // Create reminder
            await createDeadlineReminder(
              application.user_id,
              application.id,
              application.programs.name,
              application.deadline,
              daysUntilDeadline
            )
            remindersCreated++
          }
        }
      }
    }

    return remindersCreated
  } catch (error) {
    console.error('Error checking deadline reminders:', error)
    return 0
  }
}

/**
 * Create a deadline reminder
 */
async function createDeadlineReminder(
  userId: string,
  applicationId: string,
  programName: string,
  deadline: string,
  daysUntilDeadline: number
): Promise<boolean> {
  try {
    // Create reminder record
    const { error: reminderError } = await supabase
      .from('deadline_reminders')
      .insert({
        user_id: userId,
        application_id: applicationId,
        program_name: programName,
        deadline,
        days_until_deadline: daysUntilDeadline
      })

    if (reminderError) {
      console.error('Error creating deadline reminder:', reminderError)
      return false
    }

    // Create notification
    await createDeadlineNotification(
      userId,
      applicationId,
      programName,
      deadline,
      daysUntilDeadline
    )

    // Schedule email reminder if enabled
    await scheduleEmailReminder(
      userId,
      applicationId,
      programName,
      deadline,
      daysUntilDeadline
    )

    return true
  } catch (error) {
    console.error('Error creating deadline reminder:', error)
    return false
  }
}

/**
 * Schedule email reminder
 */
async function scheduleEmailReminder(
  userId: string,
  applicationId: string,
  programName: string,
  deadline: string,
  daysUntilDeadline: number
): Promise<void> {
  try {
    // Check user's notification preferences
    const { data: preferences } = await supabase
      .from('dashboard_preferences')
      .select('notification_preferences')
      .eq('user_id', userId)
      .single()

    const notificationPrefs = preferences?.notification_preferences as NotificationPreferences
    if (!notificationPrefs?.email || !notificationPrefs?.deadline_reminders) {
      return
    }

    // Schedule email job
    await supabase
      .from('reminder_jobs')
      .insert({
        type: 'deadline',
        user_id: userId,
        application_id: applicationId,
        scheduled_for: new Date().toISOString(),
        status: 'pending',
        data: {
          program_name: programName,
          deadline,
          days_until_deadline: daysUntilDeadline,
          reminder_type: 'email'
        }
      })
  } catch (error) {
    console.error('Error scheduling email reminder:', error)
  }
}

/**
 * Process pending reminder jobs
 */
export async function processReminderJobs(): Promise<number> {
  try {
    const now = new Date()
    
    // Get pending jobs that are due
    const { data: jobs, error: fetchError } = await supabase
      .from('reminder_jobs')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now.toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(50) // Process up to 50 jobs at a time

    if (fetchError || !jobs) {
      console.error('Error fetching reminder jobs:', fetchError)
      return 0
    }

    let processedCount = 0

    for (const job of jobs) {
      try {
        await processReminderJob(job)
        processedCount++
      } catch (error) {
        console.error(`Error processing reminder job ${job.id}:`, error)
        
        // Mark job as failed
        await supabase
          .from('reminder_jobs')
          .update({ 
            status: 'failed',
            processed_at: now.toISOString()
          })
          .eq('id', job.id)
      }
    }

    return processedCount
  } catch (error) {
    console.error('Error processing reminder jobs:', error)
    return 0
  }
}

/**
 * Process a single reminder job
 */
async function processReminderJob(job: ReminderJob): Promise<void> {
  const now = new Date()

  try {
    switch (job.type) {
      case 'deadline':
        await processDeadlineReminder(job)
        break
      case 'status_update':
        await processStatusUpdateReminder(job)
        break
      case 'custom':
        await processCustomReminder(job)
        break
    }

    // Mark job as sent
    await supabase
      .from('reminder_jobs')
      .update({ 
        status: 'sent',
        processed_at: now.toISOString()
      })
      .eq('id', job.id)

  } catch (error) {
    console.error(`Error processing reminder job ${job.id}:`, error)
    throw error
  }
}

/**
 * Process deadline reminder
 */
async function processDeadlineReminder(job: ReminderJob): Promise<void> {
  const { program_name, deadline, days_until_deadline, reminder_type } = job.data

  // Get user details
  const { data: user } = await supabase
    .from('user_profiles')
    .select('email, full_name')
    .eq('id', job.user_id)
    .single()

  if (!user) {
    throw new Error('User not found')
  }

  if (reminder_type === 'email') {
    await sendDeadlineEmail({
      to: user.email,
      name: user.full_name,
      programName: program_name,
      deadline,
      daysUntilDeadline: days_until_deadline
    })
  }
}

/**
 * Process status update reminder
 */
async function processStatusUpdateReminder(job: ReminderJob): Promise<void> {
  // Implementation for status update reminders
  console.log('Processing status update reminder:', job.id)
}

/**
 * Process custom reminder
 */
async function processCustomReminder(job: ReminderJob): Promise<void> {
  // Implementation for custom reminders
  console.log('Processing custom reminder:', job.id)
}

/**
 * Send deadline email
 */
async function sendDeadlineEmail({
  to,
  name,
  programName,
  deadline,
  daysUntilDeadline
}: {
  to: string
  name: string
  programName: string
  deadline: string
  daysUntilDeadline: number
}): Promise<void> {
  // This would integrate with an email service like SendGrid, AWS SES, etc.
  // For now, we'll just log the email details
  console.log('Sending deadline email:', {
    to,
    name,
    programName,
    deadline,
    daysUntilDeadline
  })

  // In a real implementation, you would:
  // 1. Generate email template
  // 2. Send via email service
  // 3. Log email delivery status
  // 4. Handle bounces and failures
}

/**
 * Create reminder job
 */
export async function createReminderJob(
  type: 'deadline' | 'status_update' | 'custom',
  userId: string,
  scheduledFor: string,
  data: Record<string, any>,
  applicationId?: string,
  programId?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reminder_jobs')
      .insert({
        type,
        user_id: userId,
        application_id: applicationId,
        program_id: programId,
        scheduled_for: scheduledFor,
        status: 'pending',
        data
      })

    if (error) {
      console.error('Error creating reminder job:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error creating reminder job:', error)
    return false
  }
}

/**
 * Cancel reminder job
 */
export async function cancelReminderJob(jobId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reminder_jobs')
      .update({ 
        status: 'cancelled',
        processed_at: new Date().toISOString()
      })
      .eq('id', jobId)

    if (error) {
      console.error('Error cancelling reminder job:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error cancelling reminder job:', error)
    return false
  }
}

/**
 * Get user's upcoming reminders
 */
export async function getUserUpcomingReminders(userId: string): Promise<ReminderJob[]> {
  try {
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('reminder_jobs')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gte('scheduled_for', now.toISOString())
      .lte('scheduled_for', sevenDaysFromNow.toISOString())
      .order('scheduled_for', { ascending: true })

    if (error) {
      console.error('Error fetching upcoming reminders:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching upcoming reminders:', error)
    return []
  }
}

