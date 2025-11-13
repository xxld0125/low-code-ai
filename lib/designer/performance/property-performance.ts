/**
 * 属性配置性能优化工具
 *
 * 提供各种性能优化功能：
 * - 智能缓存
 * - 防抖和节流
 * - 懒加载
 * - 批量操作
 * - 性能监控
 */

import { useCallback, useRef, useEffect, useMemo } from 'react'
import { debounce, throttle } from 'lodash-es'

// 性能配置接口
export interface PerformanceConfig {
  enableCaching?: boolean
  cacheSize?: number
  debounceDelay?: number
  throttleDelay?: number
  enableLazyLoading?: boolean
  enableBatching?: boolean
  batchSize?: number
  performanceMonitoring?: boolean
}

// 缓存项接口
interface CacheItem<T> {
  value: T
  timestamp: number
  accessCount: number
  lastAccessed: number
}

// 智能缓存类
export class PropertyCache<T> {
  private cache = new Map<string, CacheItem<T>>()
  private maxSize: number
  private enableTTL: boolean
  private ttl: number

  constructor(maxSize = 100, enableTTL = true, ttl = 5 * 60 * 1000) { // 5分钟默认TTL
    this.maxSize = maxSize
    this.enableTTL = enableTTL
    this.ttl = ttl
  }

  set(key: string, value: T): void {
    // 如果缓存已满，移除最少使用的项
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    const now = Date.now()
    this.cache.set(key, {
      value,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now,
    })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    // 检查TTL
    if (this.enableTTL && Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    // 更新访问统计
    item.accessCount++
    item.lastAccessed = Date.now()

    return item.value
  }

  has(key: string): boolean {
    return this.cache.has(key) && this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  // 移除最少使用的项
  private evictLRU(): void {
    let lruKey = ''
    let lruTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < lruTime) {
        lruTime = item.lastAccessed
        lruKey = key
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey)
    }
  }

  // 获取缓存统计
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    mostAccessed: Array<{ key: string; accessCount: number }>
  } {
    const items = Array.from(this.cache.entries())
    const totalAccess = items.reduce((sum, [, item]) => sum + item.accessCount, 0)
    const mostAccessed = items
      .map(([key, item]) => ({ key, accessCount: item.accessCount }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 5)

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalAccess > 0 ? (totalAccess - items.length) / totalAccess : 0,
      mostAccessed,
    }
  }
}

// 性能监控类
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>()
  private maxSamples = 100

  recordOperation(name: string, duration: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const samples = this.metrics.get(name)!
    samples.push(duration)

    // 限制样本数量
    if (samples.length > this.maxSamples) {
      samples.shift()
    }
  }

  getStats(name: string): {
    count: number
    average: number
    min: number
    max: number
    p95: number
    p99: number
  } | null {
    const samples = this.metrics.get(name)
    if (!samples || samples.length === 0) return null

    const sorted = [...samples].sort((a, b) => a - b)
    const count = sorted.length

    return {
      count,
      average: sorted.reduce((sum, val) => sum + val, 0) / count,
      min: sorted[0],
      max: sorted[count - 1],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)],
    }
  }

  getAllStats(): Record<string, ReturnType<typeof this.getStats>> {
    const stats: Record<string, ReturnType<typeof this.getStats>> = {}
    for (const name of this.metrics.keys()) {
      stats[name] = this.getStats(name)
    }
    return stats
  }

  clear(): void {
    this.metrics.clear()
  }
}

// 批量操作队列
export class BatchOperationQueue<T> {
  private queue: T[] = []
  private batchSize: number
  private processBatch: (items: T[]) => Promise<void>
  private timeoutId: NodeJS.Timeout | null = null
  private delay: number

  constructor(
    processBatch: (items: T[]) => Promise<void>,
    batchSize = 10,
    delay = 100
  ) {
    this.processBatch = processBatch
    this.batchSize = batchSize
    this.delay = delay
  }

  add(item: T): void {
    this.queue.push(item)

    if (this.queue.length >= this.batchSize) {
      this.flush()
    } else if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => {
        this.flush()
      }, this.delay)
    }
  }

  async flush(): Promise<void> {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }

    if (this.queue.length === 0) return

    const batch = [...this.queue]
    this.queue = []

    try {
      await this.processBatch(batch)
    } catch (error) {
      console.error('Batch operation failed:', error)
    }
  }

  size(): number {
    return this.queue.length
  }

  clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    this.queue = []
  }
}

