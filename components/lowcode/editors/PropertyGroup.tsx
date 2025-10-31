/**
 * 属性分组组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React, { useState } from 'react'
import { FieldDefinition } from '@/lib/lowcode/types/editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight, Settings, Zap, Layout, Palette } from 'lucide-react'

interface PropertyGroupProps {
  title: string
  properties: FieldDefinition[]
  values?: Record<string, unknown>
  onChange?: (propertyId: string, value: unknown) => void
  readonly?: boolean
  disabled?: boolean
  defaultOpen?: boolean
  collapsible?: boolean
  showIcon?: boolean
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  children?: React.ReactNode
  className?: string
}

// 预定义的组图标
const GROUP_ICONS = {
  基础属性: Settings,
  高级属性: Zap,
  样式属性: Palette,
  布局属性: Layout,
  基础: Settings,
  高级: Zap,
  样式: Palette,
  布局: Layout,
}

// 获取组图标
function getGroupIcon(title: string) {
  return GROUP_ICONS[title as keyof typeof GROUP_ICONS] || Settings
}

// 获取组徽章颜色
function getGroupBadgeVariant(title: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (title.includes('高级') || title.includes('Advanced')) return 'secondary'
  if (title.includes('基础') || title.includes('Basic')) return 'default'
  if (title.includes('样式') || title.includes('Style')) return 'outline'
  return 'default'
}

export const PropertyGroup: React.FC<PropertyGroupProps> = ({
  title,
  properties,
  values,
  onChange,
  readonly = false,
  disabled = false,
  defaultOpen = true,
  collapsible = true,
  showIcon = true,
  badge,
  badgeVariant,
  children,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const Icon = getGroupIcon(title)
  const autoBadgeVariant = badgeVariant || getGroupBadgeVariant(title)

  // 检查是否有必填属性
  const hasRequiredProperties = properties.some(prop => prop.required)

  // 检查是否有错误（这个需要从外部传入状态）
  const hasErrors = false // 这里可以从props传入errors状态

  // 简化的折叠模式实现
  return (
    <Card className={cn('property-group', className)}>
      <CardHeader
        className={cn(
          'cursor-pointer pb-3 transition-colors',
          collapsible && 'hover:bg-muted/50',
          'select-none'
        )}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            {showIcon && <Icon className="h-4 w-4 text-muted-foreground" />}
            {title}
            {hasRequiredProperties && (
              <Badge variant="destructive" className="px-1 py-0 text-xs">
                *
              </Badge>
            )}
            {badge && (
              <Badge variant={autoBadgeVariant} className="text-xs">
                {badge}
              </Badge>
            )}
            {hasErrors && (
              <Badge variant="destructive" className="text-xs">
                错误
              </Badge>
            )}
          </CardTitle>
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={e => {
                e.stopPropagation()
                setIsOpen(!isOpen)
              }}
            >
              {isOpen ? (
                <ChevronDown className="h-3 w-3 transition-transform" />
              ) : (
                <ChevronRight className="h-3 w-3 transition-transform" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {(!collapsible || isOpen) && <CardContent className="space-y-4">{children}</CardContent>}
    </Card>
  )
}

// 属性分组布局组件
interface PropertyGroupLayoutProps {
  groups: Array<{
    title: string
    properties: FieldDefinition[]
    defaultOpen?: boolean
    collapsible?: boolean
    showIcon?: boolean
    badge?: string
    children: React.ReactNode
  }>
  defaultExpanded?: boolean
  showGroupCount?: boolean
  layout?: 'vertical' | 'tabs'
  className?: string
}

export const PropertyGroupLayout: React.FC<PropertyGroupLayoutProps> = ({
  groups,
  defaultExpanded = true,
  showGroupCount = true,
  layout = 'vertical',
  className,
}) => {
  if (layout === 'tabs') {
    // 标签页布局
    return (
      <div className={cn('property-group-layout-tabs', className)}>
        <Tabs defaultValue={groups[0]?.title} className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            {groups.map((group, index) => (
              <TabsTrigger key={group.title} value={group.title} className="text-xs">
                {group.showIcon && getGroupIcon(group.title) && (
                  <span className="mr-2">
                    {React.createElement(getGroupIcon(group.title), { className: 'h-3 w-3' })}
                  </span>
                )}
                {group.title}
                {showGroupCount && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {group.properties.length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {groups.map(group => (
            <TabsContent key={group.title} value={group.title} className="space-y-4">
              <PropertyGroup
                title={group.title}
                properties={group.properties}
                defaultOpen={true}
                collapsible={false}
                showIcon={false}
              >
                {group.children}
              </PropertyGroup>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    )
  }

  // 垂直布局（默认）
  return (
    <div className={cn('property-group-layout-vertical space-y-4', className)}>
      {groups.map(group => (
        <PropertyGroup
          key={group.title}
          title={group.title}
          properties={group.properties}
          defaultOpen={defaultExpanded ? group.defaultOpen : false}
          collapsible={group.collapsible}
          showIcon={group.showIcon}
          badge={group.badge}
        >
          {group.children}
        </PropertyGroup>
      ))}
    </div>
  )
}

// 预定义的属性分组配置
export const COMMON_PROPERTY_GROUPS = {
  basic: {
    title: '基础属性',
    defaultOpen: true,
    showIcon: true,
  },
  style: {
    title: '样式属性',
    defaultOpen: true,
    showIcon: true,
  },
  layout: {
    title: '布局属性',
    defaultOpen: false,
    showIcon: true,
  },
  advanced: {
    title: '高级属性',
    defaultOpen: false,
    showIcon: true,
    badge: '高级',
  },
} as const

// 按属性类型分组
export function groupPropertiesByType(
  properties: FieldDefinition[]
): Array<{ title: string; properties: FieldDefinition[] }> {
  const groups: Record<string, FieldDefinition[]> = {}

  properties.forEach(property => {
    let group = '其他属性'

    // 根据属性类型或名称推断分组
    if (property.type === 'text' || property.type === 'number' || property.type === 'switch') {
      group = '基础属性'
    } else if (
      property.type === 'color' ||
      property.type === 'spacing' ||
      property.type === 'border' ||
      property.type === 'shadow'
    ) {
      group = '样式属性'
    } else if (
      property.name.includes('layout') ||
      property.name.includes('position') ||
      property.name.includes('display')
    ) {
      group = '布局属性'
    } else if (property.name.includes('advanced')) {
      group = '高级属性'
    }

    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(property)
  })

  // 转换为数组并排序
  return Object.entries(groups)
    .map(([title, properties]) => ({ title, properties }))
    .sort((a, b) => {
      const groupOrder = ['基础属性', '样式属性', '布局属性', '高级属性', '其他属性']
      const aIndex = groupOrder.indexOf(a.title)
      const bIndex = groupOrder.indexOf(b.title)

      if (aIndex === -1 && bIndex === -1) return a.title.localeCompare(b.title)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
}
