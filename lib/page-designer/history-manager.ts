import { ComponentInstance, PageDesign, ComponentTree } from '@/types/page-designer'

interface HistoryState {
  id: string
  timestamp: string
  action: HistoryAction
  description: string
  beforeState: DesignerStateSnapshot
  afterState: DesignerStateSnapshot
  affectedComponents: string[]
  sessionId?: string
}

interface DesignerStateSnapshot {
  currentPageId: string | null
  pageDesigns: Record<string, PageDesign>
  components: Record<string, ComponentInstance>
  selectedComponentIds: string[]
  canvas: {
    zoom: number
    pan: { x: number; y: number }
    gridSize: number
    showGrid: boolean
  }
}

type HistoryAction =
  | 'create_component'
  | 'update_component'
  | 'delete_component'
  | 'move_component'
  | 'copy_component'
  | 'paste_component'
  | 'batch_operation'
  | 'undo'
  | 'redo'

interface HistoryManagerOptions {
  maxHistorySize?: number
  maxMemoryUsage?: number // MB
  enablePersistence?: boolean
  compressionEnabled?: boolean
}

/**
 * 页面设计器历史管理器
 * 负责管理设计操作的历史记录，支持撤销和重做功能
 */
export class HistoryManager {
  private history: HistoryState[] = []
  private currentIndex: number = -1
  private options: Required<HistoryManagerOptions>
  private sessionId: string
  private memoryUsage: number = 0

  constructor(options: HistoryManagerOptions = {}) {
    this.options = {
      maxHistorySize: 50,
      maxMemoryUsage: 10, // 10MB
      enablePersistence: true,
      compressionEnabled: true,
      ...options,
    }

    this.sessionId = this.generateSessionId()

    // 从本地存储加载历史记录
    if (this.options.enablePersistence && typeof window !== 'undefined') {
      this.loadFromStorage()
    }
  }

  /**
   * 添加新的历史记录
   */
  push(
    action: HistoryAction,
    description: string,
    beforeState: DesignerStateSnapshot,
    afterState: DesignerStateSnapshot,
    affectedComponents: string[] = []
  ): void {
    // 如果当前不在历史记录的末尾，删除后续记录
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    const historyState: HistoryState = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      action,
      description,
      beforeState: this.compressState(beforeState),
      afterState: this.compressState(afterState),
      affectedComponents,
      sessionId: this.sessionId,
    }

    this.history.push(historyState)
    this.currentIndex = this.history.length - 1

    // 检查历史记录大小限制
    this.enforceSizeLimit()

    // 检查内存使用限制
    this.enforceMemoryLimit()

