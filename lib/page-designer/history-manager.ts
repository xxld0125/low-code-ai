/**
 * 页面设计器历史管理器 - 撤销/重做支持
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 */

import { ComponentInstance, ComponentTree } from '@/types/page-designer/component'

// 历史记录类型
export type HistoryActionType =
  | 'create_component'
  | 'update_component'
  | 'delete_component'
  | 'move_component'
  | 'copy_component'
  | 'paste_component'
  | 'batch_operation'
  | 'update_property'
  | 'update_style'
  | 'update_layout'

// 历史记录项
export interface HistoryItem {
  id: string
  type: HistoryActionType
  description: string
  timestamp: Date
  componentId?: string
  componentIds?: string[]

  // 状态快照
  beforeState: {
    components: Record<string, ComponentInstance>
    componentTree: ComponentTree
    selectedIds: string[]
  }

  afterState: {
    components: Record<string, ComponentInstance>
    componentTree: ComponentTree
    selectedIds: string[]
  }

  // 元数据
  metadata?: {
    userId?: string
    sessionId?: string
    batchId?: string
    isAutoSave?: boolean
    tags?: string[]
    originalOperations?: number
  }
}

// 历史管理器配置
export interface HistoryManagerConfig {
  maxHistorySize?: number // 最大历史记录数量
  enableAutoCleanup?: boolean // 是否启用自动清理
  compressionThreshold?: number // 压缩阈值
  enablePersistence?: boolean // 是否启用持久化
  persistenceKey?: string // 持久化存储键
}

// 历史管理器事件
export interface HistoryManagerEvents {
  onHistoryChange?: (history: HistoryItem[], currentIndex: number) => void
  onUndo?: (item: HistoryItem) => void
  onRedo?: (item: HistoryItem) => void
  onHistoryCleared?: () => void
  onHistoryCompressed?: (beforeCount: number, afterCount: number) => void
}

// 深度克隆对象
const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj = {} as { [key: string]: any }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj as T
  }
  return obj
}

