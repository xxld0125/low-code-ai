/**
 * 样式编辑器主组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Palette,
  Layout,
  Type,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  Undo2,
  Redo2
} from 'lucide-react'

// 导入共享类型和工具
import {
  FieldDefinition
} from '@/lib/lowcode/types/editor'

// 本地类型定义
interface ComponentStyles {
  [key: string]: unknown
}

interface PreviewConfig {
  enabled?: boolean
  width?: number
  height?: number
  showBorder?: boolean
  backgroundColor?: string
}
import { PropertyGroup } from './PropertyGroup'
import { ValidationErrorDisplay } from '@/components/lowcode/validation/ValidationErrorDisplay'
import { StylePreview } from './StylePreview'

// 本地接口定义
interface StyleEditorProps {
  // 组件定义
  component: {
    id: string
    name: string
    category: string
    styles?: ComponentStyles
    styleDefinitions?: FieldDefinition[]
  }

  // 当前值
  value?: ComponentStyles

  // 编辑器配置
  config?: {
    showPreview?: boolean
    showValidation?: boolean
    showReset?: boolean
    groups?: string[]
    collapsible?: boolean
  }

  // 预览配置
  previewConfig?: PreviewConfig

  // 事件处理
  onChange?: (styles: ComponentStyles) => void
  onPreviewStyle?: (styles: ComponentStyles) => void
  onResetStyles?: () => void
  onSaveStyles?: (styles: ComponentStyles) => void

  // 状态
  readonly?: boolean
  disabled?: boolean
  loading?: boolean

  // 样式
  className?: string
}

interface StyleGroup {
  id: string
  name: string
  icon: React.ReactNode
  description?: string
  properties: FieldDefinition[]
  order: number
  defaultExpanded?: boolean
}

export const StyleEditor: React.FC<StyleEditorProps> = ({
  component,
  value: initialValue = {},
  config = {},
  previewConfig,
  onChange,
  onPreviewStyle,
  onResetStyles,
  onSaveStyles,
  readonly = false,
  disabled = false,
  loading = false,
  className,
}) => {
  const [styles, setStyles] = useState<ComponentStyles>(initialValue)
  const [previewStyles, setPreviewStyles] = useState<ComponentStyles>({})
  const [showPreview, setShowPreview] = useState(config.showPreview ?? true)
  const [activeTab, setActiveTab] = useState('layout')
  const [history, setHistory] = useState<ComponentStyles[]>([initialValue])
  const [historyIndex, setHistoryIndex] = useState(0)

  // 合并配置
  const editorConfig = useMemo(() => ({
    showPreview: true,
    showValidation: true,
    showReset: true,
    groups: ['layout', 'typography', 'spacing', 'visual', 'effects'],
    collapsible: true,
    ...config,
  }), [config])

  // 样式分组定义
  const styleGroups = useMemo<StyleGroup[]>(() => {
    const groups: StyleGroup[] = [
      {
        id: 'layout',
        name: '布局',
        icon: <Layout className="h-4 w-4" />,
        description: '尺寸、定位、显示方式',
        order: 1,
        defaultExpanded: true,
        properties: [
          {
            name: 'display',
            type: 'select',
            label: '显示方式',
            description: '元素的显示类型',
            required: false,
            config: {
              options: [
                { value: 'block', label: '块级' },
                { value: 'inline', label: '行内' },
                { value: 'flex', label: '弹性布局' },
                { value: 'grid', label: '网格布局' },
                { value: 'none', label: '隐藏' },
              ],
            },
          },
          {
            name: 'width',
            type: 'text',
            label: '宽度',
            description: '元素宽度',
            placeholder: '例如: 100px',
            required: false,
          },
          {
            name: 'height',
            type: 'text',
            label: '高度',
            description: '元素高度',
            placeholder: '例如: 100px',
            required: false,
          },
          {
            name: 'position',
            type: 'select',
            label: '定位方式',
            description: '元素的定位类型',
            required: false,
            config: {
              options: [
                { value: 'static', label: '静态' },
                { value: 'relative', label: '相对' },
                { value: 'absolute', label: '绝对' },
                { value: 'fixed', label: '固定' },
                { value: 'sticky', label: '粘性' },
              ],
            },
          },
        ],
      },
      {
        id: 'typography',
        name: '文字',
        icon: <Type className="h-4 w-4" />,
        description: '字体、大小、颜色、行高',
        order: 2,
        defaultExpanded: true,
        properties: [
          {
            name: 'fontFamily',
            type: 'select',
            label: '字体',
            description: '文字字体',
            required: false,
            config: {
              options: [
                { value: 'system-ui', label: '系统默认' },
                { value: 'Arial', label: 'Arial' },
                { value: 'Helvetica', label: 'Helvetica' },
                { value: 'Georgia', label: 'Georgia' },
                { value: 'Times New Roman', label: 'Times New Roman' },
                { value: 'Courier New', label: 'Courier New' },
              ],
            },
          },
          {
            name: 'fontSize',
            type: 'size',
            label: '字号',
            description: '文字大小',
            required: false,
          },
          {
            name: 'fontWeight',
            type: 'select',
            label: '字重',
            description: '文字粗细',
            required: false,
            config: {
              options: [
                { value: 'normal', label: '正常' },
                { value: 'bold', label: '粗体' },
                { value: '100', label: '100' },
                { value: '200', label: '200' },
                { value: '300', label: '300' },
                { value: '400', label: '400' },
                { value: '500', label: '500' },
                { value: '600', label: '600' },
                { value: '700', label: '700' },
                { value: '800', label: '800' },
                { value: '900', label: '900' },
              ],
            },
          },
          {
            name: 'color',
            type: 'color',
            label: '文字颜色',
            description: '文字的颜色',
            required: false,
          },
        ],
      },
      {
        id: 'spacing',
        name: '间距',
        icon: <Settings className="h-4 w-4" />,
        description: '内边距、外边距',
        order: 3,
        defaultExpanded: false,
        properties: [
          {
            name: 'margin',
            type: 'spacing',
            label: '外边距',
            description: '元素外部的间距',
            required: false,
          },
          {
            name: 'padding',
            type: 'spacing',
            label: '内边距',
            description: '元素内部的间距',
            required: false,
          },
        ],
      },
      {
        id: 'visual',
        name: '外观',
        icon: <Palette className="h-4 w-4" />,
        description: '背景、边框、圆角',
        order: 4,
        defaultExpanded: false,
        properties: [
          {
            name: 'backgroundColor',
            type: 'color',
            label: '背景色',
            description: '元素的背景颜色',
            required: false,
          },
          {
            name: 'border',
            type: 'border',
            label: '边框',
            description: '元素的边框样式',
            required: false,
          },
          {
            name: 'borderRadius',
            type: 'size',
            label: '圆角',
            description: '元素的圆角大小',
            required: false,
          },
        ],
      },
      {
        id: 'effects',
        name: '效果',
        icon: <Eye className="h-4 w-4" />,
        description: '阴影、透明度、动画',
        order: 5,
        defaultExpanded: false,
        properties: [
          {
            name: 'boxShadow',
            type: 'shadow',
            label: '阴影',
            description: '元素的阴影效果',
            required: false,
          },
          {
            name: 'opacity',
            type: 'number',
            label: '透明度',
            description: '元素的透明度 (0-1)',
            required: false,
            config: {
              min: 0,
              max: 1,
              step: 0.1,
            },
          },
          {
            name: 'transition',
            type: 'transition',
            label: '过渡动画',
            description: '样式变化的过渡效果',
            required: false,
          },
        ],
      },
    ]

    // 根据配置过滤分组
    if (editorConfig.groups && editorConfig.groups.length > 0) {
      return groups.filter(group => editorConfig.groups.includes(group.id))
    }

    return groups
  }, [editorConfig.groups])

  // 过滤后的分组
  const visibleGroups = useMemo(() => {
    return styleGroups.sort((a, b) => a.order - b.order)
  }, [styleGroups])

  // 处理样式变化
  const handleStyleChange = useCallback((newStyles: ComponentStyles) => {
    const updatedStyles = { ...styles, ...newStyles }
    setStyles(updatedStyles)

    // 添加到历史记录
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(updatedStyles)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)

    // 触发预览
    if (showPreview && onPreviewStyle) {
      const previewData = { ...previewStyles, ...newStyles }
      setPreviewStyles(previewData)
      onPreviewStyle(previewData)
    }

    // 触发变化事件
    if (onChange) {
      onChange(updatedStyles)
    }
  }, [styles, history, historyIndex, previewStyles, showPreview, onChange, onPreviewStyle])

  // 处理属性变化
  const handlePropertyChange = useCallback((propertyId: string, value: unknown) => {
    handleStyleChange({ [propertyId]: value })
  }, [handleStyleChange])

  // 重置样式
  const handleReset = useCallback(() => {
    const defaultStyles = {}
    setStyles(defaultStyles)
    setPreviewStyles({})
    setHistory([defaultStyles])
    setHistoryIndex(0)

    if (onPreviewStyle) {
      onPreviewStyle({})
    }
    if (onChange) {
      onChange(defaultStyles)
    }
    if (onResetStyles) {
      onResetStyles()
    }
  }, [onChange, onPreviewStyle, onResetStyles])

  // 保存样式
  const handleSave = useCallback(() => {
    if (onSaveStyles) {
      onSaveStyles(styles)
    }
  }, [styles, onSaveStyles])

  // 撤销
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const prevStyles = history[newIndex]
      setHistoryIndex(newIndex)
      setStyles(prevStyles)

      if (onChange) {
        onChange(prevStyles)
      }
    }
  }, [history, historyIndex, onChange])

  // 重做
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const nextStyles = history[newIndex]
      setHistoryIndex(newIndex)
      setStyles(nextStyles)

      if (onChange) {
        onChange(nextStyles)
      }
    }
  }, [history, historyIndex, onChange])

  // 渲染工具栏
  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">样式编辑器</h3>
        <Badge variant="outline" className="text-xs">
          {component.name}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {/* 预览切换 */}
        {editorConfig.showPreview && (
          <Button
            variant={showPreview ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            disabled={disabled}
          >
            {showPreview ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        )}

        {/* 撤销/重做 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleUndo}
          disabled={disabled || historyIndex <= 0}
        >
          <Undo2 className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRedo}
          disabled={disabled || historyIndex >= history.length - 1}
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        {/* 重置 */}
        {editorConfig.showReset && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={disabled}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}

        {/* 保存 */}
        <Button
          variant="default"
          size="sm"
          onClick={handleSave}
          disabled={disabled || loading}
        >
          <Save className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  // 渲染标签页
  const renderTabs = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
      <TabsList className="grid w-full grid-cols-5">
        {visibleGroups.map((group) => (
          <TabsTrigger key={group.id} value={group.id} className="flex items-center gap-2">
            {group.icon}
            <span className="hidden sm:inline">{group.name}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <ScrollArea className="flex-1 p-4">
        {visibleGroups.map((group) => (
          <TabsContent key={group.id} value={group.id} className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {group.icon}
                  {group.name}
                </CardTitle>
                {group.description && (
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <PropertyGroup
                  title={group.name}
                  properties={group.properties}
                  values={styles}
                  onChange={handlePropertyChange}
                  readonly={readonly}
                  disabled={disabled}
                  collapsible={editorConfig.collapsible}
                  defaultOpen={group.defaultExpanded}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </ScrollArea>
    </Tabs>
  )

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* 工具栏 */}
      {renderToolbar()}

      {/* 主要内容 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 编辑器 */}
        {renderTabs()}

        {/* 分隔符 */}
        {showPreview && previewConfig && (
          <Separator orientation="vertical" />
        )}

        {/* 预览区域 */}
        {showPreview && previewConfig && (
          <div className="w-1/3 p-4 border-l">
            <StylePreview
              component={component}
              styles={previewStyles}
              defaultStyles={initialValue}
              config={{
                showDeviceSelector: true,
                showStyleInfo: true,
                showReset: false,
                defaultDevice: 'desktop',
                backgroundColor: previewConfig.backgroundColor,
                showGrid: false
              }}
              onReset={onResetStyles}
              loading={loading}
              disabled={disabled}
              readonly={readonly}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default StyleEditor