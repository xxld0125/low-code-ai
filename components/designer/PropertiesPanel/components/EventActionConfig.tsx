/**
 * 事件动作配置组件
 * 用于配置事件的具体动作
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit3,
  Copy,
  Settings,
  Plus,
  ArrowUp,
  ArrowDown,
  Clock,
  FileText,
  Link,
  Send,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Zap
} from 'lucide-react'

import type { EventAction, EventActionType } from '@/types/designer'
import {
  useAddActionToEvent,
  useUpdateEventAction,
  useRemoveEventAction,
  useReorderEventActions
} from '@/stores/property-config-store'

interface EventActionConfigProps {
  eventId: string
  action: EventAction
  index: number
  disabled?: boolean
  showAdvanced?: boolean
}

// 动作类型配置
const actionTypeConfigs: Record<EventActionType, {
  label: string
  description: string
  icon: React.ComponentType<any>
  payloadFields: Array<{
    key: string
    label: string
    type: 'text' | 'number' | 'url' | 'textarea' | 'select' | 'boolean'
    required?: boolean
    options?: string[]
    placeholder?: string
    default?: unknown
  }>
  examples?: Array<{
    label: string
    payload: Record<string, unknown>
  }>
}> = {
  navigate: {
    label: '页面导航',
    description: '导航到指定页面或URL',
    icon: Link,
    payloadFields: [
      {
        key: 'url',
        label: '目标URL',
        type: 'url',
        required: true,
        placeholder: '/target-page 或 https://example.com'
      },
      {
        key: 'target',
        label: '打开方式',
        type: 'select',
        options: ['_self', '_blank', '_parent', '_top'],
        default: '_self'
      },
      {
        key: 'replace',
        label: '替换历史记录',
        type: 'boolean',
        default: false
      }
    ],
    examples: [
      { label: '内部页面', payload: { url: '/dashboard' } },
      { label: '外部链接', payload: { url: 'https://example.com', target: '_blank' } }
    ]
  },
  'api-call': {
    label: 'API调用',
    description: '调用API接口获取或提交数据',
    icon: Send,
    payloadFields: [
      {
        key: 'url',
        label: 'API地址',
        type: 'url',
        required: true,
        placeholder: '/api/data'
      },
      {
        key: 'method',
        label: '请求方法',
        type: 'select',
        options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        default: 'GET'
      },
      {
        key: 'data',
        label: '请求数据',
        type: 'textarea',
        placeholder: '{ "key": "value" }'
      },
      {
        key: 'headers',
        label: '请求头',
        type: 'textarea',
        placeholder: '{ "Content-Type": "application/json" }'
      },
      {
        key: 'successMessage',
        label: '成功消息',
        type: 'text',
        placeholder: '操作成功'
      },
      {
        key: 'errorMessage',
        label: '错误消息',
        type: 'text',
        placeholder: '操作失败'
      }
    ]
  },
  'show-message': {
    label: '显示消息',
    description: '显示提示消息或通知',
    icon: MessageSquare,
    payloadFields: [
      {
        key: 'message',
        label: '消息内容',
        type: 'textarea',
        required: true,
        placeholder: '请输入消息内容'
      },
      {
        key: 'type',
        label: '消息类型',
        type: 'select',
        options: ['info', 'success', 'warning', 'error'],
        default: 'info'
      },
      {
        key: 'duration',
        label: '显示时长(ms)',
        type: 'number',
        placeholder: '3000'
      },
      {
        key: 'position',
        label: '显示位置',
        type: 'select',
        options: ['top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
        default: 'top'
      }
    ]
  },
  'set-state': {
    label: '设置状态',
    description: '更新组件或全局状态',
    icon: Settings,
    payloadFields: [
      {
        key: 'target',
        label: '目标状态',
        type: 'text',
        required: true,
        placeholder: 'component.loading 或 global.user'
      },
      {
        key: 'value',
        label: '状态值',
        type: 'textarea',
        required: true,
        placeholder: 'true, false, "text", { key: "value" }'
      },
      {
        key: 'merge',
        label: '合并模式',
        type: 'boolean',
        default: true
      }
    ]
  },
  'toggle-state': {
    label: '切换状态',
    description: '切换布尔类型状态',
    icon: RefreshCw,
    payloadFields: [
      {
        key: 'target',
        label: '目标状态',
        type: 'text',
        required: true,
        placeholder: 'component.visible'
      }
    ]
  },
  'reset-form': {
    label: '重置表单',
    description: '重置表单字段到初始值',
    icon: RefreshCw,
    payloadFields: [
      {
        key: 'formId',
        label: '表单ID',
        type: 'text',
        placeholder: 'user-form 或留空重置所有表单'
      },
      {
        key: 'fields',
        label: '指定字段',
        type: 'textarea',
        placeholder: '["name", "email"] 或留空重置所有字段'
      }
    ]
  },
  'submit-form': {
    label: '提交表单',
    description: '提交表单数据到指定接口',
    icon: Send,
    payloadFields: [
      {
        key: 'formId',
        label: '表单ID',
        type: 'text',
        required: true,
        placeholder: 'user-form'
      },
      {
        key: 'url',
        label: '提交地址',
        type: 'url',
        required: true,
        placeholder: '/api/submit'
      },
      {
        key: 'method',
        label: '提交方法',
        type: 'select',
        options: ['POST', 'PUT', 'PATCH'],
        default: 'POST'
      },
      {
        key: 'validate',
        label: '验证表单',
        type: 'boolean',
        default: true
      },
      {
        key: 'resetAfterSubmit',
        label: '提交后重置',
        type: 'boolean',
        default: false
      }
    ]
  },
  'scroll-to': {
    label: '滚动到位置',
    description: '滚动到指定元素或位置',
    icon: ArrowUp,
    payloadFields: [
      {
        key: 'target',
        label: '滚动目标',
        type: 'text',
        required: true,
        placeholder: '#element-id 或 top/bottom'
      },
      {
        key: 'behavior',
        label: '滚动方式',
        type: 'select',
        options: ['smooth', 'instant', 'auto'],
        default: 'smooth'
      },
      {
        key: 'offset',
        label: '偏移量(px)',
        type: 'number',
        placeholder: '0'
      }
    ]
  },
  'open-modal': {
    label: '打开模态框',
    description: '打开指定的模态框组件',
    icon: Plus,
    payloadFields: [
      {
        key: 'modalId',
        label: '模态框ID',
        type: 'text',
        required: true,
        placeholder: 'confirm-modal'
      },
      {
        key: 'data',
        label: '传递数据',
        type: 'textarea',
        placeholder: '{ "title": "确认", "content": "确定要删除吗？" }'
      },
      {
        key: 'backdrop',
        label: '背景遮罩',
        type: 'boolean',
        default: true
      },
      {
        key: 'closeOnBackdrop',
        label: '点击背景关闭',
        type: 'boolean',
        default: true
      }
    ]
  },
  'close-modal': {
    label: '关闭模态框',
    description: '关闭指定的模态框',
    icon: Plus,
    payloadFields: [
      {
        key: 'modalId',
        label: '模态框ID',
        type: 'text',
        placeholder: '留空关闭所有模态框'
      },
      {
        key: 'result',
        label: '关闭结果',
        type: 'text',
        placeholder: 'success 或 cancel'
      }
    ]
  },
  'download-file': {
    label: '下载文件',
    description: '下载指定的文件',
    icon: FileText,
    payloadFields: [
      {
        key: 'url',
        label: '文件地址',
        type: 'url',
        required: true,
        placeholder: '/files/document.pdf'
      },
      {
        key: 'filename',
        label: '文件名',
        type: 'text',
        placeholder: 'document.pdf'
      },
      {
        key: 'openInNewTab',
        label: '新标签页打开',
        type: 'boolean',
        default: false
      }
    ]
  },
  'copy-to-clipboard': {
    label: '复制到剪贴板',
    description: '复制文本内容到剪贴板',
    icon: Copy,
    payloadFields: [
      {
        key: 'text',
        label: '复制内容',
        type: 'textarea',
        required: true,
        placeholder: '要复制的文本内容'
      },
      {
        key: 'successMessage',
        label: '成功消息',
        type: 'text',
        placeholder: '已复制到剪贴板'
      }
    ]
  },
  'refresh-data': {
    label: '刷新数据',
    description: '重新加载指定数据源',
    icon: RefreshCw,
    payloadFields: [
      {
        key: 'source',
        label: '数据源',
        type: 'text',
        required: true,
        placeholder: 'user-list 或 global.settings'
      },
      {
        key: 'showLoading',
        label: '显示加载状态',
        type: 'boolean',
        default: true
      },
      {
        key: 'clearCache',
        label: '清除缓存',
        type: 'boolean',
        default: true
      }
    ]
  }
}

export function EventActionConfig({
  eventId,
  action,
  index,
  disabled = false,
  showAdvanced = false
}: EventActionConfigProps) {
  // Store actions
  const updateEventAction = useUpdateEventAction()
  const removeEventAction = useRemoveEventAction()
  const reorderEventActions = useReorderEventActions()
  const addActionToEvent = useAddActionToEvent()

  // 本地状态
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [tempPayload, setTempPayload] = useState<Record<string, unknown>>(action.payload)
  const [showExamples, setShowExamples] = useState(false)

  const actionConfig = actionTypeConfigs[action.type]
  const Icon = actionConfig?.icon || Zap

  // 保存动作配置
  const handleSaveAction = () => {
    updateEventAction(eventId, action.id, { payload: tempPayload })
    setIsEditing(false)
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setTempPayload(action.payload)
    setIsEditing(false)
  }

  // 删除动作
  const handleRemoveAction = () => {
    if (confirm('确定要删除这个动作吗？')) {
      removeEventAction(eventId, action.id)
    }
  }

  // 复制动作
  const handleDuplicateAction = () => {
    const newAction = {
      ...action,
      id: `${action.id}-copy-${Date.now()}`,
      order: action.order + 0.5 // 插入到原动作后面
    }
    addActionToEvent(eventId, newAction)
  }

  // 上移动作
  const handleMoveUp = () => {
    if (index > 0) {
      reorderEventActions(eventId, index, index - 1)
    }
  }

  // 下移动作
  const handleMoveDown = () => {
    reorderEventActions(eventId, index, index + 1)
  }

  // 应用示例
  const handleApplyExample = (example: { label: string; payload: Record<string, unknown> }) => {
    setTempPayload(example.payload)
  }

  // 渲染载荷字段
  const renderPayloadField = (field: {
    key: string
    label: string
    type: 'text' | 'number' | 'url' | 'textarea' | 'select' | 'boolean'
    required?: boolean
    options?: string[]
    placeholder?: string
    default?: unknown
  }) => {
    const value = tempPayload[field.key] ?? field.default ?? ''
    const setValue = (newValue: unknown) => {
      setTempPayload(prev => ({
        ...prev,
        [field.key]: newValue
      }))
    }

    switch (field.type) {
      case 'text':
      case 'url':
        return (
          <Input
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            value={value as number}
            onChange={(e) => setValue(Number(e.target.value))}
            placeholder={field.placeholder}
            disabled={disabled}
          />
        )

      case 'textarea':
        return (
          <Textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              const text = e.target.value
              // 尝试解析JSON，如果失败则作为字符串处理
              try {
                const parsed = JSON.parse(text)
                setValue(parsed)
              } catch {
                setValue(text)
              }
            }}
            placeholder={field.placeholder}
            rows={3}
            disabled={disabled}
          />
        )

      case 'select':
        return (
          <Select value={value as string} onValueChange={setValue} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value as boolean}
              onCheckedChange={setValue}
              disabled={disabled}
            />
            <Label>{value ? '是' : '否'}</Label>
          </div>
        )

      default:
        return (
          <Input
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
          />
        )
    }
  }

  if (!actionConfig) {
    return (
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          未知动作类型: {action.type}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className={`transition-all duration-200 ${!action.enabled ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4" />
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {actionConfig.label}
                {!action.enabled && (
                  <Badge variant="secondary" className="text-xs">已禁用</Badge>
                )}
                {action.delay && action.delay > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {action.delay}ms
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                {action.description || actionConfig.description}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDuplicateAction}
            >
              <Copy className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleMoveUp}
              disabled={index === 0}
            >
              <ArrowUp className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleMoveDown}
            >
              <ArrowDown className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveAction}
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
            {/* 动作配置 */}
            {isEditing ? (
              <div className="space-y-3">
                {/* 启用状态 */}
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={action.enabled !== false}
                    onCheckedChange={(enabled) =>
                      updateEventAction(eventId, action.id, { enabled })
                    }
                  />
                  <Label>启用此动作</Label>
                </div>

                {/* 延迟执行 */}
                <div className="space-y-1">
                  <Label>延迟执行 (毫秒)</Label>
                  <Input
                    type="number"
                    value={action.delay || 0}
                    onChange={(e) =>
                      updateEventAction(eventId, action.id, { delay: Number(e.target.value) })
                    }
                    placeholder="0"
                    min="0"
                  />
                </div>

                {/* 载荷配置 */}
                <div className="space-y-3">
                  <Label>动作参数</Label>
                  {actionConfig.payloadFields.map(field => (
                    <div key={field.key} className="space-y-1">
                      <Label className="text-sm">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {renderPayloadField(field)}
                    </div>
                  ))}
                </div>

                {/* 动作示例 */}
                {actionConfig.examples && actionConfig.examples.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">使用示例</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowExamples(!showExamples)}
                      >
                        {showExamples ? '隐藏' : '显示'}示例
                      </Button>
                    </div>

                    {showExamples && (
                      <div className="space-y-2">
                        {actionConfig.examples.map((example, index) => (
                          <div
                            key={index}
                            className="p-2 border rounded-md cursor-pointer hover:bg-gray-50"
                            onClick={() => handleApplyExample(example)}
                          >
                            <div className="text-sm font-medium">{example.label}</div>
                            <div className="text-xs text-gray-500">
                              {JSON.stringify(example.payload, null, 2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveAction}>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    保存
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 当前配置预览 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">当前配置</Label>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(action.payload, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* 高级选项 */}
                {(action.delay || showAdvanced) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">高级选项</Label>
                    <div className="text-xs text-gray-600 space-y-1">
                      {action.delay && (
                        <div>延迟执行: {action.delay}ms</div>
                      )}
                      {action.condition && (
                        <div>执行条件: {action.condition}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}