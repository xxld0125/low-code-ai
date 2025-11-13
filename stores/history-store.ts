/**
 * 历史管理状态 Store
 *
 * 管理属性配置的撤销重做功能，与设计器状态集成
 */

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { PropertyHistoryManager, PropertyChange, HistoryState } from '@/lib/designer/history/property-history'

interface HistoryStoreState {
  // 历史管理器实例
  historyManager: PropertyHistoryManager

  // 当前状态
  canUndo: boolean
  canRedo: boolean
  currentIndex: number
  totalChanges: number

  // 批量操作状态
  isBatchOperation: boolean
  currentBatchId: string | null

  // 组件选择状态（用于记录组件相关的变更）
  selectedComponentId: string | null

  // 性能监控
  lastOperationTime: number
  operationHistory: Array<{
    operation: 'undo' | 'redo' | 'record'
    timestamp: number
    duration: number
    success: boolean
  }>
}

interface HistoryStoreActions {
  // 历史记录操作
  recordChange: (
    componentId: string,
    propertyName: string,
    oldValue: unknown,
    newValue: unknown,
    description?: string
  ) => void

  undo: () => PropertyChange | null
  redo: () => PropertyChange | null

  // 批量操作
  beginBatch: (batchId?: string) => string
  endBatch: () => void

  // 状态管理
  clearHistory: () => void
  clearComponentHistory: (componentId: string) => void

  // 组件选择
  setSelectedComponent: (componentId: string | null) => void

  // 历史查询
  getHistoryForComponent: (componentId: string) => PropertyChange[]
  getHistoryState: () => HistoryState

  // 实用工具
  getHistoryStats: () => {
    totalChanges: number
    componentStats: Record<string, number>
    propertyStats: Record<string, number>
    batchStats: { totalBatches: number; averageBatchSize: number }
  }

  exportHistory: () => string
  importHistory: (historyData: string) => boolean

  // 性能监控
  getPerformanceStats: () => {
    averageOperationTime: number
    successRate: number
    totalOperations: number
  }
}

type HistoryStore = HistoryStoreState & HistoryStoreActions

export const useHistoryStore = create<HistoryStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // 初始状态
        historyManager: new PropertyHistoryManager({
          maxHistorySize: 50,
          enablePersistence: true,
          trackBatches: true,
        }),

        canUndo: false,
        canRedo: false,
        currentIndex: -1,
        totalChanges: 0,

        isBatchOperation: false,
        currentBatchId: null,
        selectedComponentId: null,

        lastOperationTime: 0,
        operationHistory: [],

        // 历史记录操作
        recordChange: (
          componentId,
          propertyName,
          oldValue,
          newValue,
          description = `Changed ${propertyName} from ${JSON.stringify(oldValue)} to ${JSON.stringify(newValue)}`
        ) => {
          const startTime = performance.now()

          try {
            const { historyManager, currentBatchId, selectedComponentId } = get()

            // 如果有选中的组件且不是当前组件，自动选择当前组件
            const targetComponentId = selectedComponentId || componentId

            historyManager.recordChange(
              targetComponentId,
              propertyName,
              oldValue,
              newValue,
              description,
              { batchId: currentBatchId || undefined }
            )

            // 更新状态
            const state = historyManager.getState()
            set((draft) => {
              draft.canUndo = state.canUndo
              draft.canRedo = state.canRedo
              draft.currentIndex = state.currentIndex
              draft.totalChanges = state.totalChanges
              draft.lastOperationTime = performance.now() - startTime
            })

            // 记录操作历史
            get().recordOperation('record', startTime, true)

          } catch (error) {
            console.error('Failed to record change:', error)
            get().recordOperation('record', startTime, false)
          }
        },

        undo: () => {
          const startTime = performance.now()

          try {
            const { historyManager } = get()
            const change = historyManager.undo()

            if (change) {
              // 更新状态
              const state = historyManager.getState()
              set((draft) => {
                draft.canUndo = state.canUndo
                draft.canRedo = state.canRedo
                draft.currentIndex = state.currentIndex
                draft.lastOperationTime = performance.now() - startTime
              })

              get().recordOperation('undo', startTime, true)
              return change
            }

            get().recordOperation('undo', startTime, false)
            return null

          } catch (error) {
            console.error('Failed to undo:', error)
            get().recordOperation('undo', startTime, false)
            return null
          }
        },

        redo: () => {
          const startTime = performance.now()

          try {
            const { historyManager } = get()
            const change = historyManager.redo()

            if (change) {
              // 更新状态
              const state = historyManager.getState()
              set((draft) => {
                draft.canUndo = state.canUndo
                draft.canRedo = state.canRedo
                draft.currentIndex = state.currentIndex
                draft.lastOperationTime = performance.now() - startTime
              })

              get().recordOperation('redo', startTime, true)
              return change
            }

            get().recordOperation('redo', startTime, false)
            return null

          } catch (error) {
            console.error('Failed to redo:', error)
            get().recordOperation('redo', startTime, false)
            return null
          }
        },

        // 批量操作
        beginBatch: (batchId) => {
          const { historyManager } = get()
          const id = historyManager.beginBatch(batchId)

          set((draft) => {
            draft.isBatchOperation = true
            draft.currentBatchId = id
          })

          return id
        },

        endBatch: () => {
          const { historyManager } = get()
          historyManager.endBatch()

          set((draft) => {
            draft.isBatchOperation = false
            draft.currentBatchId = null
          })
        },

        // 状态管理
        clearHistory: () => {
          const { historyManager } = get()
          historyManager.clear()

          set((draft) => {
            draft.canUndo = false
            draft.canRedo = false
            draft.currentIndex = -1
            draft.totalChanges = 0
            draft.operationHistory = []
          })
        },

        clearComponentHistory: (componentId) => {
          const { historyManager } = get()
          historyManager.clearComponentHistory(componentId)

          // 更新状态
          const state = historyManager.getState()
          set((draft) => {
            draft.canUndo = state.canUndo
            draft.canRedo = state.canRedo
            draft.currentIndex = state.currentIndex
            draft.totalChanges = state.totalChanges
          })
        },

        // 组件选择
        setSelectedComponent: (componentId) => {
          set((draft) => {
            draft.selectedComponentId = componentId
          })
        },

        // 历史查询
        getHistoryForComponent: (componentId) => {
          const { historyManager } = get()
          return historyManager.getHistoryForComponent(componentId)
        },

        getHistoryState: () => {
          const { historyManager } = get()
          return historyManager.getState()
        },

        getHistoryStats: () => {
          const { historyManager } = get()
          return historyManager.getHistoryStats()
        },

        exportHistory: () => {
          const { historyManager } = get()
          return historyManager.exportHistory()
        },

        importHistory: (historyData) => {
          const startTime = performance.now()

          try {
            const { historyManager } = get()
            const success = historyManager.importHistory(historyData)

            if (success) {
              // 更新状态
              const state = historyManager.getState()
              set((draft) => {
                draft.canUndo = state.canUndo
                draft.canRedo = state.canRedo
                draft.currentIndex = state.currentIndex
                draft.totalChanges = state.totalChanges
                draft.lastOperationTime = performance.now() - startTime
              })
            }

            return success

          } catch (error) {
            console.error('Failed to import history:', error)
            return false
          }
        },

        getPerformanceStats: () => {
          const { operationHistory } = get()

          if (operationHistory.length === 0) {
            return {
              averageOperationTime: 0,
              successRate: 0,
              totalOperations: 0,
            }
          }

          const successfulOperations = operationHistory.filter(op => op.success)
          const totalDuration = operationHistory.reduce((sum, op) => sum + op.duration, 0)

          return {
            averageOperationTime: totalDuration / operationHistory.length,
            successRate: (successfulOperations.length / operationHistory.length) * 100,
            totalOperations: operationHistory.length,
          }
        },

        // 私有方法
        recordOperation: (operation: 'undo' | 'redo' | 'record', startTime: number, success: boolean) => {
          set((draft) => {
            draft.operationHistory.push({
              operation,
              timestamp: Date.now(),
              duration: performance.now() - startTime,
              success,
            })

            // 只保留最近100条操作记录
            if (draft.operationHistory.length > 100) {
              draft.operationHistory = draft.operationHistory.slice(-100)
            }
          })
        },
      }))
    ),
    {
      name: 'history-store',
      partialize: (state) => ({
        // 只持久化必要的状态
        canUndo: state.canUndo,
        canRedo: state.canRedo,
        currentIndex: state.currentIndex,
        totalChanges: state.totalChanges,
      }),
    }
  )
)

