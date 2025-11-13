/**
 * 历史管理 Hook
 *
 * 提供便捷的历史管理功能，集成到属性编辑器中
 */

import { useCallback, useEffect, useRef } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useHistoryManager, useHistoryKeyboardShortcuts } from '@/stores/history-store'

interface UseHistoryManagerOptions {
  componentId?: string
  enableKeyboardShortcuts?: boolean
  debounceDelay?: number
  autoRecord?: boolean
}

interface HistoryManagerHook {
  // 基础状态
  canUndo: boolean
  canRedo: boolean
  currentIndex: number
  totalChanges: number
  isBatchOperation: boolean

  // 基础操作
  undo: () => void
  redo: () => void
  recordChange: (propertyName: string, oldValue: unknown, newValue: unknown, description?: string) => void

  // 批量操作
  beginBatch: (batchId?: string) => () => void // 返回结束函数
  recordBatchChanges: (changes: Array<{
    propertyName: string
    oldValue: unknown
    newValue: unknown
    description?: string
  }>) => void

  // 实用工具
  clearHistory: () => void
  getHistoryForComponent: () => unknown[]
  getHistoryStats: () => unknown

  // 性能监控
  getLastOperationTime: () => number
}

export const useHistoryManager = ({
  componentId,
  enableKeyboardShortcuts = true,
  debounceDelay = 300,
  autoRecord = true, // eslint-disable-line @typescript-eslint/no-unused-vars
}: UseHistoryManagerOptions = {}): HistoryManagerHook => {
  const historyStore = useHistoryManager()

  // 引用存储最后一次的值，用于自动记录变更
  const lastValuesRef = useRef<Record<string, unknown>>({})

  // 防抖的记录变更函数
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const debouncedRecordChange = useDebouncedCallback(
    (propertyName: string, oldValue: unknown, newValue: unknown, description?: string) => {
      if (componentId) {
        historyStore.recordChange(componentId, propertyName, oldValue, newValue, description)
      }
    },
    debounceDelay
  )

  // 立即记录变更（不防抖）
  const immediateRecordChange = useCallback(
    (propertyName: string, oldValue: unknown, newValue: unknown, description?: string) => {
      if (componentId) {
        historyStore.recordChange(componentId, propertyName, oldValue, newValue, description)
      }
    },
    [componentId, historyStore]
  )

  // 撤销操作
  const undo = useCallback(() => {
    const change = historyStore.undo()
    if (change && componentId) {
      // 更新lastValuesRef以反映撤销后的状态
      lastValuesRef.current[change.propertyName] = change.oldValue
    }
  }, [historyStore, componentId])

  // 重做操作
  const redo = useCallback(() => {
    const change = historyStore.redo()
    if (change && componentId) {
      // 更新lastValuesRef以反映重做后的状态
      lastValuesRef.current[change.propertyName] = change.newValue
    }
  }, [historyStore, componentId])

  // 开始批量操作，返回结束函数
  const beginBatch = useCallback((batchId?: string) => {
    historyStore.beginBatch(batchId)

    // 返回结束批量操作的函数
    return () => {
      historyStore.endBatch()
    }
  }, [historyStore])

  // 记录批量变更
  const recordBatchChanges = useCallback((changes: Array<{
    propertyName: string
    oldValue: unknown
    newValue: unknown
    description?: string
  }>) => {
    const endBatch = beginBatch()

    changes.forEach(change => {
      immediateRecordChange(
        change.propertyName,
        change.oldValue,
        change.newValue,
        change.description
      )
    })

    endBatch()
  }, [beginBatch, immediateRecordChange])

  // 设置组件选中的历史管理器
  useEffect(() => {
    if (componentId) {
      historyStore.setSelectedComponent(componentId)
    }
  }, [componentId, historyStore])

  // 设置键盘快捷键
  useEffect(() => {
    if (enableKeyboardShortcuts) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const shortcuts = useHistoryKeyboardShortcuts()
      shortcuts.setupKeyboardShortcuts()

      return () => {
        shortcuts.removeKeyboardShortcuts()
      }
    }
  }, [enableKeyboardShortcuts])

  // 获取最后一次操作时间
  const getLastOperationTime = useCallback(() => {
    return historyStore.lastOperationTime
  }, [historyStore])

  return {
    // 基础状态
    canUndo: historyStore.canUndo,
    canRedo: historyStore.canRedo,
    currentIndex: historyStore.currentIndex,
    totalChanges: historyStore.totalChanges,
    isBatchOperation: historyStore.isBatchOperation,

    // 基础操作
    undo,
    redo,
    recordChange: immediateRecordChange,

    // 批量操作
    beginBatch,
    recordBatchChanges,

    // 实用工具
    clearHistory: historyStore.clearHistory,
    getHistoryForComponent: () => componentId ? historyStore.getHistoryForComponent(componentId) : [],
    getHistoryStats: historyStore.getHistoryStats,

    // 性能监控
    getLastOperationTime,
  }
}

// Hook for property change tracking
export const usePropertyChangeTracker = (componentId: string) => {
  const history = useHistoryManager({ componentId })
  const propertyValuesRef = useRef<Record<string, unknown>>({})

  const trackProperty = useCallback((
    propertyName: string,
    value: unknown,
    options?: {
      description?: string
      immediate?: boolean
    }
  ) => {
    const lastValue = propertyValuesRef.current[propertyName]

    if (lastValue !== value) {
      if (options?.immediate) {
        history.recordChange(propertyName, lastValue, value, options?.description)
      } else {
        // 使用防抖版本
        setTimeout(() => {
          history.recordChange(propertyName, lastValue, value, options?.description)
        }, 100)
      }

      propertyValuesRef.current[propertyName] = value
    }
  }, [history])

  const initializeProperty = useCallback((propertyName: string, value: unknown) => {
    propertyValuesRef.current[propertyName] = value
  }, [])

  const resetProperty = useCallback((propertyName: string) => {
    delete propertyValuesRef.current[propertyName]
  }, [])

  return {
    trackProperty,
    initializeProperty,
    resetProperty,
    getCurrentValue: (propertyName: string) => propertyValuesRef.current[propertyName],
    getAllValues: () => ({ ...propertyValuesRef.current }),
  }
}

// Hook for batch operations
export const useBatchOperation = (componentId?: string) => {
  const history = useHistoryManager({ componentId })
  const batchIdRef = useRef<string | null>(null)

  const startBatch = useCallback((batchId?: string) => {
    batchIdRef.current = history.beginBatch(batchId)
    return batchIdRef.current
  }, [history])

  const endBatch = useCallback(() => {
    history.endBatch()
    batchIdRef.current = null
  }, [history])

  const isInBatch = useCallback(() => {
    return batchIdRef.current !== null
  }, [])

  const executeInBatch = useCallback(<T>(operation: () => T, batchId?: string): T => {
    startBatch(batchId)
    try {
      return operation()
    } finally {
      endBatch()
    }
  }, [startBatch, endBatch])

  return {
    startBatch,
    endBatch,
    isInBatch,
    executeInBatch,
    currentBatchId: batchIdRef.current,
  }
}