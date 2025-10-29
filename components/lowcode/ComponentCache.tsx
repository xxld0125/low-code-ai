/**
 * 组件缓存系统
 * 功能模块: 基础组件库 (004-basic-component-library) - T011任务
 * 创建日期: 2025-10-29
 * 用途: 提供组件实例缓存和懒加载功能，优化渲染性能
 */

import { ComponentType, ReactNode, Suspense, lazy, useMemo } from 'react'
import { ComponentDefinition, LowcodeComponentProps, StyleValue } from '@/types/lowcode'

// 缓存配置接口
interface CacheConfig {
  maxAge: number // 缓存过期时间（毫秒）
  maxSize: number // 最大缓存条目数
  enableLazyLoading: boolean // 是否启用懒加载
}

// 缓存条目接口
interface CacheEntry<T> {
  value: T
  timestamp: number
  accessCount: number
  lastAccessed: number
}

// 组件加载状态接口
interface ComponentLoadState {
  loading: boolean
  loaded: boolean
  error?: Error
  component?: ComponentType<any>
}

// 默认缓存配置
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxAge: 5 * 60 * 1000, // 5分钟
  maxSize: 100,
  enableLazyLoading: true,
}

/**
 * 通用LRU缓存实现
 */
class LRUCache<K, V> {
  private cache = new Map<K, CacheEntry<V>>()
  private maxSize: number
  private maxAge: number

  constructor(maxSize: number = 100, maxAge: number = 5 * 60 * 1000) {
    this.maxSize = maxSize
    this.maxAge = maxAge
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key)

    if (!entry) {
      return undefined
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key)
      return undefined
    }

    // 更新访问信息
    entry.accessCount++
    entry.lastAccessed = Date.now()

    // 重新插入以更新顺序（LRU）
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.value
  }

  set(key: K, value: V): void {
    // 如果缓存已满，删除最久未访问的条目
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    const entry: CacheEntry<V> = {
      value,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
    }

    this.cache.set(key, entry)
  }

  has(key: K): boolean {
    const entry = this.cache.get(key)
    return entry !== undefined
  }

  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  keys(): K[] {
    return Array.from(this.cache.keys())
  }

  // 获取缓存统计信息
  getStats() {
    const entries = Array.from(this.cache.values())
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalAccesses: entries.reduce((sum, entry) => sum + entry.accessCount, 0),
      averageAccesses:
        entries.length > 0
          ? entries.reduce((sum, entry) => sum + entry.accessCount, 0) / entries.length
          : 0,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(entry => entry.timestamp)) : 0,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(entry => entry.timestamp)) : 0,
    }
  }
}

/**
 * 组件缓存管理器
 */
export class ComponentCacheManager {
  private static instance: ComponentCacheManager
  private componentCache: LRUCache<string, ComponentType<any>>
  private styleCache: LRUCache<string, React.CSSProperties>
  private propCache: LRUCache<string, any>
  private loadStates = new Map<string, ComponentLoadState>()
  private config: CacheConfig

  private constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config }
    this.componentCache = new LRUCache(this.config.maxSize, this.config.maxAge)
    this.styleCache = new LRUCache(this.config.maxSize * 2, this.config.maxAge)
    this.propCache = new LRUCache(this.config.maxSize * 3, this.config.maxAge)
  }

  static getInstance(config?: Partial<CacheConfig>): ComponentCacheManager {
    if (!ComponentCacheManager.instance) {
      ComponentCacheManager.instance = new ComponentCacheManager(config)
    }
    return ComponentCacheManager.instance
  }

  /**
   * 缓存组件
   */
  cacheComponent(key: string, component: ComponentType<any>): void {
    this.componentCache.set(key, component)
  }

  /**
   * 获取缓存的组件
   */
  getCachedComponent(key: string): ComponentType<any> | undefined {
    return this.componentCache.get(key)
  }

  /**
   * 缓存样式计算结果
   */
  cacheStyle(key: string, styles: React.CSSProperties): void {
    this.styleCache.set(key, styles)
  }

  /**
   * 获取缓存的样式
   */
  getCachedStyle(key: string): React.CSSProperties | undefined {
    return this.styleCache.get(key)
  }

  /**
   * 缓存属性合并结果
   */
  cacheProps(key: string, props: any): void {
    this.propCache.set(key, props)
  }

  /**
   * 获取缓存的属性
   */
  getCachedProps(key: string): any {
    return this.propCache.get(key)
  }

  /**
   * 获取组件加载状态
   */
  getLoadState(key: string): ComponentLoadState {
    if (!this.loadStates.has(key)) {
      this.loadStates.set(key, {
        loading: false,
        loaded: false,
      })
    }
    return this.loadStates.get(key)!
  }

  /**
   * 更新组件加载状态
   */
  updateLoadState(key: string, state: Partial<ComponentLoadState>): void {
    const current = this.getLoadState(key)
    this.loadStates.set(key, { ...current, ...state })
  }

  /**
   * 懒加载组件
   */
  async loadComponentLazy(
    componentType: string,
    loader: () => Promise<{ default: ComponentType<any> }>
  ): Promise<ComponentType<any>> {
    const loadState = this.getLoadState(componentType)

    // 如果已经在加载中，返回现有Promise
    if (loadState.loading) {
      return new Promise((resolve, reject) => {
        const checkState = () => {
          const state = this.getLoadState(componentType)
          if (state.loaded && state.component) {
            resolve(state.component)
          } else if (state.error) {
            reject(state.error)
          } else {
            setTimeout(checkState, 50)
          }
        }
        checkState()
      })
    }

    // 如果已经加载完成，直接返回
    if (loadState.loaded && loadState.component) {
      return loadState.component
    }

    // 开始加载
    this.updateLoadState(componentType, { loading: true })

    try {
      const loadedModule = await loader()
      const component = loadedModule.default

      // 缓存组件
      this.cacheComponent(componentType, component)

      // 更新状态
      this.updateLoadState(componentType, {
        loading: false,
        loaded: true,
        component,
      })

      return component
    } catch (error) {
      // 更新错误状态
      this.updateLoadState(componentType, {
        loading: false,
        loaded: false,
        error: error as Error,
      })

      throw error
    }
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.componentCache.clear()
    this.styleCache.clear()
    this.propCache.clear()
    this.loadStates.clear()
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      components: this.componentCache.getStats(),
      styles: this.styleCache.getStats(),
      props: this.propCache.getStats(),
      loadStates: {
        total: this.loadStates.size,
        loading: Array.from(this.loadStates.values()).filter(state => state.loading).length,
        loaded: Array.from(this.loadStates.values()).filter(state => state.loaded).length,
        errors: Array.from(this.loadStates.values()).filter(state => state.error).length,
      },
    }
  }

  /**
   * 预热缓存
   */
  async preloadComponents(
    components: Array<{ type: string; loader: () => Promise<{ default: ComponentType<any> }> }>
  ): Promise<void> {
    const promises = components.map(async ({ type, loader }) => {
      try {
        await this.loadComponentLazy(type, loader)
      } catch (error) {
        console.warn(`Failed to preload component ${type}:`, error)
      }
    })

    await Promise.allSettled(promises)
  }
}

