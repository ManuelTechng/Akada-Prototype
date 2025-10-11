import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  getUserReminderRules, 
  createReminderJob, 
  cancelReminderJob,
  getUserUpcomingReminders,
  type ReminderRule,
  type ReminderJob
} from '../lib/reminderSystem'

export interface UseRemindersReturn {
  rules: ReminderRule[]
  upcomingReminders: ReminderJob[]
  loading: boolean
  error: string | null
  refreshRules: () => Promise<void>
  refreshUpcomingReminders: () => Promise<void>
  createCustomReminder: (
    name: string,
    description: string,
    scheduledFor: string,
    data: Record<string, any>
  ) => Promise<boolean>
  cancelReminder: (jobId: string) => Promise<boolean>
}

export function useReminders(): UseRemindersReturn {
  const { user } = useAuth()
  const [rules, setRules] = useState<ReminderRule[]>([])
  const [upcomingReminders, setUpcomingReminders] = useState<ReminderJob[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshRules = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)
      const userRules = await getUserReminderRules(user.id)
      setRules(userRules)
    } catch (err) {
      console.error('Error fetching reminder rules:', err)
      setError('Failed to load reminder rules')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const refreshUpcomingReminders = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)
      const reminders = await getUserUpcomingReminders(user.id)
      setUpcomingReminders(reminders)
    } catch (err) {
      console.error('Error fetching upcoming reminders:', err)
      setError('Failed to load upcoming reminders')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const createCustomReminder = useCallback(async (
    name: string,
    description: string,
    scheduledFor: string,
    data: Record<string, any>
  ): Promise<boolean> => {
    if (!user?.id) return false

    try {
      setError(null)
      const success = await createReminderJob(
        'custom',
        user.id,
        scheduledFor,
        { name, description, ...data }
      )
      
      if (success) {
        await refreshUpcomingReminders()
      }
      
      return success
    } catch (err) {
      console.error('Error creating custom reminder:', err)
      setError('Failed to create reminder')
      return false
    }
  }, [user?.id, refreshUpcomingReminders])

  const cancelReminder = useCallback(async (jobId: string): Promise<boolean> => {
    try {
      setError(null)
      const success = await cancelReminderJob(jobId)
      
      if (success) {
        await refreshUpcomingReminders()
      }
      
      return success
    } catch (err) {
      console.error('Error cancelling reminder:', err)
      setError('Failed to cancel reminder')
      return false
    }
  }, [refreshUpcomingReminders])

  // Load data on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      refreshRules()
      refreshUpcomingReminders()
    } else {
      setRules([])
      setUpcomingReminders([])
    }
  }, [user?.id, refreshRules, refreshUpcomingReminders])

  return {
    rules,
    upcomingReminders,
    loading,
    error,
    refreshRules,
    refreshUpcomingReminders,
    createCustomReminder,
    cancelReminder
  }
}

