import React, { useState, useEffect } from 'react'
import { CheckCircle, Clock, AlertCircle, XCircle, Pause, RotateCcw, Trash2 } from 'lucide-react'
import { 
  updateApplicationStatus, 
  getApplicationStatusHistory,
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type ApplicationStatusHistory 
} from '../../lib/applicationStatus'

interface ApplicationStatusManagerProps {
  applicationId: string
  currentStatus: ApplicationStatus
  programName: string
  onStatusUpdate?: (newStatus: ApplicationStatus) => void
  className?: string
}

export function ApplicationStatusManager({
  applicationId,
  currentStatus,
  programName,
  onStatusUpdate,
  className = ''
}: ApplicationStatusManagerProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [statusHistory, setStatusHistory] = useState<ApplicationStatusHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [notes, setNotes] = useState('')

  const currentStatusConfig = APPLICATION_STATUSES[currentStatus]
  const availableTransitions = currentStatusConfig.canTransitionTo

  useEffect(() => {
    loadStatusHistory()
  }, [applicationId])

  const loadStatusHistory = async () => {
    try {
      const history = await getApplicationStatusHistory(applicationId)
      setStatusHistory(history)
    } catch (error) {
      console.error('Error loading status history:', error)
    }
  }

  const handleStatusUpdate = async (newStatus: ApplicationStatus) => {
    if (newStatus === currentStatus) return

    setIsUpdating(true)
    try {
      const success = await updateApplicationStatus(
        applicationId,
        newStatus,
        'user',
        notes.trim() || undefined
      )

      if (success) {
        onStatusUpdate?.(newStatus)
        setNotes('')
        await loadStatusHistory()
      } else {
        alert('Failed to update application status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating application status')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusIcon = (status: ApplicationStatus) => {
    const config = APPLICATION_STATUSES[status]
    switch (status) {
      case 'accepted': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />
      case 'under_review': return <Clock className="w-5 h-5 text-purple-600" />
      case 'waitlisted': return <Pause className="w-5 h-5 text-orange-600" />
      case 'deferred': return <RotateCcw className="w-5 h-5 text-indigo-600" />
      case 'withdrawn': return <Trash2 className="w-5 h-5 text-gray-600" />
      default: return <span className="text-lg">{config.icon}</span>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Status */}
      <div className="flex items-center space-x-3">
        {getStatusIcon(currentStatus)}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {currentStatusConfig.label}
          </h3>
          <p className="text-sm text-gray-600">
            {currentStatusConfig.description}
          </p>
        </div>
      </div>

      {/* Status Update Options */}
      {availableTransitions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Update Status</h4>
          
          {/* Notes Input */}
          <div>
            <label htmlFor="status-notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              id="status-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this status change..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          {/* Status Buttons */}
          <div className="flex flex-wrap gap-2">
            {availableTransitions.map((status) => {
              const config = APPLICATION_STATUSES[status]
              return (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={isUpdating}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    config.color.replace('text-', 'text-') + ' ' +
                    config.bgColor.replace('bg-', 'bg-') + ' ' +
                    'border border-current hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  <span className="mr-2">{config.icon}</span>
                  {config.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Status History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Status History</h4>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showHistory ? 'Hide' : 'Show'} History
          </button>
        </div>

        {showHistory && (
          <div className="space-y-2">
            {statusHistory.length === 0 ? (
              <p className="text-sm text-gray-500">No status history available</p>
            ) : (
              <div className="space-y-2">
                {statusHistory.map((entry, index) => {
                  const config = APPLICATION_STATUSES[entry.status as ApplicationStatus]
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {getStatusIcon(entry.status as ApplicationStatus)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {config.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(entry.created_at || '')}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600">
                          Updated by {entry.updated_by}
                          {entry.notes && ` • ${entry.notes}`}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Status Information</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Current Status:</strong> {currentStatusConfig.label}</p>
          <p><strong>Description:</strong> {currentStatusConfig.description}</p>
          {availableTransitions.length > 0 && (
            <p><strong>Next Steps:</strong> You can update this application to: {availableTransitions.map(s => APPLICATION_STATUSES[s].label).join(', ')}</p>
          )}
          {availableTransitions.length === 0 && (
            <p><strong>Next Steps:</strong> This application is in its final state and cannot be updated further.</p>
          )}
        </div>
      </div>
    </div>
  )
}