/**
 * 生成缓存键的工具函数
 */
export const generateCacheKeys = {
  // 组件缓存键
  component: (componentType: string, variant?: string) =>
    `component:${componentType}${variant ? `:${variant}` : ''}`,

  // 样式缓存键
  style: (componentType: string, styles: StyleValue, breakpoint?: string) => {
    const styleHash = JSON.stringify(styles)
    const breakpointPart = breakpoint ? `:${breakpoint}` : ''
    return `style:${componentType}:${btoa(styleHash).slice(0, 8)}${breakpointPart}`
  },

  // 属性缓存键
  props: (componentType: string, defaultProps: any, customProps: any) => {
    const propsHash = JSON.stringify({ defaultProps, customProps })
    return `props:${componentType}:${btoa(propsHash).slice(0, 8)}`
  },
}

/**
 * React Hook for component cache
 */
export const useComponentCache = () => {
  return useMemo(() => ComponentCacheManager.getInstance(), [])
}

/**
 * 懒加载组件包装器
 */
export const LazyComponentWrapper: React.FC<{
  componentType: string
  loader: () => Promise<{ default: ComponentType<any> }>
  fallback?: ReactNode
  props?: any
}> = ({ componentType, loader, fallback, props }) => {
  const cacheManager = useComponentCache()

  const LazyComponent = useMemo(() => {
    return lazy(async () => {
      const component = await cacheManager.loadComponentLazy(componentType, loader)
      return { default: component }
    })
  }, [componentType, loader, cacheManager])

  return (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

/**
 * 缓存优化的样式计算Hook
 */
export const useCachedStyles = (
  componentType: string,
  styles: StyleValue,
  breakpoint?: string
): React.CSSProperties => {
  const cacheManager = useComponentCache()

  return useMemo(() => {
    const cacheKey = generateCacheKeys.style(componentType, styles, breakpoint)

    let computedStyles = cacheManager.getCachedStyle(cacheKey)

    if (!computedStyles) {
      // 这里可以添加样式计算逻辑
      computedStyles = styles as React.CSSProperties

      // 缓存计算结果
      cacheManager.cacheStyle(cacheKey, computedStyles)
    }

    return computedStyles
  }, [componentType, styles, breakpoint, cacheManager])
}

/**
 * 缓存优化的属性合并Hook
 */
export const useCachedProps = (componentType: string, defaultProps: any, customProps: any): any => {
  const cacheManager = useComponentCache()

  return useMemo(() => {
    const cacheKey = generateCacheKeys.props(componentType, defaultProps, customProps)

    let mergedProps = cacheManager.getCachedProps(cacheKey)

    if (!mergedProps) {
      // 合并默认属性和自定义属性
      mergedProps = {
        ...defaultProps,
        ...customProps,
      }

      // 缓存合并结果
      cacheManager.cacheProps(cacheKey, mergedProps)
    }

    return mergedProps
  }, [componentType, defaultProps, customProps, cacheManager])
}

// 导出LRUCache类
export { LRUCache }
