/**
 * 性能优化工具
 * 提供防抖、节流、批量更新等性能优化功能
 */

/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(later, wait)

    if (callNow) {
      func(...args)
    }
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 批量更新处理器
 */
export class BatchUpdateProcessor<T> {
  private pendingUpdates = new Map<string, T>()
  private timeout: NodeJS.Timeout | null = null
  private callbacks = new Set<(updates: Map<string, T>) => void>()

  constructor(
    private delay = 16, // 默认16ms，约60fps
    private maxBatchSize = 50 // 最大批量大小
  ) {}

  /**
   * 添加更新
   */
  addUpdate(key: string, value: T): void {
    this.pendingUpdates.set(key, value)

    // 如果批量太大，立即处理
    if (this.pendingUpdates.size >= this.maxBatchSize) {
      this.flush()
    } else {
      this.scheduleUpdate()
    }
  }

  /**
   * 批量添加更新
   */
  addUpdates(updates: Record<string, T>): void {
    Object.entries(updates).forEach(([key, value]) => {
      this.addUpdate(key, value)
    })
  }

  /**
   * 立即处理所有待处理更新
   */
  flush(): void {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }

    if (this.pendingUpdates.size > 0) {
      const updates = new Map(this.pendingUpdates)
      this.pendingUpdates.clear()

      // 通知所有回调
      this.callbacks.forEach(callback => {
        try {
          callback(updates)
        } catch (error) {
          console.error('批量更新回调执行失败:', error)
        }
      })
    }
  }

  /**
   * 注册更新回调
   */
  onUpdate(callback: (updates: Map<string, T>) => void): () => void {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  /**
   * 移除特定更新
   */
  removeUpdate(key: string): void {
    this.pendingUpdates.delete(key)
  }

  /**
   * 清除所有待处理更新
   */
  clear(): void {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
    this.pendingUpdates.clear()
  }

  /**
   * 获取待处理更新数量
   */
  get pendingCount(): number {
    return this.pendingUpdates.size
  }

  /**
   * 调度更新
   */
  private scheduleUpdate(): void {
    if (!this.timeout) {
      this.timeout = setTimeout(() => {
        this.flush()
      }, this.delay)
    }
  }
}

/**
 * 样式更新性能优化器
 */
export class StyleUpdateOptimizer {
  private batchProcessor: BatchUpdateProcessor<{
    property: string
    value: unknown
    componentId: string
  }>
  private lastUpdateTime = 0
  private updateCount = 0
  private maxUpdatesPerSecond = 60

  constructor(maxUpdatesPerSecond = 60) {
    this.maxUpdatesPerSecond = maxUpdatesPerSecond
    this.batchProcessor = new BatchUpdateProcessor(1000 / maxUpdatesPerSecond)
  }

  /**
   * 添加样式更新
   */
  addStyleUpdate(
    componentId: string,
    property: string,
    value: unknown
  ): void {
    const key = `${componentId}.${property}`
    this.batchProcessor.addUpdate(key, {
      componentId,
      property,
      value
    })
  }

  /**
   * 批量添加样式更新
   */
  addStyleUpdates(
    componentId: string,
    updates: Record<string, unknown>
  ): void {
    Object.entries(updates).forEach(([property, value]) => {
      this.addStyleUpdate(componentId, property, value)
    })
  }

  /**
   * 检查是否应该触发更新
   */
  shouldUpdate(): boolean {
    const now = Date.now()
    const timeSinceLastUpdate = now - this.lastUpdateTime
    const minInterval = 1000 / this.maxUpdatesPerSecond

    return timeSinceLastUpdate >= minInterval
  }

  /**
   * 注册更新回调
   */
  onUpdate(callback: (updates: Map<string, {
    componentId: string
    property: string
    value: unknown
  }>) => void): () => void {
    return this.batchProcessor.onUpdate((updates) => {
      if (this.shouldUpdate()) {
        this.lastUpdateTime = Date.now()
        this.updateCount++
        callback(updates)
      }
    })
  }

