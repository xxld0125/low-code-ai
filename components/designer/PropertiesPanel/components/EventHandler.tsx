/**
 * 专业级事件配置面板组件
 * 参考阿里低代码引擎设计，提供完整的事件管理功能
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Settings,
  Zap,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Shield,
  List,
  Grid3X3,
  MousePointer,
  Keyboard,
  FormInput,
  Monitor,
  Smartphone,
  Globe,
  Database,
  Api,
  ArrowRight,
  Play,
  Pause,
  Square,
  Copy,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Code,
  Link,
  RefreshCw,
  Bell,
  Upload,
  Download,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react'

interface EventHandlerProps {
  componentId: string
  componentType?: string
  disabled?: boolean
  showTemplates?: boolean
  showDebugInfo?: boolean
  enableHistory?: boolean
}

// 事件类型定义
const EVENT_CATEGORIES = {
  mouse: {
    name: '鼠标事件',
    icon: MousePointer,
    color: 'bg-blue-500',
    events: ['onClick', 'onDoubleClick', 'onMouseDown', 'onMouseUp', 'onMouseEnter', 'onMouseLeave', 'onMouseMove']
  },
  keyboard: {
    name: '键盘事件',
    icon: Keyboard,
    color: 'bg-green-500',
    events: ['onKeyDown', 'onKeyUp', 'onKeyPress']
  },
  form: {
    name: '表单事件',
    icon: FormInput,
    color: 'bg-purple-500',
    events: ['onChange', 'onInput', 'onSubmit', 'onReset', 'onFocus', 'onBlur']
  },
  lifecycle: {
    name: '生命周期',
    icon: Clock,
    color: 'bg-orange-500',
    events: ['onLoad', 'onUnload', 'onMount', 'onUnmount', 'onUpdate']
  },
  touch: {
    name: '触摸事件',
    icon: Smartphone,
    color: 'bg-pink-500',
    events: ['onTouchStart', 'onTouchEnd', 'onTouchMove', 'onTouchCancel']
  },
  system: {
    name: '系统事件',
    icon: Monitor,
    color: 'bg-gray-500',
    events: ['onError', 'onResize', 'onScroll', 'onVisibilityChange']
  }
}

// 动作类型定义
const ACTION_CATEGORIES = {
  navigation: {
    name: '导航动作',
    icon: Link,
    color: 'bg-blue-500',
    actions: [
      { id: 'navigate', name: '页面跳转', description: '跳转到指定页面' },
      { id: 'back', name: '返回上一页', description: '返回浏览器历史记录' },
      { id: 'refresh', name: '刷新页面', description: '重新加载当前页面' },
      { id: 'open', name: '打开新窗口', description: '在新窗口打开URL' }
    ]
  },
  ui: {
    name: '界面动作',
    icon: Eye,
    color: 'bg-green-500',
    actions: [
      { id: 'show', name: '显示元素', description: '显示指定组件' },
      { id: 'hide', name: '隐藏元素', description: '隐藏指定组件' },
      { id: 'toggle', name: '切换显示', description: '切换组件显示状态' },
      { id: 'highlight', name: '高亮元素', description: '高亮显示指定组件' }
    ]
  },
  data: {
    name: '数据动作',
    icon: Database,
    color: 'bg-purple-500',
    actions: [
      { id: 'fetch', name: '获取数据', description: '从API获取数据' },
      { id: 'save', name: '保存数据', description: '保存数据到服务器' },
      { id: 'delete', name: '删除数据', description: '删除指定数据' },
      { id: 'update', name: '更新数据', description: '更新现有数据' }
    ]
  },
  notification: {
    name: '通知动作',
    icon: Bell,
    color: 'bg-orange-500',
    actions: [
      { id: 'alert', name: '弹窗提示', description: '显示警告对话框' },
      { id: 'toast', name: '轻提示', description: '显示轻量级提示' },
      { id: 'confirm', name: '确认对话框', description: '显示确认对话框' },
      { id: 'loading', name: '加载提示', description: '显示加载状态' }
    ]
  }
}

// 组件类型与推荐事件映射
const COMPONENT_EVENT_RECOMMENDATIONS = {
  Button: ['onClick', 'onMouseEnter', 'onMouseLeave'],
  Input: ['onChange', 'onFocus', 'onBlur', 'onKeyDown'],
  Text: ['onClick', 'onMouseEnter', 'onMouseLeave'],
  Container: ['onLoad', 'onResize', 'onScroll'],
  Image: ['onLoad', 'onError', 'onClick'],
  Form: ['onSubmit', 'onReset', 'onChange']
}

export function EventHandler({
  componentId,
  componentType,
  disabled = false,
  showTemplates = true,
  showDebugInfo = true,
  enableHistory = true
}: EventHandlerProps) {
  const [activeTab, setActiveTab] = useState('config')
  const [selectedEventCategory, setSelectedEventCategory] = useState<string>('mouse')
  const [selectedActionCategory, setSelectedActionCategory] = useState<string>('navigation')
  const [showEventDialog, setShowEventDialog] = useState(false)

  // 获取当前组件类型推荐的事件
  const getRecommendedEvents = () => {
    if (!componentType || !COMPONENT_EVENT_RECOMMENDATIONS[componentType]) {
      return ['onClick', 'onChange', 'onSubmit']
    }
    return COMPONENT_EVENT_RECOMMENDATIONS[componentType]
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* 头部信息区域 */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">事件配置</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">组件ID: {componentId}</span>
              {componentType && (
                <>
                  <span className="text-xs text-gray-400">•</span>
                  <Badge variant="outline" className="text-xs h-5">
                    {componentType}
                  </Badge>
                </>
              )}
            </div>
          </div>
          <Button
            size="sm"
            disabled={disabled}
            onClick={() => setShowEventDialog(true)}
            className="h-7 text-xs px-3 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-3 h-3 mr-1" />
            添加事件
          </Button>
        </div>

        {/* 事件统计概览 */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2 text-center">
            <div className="text-lg font-semibold text-blue-700 dark:text-blue-400">0</div>
            <div className="text-xs text-blue-600 dark:text-blue-500">总数</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2 text-center">
            <div className="text-lg font-semibold text-green-700 dark:text-green-400">0</div>
            <div className="text-xs text-green-600 dark:text-green-500">已启用</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded p-2 text-center">
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-400">0</div>
            <div className="text-xs text-gray-600 dark:text-gray-500">已禁用</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2 text-center">
            <div className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">0</div>
            <div className="text-xs text-yellow-600 dark:text-yellow-500">有警告</div>
          </div>
        </div>

        {/* 主标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-3">
          <TabsList className="grid w-full grid-cols-3 h-7">
            <TabsTrigger value="config" className="text-xs">
              <Settings className="w-3 h-3 mr-1" />
              配置
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs" disabled={!showTemplates}>
              <Zap className="w-3 h-3 mr-1" />
              模板
            </TabsTrigger>
            <TabsTrigger value="debug" className="text-xs" disabled={!showDebugInfo}>
              <Activity className="w-3 h-3 mr-1" />
              调试
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="config" className="h-full mt-0 m-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-4">
                {/* 智能事件推荐 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      智能推荐事件
                    </CardTitle>
                    <CardDescription className="text-xs">
                      基于 {componentType || '通用'} 组件类型推荐的常用事件
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-2">
                      {getRecommendedEvents().map((event) => (
                        <Button
                          key={event}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs justify-start"
                          onClick={() => setShowEventDialog(true)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {event}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 事件库分类 */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">事件库</CardTitle>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Search className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Filter className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {Object.entries(EVENT_CATEGORIES).map(([key, category]) => {
                        const Icon = category.icon
                        return (
                          <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-6 h-6 ${category.color} rounded flex items-center justify-center`}>
                                <Icon className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm font-medium">{category.name}</span>
                              <Badge variant="secondary" className="text-xs ml-auto">
                                {category.events.length}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              {category.events.map((event) => (
                                <Button
                                  key={event}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs justify-start px-2"
                                  onClick={() => setShowEventDialog(true)}
                                >
                                  {event}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* 空状态提示 */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-6">
                      <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        暂无事件配置
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        选择上方推荐事件或从事件库中添加事件处理器
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setShowEventDialog(true)}
                        className="h-7 text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        添加第一个事件
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="templates" className="h-full mt-0 m-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      事件模板库
                    </CardTitle>
                    <CardDescription className="text-xs">
                      使用预定义的事件模板快速配置复杂交互逻辑
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 gap-3">
                      {/* 表单提交模板 */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-medium">表单提交验证</h5>
                          <Badge variant="outline" className="text-xs">表单</Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          onSubmit时验证表单数据，通过后提交到服务器
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Code className="w-3 h-3" />
                          <span>onSubmit → validate → submit → success/error</span>
                        </div>
                      </div>

                      {/* 数据加载模板 */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-medium">数据加载状态</h5>
                          <Badge variant="outline" className="text-xs">数据</Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          onClick时显示加载状态，异步获取数据后更新界面
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Code className="w-3 h-3" />
                          <span>onClick → loading → fetch → update/loaded</span>
                        </div>
                      </div>

                      {/* 页面跳转模板 */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-medium">条件页面跳转</h5>
                          <Badge variant="outline" className="text-xs">导航</Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          onClick时检查条件，根据结果跳转到不同页面
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Code className="w-3 h-3" />
                          <span>onClick → check → navigate/pageA/pageB</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="debug" className="h-full mt-0 m-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        调试控制台
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Play className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      实时监控事件执行情况和调试信息
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-xs font-medium">调试模式</span>
                        <Badge variant="default" className="text-xs bg-green-600">已启用</Badge>
                      </div>

                      {/* 事件日志区域 */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded p-3 bg-gray-50 dark:bg-gray-800/50">
                        <div className="text-center py-6">
                          <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            暂无事件执行记录
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            执行事件后将在此显示详细日志
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* 事件配置对话框 - 简化版本提示 */}
      {showEventDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-3">添加事件</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              事件配置对话框即将推出完整版本，敬请期待！
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                取消
              </Button>
              <Button onClick={() => setShowEventDialog(false)}>
                确认
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 默认导出
export default EventHandler