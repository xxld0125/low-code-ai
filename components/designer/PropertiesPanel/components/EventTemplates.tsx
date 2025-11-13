/**
 * 事件模板组件
 * 提供预设的事件模板，快速创建常用事件配置
 */

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Zap,
  Search,
  Copy,
  Navigation,
  MessageSquare,
  Send,
  Settings,
  Download,
  RefreshCw,
  ArrowUp,
  Plus
} from 'lucide-react'

import type { EventAction } from '@/types/designer'

interface EventTemplate {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  actions: Array<Omit<EventAction, 'id'>>
  icon: React.ComponentType<any>
  popular?: boolean
  new?: boolean
}

interface EventTemplatesProps {
  componentId: string
  componentType?: string
  onTemplateSelect: (template: EventTemplate) => void
}

// 预定义的事件模板
const eventTemplates: EventTemplate[] = [
  {
    id: 'navigation-basic',
    name: '基础页面导航',
    description: '点击后导航到指定页面',
    category: 'navigation',
    tags: ['常用', '导航'],
    popular: true,
    icon: Navigation,
    actions: [
      {
        type: 'navigate',
        payload: { url: '/target-page' },
        order: 1,
        description: '导航到目标页面'
      }
    ]
  },
  {
    id: 'navigation-confirm',
    name: '确认页面跳转',
    description: '显示确认对话框后导航',
    category: 'navigation',
    tags: ['导航', '确认'],
    icon: Navigation,
    actions: [
      {
        type: 'show-message',
        payload: {
          message: '确定要离开当前页面吗？',
          type: 'warning'
        },
        order: 1,
        description: '显示确认消息'
      },
      {
        type: 'navigate',
        payload: { url: '/target-page' },
        order: 2,
        description: '导航到目标页面'
      }
    ]
  },
  {
    id: 'form-submit',
    name: '表单提交',
    description: '提交表单数据到后端',
    category: 'form',
    tags: ['常用', '表单'],
    popular: true,
    icon: Send,
    actions: [
      {
        type: 'submit-form',
        payload: {
          formId: 'user-form',
          url: '/api/submit',
          method: 'POST'
        },
        order: 1,
        description: '提交表单数据'
      },
      {
        type: 'show-message',
        payload: {
          message: '表单提交成功',
          type: 'success'
        },
        order: 2,
        description: '显示成功消息'
      }
    ]
  },
  {
    id: 'form-submit-with-validation',
    name: '带验证的表单提交',
    description: '验证后提交表单，失败时显示错误',
    category: 'form',
    tags: ['表单', '验证'],
    icon: Send,
    actions: [
      {
        type: 'submit-form',
        payload: {
          formId: 'user-form',
          url: '/api/submit',
          method: 'POST',
          validate: true
        },
        order: 1,
        description: '提交表单数据'
      },
      {
        type: 'show-message',
        payload: {
          message: '提交成功',
          type: 'success'
        },
        order: 2,
        condition: 'submitSuccess',
        description: '显示成功消息'
      },
      {
        type: 'show-message',
        payload: {
          message: '提交失败，请检查表单内容',
          type: 'error'
        },
        order: 3,
        condition: '!submitSuccess',
        description: '显示失败消息'
      }
    ]
  },
  {
    id: 'api-call-success',
    name: 'API调用成功提示',
    description: '调用API并根据结果显示消息',
    category: 'api',
    tags: ['API', '消息'],
    icon: MessageSquare,
    actions: [
      {
        type: 'api-call',
        payload: {
          url: '/api/data',
          method: 'GET'
        },
        order: 1,
        description: '调用API'
      },
      {
        type: 'show-message',
        payload: {
          message: '数据加载成功',
          type: 'success'
        },
        order: 2,
        description: '显示成功消息'
      }
    ]
  },
  {
    id: 'toggle-visibility',
    name: '切换元素可见性',
    description: '点击切换元素显示状态',
    category: 'interaction',
    tags: ['交互', '状态'],
    icon: Settings,
    actions: [
      {
        type: 'toggle-state',
        payload: {
          target: 'component.visible'
        },
        order: 1,
        description: '切换显示状态'
      }
    ]
  },
  {
    id: 'scroll-to-top',
    name: '滚动到顶部',
    description: '平滑滚动到页面顶部',
    category: 'interaction',
    tags: ['滚动', '导航'],
    icon: ArrowUp,
    actions: [
      {
        type: 'scroll-to',
        payload: {
          target: 'top',
          behavior: 'smooth'
        },
        order: 1,
        description: '滚动到顶部'
      }
    ]
  },
  {
    id: 'download-file',
    name: '文件下载',
    description: '点击下载指定文件',
    category: 'file',
    tags: ['下载', '文件'],
    new: true,
    icon: Download,
    actions: [
      {
        type: 'download-file',
        payload: {
          url: '/files/document.pdf',
          filename: 'document.pdf'
        },
        order: 1,
        description: '下载文件'
      }
    ]
  },
  {
    id: 'refresh-data',
    name: '刷新数据',
    description: '重新加载指定数据源',
    category: 'data',
    tags: ['数据', '刷新'],
    icon: RefreshCw,
    actions: [
      {
        type: 'refresh-data',
        payload: {
          source: 'user-list',
          showLoading: true,
          clearCache: true
        },
        order: 1,
        description: '刷新数据'
      }
    ]
  }
]

