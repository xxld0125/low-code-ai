import { useState, useCallback, useEffect, useRef } from 'react'
import { useDesignerStore } from '@/stores/designer/useDesignerStore'
import {
  acquireTableLock,
  releaseTableLock,
  getTableLocks,
  isLockValid,
  extendLock as extendLockApi,
  DEFAULT_LOCK_DURATIONS,
  cleanupExpiredLocks,
} from '@/lib/designer/locking'
import { LockError } from '@/lib/designer/locking'
import type { TableLock, AcquireLockRequest } from '@/types/designer/api'

/**
 * Hook state interface
 */
interface UseTableLockState {
  currentLock: TableLock | null
  isLoading: boolean
  error: string | null
  activeLocks: TableLock[]
  lockStatus: 'idle' | 'acquiring' | 'acquired' | 'releasing' | 'error'
}

/**
 * Hook options interface
 */
interface UseTableLockOptions {
  /** Auto-renew lock before expiration (minutes before expiration) */
  autoRenewMinutes?: number
  /** Show confirmation dialogs for lock operations */
  confirmActions?: boolean
  /** Custom lock duration override */
  defaultDuration?: number
  /** Enable automatic cleanup of expired locks */
  autoCleanup?: boolean
}

/**
 * Return value interface
 */
interface UseTableLockReturn {
  // State
  currentLock: TableLock | null
  isLoading: boolean
  error: string | null
  activeLocks: TableLock[]
  lockStatus: UseTableLockState['lockStatus']
  isLockedByCurrentUser: boolean
  isLockedByOtherUser: boolean
  timeRemaining: number | null // minutes until expiration

  // Actions
  acquireLock: (request: Omit<AcquireLockRequest, 'duration_minutes'>) => Promise<boolean>
  releaseLock: () => Promise<boolean>
  extendLock: (additionalMinutes?: number) => Promise<boolean>
  refreshLocks: () => Promise<void>

  // Utilities
  canEdit: boolean
  getLockOwner: () => string | null
  isLockValid: (lock: TableLock) => boolean
  formatExpirationTime: (lock: TableLock) => string
}

const DEFAULT_OPTIONS: Required<UseTableLockOptions> = {
  autoRenewMinutes: 5,
  confirmActions: true,
  defaultDuration: 30,
  autoCleanup: true,
}

/**
 * Custom hook for managing table locks
 *
 * Provides functionality to acquire, release, extend, and monitor table locks
 * with automatic renewal and cleanup capabilities.
 *
 * @param tableId - The ID of the table to manage locks for
 * @param options - Configuration options for the hook
 * @returns Lock management state and actions
 */
