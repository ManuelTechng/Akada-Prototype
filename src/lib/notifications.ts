import { supabase } from './supabase'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error' | 'reminder' | string
  category: 'application' | 'deadline' | 'program' | 'system' | 'general' | string
  is_read: boolean | null
  is_archived: boolean | null
  action_url?: string | null
  action_label?: string | null
  metadata?: Record<string, any> | null
  created_at: string | null
  read_at?: string | null
  expires_at?: string | null
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  deadline_reminders: boolean
  application_updates: boolean
  program_recommendations: boolean
  system_announcements: boolean
}

/**
 * Create a new notification
 */
export async function createNotification(
  userId: string,
  notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'is_read' | 'is_archived'>
): Promise<Notification | null> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        ...notification,
        is_read: false,
        is_archived: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return null
    }

    return data as any as Notification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(
  userId: string,
  options: {
    includeArchived?: boolean
    includeRead?: boolean
    limit?: number
    offset?: number
  } = {}
): Promise<Notification[]> {
  try {
    const { includeArchived = false, includeRead = true, limit = 50, offset = 0 } = options

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (!includeArchived) {
      query = query.eq('is_archived', false)
    }

    if (!includeRead) {
      query = query.eq('is_read', false)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return []
    }

    return (data || []) as any as Notification[]
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return false
  }
}

/**
 * Archive a notification
 */
export async function archiveNotification(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_archived: true })
      .eq('id', notificationId)

    if (error) {
      console.error('Error archiving notification:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error archiving notification:', error)
    return false
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) {
      console.error('Error deleting notification:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting notification:', error)
    return false
  }
}

/**
 * Get notification count for a user
 */
export async function getNotificationCount(userId: string): Promise<{
  total: number
  unread: number
  archived: number
}> {
  try {
    const [totalResult, unreadResult, archivedResult] = await Promise.all([
      supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', userId),
      supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_read', false)
        .eq('is_archived', false),
      supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_archived', true)
    ])

    return {
      total: totalResult.count || 0,
      unread: unreadResult.count || 0,
      archived: archivedResult.count || 0
    }
  } catch (error) {
    console.error('Error getting notification count:', error)
    return { total: 0, unread: 0, archived: 0 }
  }
}

/**
 * Clean up expired notifications
 */
export async function cleanupExpiredNotifications(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .not('expires_at', 'is', null)
      .lt('expires_at', new Date().toISOString())
      .select('id')

    if (error) {
      console.error('Error cleaning up expired notifications:', error)
      return 0
    }

    return data?.length || 0
  } catch (error) {
    console.error('Error cleaning up expired notifications:', error)
    return 0
  }
}

/**
 * Create notification for application deadline
 */
export async function createDeadlineNotification(
  userId: string,
  applicationId: string,
  programName: string,
  deadline: string,
  daysUntilDeadline: number
): Promise<Notification | null> {
  const urgency = daysUntilDeadline <= 3 ? 'urgent' : daysUntilDeadline <= 7 ? 'warning' : 'info'
  const type = daysUntilDeadline <= 1 ? 'error' : daysUntilDeadline <= 3 ? 'warning' : 'reminder'
  
  const title = daysUntilDeadline <= 1 
    ? `🚨 Application deadline TODAY: ${programName}`
    : daysUntilDeadline <= 3
    ? `⚠️ Application deadline in ${daysUntilDeadline} days: ${programName}`
    : `📅 Application deadline in ${daysUntilDeadline} days: ${programName}`

  const message = daysUntilDeadline <= 1
    ? `Your application for ${programName} is due TODAY! Don't miss this opportunity.`
    : `Your application for ${programName} is due in ${daysUntilDeadline} days. Make sure you have all required documents ready.`

  return createNotification(userId, {
    title,
    message,
    type,
    category: 'deadline',
    action_url: `/applications/${applicationId}`,
    action_label: 'View Application',
    metadata: {
      application_id: applicationId,
      program_name: programName,
      deadline,
      days_until_deadline: daysUntilDeadline,
      urgency
    },
    expires_at: new Date(deadline).toISOString()
  })
}

/**
 * Create notification for application status update
 */
export async function createApplicationStatusNotification(
  userId: string,
  applicationId: string,
  programName: string,
  oldStatus: string,
  newStatus: string
): Promise<Notification | null> {
  const statusMessages = {
    'submitted': 'Your application has been submitted successfully!',
    'under_review': 'Your application is now under review.',
    'accepted': '🎉 Congratulations! You have been accepted!',
    'rejected': 'Unfortunately, your application was not successful this time.',
    'waitlisted': 'You have been placed on the waitlist.',
    'deferred': 'Your application has been deferred to the next intake.'
  }

  const type = newStatus === 'accepted' ? 'success' : 
               newStatus === 'rejected' ? 'error' : 'info'

  return createNotification(userId, {
    title: `Application Update: ${programName}`,
    message: statusMessages[newStatus as keyof typeof statusMessages] || `Your application status has changed to ${newStatus}.`,
    type,
    category: 'application',
    action_url: `/applications/${applicationId}`,
    action_label: 'View Application',
    metadata: {
      application_id: applicationId,
      program_name: programName,
      old_status: oldStatus,
      new_status: newStatus
    }
  })
}

/**
 * Create notification for program recommendation
 */
export async function createProgramRecommendationNotification(
  userId: string,
  programId: string,
  programName: string,
  universityName: string,
  matchPercentage: number
): Promise<Notification | null> {
  const title = `🎯 New Program Match: ${programName}`
  const message = `We found a ${matchPercentage}% match for you at ${universityName}. This program aligns well with your preferences!`

  return createNotification(userId, {
    title,
    message,
    type: 'info',
    category: 'program',
    action_url: `/programs/${programId}`,
    action_label: 'View Program',
    metadata: {
      program_id: programId,
      program_name: programName,
      university_name: universityName,
      match_percentage: matchPercentage
    }
  })
}

/**
 * Create system notification
 */
export async function createSystemNotification(
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'warning' | 'success' | 'error' = 'info',
  actionUrl?: string,
  actionLabel?: string,
  metadata?: Record<string, any>
): Promise<Notification | null> {
  return createNotification(userId, {
    title,
    message,
    type,
    category: 'system',
    action_url: actionUrl,
    action_label: actionLabel,
    metadata
  })
}

/**
 * Get user notification preferences
 */
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('dashboard_preferences')
      .select('notification_preferences')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching notification preferences:', error)
      return null
    }

    return (data?.notification_preferences as any as NotificationPreferences) || {
      email: true,
      push: true,
      deadline_reminders: true,
      application_updates: true,
      program_recommendations: true,
      system_announcements: true
    }
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return null
  }
}

/**
 * Update user notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('dashboard_preferences')
      .upsert({
        user_id: userId,
        notification_preferences: preferences
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('Error updating notification preferences:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return false
  }
}

