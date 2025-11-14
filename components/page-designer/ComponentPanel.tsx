/**
 * 页面设计器组件面板
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import React, { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronRight,
  Plus,
  Settings,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ComponentType, ComponentCategory } from '@/types/page-designer/component'

// 基础组件导入
import { ButtonPreview } from '@/components/lowcode/basic/Button/Preview'
import { InputPreview } from '@/components/lowcode/basic/Input/Preview'
import { TextareaPreview } from '@/components/lowcode/basic/Textarea/Preview'
import { SelectPreview } from '@/components/lowcode/basic/Select/Preview'
import { CheckboxPreview } from '@/components/lowcode/basic/Checkbox/Preview'
import { RadioPreview } from '@/components/lowcode/basic/Radio/Preview'

// 展示组件导入
import { TextPreview } from '@/components/lowcode/display/Text'
import { HeadingPreview } from '@/components/lowcode/display/Heading'
import { ImagePreview } from '@/components/lowcode/display/Image'
import { CardPreview } from '@/components/lowcode/display/Card'
import { BadgePreview } from '@/components/lowcode/display/Badge'

// 布局组件导入
import { ContainerPreview } from '@/components/lowcode/layout/Container'
import { RowPreview } from '@/components/lowcode/layout/Row'
import { ColPreview } from '@/components/lowcode/layout/Col'
import { DividerPreview } from '@/components/lowcode/layout/Divider'
import { SpacerPreview } from '@/components/lowcode/layout/Spacer'

// 创建适配器组件以匹配期望的类型
const createPreviewAdapter = (PreviewComponent: React.FC<any>) => {
  const AdapterComponent = (props: { onClick?: () => void }) => {
    return <PreviewComponent />
  }
  AdapterComponent.displayName = `PreviewAdapter(${PreviewComponent.displayName || PreviewComponent.name})`
  return AdapterComponent
}

// 组件分类配置 - 参考阿里低代码引擎优化分类体系
const COMPONENT_CATEGORIES = [
  {
    id: 'container',
    name: '容器组件',
    description: '基础容器和布局组件',
    icon: LayoutGrid,
    color: 'bg-blue-500',
  },
  {
    id: 'content',
    name: '内容组件',
    description: '文本和内容展示组件',
    icon: List,
    color: 'bg-purple-500',
  },
  {
    id: 'form',
    name: '表单组件',
    description: '表单输入和验证组件',
    icon: Settings,
    color: 'bg-green-500',
  },
  {
    id: 'navigation',
    name: '导航组件',
    description: '导航和链接组件',
    icon: ChevronRight,
    color: 'bg-orange-500',
  },
  {
    id: 'feedback',
    name: '反馈组件',
    description: '提示和状态反馈组件',
    icon: Info,
    color: 'bg-red-500',
  },
  {
    id: 'data',
    name: '数据组件',
    description: '数据展示和表格组件',
    icon: Settings,
    color: 'bg-teal-500',
  },
] as const

// 优化组件配置 - 参考阿里低代码引擎重新组织
const BASIC_COMPONENTS = [
  // 容器组件
  {
    type: 'container',
    name: '容器',
    description: '基础容器组件，用于包裹和组织其他组件',
    category: 'container',
    icon: '📦',
    preview: createPreviewAdapter(ContainerPreview),
    keywords: ['container', 'wrapper', '容器', '盒子'],
  },
  {
    type: 'row',
    name: '行容器',
    description: '水平布局容器，用于将子组件水平排列',
    category: 'container',
    icon: '↔️',
    preview: createPreviewAdapter(RowPreview),
    keywords: ['row', 'horizontal', 'flex', '行', '水平'],
  },
  {
    type: 'col',
    name: '列容器',
    description: '栅格列组件，用于在Row组件中创建列布局',
    category: 'container',
    icon: '↕️',
    preview: createPreviewAdapter(ColPreview),
    keywords: ['col', 'column', 'grid', '列', '栅格'],
  },
  {
    type: 'card',
    name: '卡片容器',
    description: '卡片容器组件，提供边框和阴影效果',
    category: 'container',
    icon: '🃏',
    preview: CardPreview,
    keywords: ['card', 'container', '卡片', '容器'],
  },

  // 内容组件
  {
    type: 'heading',
    name: '标题',
    description: '标题显示组件，支持不同级别',
    category: 'content',
    icon: '📰',
    preview: HeadingPreview,
    keywords: ['heading', 'title', '标题', '大标题'],
  },
  {
    type: 'text',
    name: '文本',
    description: '文本显示组件，支持段落和样式',
    category: 'content',
    icon: '📝',
    preview: TextPreview,
    keywords: ['text', 'paragraph', '文本', '段落'],
  },
  {
    type: 'image',
    name: '图片',
    description: '图片显示组件，支持多种格式和样式',
    category: 'content',
    icon: '🖼️',
    preview: ImagePreview,
    keywords: ['image', 'img', '图片', '图像'],
  },
  {
    type: 'badge',
    name: '徽章',
    description: '徽章标识组件，用于状态标记',
    category: 'content',
    icon: '🏷️',
    preview: BadgePreview,
    keywords: ['badge', 'label', '徽章', '标签'],
  },
  {
    type: 'divider',
    name: '分割线',
    description: '分割线组件，用于分隔内容区域',
    category: 'content',
    icon: '➖',
    preview: createPreviewAdapter(DividerPreview),
    keywords: ['divider', 'separator', '分割线', '分隔'],
  },
  {
    type: 'spacer',
    name: '间距',
    description: '间距组件，用于在元素之间创建空间',
    category: 'content',
    icon: '⬜',
    preview: createPreviewAdapter(SpacerPreview),
    keywords: ['spacer', 'space', 'gap', '间距', '空间'],
  },

  // 表单组件
  {
    type: 'button',
    name: '按钮',
    description: '可点击的按钮组件，支持多种样式和状态',
    category: 'form',
    icon: '🔘',
    preview: createPreviewAdapter(ButtonPreview),
    keywords: ['button', 'btn', '按钮', '点击'],
  },
  {
    type: 'input',
    name: '输入框',
    description: '文本输入组件，支持验证和多种输入类型',
    category: 'form',
    icon: '📝',
    preview: createPreviewAdapter(InputPreview),
    keywords: ['input', 'text', '输入', '文本框'],
  },
  {
    type: 'textarea',
    name: '文本域',
    description: '多行文本输入组件，支持自动调整高度',
    category: 'form',
    icon: '📄',
    preview: createPreviewAdapter(TextareaPreview),
    keywords: ['textarea', 'text', '文本域', '多行输入'],
  },
  {
    type: 'select',
    name: '选择器',
    description: '下拉选择组件，支持单选和多选',
    category: 'form',
    icon: '📋',
    preview: createPreviewAdapter(SelectPreview),
    keywords: ['select', 'dropdown', '选择器', '下拉'],
  },
  {
    type: 'checkbox',
    name: '复选框',
    description: '多选框组件，支持组合和验证',
    category: 'form',
    icon: '☑️',
    preview: createPreviewAdapter(CheckboxPreview),
    keywords: ['checkbox', '多选', '复选框', '勾选'],
  },
  {
    type: 'radio',
    name: '单选框',
    description: '单选框组件，支持组合和必选验证',
    category: 'form',
    icon: '⚪',
    preview: createPreviewAdapter(RadioPreview),
    keywords: ['radio', '单选', '单选框', '选择'],
  },

  // 导航组件 - 新增分类
  {
    type: 'breadcrumb',
    name: '面包屑',
    description: '面包屑导航组件，显示层级路径',
    category: 'navigation',
    icon: '🧭',
    preview: () => null, // 暂时为空，后续实现
    keywords: ['breadcrumb', 'nav', '面包屑', '导航'],
  },
  {
    type: 'menu',
    name: '菜单',
    description: '菜单组件，支持下拉和展开',
    category: 'navigation',
    icon: '📋',
    preview: () => null, // 暂时为空，后续实现
    keywords: ['menu', 'nav', '菜单', '导航'],
  },
  {
    type: 'pagination',
    name: '分页',
    description: '分页组件，用于数据列表分页',
    category: 'navigation',
    icon: '📄',
    preview: () => null, // 暂时为空，后续实现
    keywords: ['pagination', 'page', '分页', '翻页'],
  },

  // 反馈组件 - 新增分类
  {
    type: 'alert',
    name: '警告提示',
    description: '警告提示组件，支持多种类型和图标',
    category: 'feedback',
    icon: '⚠️',
    preview: () => null, // 暂时为空，后续实现
    keywords: ['alert', 'warning', '警告', '提示'],
  },
  {
    type: 'loading',
    name: '加载中',
    description: '加载状态组件，支持多种加载动画',
    category: 'feedback',
    icon: '⏳',
    preview: () => null, // 暂时为空，后续实现
    keywords: ['loading', 'spinner', '加载', '进度'],
  },
  {
    type: 'message',
    name: '消息提示',
    description: '消息提示组件，支持顶部弹出和全局提示',
    category: 'feedback',
    icon: '💬',
    preview: () => null, // 暂时为空，后续实现
    keywords: ['message', 'toast', '消息', '通知'],
  },

  // 数据组件 - 新增分类
  {
    type: 'table',
    name: '表格',
    description: '数据表格组件，支持排序、筛选和分页',
    category: 'data',
    icon: '📊',
    preview: () => null, // 暂时为空，后续实现
    keywords: ['table', 'grid', '表格', '数据表'],
  },
  {
    type: 'list',
    name: '列表',
    description: '数据列表组件，支持多种布局和交互',
    category: 'data',
    icon: '📋',
    preview: () => null, // 暂时为空，后续实现
    keywords: ['list', 'data', '列表', '数据'],
  },
  {
    type: 'timeline',
    name: '时间轴',
    description: '时间轴组件，显示事件时间线',
    category: 'data',
    icon: '📅',
    preview: () => null, // 暂时为空，后续实现
    keywords: ['timeline', 'time', '时间轴', '时间线'],
  },
] as const

// 拖拽组件项 - 简化版本，只显示图标和名称
const DraggableComponentItem: React.FC<{
  component: {
    type: string
    name: string
    description: string
    category: string
    icon: string
    preview: React.FC<{ onClick?: () => void }>
    keywords: readonly string[]
  }
  onComponentClick?: (type: string) => void
}> = ({ component, onComponentClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `component-${component.type}`,
    data: {
      type: component.type,
      isFromPanel: true,
      componentData: {
        type: component.type,
        name: component.name,
      },
    },
  })

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onComponentClick?.(component.type)
  }

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group cursor-grab active:cursor-grabbing',
        'transition-all duration-200',
        isDragging && 'scale-95 opacity-50'
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onComponentClick?.(component.type)
        }
      }}
      aria-label={`拖拽 ${component.name} 组件到画布`}
    >
      <div
        className={cn(
          'flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card p-2',
          'hover:border-primary/50 hover:bg-accent/50',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'transition-all duration-200'
        )}
      >
        {/* 组件图标 */}
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-border bg-muted/30">
          <span className="text-sm">{component.icon}</span>
        </div>

        {/* 组件名称 */}
        <span className="truncate text-xs font-medium text-gray-900">{component.name}</span>
      </div>
    </div>
  )
}

