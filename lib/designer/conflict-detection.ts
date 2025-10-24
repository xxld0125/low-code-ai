import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TableLock, DataTable, DataField } from '@/types/designer/api'
import { isLockValid } from './locking'

interface DatabasePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: T
  old?: T
  [key: string]: unknown
}

/**
 * Conflict types
 */
export enum ConflictType {
  TABLE_LOCKED = 'table_locked',
  SCHEMA_MODIFIED = 'schema_modified',
  FIELD_CONFLICT = 'field_conflict',
  RELATIONSHIP_CONFLICT = 'relationship_conflict',
  CONCURRENT_EDIT = 'concurrent_edit',
  PERMISSION_DENIED = 'permission_denied',
  RESOURCE_DELETED = 'resource_deleted',
}

/**
 * Conflict severity levels
 */
export enum ConflictSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Conflict resolution strategies
 */
export enum ConflictResolution {
  FORCE_OVERRIDE = 'force_override',
  MERGE_CHANGES = 'merge_changes',
  RENAME_RESOURCE = 'rename_resource',
  REQUEST_LOCK = 'request_lock',
  CANCEL_OPERATION = 'cancel_operation',
  SAVE_AS_COPY = 'save_as_copy',
}

/**
 * Conflict interface
 */
export interface Conflict {
  id: string
  type: ConflictType
  severity: ConflictSeverity
  title: string
  description: string
  details: Record<string, unknown>
  resolution?: ConflictResolution
  createdAt: Date
  resourceId?: string
  resourceType?: 'table' | 'field' | 'relationship'
  conflictingUserId?: string
  conflictingUserData?: {
    name: string
    email: string
    avatar?: string
  }
}

/**
 * Notification types
 */
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  CONFLICT = 'conflict',
}

/**
 * Notification interface
 */
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
  persistent: boolean
  actions?: NotificationAction[]
  metadata?: Record<string, unknown>
}

/**
 * Notification action interface
 */
export interface NotificationAction {
  label: string
  action: () => void | Promise<void>
  variant?: 'primary' | 'secondary' | 'destructive'
}

/**
 * Conflict detection result
 */
export interface ConflictDetectionResult {
  conflicts: Conflict[]
  warnings: Conflict[]
  canProceed: boolean
  suggestedResolution?: ConflictResolution
}

/**
 * Real-time event types
 */
export enum RealTimeEventType {
  TABLE_LOCKED = 'table_locked',
  TABLE_UNLOCKED = 'table_unlocked',
  TABLE_MODIFIED = 'table_modified',
  FIELD_MODIFIED = 'field_modified',
  RELATIONSHIP_MODIFIED = 'relationship_modified',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
}

/**
 * Real-time event interface
 */
export interface RealTimeEvent {
  id: string
  type: RealTimeEventType
  payload: Record<string, unknown>
  userId: string
  timestamp: Date
  projectId: string
}

/**
 * Conflict detector class
 */
export class ConflictDetector {
  private supabase = createClient()
  private eventListeners: Map<RealTimeEventType, ((event: RealTimeEvent) => void)[]> = new Map()
  private notificationListeners: ((notification: Notification) => void)[] = []

  constructor() {
    this.setupRealtimeSubscription()
  }

