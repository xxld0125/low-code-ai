'use client'

import React, { useCallback, useMemo } from 'react'
import { usePropertyEditor } from '@/hooks/usePropertyEditor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Settings,
  Save,
  RotateCcw,
  Undo,
  Redo,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'

// 子组件
import { PropertyForm } from './PropertiesPanel/components/PropertyForm'
// import { TextPropertyEditor } from './PropertiesPanel/components/TextPropertyEditor'
// import { BooleanPropertyEditor } from './PropertiesPanel/components/BooleanPropertyEditor'

import type {
  ComponentInstance,
  PropertySchema,
  PropertyGroupConfig
} from '@/types/designer'

interface PropertyConfigPanelProps {
  // 组件选择
  selectedComponentId: string | null
  selectedComponent: ComponentInstance | null
  onComponentSelect?: (componentId: string | null) => void

  // 项目信息
  projectId: string

  // 配置选项
  showValidation?: boolean
  showHistory?: boolean
  showPreview?: boolean
  autoSave?: boolean
  readOnly?: boolean

  // 样式配置
  className?: string
  width?: number
}

/**
 * 组件属性配置面板
 * 提供组件属性的编辑、预览、保存和历史管理功能
 */
export function PropertyConfigPanel({
  selectedComponentId,
  selectedComponent,
  onComponentSelect: _onComponentSelect,
  projectId: _projectId,
  showValidation = true,
  showHistory: _showHistory = true,
  showPreview = true,
  autoSave = false,
  readOnly = false,
  className = '',
  width = 320
}: PropertyConfigPanelProps) {
  // 使用属性编辑器Hook
  const propertyEditor = usePropertyEditor(selectedComponentId, {
    autoSave,
    autoValidate: showValidation,
    enablePreview: showPreview
  })

  // 获取组件属性schema定义
  const propertySchemas = useMemo((): Record<string, PropertySchema> => {
    if (!selectedComponent) return {}

    // 根据组件类型返回相应的属性schema
    switch (selectedComponent.type) {
      case 'Button':
        return {
          text: {
            type: 'string',
            required: true,
            minLength: 1,
            maxLength: 50,
            default: '按钮'
          },
          variant: {
            type: 'string',
            required: false,
            enum: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
            default: 'primary'
          },
          size: {
            type: 'string',
            required: false,
            enum: ['sm', 'md', 'lg'],
            default: 'md'
          },
          disabled: {
            type: 'boolean',
            required: false,
            default: false
          },
          loading: {
            type: 'boolean',
            required: false,
            default: false
          }
        }

      case 'Input':
        return {
          placeholder: {
            type: 'string',
            required: false,
            maxLength: 100,
            default: ''
          },
          value: {
            type: 'string',
            required: false,
            maxLength: 200,
            default: ''
          },
          type: {
            type: 'string',
            required: false,
            enum: ['text', 'password', 'email', 'number', 'tel'],
            default: 'text'
          },
          required: {
            type: 'boolean',
            required: false,
            default: false
          },
          disabled: {
            type: 'boolean',
            required: false,
            default: false
          }
        }

      case 'Text':
        return {
          content: {
            type: 'string',
            required: true,
            minLength: 1,
            default: '文本内容'
          },
          variant: {
            type: 'string',
            required: false,
            enum: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'],
            default: 'p'
          },
          align: {
            type: 'string',
            required: false,
            enum: ['left', 'center', 'right', 'justify'],
            default: 'left'
          }
        }

      default:
        return {}
    }
  }, [selectedComponent])

  // 属性分组配置
  const propertyGroups: PropertyGroupConfig[] = useMemo(() => [
    {
      title: '基础属性',
      description: '组件的基本配置选项',
      collapsible: false,
      defaultCollapsed: false,
      order: 1
    },
    {
      title: '样式配置',
      description: '组件的外观和样式设置',
      collapsible: true,
      defaultCollapsed: false,
      order: 2
    },
    {
      title: '事件处理',
      description: '组件的交互事件配置',
      collapsible: true,
      defaultCollapsed: true,
      order: 3
    },
    {
      title: '高级选项',
      description: '组件的高级配置选项',
      collapsible: true,
      defaultCollapsed: true,
      order: 4
    }
  ], [])

  // 保存处理
  const handleSave = useCallback(async () => {
    try {
      await propertyEditor.saveChanges()
    } catch (error) {
      // 保存失败处理
      console.error('保存失败:', error)
    }
  }, [propertyEditor])

  // 重置处理
  const handleReset = useCallback(() => {
    propertyEditor.resetChanges()
  }, [propertyEditor])

  // 预览模式切换
  const handlePreviewToggle = useCallback((enabled: boolean) => {
    propertyEditor.setPreviewMode(enabled)
  }, [propertyEditor])

  // 应用预览
  const handleApplyPreview = useCallback(() => {
    propertyEditor.applyPreview()
  }, [propertyEditor])

  // 丢弃预览
  const handleDiscardPreview = useCallback(() => {
    propertyEditor.discardPreview()
  }, [propertyEditor])

  // 渲染空状态
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <Settings className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">未选择组件</h3>
      <p className="text-sm text-muted-foreground mb-4">
        点击画布中的组件来编辑其属性
      </p>
    </div>
  )

  // 渲染组件信息头部
  const renderComponentHeader = () => {
    if (!selectedComponent) return null

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm">{selectedComponent.name || selectedComponent.type}</CardTitle>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {selectedComponent.type}
                </Badge>
              </div>
            </div>

            {/* 组件状态指示器 */}
            <div className="flex items-center gap-2">
              {propertyEditor.isDirty && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="mr-1 h-3 w-3" />
                  未保存
                </Badge>
              )}
              {propertyEditor.isValid && (
                <Badge variant="default" className="text-xs bg-green-500">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  验证通过
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    )
  }

  // 渲染工具栏
  const renderToolbar = () => {
    if (!selectedComponent || readOnly) return null

    return (
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            {/* 历史操作按钮 */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={propertyEditor.undo}
                disabled={!propertyEditor.canUndo}
                className="h-8 px-2"
              >
                <Undo className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={propertyEditor.redo}
                disabled={!propertyEditor.canRedo}
                className="h-8 px-2"
              >
                <Redo className="h-3 w-3" />
              </Button>
            </div>

            {/* 预览模式开关 */}
            {showPreview && (
              <div className="flex items-center gap-2">
                <Label className="text-xs">预览模式</Label>
                <Switch
                  checked={propertyEditor.isPreviewMode}
                  onCheckedChange={handlePreviewToggle}
                  disabled={propertyEditor.saving}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={propertyEditor.isPreviewMode ? handleDiscardPreview : handleApplyPreview}
                  disabled={!propertyEditor.isDirty || propertyEditor.saving}
                  className="h-8 px-2"
                >
                  {propertyEditor.isPreviewMode ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      丢弃
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      预览
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* 保存和重置按钮 */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleReset}
                disabled={!propertyEditor.isDirty || propertyEditor.saving}
                className="h-8 px-2"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                重置
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!propertyEditor.isDirty || propertyEditor.saving}
                className="h-8 px-3"
              >
                {propertyEditor.saving ? (
                  <>
                    <Clock className="h-3 w-3 mr-1 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-1" />
                    保存
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 渲染属性编辑表单
  const renderPropertyForm = () => {
    if (!selectedComponent) return null

    return (
      <PropertyForm
        properties={propertyEditor.properties}
        previewProperties={propertyEditor.previewProperties}
        schemas={propertySchemas}
        groups={propertyGroups}
        loading={propertyEditor.loading}
        saving={propertyEditor.saving}
        onPropertyChange={propertyEditor.updateProperty}
        onPropertiesChange={propertyEditor.updateProperties}
        onValidate={showValidation ? propertyEditor.validateProperty : undefined}
        validationErrors={propertyEditor.validationErrors}
        readOnly={readOnly}
        isPreviewMode={propertyEditor.isPreviewMode}
      />
    )
  }

  // 渲染错误状态
  const renderErrorState = () => {
    if (!propertyEditor.error) return null

    return (
      <Card className="mb-4 border-red-200 bg-red-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">发生错误</h4>
              <p className="text-sm text-red-600 mt-1">{propertyEditor.error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 主渲染
  if (!selectedComponent) {
    return (
      <div
        className={`flex h-full flex-col ${className}`}
        style={{ width }}
      >
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">属性配置</h2>
          </div>
        </div>
        <div className="flex-1">
          {renderEmptyState()}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex h-full flex-col ${className}`}
      style={{ width }}
    >
      {/* 头部 */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">属性配置</h2>
          {autoSave && (
            <Badge variant="outline" className="ml-auto">
              <Zap className="h-3 w-3 mr-1" />
              自动保存
            </Badge>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 组件信息 */}
        {renderComponentHeader()}

        {/* 错误状态 */}
        {renderErrorState()}

        {/* 工具栏 */}
        {renderToolbar()}

        {/* 属性编辑表单 */}
        {renderPropertyForm()}
      </div>
    </div>
  )
}

export default PropertyConfigPanel