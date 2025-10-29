/**
 * 组件开发工具
 * 功能模块: 基础组件库 (004-basic-component-library) - T011任务
 * 创建日期: 2025-10-29
 * 用途: 提供组件调试、性能监控和开发辅助功能
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  Monitor,
  Settings,
  Bug,
  Zap,
  Database,
  Info,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { ComponentCacheManager } from './ComponentCache'
import { ComponentDefinition, LowcodeComponentProps, StyleValue } from '@/types/lowcode'

// 调试面板配置
interface DevToolsConfig {
  enabled: boolean
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  defaultExpanded: boolean
  showPerformanceMetrics: boolean
  showCacheInfo: boolean
  showComponentTree: boolean
  showEventLog: boolean
  maxLogEntries: number
}

// 性能指标接口
interface PerformanceMetrics {
  renderTime: number
  renderCount: number
  averageRenderTime: number
  cacheHitRate: number
  memoryUsage: number
  componentCount: number
  timestamp: number
}

// 事件日志条目
interface EventLogEntry {
  id: string
  type: 'render' | 'select' | 'update' | 'delete' | 'error' | 'cache'
  componentId: string
  componentType: string
  data?: any
  timestamp: number
  duration?: number
}

// 组件树节点
interface ComponentTreeNode {
  id: string
  type: string
  props: LowcodeComponentProps
  styles: StyleValue
  children: ComponentTreeNode[]
  renderCount: number
  lastRenderTime: number
  isExpanded: boolean
}

// 默认配置
const DEFAULT_DEVTOOLS_CONFIG: DevToolsConfig = {
  enabled: process.env.NODE_ENV === 'development',
  position: 'top-right',
  defaultExpanded: false,
  showPerformanceMetrics: true,
  showCacheInfo: true,
  showComponentTree: true,
  showEventLog: true,
  maxLogEntries: 100,
}

/**
 * 组件开发工具面板
 */
