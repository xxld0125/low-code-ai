/**
 * 实时预览管理器
 * 管理组件属性的实时预览和更新，支持样式预览和画布实时更新
 */

import type { PropertyValue, CSSProperties } from '@/types/designer'

export interface PreviewConfig {
  debounceMs: number
  maxUpdates: number
  enableVirtualization: boolean
  enableDiffOptimization: boolean
  enableRealTimePreview: boolean
  enableCanvasUpdates: boolean
  maxCanvasUpdatesPerSecond: number
  enableTransitions: boolean
  transitionDuration: number
}

export interface PreviewUpdate {
  componentId: string
  propertyPath: string
  oldValue: PropertyValue
  newValue: PropertyValue
  timestamp: number
}

export interface PreviewSnapshot {
  componentId: string
  properties: Record<string, PropertyValue>
  styles: CSSProperties
  timestamp: number
  checksum: string
}

// 样式预览更新
export interface StylePreviewUpdate {
  componentId: string
  styleProperty: string
  oldValue: unknown
  newValue: unknown
  timestamp: number
}

// 画布更新事件
export interface CanvasUpdateEvent {
  componentId: string
  updateType: 'style' | 'property' | 'layout'
  data: Record<string, unknown>
  timestamp: number
}

// 画布更新监听器
export type CanvasUpdateListener = (event: CanvasUpdateEvent) => void

/**
 * 实时预览管理器
 * 扩展支持样式预览和画布实时更新
 */
export class PreviewManager {
  private updateQueue: PreviewUpdate[] = []
  private styleUpdateQueue: StylePreviewUpdate[] = []
  private debounceTimer: NodeJS.Timeout | null = null
  private styleDebounceTimer: NodeJS.Timeout | null = null
  private snapshots: Map<string, PreviewSnapshot> = new Map()
  private updateCallbacks: Set<(updates: PreviewUpdate[]) => void> = new Set()
  private styleUpdateCallbacks: Set<(updates: StylePreviewUpdate[]) => void> = new Set()
  private canvasUpdateListeners: Set<CanvasUpdateListener> = new Set()
  private componentStyles: Map<string, CSSProperties> = new Map()
  private lastCanvasUpdateTime: number = 0
  private canvasUpdateCount: number = 0

  constructor(private config: PreviewConfig) {
    // 设置默认配置
    if (this.config.enableRealTimePreview === undefined) {
      this.config.enableRealTimePreview = true
    }
    if (this.config.enableCanvasUpdates === undefined) {
      this.config.enableCanvasUpdates = true
    }
    if (this.config.maxCanvasUpdatesPerSecond === undefined) {
      this.config.maxCanvasUpdatesPerSecond = 60
    }
    if (this.config.enableTransitions === undefined) {
      this.config.enableTransitions = true
    }
    if (this.config.transitionDuration === undefined) {
      this.config.transitionDuration = 200
    }
  }

  /**
   * 添加预览更新
   */
  addUpdate(
    componentId: string,
    propertyPath: string,
    oldValue: PropertyValue,
    newValue: PropertyValue
  ): void {
    const update: PreviewUpdate = {
      componentId,
      propertyPath,
      oldValue,
      newValue,
      timestamp: Date.now(),
    }

    this.updateQueue.push(update)

    // 如果队列太大，触发立即更新
    if (this.updateQueue.length >= this.config.maxUpdates) {
      this.flushUpdates()
    } else {
      this.scheduleUpdate()
    }
  }

  /**
   * 批量添加更新
   */
  addUpdates(
    updates: Array<{
      componentId: string
      propertyPath: string
      oldValue: PropertyValue
      newValue: PropertyValue
    }>
  ): void {
    updates.forEach(({ componentId, propertyPath, oldValue, newValue }) =>
      this.addUpdate(componentId, propertyPath, oldValue, newValue)
    )
  }

  /**
   * 创建组件快照
   */
  createSnapshot(componentId: string, properties: Record<string, PropertyValue>, styles?: CSSProperties): PreviewSnapshot {
    const snapshot: PreviewSnapshot = {
      componentId,
      properties: { ...properties },
      styles: { ...(styles || {}) },
      timestamp: Date.now(),
      checksum: this.generateChecksum(properties),
    }

    this.snapshots.set(componentId, snapshot)
    return snapshot
  }

  /**
   * 获取组件快照
   */
  getSnapshot(componentId: string): PreviewSnapshot | null {
    return this.snapshots.get(componentId) || null
  }

