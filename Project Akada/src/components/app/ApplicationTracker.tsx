import React, { useState, useEffect, useRef } from 'react'
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
  ListIcon,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import ApplicationTimelineWidget from '../dashboard/ApplicationTimelineWidget'
import SkeletonLoader from '../ui/SkeletonLoader'
import { formatNGN, formatUSD } from '../../utils/currency'
import { formatCurrency as formatCurrencyLib } from '../../lib/currency/formatters'
import { cn, formatProgramTuition } from '../../lib/utils'
import { useProgramTuition } from '../../hooks/useProgramTuition'

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
    tuition_fee_currency?: string
    tuition_fee_original?: number
    application_fee?: number
    application_fee_currency?: string
    application_fee_original?: number
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
      color: 'bg-muted-foreground',
      bgColor: 'bg-muted',
      textColor: 'text-muted-foreground',
      icon: FileTextIcon,
      label: 'Planning'
    },
    'in-progress': {
      color: 'bg-primary',
      bgColor: 'bg-accent',
      textColor: 'text-accent-foreground',
      icon: ClockIcon,
      label: 'In Progress'
    },
    submitted: {
      color: 'bg-primary',
      bgColor: 'bg-primary/10',
      textColor: 'text-primary',
      icon: ArrowUpIcon,
      label: 'Submitted'
    },
    'in-review': {
      color: 'bg-chart-3',
      bgColor: 'bg-chart-3/10',
      textColor: 'text-chart-3',
      icon: ClockIcon,
      label: 'In Review'
    },
    accepted: {
      color: 'bg-chart-1',
      bgColor: 'bg-chart-1/10',
      textColor: 'text-chart-1',
      icon: CheckCircleIcon,
      label: 'Accepted'
    },
    rejected: {
      color: 'bg-destructive',
      bgColor: 'bg-destructive/10',
      textColor: 'text-destructive',
      icon: XCircleIcon,
      label: 'Rejected'
    },
    deferred: {
      color: 'bg-chart-3',
      bgColor: 'bg-chart-3/10',
      textColor: 'text-chart-3',
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

// Removed formatAmount - using formatProgramTuition with hook instead

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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            {application ? 'Edit Application' : 'Add New Application'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Program Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Program *
              </label>
              <div className="relative">
                <select
                  value={formData.program_id}
                  onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                  className={cn(
                    'w-full appearance-none pl-3 pr-10 py-2 border rounded-md bg-background text-foreground',
                    errors.program_id ? 'border-destructive' : 'border-input'
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
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
              </div>
              {errors.program_id && (
                <p className="mt-1 text-sm text-destructive">{errors.program_id}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Application['status'] })}
                  className="w-full appearance-none pl-3 pr-10 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="submitted">Submitted</option>
                  <option value="in-review">In Review</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="deferred">Deferred</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Application Deadline *
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className={cn(
                  'w-full px-3 py-2 border rounded-md bg-background text-foreground',
                  errors.deadline ? 'border-destructive' : 'border-input'
                )}
              />
              {errors.deadline && (
                <p className="mt-1 text-sm text-destructive">{errors.deadline}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                placeholder="Add notes about this application..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium',
                  'hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed',
                  'flex items-center justify-center space-x-2'
                )}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{application ? 'Update Application' : 'Add Application'}</span>
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-input text-foreground rounded-md font-medium hover:bg-muted"
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
  const dropdownRef = useRef<HTMLDivElement>(null)
  const statusConfig = getStatusConfig(application.status)
  const daysLeft = getDaysUntilDeadline(application.deadline)
  const isOverdue = daysLeft < 0
  const isUrgent = daysLeft <= 7 && daysLeft >= 0

  const StatusIcon = statusConfig.icon

  // Calculate smart currency display using the same hook as Programs page
  const tuitionAmount = application.programs.tuition_fee || 0
  const tuitionDisplay = useProgramTuition(tuitionAmount, application.programs.country || '', {
    showConversion: true,
    enableRealTime: true,
    cacheTime: 300000 // 5 minutes cache
  })

  // Fallback to static display if hook is still loading
  const currencyDisplay = tuitionDisplay.isLoading
    ? formatProgramTuition(tuitionAmount, application.programs.country || '')
    : {
        primary: tuitionDisplay.primary,
        secondary: tuitionDisplay.secondary,
        isNigerian: tuitionDisplay.isNigerian
      }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowActions(false)
      }
    }

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showActions])

  if (viewMode === 'list') {
    return (
      <div className={cn(
        'bg-card border border-border rounded-lg p-4',
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
                <h3 className="font-semibold text-foreground truncate">
                  {application.programs.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
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
                'text-primary-foreground'
              )}>
                {statusConfig.label}
              </span>
              <p className="text-sm text-muted-foreground mt-1">
                Due: {formatDate(application.deadline)}
              </p>
            </div>
            
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
              >
                <MoreVerticalIcon className="w-4 h-4" />
              </button>

              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg border border-border z-10">
                  <button
                    onClick={() => {
                      onEdit(application)
                      setShowActions(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground flex items-center space-x-2"
                  >
                    <EditIcon className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete(application.id)
                      setShowActions(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 flex items-center space-x-2"
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
      'bg-card border border-border rounded-lg p-6',
      'hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1',
      isOverdue && 'border-destructive',
      isUrgent && 'border-chart-3'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {application.programs.name}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {application.programs.university}
          </p>
          <p className="text-xs text-muted-foreground">
            {application.programs.country} • {application.programs.duration}
          </p>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
          >
            <MoreVerticalIcon className="w-4 h-4" />
          </button>

          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg border border-border z-10">
              <button
                onClick={() => {
                  onEdit(application)
                  setShowActions(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground flex items-center space-x-2"
              >
                <EditIcon className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <hr className="border-border" />
              <button
                onClick={() => {
                  onDelete(application.id)
                  setShowActions(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 flex items-center space-x-2"
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
          'text-primary-foreground'
        )}>
          <StatusIcon className="w-4 h-4 mr-1" />
          {statusConfig.label}
        </span>

        {(isOverdue || isUrgent) && (
          <span className={cn(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold',
            isOverdue ? 'bg-destructive/10 text-destructive' :
            'bg-chart-3/10 text-chart-3'
          )}>
            {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
          </span>
        )}
      </div>

      {/* Deadline */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
        <CalendarIcon className="w-4 h-4" />
        <span>Deadline: {formatDate(application.deadline)}</span>
      </div>

      {/* Costs */}
      <div className="space-y-2 mb-4">
        {/* Tuition Fee - Using same display system as Programs page */}
        {tuitionAmount > 0 ? (
          <div className="text-sm">
            <span className="font-medium text-foreground">Annual Tuition:</span>
            <div className="mt-1">
              {tuitionDisplay.isLoading ? (
                <div className="animate-pulse bg-muted h-5 w-32 rounded"></div>
              ) : (
                <>
                  {/* Primary: Original currency */}
                  <div className="text-foreground font-semibold">
                    {currencyDisplay.primary}
                  </div>
                  {/* Secondary: NGN conversion (if not Nigerian school) */}
                  {currencyDisplay.secondary && (
                    <div className="text-xs text-muted-foreground">
                      {currencyDisplay.secondary}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic">
            Annual tuition fee not available
          </div>
        )}

        {/* Application Fee - Will be implemented when database has application fee data */}
        {application.programs.application_fee && application.programs.application_fee > 0 && (
          <div className="text-sm">
            <span className="font-medium text-foreground">Application Fee:</span>
            <div className="mt-1">
              <div className="text-foreground font-semibold text-xs">
                {formatNGN(application.programs.application_fee)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      {application.notes && (
        <div className="text-sm text-muted-foreground bg-muted rounded p-3 mb-4">
          <p className="truncate">{application.notes}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(application)}
          className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded-md text-sm font-medium hover:bg-primary/20"
        >
          Edit
        </button>

        <div className="relative">
          <select
            value={application.status}
            onChange={(e) => onStatusChange(application.id, e.target.value as Application['status'])}
            className="appearance-none pl-3 pr-10 py-2 border border-input rounded-md text-sm bg-background text-foreground"
          >
            <option value="planning">Planning</option>
            <option value="in-progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="in-review">In Review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="deferred">Deferred</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
        </div>
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
            programs!inner(*)
          `)
          .eq('user_id', user?.id || '')
          .order('created_at', { ascending: false }),

        supabase
          .from('programs')
          .select('id, name, university, country')
          .order('name')
      ])

      if (applicationsResult.error) throw applicationsResult.error
      if (programsResult.error) throw programsResult.error

      setApplications((applicationsResult.data || []) as any as Application[])
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
          user_id: user?.id || '',
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
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id || '')

      if (error) {
        console.error('Error deleting application:', error)
        alert(`Failed to delete application: ${error.message}`)
        return
      }

      // Optimistic update - remove from state immediately
      setApplications(prev => prev.filter(app => app.id !== id))

      // Then refresh to ensure consistency
      await fetchData()
    } catch (err: any) {
      console.error('Error deleting application:', err)
      alert(`Failed to delete application: ${err.message || 'Please try again.'}`)
      await fetchData()
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
            <XCircleIcon className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Failed to Load Applications
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
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
            <h1 className="text-2xl font-bold text-foreground">
              Application Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your study abroad applications
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Application
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="text-2xl font-bold text-primary">{stats.submitted}</div>
            <div className="text-sm text-muted-foreground">Submitted</div>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="text-2xl font-bold text-chart-1">{stats.accepted}</div>
            <div className="text-sm text-muted-foreground">Accepted</div>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="text-2xl font-bold text-muted-foreground">{stats.planning}</div>
            <div className="text-sm text-muted-foreground">Planning</div>
          </div>
        </div>

        {/* Filters and Search - Always visible */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground text-sm"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Status Filter */}
              <div className="relative flex-1 sm:flex-none sm:min-w-[140px]">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                  className="w-full appearance-none pl-3 pr-10 py-2 border border-input rounded-md bg-background text-foreground text-sm"
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
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
              </div>

              {/* Sort Filter */}
              <div className="relative flex-1 sm:flex-none sm:min-w-[160px]">
                <select
                  value={`${sortField}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-')
                    setSortField(field as SortField)
                    setSortOrder(order as SortOrder)
                  }}
                  className="w-full appearance-none pl-3 pr-10 py-2 border border-input rounded-md bg-background text-foreground text-sm"
                >
                  <option value="deadline-asc">Deadline (Soon)</option>
                  <option value="deadline-desc">Deadline (Late)</option>
                  <option value="created_at-desc">Recently Added</option>
                  <option value="university-asc">University A-Z</option>
                  <option value="status-asc">Status</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center justify-center sm:justify-start space-x-1 bg-muted rounded-md p-1 sm:ml-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'grid'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <GridIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  title="List View"
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'list'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <ListIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  title="Timeline View"
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'timeline'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content - Timeline or Applications Grid/List */}
        {viewMode === 'timeline' ? (
          <ApplicationTimelineWidget className="mb-8" />
        ) : (
          <>
            {/* Applications Grid/List */}
            {filteredAndSortedApplications.length === 0 ? (
              <div className="text-center py-12">
                <FileTextIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No applications found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Start your study abroad journey by adding your first application'
                  }
                </p>
                {(!searchQuery && statusFilter === 'all') && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
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