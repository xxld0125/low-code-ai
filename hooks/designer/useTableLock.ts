import { useState, useCallback, useRef } from 'react'

/**
 * 表格锁定配置
 */
interface TableLockConfig {
  /** 锁定超时时间（毫秒） */
  lockTimeout?: number
  /** 自动刷新锁的时间间隔（毫秒） */
  refreshInterval?: number
  /** 锁定获取失败回调 */
  onLockFailed?: (error: Error) => void
  /** 锁定丢失回调 */
  onLockLost?: () => void
}

/**
 * 表格锁定状态
 */
interface TableLockState {
  /** 是否已锁定 */
  isLocked: boolean
  /** 锁定用户ID */
  lockUserId: string | null
  /** 锁定用户名 */
  lockUserName: string | null
  /** 锁定时间 */
  lockTime: Date | null
  /** 锁定剩余时间（秒） */
  lockTimeRemaining: number
  /** 是否正在加载 */
  isLoading: boolean
  /** 错误信息 */
  error: string | null
}

/**
 * 表格锁定Hook
 * @param tableId 表格ID
 * @param config 配置选项
 * @returns 锁定状态和控制函数
 */
export function useTableLock(tableId: string | null, config: TableLockConfig = {}) {
  const {
    lockTimeout = 30 * 60 * 1000, // 默认30分钟
    refreshInterval = 60 * 1000, // 默认每分钟刷新一次
    onLockFailed,
    onLockLost,
  } = config

  // 状态管理
  const [state, setState] = useState<TableLockState>({
    isLocked: false,
    lockUserId: null,
    lockUserName: null,
    lockTime: null,
    lockTimeRemaining: 0,
    isLoading: false,
    error: null,
  })

  // 定时器引用
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 获取当前用户ID（实际项目中应该从认证状态获取）
  const getCurrentUserId = useCallback(() => {
    // 这里应该从你的认证系统获取用户ID
    return 'current-user-id'
  }, [])

  // 获取当前用户名（实际项目中应该从认证状态获取）
  const getCurrentUserName = useCallback(() => {
    // 这里应该从你的认证系统获取用户名
    return '当前用户'
  }, [])

  // 检查锁状态
  const checkLockStatus = useCallback(async () => {
    if (!tableId) return

    try {
      // 这里应该调用实际的API来检查锁状态
      // const response = await fetch(`/api/tables/${tableId}/lock-status`)
      // const lockData = await response.json()

      // 模拟API响应
      const lockData = {
        isLocked: false,
        lockUserId: null,
        lockUserName: null,
        lockTime: null,
      }

      setState(prev => ({
        ...prev,
        isLocked: lockData.isLocked,
        lockUserId: lockData.lockUserId,
        lockUserName: lockData.lockUserName,
        lockTime: lockData.lockTime ? new Date(lockData.lockTime) : null,
        error: null,
      }))

      // 如果锁被其他用户持有，检查是否丢失
      if (lockData.isLocked && lockData.lockUserId !== getCurrentUserId()) {
        onLockLost?.()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '检查锁状态失败'
      setState(prev => ({ ...prev, error: errorMessage }))
    }
  }, [tableId, getCurrentUserId, onLockLost])

  // 请求锁定
  const requestLock = useCallback(async () => {
    if (!tableId) return false

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const userId = getCurrentUserId()
      const userName = getCurrentUserName()

      // 这里应该调用实际的API来请求锁定
      // const response = await fetch(`/api/tables/${tableId}/lock`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, userName }),
      // })
      // const result = await response.json()

      // 模拟API响应
      const result = {
        success: true,
        lockId: 'mock-lock-id',
      }

      if (result.success) {
        const now = new Date()
        setState(prev => ({
          ...prev,
          isLocked: true,
          lockUserId: userId,
          lockUserName: userName,
          lockTime: now,
          isLoading: false,
          error: null,
        }))

        // 设置超时定时器
        if (timeoutTimerRef.current) {
          clearTimeout(timeoutTimerRef.current)
        }
        timeoutTimerRef.current = setTimeout(() => {
          releaseLock()
        }, lockTimeout)

        return true
      } else {
        throw new Error('锁定请求失败')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '请求锁定失败'
      setState(prev => ({
        ...prev,
        isLocked: false,
        isLoading: false,
        error: errorMessage,
      }))

      onLockFailed?.(error instanceof Error ? error : new Error(errorMessage))
      return false
    }
  }, [tableId, getCurrentUserId, getCurrentUserName, lockTimeout, onLockFailed, releaseLock])

  // 释放锁定
  const releaseLock = useCallback(async () => {
    if (!tableId || !state.isLocked) return

    try {
      // 这里应该调用实际的API来释放锁定
      // await fetch(`/api/tables/${tableId}/lock`, {
      //   method: 'DELETE',
      // })

      setState(prev => ({
        ...prev,
        isLocked: false,
        lockUserId: null,
        lockUserName: null,
        lockTime: null,
        lockTimeRemaining: 0,
        error: null,
      }))

      // 清除定时器
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current)
        timeoutTimerRef.current = null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '释放锁定失败'
      setState(prev => ({ ...prev, error: errorMessage }))
    }
  }, [tableId, state.isLocked])

  // 强制释放锁定（管理员功能）
  const forceReleaseLock = useCallback(async () => {
    if (!tableId) return

    try {
      // 这里应该调用管理员API来强制释放锁定
      // await fetch(`/api/tables/${tableId}/lock/force`, {
      //   method: 'DELETE',
      // })

      setState(prev => ({
        ...prev,
        isLocked: false,
        lockUserId: null,
        lockUserName: null,
        lockTime: null,
        lockTimeRemaining: 0,
        error: null,
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '强制释放锁定失败'
      setState(prev => ({ ...prev, error: errorMessage }))
    }
  }, [tableId])

  // 更新锁定剩余时间
  const updateLockTimeRemaining = useCallback(() => {
    if (state.isLocked && state.lockTime) {
      const now = new Date()
      const elapsed = now.getTime() - state.lockTime.getTime()
      const remaining = Math.max(0, Math.floor((lockTimeout - elapsed) / 1000))

      setState(prev => ({ ...prev, lockTimeRemaining: remaining }))

      // 如果时间到了，自动释放锁
      if (remaining === 0) {
        releaseLock()
      }
    }
  }, [state.isLocked, state.lockTime, lockTimeout, releaseLock])

  // 启动刷新定时器
  useEffect(() => {
    if (tableId && refreshInterval > 0) {
      refreshTimerRef.current = setInterval(() => {
        checkLockStatus()
        updateLockTimeRemaining()
      }, refreshInterval)

      return () => {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current)
        }
      }
    }
  }, [tableId, refreshInterval, checkLockStatus, updateLockTimeRemaining])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current)
      }
      // 如果当前用户持有锁，释放它
      if (state.isLocked && state.lockUserId === getCurrentUserId()) {
        releaseLock()
      }
    }
  }, [state.isLocked, state.lockUserId, getCurrentUserId, releaseLock])

  return {
    // 状态
    ...state,

    // 控制函数
    requestLock,
    releaseLock,
    forceReleaseLock,

    // 便捷状态
    canEdit: state.isLocked && state.lockUserId === getCurrentUserId(),
    isLockedByOthers: state.isLocked && state.lockUserId !== getCurrentUserId(),
    isLockExpired: state.lockTimeRemaining <= 0,
  }
}