  /**
   * Setup real-time subscriptions for conflict detection
   */
  private setupRealtimeSubscription() {
    const channel = this.supabase
      .channel('designer-conflicts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'table_locks',
        },
        (payload) => this.handleTableLockChange(payload)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'data_tables',
        },
        (payload) => this.handleTableChange(payload)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'data_fields',
        },
        (payload) => this.handleFieldChange(payload)
      )
      .subscribe()

    return () => {
      this.supabase.removeChannel(channel)
    }
  }

  /**
   * Handle table lock changes
   */
  private handleTableLockChange(payload: DatabasePayload<TableLock>) {
    const { eventType, new: newRecord, old: oldRecord } = payload

    if (eventType === 'INSERT') {
      this.emitRealTimeEvent({
        id: crypto.randomUUID(),
        type: RealTimeEventType.TABLE_LOCKED,
        payload: { lock: newRecord },
        userId: newRecord.user_id,
        timestamp: new Date(),
        projectId: newRecord.project_id,
      })
    } else if (eventType === 'DELETE') {
      this.emitRealTimeEvent({
        id: crypto.randomUUID(),
        type: RealTimeEventType.TABLE_UNLOCKED,
        payload: { lock: oldRecord },
        userId: oldRecord.user_id,
        timestamp: new Date(),
        projectId: oldRecord.project_id,
      })
    }
  }

  /**
   * Handle table changes
   */
  private handleTableChange(payload: DatabasePayload<DataTable>) {
    const { eventType, new: newRecord, old: oldRecord } = payload

    if (eventType === 'UPDATE') {
      this.emitRealTimeEvent({
        id: crypto.randomUUID(),
        type: RealTimeEventType.TABLE_MODIFIED,
        payload: { oldTable: oldRecord, newTable: newRecord },
        userId: newRecord.updated_by || oldRecord.updated_by,
        timestamp: new Date(),
        projectId: newRecord.project_id,
      })
    }
  }

  /**
   * Handle field changes
   */
  private handleFieldChange(payload: DatabasePayload<DataField>) {
    const { eventType, new: newRecord, old: oldRecord } = payload

    if (eventType === 'UPDATE') {
      this.emitRealTimeEvent({
        id: crypto.randomUUID(),
        type: RealTimeEventType.FIELD_MODIFIED,
        payload: { oldField: oldRecord, newField: newRecord },
        userId: newRecord.updated_by || oldRecord.updated_by,
        timestamp: new Date(),
        projectId: newRecord.project_id,
      })
    }
  }

  /**
   * Emit real-time event to listeners
   */
  private emitRealTimeEvent(event: RealTimeEvent) {
    const listeners = this.eventListeners.get(event.type) || []
    listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in real-time event listener:', error)
      }
    })
  }

  /**
   * Add real-time event listener
   */
  public addEventListener(
    eventType: RealTimeEventType,
    listener: (event: RealTimeEvent) => void
  ) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    this.eventListeners.get(eventType)!.push(listener)

    return () => {
      const listeners = this.eventListeners.get(eventType)
      if (listeners) {
        const index = listeners.indexOf(listener)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    }
  }

  /**
   * Add notification listener
   */
  public addNotificationListener(listener: (notification: Notification) => void) {
    this.notificationListeners.push(listener)

    return () => {
      const index = this.notificationListeners.indexOf(listener)
      if (index > -1) {
        this.notificationListeners.splice(index, 1)
      }
    }
  }

  /**
   * Emit notification to all listeners
   */
  private emitNotification(notification: Notification) {
    this.notificationListeners.forEach(listener => {
      try {
        listener(notification)
      } catch (error) {
        console.error('Error in notification listener:', error)
      }
    })
  }

  /**
   * Detect conflicts for table operations
   */
  public async detectTableConflicts(
    projectId: string,
    tableId: string,
    operation: 'create' | 'update' | 'delete',
    changes?: Partial<DataTable>
  ): Promise<ConflictDetectionResult> {
    const conflicts: Conflict[] = []

    try {
      // Check for active locks
      const { data: locks } = await this.supabase
        .from('table_locks')
        .select('*, user:users(id, email, user_metadata)')
        .eq('table_id', tableId)
        .gte('expires_at', new Date().toISOString())

      if (locks && locks.length > 0) {
        const activeLock = locks.find(lock => isLockValid(lock as TableLock))
        if (activeLock) {
          const { data: { user } } = await this.supabase.auth.getUser()
          const isOwnLock = activeLock.user_id === user?.id

          conflicts.push({
            id: crypto.randomUUID(),
            type: ConflictType.TABLE_LOCKED,
            severity: isOwnLock ? ConflictSeverity.LOW : ConflictSeverity.HIGH,
            title: isOwnLock ? 'Table is locked by you' : 'Table is locked by another user',
            description: isOwnLock
              ? 'You have an active lock on this table. The operation will proceed.'
              : `Table is locked by ${activeLock.user?.user_metadata?.name || activeLock.user?.email || 'another user'}.`,
            details: {
              lock: activeLock,
              lockType: activeLock.lock_type,
              expiresAt: activeLock.expires_at,
              isOwnLock,
            },
            createdAt: new Date(),
            resourceId: tableId,
            resourceType: 'table',
            conflictingUserId: activeLock.user_id,
            conflictingUserData: {
              name: activeLock.user?.user_metadata?.name || activeLock.user?.email || 'Unknown User',
              email: activeLock.user?.email || '',
            },
          })
        }
      }

      // Check for concurrent modifications
      if (operation === 'update' && changes) {
        const { data: currentTable } = await this.supabase
          .from('data_tables')
          .select('updated_at, updated_by, user:users(id, email, user_metadata)')
          .eq('id', tableId)
          .single()

        if (currentTable && Array.isArray(currentTable.user) && currentTable.user.length > 0) {
          const lastUpdate = new Date(currentTable.updated_at)
          const userLastSeen = localStorage.getItem(`table_${tableId}_last_seen`)

          if (userLastSeen) {
            const lastSeenTime = new Date(userLastSeen)
            if (lastUpdate > lastSeenTime) {
              const { data: { user } } = await this.supabase.auth.getUser()
              const userData = currentTable.user[0]

              if (currentTable.updated_by !== user?.id) {
                warnings.push({
                  id: crypto.randomUUID(),
                  type: ConflictType.CONCURRENT_EDIT,
                  severity: ConflictSeverity.MEDIUM,
                  title: 'Table was modified by another user',
                  description: `${userData.user_metadata?.name || userData.email || 'Another user'} modified this table since you last viewed it.`,
                  details: {
                    lastModified: currentTable.updated_at,
                    modifiedBy: userData,
                  },
                  createdAt: new Date(),
                  resourceId: tableId,
                  resourceType: 'table',
                  conflictingUserId: currentTable.updated_by,
                  conflictingUserData: {
                    name: userData.user_metadata?.name || userData.email || 'Unknown User',
                    email: userData.email || '',
                  },
                })
              }
            }
          }
        }
      }

      // Check for name conflicts
      if (operation === 'create' || (operation === 'update' && changes?.name)) {
        const tableName = changes?.name || changes?.table_name

        if (tableName) {
          const { data: existingTable } = await this.supabase
            .from('data_tables')
            .select('id, name, table_name')
            .eq('project_id', projectId)
            .eq('table_name', tableName)
            .neq('id', tableId) // For updates, exclude current table
            .single()

          if (existingTable) {
            conflicts.push({
              id: crypto.randomUUID(),
              type: ConflictType.SCHEMA_MODIFIED,
              severity: ConflictSeverity.HIGH,
              title: 'Table name already exists',
              description: `A table with the name "${tableName}" already exists in this project.`,
              details: {
                conflictingTable: existingTable,
                proposedName: tableName,
              },
              createdAt: new Date(),
              resourceId: tableId,
              resourceType: 'table',
            })
          }
        }
      }

    } catch (error) {
      console.error('Error detecting table conflicts:', error)
    }

    return {
      conflicts,
      warnings,
      canProceed: conflicts.length === 0,
      suggestedResolution: this.suggestResolution(conflicts),
    }
  }

  /**
   * Detect conflicts for field operations
   */
  public async detectFieldConflicts(
    projectId: string,
    tableId: string,
    fieldId: string,
    operation: 'create' | 'update' | 'delete',
    changes?: Partial<DataField>
  ): Promise<ConflictDetectionResult> {
    const conflicts: Conflict[] = []

    try {
      // Check if table is locked
      const { data: locks } = await this.supabase
        .from('table_locks')
        .select('*')
        .eq('table_id', tableId)
        .gte('expires_at', new Date().toISOString())

      if (locks && locks.length > 0) {
        const activeLock = locks.find(lock => isLockValid(lock as TableLock))
        if (activeLock) {
          const { data: { user } } = await this.supabase.auth.getUser()
          const isOwnLock = activeLock.user_id === user?.id

          if (!isOwnLock) {
            conflicts.push({
              id: crypto.randomUUID(),
              type: ConflictType.TABLE_LOCKED,
              severity: ConflictSeverity.HIGH,
              title: 'Cannot modify field - table is locked',
              description: `Table is locked by ${activeLock.user?.user_metadata?.name || 'another user'}.`,
              details: {
                lock: activeLock,
                operation: 'field_modification',
              },
              createdAt: new Date(),
              resourceId: fieldId,
              resourceType: 'field',
              conflictingUserId: activeLock.user_id,
            })
          }
        }
      }

      // Check for field name conflicts
      if (operation === 'create' || (operation === 'update' && changes?.name)) {
        const fieldName = changes?.name || changes?.field_name

        if (fieldName) {
          const { data: existingField } = await this.supabase
            .from('data_fields')
            .select('id, name, field_name')
            .eq('table_id', tableId)
            .eq('field_name', fieldName)
            .neq('id', fieldId) // For updates, exclude current field
            .single()

          if (existingField) {
            conflicts.push({
              id: crypto.randomUUID(),
              type: ConflictType.FIELD_CONFLICT,
              severity: ConflictSeverity.HIGH,
              title: 'Field name already exists',
              description: `A field with the name "${fieldName}" already exists in this table.`,
              details: {
                conflictingField: existingField,
                proposedName: fieldName,
              },
              createdAt: new Date(),
              resourceId: fieldId,
              resourceType: 'field',
            })
          }
        }
      }

      // Check if field is used in relationships
      if (operation === 'delete' || (operation === 'update' && changes?.field_name)) {
        const { data: relationships } = await this.supabase
          .from('table_relationships')
          .select('*')
          .or(`source_field_id.eq.${fieldId},target_field_id.eq.${fieldId}`)

        if (relationships && relationships.length > 0) {
          conflicts.push({
            id: crypto.randomUUID(),
            type: ConflictType.RELATIONSHIP_CONFLICT,
            severity: ConflictSeverity.CRITICAL,
            title: 'Field is used in relationships',
            description: `This field is used in ${relationships.length} relationship(s) and cannot be modified or deleted.`,
            details: {
              relationships,
              affectedTables: relationships.map(rel => rel.source_table_id).concat(relationships.map(rel => rel.target_table_id)),
            },
            createdAt: new Date(),
            resourceId: fieldId,
            resourceType: 'field',
          })
        }
      }

    } catch (error) {
      console.error('Error detecting field conflicts:', error)
    }

    return {
      conflicts,
      warnings,
      canProceed: conflicts.length === 0,
      suggestedResolution: this.suggestResolution(conflicts),
    }
  }

  /**
   * Suggest resolution strategy based on conflicts
   */
  private suggestResolution(
    conflicts: Conflict[],
  ): ConflictResolution | undefined {
    if (conflicts.length === 0) return undefined

    const hasLockConflict = conflicts.some(c => c.type === ConflictType.TABLE_LOCKED)
    const hasNameConflict = conflicts.some(c =>
      c.type === ConflictType.SCHEMA_MODIFIED || c.type === ConflictType.FIELD_CONFLICT
    )
    const hasRelationshipConflict = conflicts.some(c => c.type === ConflictType.RELATIONSHIP_CONFLICT)

    if (hasRelationshipConflict) {
      return ConflictResolution.CANCEL_OPERATION
    }

    if (hasLockConflict) {
      return ConflictResolution.REQUEST_LOCK
    }

    if (hasNameConflict) {
      return ConflictResolution.RENAME_RESOURCE
    }

    return ConflictResolution.CANCEL_OPERATION
  }

  /**
   * Create and emit notification
   */
  public createNotification(
    type: NotificationType,
    title: string,
    message: string,
    options: {
      persistent?: boolean
      actions?: NotificationAction[]
      metadata?: Record<string, unknown>
    } = {}
  ): Notification {
    const notification: Notification = {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      persistent: options.persistent || false,
      actions: options.actions,
      metadata: options.metadata,
    }

    this.emitNotification(notification)

    return notification
  }

  /**
   * Show conflict notification to user
   */
  public showConflictNotification(conflict: Conflict): void {
    this.createNotification(
      NotificationType.CONFLICT,
      conflict.title,
      conflict.description,
      {
        persistent: conflict.severity === ConflictSeverity.CRITICAL,
        actions: this.createConflictActions(conflict),
        metadata: { conflict },
      }
    )
  }

  /**
   * Create actions for conflict resolution
   */
  private createConflictActions(conflict: Conflict): NotificationAction[] {
    const actions: NotificationAction[] = []

    switch (conflict.type) {
      case ConflictType.TABLE_LOCKED:
        if (conflict.details.isOwnLock) {
          actions.push({
            label: 'Proceed',
            action: async () => {
              // Proceed with operation
              console.log('Proceeding with operation despite own lock')
            },
            variant: 'primary',
          })
        } else {
          actions.push({
            label: 'Request Lock',
            action: async () => {
              // Request lock from other user
              this.createNotification(
                NotificationType.INFO,
                'Lock Requested',
                'A notification has been sent to request the lock.'
              )
            },
            variant: 'primary',
          })
        }
        break

      case ConflictType.SCHEMA_MODIFIED:
      case ConflictType.FIELD_CONFLICT:
        actions.push({
          label: 'Rename',
          action: async () => {
            // Open rename dialog
            console.log('Opening rename dialog')
          },
          variant: 'primary',
        })
        break

      case ConflictType.RELATIONSHIP_CONFLICT:
        actions.push({
          label: 'View Relationships',
          action: async () => {
            // Show affected relationships
            console.log('Showing affected relationships')
          },
          variant: 'primary',
        })
        break

      case ConflictType.CONCURRENT_EDIT:
        actions.push({
          label: 'Review Changes',
          action: async () => {
            // Show what changed
            console.log('Showing changes')
          },
          variant: 'primary',
        })
        actions.push({
          label: 'Proceed Anyway',
          action: async () => {
            // Proceed with overwrite
            console.log('Proceeding with potential overwrite')
          },
          variant: 'secondary',
        })
        break
    }

    actions.push({
      label: 'Cancel',
      action: async () => {
        // Cancel the operation
        console.log('Cancelling operation')
      },
      variant: 'secondary',
    })

    return actions
  }

  /**
   * Update last seen timestamp for a resource
   */
  public updateLastSeen(resourceId: string, resourceType: 'table' | 'field'): void {
    const key = `${resourceType}_${resourceId}_last_seen`
    localStorage.setItem(key, new Date().toISOString())
  }

  /**
   * Get user activity in the project
   */
  public async getActiveUsers(): Promise<Array<{
    id: string
    name: string
    email: string
    avatar?: string
    lastActivity: Date
    currentActivity?: string
  }>> {
    try {
      // This would typically involve querying a user activity table
      // For now, return a placeholder implementation
      return []
    } catch (error) {
      console.error('Error getting active users:', error)
      return []
    }
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.eventListeners.clear()
    this.notificationListeners.length = 0
  }
}

