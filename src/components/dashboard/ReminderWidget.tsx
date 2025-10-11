import React from 'react'
import { Bell, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { useReminders } from '../../hooks/useReminders'
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns'

interface ReminderWidgetProps {
  className?: string
}

export function ReminderWidget({ className }: ReminderWidgetProps) {
  const { upcomingReminders, loading, error } = useReminders()

  const getUrgencyColor = (scheduledFor: string) => {
    const date = new Date(scheduledFor)
    const now = new Date()
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffInHours <= 24) return 'text-red-600'
    if (diffInHours <= 72) return 'text-orange-600'
    return 'text-blue-600'
  }

  const getUrgencyIcon = (scheduledFor: string) => {
    const date = new Date(scheduledFor)
    const now = new Date()
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffInHours <= 24) return <AlertTriangle className="h-4 w-4" />
    if (diffInHours <= 72) return <Clock className="h-4 w-4" />
    return <Bell className="h-4 w-4" />
  }

  const formatReminderTime = (scheduledFor: string) => {
    const date = new Date(scheduledFor)
    
    if (isToday(date)) {
      return `Today at ${format(date, 'HH:mm')}`
    }
    
    if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'HH:mm')}`
    }
    
    if (isThisWeek(date)) {
      return format(date, 'EEEE \'at\' HH:mm')
    }
    
    return format(date, 'MMM dd, yyyy \'at\' HH:mm')
  }

  const getReminderTypeColor = (type: string) => {
    switch (type) {
      case 'deadline':
        return 'bg-red-100 text-red-800'
      case 'status_update':
        return 'bg-blue-100 text-blue-800'
      case 'custom':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Upcoming Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Upcoming Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Failed to load reminders</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const upcomingCount = upcomingReminders.length
  const urgentCount = upcomingReminders.filter(reminder => {
    const date = new Date(reminder.scheduled_for)
    const now = new Date()
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diffInHours <= 24
  }).length

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Upcoming Reminders
            </CardTitle>
            <CardDescription>
              {upcomingCount} reminder{upcomingCount !== 1 ? 's' : ''} scheduled
              {urgentCount > 0 && (
                <span className="text-red-600 ml-2">
                  ({urgentCount} urgent)
                </span>
              )}
            </CardDescription>
          </div>
          {upcomingCount > 0 && (
            <Button variant="outline" size="sm">
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {upcomingCount === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming reminders</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingReminders.slice(0, 3).map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`${getUrgencyColor(reminder.scheduled_for)}`}>
                    {getUrgencyIcon(reminder.scheduled_for)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {reminder.data.name || 'Reminder'}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getReminderTypeColor(reminder.type)}`}
                      >
                        {reminder.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatReminderTime(reminder.scheduled_for)}
                    </p>
                    {reminder.data.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {reminder.data.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {upcomingCount > 3 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" className="text-xs">
                  +{upcomingCount - 3} more reminder{upcomingCount - 3 !== 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