  /**
   * 计算差异
   */
  calculateDiff(
    componentId: string,
    newProperties: Record<string, PropertyValue>
  ): PreviewUpdate[] {
    const snapshot = this.getSnapshot(componentId)
    if (!snapshot) {
      return []
    }

    const updates: PreviewUpdate[] = []
    const oldProperties = snapshot.properties

    for (const [propertyPath, newValue] of Object.entries(newProperties)) {
      const oldValue = oldProperties[propertyPath]
      if (!this.deepEqual(oldValue, newValue)) {
        updates.push({
          componentId,
          propertyPath,
          oldValue,
          newValue,
          timestamp: Date.now(),
        })
      }
    }

    return updates
  }

  /**
   * 注册更新回调
   */
  onUpdate(callback: (updates: PreviewUpdate[]) => void): () => void {
    this.updateCallbacks.add(callback)
    return () => this.updateCallbacks.delete(callback)
  }

  /**
   * 强制刷新更新
   */
  flushUpdates(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }

    if (this.updateQueue.length === 0) {
      return
    }

    const updates = [...this.updateQueue]
    this.updateQueue = []

    // 通知所有回调
    this.updateCallbacks.forEach(callback => {
      try {
        callback(updates)
      } catch (error) {
        console.error('预览更新回调执行失败:', error)
      }
    })
  }

  /**
   * 清除更新队列
   */
  clearQueue(): void {
    this.updateQueue = []
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }

  /**
   * 清除快照
   */
  clearSnapshots(): void {
    this.snapshots.clear()
  }

  /**
   * 添加样式预览更新
   */
  addStyleUpdate(
    componentId: string,
    styleProperty: string,
    oldValue: unknown,
    newValue: unknown
  ): void {
    if (!this.config.enableRealTimePreview) return

    const update: StylePreviewUpdate = {
      componentId,
      styleProperty,
      oldValue,
      newValue,
      timestamp: Date.now(),
    }

    this.styleUpdateQueue.push(update)

    // 检查是否需要立即触发样式更新
    if (this.shouldFlushStyleUpdates()) {
      this.flushStyleUpdates()
    } else {
      this.scheduleStyleUpdate()
    }
  }

  /**
   * 批量添加样式更新
   */
  addStyleUpdates(
    updates: Array<{
      componentId: string
      styleProperty: string
      oldValue: unknown
      newValue: unknown
    }>
  ): void {
    if (!this.config.enableRealTimePreview) return

    updates.forEach(({ componentId, styleProperty, oldValue, newValue }) =>
      this.addStyleUpdate(componentId, styleProperty, oldValue, newValue)
    )
  }

  /**
   * 更新组件样式缓存
   */
  updateComponentStyles(componentId: string, styles: CSSProperties): void {
    const currentStyles = this.componentStyles.get(componentId) || {}
    const updatedStyles = { ...currentStyles, ...styles }
    this.componentStyles.set(componentId, updatedStyles)

    // 触发画布更新
    if (this.config.enableCanvasUpdates) {
      this.notifyCanvasUpdate(componentId, 'style', updatedStyles)
    }
  }

  /**
   * 获取组件样式
   */
  getComponentStyles(componentId: string): CSSProperties {
    return this.componentStyles.get(componentId) || {}
  }

  /**
   * 注册画布更新监听器
   */
  onCanvasUpdate(listener: CanvasUpdateListener): () => void {
    this.canvasUpdateListeners.add(listener)
    return () => this.canvasUpdateListeners.delete(listener)
  }

  /**
   * 通知画布更新
   */
  private notifyCanvasUpdate(
    componentId: string,
    updateType: 'style' | 'property' | 'layout',
    data: Record<string, unknown>
  ): void {
    if (!this.shouldTriggerCanvasUpdate()) return

    const event: CanvasUpdateEvent = {
      componentId,
      updateType,
      data,
      timestamp: Date.now(),
    }

    // 通知所有监听器
    this.canvasUpdateListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('画布更新监听器执行失败:', error)
      }
    })

    this.lastCanvasUpdateTime = Date.now()
    this.canvasUpdateCount++
  }

  /**
   * 检查是否应该触发画布更新
   */
  private shouldTriggerCanvasUpdate(): boolean {
    if (!this.config.enableCanvasUpdates) return false

    const now = Date.now()
    const timeSinceLastUpdate = now - this.lastCanvasUpdateTime
    const minInterval = 1000 / this.config.maxCanvasUpdatesPerSecond

    return timeSinceLastUpdate >= minInterval
  }

  /**
   * 检查是否应该刷新样式更新
   */
  private shouldFlushStyleUpdates(): boolean {
    return this.styleUpdateQueue.length >= this.config.maxUpdates
  }

  /**
   * 注册样式更新回调
   */
  onStyleUpdate(callback: (updates: StylePreviewUpdate[]) => void): () => void {
    this.styleUpdateCallbacks.add(callback)
    return () => this.styleUpdateCallbacks.delete(callback)
  }

  /**
   * 强制刷新样式更新
   */
  flushStyleUpdates(): void {
    if (this.styleDebounceTimer) {
      clearTimeout(this.styleDebounceTimer)
      this.styleDebounceTimer = null
    }

    if (this.styleUpdateQueue.length === 0) {
      return
    }

    const updates = [...this.styleUpdateQueue]
    this.styleUpdateQueue = []

    // 通知所有回调
    this.styleUpdateCallbacks.forEach(callback => {
      try {
        callback(updates)
      } catch (error) {
        console.error('样式更新回调执行失败:', error)
      }
    })

    // 处理样式缓存和画布更新
    this.processStyleUpdates(updates)
  }

  /**
   * 处理样式更新
   */
  private processStyleUpdates(updates: StylePreviewUpdate[]): void {
    const componentUpdates = new Map<string, CSSProperties>()

    // 按组件分组样式更新
    updates.forEach(update => {
      const componentStyles = componentUpdates.get(update.componentId) || {}
      componentStyles[update.styleProperty] = update.newValue
      componentUpdates.set(update.componentId, componentStyles)
    })

    // 更新组件样式缓存并触发画布更新
    componentUpdates.forEach((styles, componentId) => {
      this.updateComponentStyles(componentId, styles)
    })
  }

  /**
   * 销毁预览管理器
   */
  destroy(): void {
    this.clearQueue()
    this.clearStyleQueue()
    this.clearSnapshots()
    this.updateCallbacks.clear()
    this.styleUpdateCallbacks.clear()
    this.canvasUpdateListeners.clear()
    this.componentStyles.clear()
  }

  /**
   * 清除样式更新队列
   */
  clearStyleQueue(): void {
    this.styleUpdateQueue = []
    if (this.styleDebounceTimer) {
      clearTimeout(this.styleDebounceTimer)
      this.styleDebounceTimer = null
    }
  }

  /**
   * 清除组件样式缓存
   */
  clearComponentStyles(componentId?: string): void {
    if (componentId) {
      this.componentStyles.delete(componentId)
    } else {
      this.componentStyles.clear()
    }
  }

  // 私有方法

  private scheduleUpdate(): void {
    if (this.debounceTimer) {
      return
    }

    this.debounceTimer = setTimeout(() => {
      this.flushUpdates()
    }, this.config.debounceMs)
  }

  private scheduleStyleUpdate(): void {
    if (this.styleDebounceTimer) {
      return
    }

    this.styleDebounceTimer = setTimeout(() => {
      this.flushStyleUpdates()
    }, this.config.debounceMs)
  }

  private generateChecksum(properties: Record<string, PropertyValue>): string {
    const sortedKeys = Object.keys(properties).sort()
    const keyValues = sortedKeys.map(key => `${key}:${JSON.stringify(properties[key])}`)
    return this.simpleHash(keyValues.join('|'))
  }

  private deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true
    if (a == null || b == null) return false
    if (typeof a !== typeof b) return false

    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) return false
      if (Array.isArray(a)) {
        if (a.length !== b.length) return false
        for (let i = 0; i < a.length; i++) {
          if (!this.deepEqual(a[i], (b as unknown[])[i])) return false
        }
        return true
      } else {
        const keysA = Object.keys(a).sort()
        const keysB = Object.keys(b).sort()
        if (keysA.length !== keysB.length) return false
        for (let i = 0; i < keysA.length; i++) {
          const key = keysA[i]
          if (key !== keysB[i]) return false
          if (
            !this.deepEqual(
              (a as Record<string, unknown>)[key],
              (b as Record<string, unknown>)[key]
            )
          ) {
            return false
          }
        }
        return true
      }
    }

    return false
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // 转换为32位整数
    }
    return hash.toString(36)
  }
}

// 创建默认预览管理器实例
export const previewManager = new PreviewManager({
  debounceMs: 100,
  maxUpdates: 50,
  enableVirtualization: true,
  enableDiffOptimization: true,
  enableRealTimePreview: true,
  enableCanvasUpdates: true,
  maxCanvasUpdatesPerSecond: 60,
  enableTransitions: true,
  transitionDuration: 200,
})