// Hook for history management
export const useHistoryManager = () => {
  const store = useHistoryStore()

  return {
    // 状态
    canUndo: store.canUndo,
    canRedo: store.canRedo,
    currentIndex: store.currentIndex,
    totalChanges: store.totalChanges,
    isBatchOperation: store.isBatchOperation,
    selectedComponentId: store.selectedComponentId,

    // 操作
    recordChange: store.recordChange,
    undo: store.undo,
    redo: store.redo,
    beginBatch: store.beginBatch,
    endBatch: store.endBatch,
    clearHistory: store.clearHistory,
    clearComponentHistory: store.clearComponentHistory,
    setSelectedComponent: store.setSelectedComponent,

    // 查询
    getHistoryForComponent: store.getHistoryForComponent,
    getHistoryState: store.getHistoryState,
    getHistoryStats: store.getHistoryStats,
    exportHistory: store.exportHistory,
    importHistory: store.importHistory,
    getPerformanceStats: store.getPerformanceStats,
  }
}

// Hook for keyboard shortcuts
export const useHistoryKeyboardShortcuts = () => {
  const { canUndo, canRedo, undo, redo } = useHistoryManager()

  const handleKeyDown = (event: KeyboardEvent) => {
    // 检查修饰键
    const isCtrl = event.ctrlKey || event.metaKey
    const isShift = event.shiftKey

    if (!isCtrl) return

    // 检查是否在输入框中
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return
    }

    switch (event.key) {
      case 'z':
        if (isShift && canRedo) {
          event.preventDefault()
          redo()
        } else if (!isShift && canUndo) {
          event.preventDefault()
          undo()
        }
        break
      case 'y':
        if (canRedo) {
          event.preventDefault()
          redo()
        }
        break
    }
  }

  // 注册键盘事件监听器
  const setupKeyboardShortcuts = () => {
    document.addEventListener('keydown', handleKeyDown)
  }

  // 移除键盘事件监听器
  const removeKeyboardShortcuts = () => {
    document.removeEventListener('keydown', handleKeyDown)
  }

  return {
    setupKeyboardShortcuts,
    removeKeyboardShortcuts,
  }
}