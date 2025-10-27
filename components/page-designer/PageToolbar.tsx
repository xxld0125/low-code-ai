'use client'

import { useState } from 'react'
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { usePageDesignerStore } from '@/stores/page-designer'
import { useZoomStore } from '@/stores/page-designer/zoom-store'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface PageToolbarProps {
  onZoomIn?: () => void
  onZoomOut?: () => void
  onZoomReset?: () => void
  onFitToScreen?: () => void
  className?: string
}

/**
 * 页面设计器工具栏
 * 提供画布缩放控制和其他常用工具
 */
export function PageToolbar({
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitToScreen,
  className = '',
}: PageToolbarProps) {
  const { canvas } = usePageDesignerStore()
  const { zoom, setZoom } = useZoomStore()
  const [showZoomSlider, setShowZoomSlider] = useState(false)

  // 缩放级别范围：25% - 400%
  const minZoom = 25
  const maxZoom = 400
  const zoomStep = 25

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + zoomStep, maxZoom)
    setZoom(newZoom)
    onZoomIn?.()
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - zoomStep, minZoom)
    setZoom(newZoom)
    onZoomOut?.()
  }

  const handleZoomReset = () => {
    setZoom(100)
    onZoomReset?.()
  }

  const handleFitToScreen = () => {
    // 计算适合屏幕的缩放级别
    const containerWidth = window.innerWidth - 320 // 减去左右面板宽度
    const optimalZoom = Math.floor((containerWidth / canvas?.canvasWidth) * 100)
    const fittedZoom = Math.max(minZoom, Math.min(optimalZoom, maxZoom))
    setZoom(fittedZoom)
    onFitToScreen?.()
  }

  const handleSliderChange = (value: number[]) => {
    const newZoom = value[0]
    setZoom(newZoom)
  }

  const formatZoomLabel = (value: number) => `${value}%`

  return (
    <TooltipProvider>
      <div
        className={`flex items-center gap-2 border-b border-border bg-background p-2 ${className}`}
      >
        {/* 左侧：缩放控制 */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= minZoom}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>缩小 (Ctrl -)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= maxZoom}
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>放大 (Ctrl +)</p>
            </TooltipContent>
          </Tooltip>

          {/* 缩放滑块 */}
          <div
            className="relative"
            onMouseEnter={() => setShowZoomSlider(true)}
            onMouseLeave={() => setShowZoomSlider(false)}
          >
            <Button variant="outline" size="sm" className="h-8 min-w-16 font-mono text-xs">
              {formatZoomLabel(zoom)}
            </Button>

            {showZoomSlider && (
              <div className="absolute bottom-full left-0 z-50 mb-2 rounded-md border border-border bg-background p-3 shadow-lg">
                <div className="w-48">
                  <Slider
                    value={[zoom]}
                    onValueChange={handleSliderChange}
                    min={minZoom}
                    max={maxZoom}
                    step={zoomStep}
                    className="w-full"
                  />
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>{minZoom}%</span>
                    <span>{maxZoom}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomReset}
                disabled={zoom === 100}
                className="h-8 w-8 p-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>重置缩放 (Ctrl 0)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleFitToScreen} className="h-8 w-8 p-0">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>适应屏幕</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* 分隔线 */}
        <div className="h-6 w-px bg-border" />

        {/* 中间：画布信息 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>画布: {canvas?.canvasWidth}px</span>
          <span>缩放: {formatZoomLabel(zoom)}</span>
        </div>

        {/* 右侧：工具按钮（预留） */}
        <div className="flex flex-1 justify-end">
          {/* 可以添加其他工具按钮，如网格显示、对齐辅助线开关等 */}
        </div>
      </div>
    </TooltipProvider>
  )
}

export default PageToolbar
