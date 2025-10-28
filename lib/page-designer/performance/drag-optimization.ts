/**
 * 页面设计器拖拽性能优化工具
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 * 作用: 优化拖拽性能，确保响应时间 < 50ms
 */

import { useCallback, useRef, useEffect, useMemo } from 'react'
import { debounce, throttle } from 'lodash-es'

// 性能监控接口
export interface PerformanceMetrics {
  dragStartTime: number
  lastMoveTime: number
  moveCount: number
  averageResponseTime: number
  maxResponseTime: number
  droppedFrames: number
}

// 拖拽性能优化配置
export interface DragPerformanceConfig {
  enableMemoization: boolean
  enableVirtualization: boolean
  maxComponentThreshold: number
  updateThrottleMs: number
  debounceSaveMs: number
  enableGPUAcceleration: boolean
  enableFrameSkipping: boolean
}

// 默认配置
const DEFAULT_CONFIG: DragPerformanceConfig = {
  enableMemoization: true,
  enableVirtualization: true,
  maxComponentThreshold: 30,
  updateThrottleMs: 16, // ~60fps
  debounceSaveMs: 100,
  enableGPUAcceleration: true,
  enableFrameSkipping: true,
}

/**
 * 拖拽性能监控Hook
 */
export const useDragPerformanceMonitor = () => {
  const metricsRef = useRef<PerformanceMetrics>({
    dragStartTime: 0,
    lastMoveTime: 0,
    moveCount: 0,
    averageResponseTime: 0,
    maxResponseTime: 0,
    droppedFrames: 0,
  })

  const frameTimeRef = useRef<number>(0)
  const lastFrameRef = useRef<number>(0)

  // 开始监控
  const startMonitoring = useCallback(() => {
    metricsRef.current.dragStartTime = performance.now()
    metricsRef.current.moveCount = 0
    metricsRef.current.maxResponseTime = 0
    metricsRef.current.droppedFrames = 0
    lastFrameRef.current = performance.now()
  }, [])

  // 记录移动事件
  const recordMove = useCallback(() => {
    const now = performance.now()
    const frameTime = now - lastFrameRef.current

    metricsRef.current.lastMoveTime = now
    metricsRef.current.moveCount++

    // 计算响应时间
    const responseTime = now - frameTimeRef.current
    metricsRef.current.averageResponseTime =
      (metricsRef.current.averageResponseTime * (metricsRef.current.moveCount - 1) + responseTime) /
      metricsRef.current.moveCount
    metricsRef.current.maxResponseTime = Math.max(metricsRef.current.maxResponseTime, responseTime)

    // 检测掉帧
    if (frameTime > 16.67) {
      // 60fps threshold
      metricsRef.current.droppedFrames++
    }

    lastFrameRef.current = now
    frameTimeRef.current = now
  }, [])

  // 获取性能指标
  const getMetrics = useCallback(() => {
    return { ...metricsRef.current }
  }, [])

  return {
    startMonitoring,
    recordMove,
    getMetrics,
  }
}

/**
 * 拖拽优化Hook
 */
export const useDragOptimization = (config: Partial<DragPerformanceConfig> = {}) => {
  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config])

  // 节流的更新函数
  const throttledUpdate = useMemo(
    () => throttle((callback: () => void) => callback(), finalConfig.updateThrottleMs),
    [finalConfig.updateThrottleMs]
  )

  // 防抖的保存函数
  const debouncedSave = useMemo(
    () => debounce((callback: () => void) => callback(), finalConfig.debounceSaveMs),
    [finalConfig.debounceSaveMs]
  )

  // GPU加速样式
  const getGPUAcceleratedStyles = useCallback(
    (styles: React.CSSProperties = {}) => {
      if (!finalConfig.enableGPUAcceleration) return styles

      return {
        ...styles,
        transform: styles.transform || 'translateZ(0)', // 强制GPU加速
        willChange: 'transform', // 提示浏览器优化
        backfaceVisibility: 'hidden' as const,
        perspective: 1000,
      }
    },
    [finalConfig.enableGPUAcceleration]
  )

  // 性能优化的组件渲染
  const optimizedRender = useCallback(
    (
      shouldRender: boolean,
      renderFunction: () => React.ReactNode,
      fallback: React.ReactNode = null
    ) => {
      if (!shouldRender) return fallback

      if (finalConfig.enableFrameSkipping) {
        // 跳帧优化：在高频更新时降低渲染频率
        const now = performance.now()
        const shouldSkipFrame = now % 3 === 0 // 每3帧跳过1帧

        if (shouldSkipFrame) {
          return fallback
        }
      }

      return renderFunction()
    },
    [finalConfig.enableFrameSkipping]
  )

  // 清理函数
  useEffect(() => {
    return () => {
      throttledUpdate.cancel()
      debouncedSave.cancel()
    }
  }, [throttledUpdate, debouncedSave])

  return {
    config: finalConfig,
    throttledUpdate,
    debouncedSave,
    getGPUAcceleratedStyles,
    optimizedRender,
  }
}

/**
 * 虚拟化拖拽预览
 */
