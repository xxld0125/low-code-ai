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

// 创建适配器组件以匹配期望的类型
const createPreviewAdapter = (PreviewComponent: React.FC<any>) => {
  const AdapterComponent = (props: { onClick?: () => void }) => {
    return <PreviewComponent />
  }
  AdapterComponent.displayName = `PreviewAdapter(${PreviewComponent.displayName || PreviewComponent.name})`
  return AdapterComponent
}

// 组件分类配置
const COMPONENT_CATEGORIES = [
  {
    id: 'form',
    name: '表单组件',
    description: '表单输入和验证组件',
    icon: List,
    color: 'bg-purple-500',
  },
  {
    id: 'display',
    name: '展示组件',
    description: '内容展示和显示组件',
    icon: LayoutGrid,
    color: 'bg-blue-500',
  },
  {
    id: 'layout',
    name: '布局组件',
    description: '页面布局和容器组件',
    icon: Settings,
    color: 'bg-green-500',
  },
  {
    id: 'business',
    name: '业务组件',
    description: '特定业务场景组件',
    icon: Info,
    color: 'bg-orange-500',
  },
] as const

// 基础组件配置
const BASIC_COMPONENTS = [
  // 表单组件
  {
    type: 'button',
    name: '按钮',
    description: '可点击的按钮组件',
    category: 'form',
    icon: '🔘',
    preview: createPreviewAdapter(ButtonPreview),
    keywords: ['button', 'btn', '按钮', '点击'],
  },
  {
    type: 'input',
    name: '输入框',
    description: '文本输入组件',
    category: 'form',
    icon: '📝',
    preview: createPreviewAdapter(InputPreview),
    keywords: ['input', 'text', '输入', '文本框'],
  },
  {
    type: 'textarea',
    name: '文本域',
    description: '多行文本输入组件',
    category: 'form',
    icon: '📄',
    preview: createPreviewAdapter(TextareaPreview),
    keywords: ['textarea', 'text', '文本域', '多行输入'],
  },
  {
    type: 'select',
    name: '选择器',
    description: '下拉选择组件',
    category: 'form',
    icon: '📋',
    preview: createPreviewAdapter(SelectPreview),
    keywords: ['select', 'dropdown', '选择器', '下拉'],
  },
  {
    type: 'checkbox',
    name: '复选框',
    description: '多选框组件',
    category: 'form',
    icon: '☑️',
    preview: createPreviewAdapter(CheckboxPreview),
    keywords: ['checkbox', '多选', '复选框', '勾选'],
  },
  {
    type: 'radio',
    name: '单选框',
    description: '单选框组件',
    category: 'form',
    icon: '⚪',
    preview: createPreviewAdapter(RadioPreview),
    keywords: ['radio', '单选', '单选框', '选择'],
  },
  // 展示组件
  {
    type: 'text',
    name: '文本',
    description: '文本显示组件',
    category: 'display',
    icon: '📝',
    preview: TextPreview,
    keywords: ['text', 'paragraph', '文本', '段落'],
  },
  {
    type: 'heading',
    name: '标题',
    description: '标题显示组件',
    category: 'display',
    icon: '📰',
    preview: HeadingPreview,
    keywords: ['heading', 'title', '标题', '大标题'],
  },
  {
    type: 'image',
    name: '图片',
    description: '图片显示组件',
    category: 'display',
    icon: '🖼️',
    preview: ImagePreview,
    keywords: ['image', 'img', '图片', '图像'],
  },
  {
    type: 'card',
    name: '卡片',
    description: '卡片容器组件',
    category: 'display',
    icon: '🃏',
    preview: CardPreview,
    keywords: ['card', 'container', '卡片', '容器'],
  },
  {
    type: 'badge',
    name: '徽章',
    description: '徽章标识组件',
    category: 'display',
    icon: '🏷️',
    preview: BadgePreview,
    keywords: ['badge', 'label', '徽章', '标签'],
  },
] as const

// 拖拽组件项
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
    // 阻止点击事件冒泡到拖拽处理器
    e.preventDefault()
    e.stopPropagation()
    // 注释掉点击添加组件的功能，只允许拖拽添加
    // onComponentClick?.(component.type)
  }

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  const PreviewComponent = component.preview

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
      onDoubleClick={handleClick} // 双击也不添加组件
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          // 键盘事件也不添加组件，只允许拖拽
          // handleClick()
        }
      }}
      aria-label={`拖拽 ${component.name} 组件到画布`}
    >
      <div
        className={cn(
          'relative rounded border border-gray-200 bg-white p-2',
          'hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'transition-all duration-200'
        )}
      >
        {/* 拖拽指示器 */}
        <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100">
            <LayoutGrid className="h-2 w-2 text-blue-600" />
          </div>
        </div>

        {/* 组件预览 */}
        <div className="mb-2">
          <PreviewComponent />
        </div>

        {/* 组件信息 */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-gray-900">
              {component.icon} {component.name}
            </h3>
          </div>
          <p className="truncate text-xs text-gray-500">{component.description}</p>
        </div>
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
    <div className="space-y-3">
      {/* 分类标题 */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded bg-gray-50 px-2 py-1.5 text-left transition-colors hover:bg-gray-100"
        aria-expanded={isExpanded}
        aria-controls={`category-${category.id}`}
      >
        <div className="flex items-center space-x-2">
          <div className={cn('h-2 w-2 rounded-full', category.color)} />
          <Icon className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">{category.name}</span>
          <Badge variant="secondary" className="text-xs">
            {filteredComponents.length}
          </Badge>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {/* 组件列表 */}
      {isExpanded && (
        <div
          id={`category-${category.id}`}
          className="grid grid-cols-1 gap-2"
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
    new Set(['form', 'display'])
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
      <div className="flex flex-col space-y-3 border-b border-gray-200 p-4">
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
          <div className="text-xs text-gray-500">
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
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
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
              <p className="mb-4 text-sm text-gray-500">尝试使用不同的关键词搜索</p>
              <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                清除搜索
              </Button>
            </div>
          )}
      </ScrollArea>

      {/* 面板底部 */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
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
