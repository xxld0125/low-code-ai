import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * 自动保存Hook配置
 */
interface AutoSaveConfig {
  /** 是否启用自动保存 */
  enabled: boolean
  /** 自动保存延迟时间（毫秒） */
  delay: number
  /** 保存函数 */
  onSave: (data: unknown) => Promise<void>
  /** 数据获取函数 */
  getData: () => unknown
  /** 错误处理函数 */
  onError?: (error: Error) => void
  /** 成功处理函数 */
  onSuccess?: () => void
}

/**
 * 自动保存状态
 */
interface AutoSaveState {
  /** 是否正在保存 */
  isSaving: boolean
  /** 上次保存时间 */
  lastSavedTime: Date | null
  /** 是否有未保存的更改 */
  hasUnsavedChanges: boolean
  /** 保存状态信息 */
  status: 'idle' | 'saving' | 'success' | 'error'
  /** 错误信息 */
  error: Error | null
}

/**
 * 自动保存Hook
 * @param config 自动保存配置
 * @returns 自动保存状态和控制函数
 */
export function useAutoSave(config: AutoSaveConfig) {
  const {
    enabled = true,
    delay = 2000,
    onSave,
    getData,
    onError,
    onSuccess,
  } = config

  // 状态管理
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSavedTime: null,
    hasUnsavedChanges: false,
    status: 'idle',
    error: null,
  })

  // 防抖定时器引用
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  // 上次保存的数据引用
  const lastSavedDataRef = useRef<unknown>(null)
  // 是否正在执行保存
  const isSavingRef = useRef(false)

  // 检查数据是否发生变化
  const hasDataChanged = useCallback(() => {
    const currentData = getData()
    const lastData = lastSavedDataRef.current

    if (!lastData) return true

    try {
      return JSON.stringify(currentData) !== JSON.stringify(lastData)
    } catch {
      return true
    }
  }, [getData])

  // 执行保存
  const performSave = useCallback(async () => {
    if (!enabled || isSavingRef.current) return

    const data = getData()
    if (!hasDataChanged()) return

    isSavingRef.current = true
    setState(prev => ({
      ...prev,
      isSaving: true,
      status: 'saving',
      error: null,
    }))

    try {
      await onSave(data)

      lastSavedDataRef.current = data
      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSavedTime: new Date(),
        hasUnsavedChanges: false,
        status: 'success',
        error: null,
      }))

      onSuccess?.()
    } catch (error) {
      const err = error instanceof Error ? error : new Error('保存失败')
      setState(prev => ({
        ...prev,
        isSaving: false,
        status: 'error',
        error: err,
      }))

      onError?.(err)
    } finally {
      isSavingRef.current = false
    }
  }, [enabled, getData, hasDataChanged, onSave, onError, onSuccess])

  // 手动触发保存
  const save = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    performSave()
  }, [performSave])

  // 重置状态
  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    setState({
      isSaving: false,
      lastSavedTime: null,
      hasUnsavedChanges: false,
      status: 'idle',
      error: null,
    })

    lastSavedDataRef.current = null
    isSavingRef.current = false
  }, [])

  // 监听数据变化并触发自动保存
  useEffect(() => {
    if (!enabled) return

    const checkAndScheduleSave = () => {
      if (hasDataChanged()) {
        setState(prev => ({
          ...prev,
          hasUnsavedChanges: true,
        }))

        // 清除之前的定时器
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        // 设置新的定时器
        timeoutRef.current = setTimeout(() => {
          performSave()
        }, delay)
      }
    }

    // 立即检查一次
    checkAndScheduleSave()

    // 设置定期检查（可选）
    const intervalId = setInterval(checkAndScheduleSave, 1000)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      clearInterval(intervalId)
    }
  }, [enabled, delay, hasDataChanged, performSave])

  // 组件卸载时保存
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      // 如果有未保存的更改，立即保存
      if (state.hasUnsavedChanges && !isSavingRef.current) {
        performSave()
      }
    }
  }, [state.hasUnsavedChanges, performSave])

  return {
    // 状态
    ...state,

    // 控制函数
    save,
    reset,

    // 计算属性
    canSave: state.hasUnsavedChanges && !state.isSaving,
    isDirty: state.hasUnsavedChanges,
  }
}