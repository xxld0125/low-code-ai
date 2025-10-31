/**
 * 响应式预览组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 任务: T134 - 添加响应式预览功能
 * 创建日期: 2025-10-31
 */

import React, { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { Monitor, Tablet, Smartphone, RotateCcw, Maximize2, Minimize2 } from 'lucide-react'
import { Breakpoint, BREAKPOINTS, BREAKPOINT_ORDER } from '@/lib/lowcode/responsive/breakpoints'
import { useResponsive, useResponsiveValue } from '@/hooks/useResponsive'

export interface ResponsivePreviewProps {
  // 预览内容
  children: React.ReactNode
  previewTitle?: string

  // 尺寸控制
  showSizeControls?: boolean
  showBreakpointControls?: boolean
  allowCustomWidth?: boolean

  // 断点配置
  breakpoints?: Breakpoint[]
  defaultBreakpoint?: Breakpoint

  // 样式配置
  containerClassName?: string
  previewAreaClassName?: string
  showDeviceFrame?: boolean

  // 回调
  onBreakpointChange?: (breakpoint: Breakpoint) => void
  onSizeChange?: (width: number, height: number) => void
}

// 设备预设配置
const DEVICE_PRESETS = {
  mobile: {
    name: 'iPhone 14',
    width: 390,
    height: 844,
    breakpoint: 'mobile' as Breakpoint,
  },
  'mobile-landscape': {
    name: 'iPhone 14 横屏',
    width: 844,
    height: 390,
    breakpoint: 'mobile' as Breakpoint,
  },
  tablet: {
    name: 'iPad Air',
    width: 820,
    height: 1180,
    breakpoint: 'tablet' as Breakpoint,
  },
  'tablet-landscape': {
    name: 'iPad Air 横屏',
    width: 1180,
    height: 820,
    breakpoint: 'tablet' as Breakpoint,
  },
  desktop: {
    name: 'MacBook Pro',
    width: 1440,
    height: 900,
    breakpoint: 'desktop' as Breakpoint,
  },
} as const

export const ResponsivePreview: React.FC<ResponsivePreviewProps> = ({
  children,
  previewTitle = '响应式预览',
  showSizeControls = true,
  showBreakpointControls = true,
  allowCustomWidth = true,
  breakpoints = ['mobile', 'tablet', 'desktop'],
  defaultBreakpoint = 'desktop',
  containerClassName,
  previewAreaClassName,
  showDeviceFrame = true,
  onBreakpointChange,
  onSizeChange,
}) => {
  const { currentBreakpoint, isBreakpoint, getValue, adapter } = useResponsive({
    fallbackBreakpoint: defaultBreakpoint,
  })

  const [selectedPreset, setSelectedPreset] = useState<keyof typeof DEVICE_PRESETS | 'custom'>(
    'desktop'
  )
  const [customWidth, setCustomWidth] = useState(1440)
  const [customHeight, setCustomHeight] = useState(900)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showRulers, setShowRulers] = useState(true)
  const [showOverlay, setShowOverlay] = useState(true)

  const previewAreaRef = useRef<HTMLDivElement>(null)

  // 获取当前预览尺寸
  const getCurrentDimensions = useCallback(() => {
    if (selectedPreset === 'custom') {
      return { width: customWidth, height: customHeight }
    }
    const preset = DEVICE_PRESETS[selectedPreset]
    return { width: preset.width, height: preset.height }
  }, [selectedPreset, customWidth, customHeight])

  const { width, height } = getCurrentDimensions()

  // 计算当前断点的实际宽度范围
  const getBreakpointRange = (breakpoint: Breakpoint) => {
    const config = BREAKPOINTS[breakpoint]
    if (config.max === Infinity) {
      return `${config.min}px+`
    }
    return `${config.min}px - ${config.max}px`
  }

  // 设置预设设备
  const setPreset = useCallback(
    (preset: keyof typeof DEVICE_PRESETS | 'custom') => {
      setSelectedPreset(preset)
      if (preset !== 'custom') {
        const device = DEVICE_PRESETS[preset]
        onSizeChange?.(device.width, device.height)
        onBreakpointChange?.(device.breakpoint)
      }
    },
    [onSizeChange, onBreakpointChange]
  )

  // 切换全屏模式
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  // 重置到默认状态
  const resetToDefault = useCallback(() => {
    setPreset('desktop')
    setIsFullscreen(false)
    setShowRulers(true)
    setShowOverlay(true)
  }, [setPreset])

  // 获取设备图标
  const getDeviceIcon = (preset: string) => {
    switch (preset) {
      case 'mobile':
      case 'mobile-landscape':
        return <Smartphone className="h-4 w-4" />
      case 'tablet':
      case 'tablet-landscape':
        return <Tablet className="h-4 w-4" />
      case 'desktop':
        return <Monitor className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  // 获取当前设备的断点信息
  const getCurrentDeviceBreakpoint = () => {
    if (selectedPreset === 'custom') {
      return currentBreakpoint
    }
    return DEVICE_PRESETS[selectedPreset].breakpoint
  }

  const deviceBreakpoint = getCurrentDeviceBreakpoint()

  return (
    <div className={cn('responsive-preview flex h-full flex-col', containerClassName)}>
      {/* 控制栏 */}
      <Card className="rounded-b-none border-b">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">{previewTitle}</CardTitle>
              <Badge variant={isBreakpoint(deviceBreakpoint) ? 'default' : 'secondary'}>
                {deviceBreakpoint}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {width} × {height}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {showSizeControls && (
                <>
                  <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetToDefault}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    重置
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* 设备选择器 */}
          {showSizeControls && (
            <div className="mt-3 flex items-center gap-4">
              <Label>设备:</Label>
              <Select value={selectedPreset} onValueChange={value => setPreset(value as any)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DEVICE_PRESETS).map(([key, preset]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(key)}
                        <div>
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {preset.width} × {preset.height} ({preset.breakpoint})
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                  {allowCustomWidth && (
                    <SelectItem value="custom">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        <div>
                          <div className="font-medium">自定义尺寸</div>
                          <div className="text-xs text-muted-foreground">
                            {customWidth} × {customHeight}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              {/* 自定义尺寸控制 */}
              {selectedPreset === 'custom' && allowCustomWidth && (
                <div className="flex items-center gap-4">
                  <Label className="min-w-16">宽度:</Label>
                  <div className="flex min-w-32 items-center gap-2">
                    <Slider
                      value={[customWidth]}
                      onValueChange={([value]) => {
                        setCustomWidth(value)
                        onSizeChange?.(value, customHeight)
                      }}
                      min={320}
                      max={1920}
                      step={10}
                      className="flex-1"
                    />
                    <span className="w-12 text-right text-sm text-muted-foreground">
                      {customWidth}
                    </span>
                  </div>

                  <Label className="min-w-16">高度:</Label>
                  <div className="flex min-w-32 items-center gap-2">
                    <Slider
                      value={[customHeight]}
                      onValueChange={([value]) => {
                        setCustomHeight(value)
                        onSizeChange?.(customWidth, value)
                      }}
                      min={480}
                      max={1200}
                      step={10}
                      className="flex-1"
                    />
                    <span className="w-12 text-right text-sm text-muted-foreground">
                      {customHeight}
                    </span>
                  </div>
                </div>
              )}

              {/* 显示选项 */}
              <div className="ml-auto flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={showRulers} onCheckedChange={setShowRulers} id="show-rulers" />
                  <Label htmlFor="show-rulers" className="text-sm">
                    标尺
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={showOverlay}
                    onCheckedChange={setShowOverlay}
                    id="show-overlay"
                  />
                  <Label htmlFor="show-overlay" className="text-sm">
                    信息层
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={showDeviceFrame}
                    onCheckedChange={checked => {
                      // 这里可以通过props传递状态变化
                    }}
                    id="show-frame"
                  />
                  <Label htmlFor="show-frame" className="text-sm">
                    设备边框
                  </Label>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* 断点信息栏 */}
      {showBreakpointControls && (
        <div className="border-b bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {BREAKPOINT_ORDER.map(bp => (
                <div
                  key={bp}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-md px-3 py-1 transition-colors',
                    isBreakpoint(bp)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 hover:bg-muted'
                  )}
                  onClick={() => {
                    // 模拟断点切换
                    onBreakpointChange?.(bp)
                  }}
                >
                  <div className="h-2 w-2 rounded-full" />
                  <div className="text-sm font-medium">{bp}</div>
                  <div className="text-xs opacity-70">{getBreakpointRange(bp)}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>当前断点:</span>
              <Badge variant="outline">{deviceBreakpoint}</Badge>
              <span>屏幕宽度:</span>
              <Badge variant="outline">{width}px</Badge>
            </div>
          </div>
        </div>
      )}

      {/* 预览区域 */}
      <div className={cn('relative flex-1 overflow-auto bg-background', previewAreaClassName)}>
        {/* 标尺 */}
        {showRulers && !isFullscreen && (
          <>
            {/* 水平标尺 */}
            <div className="absolute left-0 right-0 top-0 flex h-6 items-center border-b bg-border">
              <div className="flex flex-1 items-center px-2 text-xs text-muted-foreground">
                {Array.from({ length: Math.ceil(width / 100) + 1 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute h-4 border-l border-gray-300"
                    style={{ left: `${i * 100}px` }}
                  >
                    <span className="absolute -top-4 left-0 text-xs">{i * 100}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 垂直标尺 */}
            <div className="absolute bottom-0 left-0 top-0 flex w-6 items-center border-r bg-border">
              <div className="flex flex-1 flex-col items-start py-2 text-xs text-muted-foreground">
                {Array.from({ length: Math.ceil(height / 100) + 1 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute w-4 border-t border-gray-300"
                    style={{ top: `${i * 100}px` }}
                  >
                    <span className="absolute -left-8 top-0 text-xs">{i * 100}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 预览内容容器 */}
        <div
          ref={previewAreaRef}
          className={cn(
            'flex items-center justify-center p-8',
            showRulers && !isFullscreen && 'ml-6 mt-6',
            isFullscreen && 'p-0'
          )}
          style={{
            minHeight: isFullscreen ? '100vh' : 'calc(100vh - 200px)',
          }}
        >
          {/* 设备边框 */}
          {showDeviceFrame && selectedPreset !== 'custom' && !isFullscreen && (
            <div
              className="relative rounded-lg border-2 border-gray-300 bg-white shadow-lg"
              style={{
                width: `${width}px`,
                height: `${height}px`,
                transform: 'scale(0.8)',
                transformOrigin: 'center',
              }}
            >
              {/* 设备屏幕 */}
              <div className="absolute inset-2 overflow-hidden rounded border border-gray-200">
                {children}
              </div>

              {/* 设备装饰 */}
              {selectedPreset.includes('mobile') && (
                <div className="absolute left-1/2 top-4 h-1 w-20 -translate-x-1/2 transform rounded-full bg-black" />
              )}
            </div>
          )}

          {/* 直接显示内容（无边框或自定义尺寸） */}
          {(!showDeviceFrame || selectedPreset === 'custom' || isFullscreen) && (
            <div
              className={cn(
                'overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg',
                isFullscreen && 'h-full w-full rounded-none border-0 shadow-none'
              )}
              style={{
                width: isFullscreen ? '100%' : `${width}px`,
                height: isFullscreen ? '100%' : `${height}px`,
                maxWidth: '100%',
              }}
            >
              {children}
            </div>
          )}
        </div>

        {/* 信息层 */}
        {showOverlay && !isFullscreen && (
          <div className="absolute bottom-4 right-4 rounded-lg bg-black/80 p-3 text-xs text-white">
            <div className="space-y-1">
              <div>
                设备: {selectedPreset === 'custom' ? '自定义' : DEVICE_PRESETS[selectedPreset].name}
              </div>
              <div>
                尺寸: {width} × {height}px
              </div>
              <div>断点: {deviceBreakpoint}</div>
              <div>像素比: {window.devicePixelRatio || 1}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResponsivePreview
