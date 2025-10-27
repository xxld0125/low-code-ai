/**
 * 页面设计器状态管理便捷hooks
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import { useDesignerStore } from './designer-store'

// 便捷hooks
export const useComponents = () => useDesignerStore(state => Object.values(state.components))
export const useSelectedComponents = () =>
  useDesignerStore(state =>
    state.selectionState.selectedComponentIds.map(id => state.components[id]).filter(Boolean)
  )
export const useCanvasState = () => useDesignerStore(state => state.canvas)
export const useDragState = () => useDesignerStore(state => state.dragState)
export const useSelectionState = () => useDesignerStore(state => state.selectionState)

// 历史管理hooks
export const useDesignerHistory = () =>
  useDesignerStore(state => ({
    canUndo: state.historyState.past.length > 0,
    canRedo: state.historyState.future.length > 0,
    undo: state.undo,
    redo: state.redo,
  }))

// 组件操作hooks
export const useComponentOperations = () =>
  useDesignerStore(state => ({
    addComponentFromType: state.addComponentFromType,
    updateComponent: state.updateComponent,
    deleteComponent: state.deleteComponent,
    moveComponent: state.moveComponent,
    duplicateComponent: state.duplicateComponent,
  }))

// 选择操作hooks
export const useSelectionOperations = () =>
  useDesignerStore(state => ({
    selectComponent: state.selectComponent,
    selectComponents: state.selectComponents,
    clearSelection: state.clearSelection,
    selectAll: state.selectAll,
    isSelected: (id: string) => state.selectionState.selectedComponentIds.includes(id),
  }))

// 拖拽操作hooks
export const useDragOperations = () =>
  useDesignerStore(state => ({
    startDrag: state.startDrag,
    updateDrag: state.updateDrag,
    endDrag: state.endDrag,
  }))

// 画布操作hooks
export const useCanvasOperations = () =>
  useDesignerStore(state => ({
    setZoom: state.setZoom,
    setPan: state.setPan,
    toggleGrid: state.toggleGrid,
    setCanvasSize: state.setCanvasSize,
  }))

// 页面设计操作hooks
export const usePageDesignOperations = () =>
  useDesignerStore(state => ({
    createPageDesign: state.createPageDesign,
    loadPageDesign: state.loadPageDesign,
    updatePageDesign: state.updatePageDesign,
    deletePageDesign: state.deletePageDesign,
  }))

// 统计信息hooks
export const useDesignerStats = () => {
  const components = useComponents()
  const selectedComponents = useSelectedComponents()
  const canvas = useCanvasState()

  return {
    componentCount: components.length,
    selectedCount: selectedComponents.length,
    maxComponents: 50,
    currentZoom: canvas.zoom,
    isMaxComponentsReached: components.length >= 50,
  }
}
