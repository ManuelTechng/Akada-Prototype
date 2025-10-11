import React, { useState } from 'react'
import { Bell, Plus, Calendar, Clock, Mail, Smartphone, Monitor, X, Edit, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { useReminders } from '../../hooks/useReminders'
import { format } from 'date-fns'

interface ReminderManagerProps {
  className?: string
}

export function ReminderManager({ className }: ReminderManagerProps) {
  const {
    rules,
    upcomingReminders,
    loading,
    error,
    refreshRules,
    refreshUpcomingReminders,
    createCustomReminder,
    cancelReminder
  } = useReminders()

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [customReminder, setCustomReminder] = useState({
    name: '',
    description: '',
    scheduledFor: '',
    data: {}
  })

  const handleCreateReminder = async () => {
    if (!customReminder.name || !customReminder.scheduledFor) return

    const success = await createCustomReminder(
      customReminder.name,
      customReminder.description,
      customReminder.scheduledFor,
      customReminder.data
    )

    if (success) {
      setCustomReminder({ name: '', description: '', scheduledFor: '', data: {} })
      setShowCreateDialog(false)
    }
  }

  const handleCancelReminder = async (jobId: string) => {
    await cancelReminder(jobId)
  }

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'push':
        return <Smartphone className="h-4 w-4" />
      case 'in_app':
        return <Monitor className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
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
            Reminder Management
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

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Reminder Management
            </CardTitle>
            <CardDescription>
              Manage your deadline reminders and notifications
            </CardDescription>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Reminder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Custom Reminder</DialogTitle>
                <DialogDescription>
                  Set up a custom reminder for important tasks or deadlines.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Reminder Name</Label>
                  <Input
                    id="name"
                    value={customReminder.name}
                    onChange={(e) => setCustomReminder(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Review application essay"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={customReminder.description}
                    onChange={(e) => setCustomReminder(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional details about this reminder"
                  />
                </div>
                <div>
                  <Label htmlFor="scheduledFor">Remind Me At</Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={customReminder.scheduledFor}
                    onChange={(e) => setCustomReminder(prev => ({ ...prev, scheduledFor: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateReminder}>
                    Create Reminder
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Reminder Rules */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Reminder Rules</h3>
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{rule.name}</h4>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {rule.days_before_deadline.join(', ')} days before
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {rule.notification_types.map((type) => (
                          <div key={type} className="flex items-center gap-1">
                            {getNotificationTypeIcon(type)}
                            <span className="text-sm capitalize">{type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={rule.is_active} />
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Upcoming Reminders</h3>
          {upcomingReminders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming reminders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingReminders.map((reminder) => (
                <div key={reminder.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {format(new Date(reminder.scheduled_for), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <Badge className={getReminderTypeColor(reminder.type)}>
                        {reminder.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelReminder(reminder.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {reminder.data.name && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {reminder.data.name}
                    </p>
                  )}
                  {reminder.data.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {reminder.data.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

