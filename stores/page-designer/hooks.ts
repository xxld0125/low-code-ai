/**
 * 页面设计器状态管理便捷hooks
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import { useDesignerStore } from './designer-store'
import { useMemo } from 'react'

// 简化的hooks - 避免复杂的选择器以防止无限循环
export const useComponents = () => {
  return useDesignerStore(state => Object.values(state.components))
}

export const useSelectedComponents = () => {
  return useDesignerStore(state => {
    const selectedIds = state.selectionState.selectedComponentIds
    return selectedIds.map(id => state.components[id]).filter(Boolean)
  })
}

export const useCanvasState = () => {
  return useDesignerStore(state => state.canvas)
}

export const useDragState = () => {
  return useDesignerStore(state => state.dragState)
}

export const useSelectionState = () => {
  return useDesignerStore(state => state.selectionState)
}

// 历史管理hooks - 简化版本
export const useDesignerHistory = () => {
  return useDesignerStore(state => ({
    canUndo: (state.historyState.past?.length || 0) > 0,
    canRedo: (state.historyState.future?.length || 0) > 0,
    undo: state.undo,
    redo: state.redo,
  }))
}

// 组件操作hooks - 直接返回函数引用
export const useComponentOperations = () => {
  return useDesignerStore(state => ({
    addComponentFromType: state.addComponentFromType,
    updateComponent: state.updateComponent,
    deleteComponent: state.deleteComponent,
    moveComponent: state.moveComponent,
    duplicateComponent: state.duplicateComponent,
  }))
}

// 选择操作hooks - 直接返回函数引用
export const useSelectionOperations = () => {
  return useDesignerStore(state => ({
    selectComponent: state.selectComponent,
    selectComponents: state.selectComponents,
    clearSelection: state.clearSelection,
    selectAll: state.selectAll,
    isSelected: (id: string) => state.selectionState.selectedComponentIds.includes(id),
  }))
}

// 拖拽操作hooks - 直接返回函数引用
export const useDragOperations = () => {
  return useDesignerStore(state => ({
    startDrag: state.startDrag,
    updateDrag: state.updateDrag,
    endDrag: state.endDrag,
  }))
}

// 画布操作hooks - 直接返回函数引用
export const useCanvasOperations = () => {
  return useDesignerStore(state => ({
    setZoom: state.setZoom,
    setPan: state.setPan,
    toggleGrid: state.toggleGrid,
    setCanvasSize: state.setCanvasSize,
  }))
}

// 页面设计操作hooks - 直接返回函数引用
export const usePageDesignOperations = () => {
  return useDesignerStore(state => ({
    createPageDesign: state.createPageDesign,
    loadPageDesign: state.loadPageDesign,
    updatePageDesign: state.updatePageDesign,
    deletePageDesign: state.deletePageDesign,
  }))
}

// 统计信息hooks - 使用useMemo来优化性能
export const useDesignerStats = () => {
  const components = useComponents()
  const selectedComponents = useSelectedComponents()
  const canvas = useCanvasState()

  return useMemo(
    () => ({
      componentCount: components.length,
      selectedCount: selectedComponents.length,
      maxComponents: 50,
      currentZoom: canvas.zoom,
      isMaxComponentsReached: components.length >= 50,
    }),
    [components.length, selectedComponents.length, canvas.zoom]
  )
}