    // 持久化到本地存储
    if (this.options.enablePersistence && typeof window !== 'undefined') {
      this.saveToStorage()
    }
  }

  /**
   * 撤销操作
   */
  undo(): DesignerStateSnapshot | null {
    if (this.canUndo()) {
      const currentState = this.history[this.currentIndex]
      this.currentIndex--

      const state = this.decompressState(currentState.beforeState)

      // 记录撤销操作
      this.push(
        'undo',
        `撤销: ${currentState.description}`,
        currentState.afterState,
        state,
        currentState.affectedComponents
      )

      return state
    }
    return null
  }

  /**
   * 重做操作
   */
  redo(): DesignerStateSnapshot | null {
    if (this.canRedo()) {
      this.currentIndex++
      const nextState = this.history[this.currentIndex]

      const state = this.decompressState(nextState.afterState)

      // 记录重做操作
      this.push(
        'redo',
        `重做: ${nextState.description}`,
        nextState.beforeState,
        state,
        nextState.affectedComponents
      )

      return state
    }
    return null
  }

  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.currentIndex >= 0
  }

  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  /**
   * 获取历史记录列表
   */
  getHistory(): HistoryState[] {
    return [...this.history]
  }

  /**
   * 获取当前历史状态
   */
  getCurrentState(): DesignerStateSnapshot | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.decompressState(this.history[this.currentIndex].afterState)
    }
    return null
  }

  /**
   * 清空历史记录
   */
  clear(): void {
    this.history = []
    this.currentIndex = -1
    this.memoryUsage = 0

    if (this.options.enablePersistence && typeof window !== 'undefined') {
      this.clearStorage()
    }
  }

  /**
   * 获取特定组件的历史记录
   */
  getComponentHistory(componentId: string): HistoryState[] {
    return this.history.filter(state => state.affectedComponents.includes(componentId))
  }

  /**
   * 获取会话历史记录
   */
  getSessionHistory(sessionId?: string): HistoryState[] {
    const targetSessionId = sessionId || this.sessionId
    return this.history.filter(state => state.sessionId === targetSessionId)
  }

  /**
   * 导出历史记录
   */
  export(): string {
    const exportData = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      sessionId: this.sessionId,
      history: this.history,
      currentIndex: this.currentIndex,
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * 导入历史记录
   */
  import(data: string): boolean {
    try {
      const importData = JSON.parse(data)

      if (!importData.version || !importData.history) {
        throw new Error('无效的历史记录格式')
      }

      this.history = importData.history
      this.currentIndex = importData.currentIndex
      this.sessionId = importData.sessionId || this.generateSessionId()

      if (this.options.enablePersistence && typeof window !== 'undefined') {
        this.saveToStorage()
      }

      return true
    } catch (error) {
      console.error('导入历史记录失败:', error)
      return false
    }
  }

  // 私有方法

  private generateId(): string {
    return `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 压缩状态数据以减少内存使用
   */
  private compressState(state: DesignerStateSnapshot): DesignerStateSnapshot {
    if (!this.options.compressionEnabled) {
      return state
    }

    try {
      // 深度克隆状态
      const compressed = JSON.parse(JSON.stringify(state))

      // 移除不必要的字段以节省空间
      Object.keys(compressed.components).forEach(id => {
        const component = compressed.components[id]
        // 移除大型的样式对象缓存
        if (component.styles?.__cache) {
          delete component.styles.__cache
        }
        // 移除临时数据
        if (component._temp) {
          delete component._temp
        }
      })

      return compressed
    } catch (error) {
      console.warn('状态压缩失败，使用原始状态:', error)
      return state
    }
  }

  /**
   * 解压缩状态数据
   */
  private decompressState(state: DesignerStateSnapshot): DesignerStateSnapshot {
    if (!this.options.compressionEnabled) {
      return state
    }

    try {
      return JSON.parse(JSON.stringify(state))
    } catch (error) {
      console.warn('状态解压缩失败:', error)
      return state
    }
  }

  /**
   * 强制执行历史记录大小限制
   */
  private enforceSizeLimit(): void {
    if (this.history.length > this.options.maxHistorySize) {
      const excess = this.history.length - this.options.maxHistorySize
      this.history.splice(0, excess)
      this.currentIndex = Math.max(-1, this.currentIndex - excess)
    }
  }

  /**
   * 强制执行内存使用限制
   */
  private enforceMemoryLimit(): void {
    // 估算内存使用量（简单估算）
    const estimatedSize = JSON.stringify(this.history).length / 1024 / 1024 // MB
    this.memoryUsage = estimatedSize

    if (this.memoryUsage > this.options.maxMemoryUsage) {
      // 移除最旧的历史记录直到内存使用在限制内
      while (this.history.length > 10 && this.memoryUsage > this.options.maxMemoryUsage) {
        this.history.shift()
        this.currentIndex = Math.max(-1, this.currentIndex - 1)
        this.memoryUsage = JSON.stringify(this.history).length / 1024 / 1024
      }
    }
  }

  /**
   * 保存到本地存储
   */
  private saveToStorage(): void {
    try {
      const storageKey = `page-designer-history-${this.sessionId}`
      const data = {
        history: this.history,
        currentIndex: this.currentIndex,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem(storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('保存历史记录到本地存储失败:', error)
    }
  }

  /**
   * 从本地存储加载
   */
  private loadFromStorage(): void {
    try {
      const storageKey = `page-designer-history-${this.sessionId}`
      const data = localStorage.getItem(storageKey)

      if (data) {
        const parsedData = JSON.parse(data)

        // 检查数据是否过期（超过24小时）
        const timestamp = new Date(parsedData.timestamp)
        const now = new Date()
        const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)

        if (hoursDiff < 24) {
          this.history = parsedData.history || []
          this.currentIndex = parsedData.currentIndex || -1
        } else {
          // 清理过期的历史记录
          localStorage.removeItem(storageKey)
        }
      }
    } catch (error) {
      console.warn('从本地存储加载历史记录失败:', error)
    }
  }

  /**
   * 清理本地存储
   */
  private clearStorage(): void {
    try {
      const storageKey = `page-designer-history-${this.sessionId}`
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.warn('清理本地存储失败:', error)
    }
  }

  /**
   * 清理所有过期的历史记录
   */
  static cleanupExpiredHistory(): void {
    if (typeof window === 'undefined') return

    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('page-designer-history-'))

      keys.forEach(key => {
        try {
          const data = localStorage.getItem(key)
          if (data) {
            const parsedData = JSON.parse(data)
            const timestamp = new Date(parsedData.timestamp)
            const now = new Date()
            const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)

            // 清理超过24小时的历史记录
            if (hoursDiff > 24) {
              localStorage.removeItem(key)
            }
          }
        } catch (error) {
          // 如果解析失败，直接删除该记录
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('清理过期历史记录失败:', error)
    }
  }
}

// 创建全局历史管理器实例
let globalHistoryManager: HistoryManager | null = null

export function getHistoryManager(options?: HistoryManagerOptions): HistoryManager {
  if (!globalHistoryManager) {
    globalHistoryManager = new HistoryManager(options)
  }
  return globalHistoryManager
}

// 页面卸载时清理过期历史记录
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    HistoryManager.cleanupExpiredHistory()
  })
}
