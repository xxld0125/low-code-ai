/**
 * 样式预览组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 * 用途: 实时预览样式修改效果
 */

import React, { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Smartphone as MobileIcon,
  Tablet as TabletIcon,
  Monitor as DesktopIcon,
  Maximize2 as ResponsiveIcon,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react'

// 导入样式处理工具
import { processComponentStyles } from '@/lib/lowcode'

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

interface StylePreviewProps {
  // 组件信息
  component: {
    id: string
    name: string
    category: string
  }

  // 样式数据
  styles: ComponentStyles
  defaultStyles?: ComponentStyles

  // 预览配置
  config?: {
    showDeviceSelector?: boolean
    showStyleInfo?: boolean
    showReset?: boolean
    defaultDevice?: string
    devices?: PreviewDevice[]
    backgroundColor?: string
    showGrid?: boolean
    scale?: number
  }

  // 事件处理
  onReset?: () => void
  onDeviceChange?: (device: PreviewDevice) => void

  // 状态
  loading?: boolean
  disabled?: boolean
  readonly?: boolean

  // 样式
  className?: string
}

// 预设设备配置
const DEFAULT_DEVICES: PreviewDevice[] = [
  {
    id: 'mobile',
    name: '手机',
    width: 375,
    height: 667,
    icon: <MobileIcon className="h-4 w-4" />
  },
  {
    id: 'tablet',
    name: '平板',
    width: 768,
    height: 1024,
    icon: <TabletIcon className="h-4 w-4" />
  },
  {
    id: 'desktop',
    name: '桌面',
    width: 1200,
    height: 800,
    icon: <DesktopIcon className="h-4 w-4" />
  },
  {
    id: 'responsive',
    name: '响应式',
    width: 100,
    height: 400,
    icon: <ResponsiveIcon className="h-4 w-4" />
  }
]

export const StylePreview: React.FC<StylePreviewProps> = ({
  component,
  styles,
  defaultStyles = {},
  config = {},
  onReset,
  onDeviceChange,
  loading = false,
  disabled = false,
  readonly = false,
  className,
}) => {
  const [currentDevice, setCurrentDevice] = useState<PreviewDevice>(
    DEFAULT_DEVICES.find(d => d.id === config.defaultDevice) || DEFAULT_DEVICES[0]
  )
  const [showGrid, setShowGrid] = useState(config.showGrid ?? false)
  const [showStyleInfo, setShowStyleInfo] = useState(config.showStyleInfo ?? true)

  // 合并配置
  const previewConfig = useMemo(() => ({
    showDeviceSelector: true,
    showStyleInfo: true,
    showReset: true,
    defaultDevice: 'desktop',
    devices: DEFAULT_DEVICES,
    backgroundColor: '#f8fafc',
    showGrid: false,
    scale: 1,
    ...config,
  }), [config])

  // 处理样式
  const processedStyles = useMemo(() => {
    try {
      return processComponentStyles(styles, {})
    } catch (error) {
      console.warn('样式处理失败:', error)
      return {
        inlineStyles: {},
        cssClasses: [],
        customCSS: '',
        cssVariables: {},
        stats: { processed: 0, cached: 0, errors: 0 }
      }
    }
  }, [styles])

  // 生成CSS类名
  const cssClassNames = useMemo(() => {
    const baseClasses = [
      'style-preview-component',
      ...processedStyles.cssClasses,
      showGrid ? 'show-grid' : ''
    ].filter(Boolean)

    return cn(baseClasses)
  }, [processedStyles.cssClasses, showGrid])

  // 生成内联样式
  const inlineStyles = useMemo(() => {
    const baseStyles: React.CSSProperties = {
      backgroundColor: previewConfig.backgroundColor,
      // 设备特定样式
      ...(currentDevice.id !== 'responsive' && {
        width: currentDevice.width,
        height: currentDevice.height,
        maxWidth: '100%',
        overflow: 'auto'
      }),
      // 缩放
      ...(previewConfig.scale !== 1 && {
        transform: `scale(${previewConfig.scale})`,
        transformOrigin: 'top left'
      })
    }

    return {
      ...baseStyles,
      ...processedStyles.inlineStyles,
      ...processedStyles.cssVariables
    }
  }, [processedStyles.inlineStyles, processedStyles.cssVariables, currentDevice, previewConfig])

  // 设备切换处理
  const handleDeviceChange = useCallback((device: PreviewDevice) => {
    setCurrentDevice(device)
    onDeviceChange?.(device)
  }, [onDeviceChange])

  // 重置样式
  const handleReset = useCallback(() => {
    onReset?.()
  }, [onReset])

  // 渲染设备选择器
  const renderDeviceSelector = () => {
    if (!previewConfig.showDeviceSelector) return null

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">预览设备:</span>
        <div className="flex gap-1">
          {previewConfig.devices.map((device) => (
            <Button
              key={device.id}
              variant={currentDevice.id === device.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDeviceChange(device)}
              disabled={disabled}
              className="flex items-center gap-1"
            >
              {device.icon}
              <span className="hidden sm:inline">{device.name}</span>
            </Button>
          ))}
        </div>
      </div>
    )
  }

  // 渲染工具栏
  const renderToolbar = () => (
    <div className="flex items-center justify-between p-3 border-b bg-muted/30">
      <div className="flex items-center gap-4">
        {renderDeviceSelector()}

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-2">
          <Button
            variant={showGrid ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            disabled={disabled}
          >
            网格
          </Button>

          <Button
            variant={showStyleInfo ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowStyleInfo(!showStyleInfo)}
            disabled={disabled}
          >
            {showStyleInfo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {previewConfig.showReset && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={disabled || readonly}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            重置
          </Button>
        )}
      </div>
    </div>
  )

  // 渲染样式信息
  const renderStyleInfo = () => {
    if (!showStyleInfo) return null

    const activeStyles = Object.entries(styles).filter(([_, value]) =>
      value !== undefined && value !== null && value !== ''
    )

    return (
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">当前样式</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {activeStyles.length === 0 ? (
            <p className="text-xs text-muted-foreground">暂无样式配置</p>
          ) : (
            activeStyles.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="font-mono text-muted-foreground">{key}:</span>
                <span className="font-mono">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))
          )}

          {processedStyles.customCSS && (
            <div className="mt-3 pt-3 border-t">
              <div className="text-xs font-medium mb-1">生成的CSS:</div>
              <pre className="text-xs font-mono bg-muted p-2 rounded overflow-x-auto">
                {processedStyles.customCSS}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // 渲染预览内容
  const renderPreviewContent = () => {
    const previewWidth = currentDevice.id === 'responsive'
      ? '100%'
      : currentDevice.width

    const previewHeight = currentDevice.id === 'responsive'
      ? 400
      : currentDevice.height

    return (
      <div
        className={cn(
          'border-2 border-dashed border-muted rounded-lg bg-background',
          'overflow-auto transition-all duration-200',
          showGrid && 'bg-grid',
          'flex items-center justify-center'
        )}
        style={{
          width: typeof previewWidth === 'number' ? `${previewWidth}px` : previewWidth,
          height: typeof previewHeight === 'number' ? `${previewHeight}px` : previewHeight,
          minHeight: '200px'
        }}
      >
        <div
          className={cn(
            'p-4 rounded-md border transition-all duration-200',
            cssClassNames
          )}
          style={inlineStyles}
        >
          <div className="text-center">
            <div className="text-lg font-medium mb-2">
              {component.name}
            </div>
            <div className="text-sm text-muted-foreground">
              样式预览区域
            </div>
            {currentDevice.id !== 'responsive' && (
              <div className="text-xs text-muted-foreground mt-2">
                {currentDevice.width} × {currentDevice.height}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-sm text-muted-foreground">加载预览...</div>
      </div>
    )
  }

  return (
    <div className={cn('style-preview flex flex-col h-full', className)}>
      {/* 工具栏 */}
      {renderToolbar()}

      {/* 预览区域 */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="flex flex-col items-center space-y-4">
          {/* 组件信息 */}
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">预览组件:</h3>
            <Badge variant="outline" className="text-xs">
              {component.name}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {component.category}
            </Badge>
          </div>

          {/* 预览内容 */}
          {renderPreviewContent()}

          {/* 样式信息 */}
          {renderStyleInfo()}
        </div>
      </div>
    </div>
  )
}

export default StylePreview