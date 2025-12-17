import { checkDeadlineReminders, processReminderJobs } from './reminderSystem'

/**
 * Background service for processing reminders
 * This would typically run as a cron job or background worker
 */
export class ReminderService {
  private isRunning = false
  private intervalId: NodeJS.Timeout | null = null
  private readonly CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes

  /**
   * Start the reminder service
   */
  start(): void {
    if (this.isRunning) {
      console.log('Reminder service is already running')
      return
    }

    console.log('Starting reminder service...')
    this.isRunning = true

    // Run immediately
    this.processReminders()

    // Then run every 5 minutes
    this.intervalId = setInterval(() => {
      this.processReminders()
    }, this.CHECK_INTERVAL)
  }

  /**
   * Stop the reminder service
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('Reminder service is not running')
      return
    }

    console.log('Stopping reminder service...')
    this.isRunning = false

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  /**
   * Process all reminders
   */
  private async processReminders(): Promise<void> {
    try {
      console.log('Processing reminders...')
      
      // Check for deadline reminders
      const remindersCreated = await checkDeadlineReminders()
      if (remindersCreated > 0) {
        console.log(`Created ${remindersCreated} deadline reminders`)
      }

      // Process pending reminder jobs
      const jobsProcessed = await processReminderJobs()
      if (jobsProcessed > 0) {
        console.log(`Processed ${jobsProcessed} reminder jobs`)
      }

    } catch (error) {
      console.error('Error processing reminders:', error)
    }
  }

  /**
   * Get service status
   */
  getStatus(): { isRunning: boolean; intervalId: NodeJS.Timeout | null } {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId
    }
  }
}

// Create singleton instance
export const reminderService = new ReminderService()

// Auto-start in development
if (import.meta.env.DEV) {
  // Only start if we're in a browser environment
  if (typeof window !== 'undefined') {
    reminderService.start()
  }
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    reminderService.stop()
  })
}