export function useTableLock(
  tableId: string,
  options: UseTableLockOptions = {}
): UseTableLockReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Get project ID and user info from store
  const { projectId, user } = useDesignerStore()

  // State management
  const [state, setState] = useState<UseTableLockState>({
    currentLock: null,
    isLoading: false,
    error: null,
    activeLocks: [],
    lockStatus: 'idle',
  })

  // Refs for cleanup and timers
  const renewalTimerRef = useRef<NodeJS.Timeout | null>(null)
  const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Clear existing timers
  const clearTimers = useCallback(() => {
    if (renewalTimerRef.current) {
      clearInterval(renewalTimerRef.current)
      renewalTimerRef.current = null
    }
    if (cleanupTimerRef.current) {
      clearInterval(cleanupTimerRef.current)
      cleanupTimerRef.current = null
    }
  }, [])

  // Update state helper
  const updateState = useCallback((updates: Partial<UseTableLockState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Set error helper
  const setError = useCallback(
    (error: string | null) => {
      updateState({ error, lockStatus: error ? 'error' : 'idle' })
    },
    [updateState]
  )

  // Calculate time remaining until lock expiration
  const getTimeRemaining = useCallback((lock: TableLock | null): number | null => {
    if (!lock) return null

    const now = new Date()
    const expiration = new Date(lock.expires_at)
    const remaining = expiration.getTime() - now.getTime()

    return remaining > 0 ? Math.floor(remaining / (1000 * 60)) : 0
  }, [])

  // Check if current user owns the lock
  const isLockedByCurrentUser = Boolean(
    state.currentLock && user && state.currentLock.user_id === user.id
  )

  // Check if lock is owned by another user
  const isLockedByOtherUser = Boolean(
    state.currentLock && user && state.currentLock.user_id !== user.id
  )

  // Check if user can edit the table
  const canEdit = !state.currentLock || isLockedByCurrentUser

  // Get lock owner display name
  const getLockOwner = useCallback((): string | null => {
    if (!state.currentLock) return null

    // If we have user metadata, use it
    if (state.currentLock.user?.user_metadata?.name) {
      return String(state.currentLock.user.user_metadata.name)
    }

    // Fall back to email
    if (state.currentLock.user?.email) {
      return state.currentLock.user.email
    }

    // Fallback to generic message
    return isLockedByCurrentUser ? 'You' : 'Another user'
  }, [state.currentLock, isLockedByCurrentUser])

  // Format expiration time for display
  const formatExpirationTime = useCallback((lock: TableLock): string => {
    const expiration = new Date(lock.expires_at)
    const now = new Date()
    const diff = expiration.getTime() - now.getTime()

    if (diff <= 0) return 'Expired'

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    }

    return `${minutes}m`
  }, [])

  // Refresh active locks for the table
  const refreshLocks = useCallback(async (): Promise<void> => {
    if (!projectId) return

    try {
      const locks = await getTableLocks(projectId, tableId)
      setState(prev => ({ ...prev, activeLocks: locks }))

      // Update current lock if it's still active
      if (state.currentLock) {
        const currentLockStillActive = locks.find(lock => lock.id === state.currentLock!.id)
        if (!currentLockStillActive || !isLockValid(currentLockStillActive)) {
          setState(prev => ({
            ...prev,
            currentLock: null,
            lockStatus: 'idle',
          }))
        } else if (currentLockStillActive.expires_at !== state.currentLock.expires_at) {
          setState(prev => ({
            ...prev,
            currentLock: currentLockStillActive,
          }))
        }
      }
    } catch (error) {
      console.error('Failed to refresh locks:', error)
    }
  }, [projectId, tableId, state.currentLock])

  // Acquire a new lock
  const acquireLock = useCallback(
    async (request: Omit<AcquireLockRequest, 'duration_minutes'>): Promise<boolean> => {
      if (!projectId || !user) {
        setError('User not authenticated or project not selected')
        return false
      }

      updateState({ isLoading: true, error: null, lockStatus: 'acquiring' })

      try {
        const lockRequest: AcquireLockRequest = {
          ...request,
          duration_minutes: opts.defaultDuration,
        }

        const response = await acquireTableLock(projectId, tableId, lockRequest)

        setState(prev => ({
          ...prev,
          currentLock: response.data,
          isLoading: false,
          error: null,
          lockStatus: 'acquired',
        }))

        // Refresh active locks
        await refreshLocks()

        return true
      } catch (error) {
        const errorMessage = error instanceof LockError ? error.message : 'Failed to acquire lock'
        setError(errorMessage)
        updateState({ isLoading: false })
        return false
      }
    },
    [projectId, tableId, user, opts.defaultDuration, setError, updateState, refreshLocks]
  )

  // Release current lock
  const releaseLock = useCallback(async (): Promise<boolean> => {
    if (!state.currentLock || !projectId) {
      setError('No lock to release')
      return false
    }

    if (opts.confirmActions && !window.confirm('Are you sure you want to release this lock?')) {
      return false
    }

    updateState({ isLoading: true, error: null, lockStatus: 'releasing' })

    try {
      await releaseTableLock(projectId, tableId, state.currentLock.lock_token)

      setState(prev => ({
        ...prev,
        currentLock: null,
        isLoading: false,
        error: null,
        lockStatus: 'idle',
      }))

      // Refresh active locks
      await refreshLocks()

      return true
    } catch (error) {
      const errorMessage = error instanceof LockError ? error.message : 'Failed to release lock'
      setError(errorMessage)
      updateState({ isLoading: false })
      return false
    }
  }, [
    state.currentLock,
    projectId,
    tableId,
    opts.confirmActions,
    setError,
    updateState,
    refreshLocks,
  ])

  // Extend current lock
  const extendLock = useCallback(
    async (additionalMinutes = 30): Promise<boolean> => {
      if (!state.currentLock || !projectId) {
        setError('No lock to extend')
        return false
      }

      if (!isLockedByCurrentUser) {
        setError('You can only extend your own locks')
        return false
      }

      updateState({ isLoading: true, error: null })

      try {
        const extendedLock = await extendLockApi(
          projectId,
          tableId,
          state.currentLock.lock_token,
          additionalMinutes
        )

        setState(prev => ({
          ...prev,
          currentLock: extendedLock,
          isLoading: false,
          error: null,
        }))

        return true
      } catch (error) {
        const errorMessage = error instanceof LockError ? error.message : 'Failed to extend lock'
        setError(errorMessage)
        updateState({ isLoading: false })
        return false
      }
    },
    [state.currentLock, projectId, tableId, isLockedByCurrentUser, setError, updateState]
  )

  // Auto-renewal logic
  useEffect(() => {
    clearTimers()

    if (state.currentLock && isLockedByCurrentUser && opts.autoRenewMinutes > 0) {
      const timeRemaining = getTimeRemaining(state.currentLock)

      if (timeRemaining && timeRemaining <= opts.autoRenewMinutes && timeRemaining > 0) {
        // Set up renewal timer
        renewalTimerRef.current = setInterval(async () => {
          const currentRemaining = getTimeRemaining(state.currentLock)
          if (
            currentRemaining &&
            currentRemaining <= opts.autoRenewMinutes &&
            state.currentLock &&
            projectId
          ) {
            const lockType = state.currentLock.lock_type
            const lockToken = state.currentLock.lock_token
            if (lockType && lockToken) {
              await extendLockApi(projectId, tableId, lockToken!, DEFAULT_LOCK_DURATIONS[lockType])
            }
          }
        }, 60000) // Check every minute
      }
    }

    return clearTimers
  }, [
    state.currentLock,
    isLockedByCurrentUser,
    opts.autoRenewMinutes,
    getTimeRemaining,
    extendLock,
    clearTimers,
    projectId,
    tableId,
  ])

  // Auto-cleanup logic
  useEffect(() => {
    clearTimers()

    if (opts.autoCleanup) {
      cleanupTimerRef.current = setInterval(async () => {
        try {
          await cleanupExpiredLocks()
          await refreshLocks()
        } catch (error) {
          console.error('Auto-cleanup failed:', error)
        }
      }, 300000) // Run every 5 minutes
    }

    return clearTimers
  }, [opts.autoCleanup, refreshLocks, clearTimers])

  // Initial load and periodic refresh
  useEffect(() => {
    refreshLocks()

    // Refresh locks every 30 seconds
    const refreshInterval = setInterval(refreshLocks, 30000)

    return () => {
      clearInterval(refreshInterval)
      clearTimers()
    }
  }, [refreshLocks, clearTimers])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [clearTimers])

  return {
    // State
    currentLock: state.currentLock,
    isLoading: state.isLoading,
    error: state.error,
    activeLocks: state.activeLocks,
    lockStatus: state.lockStatus,
    isLockedByCurrentUser,
    isLockedByOtherUser,
    timeRemaining: getTimeRemaining(state.currentLock),

    // Actions
    acquireLock,
    releaseLock,
    extendLock,
    refreshLocks,

    // Utilities
    canEdit,
    getLockOwner,
    isLockValid,
    formatExpirationTime,
  }
}

