/**
 * 事件历史记录组件
 * 显示事件的执行历史和统计信息
 */

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  History,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Activity
} from 'lucide-react'

interface EventHistoryProps {
  componentId: string
  maxEntries?: number
}

export function EventHistory({ componentId: _componentId, maxEntries = 20 }: EventHistoryProps) {
  // 模拟历史数据
  const mockHistory = [
    {
      eventId: 'event-001',
      actionId: 'action-001',
      actionType: 'navigate',
      timestamp: Date.now() - 5000,
      success: true,
      duration: 45,
      details: '导航到 /dashboard'
    },
    {
      eventId: 'event-002',
      actionId: 'action-002',
      actionType: 'api-call',
      timestamp: Date.now() - 15000,
      success: false,
      duration: 1200,
      details: 'API调用失败: 404 Not Found'
    },
    {
      eventId: 'event-003',
      actionId: 'action-003',
      actionType: 'show-message',
      timestamp: Date.now() - 30000,
      success: true,
      duration: 12,
      details: '显示成功消息'
    }
  ]

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN')
  }

  const formatDuration = (ms: number) => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`
  }

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000) {
      return `${Math.floor(diff / 1000)}秒前`
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`
    } else {
      return `${Math.floor(diff / 3600000)}小时前`
    }
  }

  return (
    <div className="space-y-4">
      {/* 统计信息 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" />
            执行统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {mockHistory.filter(h => h.success).length}
              </div>
              <div className="text-xs text-gray-500">成功</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">
                {mockHistory.filter(h => !h.success).length}
              </div>
              <div className="text-xs text-gray-500">失败</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {formatDuration(
                  Math.round(
                    mockHistory.reduce((sum, h) => sum + h.duration, 0) / mockHistory.length
                  )
                )}
              </div>
              <div className="text-xs text-gray-500">平均耗时</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {mockHistory.length}
              </div>
              <div className="text-xs text-gray-500">总执行次数</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 历史记录列表 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4" />
              执行历史
            </CardTitle>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-1" />
              刷新
            </Button>
          </div>
          <CardDescription>
            最近 {maxEntries} 条执行记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {mockHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">暂无执行历史</p>
                </div>
              ) : (
                mockHistory.map((record, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {record.success ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{record.actionType}</span>
                            <Badge variant="outline" className="text-xs">
                              {record.actionId}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {record.details}
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-xs text-gray-500">
                        <div>{formatTime(record.timestamp)}</div>
                        <div>{getRelativeTime(record.timestamp)}</div>
                        <div className="font-medium">{formatDuration(record.duration)}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}