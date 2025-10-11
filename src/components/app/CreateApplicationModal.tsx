import React, { useState, useEffect } from 'react'
import { X, Calendar, FileText, AlertCircle } from 'lucide-react'
import { useApplications, type ApplicationFormData } from '../../hooks/useApplications'
import { supabase } from '../../lib/supabase'

interface CreateApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  programId?: string
  programName?: string
  universityName?: string
  onSuccess?: () => void
}

const CreateApplicationModal: React.FC<CreateApplicationModalProps> = ({
  isOpen,
  onClose,
  programId,
  programName,
  universityName,
  onSuccess
}) => {
  const { addApplication } = useApplications()
  const [formData, setFormData] = useState<ApplicationFormData>({
    program_id: programId || '',
    status: 'planning',
    deadline: '',
    notes: ''
  })
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch programs if no specific program is provided
  useEffect(() => {
    if (isOpen && !programId) {
      fetchPrograms()
    }
  }, [isOpen, programId])

  // Set program ID when provided
  useEffect(() => {
    if (programId) {
      setFormData(prev => ({ ...prev, program_id: programId }))
    }
  }, [programId])

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('id, name, university, country')
        .order('name')

      if (error) throw error
      setPrograms(data || [])
    } catch (err) {
      console.error('Error fetching programs:', err)
      setError('Failed to load programs')
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.program_id) {
      newErrors.program_id = 'Please select a program'
    }
    
    if (!formData.deadline) {
      newErrors.deadline = 'Please set a deadline'
    } else {
      const deadlineDate = new Date(formData.deadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (deadlineDate < today) {
        newErrors.deadline = 'Deadline cannot be in the past'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setLoading(true)
      setError(null)
      
      await addApplication(formData)
      
      // Reset form
      setFormData({
        program_id: programId || '',
        status: 'planning',
        deadline: '',
        notes: ''
      })
      
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Error creating application:', err)
      setError('Failed to create application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      program_id: programId || '',
      status: 'planning',
      deadline: '',
      notes: ''
    })
    setError(null)
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create Application
            </h2>
            {programName && universityName && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {programName} at {universityName}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Program Selection */}
          {!programId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Program *
              </label>
              <select
                value={formData.program_id}
                onChange={(e) => setFormData(prev => ({ ...prev, program_id: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.program_id ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Choose a program...</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>
                    {program.name} - {program.university} ({program.country})
                  </option>
                ))}
              </select>
              {errors.program_id && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.program_id}</p>
              )}
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Application Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="in-review">In Review</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="deferred">Deferred</option>
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Application Deadline *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.deadline ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
            </div>
            {errors.deadline && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.deadline}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about this application..."
                rows={3}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateApplicationModal

