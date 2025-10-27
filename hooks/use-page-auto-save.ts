/**
 * 页面设计器自动保存Hook
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { debounce } from 'lodash-es'

export interface AutoSaveState {
  isSaving: boolean
  lastSaved: Date | null
  pendingChanges: number
  error: string | null
  saveQueue: Array<{
    componentId: string
    changes: any
    timestamp: number
  }>
}

export interface UseAutoSaveOptions {
  interval?: number // 自动保存间隔（毫秒）
  debounceDelay?: number // 防抖延迟（毫秒）
  maxRetries?: number // 最大重试次数
  retryDelay?: number // 重试延迟（毫秒）
}

export interface UseAutoSaveReturn {
  autoSaveState: AutoSaveState
  triggerSave: () => Promise<void>
  clearError: () => void
  getSaveStatus: () => 'saving' | 'saved' | 'error' | 'pending'
  _addChangesToQueue?: (componentId: string, changes: any) => void
}

export interface UseComponentAutoSaveReturn extends UseAutoSaveReturn {
  handlePropertyChange: (property: string, value: any, type?: 'props' | 'styles' | 'events') => void
}

const DEFAULT_OPTIONS: Required<UseAutoSaveOptions> = {
  interval: 30000, // 30秒
  debounceDelay: 1000, // 1秒
  maxRetries: 3,
  retryDelay: 5000, // 5秒
}

export const usePageAutoSave = (
  saveFunction: (changes: any) => Promise<void>,
  options: UseAutoSaveOptions = {}
): UseAutoSaveReturn => {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    pendingChanges: 0,
    error: null,
    saveQueue: [],
  })

  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const retryTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const isMountedRef = useRef(true)

  // 清理函数
  useEffect(() => {
    const saveTimeout = saveTimeoutRef.current
    const retryTimeout = retryTimeoutRef.current

    return () => {
      isMountedRef.current = false
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
    }
  }, [])

  // 清除错误状态
  const clearError = useCallback(() => {
    setAutoSaveState(prev => ({ ...prev, error: null }))
  }, [])

  // 执行保存操作
  const performSave = useCallback(
    async (changes: any, retryCount = 0): Promise<void> => {
      if (!isMountedRef.current) return

      try {
        setAutoSaveState(prev => ({
          ...prev,
          isSaving: true,
          error: null,
        }))

        await saveFunction(changes)

        if (isMountedRef.current) {
          setAutoSaveState(prev => ({
            ...prev,
            isSaving: false,
            lastSaved: new Date(),
            pendingChanges: Math.max(0, prev.pendingChanges - 1),
            error: null,
          }))
        }
      } catch (error) {
        console.error('Auto save failed:', error)

        if (retryCount < opts.maxRetries) {
          // 重试逻辑
          if (isMountedRef.current) {
            retryTimeoutRef.current = setTimeout(() => {
              performSave(changes, retryCount + 1)
            }, opts.retryDelay)
          }
        } else {
          // 达到最大重试次数，显示错误
          if (isMountedRef.current) {
            setAutoSaveState(prev => ({
              ...prev,
              isSaving: false,
              error: error instanceof Error ? error.message : '保存失败',
            }))
          }
        }
      }
    },
    [saveFunction, opts.maxRetries, opts.retryDelay]
  )

  // 防抖的保存函数
  const debouncedSave = useCallback(
    (changes: any) => {
      const debouncedFn = debounce(async (changes: any) => {
        await performSave(changes)
      }, opts.debounceDelay)
      debouncedFn(changes)
    },
    [performSave, opts.debounceDelay]
  )

  // 手动触发保存
  const triggerSave = useCallback(async (): Promise<void> => {
    if (autoSaveState.saveQueue.length === 0) {
      return
    }

    const latestChanges = autoSaveState.saveQueue[autoSaveState.saveQueue.length - 1]
    await performSave(latestChanges.changes)
  }, [autoSaveState.saveQueue, performSave])

  // 添加变更到保存队列
  const addChangesToQueue = useCallback(
    (componentId: string, changes: any) => {
      if (!isMountedRef.current) return

      setAutoSaveState(prev => {
        const newQueue = [
          ...prev.saveQueue,
          {
            componentId,
            changes,
            timestamp: Date.now(),
          },
        ]

        // 合并同一组件的连续变更
        const filteredQueue = newQueue.reduce(
          (acc, item) => {
            const lastItem = acc[acc.length - 1]
            if (lastItem && lastItem.componentId === item.componentId) {
              // 合并变更
              acc[acc.length - 1] = {
                ...item,
                changes: { ...lastItem.changes, ...item.changes },
              }
            } else {
              acc.push(item)
            }
            return acc
          },
          [] as typeof newQueue
        )

        return {
          ...prev,
          saveQueue: filteredQueue,
          pendingChanges: filteredQueue.length,
        }
      })

      // 触发防抖保存
      debouncedSave({ componentId, changes })
    },
    [debouncedSave]
  )

  // 定时自动保存
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (autoSaveState.pendingChanges > 0 && !autoSaveState.isSaving) {
        triggerSave()
      }
    }, opts.interval)

    return () => clearInterval(intervalId)
  }, [autoSaveState.pendingChanges, autoSaveState.isSaving, triggerSave, opts.interval])

  // 获取保存状态
  const getSaveStatus = useCallback((): 'saving' | 'saved' | 'error' | 'pending' => {
    if (autoSaveState.isSaving) return 'saving'
    if (autoSaveState.error) return 'error'
    if (autoSaveState.pendingChanges > 0) return 'pending'
    if (autoSaveState.lastSaved) return 'saved'
    return 'pending'
  }, [autoSaveState])

  return {
    autoSaveState,
    triggerSave,
    clearError,
    getSaveStatus,
    // 暴露内部方法供属性编辑器使用
    _addChangesToQueue: addChangesToQueue,
  }
}

// 用于组件属性自动保存的Hook
export const useComponentAutoSave = (
  componentId: string,
  onSave: (componentId: string, changes: any) => Promise<void>,
  options: UseAutoSaveOptions = {}
): UseComponentAutoSaveReturn => {
  const saveFunction = useCallback(
    async (changes: any) => {
      await onSave(componentId, changes)
    },
    [componentId, onSave]
  )

  const autoSave = usePageAutoSave(saveFunction, options)

  // 包装属性变更函数
  const handlePropertyChange = useCallback(
    (property: string, value: any, type: 'props' | 'styles' | 'events' = 'props') => {
      const changes = {
        [type]: {
          [property]: value,
        },
      }

      // @ts-expect-error - 暴露内部方法
      autoSave._addChangesToQueue(componentId, changes)
    },
    [componentId, autoSave]
  )

  return {
    ...autoSave,
    handlePropertyChange,
  }
}

// 用于页面设计自动保存的Hook
export const usePageDesignAutoSave = (
  pageId: string,
  onSave: (pageId: string, changes: any) => Promise<void>,
  options: UseAutoSaveOptions = {}
) => {
  const saveFunction = useCallback(
    async (changes: any) => {
      await onSave(pageId, changes)
    },
    [pageId, onSave]
  )

  return usePageAutoSave(saveFunction, options)
}

export default usePageAutoSave
