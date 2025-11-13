'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Settings, Palette, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePropertyEditor } from '@/hooks/usePropertyEditor'
import { EventHandler } from './components/EventHandler'

interface ComponentPropertiesPanelProps {
  selectedComponentId: string | null
  className?: string
}

/**
 * 组件属性配置面板主组件
 * 用于低代码设计器中配置选中组件的属性
 */
export function ComponentPropertiesPanel({
  selectedComponentId,
  className
}: ComponentPropertiesPanelProps) {
  // 使用属性编辑器Hook
  const propertyEditor = usePropertyEditor(selectedComponentId, {
    autoSave: true, // 启用自动保存，集成到设计器统一保存机制
    autoSaveDelay: 1000, // 1秒后自动保存
    autoValidate: true,
    validateOnChange: true,
    showValidationErrors: true,
    enablePreview: true,
    previewDelay: 100,
  })

  // 本地状态
  const [activeTab] = useState<'properties' | 'styles' | 'events'>('properties')

  // 获取组件属性定义
  const componentProperties = useMemo(() => {
    if (!propertyEditor.selectedComponent) return []

    const componentType = propertyEditor.selectedComponent.type
    console.log('Property panel - Component type:', componentType, 'Component:', propertyEditor.selectedComponent)

    switch (componentType) {
      case 'Button':
        return getButtonProperties()
      case 'Input':
        return getInputProperties()
      case 'Text':
        return getTextProperties()
      case 'Container':
        return getContainerProperties()
      default:
        console.log('Using base properties for type:', componentType)
        return getBaseProperties()
    }
  }, [propertyEditor.selectedComponent])

  // 渲染空状态
  const renderEmptyState = () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">未选择组件</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          请先选择一个组件以编辑其属性
        </p>
      </div>
    </div>
  )

  // 渲染组件头部
  const renderComponentHeader = () => {
    if (!propertyEditor.selectedComponent) return null

    return (
      <Card className="border-b border-border bg-white dark:bg-gray-800">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{propertyEditor.selectedComponent.name}</span>
              <Badge variant="secondary" className="text-xs h-5">
                {propertyEditor.selectedComponent.type}
              </Badge>
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            ID: {propertyEditor.selectedComponent.id}
          </div>
        </CardContent>
      </Card>
    )
  }

  // 渲染属性编辑器
  const renderPropertyEditor = (property: any) => {
    const value = propertyEditor.previewProperties[property.key] || property.defaultValue

    switch (property.type) {
      case 'text':
        return (
          <div className="relative">
            <Input
              value={value}
              onChange={(e) => propertyEditor.updateProperty(property.key, e.target.value)}
              placeholder={property.placeholder}
              maxLength={property.maxLength}
              className="h-8 text-sm pr-12"
            />
            {property.showCharCount && (
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                {String(value).length}/{property.maxLength}
              </span>
            )}
          </div>
        )

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => propertyEditor.updateProperty(property.key, e.target.value)}
            placeholder={property.placeholder}
            maxLength={property.maxLength}
            className="w-full min-h-20 px-3 py-2 text-sm border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(newValue) => propertyEditor.updateProperty(property.key, newValue)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder={property.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {property.options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={property.key}
              checked={value}
              onCheckedChange={(checked) => propertyEditor.updateProperty(property.key, checked)}
            />
            <Label htmlFor={property.key} className="text-sm text-gray-900 dark:text-gray-100">
              {property.trueLabel || '启用'}
            </Label>
          </div>
        )

      case 'radio':
        return (
          <RadioGroup
            value={String(value)}
            onValueChange={(newValue) => {
              // 转换为合适的类型
              const convertedValue = property.options?.find((opt: any) => opt.value === newValue)?.value || newValue
              propertyEditor.updateProperty(property.key, convertedValue)
            }}
            className="flex flex-col space-y-2"
          >
            {property.options?.map((option: any) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={String(option.value)} id={`${property.key}-${option.value}`} />
                <Label htmlFor={`${property.key}-${option.value}`} className="text-sm text-gray-900 dark:text-gray-100">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => propertyEditor.updateProperty(property.key, Number(e.target.value))}
            min={property.min}
            max={property.max}
            className="h-8 text-sm"
          />
        )

      default:
        return (
          <Input
            value={value}
            onChange={(e) => propertyEditor.updateProperty(property.key, e.target.value)}
            className="h-8 text-sm"
          />
        )
    }
  }

  return (
    <div className={cn('flex h-full flex-col bg-white dark:bg-gray-800', className)}>
      {/* 无组件选择状态 */}
      {!propertyEditor.selectedComponent ? (
        renderEmptyState()
      ) : (
        <>
          {/* 紧凑的组件头部 */}
          {renderComponentHeader()}

          {/* 现代化的标签页 */}
          <Tabs value={activeTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-3 h-8 mx-2 mt-2 bg-white dark:bg-gray-800">
              <TabsTrigger value="properties" className="text-xs text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900">
                <Settings className="w-3 h-3 mr-1" />
                属性
              </TabsTrigger>
              <TabsTrigger value="styles" className="text-xs text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900">
                <Palette className="w-3 h-3 mr-1" />
                样式
              </TabsTrigger>
              <TabsTrigger value="events" className="text-xs text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900">
                <Zap className="w-3 h-3 mr-1" />
                事件
              </TabsTrigger>
            </TabsList>

            {/* 属性编辑内容 */}
            <TabsContent value="properties" className="flex-1 p-4 space-y-4 mt-0 bg-white dark:bg-gray-800">
              <div className="space-y-4">
                {componentProperties.map((property) => (
                  <div key={property.key} className="space-y-2">
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">{property.label}</Label>
                    {renderPropertyEditor(property)}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="styles" className="flex-1 p-4 bg-white dark:bg-gray-800">
              <div className="text-center text-gray-600 dark:text-gray-400">
                <Palette className="mx-auto h-8 w-8 mb-2" />
                <p className="text-sm text-gray-900 dark:text-gray-100">样式配置功能即将推出</p>
              </div>
            </TabsContent>

            <TabsContent value="events" className="flex-1 p-4 bg-white dark:bg-gray-800">
              <EventHandler
                componentId={propertyEditor.selectedComponent.id}
                componentType={propertyEditor.selectedComponent.type}
                componentEvents={propertyEditor.selectedComponent.eventHandlers || {}}
                disabled={propertyEditor.saving}
                onEventChange={(events) => {
                  console.log('Events updated:', events)
                }}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

// Button组件属性定义 (简化版)
function getButtonProperties() {
  return [
    {
      key: 'text',
      label: '按钮文本',
      type: 'text',
      placeholder: '请输入按钮文本',
      maxLength: 50,
      showCharCount: true
    },
    {
      key: 'variant',
      label: '按钮样式',
      type: 'select',
      defaultValue: 'primary',
      options: [
        { label: '主要按钮', value: 'primary' },
        { label: '次要按钮', value: 'secondary' },
        { label: '轮廓按钮', value: 'outline' },
        { label: '幽灵按钮', value: 'ghost' }
      ]
    },
    {
      key: 'disabled',
      label: '启用状态',
      type: 'radio',
      defaultValue: false,
      options: [
        { label: '启用', value: false },
        { label: '禁用', value: true }
      ]
    },
    {
      key: 'loading',
      label: '加载状态',
      type: 'radio',
      defaultValue: false,
      options: [
        { label: '正常', value: false },
        { label: '加载中', value: true }
      ]
    }
  ]
}

// Input组件属性定义 (简化版)
function getInputProperties() {
  return [
    {
      key: 'placeholder',
      label: '占位符文本',
      type: 'text',
      placeholder: '请输入占位符文本',
      maxLength: 100
    },
    {
      key: 'required',
      label: '必填字段',
      type: 'radio',
      defaultValue: false,
      options: [
        { label: '选填', value: false },
        { label: '必填', value: true }
      ]
    },
    {
      key: 'disabled',
      label: '启用状态',
      type: 'radio',
      defaultValue: false,
      options: [
        { label: '启用', value: false },
        { label: '禁用', value: true }
      ]
    },
    {
      key: 'maxLength',
      label: '最大长度',
      type: 'number',
      defaultValue: 100,
      min: 1,
      max: 1000
    }
  ]
}

// Text组件属性定义 (简化版)
function getTextProperties() {
  return [
    {
      key: 'content',
      label: '文本内容',
      type: 'textarea',
      placeholder: '请输入文本内容',
      maxLength: 500,
      showCharCount: true
    },
    {
      key: 'fontSize',
      label: '字体大小',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: '小', value: 'small' },
        { label: '中', value: 'medium' },
        { label: '大', value: 'large' },
        { label: '特大', value: 'xLarge' }
      ]
    }
  ]
}

// Container组件属性定义 (简化版)
function getContainerProperties() {
  return [
    {
      key: 'padding',
      label: '内边距',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: '无', value: 'none' },
        { label: '小', value: 'small' },
        { label: '中', value: 'medium' },
        { label: '大', value: 'large' }
      ]
    },
    {
      key: 'border',
      label: '边框',
      type: 'radio',
      defaultValue: false,
      options: [
        { label: '隐藏', value: false },
        { label: '显示', value: true }
      ]
    }
  ]
}

// 基础属性定义 (简化版)
function getBaseProperties() {
  return [
    {
      key: 'id',
      label: '组件ID',
      type: 'text',
      disabled: true
    }
  ]
}

export default ComponentPropertiesPanel