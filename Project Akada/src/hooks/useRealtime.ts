import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface RealtimeSubscriptionOptions {
  table: string
  filter?: string
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
  enabled?: boolean
}

export const useRealtime = (options: RealtimeSubscriptionOptions) => {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!options.enabled) return

    const channel = supabase
      .channel(`${options.table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: options.table,
          filter: options.filter
        },
        (payload) => {
          console.log(`Realtime update for ${options.table}:`, payload)
          
          switch (payload.eventType) {
            case 'INSERT':
              options.onInsert?.(payload)
              break
            case 'UPDATE':
              options.onUpdate?.(payload)
              break
            case 'DELETE':
              options.onDelete?.(payload)
              break
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [options.table, options.filter, options.enabled])

  return {
    channel: channelRef.current
  }
}

// Hook for polling-based refresh
export const usePolling = (callback: () => void, interval: number = 30000, enabled: boolean = true) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled) return

    intervalRef.current = setInterval(callback, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [callback, interval, enabled])

  return {
    stop: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }
}

// Hook for manual refresh with debouncing
export const useRefresh = (callback: () => void, debounceMs: number = 1000) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const refresh = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      callback()
    }, debounceMs)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { refresh }
}

