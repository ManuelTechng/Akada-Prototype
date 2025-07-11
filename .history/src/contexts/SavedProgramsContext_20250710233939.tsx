import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface SavedProgram {
  id: string
  user_id: string
  program_id: string
  program_name?: string
  university?: string
  country?: string
  created_at: string
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
      const { data, error: fetchError } = await supabase
        .from('saved_programs')
        .select('*')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching saved programs:', fetchError)
        setError('Failed to load saved programs')
        setSavedPrograms([])
        return
      }

      setSavedPrograms(data || [])
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