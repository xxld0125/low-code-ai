/**
 * 样式缓存模块
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 * 功能: 样式缓存管理、性能优化、内存管理、缓存统计
 */

import type { ExtendedComponentStyles } from './styles'
import type { StyleProcessingResult } from './styles'
import type { ResponsiveResult } from './responsive'
import type { ValidationResult } from './validation'

/**
 * 缓存项
 */
interface CacheItem<T> {
  /** 缓存数据 */
  data: T
  /** 创建时间戳 */
  timestamp: number
  /** 最后访问时间戳 */
  lastAccessed: number
  /** 访问次数 */
  accessCount: number
  /** 缓存大小（字节） */
  size: number
  /** 过期时间（毫秒） */
  ttl?: number
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 最大缓存项数 */
  maxSize?: number
  /** 最大缓存大小（字节） */
  maxMemorySize?: number
  /** 默认TTL（毫秒） */
  defaultTTL?: number
  /** 清理间隔（毫秒） */
  cleanupInterval?: number
  /** 是否启用LRU淘汰 */
  enableLRU?: boolean
  /** 是否启用统计 */
  enableStats?: boolean
  /** 序列化选项 */
  serializeOptions?: {
    /** 是否压缩 */
    compress?: boolean
    /** 是否加密 */
    encrypt?: boolean
  }
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  /** 总缓存项数 */
  totalItems: number
  /** 总缓存大小 */
  totalSize: number
  /** 命中次数 */
  hits: number
  /** 未命中次数 */
  misses: number
  /** 命中率 */
  hitRate: number
  /** 淘汰次数 */
  evictions: number
  /** 过期次数 */
  expirations: number
  /** 最旧缓存项年龄 */
  oldestItemAge: number
  /** 最新缓存项年龄 */
  newestItemAge: number
  /** 平均访问次数 */
  averageAccessCount: number
}

/**
 * 缓存事件
 */
export interface CacheEvents<T = unknown> {
  /** 缓存命中 */
  hit: (key: string, item: CacheItem<T>) => void
  /** 缓存未命中 */
  miss: (key: string) => void
  /** 缓存设置 */
  set: (key: string, item: CacheItem<T>) => void
  /** 缓存删除 */
  delete: (key: string, item: CacheItem<T>) => void
  /** 缓存清理 */
  cleanup: (removedKeys: string[]) => void
  /** 缓存淘汰 */
  evict: (key: string, reason: 'size' | 'memory' | 'ttl') => void
}

/**
 * 样式缓存管理器
 */
