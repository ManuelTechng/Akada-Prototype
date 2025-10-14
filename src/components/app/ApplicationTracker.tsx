import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  EditIcon,
  TrashIcon,
  ExternalLinkIcon,
  FileTextIcon,
  MoreVerticalIcon,
  BookmarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  GridIcon,
  ListIcon
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import ApplicationTimelineWidget from '../dashboard/ApplicationTimelineWidget'
import SkeletonLoader from '../ui/SkeletonLoader'
import { formatNGN } from '../../utils/currency'
import { cn } from '../../lib/utils'

// ======================================
// TYPES AND INTERFACES  
// ======================================

interface Application {
  id: string
  user_id: string
  program_id: string
  status: 'planning' | 'in-progress' | 'submitted' | 'in-review' | 'accepted' | 'rejected' | 'deferred'
  deadline: string
  notes?: string
  created_at: string
  updated_at: string
  programs: {
    id: string
    name: string
    university: string
    country: string
    tuition_fee: number
    application_fee?: number
    degree_type: string
    duration: string
    specialization: string
  }
}

interface ApplicationFormData {
  program_id: string
  status: Application['status']
  deadline: string
  notes?: string
}

type ViewMode = 'grid' | 'list' | 'timeline'
type FilterStatus = 'all' | Application['status']
type SortField = 'deadline' | 'created_at' | 'status' | 'university'
type SortOrder = 'asc' | 'desc'

// ======================================
// UTILITY FUNCTIONS
// ======================================

