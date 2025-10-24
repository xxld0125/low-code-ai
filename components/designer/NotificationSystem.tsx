import React, { useState, useCallback, useEffect } from 'react'
import {
  Bell,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type {
  Notification,
  NotificationAction,
} from '@/lib/designer/conflict-detection'

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  CONFLICT = 'conflict',
}

interface NotificationSystemProps {
  notifications: Notification[]
  onMarkAsRead: (notificationId: string) => void
  onClearAll: () => void
  onExecuteAction?: (action: NotificationAction) => void
  className?: string
}

/**
 * Get notification icon based on type
 */
function getNotificationIcon(type: NotificationType, className?: string) {
  switch (type) {
    case NotificationType.SUCCESS:
      return <CheckCircle className={cn('h-4 w-4 text-green-500', className)} />
    case NotificationType.ERROR:
      return <AlertCircle className={cn('h-4 w-4 text-red-500', className)} />
    case NotificationType.WARNING:
      return <AlertTriangle className={cn('h-4 w-4 text-yellow-500', className)} />
    case NotificationType.CONFLICT:
      return <AlertCircle className={cn('h-4 w-4 text-orange-500', className)} />
    default:
      return <Info className={cn('h-4 w-4 text-blue-500', className)} />
  }
}

/**
 * Get notification color classes
 */
function getNotificationClasses(type: NotificationType) {
  switch (type) {
    case NotificationType.SUCCESS:
      return 'border-green-200 bg-green-50'
    case NotificationType.ERROR:
      return 'border-red-200 bg-red-50'
    case NotificationType.WARNING:
      return 'border-yellow-200 bg-yellow-50'
    case NotificationType.CONFLICT:
      return 'border-orange-200 bg-orange-50'
    default:
      return 'border-blue-200 bg-blue-50'
  }
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: Date): string {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return timestamp.toLocaleDateString()
}

/**
 * Individual notification item
 */
function NotificationItem({
  notification,
  onMarkAsRead,
  onExecuteAction,
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onExecuteAction?: (action: NotificationAction) => void
}) {
  const [isExecuting, setIsExecuting] = useState(false)

  const handleActionClick = async (action: NotificationAction) => {
    if (isExecuting) return

    setIsExecuting(true)
    try {
      await action.action()
      onExecuteAction?.(action)
    } catch (error) {
      console.error('Error executing notification action:', error)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div
      className={cn(
        'relative p-3 rounded-lg border transition-all duration-200',
        getNotificationClasses(notification.type),
        notification.read ? 'opacity-60' : 'opacity-100'
      )}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-3 right-3 h-2 w-2 bg-blue-500 rounded-full" />
      )}

      {/* Notification content */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                {notification.message}
              </p>
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-200"
              onClick={() => onMarkAsRead(notification.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Actions */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {notification.actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant === 'primary' ? 'default' : 'outline'}
                  size="sm"
                  disabled={isExecuting}
                  onClick={() => handleActionClick(action)}
                  className="h-7 px-3 text-xs"
                >
                  {isExecuting ? '...' : action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            {formatTimestamp(notification.timestamp)}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Notification system component
 */
export function NotificationSystem({
  notifications,
  onMarkAsRead,
  onClearAll,
  onExecuteAction,
  className,
}: NotificationSystemProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Mark notifications as read when dropdown opens
  useEffect(() => {
    if (isOpen) {
      notifications
        .filter(n => !n.read && !n.persistent)
        .forEach(n => onMarkAsRead(n.id))
    }
  }, [isOpen, notifications, onMarkAsRead])

  const unreadCount = notifications.filter(n => !n.read).length
  const visibleNotifications = notifications.slice(0, 10) // Show last 10

  const handleClearAll = () => {
    onClearAll()
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('relative h-8 w-8 p-0', className)}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="font-medium">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-2 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>

          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-7 px-2 text-xs"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Notifications list */}
        {visibleNotifications.length > 0 ? (
          <ScrollArea className="h-80">
            <div className="p-2 space-y-2">
              {visibleNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onExecuteAction={onExecuteAction}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        )}

        {/* Footer */}
        {notifications.length > 10 && (
          <div className="p-2 border-t text-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-gray-500"
            >
              View all notifications ({notifications.length})
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Simple toast notification for temporary messages
 */
export function ToastNotification({
  notification,
  onClose,
  onExecuteAction,
}: {
  notification: Notification
  onClose: () => void
  onExecuteAction?: (action: NotificationAction) => void
}) {
  const [isVisible, setIsVisible] = useState(true)
  const [isExecuting, setIsExecuting] = useState(false)

  // Auto-hide after 5 seconds for non-persistent notifications
  useEffect(() => {
    if (!notification.persistent) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for exit animation
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [notification.persistent, onClose])

  const handleActionClick = async (action: NotificationAction) => {
    if (isExecuting) return

    setIsExecuting(true)
    try {
      await action.action()
      onExecuteAction?.(action)
    } catch (error) {
      console.error('Error executing toast action:', error)
    } finally {
      setIsExecuting(false)
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg transition-all duration-300 max-w-sm',
        getNotificationClasses(notification.type),
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-200"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Actions */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {notification.actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant === 'primary' ? 'default' : 'outline'}
                  size="sm"
                  disabled={isExecuting}
                  onClick={() => handleActionClick(action)}
                  className="h-7 px-3 text-xs"
                >
                  {isExecuting ? '...' : action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Toast container for managing multiple toast notifications
 */
export function ToastContainer({
  notifications,
  onClose,
  onExecuteAction,
}: {
  notifications: Notification[]
  onClose: (id: string) => void
  onExecuteAction?: (id: string, action: NotificationAction) => void
}) {
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onClose={() => onClose(notification.id)}
          onExecuteAction={(action) => onExecuteAction?.(notification.id, action)}
        />
      ))}
    </div>
  )
}

/**
 * Hook for managing toast notifications
 */
export function useToastNotifications() {
  const [toasts, setToasts] = useState<Notification[]>([])

  const addToast = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      persistent?: boolean
      actions?: NotificationAction[]
      metadata?: Record<string, unknown>
    }
  ) => {
    const toast: Notification = {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      persistent: options?.persistent || false,
      actions: options?.actions,
      metadata: options?.metadata,
    }

    setToasts(prev => [toast, ...prev].slice(0, 5)) // Keep last 5 toasts
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
  }
}