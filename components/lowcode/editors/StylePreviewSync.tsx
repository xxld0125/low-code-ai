/**
 * 样式预览同步组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 * 用途: 同步样式编辑器和预览组件，实现实时预览
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { StyleEditor } from './StyleEditor'
import { StylePreview } from './StylePreview'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  SplitSquareVertical,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Settings,
  Play,
  Pause
} from 'lucide-react'

// 导入共享类型和工具
import { FieldDefinition } from '@/lib/lowcode/types/editor'

// 本地接口定义
interface ComponentStyles {
  [key: string]: unknown
}

interface PreviewDevice {
  id: string
  name: string
  width: number
  height: number
  icon: React.ReactNode
}

interface StylePreviewSyncProps {
  // 组件信息
  component: {
    id: string
    name: string
    category: string
    styleDefinitions?: FieldDefinition[]
    defaultStyles?: ComponentStyles
  }

  // 初始样式值
  initialStyles?: ComponentStyles

  // 编辑器配置
  editorConfig?: {
    showPreview?: boolean
    showValidation?: boolean
    showReset?: boolean
    groups?: string[]
    collapsible?: boolean
  }

  // 预览配置
  previewConfig?: {
    showDeviceSelector?: boolean
    showStyleInfo?: boolean
    showReset?: boolean
    defaultDevice?: string
    devices?: PreviewDevice[]
    backgroundColor?: string
    showGrid?: boolean
    scale?: number
  }

  // 布局配置
  layout?: {
    direction?: 'horizontal' | 'vertical'
    sizes?: number[] // [editorSize, previewSize]
    resizable?: boolean
    showDivider?: boolean
  }

  // 实时预览配置
  livePreview?: {
    enabled?: boolean
    debounceMs?: number
    autoSave?: boolean
    autoSaveInterval?: number
  }

  // 事件处理
  onStyleChange?: (styles: ComponentStyles) => void
  onStyleSave?: (styles: ComponentStyles) => void
  onStyleReset?: () => void
  onDeviceChange?: (device: PreviewDevice) => void

  // 状态
  loading?: boolean
  disabled?: boolean
  readonly?: boolean

  // 样式
  className?: string
}

export const StylePreviewSync: React.FC<StylePreviewSyncProps> = ({
  component,
  initialStyles = {},
  editorConfig = {},
  previewConfig = {},
  layout = {},
  livePreview = {},
  onStyleChange,
  onStyleSave,
  onStyleReset,
  onDeviceChange,
  loading = false,
  disabled = false,
  readonly = false,
  className,
}) => {
  // 样式状态
  const [currentStyles, setCurrentStyles] = useState<ComponentStyles>(initialStyles)
  const [previewStyles, setPreviewStyles] = useState<ComponentStyles>(initialStyles)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // 实时预览状态
  const [isLivePreviewEnabled, setIsLivePreviewEnabled] = useState(livePreview.enabled ?? true)
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(livePreview.autoSave ?? false)

  // 布局状态
  const [editorSize, setEditorSize] = useState(layout.sizes?.[0] ?? 50)
  const [isResizing, setIsResizing] = useState(false)

  // 自动保存定时器
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null)

  // 合并配置
  const layoutConfig = useMemo(() => ({
    direction: 'horizontal' as const,
    sizes: [50, 50],
    resizable: true,
    showDivider: true,
    ...layout,
  }), [layout])

  const livePreviewConfig = useMemo(() => ({
    enabled: true,
    debounceMs: 300,
    autoSave: false,
    autoSaveInterval: 5000,
    ...livePreview,
  }), [livePreview])

  // 防抖处理样式变化
  const debouncedStyleChange = useMemo(() => {
    if (livePreviewConfig.debounceMs <= 0) {
      return (styles: ComponentStyles) => {
        setPreviewStyles(styles)
        onStyleChange?.(styles)
      }
    }

    let timeoutId: NodeJS.Timeout
    return (styles: ComponentStyles) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setPreviewStyles(styles)
        onStyleChange?.(styles)
      }, livePreviewConfig.debounceMs)
    }
  }, [livePreviewConfig.debounceMs, onStyleChange])

  // 处理样式保存
  const handleSave = useCallback((styles?: ComponentStyles) => {
    const stylesToSave = styles || currentStyles
    onStyleSave?.(stylesToSave)
    setHasUnsavedChanges(false)

    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
      setAutoSaveTimer(null)
    }
  }, [currentStyles, onStyleSave, autoSaveTimer, setAutoSaveTimer])

  // 处理样式变化
  const handleStyleChange = useCallback((styles: ComponentStyles) => {
    setCurrentStyles(styles)
    setHasUnsavedChanges(true)

    if (isLivePreviewEnabled) {
      debouncedStyleChange(styles)
    }

    // 自动保存处理
    if (isAutoSaveEnabled) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }

      const timer = setTimeout(() => {
        handleSave(styles)
      }, livePreviewConfig.autoSaveInterval)

      setAutoSaveTimer(timer)
    }
  }, [
    isLivePreviewEnabled,
    isAutoSaveEnabled,
    debouncedStyleChange,
    autoSaveTimer,
    livePreviewConfig.autoSaveInterval,
    handleSave,
    setAutoSaveTimer
  ])

  // 处理预览样式变化
  const handlePreviewStyle = useCallback((styles: ComponentStyles) => {
    setPreviewStyles(styles)
  }, [])

  // 处理样式重置
  const handleStyleReset = useCallback(() => {
    const defaultStyles = component.defaultStyles || {}
    setCurrentStyles(defaultStyles)
    setPreviewStyles(defaultStyles)
    setHasUnsavedChanges(false)

    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
      setAutoSaveTimer(null)
    }

    onStyleReset?.()
    onStyleChange?.(defaultStyles)
  }, [component.defaultStyles, onStyleReset, onStyleChange, autoSaveTimer])

  // 处理设备变化
  const handleDeviceChange = useCallback((device: PreviewDevice) => {
    onDeviceChange?.(device)
  }, [onDeviceChange])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }
    }
  }, [autoSaveTimer])

  // 渲染控制面板
  const renderControlPanel = () => (
    <div className="flex items-center justify-between p-3 border-b bg-muted/30">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {component.name}
          </Badge>
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="text-xs">
              未保存
            </Badge>
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="live-preview"
              checked={isLivePreviewEnabled}
              onCheckedChange={setIsLivePreviewEnabled}
              disabled={disabled}
            />
            <Label htmlFor="live-preview" className="text-sm">实时预览</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="auto-save"
              checked={isAutoSaveEnabled}
              onCheckedChange={setIsAutoSaveEnabled}
              disabled={disabled || readonly}
            />
            <Label htmlFor="auto-save" className="text-sm">自动保存</Label>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleStyleReset}
          disabled={disabled || readonly}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          重置
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={() => handleSave()}
          disabled={disabled || readonly || !hasUnsavedChanges}
        >
          <Save className="h-4 w-4 mr-1" />
          保存
        </Button>
      </div>
    </div>
  )

  // 渲染分割线
  const renderDivider = () => {
    if (!layoutConfig.showDivider) return null

    const isHorizontal = layoutConfig.direction === 'horizontal'

    return (
      <div
        className={cn(
          'bg-border transition-colors hover:bg-border/80',
          isHorizontal ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'
        )}
        onMouseDown={(e) => {
          if (!layoutConfig.resizable) return

          setIsResizing(true)
          e.preventDefault()

          const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return

            const container = e.currentTarget as HTMLElement
            const rect = container.getBoundingClientRect()

            if (isHorizontal) {
              const percentage = ((e.clientX - rect.left) / rect.width) * 100
              setEditorSize(Math.max(20, Math.min(80, percentage)))
            } else {
              const percentage = ((e.clientY - rect.top) / rect.height) * 100
              setEditorSize(Math.max(20, Math.min(80, percentage)))
            }
          }

          const handleMouseUp = () => {
            setIsResizing(false)
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
          }

          document.addEventListener('mousemove', handleMouseMove)
          document.addEventListener('mouseup', handleMouseUp)
        }}
      />
    )
  }

  // 渲染水平布局
  const renderHorizontalLayout = () => (
    <div className="flex h-full">
      {/* 编辑器 */}
      <div
        className="flex flex-col overflow-hidden"
        style={{ width: `${editorSize}%` }}
      >
        <StyleEditor
          component={component}
          value={currentStyles}
          config={editorConfig}
          onChange={handleStyleChange}
          onPreviewStyle={handlePreviewStyle}
          onResetStyles={handleStyleReset}
          onSaveStyles={() => handleSave()}
          readonly={readonly}
          disabled={disabled}
          loading={loading}
        />
      </div>

      {/* 分割线 */}
      {renderDivider()}

      {/* 预览 */}
      <div
        className="flex flex-col overflow-hidden"
        style={{ width: `${100 - editorSize}%` }}
      >
        <StylePreview
          component={component}
          styles={isLivePreviewEnabled ? previewStyles : currentStyles}
          config={previewConfig}
          onReset={handleStyleReset}
          onDeviceChange={handleDeviceChange}
          loading={loading}
          disabled={disabled}
          readonly={readonly}
        />
      </div>
    </div>
  )

  // 渲染垂直布局
  const renderVerticalLayout = () => (
    <div className="flex flex-col h-full">
      {/* 编辑器 */}
      <div
        className="flex flex-col overflow-hidden"
        style={{ height: `${editorSize}%` }}
      >
        <StyleEditor
          component={component}
          value={currentStyles}
          config={editorConfig}
          onChange={handleStyleChange}
          onPreviewStyle={handlePreviewStyle}
          onResetStyles={handleStyleReset}
          onSaveStyles={() => handleSave()}
          readonly={readonly}
          disabled={disabled}
          loading={loading}
        />
      </div>

      {/* 分割线 */}
      {renderDivider()}

      {/* 预览 */}
      <div
        className="flex flex-col overflow-hidden"
        style={{ height: `${100 - editorSize}%` }}
      >
        <StylePreview
          component={component}
          styles={isLivePreviewEnabled ? previewStyles : currentStyles}
          config={previewConfig}
          onReset={handleStyleReset}
          onDeviceChange={handleDeviceChange}
          loading={loading}
          disabled={disabled}
          readonly={readonly}
        />
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-sm text-muted-foreground">加载样式编辑器...</div>
      </div>
    )
  }

  return (
    <div className={cn('style-preview-sync flex flex-col h-full', className)}>
      {/* 控制面板 */}
      {renderControlPanel()}

      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden">
        {layoutConfig.direction === 'horizontal' ? renderHorizontalLayout() : renderVerticalLayout()}
      </div>
    </div>
  )
}

export default StylePreviewSync