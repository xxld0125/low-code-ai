/**
 * 页面设计器性能监控组件
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 * 作用: 实时显示拖拽性能指标，帮助优化性能
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useDragPerformanceMonitor } from '@/lib/page-designer/performance/drag-optimization'

interface PerformanceMonitorProps {
  className?: string
  showOnlyWhenDragging?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  className,
  showOnlyWhenDragging = true,
  position = 'top-right',
}) => {
  const { getMetrics, startMonitoring, recordMove } = useDragPerformanceMonitor()
  const [isVisible, setIsVisible] = useState(!showOnlyWhenDragging)
  const [metrics, setMetrics] = useState(getMetrics())

  // 位置样式
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }

  // 监听性能指标更新
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getMetrics())
    }, 100) // 每100ms更新一次

    return () => clearInterval(interval)
  }, [getMetrics])

  // 监听拖拽事件
  useEffect(() => {
    const handleDragStart = () => {
      startMonitoring()
      setIsVisible(true)
    }

    const handleDragMove = () => {
      recordMove()
    }

    const handleDragEnd = () => {
      if (showOnlyWhenDragging) {
        setTimeout(() => setIsVisible(false), 2000) // 2秒后隐藏
      }
    }

    // 监听自定义拖拽事件
    window.addEventListener('drag-start', handleDragStart)
    window.addEventListener('drag-move', handleDragMove)
    window.addEventListener('drag-end', handleDragEnd)

    return () => {
      window.removeEventListener('drag-start', handleDragStart)
      window.removeEventListener('drag-move', handleDragMove)
      window.removeEventListener('drag-end', handleDragEnd)
    }
  }, [startMonitoring, recordMove, showOnlyWhenDragging])

  if (!isVisible) return null

  const isPerformanceGood = metrics.averageResponseTime < 50
  const isPerformanceWarning =
    metrics.averageResponseTime >= 50 && metrics.averageResponseTime < 100
  const isPerformanceBad = metrics.averageResponseTime >= 100

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'fixed z-50 rounded-lg border bg-white/90 shadow-lg backdrop-blur-sm',
        'p-3 font-mono text-xs',
        positionClasses[position],
        className
      )}
    >
      <div className="mb-2 font-semibold text-gray-700">拖拽性能监控</div>

      <div className="space-y-1">
        {/* 响应时间指标 */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">平均响应:</span>
          <span
            className={cn(
              'font-semibold',
              isPerformanceGood && 'text-green-600',
              isPerformanceWarning && 'text-yellow-600',
              isPerformanceBad && 'text-red-600'
            )}
          >
            {metrics.averageResponseTime.toFixed(1)}ms
          </span>
        </div>

        {/* 最大响应时间 */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">最大响应:</span>
          <span
            className={cn(
              'font-semibold',
              metrics.maxResponseTime < 100 && 'text-green-600',
              metrics.maxResponseTime >= 100 && metrics.maxResponseTime < 200 && 'text-yellow-600',
              metrics.maxResponseTime >= 200 && 'text-red-600'
            )}
          >
            {metrics.maxResponseTime.toFixed(1)}ms
          </span>
        </div>

        {/* 移动次数 */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">移动次数:</span>
          <span className="font-semibold text-blue-600">{metrics.moveCount}</span>
        </div>

        {/* 掉帧率 */}
        {metrics.moveCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">掉帧率:</span>
            <span
              className={cn(
                'font-semibold',
                metrics.droppedFrames === 0 && 'text-green-600',
                metrics.droppedFrames > 0 &&
                  metrics.droppedFrames <= metrics.moveCount * 0.05 &&
                  'text-yellow-600',
                metrics.droppedFrames > metrics.moveCount * 0.05 && 'text-red-600'
              )}
            >
              {((metrics.droppedFrames / Math.max(metrics.moveCount, 1)) * 100).toFixed(1)}%
            </span>
          </div>
        )}

        {/* 性能状态指示器 */}
        <div className="mt-2 border-t border-gray-200 pt-2">
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                isPerformanceGood && 'bg-green-500',
                isPerformanceWarning && 'bg-yellow-500',
                isPerformanceBad && 'bg-red-500'
              )}
            />
            <span className="text-gray-700">
              {isPerformanceGood && '性能优秀'}
              {isPerformanceWarning && '性能一般'}
              {isPerformanceBad && '性能较差'}
            </span>
          </div>
        </div>
      </div>

      {/* 性能优化建议 */}
      {isPerformanceBad && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 border-t border-gray-200 pt-2"
        >
          <div className="mb-1 font-semibold text-red-600">优化建议:</div>
          <ul className="space-y-1 text-xs text-red-500">
            <li>• 减少画布上的组件数量</li>
            <li>• 启用组件虚拟化</li>
            <li>• 检查是否有昂贵的计算操作</li>
          </ul>
        </motion.div>
      )}
    </motion.div>
  )
}

export default PerformanceMonitor