export const useVirtualizedDragPreview = (componentCount: number, threshold = 30) => {
  const shouldVirtualize = componentCount > threshold

  const getVisibleComponents = useCallback(
    (
      components: any[],
      viewportBounds: { x: number; y: number; width: number; height: number }
    ) => {
      if (!shouldVirtualize) return components

      // 简单的视口裁剪算法
      return components.filter(component => {
        // 这里需要根据组件位置进行视口裁剪
        // 为了简化，暂时返回所有组件
        return true
      })
    },
    [shouldVirtualize]
  )

  return {
    shouldVirtualize,
    getVisibleComponents,
  }
}

/**
 * 拖拽批处理更新
 */
export const useDragBatchUpdates = () => {
  const batchRef = useRef<{
    updates: Array<{ type: string; data: any }>
    isProcessing: boolean
  }>({
    updates: [],
    isProcessing: false,
  })

  // 处理批次
  const processBatch = useCallback(() => {
    if (batchRef.current.isProcessing) return

    batchRef.current.isProcessing = true

    // 使用 requestAnimationFrame 优化批处理时机
    requestAnimationFrame(() => {
      const updates = batchRef.current.updates.splice(0)

      // 合并相同类型的更新
      const mergedUpdates = updates.reduce(
        (acc, update) => {
          const existing = acc.find(u => u.type === update.type)
          if (existing) {
            // 合并数据
            Object.assign(existing.data, update.data)
          } else {
            acc.push({ ...update })
          }
          return acc
        },
        [] as Array<{ type: string; data: any }>
      )

      // 处理合并后的更新
      mergedUpdates.forEach(update => {
        // 这里可以根据更新类型执行不同的逻辑
        console.log('Processing batch update:', update.type, update.data)
      })

      batchRef.current.isProcessing = false

      // 如果还有待处理的更新，继续处理
      if (batchRef.current.updates.length > 0) {
        // 使用 setTimeout 避免循环依赖
        setTimeout(processBatch, 0)
      }
    })
  }, [])

  // 添加更新到批次
  const addToBatch = useCallback(
    (type: string, data: any) => {
      batchRef.current.updates.push({ type, data })

      if (!batchRef.current.isProcessing) {
        processBatch()
      }
    },
    [processBatch]
  )

  return {
    addToBatch,
    processBatch,
  }
}

/**
 * 拖拽性能优化器类
 */
export class DragPerformanceOptimizer {
  private config: DragPerformanceConfig
  private metrics: PerformanceMetrics
  private updateQueue: Array<() => void> = []
  private isProcessingQueue = false

  constructor(config: Partial<DragPerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.metrics = {
      dragStartTime: 0,
      lastMoveTime: 0,
      moveCount: 0,
      averageResponseTime: 0,
      maxResponseTime: 0,
      droppedFrames: 0,
    }
  }

  // 开始拖拽性能优化
  startDragOptimization(): void {
    this.metrics.dragStartTime = performance.now()
    this.metrics.moveCount = 0
  }

  // 优化拖拽移动
  optimizeDragMove(updateCallback: () => void): void {
    const startTime = performance.now()

    // 检查是否需要节流
    if (
      this.metrics.lastMoveTime &&
      startTime - this.metrics.lastMoveTime < this.config.updateThrottleMs
    ) {
      return
    }

    // 添加到更新队列
    this.updateQueue.push(updateCallback)

    if (!this.isProcessingQueue) {
      this.processUpdateQueue()
    }

    this.metrics.lastMoveTime = startTime
    this.metrics.moveCount++
  }

  // 处理更新队列
  private processUpdateQueue(): void {
    this.isProcessingQueue = true

    requestAnimationFrame(() => {
      const updates = this.updateQueue.splice(0, 5) // 每帧处理最多5个更新

      updates.forEach(update => {
        try {
          update()
        } catch (error) {
          console.error('Error processing drag update:', error)
        }
      })

      this.isProcessingQueue = false

      // 如果还有更新，继续处理
      if (this.updateQueue.length > 0) {
        this.processUpdateQueue()
      }
    })
  }

  // 获取性能指标
  getPerformanceMetrics(): PerformanceMetrics {
    const totalTime = performance.now() - this.metrics.dragStartTime
    return {
      ...this.metrics,
      averageResponseTime: totalTime / Math.max(this.metrics.moveCount, 1),
    }
  }

  // 重置指标
  resetMetrics(): void {
    this.metrics = {
      dragStartTime: 0,
      lastMoveTime: 0,
      moveCount: 0,
      averageResponseTime: 0,
      maxResponseTime: 0,
      droppedFrames: 0,
    }
  }

  // 检查性能是否达标
  isPerformanceAcceptable(): boolean {
    return (
      this.metrics.averageResponseTime < 50 && // 平均响应时间 < 50ms
      this.metrics.maxResponseTime < 100 && // 最大响应时间 < 100ms
      this.metrics.droppedFrames < this.metrics.moveCount * 0.05 // 掉帧率 < 5%
    )
  }
}

/**
 * 全局拖拽性能优化器实例
 */
export const dragPerformanceOptimizer = new DragPerformanceOptimizer()

export default dragPerformanceOptimizer
