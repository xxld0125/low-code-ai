/**
 * 页面设计器对齐计算算法
 * 提供组件对齐、吸附和辅助线计算功能
 */

import { ComponentInstance } from '@/types/page-designer/component'

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface ComponentRect extends Rect {
  id: string
}

export interface AlignmentGuide {
  type: 'horizontal' | 'vertical'
  position: number
  strength: 'weak' | 'strong'
  source: string
  targetComponent?: string
}

export interface AlignmentResult {
  guides: AlignmentGuide[]
  snappedPosition: { x: number; y: number }
  alignedEdges: {
    left?: string
    right?: string
    top?: string
    bottom?: string
    centerX?: string
    centerY?: string
  }
}

export interface AlignmentOptions {
  snapThreshold: number
  showWeakGuides: boolean
  showStrongGuides: boolean
  showCanvasGuides: boolean
  canvasSize: { width: number; height: number }
  gridSize: number
  snapToGrid: boolean
}

/**
 * 默认对齐配置
 */
export const DEFAULT_ALIGNMENT_OPTIONS: Partial<AlignmentOptions> = {
  snapThreshold: 8,
  showWeakGuides: true,
  showStrongGuides: true,
  showCanvasGuides: true,
  gridSize: 8,
  snapToGrid: true,
}

/**
 * 计算组件的矩形边界
 */
export function getComponentRect(component: ComponentInstance): ComponentRect {
  // 这里需要根据实际的组件位置和尺寸计算逻辑
  // 目前使用基础的位置和尺寸属性
  // ComponentInstance 的 position 结构是 {z_index, order}
  // 我们需要从 styles 中获取实际的位置信息
  const x = (component.styles as any)?.left || 0
  const y = (component.styles as any)?.top || 0
  const width = (component.styles as any)?.width || 100
  const height = (component.styles as any)?.height || 50

  return {
    id: component.id,
    x,
    y,
    width,
    height,
  }
}

/**
 * 获取矩形的边界信息
 */
export function getRectEdges(rect: Rect): {
  left: number
  right: number
  top: number
  bottom: number
  centerX: number
  centerY: number
} {
  return {
    left: rect.x,
    right: rect.x + rect.width,
    top: rect.y,
    bottom: rect.y + rect.height,
    centerX: rect.x + rect.width / 2,
    centerY: rect.y + rect.height / 2,
  }
}

/**
 * 计算两个值是否在阈值范围内
 */
export function isWithinThreshold(value1: number, value2: number, threshold: number): boolean {
  return Math.abs(value1 - value2) < threshold
}

/**
 * 计算水平对齐辅助线
 */
export function calculateHorizontalGuides(
  targetRect: ComponentRect,
  otherRects: ComponentRect[],
  options: AlignmentOptions
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = []
  const targetEdges = getRectEdges(targetRect)
  const { snapThreshold, showWeakGuides, showStrongGuides } = options

  otherRects.forEach(rect => {
    const edges = getRectEdges(rect)

    // 强对齐：边缘对齐
    if (showStrongGuides) {
      // 上边缘对齐
      if (isWithinThreshold(targetEdges.top, edges.top, snapThreshold)) {
        guides.push({
          type: 'horizontal',
          position: edges.top,
          strength: 'strong',
          source: `${rect.id} top`,
          targetComponent: rect.id,
        })
      }

      // 下边缘对齐
      if (isWithinThreshold(targetEdges.bottom, edges.bottom, snapThreshold)) {
        guides.push({
          type: 'horizontal',
          position: edges.bottom,
          strength: 'strong',
          source: `${rect.id} bottom`,
          targetComponent: rect.id,
        })
      }

      // 垂直中心对齐
      if (isWithinThreshold(targetEdges.centerY, edges.centerY, snapThreshold)) {
        guides.push({
          type: 'horizontal',
          position: edges.centerY,
          strength: 'strong',
          source: `${rect.id} center`,
          targetComponent: rect.id,
        })
      }
    }

    // 弱对齐：边缘对齐到其他边缘
    if (showWeakGuides) {
      // 上边缘对齐到其他组件下边缘
      if (isWithinThreshold(targetEdges.top, edges.bottom, snapThreshold)) {
        guides.push({
          type: 'horizontal',
          position: edges.bottom,
          strength: 'weak',
          source: `${rect.id} bottom`,
          targetComponent: rect.id,
        })
      }

      // 下边缘对齐到其他组件上边缘
      if (isWithinThreshold(targetEdges.bottom, edges.top, snapThreshold)) {
        guides.push({
          type: 'horizontal',
          position: edges.top,
          strength: 'weak',
          source: `${rect.id} top`,
          targetComponent: rect.id,
        })
      }
    }
  })

  return guides
}

/**
 * 计算垂直对齐辅助线
 */
