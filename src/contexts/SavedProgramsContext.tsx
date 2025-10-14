import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRealtime } from '../hooks/useRealtime'
import { checkConnectionHealth, retryWithBackoff, isConnectionError } from '../lib/connectionHealth'

interface SavedProgram {
  id: string
  user_id: string
  program_id: string
  program_name?: string
  university?: string
  country?: string
  created_at?: string
  saved_at?: string
  notes?: string
  tuition_fee?: number
  tuition_fee_currency?: string
  degree_type?: string
  specialization?: string
  duration?: string
  scholarship_available?: boolean
  study_level?: string
  description?: string
  website?: string
  location?: string
  requirements?: any[]
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
      console.log('⏳ Fetching saved programs for user:', userId)
      
      // Check connection health first
      console.log('🔍 Checking connection health...');
      const health = await checkConnectionHealth();
      
      if (!health.isHealthy) {
        console.log('❌ Connection unhealthy, skipping saved programs fetch:', health.error);
        setSavedPrograms([]);
        setError(null); // Don't show error for connection issues
        return;
      }
      
      console.log(`✅ Connection healthy (${health.latency?.toFixed(0)}ms)`);
      
      const startTime = performance.now()

      // Query with JOIN to get full program details
      const queryPromise = supabase
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
            degree_type,
            tuition_fee,
            tuition_fee_currency,
            duration,
            specialization,
            scholarship_available,
            study_level,
            description,
            website,
            location,
            requirements
          )
        `)
        .eq('user_id', userId)
        .order('saved_at', { ascending: false })

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout after 8 seconds')), 8000)
      )

      // Race the query against the timeout
      const result = await Promise.race([queryPromise, timeoutPromise]) as any
      const { data, error: fetchError } = result

      const endTime = performance.now()
      console.log(`✅ Saved programs query completed in ${(endTime - startTime).toFixed(0)}ms`)

      if (fetchError) {
        console.error('❌ Error fetching saved programs:', fetchError)

        // If it's a timeout, show a user-friendly message and continue with empty state
        if (fetchError.message?.includes('timeout')) {
          console.log('⏰ Saved programs query timed out, continuing with empty state')
          setError(null) // Don't show error for timeout - just continue
          setSavedPrograms([])
          return
        }

        setError(`Failed to load saved programs: ${fetchError.message}`)
        setSavedPrograms([])
        return
      }

      console.log('📊 Raw saved programs data:', { count: data?.length || 0 })

      // Transform data with full program info from JOIN
      const transformedData = (data || []).map((item: any) => {
        const program = item.programs
        return {
          id: item.id,
          user_id: item.user_id,
          program_id: item.program_id,
          saved_at: item.saved_at,
          notes: item.notes,
          // Real program data from JOIN
          program_name: program?.name || 'Unknown Program',
          university: program?.university || 'Unknown University',
          country: program?.country || 'Unknown Country',
          tuition_fee: program?.tuition_fee || 0,
          tuition_fee_currency: program?.tuition_fee_currency || 'NGN',
          degree_type: program?.degree_type || program?.study_level || 'Unknown',
          specialization: program?.specialization || 'Unknown',
          duration: program?.duration || 'Unknown',
          scholarship_available: program?.scholarship_available || false,
          study_level: program?.study_level,
          description: program?.description,
          website: program?.website,
          location: program?.location,
          requirements: program?.requirements
        }
      })

      console.log('✅ Transformed saved programs:', { count: transformedData.length })
      setSavedPrograms(transformedData)
      setError(null) // Clear any previous errors
    } catch (err: any) {
      console.error('❌ Error in fetchSavedPrograms:', err)
      setError(err.message || 'Failed to load saved programs')
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
          saved_at: new Date().toISOString(),
          notes: programData?.notes || null
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