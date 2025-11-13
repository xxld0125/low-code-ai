/**
 * 属性配置历史管理系统
 *
 * 提供完整的撤销重做功能，支持：
 * - 多组件属性变更历史记录
 * - 历史记录大小限制
 * - 组件特定的历史查询
 * - 批量操作支持
 * - 历史记录持久化
 */

import { produce } from 'immer'

export interface PropertyChange {
  id: string
  componentId: string
  propertyName: string
  oldValue: unknown
  newValue: unknown
  timestamp: number
  description: string
  batchId?: string // 用于批量操作的标识
  userId?: string // 用于多用户协作场景
}

export interface HistoryState {
  canUndo: boolean
  canRedo: boolean
  currentIndex: number
  history: PropertyChange[]
  totalChanges: number
}

export interface HistoryManagerOptions {
  maxHistorySize?: number
  enablePersistence?: boolean
  storageKey?: string
  trackBatches?: boolean
}

export class PropertyHistoryManager {
  private history: PropertyChange[] = []
  private currentIndex = -1
  private maxHistorySize: number
  private enablePersistence: boolean
  private storageKey: string
  private trackBatches: boolean
  private batchOperations: Map<string, PropertyChange[]> = new Map()
  private currentBatchId: string | null = null

  constructor(options: HistoryManagerOptions = {}) {
    this.maxHistorySize = options.maxHistorySize || 50
    this.enablePersistence = options.enablePersistence || false
    this.storageKey = options.storageKey || 'property-history'
    this.trackBatches = options.trackBatches || false

    // 从持久化存储中恢复历史记录
    if (this.enablePersistence) {
      this.loadFromStorage()
    }
  }

  /**
   * 记录属性变更
   */
  recordChange(
    componentId: string,
    propertyName: string,
    oldValue: unknown,
    newValue: unknown,
    description: string,
    options: { batchId?: string; userId?: string } = {}
  ): void {
    // 如果新旧值相同，不记录变更
    if (this.isEqual(oldValue, newValue)) {
      return
    }

    const change: PropertyChange = {
      id: this.generateChangeId(),
      componentId,
      propertyName,
      oldValue,
      newValue,
      timestamp: Date.now(),
      description,
      batchId: options.batchId || this.currentBatchId || undefined,
      userId: options.userId,
    }

    // 如果当前不在历史记录的末尾，删除后面的记录
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    this.history.push(change)
    this.currentIndex++

    // 处理批量操作
    if (this.trackBatches && change.batchId) {
      if (!this.batchOperations.has(change.batchId)) {
        this.batchOperations.set(change.batchId, [])
      }
      this.batchOperations.get(change.batchId)!.push(change)
    }

    // 限制历史记录大小
    this.enforceHistoryLimit()

    // 持久化存储
    if (this.enablePersistence) {
      this.saveToStorage()
    }
  }

  /**
   * 撤销上一个变更
   */
  undo(): PropertyChange | null {
    if (!this.canUndo()) {
      return null
    }

    // 如果是批量操作，需要找到批量操作的开始位置
    const change = this.history[this.currentIndex]

    if (this.trackBatches && change.batchId) {
      return this.undoBatch(change.batchId)
    }

    this.currentIndex--
    const undoneChange = this.history[this.currentIndex]

    if (this.enablePersistence) {
      this.saveToStorage()
    }

    return undoneChange
  }

  /**
   * 重做下一个变更
   */
  redo(): PropertyChange | null {
    if (!this.canRedo()) {
      return null
    }

    const nextIndex = this.currentIndex + 1
    const change = this.history[nextIndex]

    // 如果是批量操作，需要处理整个批量
    if (this.trackBatches && change.batchId) {
      return this.redoBatch(change.batchId)
    }

    this.currentIndex++

    if (this.enablePersistence) {
      this.saveToStorage()
    }

    return change
  }