export const ComponentDevTools: React.FC<{
  config?: Partial<DevToolsConfig>
  cacheManager?: ComponentCacheManager
}> = ({ config: customConfig, cacheManager }) => {
  // 合并配置
  const config = useMemo(
    () => ({
      ...DEFAULT_DEVTOOLS_CONFIG,
      ...customConfig,
    }),
    [customConfig]
  )

  // 获取缓存管理器
  const cache = cacheManager || ComponentCacheManager.getInstance()

  // 状态管理
  const [isVisible, setIsVisible] = useState(config.enabled && config.defaultExpanded)
  const [activeTab, setActiveTab] = useState<'performance' | 'cache' | 'tree' | 'events'>(
    'performance'
  )
  const [isMinimized, setIsMinimized] = useState(false)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    renderCount: 0,
    averageRenderTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    componentCount: 0,
    timestamp: Date.now(),
  })
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([])
  const [componentTree, setComponentTree] = useState<ComponentTreeNode[]>([])

  // 定时器引用
  const updateTimer = useRef<NodeJS.Timeout | undefined>(undefined)

  // 更新性能指标
  const updatePerformanceMetrics = useCallback(() => {
    const stats = cache.getStats()
    const now = Date.now()

    setPerformanceMetrics(prev => ({
      ...prev,
      cacheHitRate:
        stats.components.totalAccesses > 0
          ? ((stats.components.totalAccesses - stats.components.size) /
              stats.components.totalAccesses) *
            100
          : 0,
      memoryUsage: (stats.components.size + stats.styles.size + stats.props.size) * 1024,
      componentCount: stats.components.size,
      timestamp: now,
    }))
  }, [cache])

  // 记录事件
  const logEvent = useCallback(
    (entry: Omit<EventLogEntry, 'id' | 'timestamp'>) => {
      const newEntry: EventLogEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      }

      setEventLog(prev => {
        const updated = [newEntry, ...prev]
        return updated.slice(0, config.maxLogEntries)
      })
    },
    [config.maxLogEntries]
  )

  // 定时更新指标
  useEffect(() => {
    if (isVisible && !isMinimized) {
      updateTimer.current = setInterval(updatePerformanceMetrics, 1000)
    }

    return () => {
      if (updateTimer.current) {
        clearInterval(updateTimer.current)
      }
    }
  }, [isVisible, isMinimized, updatePerformanceMetrics])

  // 监听组件事件
  useEffect(() => {
    // 这里可以添加全局事件监听
    const handleComponentEvent = (event: CustomEvent) => {
      logEvent({
        type: event.detail.type,
        componentId: event.detail.componentId,
        componentType: event.detail.componentType,
        data: event.detail.data,
        duration: event.detail.duration,
      })
    }

    window.addEventListener('lowcode:component-event', handleComponentEvent as EventListener)

    return () => {
      window.removeEventListener('lowcode:component-event', handleComponentEvent as EventListener)
    }
  }, [logEvent])

  // 位置样式
  const positionStyles = useMemo(() => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
    }
    return positions[config.position]
  }, [config.position])

  // 清理事件日志
  const clearEventLog = useCallback(() => {
    setEventLog([])
  }, [])

  // 清理缓存
  const clearCache = useCallback(() => {
    cache.clearCache()
    updatePerformanceMetrics()
    logEvent({
      type: 'cache',
      componentId: 'devtools',
      componentType: 'cache-clear',
      data: { action: 'clear-all' },
    })
  }, [cache, updatePerformanceMetrics, logEvent])

  // 渲染性能标签页
  const renderPerformanceTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded bg-gray-50 p-3">
          <div className="text-sm text-gray-600">缓存命中率</div>
          <div className="text-lg font-semibold text-green-600">
            {performanceMetrics.cacheHitRate.toFixed(1)}%
          </div>
        </div>
        <div className="rounded bg-gray-50 p-3">
          <div className="text-sm text-gray-600">组件数量</div>
          <div className="text-lg font-semibold text-blue-600">
            {performanceMetrics.componentCount}
          </div>
        </div>
        <div className="rounded bg-gray-50 p-3">
          <div className="text-sm text-gray-600">内存使用</div>
          <div className="text-lg font-semibold text-purple-600">
            {(performanceMetrics.memoryUsage / 1024).toFixed(1)}KB
          </div>
        </div>
        <div className="rounded bg-gray-50 p-3">
          <div className="text-sm text-gray-600">最后更新</div>
          <div className="text-sm text-gray-800">
            {new Date(performanceMetrics.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="mb-2 text-sm font-medium">缓存统计</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">组件缓存:</span>
            <span>
              {cache.getStats().components.size}/{cache.getStats().components.maxSize}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">样式缓存:</span>
            <span>
              {cache.getStats().styles.size}/{cache.getStats().styles.maxSize}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">属性缓存:</span>
            <span>
              {cache.getStats().props.size}/{cache.getStats().props.maxSize}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  // 渲染缓存标签页
  const renderCacheTab = () => {
    const stats = cache.getStats()

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">缓存管理</h4>
          <button
            onClick={clearCache}
            className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
          >
            清理缓存
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <h5 className="mb-2 text-xs font-medium text-gray-700">组件缓存</h5>
            <div className="rounded bg-gray-50 p-2 text-xs">
              <div>
                大小: {stats.components.size}/{stats.components.maxSize}
              </div>
              <div>总访问: {stats.components.totalAccesses}</div>
              <div>平均访问: {stats.components.averageAccesses.toFixed(1)}</div>
            </div>
          </div>

          <div>
            <h5 className="mb-2 text-xs font-medium text-gray-700">样式缓存</h5>
            <div className="rounded bg-gray-50 p-2 text-xs">
              <div>
                大小: {stats.styles.size}/{stats.styles.maxSize}
              </div>
              <div>总访问: {stats.styles.totalAccesses}</div>
            </div>
          </div>

          <div>
            <h5 className="mb-2 text-xs font-medium text-gray-700">属性缓存</h5>
            <div className="rounded bg-gray-50 p-2 text-xs">
              <div>
                大小: {stats.props.size}/{stats.props.maxSize}
              </div>
              <div>总访问: {stats.props.totalAccesses}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 渲染事件日志标签页
  const renderEventsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">事件日志</h4>
        <button
          onClick={clearEventLog}
          className="rounded bg-gray-500 px-2 py-1 text-xs text-white hover:bg-gray-600"
        >
          清理日志
        </button>
      </div>

      <div className="max-h-60 space-y-1 overflow-y-auto">
        {eventLog.length === 0 ? (
          <div className="py-4 text-center text-sm text-gray-500">暂无事件记录</div>
        ) : (
          eventLog.map(entry => (
            <div key={entry.id} className="rounded border border-gray-200 bg-gray-50 p-2 text-xs">
              <div className="flex items-start justify-between">
                <span className="font-medium capitalize text-blue-600">{entry.type}</span>
                <span className="text-gray-500">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="mt-1 text-gray-600">
                {entry.componentType}:{entry.componentId}
              </div>
              {entry.duration && (
                <div className="text-gray-500">耗时: {entry.duration.toFixed(2)}ms</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )

  // 渲染主面板
  if (!config.enabled) {
    return null
  }

  return (
    <div className={`fixed z-50 ${positionStyles}`}>
      {/* 最小化状态 */}
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="rounded-l-lg bg-gray-800 p-2 text-white shadow-lg hover:bg-gray-700"
        >
          <Zap className="h-4 w-4" />
        </button>
      ) : (
        <div className="w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* 标题栏 */}
          <div className="flex items-center justify-between rounded-t-lg bg-gray-800 px-3 py-2 text-white">
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              <span className="text-sm font-medium">组件开发工具</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="rounded p-1 hover:bg-gray-700"
              >
                <ChevronDown className="h-3 w-3" />
              </button>
              <button onClick={() => setIsVisible(false)} className="rounded p-1 hover:bg-gray-700">
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* 标签页 */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { id: 'performance', label: '性能', icon: Monitor },
                { id: 'cache', label: '缓存', icon: Database },
                { id: 'events', label: '事件', icon: Settings },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <tab.icon className="h-3 w-3" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 内容区域 */}
          <div className="max-h-96 overflow-y-auto p-4">
            {activeTab === 'performance' && renderPerformanceTab()}
            {activeTab === 'cache' && renderCacheTab()}
            {activeTab === 'events' && renderEventsTab()}
          </div>
        </div>
      )}

      {/* 可见性切换按钮（当面板隐藏时） */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="rounded-lg bg-gray-800 p-2 text-white shadow-lg hover:bg-gray-700"
        >
          <Bug className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

/**
 * 组件性能监控Hook
 */
export const useComponentPerformance = (componentId: string, componentType: string) => {
  const renderStartTime = useRef<number>(0)
  const renderCount = useRef<number>(0)
  const totalRenderTime = useRef<number>(0)

  // 开始渲染计时
  const startRender = useCallback(() => {
    renderStartTime.current = performance.now()
  }, [])

  // 结束渲染计时
  const endRender = useCallback(() => {
    if (renderStartTime.current > 0) {
      const duration = performance.now() - renderStartTime.current
      renderCount.current++
      totalRenderTime.current += duration

      // 触发性能事件
      window.dispatchEvent(
        new CustomEvent('lowcode:component-event', {
          detail: {
            type: 'render',
            componentId,
            componentType,
            duration,
            renderCount: renderCount.current,
            averageRenderTime: totalRenderTime.current / renderCount.current,
          },
        })
      )

      renderStartTime.current = 0
    }
  }, [componentId, componentType])

  return {
    startRender,
    endRender,
    renderCount: renderCount.current,
    averageRenderTime: renderCount.current > 0 ? totalRenderTime.current / renderCount.current : 0,
  }
}

/**
 * 组件调试信息显示
 */
export const ComponentDebugInfo: React.FC<{
  componentId: string
  componentType: string
  props: LowcodeComponentProps
  styles: StyleValue
  performance?: { renderTime: number; renderCount: number }
}> = ({ componentId, componentType, props, styles, performance }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="component-debug-info rounded bg-gray-900 p-2 text-xs text-white">
      <div className="flex items-center justify-between">
        <span className="font-medium">
          {componentType}:{componentId}
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded p-1 hover:bg-gray-700"
        >
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {performance && (
        <div className="mt-1 text-gray-400">
          {performance.renderTime.toFixed(2)}ms ({performance.renderCount} renders)
        </div>
      )}

      {isExpanded && (
        <div className="mt-2 space-y-2">
          <div>
            <div className="mb-1 text-gray-400">Props:</div>
            <pre className="whitespace-pre-wrap text-green-400">
              {JSON.stringify(props, null, 2)}
            </pre>
          </div>
          <div>
            <div className="mb-1 text-gray-400">Styles:</div>
            <pre className="whitespace-pre-wrap text-blue-400">
              {JSON.stringify(styles, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComponentDevTools
