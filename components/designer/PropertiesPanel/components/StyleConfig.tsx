/**
 * 样式配置组件
 * 整合颜色、尺寸、间距等样式编辑器，提供完整的样式配置界面
 */

import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Palette,
  Ruler,
  Layout,
  Settings,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Zap,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react'
import { usePropertyStore } from '@/stores/property-store/property-store'
import { useStyleStore } from '@/stores/style-store'
import ColorPropertyEditor from './ColorPropertyEditor'
import SizePropertyEditor from './SizePropertyEditor'
import SpacingPropertyEditor from './SpacingPropertyEditor'
import type { CSSProperties, StylePreset } from '@/types/designer'

// 样式配置分组
interface StyleGroup {
  id: string
  title: string
  icon: React.ReactNode
  properties: StyleProperty[]
  defaultExpanded?: boolean
}

interface StyleProperty {
  id: string
  label: string
  type: 'color' | 'size' | 'spacing' | 'select' | 'switch'
  defaultValue?: string | number | boolean
  options?: Array<{ value: string; label: string }>
  min?: number
  max?: number
  step?: number
  description?: string
  property?: string // 用于特定组件的属性名
}

interface StyleConfigProps {
  componentId: string
  className?: string
  showPresets?: boolean
  showResponsive?: boolean
  showAdvanced?: boolean
  compact?: boolean
}

// 预定义的样式属性配置
const STYLE_GROUPS: StyleGroup[] = [
  {
    id: 'layout',
    title: '布局',
    icon: <Layout className="w-4 h-4" />,
    defaultExpanded: true,
    properties: [
      { id: 'display', label: '显示方式', type: 'select', defaultValue: 'block',
        options: [
          { value: 'block', label: '块级' },
          { value: 'inline', label: '行内' },
          { value: 'inline-block', label: '行内块' },
          { value: 'flex', label: '弹性布局' },
          { value: 'grid', label: '网格布局' },
          { value: 'none', label: '隐藏' }
        ]
      },
      { id: 'width', label: '宽度', type: 'size', defaultValue: 'auto' },
      { id: 'height', label: '高度', type: 'size', defaultValue: 'auto' },
      { id: 'maxWidth', label: '最大宽度', type: 'size' },
      { id: 'maxHeight', label: '最大高度', type: 'size' },
      { id: 'minWidth', label: '最小宽度', type: 'size' },
      { id: 'minHeight', label: '最小高度', type: 'size' },
    ]
  },
  {
    id: 'spacing',
    title: '间距',
    icon: <Ruler className="w-4 h-4" />,
    defaultExpanded: true,
    properties: [
      { id: 'margin', label: '外边距', type: 'spacing', defaultValue: '0' },
      { id: 'marginTop', label: '上边距', type: 'spacing' },
      { id: 'marginRight', label: '右边距', type: 'spacing' },
      { id: 'marginBottom', label: '下边距', type: 'spacing' },
      { id: 'marginLeft', label: '左边距', type: 'spacing' },
      { id: 'padding', label: '内边距', type: 'spacing', defaultValue: '0' },
      { id: 'paddingTop', label: '上内边距', type: 'spacing' },
      { id: 'paddingRight', label: '右内边距', type: 'spacing' },
      { id: 'paddingBottom', label: '下内边距', type: 'spacing' },
      { id: 'paddingLeft', label: '左内边距', type: 'spacing' },
    ]
  },
  {
    id: 'colors',
    title: '颜色',
    icon: <Palette className="w-4 h-4" />,
    defaultExpanded: true,
    properties: [
      { id: 'backgroundColor', label: '背景颜色', type: 'color' },
      { id: 'color', label: '文字颜色', type: 'color', defaultValue: '#000000' },
      { id: 'borderColor', label: '边框颜色', type: 'color' },
    ]
  },
  {
    id: 'borders',
    title: '边框',
    icon: <Settings className="w-4 h-4" />,
    defaultExpanded: false,
    properties: [
      { id: 'borderWidth', label: '边框宽度', type: 'size', defaultValue: '0', min: 0, max: 10 },
      { id: 'borderRadius', label: '圆角', type: 'size', defaultValue: '0', min: 0, max: 50 },
      { id: 'borderStyle', label: '边框样式', type: 'select', defaultValue: 'solid',
        options: [
          { value: 'solid', label: '实线' },
          { value: 'dashed', label: '虚线' },
          { value: 'dotted', label: '点线' },
          { value: 'none', label: '无' }
        ]
      },
    ]
  },
  {
    id: 'position',
    title: '定位',
    icon: <Layout className="w-4 h-4" />,
    defaultExpanded: false,
    properties: [
      { id: 'position', label: '定位方式', type: 'select', defaultValue: 'static',
        options: [
          { value: 'static', label: '静态' },
          { value: 'relative', label: '相对' },
          { value: 'absolute', label: '绝对' },
          { value: 'fixed', label: '固定' },
          { value: 'sticky', label: '粘性' }
        ]
      },
      { id: 'zIndex', label: '层级', type: 'size', min: 0, max: 9999 },
      { id: 'top', label: '顶部位置', type: 'size' },
      { id: 'right', label: '右侧位置', type: 'size' },
      { id: 'bottom', label: '底部位置', type: 'size' },
      { id: 'left', label: '左侧位置', type: 'size' },
    ]
  },
]

