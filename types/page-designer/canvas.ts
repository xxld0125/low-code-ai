// 画布相关类型定义

// 组件边界框（用于对齐和拖拽）
export interface ComponentBounds {
  id: string
  left: number
  top: number
  right: number
  bottom: number
  centerX: number
  centerY: number
}

// 组件尺寸
export interface ComponentSize {
  width: number
  height: number
}

// 组件位置
export interface ComponentPosition {
  x: number
  y: number
}

// 画布状态
export interface CanvasState {
  zoom: number
  pan: { x: number; y: number }
  gridSize: number
  showGrid: boolean
  canvasWidth: number
  canvasHeight: number
}

// 视口信息
export interface ViewportInfo {
  x: number
  y: number
  width: number
  height: number
}

// 对齐辅助线
export interface AlignmentGuide {
  type: 'horizontal' | 'vertical'
  position: number
  strength: 'weak' | 'strong'
  source: string
}
