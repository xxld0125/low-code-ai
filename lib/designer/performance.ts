import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { debounce, throttle } from 'lodash-es'

/**
 * Performance optimization utilities for large schemas
 */

/**
 * Virtual scrolling utilities
 */

export interface VirtualScrollItem<T = unknown> {
  id: string
  height?: number
  data: T
}

export interface VirtualScrollOptions<T = unknown> {
  itemHeight?: number | ((index: number, item: VirtualScrollItem<T>) => number)
  overscan?: number
  scrollElement?: HTMLElement | Window
  enabled?: boolean
}

/**
 * Hook for virtual scrolling
 */
export function useVirtualScroll<T = unknown>(
  items: VirtualScrollItem<T>[],
  options: VirtualScrollOptions<T> = {}
) {
  const { itemHeight = 50, overscan = 5, scrollElement = window, enabled = true } = options

  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate visible items
  const visibleRange = useMemo(() => {
    if (!enabled) {
      return { start: 0, end: items.length }
    }

    let start = 0
    let accumulatedHeight = 0
    const end = items.length

    // Find start index based on scroll position
    for (let i = 0; i < items.length; i++) {
      const height = typeof itemHeight === 'function' ? itemHeight(i, items[i]) : itemHeight

      if (accumulatedHeight + height > scrollTop) {
        start = Math.max(0, i - overscan)
        break
      }
      accumulatedHeight += height
    }

    // Find end index
    let visibleHeight = 0
    for (let i = start; i < items.length; i++) {
      const height = typeof itemHeight === 'function' ? itemHeight(i, items[i]) : itemHeight

      visibleHeight += height
      if (visibleHeight > containerHeight) {
        return {
          start,
          end: Math.min(items.length, i + overscan),
        }
      }
    }

    return { start, end }
  }, [items, scrollTop, containerHeight, itemHeight, overscan, enabled])

  // Calculate total height
  const totalHeight = useMemo(() => {
    if (!enabled) return 'auto'

    return items.reduce((height, item, index) => {
      const currentItemHeight =
        typeof itemHeight === 'function' ? itemHeight(index, item) : itemHeight
      return height + currentItemHeight
    }, 0)
  }, [items, itemHeight, enabled])

  // Handle scroll events
  const handleScroll = useMemo(
    () =>
      throttle(() => {
        if (!enabled) return

        const element =
          scrollElement === window ? document.documentElement : (scrollElement as HTMLElement)

        setScrollTop(element.scrollTop)
      }, 16), // 60fps
    [scrollElement, enabled]
  )

  // Setup scroll listener
  useEffect(() => {
    if (!enabled) return

    const element = scrollElement === window ? window : scrollElement
    element.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      element.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll, scrollElement, enabled])

  // Setup container resize observer
  useEffect(() => {
    if (!enabled || !containerRef.current) return

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0]
      if (entry) {
        setContainerHeight(entry.contentRect.height)
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [enabled])

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end)
  }, [items, visibleRange])

  // Calculate offset for positioning
  const offsetY = useMemo(() => {
    if (!enabled) return 0

    let offset = 0
    for (let i = 0; i < visibleRange.start; i++) {
      offset += typeof itemHeight === 'function' ? itemHeight(i, items[i]) : itemHeight
    }
    return offset
  }, [visibleRange.start, items, itemHeight, enabled])

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    startIndex: visibleRange.start,
    endIndex: visibleRange.end,
  }
}

/**
 * Memoization utilities
 */

/**
 * Deep memoization hook
 */
export function useDeepMemo<T>(value: T, deps: React.DependencyList): T {
  const ref = useRef<{ value: T; deps: React.DependencyList } | undefined>(undefined)

  if (!ref.current || !deps.every((dep, i) => Object.is(dep, ref.current!.deps[i]))) {
    ref.current = { value, deps }
  }

  return ref.current!.value
}

/**
 * Stable callback hook
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList = []
): T {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps

  return useCallback(((...args) => callbackRef.current(...args)) as T, [])
}

/**
 * Debounced state hook
 */
export function useDebouncedState<T>(initialValue: T, delay: number): [T, T, (value: T) => void] {
  const [value, setValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)

  const debouncedSetValue = useMemo(
    () =>
      debounce((newValue: T) => {
        setDebouncedValue(newValue)
      }, delay),
    [delay]
  )

  useEffect(() => {
    debouncedSetValue(value)
    return debouncedSetValue.cancel
  }, [value, debouncedSetValue])

  return [value, debouncedValue, setValue]
}

/**
 * Throttled state hook
 */
export function useThrottledState<T>(initialValue: T, delay: number): [T, (value: T) => void] {
  const [value, setValue] = useState(initialValue)

  const throttledSetValue = useMemo(
    () =>
      throttle((newValue: T) => {
        setValue(newValue)
      }, delay),
    [delay]
  )

  useEffect(() => {
    return throttledSetValue.cancel
  }, [throttledSetValue])

  return [value, throttledSetValue]
}

/**
 * Resource management utilities
 */

/**
 * Hook for managing cached resources
 */
export function useResourceCache<K, V>(
  fetcher: (key: K) => Promise<V>,
  options: {
    maxSize?: number
    ttl?: number
  } = {}
) {
  const { maxSize = 100, ttl = 5 * 60 * 1000 } = options // 5 minutes default TTL

  const cacheRef = useRef<Map<string, { value: V; timestamp: number }>>(new Map())

  const get = useCallback(
    async (key: K): Promise<V> => {
      const cacheKey = JSON.stringify(key)
      const cached = cacheRef.current.get(cacheKey)

      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.value
      }

      // Remove oldest items if cache is full
      if (cacheRef.current.size >= maxSize) {
        const oldestKey = cacheRef.current.keys().next().value
        if (oldestKey) {
          cacheRef.current.delete(oldestKey)
        }
      }

      const value = await fetcher(key)
      cacheRef.current.set(cacheKey, {
        value,
        timestamp: Date.now(),
      })

      return value
    },
    [fetcher, maxSize, ttl]
  )

  const invalidate = useCallback((key: K) => {
    const cacheKey = JSON.stringify(key)
    cacheRef.current.delete(cacheKey)
  }, [])

  const clear = useCallback(() => {
    cacheRef.current.clear()
  }, [])

  return { get, invalidate, clear }
}

/**
 * Background processing utilities
 */

/**
 * Hook for background processing
 */
export function useBackgroundProcessor<T, R>(
  processor: (items: T[]) => Promise<R[]>,
  options: {
    batchSize?: number
    delay?: number
    enabled?: boolean
  } = {}
) {
  const { batchSize = 10, delay = 100, enabled = true } = options
  const [isProcessing, setIsProcessing] = useState(false)
  const [queue, setQueue] = useState<T[]>([])
  const [results, setResults] = useState<R[]>([])

  const processQueue = useCallback(async () => {
    if (!enabled || queue.length === 0 || isProcessing) return

    setIsProcessing(true)

    try {
      const batch = queue.slice(0, batchSize)
      const batchResults = await processor(batch)

      setResults(prev => [...prev, ...batchResults])
      setQueue(prev => prev.slice(batchSize))
    } catch (error) {
      console.error('Background processing error:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [queue, processor, batchSize, enabled, isProcessing])

  // Process queue in batches
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      processQueue()
    }, delay)

    return () => clearInterval(interval)
  }, [processQueue, delay, enabled])

  const addToQueue = useCallback((items: T[]) => {
    setQueue(prev => [...prev, ...items])
  }, [])

  const clearQueue = useCallback(() => {
    setQueue([])
    setResults([])
  }, [])

  return {
    addToQueue,
    clearQueue,
    isProcessing,
    queueSize: queue.length,
    results,
  }
}

/**
 * Performance monitoring utilities
 */

/**
 * Performance metrics hook
 */
export function usePerformanceMonitor() {
  const metricsRef = useRef<Map<string, number[]>>(new Map())

  const startTiming = useCallback((name: string) => {
    const startTime = performance.now()
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime

      if (!metricsRef.current.has(name)) {
        metricsRef.current.set(name, [])
      }
      metricsRef.current.get(name)!.push(duration)

      return duration
    }
  }, [])

  const getMetrics = useCallback((name: string) => {
    const times = metricsRef.current.get(name) || []
    if (times.length === 0) return null

    const sorted = [...times].sort((a, b) => a - b)
    return {
      count: times.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: times.reduce((sum, time) => sum + time, 0) / times.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    }
  }, [])

  const getAllMetrics = useCallback(() => {
    const allMetrics: Record<string, ReturnType<typeof getMetrics>> = {}
    for (const name of metricsRef.current.keys()) {
      allMetrics[name] = getMetrics(name)
    }
    return allMetrics
  }, [getMetrics])

  const clearMetrics = useCallback((name?: string) => {
    if (name) {
      metricsRef.current.delete(name)
    } else {
      metricsRef.current.clear()
    }
  }, [])

  return {
    startTiming,
    getMetrics,
    getAllMetrics,
    clearMetrics,
  }
}

/**
 * Memory management utilities
 */

/**
 * Hook for managing memory with cleanup
 */
export function useMemoryManager() {
  const cleanupFunctions = useRef<(() => void)[]>([])

  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.push(cleanup)
  }, [])

  const cleanup = useCallback(() => {
    cleanupFunctions.current.forEach(cleanup => {
      try {
        cleanup()
      } catch (error) {
        console.error('Cleanup error:', error)
      }
    })
    cleanupFunctions.current = []
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  return { addCleanup, cleanup }
}

/**
 * Lazy loading utilities
 */

/**
 * Hook for lazy loading components
 */
export function useLazyLoader<T>(
  loader: () => Promise<T>,
  options: {
    fallback?: React.ReactNode
    errorFallback?: React.ReactNode
    preload?: boolean
  } = {}
) {
  const { fallback = null, errorFallback = null, preload = false } = options
  const [component, setComponent] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadComponent = useCallback(async () => {
    if (component || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const loadedComponent = await loader()
      setComponent(loadedComponent)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load component'))
    } finally {
      setIsLoading(false)
    }
  }, [loader, component, isLoading])

  // Preload if requested
  useEffect(() => {
    if (preload) {
      loadComponent()
    }
  }, [preload, loadComponent])

  return {
    component,
    isLoading,
    error,
    load: loadComponent,
    fallback: isLoading ? fallback : error ? errorFallback : null,
  }
}

/**
 * Intersection observer for lazy loading
 */
export function useIntersectionObserver(options: IntersectionObserverInit = {}) {
  const [entries, setEntries] = useState<IntersectionObserverEntry[]>([])
  const observerRef = useRef<IntersectionObserver | null>(null)

  const observe = useCallback(
    (element: Element) => {
      if (!observerRef.current) {
        observerRef.current = new IntersectionObserver(setEntries, options)
      }
      observerRef.current.observe(element)
    },
    [options]
  )

  const unobserve = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element)
    }
  }, [])

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
  }, [])

  useEffect(() => {
    return disconnect
  }, [disconnect])

  return { entries, observe, unobserve, disconnect }
}

/**
 * Performance-optimized state management
 */

/**
 * Hook for optimized state updates
 */
export function useOptimizedState<T>(
  initialValue: T,
  options: {
    batchSize?: number
    delay?: number
    shouldBatch?: (prev: T, next: T) => boolean
  } = {}
) {
  const { batchSize = 10, delay = 16, shouldBatch } = options
  const [state, setState] = useState(initialValue)
  const pendingUpdates = useRef<Array<(prev: T) => T>>([])
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const flushUpdates = useCallback(() => {
    if (pendingUpdates.current.length === 0) return

    setState(prevState => {
      let newState = prevState
      pendingUpdates.current.forEach(update => {
        newState = update(newState)
      })
      pendingUpdates.current = []
      return newState
    })
  }, [])

  const optimizedSetState = useCallback(
    (update: T | ((prev: T) => T)) => {
      const updateFn = typeof update === 'function' ? (update as (prev: T) => T) : () => update

      if (shouldBatch && pendingUpdates.current.length > 0) {
        const lastUpdate = pendingUpdates.current[pendingUpdates.current.length - 1]
        const combinedUpdate = (prev: T) => {
          const intermediate = lastUpdate(prev)
          return updateFn(intermediate)
        }
        pendingUpdates.current[pendingUpdates.current.length - 1] = combinedUpdate
      } else {
        pendingUpdates.current.push(updateFn)
      }

      if (pendingUpdates.current.length >= batchSize) {
        flushUpdates()
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(flushUpdates, delay)
      }
    },
    [shouldBatch, batchSize, delay, flushUpdates]
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [state, optimizedSetState] as const
}
