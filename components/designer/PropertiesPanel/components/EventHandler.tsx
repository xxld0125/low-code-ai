/**
 * 事件处理器组件
 * 提供统一的事件处理界面和配置管理
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Settings,
  Zap,
  History,
  Code,
  Play,
  Save,
  RefreshCw,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Shield,
  List,
  Grid3X3
} from 'lucide-react'

import type {
  EventConfig,
  EventAction,
  EventValidationResult,
  EventExecutionResult
} from '@/types/designer'

import { EventConfig } from './EventConfig'
import { EventHistory } from './EventHistory'
import { EventDebug } from './EventDebug'
import { EventTemplates } from './EventTemplates'

interface EventHandlerProps {
  componentId: string
  componentType?: string
  componentEvents?: Record<string, EventConfig[]>
  disabled?: boolean
  onEventChange?: (events: EventConfig[]) => void
}

interface EventSummary {
  total: number
  enabled: number
  disabled: number
  withErrors: number
  withWarnings: number
}

export function EventHandler({
  componentId,
  componentType,
  componentEvents = {},
  disabled = false,
  onEventChange
}: EventHandlerProps) {
  // 状态管理
  const [activeTab, setActiveTab] = useState('config')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [lastValidation, setLastValidation] = useState<Record<string, EventValidationResult>>({})
  const [lastExecution, setLastExecution] = useState<EventExecutionResult | null>(null)

  // 当前组件的事件配置
  const currentEvents = useMemo(() => {
    return componentEvents[componentId] || []
  }, [componentEvents, componentId])

  // 事件统计信息
  const eventSummary: EventSummary = useMemo(() => {
    const summary = {
      total: currentEvents.length,
      enabled: 0,
      disabled: 0,
      withErrors: 0,
      withWarnings: 0
    }

    currentEvents.forEach(event => {
      if (event.enabled) {
        summary.enabled++
      } else {
        summary.disabled++
      }

      const validationResult = lastValidation[event.id]
      if (validationResult) {
        if (!validationResult.isValid) {
          summary.withErrors++
        } else if (validationResult.warnings && validationResult.warnings.length > 0) {
          summary.withWarnings++
        }
      }
    })

    return summary
  }, [currentEvents, lastValidation])

  // 事件类型分组
  const eventsByType = useMemo(() => {
    const groups: Record<string, EventConfig[]> = {}

    currentEvents.forEach(event => {
      if (!groups[event.type]) {
        groups[event.type] = []
      }
      groups[event.type].push(event)
    })

    return groups
  }, [currentEvents])

  // 处理事件变更
  const handleEventChange = useCallback((events: EventConfig[]) => {
    onEventChange?.(events)
  }, [onEventChange])

  // 处理事件验证
  const handleValidationComplete = useCallback((results: Record<string, EventValidationResult>) => {
    setLastValidation(results)
  }, [])

  // 处理事件执行
  const handleExecutionComplete = useCallback((result: EventExecutionResult) => {
    setLastExecution(result)
  }, [])

  // 渲染事件统计卡片
  const renderEventSummary = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-blue-600">
              <List className="w-4 h-4" />
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-blue-900">{eventSummary.total}</div>
              <div className="text-xs text-blue-600">总数</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-green-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-green-900">{eventSummary.enabled}</div>
              <div className="text-xs text-green-600">已启用</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-gray-600">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">{eventSummary.disabled}</div>
              <div className="text-xs text-gray-600">已禁用</div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-red-600">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-red-900">{eventSummary.withErrors}</div>
              <div className="text-xs text-red-600">有错误</div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-yellow-600">
              <Shield className="w-4 h-4" />
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-yellow-900">{eventSummary.withWarnings}</div>
              <div className="text-xs text-yellow-600">有警告</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 渲染事件类型标签
  const renderEventTypeTags = () => {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(eventsByType).map(([type, events]) => (
          <Badge
            key={type}
            variant="secondary"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
          >
            {type} ({events.length})
          </Badge>
        ))}
      </div>
    )
  }

  // 渲染快速操作按钮
  const renderQuickActions = () => {
    return (
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          添加事件
        </Button>

        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-1" />
          验证全部
        </Button>

        <Button variant="outline" size="sm">
          <Save className="w-4 h-4 mr-1" />
          保存配置
        </Button>

        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (disabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            事件处理器
          </CardTitle>
          <CardDescription>
            请先选择一个组件来配置事件处理器
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* 头部信息 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <CardTitle>事件处理器</CardTitle>
              {componentType && (
                <Badge variant="outline">{componentType}</Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {eventSummary.withErrors > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {eventSummary.withErrors} 错误
                </Badge>
              )}
              {eventSummary.withWarnings > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {eventSummary.withWarnings} 警告
                </Badge>
              )}
            </div>
          </div>

          <CardDescription>
            配置组件的交互事件和处理逻辑
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 事件统计 */}
      {renderEventSummary()}

      {/* 事件类型标签 */}
      {renderEventTypeTags()}

      {/* 快速操作 */}
      {renderQuickActions()}

      {/* 主要内容区域 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            事件配置
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            事件模板
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            执行历史
          </TabsTrigger>
          <TabsTrigger value="debug" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            调试信息
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="mt-4">
          <EventConfig
            componentId={componentId}
            disabled={disabled}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <EventTemplates
            componentId={componentId}
            componentType={componentType}
            onTemplateSelect={(template) => {
              console.log('Selected template:', template)
              setActiveTab('config')
            }}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <EventHistory
            componentId={componentId}
            maxEntries={50}
          />
        </TabsContent>

        <TabsContent value="debug" className="mt-4">
          <EventDebug
            componentId={componentId}
            currentEvents={currentEvents}
            validationResult={lastValidation}
            lastExecutionResult={lastExecution}
            onTestEvent={(eventId) => {
              console.log('Testing event:', eventId)
            }}
          />
        </TabsContent>
      </Tabs>

      {/* 底部状态栏 */}
      {lastExecution && (
        <Alert>
          <Activity className="w-4 h-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                最近执行: {lastExecution.success ? '成功' : '失败'}
                ({lastExecution.executedActions.length} 个动作, {lastExecution.executionTime}ms)
              </span>
              <Clock className="w-4 h-4 text-gray-500" />
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}