// 生成唯一ID
const generateId = (): string => {
  return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 压缩历史记录
const compressHistory = (history: HistoryItem[]): HistoryItem[] => {
  const compressed: HistoryItem[] = []
  let currentBatch: HistoryItem[] = []

  for (const item of history) {
    // 如果是相同类型的连续操作，合并它们
    if (
      currentBatch.length > 0 &&
      currentBatch[0].type === item.type &&
      currentBatch[0].componentId === item.componentId &&
      item.timestamp.getTime() - currentBatch[currentBatch.length - 1].timestamp.getTime() < 1000
    ) {
      currentBatch.push(item)
    } else {
      // 处理当前批次
      if (currentBatch.length > 0) {
        compressed.push(mergeBatchItems(currentBatch))
        currentBatch = []
      }
      currentBatch.push(item)
    }
  }

  // 处理最后一个批次
  if (currentBatch.length > 0) {
    compressed.push(mergeBatchItems(currentBatch))
  }

  return compressed
}

// 合并批次项目
const mergeBatchItems = (items: HistoryItem[]): HistoryItem => {
  if (items.length === 1) return items[0]

  const first = items[0]
  const last = items[items.length - 1]

  return {
    id: first.id,
    type: 'batch_operation',
    description: `批量操作 (${items.length} 个操作)`,
    timestamp: first.timestamp,
    componentIds: items.map(item => item.componentId).filter(Boolean) as string[],
    beforeState: first.beforeState,
    afterState: last.afterState,
    metadata: {
      ...first.metadata,
      batchId: generateId(),
      originalOperations: items.length,
    },
  }
}

export class HistoryManager {
  private history: HistoryItem[] = []
  private currentIndex: number = -1
  private config: Required<HistoryManagerConfig>
  private events: HistoryManagerEvents = {}
  private isDirty: boolean = false

  constructor(config: HistoryManagerConfig = {}, events: HistoryManagerEvents = {}) {
    this.config = {
      maxHistorySize: config.maxHistorySize || 50,
      enableAutoCleanup: config.enableAutoCleanup !== false,
      compressionThreshold: config.compressionThreshold || 20,
      enablePersistence: config.enablePersistence || false,
      persistenceKey: config.persistenceKey || 'page-designer-history',
    }

    this.events = events

    // 从持久化存储加载历史记录
    if (this.config.enablePersistence) {
      this.loadFromPersistence()
    }
  }

  // 添加历史记录
  addHistoryItem(
    type: HistoryActionType,
    description: string,
    beforeState: HistoryItem['beforeState'],
    afterState: HistoryItem['afterState'],
    componentId?: string,
    componentIds?: string[],
    metadata?: HistoryItem['metadata']
  ): void {
    const item: HistoryItem = {
      id: generateId(),
      type,
      description,
      timestamp: new Date(),
      componentId,
      componentIds,
      beforeState: deepClone(beforeState),
      afterState: deepClone(afterState),
      metadata,
    }

    // 如果当前不在历史记录的末尾，删除后续记录
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    // 添加新记录
    this.history.push(item)
    this.currentIndex = this.history.length - 1
    this.isDirty = true

    // 自动清理
    if (this.config.enableAutoCleanup) {
      this.autoCleanup()
    }

    // 触发事件
    this.events.onHistoryChange?.(this.history, this.currentIndex)

    // 持久化
    if (this.config.enablePersistence) {
      this.saveToPersistence()
    }
  }

  // 撤销操作
  undo(): HistoryItem | null {
    if (!this.canUndo()) return null

    const item = this.history[this.currentIndex]
    this.currentIndex--
    this.isDirty = true

    // 触发事件
    this.events.onUndo?.(item)
    this.events.onHistoryChange?.(this.history, this.currentIndex)

    // 持久化
    if (this.config.enablePersistence) {
      this.saveToPersistence()
    }

    return item
  }

  // 重做操作
  redo(): HistoryItem | null {
    if (!this.canRedo()) return null

    this.currentIndex++
    const item = this.history[this.currentIndex]
    this.isDirty = true

    // 触发事件
    this.events.onRedo?.(item)
    this.events.onHistoryChange?.(this.history, this.currentIndex)

    // 持久化
    if (this.config.enablePersistence) {
      this.saveToPersistence()
    }

    return item
  }

  // 检查是否可以撤销
  canUndo(): boolean {
    return this.currentIndex >= 0
  }

  // 检查是否可以重做
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  // 获取当前状态
  getCurrentState(): HistoryItem['afterState'] | null {
    if (this.currentIndex < 0) return null
    return deepClone(this.history[this.currentIndex].afterState)
  }

  // 获取历史记录列表
  getHistory(): HistoryItem[] {
    return deepClone(this.history)
  }

  // 获取当前位置之后的历史记录
  getFutureHistory(): HistoryItem[] {
    return deepClone(this.history.slice(this.currentIndex + 1))
  }

  // 获取当前位置之前的历史记录
  getPastHistory(): HistoryItem[] {
    return deepClone(this.history.slice(0, this.currentIndex + 1))
  }

  // 清空历史记录
  clearHistory(): void {
    this.history = []
    this.currentIndex = -1
    this.isDirty = true

    // 触发事件
    this.events.onHistoryCleared?.()
    this.events.onHistoryChange?.(this.history, this.currentIndex)

    // 持久化
    if (this.config.enablePersistence) {
      this.saveToPersistence()
    }
  }

  // 跳转到指定历史记录
  jumpToHistory(index: number): HistoryItem | null {
    if (index < 0 || index >= this.history.length) return null

    this.currentIndex = index
    this.isDirty = true

    const item = this.history[index]

    // 触发事件
    this.events.onHistoryChange?.(this.history, this.currentIndex)

    // 持久化
    if (this.config.enablePersistence) {
      this.saveToPersistence()
    }

    return item
  }

  // 自动清理历史记录
  private autoCleanup(): void {
    if (this.history.length <= this.config.maxHistorySize) return

    // 压缩历史记录
    if (this.history.length > this.config.compressionThreshold) {
      const beforeCount = this.history.length
      this.history = compressHistory(this.history)
      const afterCount = this.history.length

      // 调整当前索引
      this.currentIndex = Math.min(this.currentIndex, this.history.length - 1)

      // 触发压缩事件
      this.events.onHistoryCompressed?.(beforeCount, afterCount)
    }

    // 截断历史记录
    if (this.history.length > this.config.maxHistorySize) {
      const excess = this.history.length - this.config.maxHistorySize
      this.history = this.history.slice(excess)
      this.currentIndex = Math.max(0, this.currentIndex - excess)
    }
  }

  // 从持久化存储加载
  private loadFromPersistence(): void {
    try {
      const stored = localStorage.getItem(this.config.persistenceKey)
      if (stored) {
        const data = JSON.parse(stored)
        this.history = data.history || []
        this.currentIndex = data.currentIndex || -1
        this.isDirty = false
      }
    } catch (error) {
      console.warn('Failed to load history from persistence:', error)
    }
  }

  // 保存到持久化存储
  private saveToPersistence(): void {
    if (!this.isDirty) return

    try {
      const data = {
        history: this.history,
        currentIndex: this.currentIndex,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem(this.config.persistenceKey, JSON.stringify(data))
      this.isDirty = false
    } catch (error) {
      console.warn('Failed to save history to persistence:', error)
    }
  }

  // 获取历史统计信息
  getHistoryStats(): {
    total: number
    canUndo: boolean
    canRedo: boolean
    current: number
    oldest?: Date
    newest?: Date
    memoryUsage?: number
  } {
    const total = this.history.length
    const canUndo = this.canUndo()
    const canRedo = this.canRedo()
    const current = this.currentIndex

    let oldest: Date | undefined
    let newest: Date | undefined

    if (total > 0) {
      oldest = this.history[0].timestamp
      newest = this.history[total - 1].timestamp
    }

    // 估算内存使用量
    const memoryUsage = JSON.stringify(this.history).length

    return {
      total,
      canUndo,
      canRedo,
      current,
      oldest,
      newest,
      memoryUsage,
    }
  }

  // 搜索历史记录
  searchHistory(query: string): HistoryItem[] {
    const lowerQuery = query.toLowerCase()
    return this.history.filter(
      item =>
        item.description.toLowerCase().includes(lowerQuery) ||
        item.type.toLowerCase().includes(lowerQuery) ||
        (item.componentId && item.componentId.toLowerCase().includes(lowerQuery))
    )
  }

  // 按类型过滤历史记录
  filterByType(type: HistoryActionType): HistoryItem[] {
    return this.history.filter(item => item.type === type)
  }

  // 按时间范围过滤历史记录
  filterByTimeRange(start: Date, end: Date): HistoryItem[] {
    return this.history.filter(item => item.timestamp >= start && item.timestamp <= end)
  }

  // 导出历史记录
  exportHistory(): string {
    return JSON.stringify({
      history: this.history,
      currentIndex: this.currentIndex,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    })
  }

  // 导入历史记录
  importHistory(data: string): boolean {
    try {
      const parsed = JSON.parse(data)
      if (parsed.history && Array.isArray(parsed.history)) {
        this.history = parsed.history
        this.currentIndex = parsed.currentIndex || this.history.length - 1
        this.isDirty = true

        // 触发事件
        this.events.onHistoryChange?.(this.history, this.currentIndex)

        // 持久化
        if (this.config.enablePersistence) {
          this.saveToPersistence()
        }

        return true
      }
    } catch (error) {
      console.warn('Failed to import history:', error)
    }
    return false
  }

  // 销毁历史管理器
  destroy(): void {
    this.clearHistory()
    this.events = {}
  }
}

// 便捷Hook创建函数
export const createHistoryManager = (
  config?: HistoryManagerConfig,
  events?: HistoryManagerEvents
): HistoryManager => {
  return new HistoryManager(config, events)
}

// 默认历史管理器实例
export const defaultHistoryManager = new HistoryManager()

export default HistoryManager