export class StyleCacheManager<TData = unknown> {
  private cache = new Map<string, CacheItem<TData>>()
  private config: Required<CacheConfig>
  private stats: CacheStats
  private events: Partial<CacheEvents<TData>> = {}
  private cleanupTimer?: NodeJS.Timeout

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: 1000,
      maxMemorySize: 50 * 1024 * 1024, // 50MB
      defaultTTL: 30 * 60 * 1000, // 30分钟
      cleanupInterval: 5 * 60 * 1000, // 5分钟
      enableLRU: true,
      enableStats: true,
      serializeOptions: {
        compress: false,
        encrypt: false,
      },
      ...config,
    }

    this.stats = {
      totalItems: 0,
      totalSize: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      evictions: 0,
      expirations: 0,
      oldestItemAge: 0,
      newestItemAge: 0,
      averageAccessCount: 0,
    }

    // 启动清理定时器
    this.startCleanupTimer()
  }

  /**
   * 获取缓存项
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) {
      this.stats.misses++
      this.events.miss?.(key)
      this.updateStats()
      return null
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.cache.delete(key)
      this.stats.expirations++
      this.events.evict?.(key, 'ttl')
      this.stats.misses++
      this.events.miss?.(key)
      this.updateStats()
      return null
    }

    // 更新访问信息
    item.lastAccessed = Date.now()
    item.accessCount++

    this.stats.hits++
    this.events.hit?.(key, item)
    this.updateStats()

    return item.data as unknown as T
  }

  /**
   * 设置缓存项
   */
  set(key: string, data: TData, ttl?: number): void {
    const now = Date.now()
    const item: CacheItem<TData> = {
      data,
      timestamp: now,
      lastAccessed: now,
      accessCount: 1,
      size: this.calculateSize(data),
      ttl: ttl || this.config.defaultTTL,
    }

    // 检查是否需要清理空间
    this.ensureCapacity(item.size)

    this.cache.set(key, item)
    this.events.set?.(key, item)
    this.updateStats()
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    this.cache.delete(key)
    this.events.delete?.(key, item)
    this.updateStats()
    return true
  }

  /**
   * 检查缓存项是否存在
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    if (this.isExpired(item)) {
      this.cache.delete(key)
      this.stats.expirations++
      this.events.evict?.(key, 'ttl')
      this.updateStats()
      return false
    }

    return true
  }

  /**
   * 清空缓存
   */
  clear(): void {
    const allKeys = Array.from(this.cache.keys())
    this.cache.clear()
    this.events.cleanup?.(allKeys)
    this.resetStats()
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 获取缓存键列表
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * 设置事件监听器
   */
  on<K extends keyof CacheEvents>(event: K, callback: CacheEvents[K]): void {
    this.events[event] = callback
  }

  /**
   * 移除事件监听器
   */
  off<K extends keyof CacheEvents>(event: K): void {
    delete this.events[event]
  }

  /**
   * 手动清理过期项
   */
  cleanup(): number {
    // const now = Date.now() // Not currently used
    const removedKeys: string[] = []
    const entries = Array.from(this.cache.entries())

    for (const [key, item] of entries) {
      if (this.isExpired(item)) {
        removedKeys.push(key)
        this.cache.delete(key)
        this.stats.expirations++
        this.events.evict?.(key, 'ttl')
      }
    }

    if (removedKeys.length > 0) {
      this.events.cleanup?.(removedKeys)
      this.updateStats()
    }

    return removedKeys.length
  }

  /**
   * 预热缓存（批量设置）
   */
  warmup<T>(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    entries.forEach(({ key, data, ttl }) => {
      if (!this.has(key)) {
        this.set(key, data as unknown as TData, ttl)
      }
    })
  }

  /**
   * 获取最旧的缓存项
   */
  getOldestItems(count: number = 10): Array<{ key: string; item: CacheItem<TData> }> {
    const entries = Array.from(this.cache.entries())
    const items = entries
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      .slice(0, count)
      .map(([key, item]) => ({ key, item }))

    return items
  }

  /**
   * 获取最常访问的缓存项
   */
  getMostAccessedItems(count: number = 10): Array<{ key: string; item: CacheItem<TData> }> {
    const entries = Array.from(this.cache.entries())
    const items = entries
      .sort(([, a], [, b]) => b.accessCount - a.accessCount)
      .slice(0, count)
      .map(([key, item]) => ({ key, item }))

    return items
  }

  /**
   * 获取最大的缓存项
   */
  getLargestItems(count: number = 10): Array<{ key: string; item: CacheItem<TData> }> {
    const entries = Array.from(this.cache.entries())
    const items = entries
      .sort(([, a], [, b]) => b.size - a.size)
      .slice(0, count)
      .map(([key, item]) => ({ key, item }))

    return items
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
    this.clear()
    this.events = {}
  }

  /**
   * 确保有足够的容量
   */
  private ensureCapacity(requiredSize: number): void {
    // 检查项数限制
    while (this.cache.size >= this.config.maxSize) {
      this.evictLRU()
    }

    // 检查内存限制
    while (this.getCurrentMemorySize() + requiredSize > this.config.maxMemorySize) {
      this.evictLRU()
    }
  }

  /**
   * LRU淘汰
   */
  private evictLRU(): void {
    if (!this.config.enableLRU || this.cache.size === 0) return

    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.stats.evictions++
      this.events.evict?.(oldestKey, 'size')
    }
  }

  /**
   * 检查缓存项是否过期
   */
  private isExpired(item: CacheItem<TData>): boolean {
    if (!item.ttl) return false
    return Date.now() - item.timestamp > item.ttl
  }

  /**
   * 计算数据大小（粗略估计）
   */
  private calculateSize(data: TData): number {
    try {
      const jsonString = JSON.stringify(data)
      return new Blob([jsonString]).size
    } catch {
      return 1024 // 默认1KB
    }
  }

  /**
   * 获取当前内存使用量
   */
  private getCurrentMemorySize(): number {
    let totalSize = 0
    for (const item of this.cache.values()) {
      totalSize += item.size
    }
    return totalSize
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    if (!this.config.enableStats) return

    this.stats.totalItems = this.cache.size
    this.stats.totalSize = this.getCurrentMemorySize()
    this.stats.hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) || 0

    if (this.cache.size > 0) {
      const now = Date.now()
      const values = Array.from(this.cache.values())

      // 计算年龄统计
      const ages = values.map(item => now - item.timestamp)
      this.stats.oldestItemAge = Math.max(...ages)
      this.stats.newestItemAge = Math.min(...ages)

      // 计算平均访问次数
      const totalAccess = values.reduce((sum, item) => sum + item.accessCount, 0)
      this.stats.averageAccessCount = totalAccess / values.length
    } else {
      this.stats.oldestItemAge = 0
      this.stats.newestItemAge = 0
      this.stats.averageAccessCount = 0
    }
  }

  /**
   * 重置统计信息
   */
  private resetStats(): void {
    this.stats = {
      totalItems: 0,
      totalSize: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      evictions: 0,
      expirations: 0,
      oldestItemAge: 0,
      newestItemAge: 0,
      averageAccessCount: 0,
    }
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    if (this.config.cleanupInterval > 0) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup()
      }, this.config.cleanupInterval)
    }
  }
}

/**
 * 样式处理器缓存接口
 */
