'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Settings,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePropertyEditor } from '@/hooks/usePropertyEditor'
import { PropertyForm, PropertyDefinition } from './components/PropertyForm'
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
    autoSave: false, // 使用显式保存模式
    autoValidate: true,
    validateOnChange: true,
    showValidationErrors: true,
    enablePreview: true,
    previewDelay: 100,
  })

  // 本地状态
  const [activeTab, setActiveTab] = useState<'properties' | 'styles' | 'events'>('properties')
  const [previewMode, setPreviewMode] = useState(true)

  // 组件属性定义映射
  const componentPropertyDefinitions = useMemo(() => {
    if (!propertyEditor.selectedComponent) return []

    const componentType = propertyEditor.selectedComponent.type

    // 根据组件类型返回相应的属性定义
    switch (componentType) {
      case 'Button':
        return getButtonPropertyDefinitions()
      case 'Input':
        return getInputPropertyDefinitions()
      case 'Text':
        return getTextPropertyDefinitions()
      case 'Container':
        return getContainerPropertyDefinitions()
      default:
        return getBasePropertyDefinitions()
    }
  }, [propertyEditor.selectedComponent])

  // 保存属性
  const handleSave = async () => {
    try {
      await propertyEditor.saveChanges()
    } catch (error) {
      console.error('保存属性失败:', error)
    }
  }

  // 重置属性
  const handleReset = () => {
    propertyEditor.resetChanges()
  }

  // 切换预览模式
  const togglePreviewMode = () => {
    const newMode = !previewMode
    setPreviewMode(newMode)
    propertyEditor.setPreviewMode(newMode)
  }

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

  // 渲染加载状态
  const renderLoadingState = () => (
    <div className="flex h-full items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">加载属性中...</span>
      </div>
    </div>
  )

  // 渲染错误状态
  const renderErrorState = () => (
    <Alert variant="destructive" className="m-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        {propertyEditor.error || '加载属性时发生错误'}
      </AlertDescription>
    </Alert>
  )

  // 渲染组件头部信息
  const renderComponentHeader = () => {
    if (!propertyEditor.selectedComponent) return null

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-medium">
                {propertyEditor.selectedComponent.name}
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {propertyEditor.selectedComponent.type}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePreviewMode}
                className="h-7 w-7 p-0"
                title={previewMode ? '退出预览模式' : '进入预览模式'}
              >
                {previewMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {propertyEditor.selectedComponent.type && (
            <p className="text-sm text-muted-foreground">
              组件ID: {propertyEditor.selectedComponent.id}
            </p>
          )}
        </CardHeader>
      </Card>
    )
  }

  // 渲染状态指示器
  const renderStatusIndicator = () => {
    if (!propertyEditor.isDirty && !propertyEditor.saving) return null

    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            {propertyEditor.saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm">保存中...</span>
              </>
            ) : propertyEditor.isDirty ? (
              <>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm">存在未保存的更改</span>
                <Badge variant="outline" className="text-xs">
                  {propertyEditor.dirtyProperties.size} 项变更
                </Badge>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">已保存</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // 渲染标签页
  const renderTabs = () => (
    <div className="flex items-center gap-1 border-b border-border p-1">
      {[
        { id: 'properties', label: '属性', count: componentPropertyDefinitions.length },
        { id: 'styles', label: '样式', count: 0 },
        { id: 'events', label: '事件', count: 0 },
      ].map(tab => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab(tab.id as any)}
          className="relative h-8 px-3 text-sm"
        >
          {tab.label}
          {tab.count > 0 && (
            <Badge
              variant={activeTab === tab.id ? 'secondary' : 'outline'}
              className="ml-2 h-4 px-1 text-xs"
            >
              {tab.count}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  )

  // 渲染属性内容
  const renderContent = () => {
    switch (activeTab) {
      case 'properties':
        return (
          <PropertyForm
            properties={componentPropertyDefinitions}
            values={propertyEditor.previewProperties}
            onChange={propertyEditor.updateProperty}
            onSave={handleSave}
            onReset={handleReset}
            isDirty={propertyEditor.isDirty}
            isSaving={propertyEditor.saving}
            validation={Object.fromEntries(
              Object.entries(propertyEditor.validationErrors).map(([key, error]) => [
                key,
                { isValid: false, message: error }
              ])
            )}
            grouped={true}
            collapsible={true}
          />
        )

      case 'styles':
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <Settings className="mx-auto h-8 w-8 mb-2" />
                <p className="text-sm">样式配置功能即将推出</p>
              </div>
            </CardContent>
          </Card>
        )

      case 'events':
        return (
          <div className="p-4">
            {propertyEditor.selectedComponent && (
              <EventHandler
                componentId={propertyEditor.selectedComponent.id}
                componentType={propertyEditor.selectedComponent.type}
                componentEvents={propertyEditor.selectedComponent.eventHandlers || {}}
                disabled={propertyEditor.saving}
                onEventChange={(events) => {
                  // 这里需要通过propertyEditor更新组件事件
                  console.log('Events updated:', events)
                }}
              />
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* 组件头部 */}
      {propertyEditor.selectedComponent && renderComponentHeader()}

      {/* 状态指示器 */}
      {propertyEditor.selectedComponent && renderStatusIndicator()}

      {/* 无组件选择状态 */}
      {!propertyEditor.selectedComponent && !propertyEditor.loading && (
        renderEmptyState()
      )}

      {/* 加载状态 */}
      {propertyEditor.loading && renderLoadingState()}

      {/* 错误状态 */}
      {propertyEditor.error && renderErrorState()}

      {/* 主要内容 */}
      {propertyEditor.selectedComponent && !propertyEditor.loading && !propertyEditor.error && (
        <>
          {/* 标签页 */}
          {renderTabs()}

          {/* 内容区域 */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {renderContent()}
            </div>
          </ScrollArea>

          {/* 底部操作栏 */}
          <div className="border-t border-border p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {propertyEditor.isDirty
                  ? `${propertyEditor.dirtyProperties.size} 项未保存的更改`
                  : '所有更改已保存'
                }
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={!propertyEditor.isDirty || propertyEditor.saving}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  重置
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!propertyEditor.isDirty || propertyEditor.saving || !propertyEditor.isValid}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {propertyEditor.saving ? '保存中...' : '保存更改'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Button组件属性定义
function getButtonPropertyDefinitions(): PropertyDefinition[] {
  return [
    {
      key: 'text',
      label: '按钮文本',
      type: 'text',
      description: '按钮上显示的文本内容',
      required: true,
      placeholder: '请输入按钮文本',
      maxLength: 50,
      showCharCount: true,
      group: '基础属性'
    },
    {
      key: 'variant',
      label: '按钮样式',
      type: 'select',
      description: '按钮的视觉样式',
      defaultValue: 'primary',
      options: [
        { label: '主要按钮', value: 'primary' },
        { label: '次要按钮', value: 'secondary' },
        { label: '轮廓按钮', value: 'outline' },
        { label: '幽灵按钮', value: 'ghost' }
      ],
      group: '基础属性'
    },
    {
      key: 'disabled',
      label: '禁用状态',
      type: 'boolean',
      description: '是否禁用按钮',
      defaultValue: false,
      trueLabel: '禁用',
      falseLabel: '启用',
      group: '基础属性'
    },
    {
      key: 'loading',
      label: '加载状态',
      type: 'boolean',
      description: '是否显示加载状态',
      defaultValue: false,
      trueLabel: '加载中',
      falseLabel: '正常',
      group: '状态'
    }
  ]
}

// Input组件属性定义
function getInputPropertyDefinitions(): PropertyDefinition[] {
  return [
    {
      key: 'placeholder',
      label: '占位符文本',
      type: 'text',
      description: '输入框为空时显示的提示文本',
      placeholder: '请输入占位符文本',
      maxLength: 100,
      group: '基础属性'
    },
    {
      key: 'required',
      label: '必填字段',
      type: 'boolean',
      description: '此输入框是否为必填项',
      defaultValue: false,
      trueLabel: '必填',
      falseLabel: '选填',
      group: '验证'
    },
    {
      key: 'disabled',
      label: '禁用状态',
      type: 'boolean',
      description: '是否禁用此输入框',
      defaultValue: false,
      trueLabel: '禁用',
      falseLabel: '启用',
      group: '基础属性'
    },
    {
      key: 'maxLength',
      label: '最大长度',
      type: 'number',
      description: '允许输入的最大字符数',
      min: 1,
      max: 1000,
      defaultValue: 100,
      group: '验证'
    }
  ]
}

// Text组件属性定义
function getTextPropertyDefinitions(): PropertyDefinition[] {
  return [
    {
      key: 'content',
      label: '文本内容',
      type: 'textarea',
      description: '显示的文本内容',
      required: true,
      placeholder: '请输入文本内容',
      multiline: true,
      maxLength: 500,
      showCharCount: true,
      group: '基础属性'
    },
    {
      key: 'fontSize',
      label: '字体大小',
      type: 'select',
      description: '文本的字体大小',
      defaultValue: 'medium',
      options: [
        { label: '小', value: 'small' },
        { label: '中', value: 'medium' },
        { label: '大', value: 'large' },
        { label: '特大', value: 'xLarge' }
      ],
      group: '样式'
    }
  ]
}

// Container组件属性定义
function getContainerPropertyDefinitions(): PropertyDefinition[] {
  return [
    {
      key: 'padding',
      label: '内边距',
      type: 'select',
      description: '容器的内边距大小',
      defaultValue: 'medium',
      options: [
        { label: '无', value: 'none' },
        { label: '小', value: 'small' },
        { label: '中', value: 'medium' },
        { label: '大', value: 'large' }
      ],
      group: '布局'
    },
    {
      key: 'border',
      label: '边框',
      type: 'boolean',
      description: '是否显示边框',
      defaultValue: false,
      trueLabel: '显示',
      falseLabel: '隐藏',
      group: '样式'
    }
  ]
}

// 基础属性定义（默认组件）
function getBasePropertyDefinitions(): PropertyDefinition[] {
  return [
    {
      key: 'id',
      label: '组件ID',
      type: 'text',
      description: '组件的唯一标识符',
      required: true,
      disabled: true,
      group: '基础属性'
    },
    {
      key: 'className',
      label: 'CSS类名',
      type: 'text',
      description: '自定义CSS类名',
      placeholder: '请输入CSS类名',
      group: '高级'
    }
  ]
}

export default ComponentPropertiesPanel