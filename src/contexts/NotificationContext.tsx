import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  archiveNotification,
  deleteNotification,
  getNotificationCount,
  type Notification,
  type NotificationPreferences
} from '../lib/notifications'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  totalCount: number
  loading: boolean
  error: string | null
  preferences: NotificationPreferences | null
}

type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_COUNTS'; payload: { unread: number; total: number } }
  | { type: 'SET_PREFERENCES'; payload: NotificationPreferences }

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  totalCount: 0,
  loading: false,
  error: null,
  preferences: null
}

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload }
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [action.payload, ...state.notifications],
        totalCount: state.totalCount + 1,
        unreadCount: action.payload.is_read ? state.unreadCount : state.unreadCount + 1
      }
    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.payload.id ? action.payload : n
        ),
        unreadCount: action.payload.is_read 
          ? state.unreadCount - (state.notifications.find(n => n.id === action.payload.id)?.is_read ? 0 : 1)
          : state.unreadCount
      }
    case 'REMOVE_NOTIFICATION':
      const removedNotification = state.notifications.find(n => n.id === action.payload)
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        totalCount: state.totalCount - 1,
        unreadCount: removedNotification?.is_read ? state.unreadCount : state.unreadCount - 1
      }
    case 'SET_COUNTS':
      return { ...state, unreadCount: action.payload.unread, totalCount: action.payload.total }
    case 'SET_PREFERENCES':
      return { ...state, preferences: action.payload }
    default:
      return state
  }
}

interface NotificationContextType {
  state: NotificationState
  fetchNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  archive: (notificationId: string) => Promise<void>
  remove: (notificationId: string) => Promise<void>
  refreshCounts: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState)
  const { user } = useAuth()

  const fetchNotifications = useCallback(async () => {
    if (!user) return

    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      const notifications = await getUserNotifications(user.id, {
        includeArchived: false,
        includeRead: true,
        limit: 50
      })

      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications })
    } catch (error) {
      console.error('Error fetching notifications:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch notifications' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [user])

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return

    try {
      const success = await markNotificationAsRead(notificationId)
      if (success) {
        dispatch({ type: 'UPDATE_NOTIFICATION', payload: { 
          ...state.notifications.find(n => n.id === notificationId)!,
          is_read: true,
          read_at: new Date().toISOString()
        }})
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [user, state.notifications])

  const markAllAsRead = useCallback(async () => {
    if (!user) return

    try {
      const success = await markAllNotificationsAsRead(user.id)
      if (success) {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: 
          state.notifications.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
        })
        dispatch({ type: 'SET_COUNTS', payload: { unread: 0, total: state.totalCount } })
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [user, state.notifications, state.totalCount])

  const archive = useCallback(async (notificationId: string) => {
    if (!user) return

    try {
      const success = await archiveNotification(notificationId)
      if (success) {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId })
      }
    } catch (error) {
      console.error('Error archiving notification:', error)
    }
  }, [user])

  const remove = useCallback(async (notificationId: string) => {
    if (!user) return

    try {
      const success = await deleteNotification(notificationId)
      if (success) {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId })
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }, [user])

  const refreshCounts = useCallback(async () => {
    if (!user) return

    try {
      const counts = await getNotificationCount(user.id)
      dispatch({ type: 'SET_COUNTS', payload: { unread: counts.unread, total: counts.total } })
    } catch (error) {
      console.error('Error refreshing notification counts:', error)
    }
  }, [user])

  // Fetch notifications when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications()
      refreshCounts()
    } else {
      dispatch({ type: 'SET_NOTIFICATIONS', payload: [] })
      dispatch({ type: 'SET_COUNTS', payload: { unread: 0, total: 0 } })
    }
  }, [user, fetchNotifications, refreshCounts])

  const value: NotificationContextType = {
    state,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    archive,
    remove,
    refreshCounts
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}