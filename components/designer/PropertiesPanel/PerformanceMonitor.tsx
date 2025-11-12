'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  usePropertyPerformanceMonitor,
  PropertyPerformanceUtils,
} from '@/lib/designer/property-performance'
import { PerformanceMetrics } from '@/lib/designer/property-performance'
import { Settings, Activity, Zap, AlertTriangle } from 'lucide-react'

/**
 * 性能监控组件
 * 实时显示属性面板的性能指标和建议
 */
export function PropertyPerformanceMonitor() {
  const { getMetrics, clearMetrics } = usePropertyPerformanceMonitor()

  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isMonitoring, setIsMonitoring] = useState(false)

  // 开始性能监控
  const startMonitoring = () => {
    setIsMonitoring(true)
    recordMemoryUsage()
  }

  // 停止性能监控
  const stopMonitoring = () => {
    setIsMonitoring(false)
  }

  // 定期更新指标
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      setMetrics(getMetrics())
      recordMemoryUsage()
    }, 1000)

    return () => clearInterval(interval)
  }, [isMonitoring, getMetrics, recordMemoryUsage])

  // 获取性能状态颜色
  const getPerformanceColor = (value: number, threshold: number, reverse = false) => {
    const isGood = reverse ? value < threshold : value <= threshold
    return isGood ? 'text-green-600' : 'text-red-600'
  }

  // 获取性能等级
  const getPerformanceGrade = (
    metrics: PerformanceMetrics
  ): { grade: string; color: string; icon: React.ReactNode } => {
    if (metrics.isOptimal) {
      return {
        grade: '优秀',
        color: 'bg-green-500',
        icon: <Zap className="h-4 w-4" />,
      }
    } else if (metrics.renderTime < 150 && metrics.updateTime < 75) {
      return {
        grade: '良好',
        color: 'bg-yellow-500',
        icon: <Activity className="h-4 w-4" />,
      }
    } else {
      return {
        grade: '需优化',
        color: 'bg-red-500',
        icon: <AlertTriangle className="h-4 w-4" />,
      }
    }
  }

  // 格式化内存大小
  const formatMemorySize = (bytes?: number): string => {
    if (!bytes) return 'N/A'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Settings className="mr-2 h-4 w-4" />
        性能监控
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="border-2 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Activity className="h-4 w-4" />
              属性面板性能监控
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
              >
                {isMonitoring ? '停止监控' : '开始监控'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
                ×
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {metrics ? (
            <>
              {/* 性能等级 */}
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <span className="text-sm font-medium">整体性能</span>
                <div className="flex items-center gap-2">
                  {getPerformanceGrade(metrics).icon}
                  <Badge className={getPerformanceGrade(metrics).color}>
                    {getPerformanceGrade(metrics).grade}
                  </Badge>
                </div>
              </div>

              {/* 渲染性能 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">平均渲染时间</span>
                  <span
                    className={`font-mono text-sm ${getPerformanceColor(metrics.renderTime, 100)}`}
                  >
                    {metrics.renderTime.toFixed(1)} ms
                  </span>
                </div>
                <Progress value={Math.min((metrics.renderTime / 100) * 100, 100)} className="h-2" />
              </div>

              {/* 更新性能 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">平均更新时间</span>
                  <span
                    className={`font-mono text-sm ${getPerformanceColor(metrics.updateTime, 50)}`}
                  >
                    {metrics.updateTime.toFixed(1)} ms
                  </span>
                </div>
                <Progress value={Math.min((metrics.updateTime / 50) * 100, 100)} className="h-2" />
              </div>

              {/* 内存使用 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">内存使用</span>
                  <span
                    className={`font-mono text-sm ${getPerformanceColor(metrics.memoryUsage || 0, 50 * 1024 * 1024, true)}`}
                  >
                    {formatMemorySize(metrics.memoryUsage)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">组件渲染次数: {metrics.componentCount}</div>
              </div>

              {/* 优化建议 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">优化建议</h4>
                <div className="space-y-1">
                  {PropertyPerformanceUtils.getSuggestions(metrics).map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="mt-0.5 text-yellow-500">•</span>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                  {PropertyPerformanceUtils.getSuggestions(metrics).length === 0 && (
                    <div className="text-xs text-green-600">性能表现良好，无需优化</div>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={clearMetrics} className="flex-1">
                  清除指标
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  刷新页面
                </Button>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <Activity className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">点击&ldquo;开始监控&rdquo;查看性能指标</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// 性能监控提供者组件
interface PerformanceProviderProps {
  children: React.ReactNode
  enableMonitoring?: boolean
}

export function PropertyPerformanceProvider({
  children,
  enableMonitoring = false,
}: PerformanceProviderProps) {
  const {} = usePropertyPerformanceMonitor()

  useEffect(() => {
    if (!enableMonitoring) return

    // 监控组件渲染性能
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (entry.entryType === 'measure' && entry.name.includes('property-render')) {
          // 记录渲染时间
        }
      })
    })

    observer.observe({ entryTypes: ['measure'] })

    return () => observer.disconnect()
  }, [enableMonitoring])

  return <>{children}</>
}

export default PropertyPerformanceMonitor
