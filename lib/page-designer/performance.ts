import React from 'react'

/**
 * 页面设计器性能监控系统
 * 监控Core Web Vitals和自定义性能指标
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number // Largest Contentful Paint (ms)
  fid: number // First Input Delay (ms)
  cls: number // Cumulative Layout Shift
  fcp: number // First Contentful Paint (ms)
  ttfb: number // Time to First Byte (ms)

  // 自定义设计器指标
  dragResponseTime: number // 拖拽响应时间 (ms)
  renderTime: number // 组件渲染时间 (ms)
  componentCount: number // 组件数量
  memoryUsage: number // 内存使用量 (MB)

  // 用户体验指标
  interactionDelay: number // 交互延迟 (ms)
  frameRate: number // 帧率 (fps)
  errorCount: number // 错误计数
}

export interface PerformanceThresholds {
  lcp: number // 目标: < 2500ms
  fid: number // 目标: < 100ms
  cls: number // 目标: < 0.1
  fcp: number // 目标: < 1800ms
  ttfb: number // 目标: < 800ms
  dragResponseTime: number // 目标: < 50ms
  renderTime: number // 目标: < 16ms (60fps)
  frameRate: number // 目标: > 55fps
}

export const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  lcp: 2500,
  fid: 100,
  cls: 0.1,
  fcp: 1800,
  ttfb: 800,
  dragResponseTime: 50,
  renderTime: 16,
  frameRate: 55,
} as const

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {}
  private observers: PerformanceObserver[] = []
  private frameCount = 0
  private lastFrameTime = performance.now()
  private isMonitoring = false

  /**
   * 开始性能监控
   */
  startMonitoring(): void {
    if (this.isMonitoring || typeof window === 'undefined') return

    this.isMonitoring = true
    this.setupCoreWebVitals()
    this.setupCustomMetrics()
    this.startFrameRateMonitoring()
  }

  /**
   * 停止性能监控
   */
  stopMonitoring(): void {
    this.isMonitoring = false
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }

  /**
   * 获取当前性能指标
   */
  getMetrics(): PerformanceMetrics {
    return {
      lcp: this.metrics.lcp || 0,
      fid: this.metrics.fid || 0,
      cls: this.metrics.cls || 0,
      fcp: this.metrics.fcp || 0,
      ttfb: this.metrics.ttfb || 0,
      dragResponseTime: this.metrics.dragResponseTime || 0,
      renderTime: this.metrics.renderTime || 0,
      componentCount: this.metrics.componentCount || 0,
      memoryUsage: this.getMemoryUsage(),
      interactionDelay: this.metrics.interactionDelay || 0,
      frameRate: this.getCurrentFrameRate(),
      errorCount: this.metrics.errorCount || 0,
    }
  }

  /**
   * 评估性能等级
   */
  evaluatePerformance(): 'good' | 'needs-improvement' | 'poor' {
    const metrics = this.getMetrics()
    const thresholds = PERFORMANCE_THRESHOLDS

    let goodCount = 0
    let totalCount = 0

    // 评估核心指标
    const coreMetrics = [
      { value: metrics.lcp, threshold: thresholds.lcp },
      { value: metrics.fid, threshold: thresholds.fid },
      { value: metrics.cls, threshold: thresholds.cls },
      { value: metrics.fcp, threshold: thresholds.fcp },
      { value: metrics.ttfb, threshold: thresholds.ttfb },
    ]

    coreMetrics.forEach(({ value, threshold }) => {
      if (value > 0) {
        totalCount++
        if (value <= threshold) goodCount++
      }
    })

    // 评估自定义指标
    const customMetrics = [
      { value: metrics.dragResponseTime, threshold: thresholds.dragResponseTime },
      { value: metrics.renderTime, threshold: thresholds.renderTime },
    ]

    customMetrics.forEach(({ value, threshold }) => {
      if (value > 0) {
        totalCount++
        if (value <= threshold) goodCount++
      }
    })

    const score = totalCount > 0 ? goodCount / totalCount : 0

    if (score >= 0.8) return 'good'
    if (score >= 0.6) return 'needs-improvement'
    return 'poor'
  }

  /**
   * 记录拖拽响应时间
   */
  recordDragResponse(startTime: number): void {
    const responseTime = performance.now() - startTime
    this.metrics.dragResponseTime = responseTime

    // 如果拖拽响应时间过长，记录警告
    if (responseTime > PERFORMANCE_THRESHOLDS.dragResponseTime) {
      console.warn(`拖拽响应时间过长: ${responseTime.toFixed(2)}ms`)
    }
  }

  /**
   * 记录组件渲染时间
   */
  recordRenderTime(componentType: string, startTime: number): void {
    const renderTime = performance.now() - startTime
    this.metrics.renderTime = renderTime

    if (renderTime > PERFORMANCE_THRESHOLDS.renderTime) {
      console.warn(`组件${componentType}渲染时间过长: ${renderTime.toFixed(2)}ms`)
    }
  }

  /**
   * 更新组件数量
   */
  updateComponentCount(count: number): void {
    this.metrics.componentCount = count

    // 如果组件数量接近上限，发出警告
    if (count >= 45) {
      // 50是上限，45发出警告
      console.warn(`组件数量接近性能上限: ${count}/50`)
    }
  }

  /**
   * 记录错误
   */
  recordError(error: Error): void {
    this.metrics.errorCount = (this.metrics.errorCount || 0) + 1
    console.error('页面设计器错误:', error)
  }

  /**
   * 设置Core Web Vitals监控
   */
  private setupCoreWebVitals(): void {
    // LCP (Largest Contentful Paint)
    this.observePerformanceEntry('largest-contentful-paint', entries => {
      const lastEntry = entries.getEntries()[
        entries.getEntries().length - 1
      ] as PerformancePaintTiming
      if (lastEntry) {
        this.metrics.lcp = lastEntry.startTime
      }
    })

    // FID (First Input Delay)
    this.observePerformanceEntry('first-input', entries => {
      const firstEntry = entries.getEntries()[0] as PerformanceEventTiming | undefined
      if (firstEntry && firstEntry.processingStart) {
        this.metrics.fid = firstEntry.processingStart - firstEntry.startTime
      }
    })

    // CLS (Cumulative Layout Shift)
    let clsValue = 0
    this.observePerformanceEntry('layout-shift', entries => {
      for (const entry of entries.getEntries()) {
        const layoutShiftEntry = entry as PerformancePaintTiming
        if ('value' in layoutShiftEntry) {
          if (!('hadRecentInput' in layoutShiftEntry) || !layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value as number
          }
        }
      }
      this.metrics.cls = clsValue
    })

    // FCP (First Contentful Paint)
    this.observePerformanceEntry('paint', entries => {
      const fcpEntry = entries.getEntries().find(entry => entry.name === 'first-contentful-paint')
      if (fcpEntry) {
        this.metrics.fcp = fcpEntry.startTime
      }
    })

    // TTFB (Time to First Byte)
    if (performance.timing) {
      const ttfb = performance.timing.responseStart - performance.timing.requestStart
      this.metrics.ttfb = ttfb
    }
  }

  /**
   * 设置自定义性能指标
   */
  private setupCustomMetrics(): void {
    // 监控长任务
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              // 长于50ms的任务
              console.warn(`检测到长任务: ${entry.duration.toFixed(2)}ms - ${entry.name}`)
            }
          }
        })
        observer.observe({ entryTypes: ['longtask'] })
        this.observers.push(observer)
      } catch {
        // 某些浏览器可能不支持longtask
      }
    }
  }

  /**
   * 开始帧率监控
   */
  private startFrameRateMonitoring(): void {
    const measureFrameRate = () => {
      if (!this.isMonitoring) return

      this.frameCount++
      const currentTime = performance.now()
      const deltaTime = currentTime - this.lastFrameTime

      if (deltaTime >= 1000) {
        // 每秒更新一次
        const fps = (this.frameCount * 1000) / deltaTime

        if (fps < PERFORMANCE_THRESHOLDS.frameRate) {
          console.warn(`帧率过低: ${fps.toFixed(1)}fps`)
        }

        this.frameCount = 0
        this.lastFrameTime = currentTime
      }

      requestAnimationFrame(measureFrameRate)
    }

    requestAnimationFrame(measureFrameRate)
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = performance.memory as { usedJSHeapSize: number }
      return memory.usedJSHeapSize / 1024 / 1024 // 转换为MB
    }
    return 0
  }

  /**
   * 获取当前帧率
   */
  private getCurrentFrameRate(): number {
    // 这里简化处理，实际应该基于最近的帧率数据计算
    return 60
  }

  /**
   * 通用性能条目观察器
   */
  private observePerformanceEntry(
    type: string,
    callback: (entries: PerformanceObserverEntryList) => void
  ): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver(callback)
        observer.observe({ type, buffered: true })
        this.observers.push(observer)
      } catch {
        // 某些浏览器可能不支持特定的entry type
      }
    }
  }
}

