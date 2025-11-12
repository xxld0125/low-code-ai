import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { debounce, throttle } from 'lodash-es'

/**
 * 属性配置面板专用性能优化工具
 * 针对属性编辑器的特殊需求进行优化
 */

// 属性变更接口
export interface PropertyChange {
  key: string
  value: any
  timestamp: number
  isBatch?: boolean
}

// 性能监控指标接口
export interface PerformanceMetrics {
  renderTime: number
  updateTime: number
  memoryUsage?: number
  componentCount: number
  isOptimal: boolean
}

/**
 * 防抖属性变更Hook
 * 专门用于属性编辑器的防抖处理，支持自适应延迟
 */
export function useDebouncedPropertyChange(
  onChange: (changes: PropertyChange[]) => void,
  options: {
    delay?: number | 'adaptive'
    maxDelay?: number
    minDelay?: number
    batchSize?: number
  } = {}
) {
  const { delay = 300, maxDelay = 1000, minDelay = 100, batchSize = 10 } = options

  const [pendingChanges, setPendingChanges] = useState<PropertyChange[]>([])
  const [adaptiveDelay, setAdaptiveDelay] = useState(delay === 'adaptive' ? 300 : delay)
  const changeTimesRef = useRef<number[]>([])
  const lastFlushTimeRef = useRef<number>(0)

  // 计算自适应延迟
  const calculateAdaptiveDelay = useCallback(() => {
    const now = Date.now()
    const recentChanges = changeTimesRef.current.filter(time => now - time < 5000)

    // 根据变更频率调整延迟
    if (recentChanges.length > 20) {
      return Math.min(maxDelay, Math.max(minDelay, 100)) // 高频：减少延迟
    } else if (recentChanges.length > 10) {
      return Math.min(maxDelay, Math.max(minDelay, 200)) // 中频：标准延迟
    } else {
      return Math.min(maxDelay, Math.max(minDelay, 400)) // 低频：增加延迟
    }
  }, [maxDelay, minDelay])

  // 创建防抖处理函数
  const debouncedFlush = useMemo(
    () =>
      debounce(
        (changes: PropertyChange[]) => {
          if (changes.length === 0) return

          const now = Date.now()
          changeTimesRef.current.push(now)
          changeTimesRef.current = changeTimesRef.current.filter(time => now - time < 5000)

          if (delay === 'adaptive') {
            setAdaptiveDelay(calculateAdaptiveDelay())
          }

          // 批量处理变更
          onChange(changes)
          setPendingChanges([])
          lastFlushTimeRef.current = now
        },
        delay === 'adaptive' ? adaptiveDelay : delay
      ),
    [onChange, delay, adaptiveDelay, calculateAdaptiveDelay]
  )

  // 添加属性变更
  const addPropertyChange = useCallback(
    (key: string, value: any) => {
      const change: PropertyChange = {
        key,
        value,
        timestamp: Date.now(),
        isBatch: pendingChanges.length > 0,
      }

      setPendingChanges(prev => {
        // 检查是否可以合并相同属性的变更
        const lastChange = prev[prev.length - 1]
        if (lastChange?.key === key) {
          return [...prev.slice(0, -1), change]
        }
        return [...prev, change]
      })

      // 达到批量大小时立即触发
      if (pendingChanges.length >= batchSize - 1) {
        debouncedFlush.flush()
      }
    },
    [pendingChanges.length, batchSize, debouncedFlush]
  )

  // 手动刷新
  const flushChanges = useCallback(() => {
    debouncedFlush.flush()
  }, [debouncedFlush])

  // 清理
  useEffect(() => {
    return () => {
      debouncedFlush.cancel()
    }
  }, [debouncedFlush])

  return {
    addPropertyChange,
    flushChanges,
    pendingChanges,
    adaptiveDelay: delay === 'adaptive' ? adaptiveDelay : delay,
  }
}

/**
 * 虚拟化属性列表Hook
 * 优化大量属性渲染的性能
 */
