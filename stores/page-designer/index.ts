// 页面设计器状态管理入口文件
export { useDesignerStore as usePageDesignerStore } from './designer-store'
export { useZoomStore } from './zoom-store'
export { useSelectionStore } from './selection-store'
export * from './hooks'

// 类型导出
export type {
  DesignerStore,
  DesignerState,
  DesignerActions,
  PageDesign,
  ComponentInstance,
  CanvasState,
  DragState,
  SelectionState,
  HistoryState,
} from './designer-store'