  /**
   * 开始批量操作
   */
  beginBatch(batchId?: string): string {
    const id = batchId || this.generateBatchId()
    this.currentBatchId = id
    return id
  }

  /**
   * 结束批量操作
   */
  endBatch(): void {
    this.currentBatchId = null
  }

  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.currentIndex > 0
  }

  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  /**
   * 获取当前历史状态
   */
  getState(): HistoryState {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      currentIndex: this.currentIndex,
      history: [...this.history],
      totalChanges: this.history.length,
    }
  }

  /**
   * 获取指定组件的历史记录
   */
  getHistoryForComponent(componentId: string): PropertyChange[] {
    return this.history.filter(change => change.componentId === componentId)
  }

  /**
   * 获取指定时间范围内的历史记录
   */
  getHistoryByTimeRange(startTime: number, endTime: number): PropertyChange[] {
    return this.history.filter(
      change => change.timestamp >= startTime && change.timestamp <= endTime
    )
  }

  /**
   * 获取批量操作的历史记录
   */
  getBatchHistory(batchId: string): PropertyChange[] {
    return this.batchOperations.get(batchId) || []
  }

  /**
   * 清除所有历史记录
   */
  clear(): void {
    this.history = []
    this.currentIndex = -1
    this.batchOperations.clear()
    this.currentBatchId = null

    if (this.enablePersistence) {
      this.saveToStorage()
    }
  }

  /**
   * 清除指定组件的历史记录
   */
  clearComponentHistory(componentId: string): void {
    const componentChanges = this.history.filter(
      change => change.componentId !== componentId
    )

    this.history = componentChanges
    this.currentIndex = Math.min(this.currentIndex, this.history.length - 1)

    if (this.enablePersistence) {
      this.saveToStorage()
    }
  }

  /**
   * 获取历史统计信息
   */
  getHistoryStats(): {
    totalChanges: number
    componentStats: Record<string, number>
    propertyStats: Record<string, number>
    batchStats: { totalBatches: number; averageBatchSize: number }
  } {
    const componentStats: Record<string, number> = {}
    const propertyStats: Record<string, number> = {}

    this.history.forEach(change => {
      componentStats[change.componentId] = (componentStats[change.componentId] || 0) + 1
      propertyStats[change.propertyName] = (propertyStats[change.propertyName] || 0) + 1
    })

    const batches = Array.from(this.batchOperations.values())
    const totalBatches = batches.length
    const averageBatchSize = totalBatches > 0
      ? batches.reduce((sum, batch) => sum + batch.length, 0) / totalBatches
      : 0

    return {
      totalChanges: this.history.length,
      componentStats,
      propertyStats,
      batchStats: {
        totalBatches,
        averageBatchSize: Math.round(averageBatchSize * 100) / 100,
      },
    }
  }

  /**
   * 导出历史记录
   */
  exportHistory(): string {
    return JSON.stringify({
      history: this.history,
      currentIndex: this.currentIndex,
      batchOperations: Array.from(this.batchOperations.entries()),
      exportDate: new Date().toISOString(),
    }, null, 2)
  }

  /**
   * 导入历史记录
   */
  importHistory(historyData: string): boolean {
    try {
      const data = JSON.parse(historyData)

      if (!data.history || !Array.isArray(data.history)) {
        throw new Error('Invalid history data format')
      }

      this.history = data.history
      this.currentIndex = data.currentIndex ?? -1

      if (data.batchOperations) {
        this.batchOperations = new Map(data.batchOperations)
      }

      this.enforceHistoryLimit()

      if (this.enablePersistence) {
        this.saveToStorage()
      }

      return true
    } catch (error) {
      console.error('Failed to import history:', error)
      return false
    }
  }

  // 私有方法

  private generateChangeId(): string {
    return `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateBatchId(): string {
    return `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private enforceHistoryLimit(): void {
    if (this.history.length > this.maxHistorySize) {
      const excess = this.history.length - this.maxHistorySize
      this.history = this.history.slice(excess)
      this.currentIndex = Math.max(0, this.currentIndex - excess)

      // 清理相关的批量操作记录
      this.cleanupBatchOperations()
    }
  }

  private cleanupBatchOperations(): void {
    const activeBatchIds = new Set(
      this.history
        .filter(change => change.batchId)
        .map(change => change.batchId!)
    )

    for (const [batchId, changes] of this.batchOperations.entries()) {
      if (!activeBatchIds.has(batchId)) {
        this.batchOperations.delete(batchId)
      } else {
        // 清理批量操作中超出历史记录范围的变更
        const validChanges = changes.filter(change =>
          this.history.some(h => h.id === change.id)
        )
        this.batchOperations.set(batchId, validChanges)
      }
    }
  }

  private undoBatch(batchId: string): PropertyChange | null {
    const batchChanges = this.batchOperations.get(batchId) || []
    const validChanges = batchChanges.filter(change =>
      this.history.some(h => h.id === change.id)
    )

    if (validChanges.length === 0) {
      return null
    }

    // 找到批量操作中最后一个变更在历史记录中的位置
    const lastChangeIndex = this.history.findIndex(
      change => change.id === validChanges[validChanges.length - 1].id
    )

    if (lastChangeIndex === -1) {
      return null
    }

    // 撤销整个批量操作
    this.currentIndex = lastChangeIndex - validChanges.length

    if (this.enablePersistence) {
      this.saveToStorage()
    }

    return this.history[this.currentIndex]
  }

  private redoBatch(batchId: string): PropertyChange | null {
    const batchChanges = this.batchOperations.get(batchId) || []
    const validChanges = batchChanges.filter(change =>
      this.history.some(h => h.id === change.id)
    )

    if (validChanges.length === 0) {
      return null
    }

    // 找到批量操作中第一个变更在历史记录中的位置
    const firstChangeIndex = this.history.findIndex(
      change => change.id === validChanges[0].id
    )

    if (firstChangeIndex === -1) {
      return null
    }

    // 重做整个批量操作
    this.currentIndex = firstChangeIndex + validChanges.length - 1

    if (this.enablePersistence) {
      this.saveToStorage()
    }

    return this.history[this.currentIndex]
  }

  private isEqual(value1: unknown, value2: unknown): boolean {
    if (value1 === value2) {
      return true
    }

    if (typeof value1 !== typeof value2) {
      return false
    }

    if (value1 === null || value2 === null) {
      return value1 === value2
    }

    if (Array.isArray(value1) && Array.isArray(value2)) {
      return value1.length === value2.length &&
             value1.every((val, index) => this.isEqual(val, value2[index]))
    }

    if (typeof value1 === 'object' && typeof value2 === 'object') {
      const keys1 = Object.keys(value1 as Record<string, unknown>)
      const keys2 = Object.keys(value2 as Record<string, unknown>)

      if (keys1.length !== keys2.length) {
        return false
      }

      return keys1.every(key =>
        this.isEqual(
          (value1 as Record<string, unknown>)[key],
          (value2 as Record<string, unknown>)[key]
        )
      )
    }

    return false
  }

  private saveToStorage(): void {
    try {
      const data = {
        history: this.history,
        currentIndex: this.currentIndex,
        batchOperations: Array.from(this.batchOperations.entries()),
      }
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save history to localStorage:', error)
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.storageKey)
      if (data) {
        const parsed = JSON.parse(data)
        this.history = parsed.history || []
        this.currentIndex = parsed.currentIndex ?? -1

        if (parsed.batchOperations) {
          this.batchOperations = new Map(parsed.batchOperations)
        }

        this.enforceHistoryLimit()
      }
    } catch (error) {
      console.warn('Failed to load history from localStorage:', error)
    }
  }
}

// 创建默认的历史管理器实例
export const defaultHistoryManager = new PropertyHistoryManager({
  maxHistorySize: 50,
  enablePersistence: true,
  trackBatches: true,
})