export function useVirtualizedPropertyList<T>(
  items: Array<{ id: string; data: T; height?: number }>,
  options: {
    itemHeight?: number
    overscan?: number
    enabled?: boolean
    containerHeight?: number
  } = {}
) {
  const { itemHeight = 60, overscan = 5, enabled = true, containerHeight = 400 } = options

  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // 计算可见范围
  const visibleRange = useMemo(() => {
    if (!enabled) {
      return { start: 0, end: items.length }
    }

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const end = Math.min(items.length, start + visibleCount + overscan * 2)

    return { start, end }
  }, [items.length, scrollTop, itemHeight, overscan, enabled, containerHeight])

  // 可见项目
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      ...item,
      index: visibleRange.start + index,
    }))
  }, [items, visibleRange])

  // 总高度
  const totalHeight = enabled ? items.length * itemHeight : 'auto'

  // 滚动处理
  const handleScroll = useCallback(
    throttle((e: React.UIEvent<HTMLDivElement>) => {
      if (!enabled) return
      setScrollTop(e.currentTarget.scrollTop)
    }, 16), // 60fps
    [enabled]
  )

  // 懒加载属性编辑器
  const observeElement = useCallback(
    (element: HTMLElement) => {
      if (!enabled || !observerRef.current) return

      observerRef.current.observe(element)
    },
    [enabled]
  )

  // 设置Intersection Observer
  useEffect(() => {
    if (!enabled) return

    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // 触发懒加载逻辑
            const element = entry.target as HTMLElement
            const lazyLoadEvent = new CustomEvent('lazyLoad', {
              detail: { element: element.dataset.propertyId },
            })
            element.dispatchEvent(lazyLoadEvent)
          }
        })
      },
      { rootMargin: '50px' }
    )

    return () => {
      observerRef.current?.disconnect()
    }
  }, [enabled])

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    scrollElementRef,
    observeElement,
    startIndex: visibleRange.start,
    endIndex: visibleRange.end,
  }
}

/**
 * 属性渲染性能监控Hook
 */
export function usePropertyPerformanceMonitor() {
  const renderTimesRef = useRef<number[]>([])
  const updateTimesRef = useRef<number[]>([])
  const memoryUsageRef = useRef<number[]>([])

  const startRenderTiming = useCallback(() => {
    const startTime = performance.now()
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      renderTimesRef.current.push(renderTime)

      // 保持最近100次的记录
      if (renderTimesRef.current.length > 100) {
        renderTimesRef.current = renderTimesRef.current.slice(-100)
      }

      return renderTime
    }
  }, [])

  const startUpdateTiming = useCallback(() => {
    const startTime = performance.now()
    return () => {
      const endTime = performance.now()
      const updateTime = endTime - startTime
      updateTimesRef.current.push(updateTime)

      // 保持最近100次的记录
      if (updateTimesRef.current.length > 100) {
        updateTimesRef.current = updateTimesRef.current.slice(-100)
      }

      return updateTime
    }
  }, [])

  const recordMemoryUsage = useCallback(() => {
    if ('memory' in performance && performance.memory) {
      const memoryUsage = performance.memory.usedJSHeapSize
      memoryUsageRef.current.push(memoryUsage)

      // 保持最近50次的记录
      if (memoryUsageRef.current.length > 50) {
        memoryUsageRef.current = memoryUsageRef.current.slice(-50)
      }
    }
  }, [])

  const getMetrics = useCallback((): PerformanceMetrics => {
    const renderTimes = renderTimesRef.current
    const updateTimes = updateTimesRef.current
    const memoryUsages = memoryUsageRef.current

    const avgRenderTime =
      renderTimes.length > 0
        ? renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length
        : 0

    const avgUpdateTime =
      updateTimes.length > 0
        ? updateTimes.reduce((sum, time) => sum + time, 0) / updateTimes.length
        : 0

    const avgMemoryUsage =
      memoryUsages.length > 0
        ? memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length
        : 0

    // 性能阈值：渲染时间<100ms，更新时间<50ms为良好
    const isOptimal = avgRenderTime < 100 && avgUpdateTime < 50

    return {
      renderTime: avgRenderTime,
      updateTime: avgUpdateTime,
      memoryUsage: avgMemoryUsage,
      componentCount: renderTimes.length,
      isOptimal,
    }
  }, [])

  const clearMetrics = useCallback(() => {
    renderTimesRef.current = []
    updateTimesRef.current = []
    memoryUsageRef.current = []
  }, [])

  return {
    startRenderTiming,
    startUpdateTiming,
    recordMemoryUsage,
    getMetrics,
    clearMetrics,
  }
}

/**
 * 智能缓存Hook
 * 用于缓存属性验证结果、计算值等
 */
