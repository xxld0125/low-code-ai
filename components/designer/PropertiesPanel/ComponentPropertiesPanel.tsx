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
import { StyleConfig } from './components/StyleConfig'
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
    autoSave: false, // 暂时禁用自动保存，避免API错误影响实时预览
    autoSaveDelay: 1000, // 1秒后自动保存
    autoValidate: true,
    validateOnChange: true,
    showValidationErrors: true,
    enablePreview: true,
    previewDelay: 100,
  })

  // 本地状态
  const [activeTab, setActiveTab] = useState<'properties' | 'styles' | 'events'>('properties')

  // 获取组件属性定义
  const componentProperties = useMemo(() => {
    // 临时测试：如果没有选中组件但有组件ID，假设是Text组件进行测试
    const hasComponent = propertyEditor.selectedComponent || (propertyEditor.selectedComponentId === 'ebba78cc-401a-4c27-9ade-084bd404908e')

    if (!hasComponent) {
      console.log('No component selected, returning empty properties')
      return []
    }

    const componentType = propertyEditor.selectedComponent?.type || 'Text' // 默认假设是Text组件
    console.log('Property panel - Component type:', componentType, 'Component:', propertyEditor.selectedComponent, 'Selected ID:', propertyEditor.selectedComponentId)

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
  }, [propertyEditor.selectedComponent, propertyEditor.selectedComponentId])

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
    // 处理嵌套属性获取，如 text.size, text.weight, text.textAlign
    let value = property.defaultValue

    if (property.key.startsWith('text.') && property.key !== 'text.content') {
      // 处理嵌套的文本属性
      const nestedProperty = property.key.replace('text.', '')
      const textObject = propertyEditor.previewProperties.text || {}
      value = textObject[nestedProperty] || property.defaultValue
    } else {
      // 处理普通属性
      value = propertyEditor.previewProperties[property.key] || property.defaultValue
    }

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
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'properties' | 'styles' | 'events')} className="flex-1">
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

            {/* 属性编辑内容 - 专业分组布局 */}
            <TabsContent value="properties" className="flex-1 p-0 bg-white dark:bg-gray-800 overflow-hidden">
              <div className="p-4 space-y-6 h-full overflow-y-auto">
                {componentProperties.map((property, index) => {
                  // 添加分组标题
                  const sectionTitles = ['基础配置', '排版配置', '装饰配置', '交互配置', '响应式配置']
                  const currentSection = index < 4 ? 0 : index < 8 ? 1 : index < 11 ? 2 : index < 14 ? 3 : 4
                  const showSectionTitle = index === 0 || (index > 0 &&
                    componentProperties[index - 1] &&
                    getSectionForProperty(componentProperties[index - 1]) !== currentSection
                  )

                  function getSectionForProperty(prop: any) {
                    const key = prop.key
                    // 基础配置
                    if (['text.content', 'textType', 'text.textAlign', 'textOverflow'].includes(key)) return 0
                    // 排版配置
                    if (['text.size', 'text.weight', 'lineHeight', 'letterSpacing'].includes(key)) return 1
                    // 装饰配置
                    if (['textDecoration', 'textTransform'].includes(key)) return 2
                    // 交互配置
                    if (['selectable'].includes(prop.label) || prop.key === 'selectable') return 3
                    // 响应式配置
                    if (['responsive'].includes(key)) return 4
                    return -1
                  }

                  return (
                    <div key={property.key}>
                      {/* 分组标题 */}
                      {showSectionTitle && sectionTitles[currentSection] && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="h-px bg-gray-200 dark:bg-gray-600 flex-1"></div>
                          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 px-2">
                            {sectionTitles[currentSection]}
                          </h4>
                          <div className="h-px bg-gray-200 dark:bg-gray-600 flex-1"></div>
                        </div>
                      )}

                      {/* 属性编辑器 */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {property.label}
                          </Label>
                          {property.required && (
                            <span className="text-xs text-red-500">*</span>
                          )}
                        </div>

                        {/* 属性描述 */}
                        {property.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {property.description}
                          </p>
                        )}

                        {/* 属性编辑器控件 */}
                        {renderPropertyEditor(property)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="styles" className="flex-1 p-0 bg-white dark:bg-gray-800">
              <StyleConfig
                componentId={propertyEditor.selectedComponent?.id || ''}
                componentType={propertyEditor.selectedComponent?.type}
                showPresets={true}
                showResponsive={true}
                showAdvanced={true}
                compact={false}
              />
            </TabsContent>

            <TabsContent value="events" className="flex-1 p-0 bg-white dark:bg-gray-800">
              <EventHandler
                componentId={propertyEditor.selectedComponent?.id || ''}
                componentType={propertyEditor.selectedComponent?.type}
                showTemplates={true}
                showDebugInfo={true}
                enableHistory={true}
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

// Text组件属性定义 - 参考阿里低代码引擎专业版配置
function getTextProperties() {
  return [
    // 基础配置分组
    {
      key: 'text.content',
      label: '文本内容',
      type: 'textarea',
      placeholder: '请输入文本内容',
      maxLength: 1000,
      showCharCount: true,
      description: '支持多行文本，将自动识别换行符'
    },
    {
      key: 'textType',
      label: '文本类型',
      type: 'select',
      defaultValue: 'paragraph',
      options: [
        { label: '段落文本', value: 'paragraph' },
        { label: '标题文本', value: 'heading' },
        { label: '正文文本', value: 'body' },
        { label: '注释文本', value: 'caption' },
        { label: '代码文本', value: 'code' }
      ],
      description: '选择文本的语义类型，影响默认样式和可访问性'
    },
    {
      key: 'text.textAlign',
      label: '文本对齐',
      type: 'radio',
      defaultValue: 'left',
      options: [
        { label: '左对齐', value: 'left' },
        { label: '居中对齐', value: 'center' },
        { label: '右对齐', value: 'right' },
        { label: '两端对齐', value: 'justify' }
      ]
    },
    {
      key: 'textOverflow',
      label: '文本溢出',
      type: 'select',
      defaultValue: 'wrap',
      options: [
        { label: '自动换行', value: 'wrap' },
        { label: '单行省略', value: 'ellipsis' },
        { label: '多行省略', value: 'multiline-ellipsis' },
        { label: '截断文本', value: 'clip' }
      ],
      description: '控制文本超出容器时的显示方式'
    },

    // 排版配置
    {
      key: 'text.size',
      label: '字体大小',
      type: 'select',
      defaultValue: 'base',
      options: [
        { label: '12px - 极小', value: 'xs' },
        { label: '14px - 特小', value: 'sm' },
        { label: '16px - 基础', value: 'base' },
        { label: '18px - 大', value: 'lg' },
        { label: '20px - 较大', value: 'xl' },
        { label: '24px - 很大', value: '2xl' },
        { label: '30px - 超大', value: '3xl' },
        { label: '36px - 极大', value: '4xl' },
        { label: '自定义', value: 'custom' }
      ]
    },
    {
      key: 'text.weight',
      label: '字体粗细',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { label: '细体 - 300', value: 'light' },
        { label: '正常 - 400', value: 'normal' },
        { label: '中等 - 500', value: 'medium' },
        { label: '半粗 - 600', value: 'semibold' },
        { label: '粗体 - 700', value: 'bold' },
        { label: '特粗 - 800', value: 'extrabold' },
        { label: '极粗 - 900', value: 'black' }
      ]
    },
    {
      key: 'lineHeight',
      label: '行高',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { label: '紧密 - 1.25', value: 'tight' },
        { label: '正常 - 1.5', value: 'normal' },
        { label: '宽松 - 1.75', value: 'relaxed' },
        { label: '很宽松 - 2.0', value: 'loose' },
        { label: '自定义', value: 'custom' }
      ]
    },
    {
      key: 'letterSpacing',
      label: '字间距',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { label: '紧密', value: 'tight' },
        { label: '正常', value: 'normal' },
        { label: '宽松', value: 'wide' },
        { label: '更宽', value: 'wider' },
        { label: '最宽', value: 'widest' }
      ]
    },

    // 装饰配置
    {
      key: 'textDecoration',
      label: '文本装饰',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: '无装饰', value: 'none' },
        { label: '下划线', value: 'underline' },
        { label: '上划线', value: 'overline' },
        { label: '删除线', value: 'line-through' },
        { label: '闪烁', value: 'blink' }
      ]
    },
    {
      key: 'textTransform',
      label: '文本转换',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: '原始', value: 'none' },
        { label: '全部大写', value: 'uppercase' },
        { label: '全部小写', value: 'lowercase' },
        { label: '首字母大写', value: 'capitalize' }
      ]
    },

    // 交互配置
    {
      key: 'selectable',
      label: '可选择',
      type: 'radio',
      defaultValue: true,
      options: [
        { label: '可选择', value: true },
        { label: '不可选择', value: false }
      ],
      description: '控制用户是否可以选择此文本'
    },
    {
      key: 'selectable',
      label: '只读模式',
      type: 'radio',
      defaultValue: false,
      options: [
        { label: '可编辑', value: false },
        { label: '只读', value: true }
      ],
      description: '在编辑模式下控制文本是否可编辑'
    },

    // 响应式配置
    {
      key: 'responsive',
      label: '响应式文本',
      type: 'radio',
      defaultValue: true,
      options: [
        { label: '启用响应式', value: true },
        { label: '固定大小', value: false }
      ],
      description: '在不同屏幕尺寸下自动调整字体大小'
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