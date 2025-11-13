/**
 * 事件配置组件
 * 用于管理组件的事件配置
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Play,
  Save,
  AlertCircle,
  CheckCircle,
  Settings
} from 'lucide-react'

import type { EventConfig, EventValidationResult } from '@/types/designer'
import {
  useEventConfigs,
  useAvailableEventTypes,
  useEditingEventId,
  useEventValidationErrors,
  useIsEventValidating,
  useIsEventExecuting,
  useLastEventExecutionResult,
  useAddEventConfig,
  useUpdateEventConfig,
  useRemoveEventConfig,
  useDuplicateEvent,
  useExecuteEvent,
  useValidateEventConfig,
  useStartEditingEvent,
  useStopEditing,
  useSaveEventConfigs
} from '@/stores/property-config-store'
import { EventActionConfig } from './EventActionConfig'

interface EventConfigProps {
  componentId: string
  disabled?: boolean
}

export function EventConfig({ componentId, disabled = false }: EventConfigProps) {
  // Store状态
  const eventConfigs = useEventConfigs(componentId)
  const availableEventTypes = useAvailableEventTypes()
  const editingEventId = useEditingEventId()
  const eventValidationErrors = useEventValidationErrors()
  const isEventValidating = useIsEventValidating()
  const isEventExecuting = useIsEventExecuting()
  const lastEventExecutionResult = useLastEventExecutionResult()

  // Store actions
  const addEventConfig = useAddEventConfig()
  const updateEventConfig = useUpdateEventConfig()
  const removeEventConfig = useRemoveEventConfig()
  const duplicateEvent = useDuplicateEvent()
  const executeEvent = useExecuteEvent()
  const validateEventConfig = useValidateEventConfig()
  const startEditingEvent = useStartEditingEvent()
  const stopEditing = useStopEditing()
  const saveEventConfigs = useSaveEventConfigs()

  // 本地状态
  const [selectedEventType, setSelectedEventType] = useState('')
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())
  const [isAddingEvent, setIsAddingEvent] = useState(false)

  // 初始化时展开所有事件
  useEffect(() => {
    const expanded = new Set(eventConfigs.map(event => event.id))
    setExpandedEvents(expanded)
  }, [eventConfigs])

  // 处理事件展开/折叠
  const toggleEventExpanded = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
      } else {
        newSet.add(eventId)
      }
      return newSet
    })
  }

  // 添加新事件
  const handleAddEvent = () => {
    if (!selectedEventType) return

    addEventConfig(selectedEventType, {
      description: `${selectedEventType}事件处理`
    })

    setSelectedEventType('')
    setIsAddingEvent(false)
  }

  // 删除事件
  const handleRemoveEvent = (eventId: string) => {
    if (confirm('确定要删除这个事件配置吗？')) {
      removeEventConfig(eventId)
    }
  }

  // 复制事件
  const handleDuplicateEvent = (eventId: string) => {
    duplicateEvent(eventId)
  }

  // 测试事件执行
  const handleExecuteEvent = async (eventId: string) => {
    try {
      const context = {
        componentId,
        eventType: eventConfigs.find(e => e.id === eventId)?.type || 'test',
        timestamp: Date.now(),
        userInfo: {
          userId: 'test-user',
          permissions: ['edit']
        },
        environment: 'designer' as const
      }

      await executeEvent(eventId, context)
    } catch (error) {
      console.error('事件执行失败:', error)
    }
  }

  // 验证事件配置
  const handleValidateEvent = async (eventId: string) => {
    await validateEventConfig(eventId)
  }

  // 保存事件配置
  const handleSaveEvents = async () => {
    try {
      await saveEventConfigs(componentId)
    } catch (error) {
      console.error('保存事件配置失败:', error)
    }
  }

  // 获取事件验证结果
  const getEventValidationResult = (eventId: string): EventValidationResult | null => {
    return eventValidationErrors[eventId] || null
  }

  // 获取事件状态样式
  const getEventStatusStyle = (event: EventConfig) => {
    const validationResult = getEventValidationResult(event.id)

    if (!event.enabled) {
      return 'border-gray-300 bg-gray-50'
    }

    if (validationResult && !validationResult.isValid) {
      return 'border-red-300 bg-red-50'
    }

    if (validationResult?.warnings && validationResult.warnings.length > 0) {
      return 'border-yellow-300 bg-yellow-50'
    }

    return 'border-green-300 bg-green-50'
  }

  if (disabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            事件配置
          </CardTitle>
          <CardDescription>
            请先选择一个组件来配置事件
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">事件配置</h3>
          {eventConfigs.length > 0 && (
            <Badge variant="secondary">{eventConfigs.length} 个事件</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {eventConfigs.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveEvents}
              disabled={isEventValidating || isEventExecuting}
            >
              <Save className="w-4 h-4 mr-1" />
              保存配置
            </Button>
          )}
        </div>
      </div>

      {/* 添加事件按钮 */}
      {!isAddingEvent ? (
        <Button
          variant="outline"
          onClick={() => setIsAddingEvent(true)}
          className="w-full"
          disabled={isEventExecuting}
        >
          <Plus className="w-4 h-4 mr-2" />
          添加事件
        </Button>
      ) : (
        <Card className="border-blue-300 bg-blue-50">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="event-type">事件类型</Label>
                <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                  <SelectTrigger id="event-type">
                    <SelectValue placeholder="选择事件类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEventTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddEvent}
                  disabled={!selectedEventType}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingEvent(false)
                    setSelectedEventType('')
                  }}
                >
                  取消
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 事件列表 */}
      <div className="space-y-3">
        {eventConfigs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Settings className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">暂无事件配置</p>
                <p className="text-sm text-gray-400">点击上方按钮添加第一个事件</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          eventConfigs
            .sort((a, b) => a.order - b.order)
            .map(event => {
              const validationResult = getEventValidationResult(event.id)
              const isExpanded = expandedEvents.has(event.id)
              const isEditing = editingEventId === event.id

              return (
                <Card
                  key={event.id}
                  className={`transition-all duration-200 ${getEventStatusStyle(event)}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleEventExpanded(event.id)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>

                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {event.type}
                            {!event.enabled && (
                              <Badge variant="secondary" className="text-xs">已禁用</Badge>
                            )}
                          </CardTitle>
                          {event.description && (
                            <CardDescription className="text-sm">
                              {event.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {validationResult && (
                          <div className="flex items-center gap-1">
                            {validationResult.isValid ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditingEvent(event.id)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicateEvent(event.id)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExecuteEvent(event.id)}
                          disabled={isEventExecuting || !event.enabled}
                        >
                          <Play className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEvent(event.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <Collapsible open={isExpanded}>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-4">
                        {/* 事件基本信息编辑 */}
                        {isEditing && (
                          <div className="space-y-3 pb-3 border-b">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label htmlFor={`event-desc-${event.id}`}>描述</Label>
                                <Input
                                  id={`event-desc-${event.id}`}
                                  value={event.description || ''}
                                  onChange={(e) => updateEventConfig(event.id, { description: e.target.value })}
                                  placeholder="事件描述"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label htmlFor={`event-enabled-${event.id}`}>启用状态</Label>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Switch
                                    id={`event-enabled-${event.id}`}
                                    checked={event.enabled}
                                    onCheckedChange={(enabled) => updateEventConfig(event.id, { enabled })}
                                  />
                                  <Label htmlFor={`event-enabled-${event.id}`}>
                                    {event.enabled ? '已启用' : '已禁用'}
                                  </Label>
                                </div>
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                stopEditing()
                                handleValidateEvent(event.id)
                              }}
                            >
                              完成编辑
                            </Button>
                          </div>
                        )}

                        {/* 验证结果显示 */}
                        {validationResult && !validationResult.isValid && (
                          <Alert variant="destructive">
                            <AlertCircle className="w-4 h-4" />
                            <AlertDescription>
                              <div className="space-y-1">
                                <p className="font-medium">配置错误:</p>
                                {validationResult.errors.map((error, index) => (
                                  <p key={index} className="text-sm">• {error}</p>
                                ))}
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}

                        {validationResult?.warnings && validationResult.warnings.length > 0 && (
                          <Alert>
                            <AlertCircle className="w-4 h-4" />
                            <AlertDescription>
                              <div className="space-y-1">
                                <p className="font-medium">警告:</p>
                                {validationResult.warnings.map((warning, index) => (
                                  <p key={index} className="text-sm">• {warning}</p>
                                ))}
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* 事件动作列表 */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">事件动作 ({event.actions.length})</Label>
                          </div>

                          {event.actions.length === 0 ? (
                            <div className="text-center py-4 border rounded-md border-dashed">
                              <p className="text-sm text-gray-500">暂无动作配置</p>
                              <p className="text-xs text-gray-400">添加动作来定义事件的行为</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {event.actions
                                .sort((a, b) => a.order - b.order)
                                .map((action, index) => (
                                  <EventActionConfig
                                    key={action.id}
                                    eventId={event.id}
                                    action={action}
                                    index={index}
                                    disabled={!event.enabled}
                                  />
                                ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )
            })
        )}
      </div>

      {/* 执行结果显示 */}
      {lastEventExecutionResult && (
        <Alert>
          <Play className="w-4 h-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">
                事件执行 {lastEventExecutionResult.success ? '成功' : '失败'}
              </p>
              <p className="text-sm">
                执行时间: {lastEventExecutionResult.executionTime}ms
              </p>
              {lastEventExecutionResult.errors.length > 0 && (
                <div className="space-y-1">
                  {lastEventExecutionResult.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600">• {error}</p>
                  ))}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}