const getStatusConfig = (status: Application['status']) => {
  const configs = {
    planning: {
      color: 'bg-gray-500',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      textColor: 'text-gray-700 dark:text-gray-300',
      icon: FileTextIcon,
      label: 'Planning'
    },
    'in-progress': {
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300',
      icon: ClockIcon,
      label: 'In Progress'
    },
    submitted: {
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      textColor: 'text-indigo-700 dark:text-indigo-300',
      icon: ArrowUpIcon,
      label: 'Submitted'
    },
    'in-review': {
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      icon: ClockIcon,
      label: 'In Review'
    },
    accepted: {
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-300',
      icon: CheckCircleIcon,
      label: 'Accepted'
    },
    rejected: {
      color: 'bg-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-700 dark:text-red-300',
      icon: XCircleIcon,
      label: 'Rejected'
    },
    deferred: {
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-700 dark:text-orange-300',
      icon: AlertTriangleIcon,
      label: 'Deferred'
    }
  }
  
  return configs[status]
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getDaysUntilDeadline = (deadline: string) => {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const timeDiff = deadlineDate.getTime() - today.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

// ======================================
// APPLICATION FORM COMPONENT
// ======================================

interface ApplicationFormProps {
  application?: Application
  programs: any[]
  onSubmit: (data: ApplicationFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  application,
  programs,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<ApplicationFormData>({
    program_id: application?.program_id || '',
    status: application?.status || 'planning',
    deadline: application?.deadline?.split('T')[0] || '',
    notes: application?.notes || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.program_id) {
      newErrors.program_id = 'Please select a program'
    }
    
    if (!formData.deadline) {
      newErrors.deadline = 'Please set a deadline'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {application ? 'Edit Application' : 'Add New Application'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Program Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Program *
              </label>
              <select
                value={formData.program_id}
                onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                className={cn(
                  'w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white',
                  errors.program_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                )}
                disabled={!!application} // Can't change program for existing applications
              >
                <option value="">Select a program</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>
                    {program.name} - {program.university}
                  </option>
                ))}
              </select>
              {errors.program_id && (
                <p className="mt-1 text-sm text-red-600">{errors.program_id}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Application['status'] })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
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
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className={cn(
                  'w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white',
                  errors.deadline ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                )}
              />
              {errors.deadline && (
                <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="Add notes about this application..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md font-medium',
                  'hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed',
                  'flex items-center justify-center space-x-2'
                )}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{application ? 'Update Application' : 'Add Application'}</span>
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ======================================
// APPLICATION CARD COMPONENTS
// ======================================

interface ApplicationCardProps {
  application: Application
  viewMode: ViewMode
  onEdit: (application: Application) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Application['status']) => void
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  viewMode,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const [showActions, setShowActions] = useState(false)
  const statusConfig = getStatusConfig(application.status)
  const daysLeft = getDaysUntilDeadline(application.deadline)
  const isOverdue = daysLeft < 0
  const isUrgent = daysLeft <= 7 && daysLeft >= 0

  const StatusIcon = statusConfig.icon

  if (viewMode === 'list') {
    return (
      <div className={cn(
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4',
        'hover:shadow-md transition-all duration-200'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <div className={cn(
                'w-3 h-3 rounded-full',
                statusConfig.color
              )} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {application.programs.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {application.programs.university}, {application.programs.country}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                statusConfig.color,
                'text-white'
              )}>
                {statusConfig.label}
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Due: {formatDate(application.deadline)}
              </p>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <MoreVerticalIcon className="w-4 h-4" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                  <button
                    onClick={() => {
                      onEdit(application)
                      setShowActions(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                  >
                    <EditIcon className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete(application.id)
                      setShowActions(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6',
      'hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1',
      isOverdue && 'border-red-300 dark:border-red-600',
      isUrgent && 'border-orange-300 dark:border-orange-600'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {application.programs.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {application.programs.university}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {application.programs.country} • {application.programs.duration}
          </p>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <MoreVerticalIcon className="w-4 h-4" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-10">
              <button
                onClick={() => {
                  onEdit(application)
                  setShowActions(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
              >
                <EditIcon className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <hr className="border-gray-200 dark:border-gray-600" />
              <button
                onClick={() => {
                  onDelete(application.id)
                  setShowActions(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
          statusConfig.color,
          'text-white'
        )}>
          <StatusIcon className="w-4 h-4 mr-1" />
          {statusConfig.label}
        </span>
        
        {(isOverdue || isUrgent) && (
          <span className={cn(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold',
            isOverdue ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
            'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
          )}>
            {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
          </span>
        )}
      </div>

      {/* Deadline */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <CalendarIcon className="w-4 h-4" />
        <span>Deadline: {formatDate(application.deadline)}</span>
      </div>

      {/* Costs */}
      {application.programs.tuition_fee && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <span className="font-medium">Tuition:</span> {formatNGN(application.programs.tuition_fee)}
          {application.programs.application_fee && (
            <span className="ml-2">
              • <span className="font-medium">Application:</span> {formatNGN(application.programs.application_fee)}
            </span>
          )}
        </div>
      )}

      {/* Notes */}
      {application.notes && (
        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded p-3 mb-4">
          <p className="truncate">{application.notes}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(application)}
          className="flex-1 px-3 py-2 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-md text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/30"
        >
          Edit
        </button>
        
        <select
          value={application.status}
          onChange={(e) => onStatusChange(application.id, e.target.value as Application['status'])}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
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
    </div>
  )
}

// ======================================
// MAIN COMPONENT
// ======================================

export const ApplicationTracker: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // State management
  const [applications, setApplications] = useState<Application[]>([])
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [sortField, setSortField] = useState<SortField>('deadline')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  // Data fetching
  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [applicationsResult, programsResult] = await Promise.all([
        supabase
          .from('applications')
          .select(`
            *,
            programs!inner(
              id, name, university, country, tuition_fee, 
              application_fee, degree_type, duration, specialization
            )
          `)
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('programs')
          .select('id, name, university, country')
          .order('name')
      ])

      if (applicationsResult.error) throw applicationsResult.error
      if (programsResult.error) throw programsResult.error

      setApplications(applicationsResult.data || [])
      setPrograms(programsResult.data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load applications. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Form handlers
  const handleAddApplication = async (data: ApplicationFormData) => {
    try {
      setFormLoading(true)
      
      const { error } = await supabase
        .from('applications')
        .insert({
          user_id: user?.id,
          program_id: data.program_id,
          status: data.status,
          deadline: data.deadline,
          notes: data.notes
        })

      if (error) throw error

      await fetchData()
      setShowForm(false)
    } catch (err) {
      console.error('Error adding application:', err)
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditApplication = async (data: ApplicationFormData) => {
    if (!editingApplication) return

    try {
      setFormLoading(true)
      
      const { error } = await supabase
        .from('applications')
        .update({
          status: data.status,
          deadline: data.deadline,
          notes: data.notes
        })
        .eq('id', editingApplication.id)

      if (error) throw error

      await fetchData()
      setEditingApplication(null)
    } catch (err) {
      console.error('Error updating application:', err)
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return

    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchData()
    } catch (err) {
      console.error('Error deleting application:', err)
      alert('Failed to delete application. Please try again.')
    }
  }

  const handleStatusChange = async (id: string, status: Application['status']) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      await fetchData()
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Failed to update status. Please try again.')
    }
  }

  // Filter and sort applications
  const filteredAndSortedApplications = applications
    .filter(app => {
      const matchesSearch = searchQuery === '' ||
        app.programs.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.programs.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.programs.country.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortField) {
        case 'deadline':
          aValue = new Date(a.deadline).getTime()
          bValue = new Date(b.deadline).getTime()
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'university':
          aValue = a.programs.university
          bValue = b.programs.university
          break
        default:
          return 0
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  // Stats
  const stats = {
    total: applications.length,
    planning: applications.filter(app => app.status === 'planning').length,
    inProgress: applications.filter(app => app.status === 'in-progress').length,
    submitted: applications.filter(app => app.status === 'submitted').length,
    accepted: applications.filter(app => app.status === 'accepted').length
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <SkeletonLoader.DashboardGrid />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <SkeletonLoader.ApplicationCard key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Applications
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Application Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your study abroad applications
            </p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Application
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-indigo-600">{stats.submitted}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Submitted</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Accepted</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-600">{stats.planning}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Planning</div>
          </div>
        </div>

        {/* Timeline Widget */}
        {viewMode === 'timeline' ? (
          <ApplicationTimelineWidget className="mb-8" />
        ) : (
          <>
            {/* Filters and Search */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                    <option value="submitted">Submitted</option>
                    <option value="in-review">In Review</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="deferred">Deferred</option>
                  </select>

                  <select
                    value={`${sortField}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-')
                      setSortField(field as SortField)
                      setSortOrder(order as SortOrder)
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    <option value="deadline-asc">Deadline (Soon)</option>
                    <option value="deadline-desc">Deadline (Late)</option>
                    <option value="created_at-desc">Recently Added</option>
                    <option value="university-asc">University A-Z</option>
                    <option value="status-asc">Status</option>
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-md p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        'p-2 rounded-md transition-colors',
                        viewMode === 'grid' 
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      )}
                    >
                      <GridIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'p-2 rounded-md transition-colors',
                        viewMode === 'list' 
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      )}
                    >
                      <ListIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('timeline')}
                      className={cn(
                        'p-2 rounded-md transition-colors',
                        viewMode === 'list' 
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      )}
                    >
                      <CalendarIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Applications Grid/List */}
            {filteredAndSortedApplications.length === 0 ? (
              <div className="text-center py-12">
                <FileTextIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No applications found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Start your study abroad journey by adding your first application'
                  }
                </p>
                {(!searchQuery && statusFilter === 'all') && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Add First Application
                  </button>
                )}
              </div>
            ) : (
              <div className={cn(
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              )}>
                {filteredAndSortedApplications.map(application => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    viewMode={viewMode}
                    onEdit={setEditingApplication}
                    onDelete={handleDeleteApplication}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Form Modal */}
        {(showForm || editingApplication) && (
          <ApplicationForm
            application={editingApplication || undefined}
            programs={programs}
            onSubmit={editingApplication ? handleEditApplication : handleAddApplication}
            onCancel={() => {
              setShowForm(false)
              setEditingApplication(null)
            }}
            loading={formLoading}
          />
        )}
      </div>
    </div>
  )
}

export default ApplicationTracker