// Hook for performance optimization
export const usePropertyPerformance = (config: PerformanceConfig = {}) => {
  const {
    enableCaching = true,
    cacheSize = 100,
    debounceDelay = 300,
    throttleDelay = 100,
    enableLazyLoading = false,
    enableBatching = true,
    batchSize = 10,
    performanceMonitoring = true,
  } = config

  // 缓存实例
  const cacheRef = useRef<PropertyCache<any> | null>(
    enableCaching ? new PropertyCache(cacheSize) : null
  )

  // 性能监控实例
  const monitorRef = useRef<PerformanceMonitor | null>(
    performanceMonitoring ? new PerformanceMonitor() : null
  )

  // 批量操作队列
  const batchQueueRef = useRef<BatchOperationQueue<any> | null>(
    enableBatching ? new BatchOperationQueue(
      async (items: any[]) => {
        // 默认批量处理逻辑
        console.log('Processing batch:', items)
      },
      batchSize
    ) : null
  )

  // 缓存操作
  const getCached = useCallback(<T>(key: string): T | null => {
    if (!cacheRef.current) return null
    return cacheRef.current.get(key)
  }, [])

  const setCached = useCallback(<T>(key: string, value: T): void => {
    if (!cacheRef.current) return
    cacheRef.current.set(key, value)
  }, [])

  const hasCached = useCallback((key: string): boolean => {
    if (!cacheRef.current) return false
    return cacheRef.current.has(key)
  }, [])

  const deleteCached = useCallback((key: string): boolean => {
    if (!cacheRef.current) return false
    return cacheRef.current.delete(key)
  }, [])

  const clearCache = useCallback((): void => {
    if (cacheRef.current) {
      cacheRef.current.clear()
    }
  }, [])

  // 性能监控
  const recordPerformance = useCallback((name: string, duration: number): void => {
    if (monitorRef.current) {
      monitorRef.current.recordOperation(name, duration)
    }
  }, [])

  const getPerformanceStats = useCallback((): Record<string, any> => {
    if (!monitorRef.current) return {}
    return monitorRef.current.getAllStats()
  }, [])

  const clearPerformanceStats = useCallback((): void => {
    if (monitorRef.current) {
      monitorRef.current.clear()
    }
  }, [])

  // 防抖函数
  const createDebouncedFunction = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay = debounceDelay
  ): T => {
    return debounce(func, delay) as T
  }, [debounceDelay])

  // 节流函数
  const createThrottledFunction = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay = throttleDelay
  ): T => {
    return throttle(func, delay) as T
  }, [throttleDelay])

  // 性能测量装饰器
  const withPerformanceTracking = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    name: string
  ): T => {
    return ((...args: any[]) => {
      const startTime = performance.now()
      try {
        const result = func(...args)
        if (result instanceof Promise) {
          return result.finally(() => {
            const duration = performance.now() - startTime
            recordPerformance(name, duration)
          })
        } else {
          const duration = performance.now() - startTime
          recordPerformance(name, duration)
          return result
        }
      } catch (error) {
        const duration = performance.now() - startTime
        recordPerformance(name, duration)
        throw error
      }
    }) as T
  }, [recordPerformance])

  // 批量操作
  const addToBatch = useCallback(<T>(item: T): void => {
    if (batchQueueRef.current) {
      batchQueueRef.current.add(item)
    }
  }, [])

  const flushBatch = useCallback(async (): Promise<void> => {
    if (batchQueueRef.current) {
      await batchQueueRef.current.flush()
    }
  }, [])

  // 懒加载
  const createLazyLoader = useCallback(<T>(
    loader: () => Promise<T>,
    cacheKey?: string
  ): () => Promise<T> => {
    let cachedPromise: Promise<T> | null = null

    return async (): Promise<T> => {
      // 检查缓存
      if (cacheKey && hasCached(cacheKey)) {
        return getCached(cacheKey)
      }

      // 检查是否已有进行中的加载
      if (!cachedPromise) {
        cachedPromise = loader()
      }

      try {
        const result = await cachedPromise

        // 缓存结果
        if (cacheKey) {
          setCached(cacheKey, result)
        }

        return result
      } catch (error) {
        cachedPromise = null // 重置以允许重试
        throw error
      }
    }
  }, [getCached, setCached, hasCached])

  // 清理函数
  useEffect(() => {
    return () => {
      if (batchQueueRef.current) {
        batchQueueRef.current.clear()
      }
    }
  }, [])

  return {
    // 缓存
    getCached,
    setCached,
    hasCached,
    deleteCached,
    clearCache,

    // 性能监控
    recordPerformance,
    getPerformanceStats,
    clearPerformanceStats,

    // 工具函数
    createDebouncedFunction,
    createThrottledFunction,
    withPerformanceTracking,
    createLazyLoader,

    // 批量操作
    addToBatch,
    flushBatch,

    // 配置
    config: {
      enableCaching,
      cacheSize,
      debounceDelay,
      throttleDelay,
      enableLazyLoading,
      enableBatching,
      batchSize,
      performanceMonitoring,
    },
  }
}

// 全局性能实例
export const globalPropertyPerformance = usePropertyPerformance({
  enableCaching: true,
  cacheSize: 200,
  performanceMonitoring: true,
})

// 便捷的性能工具函数
export const debouncePropertyUpdate = <T extends (...args: any[]) => any>(
  func: T,
  delay = 300
): T => {
  return globalPropertyPerformance.createDebouncedFunction(func, delay)
}

export const throttlePropertyUpdate = <T extends (...args: any[]) => any>(
  func: T,
  delay = 100
): T => {
  return globalPropertyPerformance.createThrottledFunction(func, delay)
}

export const cacheProperty = <T>(key: string, value: T): void => {
  globalPropertyPerformance.setCached(key, value)
}

export const getCachedProperty = <T>(key: string): T | null => {
  return globalPropertyPerformance.getCached<T>(key)
}