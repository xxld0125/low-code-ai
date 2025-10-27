'use client'

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { useZoomStore } from '@/stores/page-designer/zoom-store'
import { usePageDesignerStore } from '@/stores/page-designer'
import { cn } from '@/lib/utils'

interface ViewportInfo {
  x: number
  y: number
  width: number
  height: number
}

interface PageMiniMapProps {
  className?: string
  width?: number
  height?: number
  showMinimap?: boolean
  minimapBackground?: string
  viewportColor?: string
  viewportBorderColor?: string
  componentColor?: string
  selectedComponentColor?: string
  canvasSize?: { width: number; height: number }
  onViewportChange?: (viewport: ViewportInfo) => void
  onToggleMinimap?: (show: boolean) => void
}

/**
 * 页面设计器小地图导航组件
 * 提供画布的全局视图和快速导航功能
 */
export function PageMiniMap({
  className,
  width = 200,
  height = 150,
  showMinimap = true,
  minimapBackground = 'rgba(248, 249, 250, 0.95)',
  viewportColor = 'rgba(59, 130, 246, 0.3)',
  viewportBorderColor = 'rgb(59, 130, 246)',
  componentColor = 'rgba(156, 163, 175, 0.6)',
  selectedComponentColor = 'rgba(239, 68, 68, 0.8)',
  canvasSize,
  onViewportChange,
  onToggleMinimap,
}: PageMiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const { zoom, pan, viewportSize } = useZoomStore()
  const { components, selectionState } = usePageDesignerStore()

  // 计算缩放比例（小地图中的缩放）
  const minimapScale = Math.min(
    (width - 20) / (canvasSize?.width || 1200),
    (height - 20) / (canvasSize?.height || 800)
  )

  // 计算小地图中的画布尺寸
  const minimapCanvasSize = useMemo(
    () => ({
      width: (canvasSize?.width || 1200) * minimapScale,
      height: (canvasSize?.height || 800) * minimapScale,
    }),
    [canvasSize, minimapScale]
  )

  // 计算当前视口在小地图中的位置和尺寸
  const viewportInMinimap = useCallback((): ViewportInfo => {
    const viewportX = (-pan.x / zoom) * minimapScale
    const viewportY = (-pan.y / zoom) * minimapScale
    const viewportWidth = (viewportSize.width / zoom) * minimapScale
    const viewportHeight = (viewportSize.height / zoom) * minimapScale

    return {
      x: viewportX,
      y: viewportY,
      width: viewportWidth,
      height: viewportHeight,
    }
  }, [pan, zoom, viewportSize, minimapScale])

  // 绘制小地图
  const drawMinimap = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布
    ctx.clearRect(0, 0, width, height)

    // 绘制背景
    ctx.fillStyle = minimapBackground
    ctx.fillRect(0, 0, width, height)

    // 计算偏移量以居中画布
    const offsetX = (width - minimapCanvasSize.width) / 2
    const offsetY = (height - minimapCanvasSize.height) / 2

    // 绘制画布背景
    ctx.fillStyle = 'white'
    ctx.fillRect(offsetX, offsetY, minimapCanvasSize.width, minimapCanvasSize.height)

    // 绘制组件
    Object.values(components).forEach((component: any) => {
      const position = component.position || { x: 0, y: 0 }
      const size = component.size || { width: 100, height: 50 }

      const componentX = position.x * minimapScale + offsetX
      const componentY = position.y * minimapScale + offsetY
      const componentWidth = size.width * minimapScale
      const componentHeight = size.height * minimapScale

      // 跳过太小的组件
      if (componentWidth < 2 || componentHeight < 2) return

      // 设置组件颜色
      const isSelected = selectionState?.selectedComponentIds?.includes(component.id)
      ctx.fillStyle = isSelected ? selectedComponentColor : componentColor

      // 绘制组件矩形
      ctx.fillRect(componentX, componentY, componentWidth, componentHeight)

      // 绘制组件边框
      ctx.strokeStyle = isSelected ? 'rgb(239, 68, 68)' : 'rgba(156, 163, 175, 0.8)'
      ctx.lineWidth = isSelected ? 1 : 0.5
      ctx.strokeRect(componentX, componentY, componentWidth, componentHeight)
    })

    // 绘制视口矩形
    const viewport = viewportInMinimap()
    ctx.fillStyle = viewportColor
    ctx.fillRect(viewport.x + offsetX, viewport.y + offsetY, viewport.width, viewport.height)

    // 绘制视口边框
    ctx.strokeStyle = viewportBorderColor
    ctx.lineWidth = 2
    ctx.strokeRect(viewport.x + offsetX, viewport.y + offsetY, viewport.width, viewport.height)

    // 绘制视口中心指示器
    const centerX = viewport.x + viewport.width / 2 + offsetX
    const centerY = viewport.y + viewport.height / 2 + offsetY

    ctx.beginPath()
    ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI)
    ctx.fillStyle = viewportBorderColor
    ctx.fill()
  }, [
    width,
    height,
    minimapBackground,
    minimapCanvasSize,
    minimapScale,
    components,
    selectionState,
    componentColor,
    selectedComponentColor,
    viewportColor,
    viewportBorderColor,
    viewportInMinimap,
  ])

  // 处理鼠标事件
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    setIsDragging(true)
    setDragStart({ x, y })
  }, [])

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging) return

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const viewport = viewportInMinimap()
      const offsetX = (width - minimapCanvasSize.width) / 2
      const offsetY = (height - minimapCanvasSize.height) / 2

      // 计算新的视口中心位置
      const newViewportCenterX = ((x - offsetX) / minimapScale) * zoom
      const newViewportCenterY = ((y - offsetY) / minimapScale) * zoom

      // 计算新的平移偏移
      const newPanX = -(newViewportCenterX - viewportSize.width / 2)
      const newPanY = -(newViewportCenterY - viewportSize.height / 2)

      // 更新平移状态
      const { setPan } = useZoomStore.getState()
      setPan({ x: newPanX, y: newPanY })

      onViewportChange?.({
        x: (x - offsetX) / minimapScale,
        y: (y - offsetY) / minimapScale,
        width: viewport.width / minimapScale,
        height: viewport.height / minimapScale,
      })
    },
    [
      isDragging,
      viewportInMinimap,
      width,
      height,
      minimapCanvasSize,
      minimapScale,
      zoom,
      viewportSize,
      onViewportChange,
    ]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // 处理双击跳转
  const handleDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const offsetX = (width - minimapCanvasSize.width) / 2
      const offsetY = (height - minimapCanvasSize.height) / 2

      // 计算点击位置的画布坐标
      const canvasX = (x - offsetX) / minimapScale
      const canvasY = (y - offsetY) / minimapScale

      // 跳转到该位置
      const { setPan, zoomToFit } = useZoomStore.getState()

      // 居中于点击位置
      const newPanX = -(canvasX * zoom - viewportSize.width / 2)
      const newPanY = -(canvasY * zoom - viewportSize.height / 2)

      setPan({ x: newPanX, y: newPanY })
    },
    [width, height, minimapCanvasSize, minimapScale, zoom, viewportSize]
  )

  // 监听状态变化并重绘
  useEffect(() => {
    drawMinimap()
  }, [drawMinimap])

  // 全局鼠标事件监听
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [])

  if (!showMinimap) {
    return null
  }

  return (
    <div
      className={cn(
        'absolute bottom-4 right-4 rounded-lg border border-gray-200 bg-white shadow-lg',
        className
      )}
      style={{ width, height }}
    >
      {/* 小地图标题 */}
      <div className="flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-gray-50 px-2 py-1">
        <span className="text-xs font-medium text-gray-700">导航地图</span>
        <button
          onClick={() => onToggleMinimap?.(false)}
          className="text-gray-400 transition-colors hover:text-gray-600"
          title="关闭小地图"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* 小地图画布 */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={width}
          height={height - 30} // 减去标题高度
          className={cn('cursor-crosshair', isDragging && 'cursor-grabbing')}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        />

        {/* 缩放信息 */}
        <div className="absolute left-1 top-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
          {Math.round(zoom * 100)}%
        </div>

        {/* 组件计数 */}
        <div className="absolute right-1 top-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
          {Object.keys(components).length} 个组件
        </div>
      </div>

      {/* 工具按钮 */}
      <div className="flex items-center justify-center gap-1 rounded-b-lg border-t border-gray-200 bg-gray-50 px-2 py-1">
        <button
          onClick={() => {
            const { zoomToFit } = useZoomStore.getState()
            zoomToFit()
          }}
          className="rounded p-1 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800"
          title="适应画布"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>

        <button
          onClick={() => {
            const { resetZoom, centerContent } = useZoomStore.getState()
            resetZoom()
            centerContent()
          }}
          className="rounded p-1 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800"
          title="重置视图"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default PageMiniMap