// 响应式断点
const RESPONSIVE_BREAKPOINTS = [
  { name: 'base', label: '默认', icon: <Monitor className="w-3 h-3" /> },
  { name: 'sm', label: '小屏', icon: <Smartphone className="w-3 h-3" /> },
  { name: 'md', label: '中屏', icon: <Tablet className="w-3 h-3" /> },
  { name: 'lg', label: '大屏', icon: <Monitor className="w-3 h-3" /> },
  { name: 'xl', label: '超大', icon: <Monitor className="w-3 h-3" /> },
]

export function StyleConfig({
  componentId,
  className,
  showPresets = true,
  showResponsive = true,
  showAdvanced = true,
  compact = false,
}: StyleConfigProps) {
  const [activeTab, setActiveTab] = useState('properties')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(STYLE_GROUPS.filter(g => g.defaultExpanded).map(g => g.id))
  )
  const [currentBreakpoint, setCurrentBreakpoint] = useState('base')
  const [showPreview, setShowPreview] = useState(true)

  const {
    previewProperties,
    dirtyProperties,
    updateProperty,
    updateProperties,
    saveProperties,
    resetProperties,
    validationErrors,
    stylePresets,
    appliedPreset,
    loadStylePresets,
    applyStylePreset,
    setPreviewMode,
    loading,
    saving,
    error,
  } = usePropertyStore()

  const {
    currentStyles,
    previewStyles,
    responsiveStyles,
    styleValidationErrors,
    validateAllStyles,
    getBreakpointStyles,
    setCurrentBreakpoint: setStyleBreakpoint,
  } = useStyleStore()

  // 加载样式预设
  useEffect(() => {
    if (showPresets) {
      loadStylePresets()
    }
  }, [showPresets, loadStylePresets])

  // 同步断点
  useEffect(() => {
    setStyleBreakpoint(currentBreakpoint)
  }, [currentBreakpoint, setStyleBreakpoint])

  // 获取当前断点的样式值
  const getCurrentBreakpointStyles = useCallback(() => {
    if (currentBreakpoint === 'base') {
      return previewStyles
    }
    return getBreakpointStyles(currentBreakpoint)
  }, [currentBreakpoint, previewStyles, getBreakpointStyles])

  // 处理样式属性更新
  const handleStyleUpdate = useCallback((propertyId: string, value: unknown) => {
    updateProperty(propertyId, value)
  }, [updateProperty])

  // 处理批量样式更新
  const handleBatchStyleUpdate = useCallback((updates: Record<string, unknown>) => {
    updateProperties(updates)
  }, [updateProperties])

  // 应用样式预设
  const handleApplyPreset = useCallback((presetId: string) => {
    applyStylePreset(presetId)
  }, [applyStylePreset])

  // 切换分组展开状态
  const toggleGroupExpanded = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }, [])

  // 获取属性值
  const getPropertyValue = useCallback((propertyId: string) => {
    const currentStyles = getCurrentBreakpointStyles()
    return currentStyles[propertyId] || ''
  }, [getCurrentBreakpointStyles])

  // 获取验证错误
  const getValidationError = useCallback((propertyId: string) => {
    return validationErrors[propertyId] || styleValidationErrors[propertyId]
  }, [validationErrors, styleValidationErrors])

  // 渲染属性编辑器
  const renderPropertyEditor = useCallback((property: StyleProperty) => {
    const value = getPropertyValue(property.id)
    const error = getValidationError(property.id)
    const isDirty = dirtyProperties.has(property.id)

    const commonProps = {
      key: property.id,
      label: property.label,
      value,
      error,
      description: property.description,
      disabled: loading || saving,
      onChange: (newValue: unknown) => handleStyleUpdate(property.id, newValue),
      className: cn('transition-all duration-200', isDirty && 'border-l-2 border-l-primary'),
    }

    switch (property.type) {
      case 'color':
        return (
          <ColorPropertyEditor
            {...commonProps}
            showPresets={!compact}
          />
        )

      case 'size':
        return (
          <SizePropertyEditor
            {...commonProps}
            property={property.property}
            showPresets={!compact}
            showSlider={!compact}
            min={property.min}
            max={property.max}
            step={property.step}
          />
        )

      case 'spacing':
        return (
          <SpacingPropertyEditor
            {...commonProps}
            type="margin"
            showVisualEditor={!compact}
            showLinkedControl={true}
          />
        )

      case 'select':
        return (
          <div key={property.id} className="space-y-2">
            <label className="text-sm font-medium">{property.label}</label>
            <select
              value={String(value || property.defaultValue)}
              onChange={(e) => handleStyleUpdate(property.id, e.target.value)}
              className="w-full p-2 border rounded-md"
              disabled={loading || saving}
            >
              {property.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && (
              <div className="text-xs text-destructive">{error}</div>
            )}
          </div>
        )

      case 'switch':
        return (
          <div key={property.id} className="flex items-center justify-between">
            <label className="text-sm font-medium">{property.label}</label>
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleStyleUpdate(property.id, e.target.checked)}
              disabled={loading || saving}
              className="w-4 h-4"
            />
          </div>
        )

      default:
        return null
    }
  }, [
    getPropertyValue,
    getValidationError,
    dirtyProperties,
    loading,
    saving,
    handleStyleUpdate,
    compact
  ])

  const hasChanges = dirtyProperties.size > 0
  const hasValidationErrors = Object.keys(validationErrors).length > 0 || Object.keys(styleValidationErrors).length > 0

  return (
    <div className={cn('space-y-4', className)}>
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">样式配置</h3>
          {hasChanges && (
            <Badge variant="secondary" className="text-xs">
              {dirtyProperties.size} 个更改
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          {showResponsive && (
            <div className="flex items-center border rounded-md">
              {RESPONSIVE_BREAKPOINTS.map((breakpoint) => (
                <Button
                  key={breakpoint.name}
                  variant={currentBreakpoint === breakpoint.name ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentBreakpoint(breakpoint.name)}
                  className="h-8 px-2"
                  title={breakpoint.label}
                >
                  {breakpoint.icon}
                  <span className="hidden sm:inline ml-1 text-xs">
                    {breakpoint.label}
                  </span>
                </Button>
              ))}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="h-8 w-8 p-0"
          >
            {showPreview ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </Button>

          {hasChanges && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetProperties}
                disabled={loading || saving}
                className="h-8 w-8 p-0"
                title="重置更改"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={saveProperties}
                disabled={loading || saving || hasValidationErrors}
                className="h-8"
              >
                {saving ? '保存中...' : '保存'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hasValidationErrors && (
        <Alert variant="destructive">
          <AlertDescription>
            存在 {Object.keys(validationErrors).length + Object.keys(styleValidationErrors).length} 个验证错误，请检查后再保存
          </AlertDescription>
        </Alert>
      )}

      {/* 主内容区域 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={cn(
          "grid w-full",
          showPresets ? "grid-cols-3" : "grid-cols-2"
        )}>
          <TabsTrigger value="properties" className="text-xs">
            <Settings className="w-3 h-3 mr-1" />
            属性
          </TabsTrigger>
          <TabsTrigger value="responsive" className="text-xs">
            <Monitor className="w-3 h-3 mr-1" />
            响应式
          </TabsTrigger>
          {showPresets && (
            <TabsTrigger value="presets" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              预设
            </TabsTrigger>
          )}
        </TabsList>

        {/* 属性编辑标签页 */}
        <TabsContent value="properties" className="space-y-4 mt-4">
          {compact ? (
            // 紧凑模式：简单的分组
            <Accordion type="single" collapsible className="w-full">
              {STYLE_GROUPS.map((group) => (
                <AccordionItem key={group.id} value={group.id}>
                  <AccordionTrigger className="text-sm">
                    <div className="flex items-center gap-2">
                      {group.icon}
                      {group.title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-4">
                    {group.properties.map(renderPropertyEditor)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            // 完整模式：可折叠的卡片
            <>
              {STYLE_GROUPS.map((group) => (
              <Collapsible
                key={group.id}
                open={expandedGroups.has(group.id)}
                onOpenChange={() => toggleGroupExpanded(group.id)}
              >
                <CollapsibleTrigger asChild>
                  <Card className="cursor-pointer">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {group.icon}
                        {group.title}
                        <div className="ml-auto">
                          {expandedGroups.has(group.id) ? '▼' : '▶'}
                        </div>
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-3">
                    {group.properties.map(renderPropertyEditor)}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            ))}
            </>
          )}
        </TabsContent>

        {/* 响应式配置标签页 */}
        <TabsContent value="responsive" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                响应式样式配置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                当前编辑：<Badge variant="outline">{currentBreakpoint}</Badge>
              </div>

              <div className="grid gap-4">
                {/* 这里可以添加响应式特定的编辑器 */}
                <div className="text-center text-muted-foreground py-8">
                  响应式样式编辑器正在开发中...
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 样式预设标签页 */}
        {showPresets && (
          <TabsContent value="presets" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  样式预设
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {appliedPreset && (
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">当前预设：</span>
                    <Badge>{appliedPreset}</Badge>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {stylePresets.map((preset) => (
                    <Button
                      key={preset.id}
                      variant={appliedPreset === preset.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleApplyPreset(preset.id)}
                      className="h-auto p-3 flex flex-col items-start"
                    >
                      <div className="font-medium text-sm">{preset.name}</div>
                      {preset.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {preset.description}
                        </div>
                      )}
                    </Button>
                  ))}
                </div>

                {stylePresets.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    暂无可用预设
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export default StyleConfig