// 组件分类面板
const CategorySection: React.FC<{
  category: {
    id: string
    name: string
    description: string
    icon: React.ForwardRefExoticComponent<any>
    color: string
  }
  components: readonly {
    type: string
    name: string
    description: string
    category: string
    icon: string
    preview: React.FC<{ onClick?: () => void }>
    keywords: readonly string[]
  }[]
  isExpanded: boolean
  onToggle: () => void
  searchQuery: string
  onComponentClick?: (type: string) => void
}> = ({ category, components, isExpanded, onToggle, searchQuery, onComponentClick }) => {
  const Icon = category.icon
  const filteredComponents = components.filter(comp => {
    if (comp.category !== category.id) return false
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      comp.name.toLowerCase().includes(query) ||
      comp.description.toLowerCase().includes(query) ||
      comp.keywords.some(keyword => keyword.toLowerCase().includes(query))
    )
  })

  if (filteredComponents.length === 0) return null

  return (
    <div className="space-y-2">
      {/* 分类标题 */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-md bg-muted px-3 py-2 text-left transition-colors hover:bg-muted/80"
        aria-expanded={isExpanded}
        aria-controls={`category-${category.id}`}
      >
        <div className="flex items-center gap-2">
          <div className={cn('h-2 w-2 rounded-full', category.color)} />
          <Icon className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">{category.name}</span>
          <Badge variant="secondary" className="text-xs">
            {filteredComponents.length}
          </Badge>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {/* 组件列表 */}
      {isExpanded && (
        <div
          id={`category-${category.id}`}
          className="grid grid-cols-2 gap-2"
          role="list"
          aria-label={`${category.name}组件列表`}
        >
          {filteredComponents.map(component => (
            <DraggableComponentItem
              key={component.type}
              component={component}
              onComponentClick={onComponentClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const ComponentPanel: React.FC<{
  className?: string
  onComponentSelect?: (type: string) => void
}> = ({ className, onComponentSelect }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['container', 'content', 'form']) // 默认展开最常用的分类
  )
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedCategories(new Set(COMPONENT_CATEGORIES.map(cat => cat.id)))
  }

  const collapseAll = () => {
    setExpandedCategories(new Set())
  }

  return (
    <div className={cn('flex h-full flex-col border-r border-gray-200 bg-white', className)}>
      {/* 面板头部 */}
      <div className="flex flex-col space-y-2 border-b border-gray-200 p-4 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">组件库</h2>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={expandAll}
              className="h-8 px-2"
              title="展开所有"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={collapseAll}
              className="h-8 px-2"
              title="收起所有"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="搜索组件..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="搜索组件"
          />
        </div>

        {/* 统计信息 */}
        {searchQuery && (
          <div className="text-xs text-gray-600">
            找到{' '}
            {
              BASIC_COMPONENTS.filter(comp => {
                const query = searchQuery.toLowerCase()
                return (
                  comp.name.toLowerCase().includes(query) ||
                  comp.description.toLowerCase().includes(query) ||
                  comp.keywords.some(keyword => keyword.toLowerCase().includes(query))
                )
              }).length
            }{' '}
            个组件
          </div>
        )}
      </div>

      {/* 组件列表 */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {COMPONENT_CATEGORIES.map(category => (
            <CategorySection
              key={category.id}
              category={category}
              components={BASIC_COMPONENTS}
              isExpanded={expandedCategories.has(category.id)}
              onToggle={() => toggleCategory(category.id)}
              searchQuery={searchQuery}
              onComponentClick={onComponentSelect}
            />
          ))}
        </div>

        {/* 空状态 */}
        {searchQuery &&
          BASIC_COMPONENTS.filter(comp => {
            const query = searchQuery.toLowerCase()
            return (
              comp.name.toLowerCase().includes(query) ||
              comp.description.toLowerCase().includes(query) ||
              comp.keywords.some(keyword => keyword.toLowerCase().includes(query))
            )
          }).length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">未找到组件</h3>
              <p className="mb-4 text-sm text-gray-600">尝试使用不同的关键词搜索</p>
              <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                清除搜索
              </Button>
            </div>
          )}
      </ScrollArea>

      {/* 面板底部 */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>拖拽组件到画布添加</span>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <Plus className="mr-1 h-3 w-3" />
            自定义组件
          </Button>
        </div>
      </div>
    </div>
  )
}
