import { createClient } from '@/lib/supabase/client'
import type { TableLock, AcquireLockRequest, AcquireLockResponse } from '@/types/designer/api'

/**
 * Lock management error types
 */
export class LockError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'LockError'
  }
}

/**
 * Lock type constants with descriptions
 */
export const LOCK_TYPES = {
  OPTIMISTIC: 'optimistic' as const,
  PESSIMISTIC: 'pessimistic' as const,
  CRITICAL: 'critical' as const,
} as const

export const LOCK_DESCRIPTIONS = {
  [LOCK_TYPES.OPTIMISTIC]: 'Short-term lock for field edits (30 minutes default)',
  [LOCK_TYPES.PESSIMISTIC]: 'Long-term lock for schema changes (2 hours default)',
  [LOCK_TYPES.CRITICAL]: 'Lock for breaking changes (4 hours default)',
} as const

/**
 * Default lock durations by type (in minutes)
 */
export const DEFAULT_LOCK_DURATIONS = {
  [LOCK_TYPES.OPTIMISTIC]: 30,
  [LOCK_TYPES.PESSIMISTIC]: 120,
  [LOCK_TYPES.CRITICAL]: 240,
} as const

/**
 * Maximum allowed lock duration (in minutes)
 */
export const MAX_LOCK_DURATION = 480 // 8 hours

/**
 * Lock status constants
 */
export const LOCK_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  RELEASED: 'released',
} as const

/**
 * Generate a unique lock token
 */
export function generateLockToken(): string {
  return crypto.randomUUID()
}

/**
 * Calculate lock expiration time
 */
export function calculateLockExpiration(
  lockType: AcquireLockRequest['lock_type'],
  customDuration?: number
): Date {
  const duration = customDuration || DEFAULT_LOCK_DURATIONS[lockType]
  const maxDuration = Math.min(duration, MAX_LOCK_DURATION)

  const expiration = new Date()
  expiration.setMinutes(expiration.getMinutes() + maxDuration)

  return expiration
}

/**
 * Check if a lock is expired
 */
export function isLockExpired(lock: TableLock): boolean {
  return new Date(lock.expires_at) < new Date()
}

/**
 * Check if a lock is still valid (not expired)
 */
export function isLockValid(lock: TableLock): boolean {
  return !isLockExpired(lock)
}

/**
 * Validate lock request parameters
 */
export function validateLockRequest(request: AcquireLockRequest): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Validate lock type
  if (!Object.values(LOCK_TYPES).includes(request.lock_type)) {
    errors.push(`Invalid lock type: ${request.lock_type}`)
  }

  // Validate reason
  if (!request.reason || request.reason.trim().length === 0) {
    errors.push('Lock reason is required')
  }

  if (request.reason.length > 200) {
    errors.push('Lock reason must be 200 characters or less')
  }

  // Validate duration
  if (request.duration_minutes !== undefined) {
    if (request.duration_minutes <= 0) {
      errors.push('Lock duration must be positive')
    }

    if (request.duration_minutes > MAX_LOCK_DURATION) {
      errors.push(`Lock duration cannot exceed ${MAX_LOCK_DURATION} minutes`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Acquire a table lock
 */
export async function acquireTableLock(
  projectId: string,
  tableId: string,
  request: AcquireLockRequest
): Promise<AcquireLockResponse> {
  const supabase = createClient()

  // Validate request
  const validation = validateLockRequest(request)
  if (!validation.isValid) {
    throw new LockError('Invalid lock request', 'INVALID_REQUEST', { errors: validation.errors })
  }

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new LockError('User not authenticated', 'UNAUTHORIZED')
    }

    // Check if table exists and user has access
    const { data: table, error: tableError } = await supabase
      .from('data_tables')
      .select('id, name, status')
      .eq('id', tableId)
      .eq('project_id', projectId)
      .single()

    if (tableError || !table) {
      throw new LockError('Table not found or access denied', 'NOT_FOUND')
    }

    // Check for existing active locks
    const { data: existingLocks, error: lockCheckError } = await supabase
      .from('table_locks')
      .select('*')
      .eq('table_id', tableId)
      .or('expires_at.gt.now(),locked_at.gt.now()')
      .order('created_at', { ascending: false })
      .limit(1)

    if (lockCheckError) {
      throw new LockError('Failed to check existing locks', 'DATABASE_ERROR', {
        originalError: lockCheckError,
      })
    }

    // Check if any existing lock is still valid
    const activeLock = existingLocks?.find(lock => isLockValid(lock as TableLock))
    if (activeLock) {
      const lockOwner = activeLock.user_id === user.id ? 'you' : 'another user'
      throw new LockError(`Table is already locked by ${lockOwner}`, 'ALREADY_LOCKED', {
        lockId: activeLock.id,
        lockType: activeLock.lock_type,
        expiresAt: activeLock.expires_at,
        isOwnLock: activeLock.user_id === user.id,
      })
    }

    // Create new lock
    const lockToken = generateLockToken()
    const expiresAt = calculateLockExpiration(request.lock_type, request.duration_minutes)

    const { data: newLock, error: insertError } = await supabase
      .from('table_locks')
      .insert({
        table_id: tableId,
        user_id: user.id,
        lock_token: lockToken,
        lock_type: request.lock_type,
        locked_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        reason: request.reason.trim(),
      })
      .select()
      .single()

    if (insertError || !newLock) {
      throw new LockError('Failed to acquire lock', 'LOCK_ACQUISITION_FAILED', {
        originalError: insertError,
      })
    }

    return {
      data: newLock as TableLock,
    }
  } catch (error) {
    if (error instanceof LockError) {
      throw error
    }

    console.error('Unexpected error in acquireTableLock:', error)
    throw new LockError('Unexpected error occurred while acquiring lock', 'UNEXPECTED_ERROR', {
      originalError: error,
    })
  }
}

/**
 * Release a table lock
 */
export async function releaseTableLock(
  projectId: string,
  tableId: string,
  lockToken: string
): Promise<void> {
  const supabase = createClient()

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new LockError('User not authenticated', 'UNAUTHORIZED')
    }

    // Find and validate the lock
    const { data: lock, error: findError } = await supabase
      .from('table_locks')
      .select('*')
      .eq('table_id', tableId)
      .eq('lock_token', lockToken)
      .single()

    if (findError || !lock) {
      throw new LockError('Lock not found', 'NOT_FOUND')
    }

    // Check if user owns the lock (or is admin)
    if (lock.user_id !== user.id) {
      throw new LockError('You can only release your own locks', 'FORBIDDEN')
    }

    // Delete the lock
    const { error: deleteError } = await supabase.from('table_locks').delete().eq('id', lock.id)

    if (deleteError) {
      throw new LockError('Failed to release lock', 'LOCK_RELEASE_FAILED', {
        originalError: deleteError,
      })
    }
  } catch (error) {
    if (error instanceof LockError) {
      throw error
    }

    console.error('Unexpected error in releaseTableLock:', error)
    throw new LockError('Unexpected error occurred while releasing lock', 'UNEXPECTED_ERROR', {
      originalError: error,
    })
  }
}