  /**
   * 立即应用所有待处理更新
   */
  flush(): void {
    this.batchProcessor.flush()
  }

  /**
   * 重置统计信息
   */
  reset(): void {
    this.lastUpdateTime = 0
    this.updateCount = 0
  }

  /**
   * 获取性能统计
   */
  getStats(): {
    updateCount: number
    pendingCount: number
    updatesPerSecond: number
  } {
    return {
      updateCount: this.updateCount,
      pendingCount: this.batchProcessor.pendingCount,
      updatesPerSecond: this.maxUpdatesPerSecond
    }
  }
}

/**
 * 缓存管理器
 */
export class CacheManager<K, V> {
  private cache = new Map<string, { value: V; timestamp: number }>()
  private maxSize: number
  private ttl: number

  constructor(maxSize = 100, ttl = 5000) {
    this.maxSize = maxSize
    this.ttl = ttl
  }

  /**
   * 生成缓存键
   */
  private generateKey(key: K): string {
    return JSON.stringify(key)
  }

  /**
   * 设置缓存
   */
  set(key: K, value: V): void {
    const cacheKey = this.generateKey(key)
    const now = Date.now()

    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize && !this.cache.has(cacheKey)) {
      let oldestKey = ''
      let oldestTime = now

      this.cache.forEach((entry, key) => {
        if (entry.timestamp < oldestTime) {
          oldestTime = entry.timestamp
          oldestKey = key
        }
      })

      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(cacheKey, {
      value,
      timestamp: now
    })
  }

  /**
   * 获取缓存
   */
  get(key: K): V | null {
    const cacheKey = this.generateKey(key)
    const entry = this.cache.get(cacheKey)

    if (!entry) {
      return null
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(cacheKey)
      return null
    }

    return entry.value
  }

  /**
   * 清除缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 删除特定缓存
   */
  delete(key: K): void {
    this.cache.delete(this.generateKey(key))
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.ttl) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.cache.delete(key))
  }
}

/**
 * 性能监控工具
 */
export class PerformanceMonitor {
  private metrics = new Map<string, {
    count: number
    totalTime: number
    minTime: number
    maxTime: number
  }>()

  /**
   * 测量函数执行时间
   */
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now()
    try {
      const result = fn()
      this.recordMetric(name, performance.now() - start)
      return result
    } catch (error) {
      this.recordMetric(name, performance.now() - start)
      throw error
    }
  }

  /**
   * 异步测量函数执行时间
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      this.recordMetric(name, performance.now() - start)
      return result
    } catch (error) {
      this.recordMetric(name, performance.now() - start)
      throw error
    }
  }

  /**
   * 记录性能指标
   */
  private recordMetric(name: string, duration: number): void {
    const existing = this.metrics.get(name) || {
      count: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0
    }

    this.metrics.set(name, {
      count: existing.count + 1,
      totalTime: existing.totalTime + duration,
      minTime: Math.min(existing.minTime, duration),
      maxTime: Math.max(existing.maxTime, duration)
    })
  }

  /**
   * 获取性能指标
   */
  getMetrics(): Record<string, {
    count: number
    averageTime: number
    minTime: number
    maxTime: number
    totalTime: number
  }> {
    const result: Record<string, {
      count: number
      averageTime: number
      minTime: number
      maxTime: number
      totalTime: number
    }> = {}

    this.metrics.forEach((value, key) => {
      result[key] = {
        count: value.count,
        averageTime: value.totalTime / value.count,
        minTime: value.minTime === Infinity ? 0 : value.minTime,
        maxTime: value.maxTime,
        totalTime: value.totalTime
      }
    })

    return result
  }

  /**
   * 清除所有指标
   */
  clear(): void {
    this.metrics.clear()
  }

  /**
   * 清除特定指标
   */
  clearMetric(name: string): void {
    this.metrics.delete(name)
  }
}

// 创建全局实例
export const globalStyleOptimizer = new StyleUpdateOptimizer()
export const globalPerformanceMonitor = new PerformanceMonitor()