/**
 * 性能工具函数
 */
export const performanceUtils = {
  /**
   * 创建性能计时器
   */
  createTimer: () => {
    const startTime = performance.now()
    return {
      getElapsed: () => performance.now() - startTime,
      end: () => performance.now() - startTime,
    }
  },

  /**
   * 防抖函数（用于性能优化）
   */
  debounce: <T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  },

  /**
   * 节流函数（用于性能优化）
   */
  throttle: <T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },

  /**
   * 检查是否需要性能优化
   */
  needsOptimization: (metrics: PerformanceMetrics): boolean => {
    return (
      metrics.lcp > PERFORMANCE_THRESHOLDS.lcp ||
      metrics.fid > PERFORMANCE_THRESHOLDS.fid ||
      metrics.cls > PERFORMANCE_THRESHOLDS.cls ||
      metrics.dragResponseTime > PERFORMANCE_THRESHOLDS.dragResponseTime ||
      metrics.componentCount >= 50
    )
  },
}

// 全局性能监控实例
export const globalPerformanceMonitor = new PerformanceMonitor()

/**
 * React Hook for 性能监控
 */
export const usePerformanceMonitor = () => {
  React.useEffect(() => {
    // 只在客户端启用监控
    if (typeof window !== 'undefined') {
      globalPerformanceMonitor.startMonitoring()

      return () => {
        globalPerformanceMonitor.stopMonitoring()
      }
    }
  }, [])

  return {
    metrics: globalPerformanceMonitor.getMetrics(),
    evaluatePerformance: () => globalPerformanceMonitor.evaluatePerformance(),
    recordDragTime: (startTime: number) => globalPerformanceMonitor.recordDragResponse(startTime),
    recordRenderTime: (componentType: string, startTime: number) =>
      globalPerformanceMonitor.recordRenderTime(componentType, startTime),
    updateComponentCount: (count: number) => globalPerformanceMonitor.updateComponentCount(count),
    recordError: (error: Error) => globalPerformanceMonitor.recordError(error),
  }
}
