'use client'

import React, { useRef, useCallback, useEffect, useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { useZoomStore } from '@/stores/page-designer/zoom-store'
import { usePageDesignerStore } from '@/stores/page-designer'
import { calculateAlignment, getComponentRect } from '@/lib/page-designer/alignment'
import PageToolbar from './PageToolbar'
import PageGrid from './PageGrid'
import PageAlignmentGuides from './PageAlignmentGuides'
import PageMiniMap from './PageMiniMap'
import { cn } from '@/lib/utils'
import type { ComponentBounds } from '@/types/page-designer'

interface PageDesignerCanvasProps {
  className?: string
  children: React.ReactNode
  canvasSize?: { width: number; height: number }
  enableZoom?: boolean
  enablePan?: boolean
  enableGrid?: boolean
  enableAlignmentGuides?: boolean
  enableMinimap?: boolean
  showToolbar?: boolean
  showRulers?: boolean
  gridSize?: number
  snapThreshold?: number
}

/**
 * 页面设计器主画布组件
 * 集成缩放、平移、网格、对齐辅助线和小地图导航功能
 */
export function PageDesignerCanvas({
  className,
  children,
  canvasSize = { width: 1200, height: 800 },
  enableZoom = true,
  enablePan = true,
  enableGrid = true,
  enableAlignmentGuides = true,
  enableMinimap = true,
  showToolbar = true,
  showRulers = true,
  gridSize = 8,
  snapThreshold = 8,
}: PageDesignerCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const transformRef = useRef<any>(null)
  const [draggedComponent, setDraggedComponent] = useState<ComponentBounds | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [showMinimap, setShowMinimap] = useState(true)
  const [showAlignmentGuides, setShowAlignmentGuides] = useState(true)

  const {
    zoom,
    pan,
    setZoom,
    setPan,
    zoomToFit,
    resetZoom,
    centerContent,
    screenToCanvas,
    canvasToScreen,
  } = useZoomStore()

  const { components, selectionState, updateComponent } = usePageDesignerStore()

  // 处理缩放变化
  const handleZoomChange = useCallback(
    (zoomState: any) => {
      const newZoom = zoomState.state.scale
      const newPan = {
        x: zoomState.state.positionX,
        y: zoomState.state.positionY,
      }

      setZoom(newZoom)
      setPan(newPan)
    },
    [setZoom, setPan]
  )

  // 处理拖拽开始
  const handleDragStart = useCallback(
    (componentId: string, event: React.MouseEvent | React.TouchEvent) => {
      const component = Object.values(components).find((c: any) => c.id === componentId)
      if (!component) return

      const rect = getComponentRect(component)
      const bounds: ComponentBounds = {
        id: component.id,
        left: rect.x,
        top: rect.y,
        right: rect.x + rect.width,
        bottom: rect.y + rect.height,
        centerX: rect.x + rect.width / 2,
        centerY: rect.y + rect.height / 2,
      }

      setDraggedComponent(bounds)
    },
    [components]
  )

  // 处理拖拽移动
  const handleDragMove = useCallback(
    (componentId: string, deltaX: number, deltaY: number) => {
      const component = Object.values(components).find((c: any) => c.id === componentId)
      if (!component) return

      // 获取当前位置 - 从 styles 中获取
      const currentX = (component.styles as any)?.left || 0
      const currentY = (component.styles as any)?.top || 0

      // 计算新位置
      let newX = currentX + deltaX
      let newY = currentY + deltaY

      // 应用对齐吸附
      if (enableAlignmentGuides && draggedComponent) {
        const draggedRect = getComponentRect(component)
        const otherComponents = Object.values(components).filter((c: any) => c.id !== componentId)

        const alignment = calculateAlignment(
          { ...component, styles: { ...component.styles, left: newX, top: newY } } as any,
          otherComponents,
          {
            snapThreshold,
            showWeakGuides: true,
            showStrongGuides: true,
            showCanvasGuides: true,
            canvasSize,
            gridSize,
            snapToGrid: true,
          }
        )

        newX = alignment.snappedPosition.x
        newY = alignment.snappedPosition.y
      }

      // 更新组件位置
      updateComponent(componentId, {
        styles: {
          ...component.styles,
          left: newX,
          top: newY,
        },
      })
    },
    [
      components,
      draggedComponent,
      enableAlignmentGuides,
      snapThreshold,
      canvasSize,
      gridSize,
      updateComponent,
    ]
  )

  // 处理拖拽结束
  const handleDragEnd = useCallback((componentId: string) => {
    setDraggedComponent(null)
  }, [])

  // 处理键盘快捷键
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 缩放快捷键
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '=':
          case '+':
            event.preventDefault()
            if (enableZoom) {
              const newZoom = Math.min(zoom + 0.1, 3)
              setZoom(newZoom)
            }
            break
          case '-':
            event.preventDefault()
            if (enableZoom) {
              const newZoom = Math.max(zoom - 0.1, 0.1)
              setZoom(newZoom)
            }
            break
          case '0':
            event.preventDefault()
            if (enableZoom) {
              resetZoom()
              centerContent()
            }
            break
        }
      }

      // 网格切换
      if (event.key === 'g' && event.altKey) {
        event.preventDefault()
        setShowGrid(prev => !prev)
      }

      // 对齐线切换
      if (event.key === 'l' && event.altKey) {
        event.preventDefault()
        setShowAlignmentGuides(prev => !prev)
      }

      // 小地图切换
      if (event.key === 'm' && event.altKey) {
        event.preventDefault()
        setShowMinimap(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [zoom, enableZoom, setZoom, resetZoom, centerContent])

  // 计算当前视口信息
  const viewportInfo = {
    x: -pan.x / zoom,
    y: -pan.y / zoom,
    width: window.innerWidth / zoom,
    height: window.innerHeight / zoom,
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative h-full w-full overflow-hidden bg-gray-100', className)}
    >
      {/* 工具栏 */}
      {showToolbar && (
        <PageToolbar
          onZoomIn={() => setZoom(Math.min(zoom + 0.1, 3))}
          onZoomOut={() => setZoom(Math.max(zoom - 0.1, 0.1))}
          onZoomReset={() => {
            resetZoom()
            centerContent()
          }}
          onFitToScreen={() => {
            const containerWidth = containerRef.current?.clientWidth || window.innerWidth
            const containerHeight = containerRef.current?.clientHeight || window.innerHeight

            const scaleX = (containerWidth - 200) / canvasSize.width
            const scaleY = (containerHeight - 200) / canvasSize.height
            const scale = Math.min(scaleX, scaleY, 1)

            setZoom(scale)
            centerContent()
          }}
          className="absolute left-0 right-0 top-0 z-20"
        />
      )}

      {/* 主画布容器 */}
      <div className="relative h-full w-full pt-12">
        {enableZoom ? (
          <TransformWrapper
            ref={transformRef}
            initialScale={zoom}
            initialPositionX={pan.x}
            initialPositionY={pan.y}
            minScale={0.1}
            maxScale={3}
            wheel={{ step: 0.1, smoothStep: 0.002 }}
            doubleClick={{ disabled: false }}
            pinch={{ step: 0.1 }}
            onTransformed={handleZoomChange}
            limitToBounds={false}
            centerOnInit={false}
            panning={{
              disabled: !enablePan,
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
              {/* 网格背景 */}
              {enableGrid && showGrid && (
                <PageGrid
                  showGrid={showGrid}
                  gridSize={gridSize}
                  showRulers={showRulers}
                  canvasSize={canvasSize}
                  onToggleGrid={setShowGrid}
                  className="absolute inset-0"
                />
              )}

              {/* 对齐辅助线 */}
              {enableAlignmentGuides && showAlignmentGuides && (
                <PageAlignmentGuides
                  draggedComponent={draggedComponent}
                  showGuides={showAlignmentGuides}
                  snapThreshold={snapThreshold}
                  className="absolute inset-0"
                />
              )}

              {/* 画布内容 */}
              <div
                className="absolute bg-white shadow-lg"
                style={{
                  left: 0,
                  top: 0,
                  width: canvasSize.width,
                  height: canvasSize.height,
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: '0 0',
                }}
              >
                {children}
              </div>
            </TransformComponent>
          </TransformWrapper>
        ) : (
          // 禁用缩放时的简单渲染
          <>
            {/* 网格背景 */}
            {enableGrid && showGrid && (
              <PageGrid
                showGrid={showGrid}
                gridSize={gridSize}
                showRulers={showRulers}
                canvasSize={canvasSize}
                onToggleGrid={setShowGrid}
                className="absolute inset-0"
              />
            )}

            {/* 对齐辅助线 */}
            {enableAlignmentGuides && showAlignmentGuides && (
              <PageAlignmentGuides
                draggedComponent={draggedComponent}
                showGuides={showAlignmentGuides}
                snapThreshold={snapThreshold}
                className="absolute inset-0"
              />
            )}

            {/* 画布内容 */}
            <div
              className="absolute bg-white shadow-lg"
              style={{
                left: 0,
                top: 0,
                width: canvasSize.width,
                height: canvasSize.height,
              }}
            >
              {children}
            </div>
          </>
        )}
      </div>

      {/* 小地图 */}
      {enableMinimap && showMinimap && (
        <PageMiniMap
          showMinimap={showMinimap}
          canvasSize={canvasSize}
          onViewportChange={viewport => {
            const newPanX = -(viewport.x * zoom - (viewportInfo.width * zoom) / 2)
            const newPanY = -(viewport.y * zoom - (viewportInfo.height * zoom) / 2)
            setPan({ x: newPanX, y: newPanY })
          }}
          onToggleMinimap={setShowMinimap}
          className="z-30"
        />
      )}

      {/* 状态信息 */}
      <div className="absolute bottom-4 left-4 rounded-md border bg-white/90 px-3 py-2 text-xs text-gray-600 shadow-sm backdrop-blur-sm">
        <div>缩放: {Math.round(zoom * 100)}%</div>
        <div>
          位置: ({Math.round(-pan.x)}, {Math.round(-pan.y)})
        </div>
        <div>组件: {Object.keys(components).length}</div>
        <div>网格: {gridSize}px</div>
      </div>

      {/* 快捷键提示 */}
      <div className="absolute right-4 top-16 rounded-md border bg-white/90 px-3 py-2 text-xs text-gray-600 shadow-sm backdrop-blur-sm">
        <div className="mb-1 font-medium">快捷键:</div>
        <div>Ctrl + 滚轮: 缩放</div>
        <div>Ctrl + 0: 重置视图</div>
        <div>Alt + G: 切换网格</div>
        <div>Alt + L: 切换对齐线</div>
        <div>Alt + M: 切换小地图</div>
      </div>
    </div>
  )
}

export default PageDesignerCanvas
