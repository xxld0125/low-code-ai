'use client'

import React, { useMemo, useCallback } from 'react'
import { useZoomStore } from '@/stores/page-designer/zoom-store'
import { usePageDesignerStore } from '@/stores/page-designer'
import { cn } from '@/lib/utils'
import type { ComponentBounds, AlignmentGuide } from '@/types/page-designer'

interface PageAlignmentGuidesProps {
  draggedComponent?: ComponentBounds | null
  className?: string
  showGuides?: boolean
  guideColor?: string
  strongGuideWidth?: number
  weakGuideWidth?: number
  snapThreshold?: number
}

/**
 * 页面设计器对齐辅助线组件
 * 提供拖拽时的对齐辅助线和吸附功能
 */
export function PageAlignmentGuides({
  draggedComponent,
  className,
  showGuides = true,
  guideColor = 'rgb(59, 130, 246)', // blue-500
  strongGuideWidth = 2,
  weakGuideWidth = 1,
  snapThreshold = 8, // 吸附阈值（像素）
}: PageAlignmentGuidesProps) {
  const { zoom, pan, snapToGrid, gridSize } = useZoomStore()
  const { components, selectionState } = usePageDesignerStore()

  // 获取所有组件的边界信息
  const allComponentBounds = useMemo(() => {
    const componentBoundsList: ComponentBounds[] = []

    // 排除正在拖拽的组件和选中的组件
    const excludeIds = new Set([
      draggedComponent?.id,
      ...(selectionState?.selectedComponentIds || []),
    ])

    Object.values(components).forEach((component: any) => {
      if (excludeIds.has(component.id)) return

      // 从 styles 中获取位置信息
      const x = (component.styles as any)?.left || 0
      const y = (component.styles as any)?.top || 0
      const width = (component.styles as any)?.width || 100
      const height = (component.styles as any)?.height || 50

      const bounds: ComponentBounds = {
        id: component.id,
        left: x,
        top: y,
        right: x + width,
        bottom: y + height,
        centerX: x + width / 2,
        centerY: y + height / 2,
      }

      componentBoundsList.push(bounds)
    })

    return componentBoundsList
  }, [components, draggedComponent, selectionState])

  // 计算对齐辅助线
  const alignmentGuides = useMemo(() => {
    if (!showGuides || !draggedComponent) return []

    const guides: AlignmentGuide[] = []
    const { left, top, right, bottom, centerX, centerY } = draggedComponent

    // 检查水平对齐
    allComponentBounds.forEach(bounds => {
      // 上边缘对齐
      if (Math.abs(top - bounds.top) < snapThreshold) {
        guides.push({
          type: 'horizontal',
          position: bounds.top,
          strength: 'strong',
          source: `${bounds.id} top edge`,
        })
      }

      // 下边缘对齐
      if (Math.abs(bottom - bounds.bottom) < snapThreshold) {
        guides.push({
          type: 'horizontal',
          position: bounds.bottom,
          strength: 'strong',
          source: `${bounds.id} bottom edge`,
        })
      }

      // 垂直中心对齐
      if (Math.abs(centerY - bounds.centerY) < snapThreshold) {
        guides.push({
          type: 'horizontal',
          position: bounds.centerY,
          strength: 'strong',
          source: `${bounds.id} center`,
        })
      }

      // 上边缘对齐到其他组件的下边缘
      if (Math.abs(top - bounds.bottom) < snapThreshold) {
        guides.push({
          type: 'horizontal',
          position: bounds.bottom,
          strength: 'weak',
          source: `${bounds.id} bottom edge`,
        })
      }

      // 下边缘对齐到其他组件的上边缘
      if (Math.abs(bottom - bounds.top) < snapThreshold) {
        guides.push({
          type: 'horizontal',
          position: bounds.top,
          strength: 'weak',
          source: `${bounds.id} top edge`,
        })
      }
    })

    // 检查垂直对齐
    allComponentBounds.forEach(bounds => {
      // 左边缘对齐
      if (Math.abs(left - bounds.left) < snapThreshold) {
        guides.push({
          type: 'vertical',
          position: bounds.left,
          strength: 'strong',
          source: `${bounds.id} left edge`,
        })
      }

      // 右边缘对齐
      if (Math.abs(right - bounds.right) < snapThreshold) {
        guides.push({
          type: 'vertical',
          position: bounds.right,
          strength: 'strong',
          source: `${bounds.id} right edge`,
        })
      }

      // 水平中心对齐
      if (Math.abs(centerX - bounds.centerX) < snapThreshold) {
        guides.push({
          type: 'vertical',
          position: bounds.centerX,
          strength: 'strong',
          source: `${bounds.id} center`,
        })
      }

      // 左边缘对齐到其他组件的右边缘
      if (Math.abs(left - bounds.right) < snapThreshold) {
        guides.push({
          type: 'vertical',
          position: bounds.right,
          strength: 'weak',
          source: `${bounds.id} right edge`,
        })
      }

      // 右边缘对齐到其他组件的左边缘
      if (Math.abs(right - bounds.left) < snapThreshold) {
        guides.push({
          type: 'vertical',
          position: bounds.left,
          strength: 'weak',
          source: `${bounds.id} left edge`,
        })
      }
    })

    // 检查画布边界对齐
    const canvasWidth = 1200 // 固定画布宽度
    const canvasHeight = 800 // 固定画布高度

    // 画布中心线
    guides.push({
      type: 'vertical',
      position: canvasWidth / 2,
      strength: 'weak',
      source: 'canvas center',
    })

    guides.push({
      type: 'horizontal',
      position: canvasHeight / 2,
      strength: 'weak',
      source: 'canvas center',
    })

    // 去除重复的辅助线
    const uniqueGuides = guides.filter(
      (guide, index, self) =>
        index ===
        self.findIndex(g => g.type === guide.type && Math.abs(g.position - guide.position) < 0.1)
    )

    return uniqueGuides
  }, [showGuides, draggedComponent, allComponentBounds, snapThreshold])

  // 计算吸附位置
  const getSnappedPosition = useCallback(
    (x: number, y: number, width: number, height: number) => {
      if (!draggedComponent || !snapToGrid) {
        return { x, y }
      }

      let snappedX = x
      let snappedY = y

      // 网格吸附
      if (snapToGrid && gridSize > 0) {
        snappedX = Math.round(x / gridSize) * gridSize
        snappedY = Math.round(y / gridSize) * gridSize
      }

      // 对齐线吸附
      const centerX = x + width / 2
      const centerY = y + height / 2
      const right = x + width
      const bottom = y + height

      alignmentGuides.forEach(guide => {
        if (guide.type === 'horizontal') {
          if (Math.abs(y - guide.position) < snapThreshold) {
            snappedY = guide.position
          } else if (Math.abs(bottom - guide.position) < snapThreshold) {
            snappedY = guide.position - height
          } else if (Math.abs(centerY - guide.position) < snapThreshold) {
            snappedY = guide.position - height / 2
          }
        } else if (guide.type === 'vertical') {
          if (Math.abs(x - guide.position) < snapThreshold) {
            snappedX = guide.position
          } else if (Math.abs(right - guide.position) < snapThreshold) {
            snappedX = guide.position - width
          } else if (Math.abs(centerX - guide.position) < snapThreshold) {
            snappedX = guide.position - width / 2
          }
        }
      })

      return { x: snappedX, y: snappedY }
    },
    [draggedComponent, snapToGrid, gridSize, alignmentGuides, snapThreshold]
  )

  // 转换坐标到屏幕空间
  const canvasToScreen = useCallback(
    (canvasPos: number) => {
      return canvasPos * zoom + pan.x
    },
    [zoom, pan.x]
  )

  const canvasToScreenY = useCallback(
    (canvasPos: number) => {
      return canvasPos * zoom + pan.y
    },
    [zoom, pan.y]
  )

  if (!showGuides || !draggedComponent) {
    return null
  }

  return (
    <svg
      className={cn('pointer-events-none absolute inset-0 z-50', className)}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      {/* 渲染水平对齐线 */}
      {alignmentGuides
        .filter(guide => guide.type === 'horizontal')
        .map((guide, index) => (
          <line
            key={`horizontal-${index}`}
            x1={0}
            y1={canvasToScreenY(guide.position)}
            x2={10000}
            y2={canvasToScreenY(guide.position)}
            stroke={guideColor}
            strokeWidth={guide.strength === 'strong' ? strongGuideWidth : weakGuideWidth}
            strokeDasharray={guide.strength === 'weak' ? '5,5' : 'none'}
            opacity={guide.strength === 'strong' ? 1 : 0.6}
          />
        ))}

      {/* 渲染垂直对齐线 */}
      {alignmentGuides
        .filter(guide => guide.type === 'vertical')
        .map((guide, index) => (
          <line
            key={`vertical-${index}`}
            x1={canvasToScreen(guide.position)}
            y1={0}
            x2={canvasToScreen(guide.position)}
            y2={10000}
            stroke={guideColor}
            strokeWidth={guide.strength === 'strong' ? strongGuideWidth : weakGuideWidth}
            strokeDasharray={guide.strength === 'weak' ? '5,5' : 'none'}
            opacity={guide.strength === 'strong' ? 1 : 0.6}
          />
        ))}

      {/* 对齐指示点 */}
      {alignmentGuides.map((guide, index) => {
        if (guide.strength !== 'strong') return null

        if (guide.type === 'horizontal') {
          return (
            <circle
              key={`point-horizontal-${index}`}
              cx={canvasToScreen(draggedComponent.centerX)}
              cy={canvasToScreenY(guide.position)}
              r="4"
              fill={guideColor}
              opacity="0.8"
            />
          )
        } else {
          return (
            <circle
              key={`point-vertical-${index}`}
              cx={canvasToScreen(guide.position)}
              cy={canvasToScreenY(draggedComponent.centerY)}
              r="4"
              fill={guideColor}
              opacity="0.8"
            />
          )
        }
      })}
    </svg>
  )
}

export default PageAlignmentGuides
