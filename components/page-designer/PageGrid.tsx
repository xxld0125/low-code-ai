'use client'

import React, { useMemo, useCallback } from 'react'
import { useZoomStore } from '@/stores/page-designer/zoom-store'
import { cn } from '@/lib/utils'

interface PageGridProps {
  className?: string
  showGrid?: boolean
  gridSize?: number
  gridColor?: string
  majorGridColor?: string
  majorGridInterval?: number
  showRulers?: boolean
  rulerColor?: string
  rulerTextColor?: string
  rulerSize?: number
  canvasSize?: { width: number; height: number }
  onGridSizeChange?: (size: number) => void
  onToggleGrid?: (show: boolean) => void
}

/**
 * 页面设计器网格组件
 * 提供背景网格、标尺显示和网格对齐功能
 */
export function PageGrid({
  className,
  showGrid = true,
  gridSize = 8,
  gridColor = 'rgba(0, 0, 0, 0.1)',
  majorGridColor = 'rgba(0, 0, 0, 0.2)',
  majorGridInterval = 10, // 每10个网格线显示一条主网格线
  showRulers = true,
  rulerColor = 'rgba(0, 0, 0, 0.8)',
  rulerTextColor = 'rgba(0, 0, 0, 0.7)',
  rulerSize = 20,
  canvasSize = { width: 1200, height: 800 },
  onGridSizeChange,
  onToggleGrid,
}: PageGridProps) {
  const { zoom, pan } = useZoomStore()

  // 计算网格线的位置
  const gridLines = useMemo(() => {
    if (!showGrid) return { vertical: [], horizontal: [] }

    // 计算可见区域
    const visibleLeft = -pan.x / zoom
    const visibleTop = -pan.y / zoom
    const visibleRight = (-pan.x + window.innerWidth) / zoom
    const visibleBottom = (-pan.y + window.innerHeight) / zoom

    // 计算网格线范围
    const startGridX = Math.floor(visibleLeft / gridSize) * gridSize
    const endGridX = Math.ceil(visibleRight / gridSize) * gridSize
    const startGridY = Math.floor(visibleTop / gridSize) * gridSize
    const endGridY = Math.ceil(visibleBottom / gridSize) * gridSize

    const vertical: Array<{ position: number; isMajor: boolean }> = []
    const horizontal: Array<{ position: number; isMajor: boolean }> = []

    // 生成垂直网格线
    for (let x = startGridX; x <= endGridX; x += gridSize) {
      const gridIndex = Math.round(x / gridSize)
      const isMajor = gridIndex % majorGridInterval === 0

      // 只在画布范围内显示网格线
      if (x >= 0 && x <= canvasSize.width) {
        vertical.push({ position: x, isMajor })
      }
    }

    // 生成水平网格线
    for (let y = startGridY; y <= endGridY; y += gridSize) {
      const gridIndex = Math.round(y / gridSize)
      const isMajor = gridIndex % majorGridInterval === 0

      // 只在画布范围内显示网格线
      if (y >= 0 && y <= canvasSize.height) {
        horizontal.push({ position: y, isMajor })
      }
    }

    return { vertical, horizontal }
  }, [showGrid, gridSize, zoom, pan, majorGridInterval, canvasSize.width, canvasSize.height])

  // 转换画布坐标到屏幕坐标
  const canvasToScreenX = useCallback(
    (x: number) => {
      return x * zoom + pan.x
    },
    [zoom, pan.x]
  )

  const canvasToScreenY = useCallback(
    (y: number) => {
      return y * zoom + pan.y
    },
    [zoom, pan.y]
  )

  // 计算标尺刻度
  const rulerMarks = useMemo(() => {
    if (!showRulers) return { horizontal: [], vertical: [] }

    // 根据缩放级别调整刻度间隔
    let markInterval = gridSize
    let textInterval = majorGridInterval * gridSize

    if (zoom < 0.5) {
      markInterval = gridSize * 4
      textInterval = markInterval * 4
    } else if (zoom < 1) {
      markInterval = gridSize * 2
      textInterval = markInterval * 4
    } else if (zoom > 2) {
      markInterval = gridSize
      textInterval = markInterval * 2
    }

    // 计算可见范围内的刻度
    const visibleLeft = -pan.x / zoom
    const visibleTop = -pan.y / zoom
    const visibleRight = (-pan.x + window.innerWidth) / zoom
    const visibleBottom = (-pan.y + window.innerHeight) / zoom

    const startMarkX = Math.floor(visibleLeft / markInterval) * markInterval
    const endMarkX = Math.ceil(visibleRight / markInterval) * markInterval
    const startMarkY = Math.floor(visibleTop / markInterval) * markInterval
    const endMarkY = Math.ceil(visibleBottom / markInterval) * markInterval

    const horizontal: Array<{ position: number; value: number; showText: boolean }> = []
    const vertical: Array<{ position: number; value: number; showText: boolean }> = []

    // 水平标尺刻度（顶部）
    for (let x = startMarkX; x <= endMarkX; x += markInterval) {
      const showText = x % textInterval === 0 && x >= 0 && x <= canvasSize.width
      horizontal.push({
        position: x,
        value: Math.round(x),
        showText,
      })
    }

    // 垂直标尺刻度（左侧）
    for (let y = startMarkY; y <= endMarkY; y += markInterval) {
      const showText = y % textInterval === 0 && y >= 0 && y <= canvasSize.height
      vertical.push({
        position: y,
        value: Math.round(y),
        showText,
      })
    }

    return { horizontal, vertical }
  }, [showRulers, gridSize, zoom, pan, majorGridInterval, canvasSize.width, canvasSize.height])

  if (!showGrid) {
    return null
  }

  return (
    <div className={cn('pointer-events-none absolute inset-0', className)}>
      <svg
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        {/* 渲染网格线 */}
        {gridLines.vertical.map((line, index) => (
          <line
            key={`vertical-${index}`}
            x1={canvasToScreenX(line.position)}
            y1={0}
            x2={canvasToScreenX(line.position)}
            y2={canvasToScreenY(canvasSize.height)}
            stroke={line.isMajor ? majorGridColor : gridColor}
            strokeWidth={line.isMajor ? 1 : 0.5}
            opacity={line.isMajor ? 0.8 : 0.4}
          />
        ))}

        {gridLines.horizontal.map((line, index) => (
          <line
            key={`horizontal-${index}`}
            x1={0}
            y1={canvasToScreenY(line.position)}
            x2={canvasToScreenX(canvasSize.width)}
            y2={canvasToScreenY(line.position)}
            stroke={line.isMajor ? majorGridColor : gridColor}
            strokeWidth={line.isMajor ? 1 : 0.5}
            opacity={line.isMajor ? 0.8 : 0.4}
          />
        ))}

        {/* 渲染画布边界 */}
        <rect
          x={canvasToScreenX(0)}
          y={canvasToScreenY(0)}
          width={canvasSize.width * zoom}
          height={canvasSize.height * zoom}
          fill="none"
          stroke="rgba(0, 0, 0, 0.3)"
          strokeWidth={1}
          strokeDasharray="5,5"
        />
      </svg>

      {/* 水平标尺 */}
      {showRulers && (
        <div
          className="absolute left-0 right-0 top-0 border-b border-gray-300 bg-white"
          style={{ height: rulerSize }}
        >
          <svg
            className="h-full w-full"
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            {rulerMarks.horizontal.map((mark, index) => (
              <g key={`ruler-h-${index}`}>
                <line
                  x1={canvasToScreenX(mark.position)}
                  y1={rulerSize - 8}
                  x2={canvasToScreenX(mark.position)}
                  y2={rulerSize}
                  stroke={rulerColor}
                  strokeWidth={1}
                />
                {mark.showText && (
                  <text
                    x={canvasToScreenX(mark.position)}
                    y={rulerSize - 10}
                    textAnchor="middle"
                    fontSize="10"
                    fill={rulerTextColor}
                    fontFamily="monospace"
                  >
                    {mark.value}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* 垂直标尺 */}
      {showRulers && (
        <div
          className="absolute bottom-0 left-0 top-0 border-r border-gray-300 bg-white"
          style={{ width: rulerSize }}
        >
          <svg
            className="h-full w-full"
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            {rulerMarks.vertical.map((mark, index) => (
              <g key={`ruler-v-${index}`}>
                <line
                  x1={rulerSize - 8}
                  y1={canvasToScreenY(mark.position)}
                  x2={rulerSize}
                  y2={canvasToScreenY(mark.position)}
                  stroke={rulerColor}
                  strokeWidth={1}
                />
                {mark.showText && (
                  <text
                    x={rulerSize - 10}
                    y={canvasToScreenY(mark.position) + 3}
                    textAnchor="end"
                    fontSize="10"
                    fill={rulerTextColor}
                    fontFamily="monospace"
                  >
                    {mark.value}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* 左上角标尺交叉区域 */}
      {showRulers && (
        <div
          className="absolute left-0 top-0 border-b border-r border-gray-300 bg-white"
          style={{ width: rulerSize, height: rulerSize }}
        />
      )}

      {/* 网格信息显示 */}
      <div className="absolute bottom-4 left-4 rounded-md border bg-white/80 px-3 py-2 text-xs text-gray-600 backdrop-blur-sm">
        <div>网格: {gridSize}px</div>
        <div>缩放: {Math.round(zoom * 100)}%</div>
        <div>
          画布: {canvasSize.width} × {canvasSize.height}
        </div>
      </div>
    </div>
  )
}

export default PageGrid
