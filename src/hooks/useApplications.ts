import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useRealtime } from './useRealtime'

export interface Application {
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

export interface ApplicationFormData {
  program_id: string
  status: Application['status']
  deadline: string
  notes?: string
}

export const useApplications = () => {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApplications = async () => {
    if (!user) {
      setApplications([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('applications')
        .select(`
          *,
          programs!inner(
            id, name, university, country, tuition_fee, 
            application_fee, degree_type, duration, specialization
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setApplications((data || []) as any as Application[])
    } catch (err) {
      console.error('Error fetching applications:', err)
      setError('Failed to load applications')
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  const addApplication = async (data: ApplicationFormData) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          program_id: data.program_id,
          status: data.status,
          deadline: data.deadline,
          notes: data.notes
        })

      if (error) throw error

      // Refresh applications list
      await fetchApplications()
    } catch (err) {
      console.error('Error adding application:', err)
      throw err
    }
  }

  const updateApplication = async (id: string, data: Partial<ApplicationFormData>) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update(data)
        .eq('id', id)

      if (error) throw error

      // Refresh applications list
      await fetchApplications()
    } catch (err) {
      console.error('Error updating application:', err)
      throw err
    }
  }

  const deleteApplication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Update local state
      setApplications(prev => prev.filter(app => app.id !== id))
    } catch (err) {
      console.error('Error deleting application:', err)
      throw err
    }
  }

  const updateApplicationStatus = async (id: string, status: Application['status']) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === id ? { ...app, status } : app
        )
      )
    } catch (err) {
      console.error('Error updating application status:', err)
      throw err
    }
  }

  // Create application from saved program
  const createApplicationFromSavedProgram = async (programId: string, deadline: string, notes?: string) => {
    const applicationData: ApplicationFormData = {
      program_id: programId,
      status: 'planning',
      deadline,
      notes
    }

    await addApplication(applicationData)
  }

  // Real-time subscription for applications
  useRealtime({
    table: 'applications',
    filter: user ? `user_id=eq.${user.id}` : undefined,
    onInsert: (payload) => {
      console.log('New application created:', payload)
      fetchApplications()
    },
    onUpdate: (payload) => {
      console.log('Application updated:', payload)
      fetchApplications()
    },
    onDelete: (payload) => {
      console.log('Application deleted:', payload)
      fetchApplications()
    },
    enabled: !!user
  })

  useEffect(() => {
    if (user) {
      fetchApplications()
    }
  }, [user])

  return {
    applications,
    loading,
    error,
    addApplication,
    updateApplication,
    deleteApplication,
    updateApplicationStatus,
    createApplicationFromSavedProgram,
    refreshApplications: fetchApplications
  }
}