export function usePropertyCache<T, R>(
  keyExtractor: (args: T) => string,
  options: {
    maxSize?: number
    ttl?: number
    strategy?: 'LRU' | 'FIFO' | 'LFU'
  } = {}
) {
  const { maxSize = 100, ttl = 5 * 60 * 1000, strategy = 'LRU' } = options

  const cacheRef = useRef<Map<string, { value: R; timestamp: number; accessCount: number }>>(
    new Map()
  )
  const accessOrderRef = useRef<string[]>([])

  const get = useCallback(
    (args: T): R | undefined => {
      const key = keyExtractor(args)
      const cached = cacheRef.current.get(key)

      if (!cached) {
        return undefined
      }

      // 检查TTL
      if (Date.now() - cached.timestamp > ttl) {
        cacheRef.current.delete(key)
        const index = accessOrderRef.current.indexOf(key)
        if (index > -1) {
          accessOrderRef.current.splice(index, 1)
        }
        return undefined
      }

      // 更新访问统计
      cached.accessCount++

      // 更新访问顺序（LRU）
      if (strategy === 'LRU') {
        const index = accessOrderRef.current.indexOf(key)
        if (index > -1) {
          accessOrderRef.current.splice(index, 1)
        }
        accessOrderRef.current.push(key)
      }

      return cached.value
    },
    [keyExtractor, ttl, strategy]
  )

  const set = useCallback(
    (args: T, value: R) => {
      const key = keyExtractor(args)

      // 检查缓存大小限制
      if (cacheRef.current.size >= maxSize && !cacheRef.current.has(key)) {
        // 根据策略删除缓存项
        let keyToDelete: string | null = null

        switch (strategy) {
          case 'LRU':
            keyToDelete = accessOrderRef.current[0]
            break
          case 'FIFO':
            keyToDelete = accessOrderRef.current[0]
            break
          case 'LFU':
            let minAccessCount = Infinity
            cacheRef.current.forEach((cached, cacheKey) => {
              if (cached.accessCount < minAccessCount) {
                minAccessCount = cached.accessCount
                keyToDelete = cacheKey
              }
            })
            break
        }

        if (keyToDelete) {
          cacheRef.current.delete(keyToDelete)
          const index = accessOrderRef.current.indexOf(keyToDelete)
          if (index > -1) {
            accessOrderRef.current.splice(index, 1)
          }
        }
      }

      // 添加新缓存项
      cacheRef.current.set(key, {
        value,
        timestamp: Date.now(),
        accessCount: 1,
      })

      if (!accessOrderRef.current.includes(key)) {
        accessOrderRef.current.push(key)
      }
    },
    [keyExtractor, maxSize, strategy]
  )

  const invalidate = useCallback(
    (args: T) => {
      const key = keyExtractor(args)
      cacheRef.current.delete(key)
      const index = accessOrderRef.current.indexOf(key)
      if (index > -1) {
        accessOrderRef.current.splice(index, 1)
      }
    },
    [keyExtractor]
  )

  const clear = useCallback(() => {
    cacheRef.current.clear()
    accessOrderRef.current = []
  }, [])

  const getStats = useCallback(() => {
    return {
      size: cacheRef.current.size,
      maxSize,
      hitRate: 0, // 需要额外跟踪命中率
      strategy,
    }
  }, [maxSize, strategy])

  return {
    get,
    set,
    invalidate,
    clear,
    getStats,
  }
}

/**
 * 属性编辑器性能优化工具集合
 */
export const PropertyPerformanceUtils = {
  // 检查是否需要虚拟化
  shouldVirtualize: (itemCount: number): boolean => itemCount > 50,

  // 检查是否需要防抖
  shouldDebounce: (changeFrequency: number): boolean => changeFrequency > 5, // 每秒超过5次变更

  // 计算最优防抖延迟
  calculateOptimalDelay: (changeFrequency: number): number => {
    if (changeFrequency > 20) return 100 // 高频：短延迟
    if (changeFrequency > 10) return 200 // 中频：标准延迟
    if (changeFrequency > 5) return 300 // 低频：较长延迟
    return 500 // 极低频：长延迟
  },

  // 检查内存使用情况
  getMemoryStatus: (): { usage: number; isHealthy: boolean } => {
    if ('memory' in performance && performance.memory) {
      const usage = performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize
      return {
        usage,
        isHealthy: usage < 0.8, // 80%以下为健康
      }
    }
    return { usage: 0, isHealthy: true }
  },

  // 建议性能优化措施
  getSuggestions: (metrics: PerformanceMetrics): string[] => {
    const suggestions: string[] = []

    if (metrics.renderTime > 100) {
      suggestions.push('考虑使用虚拟化来减少渲染项目')
    }

    if (metrics.updateTime > 50) {
      suggestions.push('增加防抖延迟以减少更新频率')
    }

    if (metrics.memoryUsage && metrics.memoryUsage > 50 * 1024 * 1024) {
      // 50MB
      suggestions.push('检查内存泄漏，考虑清理缓存')
    }

    if (!metrics.isOptimal) {
      suggestions.push('整体性能需要优化，建议检查组件渲染逻辑')
    }

    return suggestions
  },
}

export default PropertyPerformanceUtils
