import { supabase } from './supabase'
import { createApplicationStatusNotification } from './notifications'

export interface ApplicationStatusUpdate {
  id: string
  application_id: string
  old_status: string
  new_status: string
  updated_by: 'user' | 'system' | 'university'
  notes?: string
  created_at: string
}

export interface ApplicationStatusHistory {
  id: string
  application_id: string
  status: string
  updated_by: 'user' | 'system' | 'university'
  notes?: string
  created_at: string
}

export type ApplicationStatus = 
  | 'planning'
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'waitlisted'
  | 'deferred'
  | 'withdrawn'
  | 'cancelled'

export const APPLICATION_STATUSES: Record<ApplicationStatus, {
  label: string
  description: string
  color: string
  bgColor: string
  icon: string
  canTransitionTo: ApplicationStatus[]
}> = {
  planning: {
    label: 'Planning',
    description: 'Application is being planned and prepared',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: '📋',
    canTransitionTo: ['draft', 'cancelled']
  },
  draft: {
    label: 'Draft',
    description: 'Application is being drafted',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: '📝',
    canTransitionTo: ['submitted', 'planning', 'cancelled']
  },
  submitted: {
    label: 'Submitted',
    description: 'Application has been submitted to the university',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: '📤',
    canTransitionTo: ['under_review', 'withdrawn']
  },
  under_review: {
    label: 'Under Review',
    description: 'Application is being reviewed by the university',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: '🔍',
    canTransitionTo: ['accepted', 'rejected', 'waitlisted', 'deferred', 'withdrawn']
  },
  accepted: {
    label: 'Accepted',
    description: 'Application has been accepted by the university',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: '🎉',
    canTransitionTo: ['withdrawn']
  },
  rejected: {
    label: 'Rejected',
    description: 'Application has been rejected by the university',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: '❌',
    canTransitionTo: []
  },
  waitlisted: {
    label: 'Waitlisted',
    description: 'Application is on the waitlist',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: '⏳',
    canTransitionTo: ['accepted', 'rejected', 'withdrawn']
  },
  deferred: {
    label: 'Deferred',
    description: 'Application has been deferred to the next intake',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    icon: '⏭️',
    canTransitionTo: ['accepted', 'rejected', 'withdrawn']
  },
  withdrawn: {
    label: 'Withdrawn',
    description: 'Application has been withdrawn by the student',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: '↩️',
    canTransitionTo: []
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Application has been cancelled',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: '🚫',
    canTransitionTo: []
  }
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
  updatedBy: 'user' | 'system' | 'university' = 'user',
  notes?: string
): Promise<boolean> {
  try {
    // Get current application details
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select(`
        id,
        user_id,
        program_id,
        status,
        programs!inner(name, university)
      `)
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      console.error('Error fetching application:', fetchError)
      return false
    }

    const oldStatus = application.status as ApplicationStatus

    // Validate status transition
    if (!isValidStatusTransition(oldStatus, newStatus)) {
      console.error(`Invalid status transition from ${oldStatus} to ${newStatus}`)
      return false
    }

    // Update application status
    const { error: updateError } = await supabase
      .from('applications')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)

    if (updateError) {
      console.error('Error updating application status:', updateError)
      return false
    }

    // Record status history
    await recordStatusHistory(applicationId, newStatus, updatedBy, notes)

    // Create notification for status change
    if (oldStatus !== newStatus) {
      await createApplicationStatusNotification(
        application.user_id,
        applicationId,
        application.programs.name,
        oldStatus,
        newStatus
      )
    }

    return true
  } catch (error) {
    console.error('Error updating application status:', error)
    return false
  }
}

/**
 * Record status history
 */
async function recordStatusHistory(
  applicationId: string,
  status: ApplicationStatus,
  updatedBy: 'user' | 'system' | 'university',
  notes?: string
): Promise<void> {
  try {
    await supabase
      .from('application_status_history')
      .insert({
        application_id: applicationId,
        status,
        updated_by: updatedBy,
        notes
      })
  } catch (error) {
    console.error('Error recording status history:', error)
  }
}

/**
 * Check if status transition is valid
 */
function isValidStatusTransition(
  fromStatus: ApplicationStatus,
  toStatus: ApplicationStatus
): boolean {
  const statusConfig = APPLICATION_STATUSES[fromStatus]
  return statusConfig.canTransitionTo.includes(toStatus)
}

/**
 * Get application status history
 */
export async function getApplicationStatusHistory(
  applicationId: string
): Promise<ApplicationStatusHistory[]> {
  try {
    const { data, error } = await supabase
      .from('application_status_history')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching status history:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching status history:', error)
    return []
  }
}

/**
 * Get applications by status
 */
export async function getApplicationsByStatus(
  userId: string,
  status: ApplicationStatus
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        programs!inner(
          id,
          name,
          university,
          country,
          degree_type,
          specialization,
          deadline
        )
      `)
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching applications by status:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching applications by status:', error)
    return []
  }
}

/**
 * Get application status statistics
 */
export async function getApplicationStatusStats(userId: string): Promise<Record<ApplicationStatus, number>> {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('status')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching application stats:', error)
      return {} as Record<ApplicationStatus, number>
    }

    const stats = data?.reduce((acc, app) => {
      const status = app.status as ApplicationStatus
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<ApplicationStatus, number>) || {}

    // Initialize all statuses with 0
    Object.keys(APPLICATION_STATUSES).forEach(status => {
      if (!stats[status as ApplicationStatus]) {
        stats[status as ApplicationStatus] = 0
      }
    })

    return stats
  } catch (error) {
    console.error('Error fetching application stats:', error)
    return {} as Record<ApplicationStatus, number>
  }
}

/**
 * Bulk update application statuses
 */
export async function bulkUpdateApplicationStatuses(
  applicationIds: string[],
  newStatus: ApplicationStatus,
  updatedBy: 'user' | 'system' | 'university' = 'user',
  notes?: string
): Promise<{ success: string[]; failed: string[] }> {
  const results = { success: [], failed: [] }

  for (const applicationId of applicationIds) {
    const success = await updateApplicationStatus(applicationId, newStatus, updatedBy, notes)
    if (success) {
      results.success.push(applicationId)
    } else {
      results.failed.push(applicationId)
    }
  }

  return results
}

/**
 * Get applications requiring attention
 */
export async function getApplicationsRequiringAttention(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        programs!inner(
          id,
          name,
          university,
          country,
          degree_type,
          specialization,
          deadline
        )
      `)
      .eq('user_id', userId)
      .in('status', ['planning', 'draft', 'submitted', 'under_review'])
      .order('deadline', { ascending: true })

    if (error) {
      console.error('Error fetching applications requiring attention:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching applications requiring attention:', error)
    return []
  }
}

/**
 * Check for applications approaching deadline
 */
export async function checkApproachingDeadlines(userId: string): Promise<any[]> {
  try {
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        programs!inner(
          id,
          name,
          university,
          country,
          degree_type,
          specialization,
          deadline
        )
      `)
      .eq('user_id', userId)
      .in('status', ['planning', 'draft'])
      .gte('deadline', now.toISOString().split('T')[0])
      .lte('deadline', sevenDaysFromNow.toISOString().split('T')[0])
      .order('deadline', { ascending: true })

    if (error) {
      console.error('Error checking approaching deadlines:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error checking approaching deadlines:', error)
    return []
  }
}