// Global conflict detector instance
export const conflictDetector = new ConflictDetector()

/**
 * Hook for using conflict detection
 */
export function useConflictDetection(projectId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Set up notification listener
    const unsubscribeNotification = conflictDetector.addNotificationListener((notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 50)) // Keep last 50 notifications
    })

    return unsubscribeNotification
  }, [projectId])

  const detectTableConflicts = useCallback(async (
    tableId: string,
    operation: 'create' | 'update' | 'delete',
    changes?: Partial<DataTable>
  ) => {
    return await conflictDetector.detectTableConflicts(projectId, tableId, operation, changes)
  }, [projectId])

  const detectFieldConflicts = useCallback(async (
    tableId: string,
    fieldId: string,
    operation: 'create' | 'update' | 'delete',
    changes?: Partial<DataField>
  ) => {
    return await conflictDetector.detectFieldConflicts(projectId, tableId, fieldId, operation, changes)
  }, [projectId])

  const createNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      persistent?: boolean
      actions?: NotificationAction[]
      metadata?: Record<string, unknown>
    }
  ) => {
    return conflictDetector.createNotification(type, title, message, options)
  }, [])

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    detectTableConflicts,
    detectFieldConflicts,
    createNotification,
    markNotificationAsRead,
    clearNotifications,
  }
}
