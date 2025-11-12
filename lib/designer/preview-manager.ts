/**
 * 实时预览管理器
 * 管理组件属性的实时预览和更新
 */

import type { PropertyValue } from '@/types/designer'

export interface PreviewConfig {
  debounceMs: number
  maxUpdates: number
  enableVirtualization: boolean
  enableDiffOptimization: boolean
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
  timestamp: number
  checksum: string
}

/**
 * 实时预览管理器
 */
export class PreviewManager {
  private updateQueue: PreviewUpdate[] = []
  private debounceTimer: NodeJS.Timeout | null = null
  private snapshots: Map<string, PreviewSnapshot> = new Map()
  private updateCallbacks: Set<(updates: PreviewUpdate[]) => void> = new Set()

  constructor(private config: PreviewConfig) {}

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
  createSnapshot(componentId: string, properties: Record<string, PropertyValue>): PreviewSnapshot {
    const snapshot: PreviewSnapshot = {
      componentId,
      properties: { ...properties },
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
   * 销毁预览管理器
   */
  destroy(): void {
    this.clearQueue()
    this.clearSnapshots()
    this.updateCallbacks.clear()
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
})