/**
 * Get active locks for a table
 */
export async function getTableLocks(projectId: string, tableId: string): Promise<TableLock[]> {
  const supabase = createClient()

  try {
    const { data: locks, error } = await supabase
      .from('table_locks')
      .select(
        `
        *,
        user:users(id, email, user_metadata)
      `
      )
      .eq('table_id', tableId)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      throw new LockError('Failed to fetch table locks', 'DATABASE_ERROR', { originalError: error })
    }

    // Filter out expired locks and return active ones
    return (locks || []).filter(lock => isLockValid(lock as TableLock)) as TableLock[]
  } catch (error) {
    if (error instanceof LockError) {
      throw error
    }

    console.error('Unexpected error in getTableLocks:', error)
    throw new LockError('Unexpected error occurred while fetching locks', 'UNEXPECTED_ERROR', {
      originalError: error,
    })
  }
}

/**
 * Cleanup expired locks (maintenance function)
 */
export async function cleanupExpiredLocks(): Promise<number> {
  const supabase = createClient()

  try {
    const { count, error } = await supabase
      .from('table_locks')
      .delete({ count: 'exact' })
      .lt('expires_at', new Date().toISOString())

    if (error) {
      throw new LockError('Failed to cleanup expired locks', 'DATABASE_ERROR', {
        originalError: error,
      })
    }

    return count || 0
  } catch (error) {
    if (error instanceof LockError) {
      throw error
    }

    console.error('Unexpected error in cleanupExpiredLocks:', error)
    throw new LockError('Unexpected error occurred during cleanup', 'UNEXPECTED_ERROR', {
      originalError: error,
    })
  }
}

/**
 * Extend an existing lock's expiration time
 */
export async function extendLock(
  projectId: string,
  tableId: string,
  lockToken: string,
  additionalMinutes: number
): Promise<TableLock> {
  const supabase = createClient()

  try {
    // Validate additional minutes
    if (additionalMinutes <= 0 || additionalMinutes > 120) {
      throw new LockError('Additional minutes must be between 1 and 120', 'INVALID_DURATION')
    }

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new LockError('User not authenticated', 'UNAUTHORIZED')
    }

    // Find the lock
    const { data: lock, error: findError } = await supabase
      .from('table_locks')
      .select('*')
      .eq('table_id', tableId)
      .eq('lock_token', lockToken)
      .single()

    if (findError || !lock) {
      throw new LockError('Lock not found', 'NOT_FOUND')
    }

    // Check if user owns the lock
    if (lock.user_id !== user.id) {
      throw new LockError('You can only extend your own locks', 'FORBIDDEN')
    }

    // Check if lock is still valid
    if (!isLockValid(lock as TableLock)) {
      throw new LockError('Cannot extend expired lock', 'LOCK_EXPIRED')
    }

    // Calculate new expiration time
    const currentExpiration = new Date(lock.expires_at)
    const newExpiration = new Date(currentExpiration.getTime() + additionalMinutes * 60 * 1000)

    // Ensure we don't exceed maximum duration from creation time
    const maxExpiration = new Date(lock.locked_at)
    maxExpiration.setMinutes(maxExpiration.getMinutes() + MAX_LOCK_DURATION)

    const finalExpiration = newExpiration > maxExpiration ? maxExpiration : newExpiration

    // Update the lock
    const { data: updatedLock, error: updateError } = await supabase
      .from('table_locks')
      .update({
        expires_at: finalExpiration.toISOString(),
      })
      .eq('id', lock.id)
      .select()
      .single()

    if (updateError || !updatedLock) {
      throw new LockError('Failed to extend lock', 'LOCK_EXTENSION_FAILED', {
        originalError: updateError,
      })
    }

    return updatedLock as TableLock
  } catch (error) {
    if (error instanceof LockError) {
      throw error
    }

    console.error('Unexpected error in extendLock:', error)
    throw new LockError('Unexpected error occurred while extending lock', 'UNEXPECTED_ERROR', {
      originalError: error,
    })
  }
}
