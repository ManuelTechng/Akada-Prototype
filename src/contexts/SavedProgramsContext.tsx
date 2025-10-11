import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRealtime } from '../hooks/useRealtime'

interface SavedProgram {
  id: string
  user_id: string
  program_id: string
  program_name?: string
  university?: string
  country?: string
  created_at?: string
  saved_at?: string
}

interface SavedProgramsContextType {
  savedPrograms: SavedProgram[]
  isLoading: boolean
  error: string | null
  saveProgram: (programId: string, programData?: any) => Promise<void>
  removeSavedProgram: (programId: string) => Promise<void>
  refreshSavedPrograms: () => Promise<void>
}

const SavedProgramsContext = createContext<SavedProgramsContextType | undefined>(undefined)

export const useSavedProgramsContext = () => {
  const context = useContext(SavedProgramsContext)
  if (!context) {
    // Return a default context instead of throwing
    console.warn('useSavedProgramsContext called outside SavedProgramsProvider, using default context')
    return {
      savedPrograms: [],
      isLoading: false,
      error: null,
      saveProgram: async () => console.warn('saveProgram called outside SavedProgramsProvider'),
      removeSavedProgram: async () => console.warn('removeSavedProgram called outside SavedProgramsProvider'),
      refreshSavedPrograms: async () => console.warn('refreshSavedPrograms called outside SavedProgramsProvider')
    }
  }
  return context
}

interface SavedProgramsProviderProps {
  children: React.ReactNode
  userId?: string
}

export const SavedProgramsProvider: React.FC<SavedProgramsProviderProps> = ({ 
  children, 
  userId 
}) => {
  const [savedPrograms, setSavedPrograms] = useState<SavedProgram[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSavedPrograms = async () => {
    if (!userId) {
      setIsLoading(false)
      setSavedPrograms([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('Fetching saved programs for user:', userId)
      
      // Join with programs table to get program details
      const { data, error: fetchError } = await supabase
        .from('saved_programs')
        .select(`
          id,
          user_id,
          program_id,
          saved_at,
          notes,
          programs (
            id,
            name,
            university,
            country,
            tuition_fee,
            degree_type,
            specialization,
            duration,
            scholarship_available
          )
        `)
        .eq('user_id', userId)
        .order('saved_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching saved programs:', fetchError)
        setError('Failed to load saved programs')
        setSavedPrograms([])
        return
      }

      console.log('Raw saved programs data:', data)
      
      // Transform data to include program details
      const transformedData = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        program_id: item.program_id,
        saved_at: item.saved_at,
        notes: item.notes,
        // Flatten program details from joined table
        program_name: item.programs?.name || 'Unknown Program',
        university: item.programs?.university || 'Unknown University',
        country: item.programs?.country || 'Unknown Country',
        tuition_fee: item.programs?.tuition_fee || 0,
        degree_type: item.programs?.degree_type,
        specialization: item.programs?.specialization,
        duration: item.programs?.duration,
        scholarship_available: item.programs?.scholarship_available
      }))
      
      console.log('Transformed saved programs:', transformedData)
      setSavedPrograms(transformedData)
    } catch (err) {
      console.error('Error in fetchSavedPrograms:', err)
      setError('Failed to load saved programs')
      setSavedPrograms([])
    } finally {
      setIsLoading(false)
    }
  }

  const saveProgram = async (programId: string, programData?: any) => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('saved_programs')
        .upsert({
          user_id: userId,
          program_id: programId,
          program_name: programData?.name,
          university: programData?.university,
          country: programData?.country,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving program:', error)
        throw error
      }

      // Refresh the list
      await fetchSavedPrograms()
    } catch (err) {
      console.error('Error in saveProgram:', err)
      throw err
    }
  }

  const removeSavedProgram = async (programId: string) => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('saved_programs')
        .delete()
        .eq('user_id', userId)
        .eq('program_id', programId)

      if (error) {
        console.error('Error removing saved program:', error)
        throw error
      }

      // Update local state
      setSavedPrograms(prev => prev.filter(p => p.program_id !== programId))
    } catch (err) {
      console.error('Error in removeSavedProgram:', err)
      throw err
    }
  }

  const refreshSavedPrograms = async () => {
    await fetchSavedPrograms()
  }

  // Real-time subscription for saved programs
  useRealtime({
    table: 'saved_programs',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    onInsert: (payload) => {
      console.log('New saved program:', payload)
      fetchSavedPrograms()
    },
    onUpdate: (payload) => {
      console.log('Saved program updated:', payload)
      fetchSavedPrograms()
    },
    onDelete: (payload) => {
      console.log('Saved program deleted:', payload)
      fetchSavedPrograms()
    },
    enabled: !!userId
  })

  useEffect(() => {
    if (userId) {
      fetchSavedPrograms()
    }
  }, [userId])

  return (
    <SavedProgramsContext.Provider value={{
      savedPrograms,
      isLoading,
      error,
      saveProgram,
      removeSavedProgram,
      refreshSavedPrograms
    }}>
      {children}
    </SavedProgramsContext.Provider>
  )
} 