const categories = [
  { id: 'all', name: '全部', count: eventTemplates.length },
  { id: 'navigation', name: '导航', count: eventTemplates.filter(t => t.category === 'navigation').length },
  { id: 'form', name: '表单', count: eventTemplates.filter(t => t.category === 'form').length },
  { id: 'api', name: 'API', count: eventTemplates.filter(t => t.category === 'api').length },
  { id: 'interaction', name: '交互', count: eventTemplates.filter(t => t.category === 'interaction').length },
  { id: 'file', name: '文件', count: eventTemplates.filter(t => t.category === 'file').length },
  { id: 'data', name: '数据', count: eventTemplates.filter(t => t.category === 'data').length }
]

export function EventTemplates({ componentId: _componentId, componentType, onTemplateSelect }: EventTemplatesProps) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('all')
  const [showPopular, setShowPopular] = React.useState(false)

  // 过滤模板
  const filteredTemplates = eventTemplates.filter(template => {
    const matchesSearch = searchTerm === '' ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesPopular = !showPopular || template.popular

    return matchesSearch && matchesCategory && matchesPopular
  })

  return (
    <div className="space-y-4">
      {/* 搜索和筛选 */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="搜索模板..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={showPopular ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowPopular(!showPopular)}
          >
            热门
          </Button>
        </div>
      </div>

      {/* 模板网格 */}
      <ScrollArea className="h-96">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTemplates.map(template => {
            const Icon = template.icon

            return (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onTemplateSelect(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      {template.popular && (
                        <Badge variant="secondary" className="text-xs">热门</Badge>
                      )}
                      {template.new && (
                        <Badge variant="outline" className="text-xs">新</Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-xs text-gray-500">
                      {template.actions.length} 个动作
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        onTemplateSelect(template)
                      }}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      使用模板
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <Zap className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">未找到匹配的模板</p>
            <p className="text-xs text-gray-400">尝试调整搜索条件或分类</p>
          </div>
        )}
      </ScrollArea>

      {/* 推荐模板 */}
      {componentType && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">推荐模板</CardTitle>
            <CardDescription className="text-xs">
              基于 {componentType} 组件类型的推荐
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getRecommendedTemplates(componentType).map(template => {
                const Icon = template.icon
                return (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50"
                    onClick={() => onTemplateSelect(template)}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3 h-3" />
                      <span className="text-sm">{template.name}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// 获取推荐模板
function getRecommendedTemplates(componentType: string): EventTemplate[] {
  const recommendations: Record<string, string[]> = {
    'Button': ['navigation-basic', 'form-submit', 'toggle-visibility'],
    'Input': ['form-submit', 'api-call-success'],
    'Form': ['form-submit-with-validation', 'reset-form'],
    'Card': ['toggle-visibility', 'scroll-to-top'],
    'List': ['refresh-data', 'api-call-success'],
    'Table': ['download-file', 'refresh-data'],
    'Modal': ['close-modal', 'navigation-confirm']
  }

  const templateIds = recommendations[componentType] || []
  return eventTemplates.filter(template => templateIds.includes(template.id))
}