export function calculateVerticalGuides(
  targetRect: ComponentRect,
  otherRects: ComponentRect[],
  options: AlignmentOptions
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = []
  const targetEdges = getRectEdges(targetRect)
  const { snapThreshold, showWeakGuides, showStrongGuides } = options

  otherRects.forEach(rect => {
    const edges = getRectEdges(rect)

    // 强对齐：边缘对齐
    if (showStrongGuides) {
      // 左边缘对齐
      if (isWithinThreshold(targetEdges.left, edges.left, snapThreshold)) {
        guides.push({
          type: 'vertical',
          position: edges.left,
          strength: 'strong',
          source: `${rect.id} left`,
          targetComponent: rect.id,
        })
      }

      // 右边缘对齐
      if (isWithinThreshold(targetEdges.right, edges.right, snapThreshold)) {
        guides.push({
          type: 'vertical',
          position: edges.right,
          strength: 'strong',
          source: `${rect.id} right`,
          targetComponent: rect.id,
        })
      }

      // 水平中心对齐
      if (isWithinThreshold(targetEdges.centerX, edges.centerX, snapThreshold)) {
        guides.push({
          type: 'vertical',
          position: edges.centerX,
          strength: 'strong',
          source: `${rect.id} center`,
          targetComponent: rect.id,
        })
      }
    }

    // 弱对齐：边缘对齐到其他边缘
    if (showWeakGuides) {
      // 左边缘对齐到其他组件右边缘
      if (isWithinThreshold(targetEdges.left, edges.right, snapThreshold)) {
        guides.push({
          type: 'vertical',
          position: edges.right,
          strength: 'weak',
          source: `${rect.id} right`,
          targetComponent: rect.id,
        })
      }

      // 右边缘对齐到其他组件左边缘
      if (isWithinThreshold(targetEdges.right, edges.left, snapThreshold)) {
        guides.push({
          type: 'vertical',
          position: edges.left,
          strength: 'weak',
          source: `${rect.id} left`,
          targetComponent: rect.id,
        })
      }
    }
  })

  return guides
}

/**
 * 计算画布对齐辅助线
 */
export function calculateCanvasGuides(
  targetRect: ComponentRect,
  options: AlignmentOptions
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = []
  const { snapThreshold, showCanvasGuides, canvasSize } = options

  if (!showCanvasGuides) return guides

  const targetEdges = getRectEdges(targetRect)
  const canvasCenterX = canvasSize.width / 2
  const canvasCenterY = canvasSize.height / 2

  // 画布中心线
  guides.push(
    {
      type: 'vertical',
      position: canvasCenterX,
      strength: 'weak',
      source: 'canvas center',
    },
    {
      type: 'horizontal',
      position: canvasCenterY,
      strength: 'weak',
      source: 'canvas center',
    }
  )

  // 画布边缘对齐
  if (isWithinThreshold(targetEdges.left, 0, snapThreshold)) {
    guides.push({
      type: 'vertical',
      position: 0,
      strength: 'strong',
      source: 'canvas left',
    })
  }

  if (isWithinThreshold(targetEdges.right, canvasSize.width, snapThreshold)) {
    guides.push({
      type: 'vertical',
      position: canvasSize.width,
      strength: 'strong',
      source: 'canvas right',
    })
  }

  if (isWithinThreshold(targetEdges.top, 0, snapThreshold)) {
    guides.push({
      type: 'horizontal',
      position: 0,
      strength: 'strong',
      source: 'canvas top',
    })
  }

  if (isWithinThreshold(targetEdges.bottom, canvasSize.height, snapThreshold)) {
    guides.push({
      type: 'horizontal',
      position: canvasSize.height,
      strength: 'strong',
      source: 'canvas bottom',
    })
  }

  return guides
}

/**
 * 网格吸附
 */
export function snapToGrid(
  position: { x: number; y: number },
  gridSize: number
): { x: number; y: number } {
  if (gridSize <= 0) return position

  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  }
}

/**
 * 计算吸附位置
 */
export function calculateSnappedPosition(
  targetRect: ComponentRect,
  guides: AlignmentGuide[],
  options: AlignmentOptions
): { x: number; y: number } {
  let snappedX = targetRect.x
  let snappedY = targetRect.y

  const { snapThreshold, gridSize, snapToGrid } = options

  // 网格吸附
  if (snapToGrid && gridSize > 0) {
    snappedX = Math.round(targetRect.x / gridSize) * gridSize
    snappedY = Math.round(targetRect.y / gridSize) * gridSize
  }

  // 对齐线吸附
  const targetEdges = getRectEdges(targetRect)

  guides.forEach(guide => {
    if (guide.type === 'horizontal') {
      if (isWithinThreshold(targetEdges.top, guide.position, snapThreshold)) {
        snappedY = guide.position
      } else if (isWithinThreshold(targetEdges.bottom, guide.position, snapThreshold)) {
        snappedY = guide.position - targetRect.height
      } else if (isWithinThreshold(targetEdges.centerY, guide.position, snapThreshold)) {
        snappedY = guide.position - targetRect.height / 2
      }
    } else if (guide.type === 'vertical') {
      if (isWithinThreshold(targetEdges.left, guide.position, snapThreshold)) {
        snappedX = guide.position
      } else if (isWithinThreshold(targetEdges.right, guide.position, snapThreshold)) {
        snappedX = guide.position - targetRect.width
      } else if (isWithinThreshold(targetEdges.centerX, guide.position, snapThreshold)) {
        snappedX = guide.position - targetRect.width / 2
      }
    }
  })

  return { x: snappedX, y: snappedY }
}