/**
 * Hook for managing multiple table locks (for batch operations)
 */
export function useMultipleTableLocks(tableIds: string[], options: UseTableLockOptions = {}) {
  const [lockStates, setLockStates] = useState<Record<string, UseTableLockReturn>>({})
  const [isBatchOperating, setIsBatchOperating] = useState(false)
  const [batchError, setBatchError] = useState<string | null>(null)

  // Initialize hooks for each table
  useEffect(() => {
    const states: Record<string, UseTableLockReturn> = {}

    tableIds.forEach(tableId => {
      // Note: In a real implementation, you'd need to handle this differently
      // since hooks can't be called conditionally. This is a simplified example.
      if (!lockStates[tableId]) {
        // states[tableId] = useTableLock(tableId, options)
      }
    })

    setLockStates(states)
  }, [tableIds, options, lockStates])

  const acquireBatchLocks = useCallback(
    async (
      request: Omit<AcquireLockRequest, 'duration_minutes'>
    ): Promise<{ successful: string[]; failed: string[] }> => {
      setIsBatchOperating(true)
      setBatchError(null)

      const successful: string[] = []
      const failed: string[] = []

      try {
        // Try to acquire locks for all tables
        const promises = tableIds.map(async tableId => {
          try {
            const hook = lockStates[tableId]
            if (hook && (await hook.acquireLock(request))) {
              successful.push(tableId)
            } else {
              failed.push(tableId)
            }
          } catch {
            failed.push(tableId)
          }
        })

        await Promise.all(promises)
      } catch (error) {
        setBatchError(error instanceof Error ? error.message : 'Batch lock acquisition failed')
      } finally {
        setIsBatchOperating(false)
      }

      return { successful, failed }
    },
    [tableIds, lockStates]
  )

  const releaseBatchLocks = useCallback(async (): Promise<{
    successful: string[]
    failed: string[]
  }> => {
    setIsBatchOperating(true)
    setBatchError(null)

    const successful: string[] = []
    const failed: string[] = []

    try {
      const promises = Object.entries(lockStates).map(async ([tableId, hook]) => {
        try {
          if (await hook.releaseLock()) {
            successful.push(tableId)
          } else {
            failed.push(tableId)
          }
        } catch {
          failed.push(tableId)
        }
      })

      await Promise.all(promises)
    } catch (error) {
      setBatchError(error instanceof Error ? error.message : 'Batch lock release failed')
    } finally {
      setIsBatchOperating(false)
    }

    return { successful, failed }
  }, [lockStates])

  return {
    lockStates,
    isBatchOperating,
    batchError,
    acquireBatchLocks,
    releaseBatchLocks,
  }
}
