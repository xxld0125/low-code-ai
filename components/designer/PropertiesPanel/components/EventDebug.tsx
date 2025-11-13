/**
 * 事件调试组件
 * 提供事件调试和诊断信息
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Code,
  Play,
  Bug,
  Settings,
  Info,
  AlertTriangle,
  CheckCircle,
  Terminal
} from 'lucide-react'

import type { EventValidationResult, EventExecutionResult } from '@/types/designer'

interface EventDebugProps {
  currentEvents: Array<{
    id: string
    type: string
    description?: string
  }>
  validationResult: Record<string, EventValidationResult>
  lastExecutionResult: EventExecutionResult | null
  onTestEvent: (eventId: string) => void
}

export function EventDebug({
  currentEvents,
  validationResult,
  lastExecutionResult,
  onTestEvent
}: EventDebugProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [customTestData, setCustomTestData] = useState('')

  const selectedEvent = currentEvents.find(event => event.id === selectedEventId)

  const formatJson = (obj: any) => {
    return JSON.stringify(obj, null, 2)
  }

  const getEventStatus = (event: EventConfig) => {
    const validation = validationResult[event.id]

    if (!event.enabled) {
      return { color: 'secondary', text: '已禁用', icon: Settings }
    }

    if (!validation) {
      return { color: 'outline', text: '未验证', icon: Info }
    }

    if (!validation.isValid) {
      return { color: 'destructive', text: '有错误', icon: AlertTriangle }
    }

    if (validation.warnings.length > 0) {
      return { color: 'secondary', text: '有警告', icon: AlertTriangle }
    }

    return { color: 'default', text: '正常', icon: CheckCircle }
  }

  return (
    <div className="space-y-4">
      {/* 事件选择 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bug className="w-4 h-4" />
            事件调试
          </CardTitle>
          <CardDescription>
            选择事件进行调试和测试
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentEvents.length === 0 ? (
              <div className="text-center py-4">
                <Bug className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">暂无事件可调试</p>
              </div>
            ) : (
              currentEvents.map(event => {
                const status = getEventStatus(event)
                const StatusIcon = status.icon

                return (
                  <div
                    key={event.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedEventId === event.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <StatusIcon className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{event.type}</div>
                          <div className="text-sm text-gray-500">
                            {event.actions.length} 个动作
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={status.color as any}>
                          {status.text}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onTestEvent(event.id)
                          }}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          测试
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* 事件详情 */}
      {selectedEvent && (
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config" className="text-xs">
              <Code className="w-3 h-3 mr-1" />
              配置
            </TabsTrigger>
            <TabsTrigger value="validation" className="text-xs">
              <Bug className="w-3 h-3 mr-1" />
              验证
            </TabsTrigger>
            <TabsTrigger value="test" className="text-xs">
              <Terminal className="w-3 h-3 mr-1" />
              测试
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">事件配置</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                  {formatJson(selectedEvent)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validation">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">验证结果</CardTitle>
              </CardHeader>
              <CardContent>
                {validationResult[selectedEvent.id] ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {validationResult[selectedEvent.id].isValid ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium">
                        {validationResult[selectedEvent.id].isValid ? '验证通过' : '验证失败'}
                      </span>
                    </div>

                    {validationResult[selectedEvent.id].errors.length > 0 && (
                      <Alert>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            {validationResult[selectedEvent.id].errors.map((error, index) => (
                              <div key={index} className="text-sm">• {error}</div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {validationResult[selectedEvent.id].warnings.length > 0 && (
                      <Alert>
                        <Info className="w-4 h-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            {validationResult[selectedEvent.id].warnings.map((warning, index) => (
                              <div key={index} className="text-sm">• {warning}</div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Bug className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">尚未验证此事件</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">自定义测试</CardTitle>
                <CardDescription>
                  使用自定义数据测试事件执行
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">测试数据 (JSON)</label>
                  <Textarea
                    value={customTestData}
                    onChange={(e) => setCustomTestData(e.target.value)}
                    placeholder='{"key": "value"}'
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onTestEvent(selectedEvent.id)}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    执行测试
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomTestData('')}
                  >
                    清空
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* 最后执行结果 */}
      {lastExecutionResult && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">最后执行结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {lastExecutionResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                <span className="font-medium">
                  {lastExecutionResult.success ? '执行成功' : '执行失败'}
                </span>
                <span className="text-sm text-gray-500">
                  ({lastExecutionResult.executionTime}ms)
                </span>
              </div>

              {lastExecutionResult.errors.length > 0 && (
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {lastExecutionResult.errors.map((error, index) => (
                        <div key={index} className="text-sm">• {error}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {lastExecutionResult.executedActions.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-1">已执行动作:</div>
                  <div className="text-xs text-gray-600">
                    {lastExecutionResult.executedActions.join(', ')}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}