/**
 * 计算对齐边缘信息
 */
export function calculateAlignedEdges(
  originalRect: ComponentRect,
  snappedRect: ComponentRect,
  guides: AlignmentGuide[],
  options: AlignmentOptions
): {
  left?: string
  right?: string
  top?: string
  bottom?: string
  centerX?: string
  centerY?: string
} {
  const alignedEdges: any = {}
  const { snapThreshold } = options
  const originalEdges = getRectEdges(originalRect)
  const snappedEdges = getRectEdges(snappedRect)

  guides.forEach(guide => {
    if (guide.type === 'horizontal') {
      if (
        isWithinThreshold(originalEdges.top, guide.position, snapThreshold) &&
        Math.abs(snappedEdges.top - guide.position) < 0.1
      ) {
        alignedEdges.top = guide.source
      } else if (
        isWithinThreshold(originalEdges.bottom, guide.position, snapThreshold) &&
        Math.abs(snappedEdges.bottom - guide.position) < 0.1
      ) {
        alignedEdges.bottom = guide.source
      } else if (
        isWithinThreshold(originalEdges.centerY, guide.position, snapThreshold) &&
        Math.abs(snappedEdges.centerY - guide.position) < 0.1
      ) {
        alignedEdges.centerY = guide.source
      }
    } else if (guide.type === 'vertical') {
      if (
        isWithinThreshold(originalEdges.left, guide.position, snapThreshold) &&
        Math.abs(snappedEdges.left - guide.position) < 0.1
      ) {
        alignedEdges.left = guide.source
      } else if (
        isWithinThreshold(originalEdges.right, guide.position, snapThreshold) &&
        Math.abs(snappedEdges.right - guide.position) < 0.1
      ) {
        alignedEdges.right = guide.source
      } else if (
        isWithinThreshold(originalEdges.centerX, guide.position, snapThreshold) &&
        Math.abs(snappedEdges.centerX - guide.position) < 0.1
      ) {
        alignedEdges.centerX = guide.source
      }
    }
  })

  return alignedEdges
}

/**
 * 主要对齐计算函数
 */
export function calculateAlignment(
  targetComponent: ComponentInstance,
  otherComponents: ComponentInstance[],
  options: Partial<AlignmentOptions> = {}
): AlignmentResult {
  const mergedOptions: AlignmentOptions = {
    ...DEFAULT_ALIGNMENT_OPTIONS,
    ...options,
    canvasSize: { width: 1200, height: 800 },
    ...options,
  } as AlignmentOptions

  const targetRect = getComponentRect(targetComponent)
  const otherRects = otherComponents
    .filter(comp => comp.id !== targetComponent.id)
    .map(getComponentRect)

  // 计算各种对齐辅助线
  const horizontalGuides = calculateHorizontalGuides(targetRect, otherRects, mergedOptions)
  const verticalGuides = calculateVerticalGuides(targetRect, otherRects, mergedOptions)
  const canvasGuides = calculateCanvasGuides(targetRect, mergedOptions)

  // 合并所有辅助线
  const allGuides = [...horizontalGuides, ...verticalGuides, ...canvasGuides]

  // 去除重复的辅助线（相同类型和位置的）
  const uniqueGuides = allGuides.filter(
    (guide, index, self) =>
      index ===
      self.findIndex(g => g.type === guide.type && Math.abs(g.position - guide.position) < 0.1)
  )

  // 计算吸附位置
  const snappedPosition = calculateSnappedPosition(targetRect, uniqueGuides, mergedOptions)

  const snappedRect: ComponentRect = {
    ...targetRect,
    x: snappedPosition.x,
    y: snappedPosition.y,
  }

  // 计算对齐边缘信息
  const alignedEdges = calculateAlignedEdges(targetRect, snappedRect, uniqueGuides, mergedOptions)

  return {
    guides: uniqueGuides,
    snappedPosition,
    alignedEdges,
  }
}

/**
 * 检测组件间的碰撞
 */
export function detectCollision(rect1: Rect, rect2: Rect, threshold: number = 0): boolean {
  return (
    rect1.x < rect2.x + rect2.width + threshold &&
    rect1.x + rect1.width + threshold > rect2.x &&
    rect1.y < rect2.y + rect2.height + threshold &&
    rect1.y + rect1.height + threshold > rect2.y
  )
}

/**
 * 计算组件间的最小间距
 */
export function calculateMinDistance(
  rect1: Rect,
  rect2: Rect
): { horizontal: number; vertical: number } {
  const horizontalDistance = Math.max(
    0,
    Math.max(rect1.x - (rect2.x + rect2.width), rect2.x - (rect1.x + rect1.width))
  )
  const verticalDistance = Math.max(
    0,
    Math.max(rect1.y - (rect2.y + rect2.height), rect2.y - (rect1.y + rect1.height))
  )

  return {
    horizontal: horizontalDistance,
    vertical: verticalDistance,
  }
}
