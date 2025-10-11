import React, { useState } from 'react'
import { Bell, X, Check, Archive, Trash2, Settings } from 'lucide-react'
import { useNotifications } from '../../contexts/NotificationContext'
import { formatDistanceToNow } from 'date-fns'

interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const { state, markAsRead, markAllAsRead, archive, remove } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all')

  const filteredNotifications = state.notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read
    if (filter === 'archived') return notification.is_archived
    return !notification.is_archived
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'reminder': return '⏰'
      default: return 'ℹ️'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'reminder': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId)
  }

  const handleArchive = async (notificationId: string) => {
    await archive(notificationId)
  }

  const handleDelete = async (notificationId: string) => {
    await remove(notificationId)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {state.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {state.unreadCount > 9 ? '9+' : state.unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {state.unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 mt-3">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'archived', label: 'Archived' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    filter === tab.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {state.loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {filter === 'unread' 
                  ? 'No unread notifications'
                  : filter === 'archived'
                  ? 'No archived notifications'
                  : 'No notifications yet'
                }
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-lg">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            <p className="mt-1 text-sm text-gray-600">
                              {notification.message}
                            </p>
                            <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                              <span>
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
                                {notification.category}
                              </span>
                            </div>
                          </div>
                          
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-3 flex items-center space-x-2">
                          {notification.action_url && notification.action_label && (
                            <a
                              href={notification.action_url}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              {notification.action_label}
                            </a>
                          )}
                          
                          <div className="flex items-center space-x-1">
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleArchive(notification.id)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Archive"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              </span>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                <Settings className="w-4 h-4 inline mr-1" />
                Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

