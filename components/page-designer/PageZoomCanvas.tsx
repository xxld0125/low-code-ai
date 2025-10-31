'use client'

import React, { useRef, useCallback, useEffect, useMemo } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { useZoomStore } from '@/stores/page-designer/zoom-store'
import { cn } from '@/lib/utils'

interface PageZoomCanvasProps {
  children: React.ReactNode
  className?: string
  onZoomChange?: (zoom: number) => void
  onPanChange?: (pan: { x: number; y: number }) => void
  enableWheel?: boolean
  enableTouch?: boolean
  enableDoubleClick?: boolean
  minZoom?: number
  maxZoom?: number
  initialZoom?: number
  initialPan?: { x: number; y: number }
}

/**
 * 页面设计器缩放画布组件
 * 基于react-zoom-pan-pinch库实现画布缩放和平移功能
 */
export function PageZoomCanvas({
  children,
  className,
  onZoomChange,
  onPanChange,
  enableWheel = true,
  enableTouch = true,
  enableDoubleClick = true,
  minZoom = 0.1,
  maxZoom = 3,
  initialZoom = 1,
  initialPan = { x: 0, y: 0 },
}: PageZoomCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    zoom,
    pan,
    setZoom,
    setPan,
    zoomToFit,
    centerContent,
    screenToCanvas,
    canvasToScreen,
    getVisibleArea,
  } = useZoomStore()

  // 处理缩放变化
  const handleZoomChange = useCallback(
    (zoomState: any) => {
      const newZoom = zoomState.state.scale
      setZoom(newZoom)
      onZoomChange?.(newZoom)
    },
    [setZoom, onZoomChange]
  )

  // 处理平移变化
  const handlePanChange = useCallback(
    (panState: any) => {
      const newPan = {
        x: panState.state.positionX,
        y: panState.state.positionY,
      }
      setPan(newPan)
      onPanChange?.(newPan)
    },
    [setPan, onPanChange]
  )

  // 处理双击缩放
  const handleDoubleClick = useCallback(
    (event: any) => {
      if (!enableDoubleClick) return

      // 获取双击位置的画布坐标
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const clickPoint = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }

      // 计算画布坐标
      const canvasPoint = screenToCanvas(clickPoint)

      // 以双击点为中心进行缩放
      setZoom(zoom >= 1.5 ? 1 : 1.5, canvasPoint)
    },
    [enableDoubleClick, zoom, setZoom, screenToCanvas]
  )

  // 处理键盘快捷键
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + 滚轮缩放
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '=':
          case '+':
            event.preventDefault()
            setZoom(zoom + 0.1)
            break
          case '-':
            event.preventDefault()
            setZoom(zoom - 0.1)
            break
          case '0':
            event.preventDefault()
            setZoom(1)
            centerContent()
            break
        }
      }

      // 空格键 + 拖拽平移
      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault()
        // 这里可以启用空格键拖拽模式
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        // 这里可以禁用空格键拖拽模式
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [zoom, setZoom, centerContent])

  // 初始化工具栏按钮功能
  const toolbarControls = useMemo(
    () => ({
      zoomIn: () => setZoom(zoom + 0.1),
      zoomOut: () => setZoom(zoom - 0.1),
      reset: () => {
        setZoom(1)
        centerContent()
      },
      fit: zoomToFit,
    }),
    [zoom, setZoom, centerContent, zoomToFit]
  )

  // 暴露工具栏控制给外部使用
  useEffect(() => {
    // 将控制函数绑定到全局，供工具栏使用
    ;(window as any).pageZoomControls = toolbarControls
    return () => {
      delete (window as any).pageZoomControls
    }
  }, [toolbarControls])

  return (
    <div
      ref={containerRef}
      className={cn('relative h-full w-full overflow-hidden', className)}
      onDoubleClick={handleDoubleClick}
    >
      <TransformWrapper
        initialScale={initialZoom}
        initialPositionX={initialPan.x}
        initialPositionY={initialPan.y}
        minScale={minZoom}
        maxScale={maxZoom}
        wheel={{ step: 0.1, smoothStep: 0.002 }}
        doubleClick={{ disabled: !enableDoubleClick }}
        pinch={{ step: 0.1 }}
        onTransformed={handleZoomChange}
        onPanning={handlePanChange}
        limitToBounds={false}
        centerOnInit={false}
        panning={{
          disabled: false,
          velocityDisabled: true,
          wheelPanning: false,
        }}
      >
        <TransformComponent
          wrapperStyle={{
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
          contentStyle={{
            width: '100%',
            height: '100%',
            transformOrigin: 'center center',
          }}
        >
          <div
            className="absolute"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {children}
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* 缩放信息显示 */}
      <div className="absolute bottom-4 right-4 rounded-md border bg-background/80 px-3 py-2 text-sm text-gray-600 backdrop-blur-sm">
        <div>缩放: {Math.round(zoom * 100)}%</div>
        <div>
          位置: ({Math.round(pan.x)}, {Math.round(pan.y)})
        </div>
      </div>
    </div>
  )
}

export default PageZoomCanvas