export interface StyleProcessorCache {
  /** 样式处理缓存 */
  styles: StyleCacheManager
  /** 响应式样式缓存 */
  responsive: StyleCacheManager
  /** 验证结果缓存 */
  validation: StyleCacheManager
}

/**
 * 样式处理器缓存工厂
 */
export class StyleProcessorCacheFactory {
  private static instances = new Map<string, StyleProcessorCache>()

  /**
   * 获取或创建缓存实例
   */
  static getInstance(name: string = 'default', config?: CacheConfig): StyleProcessorCache {
    if (!this.instances.has(name)) {
      const instance: StyleProcessorCache = {
        styles: new StyleCacheManager({ ...config, maxSize: 500 }),
        responsive: new StyleCacheManager({ ...config, maxSize: 300 }),
        validation: new StyleCacheManager({ ...config, maxSize: 200 }),
      }
      this.instances.set(name, instance)
    }
    return this.instances.get(name)!
  }

  /**
   * 销毁指定实例
   */
  static destroyInstance(name: string): boolean {
    const instance = this.instances.get(name)
    if (instance) {
      instance.styles.destroy()
      instance.responsive.destroy()
      instance.validation.destroy()
      return this.instances.delete(name)
    }
    return false
  }

  /**
   * 销毁所有实例
   */
  static destroyAll(): void {
    for (const name of this.instances.keys()) {
      this.destroyInstance(name)
    }
  }

  /**
   * 获取所有实例名称
   */
  static getInstanceNames(): string[] {
    return Array.from(this.instances.keys())
  }

  /**
   * 获取实例统计信息
   */
  static getStats(name: string): {
    styles: CacheStats
    responsive: CacheStats
    validation: CacheStats
  } | null {
    const instance = this.instances.get(name)
    if (!instance) return null

    return {
      styles: instance.styles.getStats(),
      responsive: instance.responsive.getStats(),
      validation: instance.validation.getStats(),
    }
  }
}

/**
 * 生成缓存键的辅助函数
 */
export class CacheKeyGenerator {
  /**
   * 生成样式处理缓存键
   */
  static generateStyleKey(
    styles: ExtendedComponentStyles,
    options?: Record<string, unknown>
  ): string {
    const key = `style:${JSON.stringify(styles)}:${JSON.stringify(options || {})}`
    return this.hash(key)
  }

  /**
   * 生成响应式样式缓存键
   */
  static generateResponsiveKey(
    styles: ExtendedComponentStyles,
    options?: Record<string, unknown>
  ): string {
    const key = `responsive:${JSON.stringify(styles)}:${JSON.stringify(options || {})}`
    return this.hash(key)
  }

  /**
   * 生成验证缓存键
   */
  static generateValidationKey(
    styles: ExtendedComponentStyles,
    options?: Record<string, unknown>
  ): string {
    const key = `validation:${JSON.stringify(styles)}:${JSON.stringify(options || {})}`
    return this.hash(key)
  }

  /**
   * 生成组件样式缓存键
   */
  static generateComponentKey(componentId: string, styles: ExtendedComponentStyles): string {
    const key = `component:${componentId}:${JSON.stringify(styles)}`
    return this.hash(key)
  }

  /**
   * 简单哈希函数
   */
  private static hash(str: string): string {
    let hash = 0
    if (str.length === 0) return hash.toString()

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // 转换为32位整数
    }

    return Math.abs(hash).toString(36)
  }
}

/**
 * 默认样式缓存实例
 */
export const defaultStyleCache = StyleProcessorCacheFactory.getInstance('default')

/**
 * 便捷函数：获取样式处理结果缓存
 */
export function getCachedStyleResult(key: string): StyleProcessingResult | null {
  return defaultStyleCache.styles.get<StyleProcessingResult>(key)
}

/**
 * 便捷函数：设置样式处理结果缓存
 */
export function setCachedStyleResult(
  key: string,
  result: StyleProcessingResult,
  ttl?: number
): void {
  defaultStyleCache.styles.set(key, result, ttl)
}

/**
 * 便捷函数：获取响应式样式结果缓存
 */
export function getCachedResponsiveResult(key: string): ResponsiveResult | null {
  return defaultStyleCache.responsive.get<ResponsiveResult>(key)
}

/**
 * 便捷函数：设置响应式样式结果缓存
 */
export function setCachedResponsiveResult(
  key: string,
  result: ResponsiveResult,
  ttl?: number
): void {
  defaultStyleCache.responsive.set(key, result, ttl)
}

/**
 * 便捷函数：获取验证结果缓存
 */
export function getCachedValidationResult(key: string): ValidationResult | null {
  return defaultStyleCache.validation.get<ValidationResult>(key)
}

/**
 * 便捷函数：设置验证结果缓存
 */
export function setCachedValidationResult(
  key: string,
  result: ValidationResult,
  ttl?: number
): void {
  defaultStyleCache.validation.set(key, result, ttl)
}
