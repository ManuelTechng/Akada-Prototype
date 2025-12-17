// Global currency error recovery and notification system
import React, { useState, useEffect, useCallback } from 'react';
import { CurrencyError, CurrencyErrorType } from '../../lib/currency/errors';
import { currencyService } from '../../lib/currency/CurrencyService';

interface ErrorNotification {
  id: string;
  error: CurrencyError;
  timestamp: Date;
  dismissed: boolean;
  autoRetryAttempts: number;
}

interface ErrorRecoveryProps {
  maxNotifications?: number;
  autoRetryDelay?: number;
  maxAutoRetries?: number;
  showSuccessMessages?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * Global error recovery component for currency operations
 */
export function CurrencyErrorRecovery({
  maxNotifications = 5,
  autoRetryDelay = 30000, // 30 seconds
  maxAutoRetries = 2,
  showSuccessMessages = false,
  position = 'top-right'
}: ErrorRecoveryProps) {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);

  // Listen for currency service errors
  useEffect(() => {
    const handleServiceEvent = (event: any) => {
      switch (event.type) {
        case 'api_error':
          addErrorNotification(event.error);
          break;
        case 'rate_updated':
          if (showSuccessMessages) {
            showSuccessNotification(`Exchange rates updated: ${event.from}/${event.to}`);
          }
          break;
        case 'fallback_used':
          showWarningNotification(`Using approximate rates for ${event.from}/${event.to}`);
          break;
      }
    };

    currencyService.addEventListener(handleServiceEvent);
    return () => currencyService.removeEventListener(handleServiceEvent);
  }, [showSuccessMessages]);

  const addErrorNotification = useCallback((error: CurrencyError) => {
    const notification: ErrorNotification = {
      id: Date.now().toString(),
      error,
      timestamp: new Date(),
      dismissed: false,
      autoRetryAttempts: 0
    };

    setNotifications(prev => {
      const updated = [notification, ...prev].slice(0, maxNotifications);
      return updated;
    });

    // Schedule auto-retry for retryable errors
    if (error.retryable && error.type !== CurrencyErrorType.RATE_LIMIT_EXCEEDED) {
      setTimeout(() => {
        attemptAutoRetry(notification.id);
      }, autoRetryDelay);
    }
  }, [maxNotifications, autoRetryDelay]);

  const attemptAutoRetry = useCallback(async (notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (!notification || notification.dismissed || notification.autoRetryAttempts >= maxAutoRetries) {
        return prev;
      }

      return prev.map(n => 
        n.id === notificationId 
          ? { ...n, autoRetryAttempts: n.autoRetryAttempts + 1 }
          : n
      );
    });

    setIsRetrying(true);
    
    try {
      // Test connection by getting a simple rate
      await currencyService.getExchangeRate('USD', 'NGN', { forceRefresh: true });
      
      // If successful, clear similar errors
      setNotifications(prev => 
        prev.map(n => 
          n.error.type === CurrencyErrorType.API_UNAVAILABLE || 
          n.error.type === CurrencyErrorType.NETWORK_ERROR
            ? { ...n, dismissed: true }
            : n
        )
      );

      if (showSuccessMessages) {
        showSuccessNotification('Currency service recovered');
      }
    } catch (error) {
      console.log('Auto-retry failed, service still unavailable');
    } finally {
      setIsRetrying(false);
    }
  }, [maxAutoRetries, showSuccessMessages]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, dismissed: true } : n)
    );
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, dismissed: true })));
  }, []);

  const manualRetry = useCallback(async () => {
    setIsRetrying(true);
    
    try {
      await currencyService.getExchangeRate('USD', 'NGN', { forceRefresh: true });
      dismissAll();
      
      if (showSuccessMessages) {
        showSuccessNotification('Connection restored');
      }
    } catch (error) {
      addErrorNotification(error as CurrencyError);
    } finally {
      setIsRetrying(false);
    }
  }, [dismissAll, addErrorNotification, showSuccessMessages]);

  const showSuccessNotification = (message: string) => {
    // Create temporary success notification
    const successId = `success-${Date.now()}`;
    const successElement = document.createElement('div');
    successElement.className = `fixed ${getPositionClasses()} z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded transition-opacity duration-300`;
    successElement.innerHTML = `
      <div class="flex items-center">
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        ${message}
      </div>
    `;
    
    document.body.appendChild(successElement);
    
    setTimeout(() => {
      successElement.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(successElement);
      }, 300);
    }, 3000);
  };

  const showWarningNotification = (message: string) => {
    // Create temporary warning notification similar to success
    const warningId = `warning-${Date.now()}`;
    const warningElement = document.createElement('div');
    warningElement.className = `fixed ${getPositionClasses()} z-50 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded transition-opacity duration-300`;
    warningElement.innerHTML = `
      <div class="flex items-center">
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        ${message}
      </div>
    `;
    
    document.body.appendChild(warningElement);
    
    setTimeout(() => {
      warningElement.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(warningElement);
      }, 300);
    }, 5000);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'top-right':
      default:
        return 'top-4 right-4';
    }
  };

  const activeNotifications = notifications.filter(n => !n.dismissed);

  if (activeNotifications.length === 0) {
    return null;
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50 max-w-sm space-y-2`}>
      {activeNotifications.map((notification) => (
        <ErrorNotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={() => dismissNotification(notification.id)}
          onRetry={manualRetry}
          isRetrying={isRetrying}
        />
      ))}
      
      {activeNotifications.length > 1 && (
        <button
          onClick={dismissAll}
          className="w-full text-xs text-gray-500 hover:text-gray-700 text-center py-1"
        >
          Dismiss all
        </button>
      )}
    </div>
  );
}

interface NotificationItemProps {
  notification: ErrorNotification;
  onDismiss: () => void;
  onRetry: () => void;
  isRetrying: boolean;
}

function ErrorNotificationItem({ 
  notification, 
  onDismiss, 
  onRetry, 
  isRetrying 
}: NotificationItemProps) {
  const { error } = notification;
  
  const getErrorIcon = () => {
    switch (error.type) {
      case CurrencyErrorType.NETWORK_ERROR:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case CurrencyErrorType.API_UNAVAILABLE:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <div className="text-red-400">
            {getErrorIcon()}
          </div>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Currency Service Issue
          </h3>
          
          <p className="mt-1 text-sm text-red-700">
            {error.message}
          </p>
          
          {notification.autoRetryAttempts > 0 && (
            <p className="mt-1 text-xs text-red-600">
              Auto-retry attempts: {notification.autoRetryAttempts}
            </p>
          )}
          
          <div className="mt-3 flex space-x-2">
            {error.retryable && (
              <button
                onClick={onRetry}
                disabled={isRetrying}
                className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 disabled:opacity-50"
              >
                {isRetrying ? 'Retrying...' : 'Retry'}
              </button>
            )}
            
            <button
              onClick={onDismiss}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrencyErrorRecovery;