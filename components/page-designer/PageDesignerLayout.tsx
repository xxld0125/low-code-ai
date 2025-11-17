/**
 * 页面设计器主布局
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { PageDesignerProvider } from './PageDesignerProvider'
import { ComponentPanel } from './ComponentPanel'
import { PageCanvas } from './PageCanvas'
import { PageDragOverlay } from './DragOverlay'
import { DragStats } from './DragVisualFeedback'
import { ComponentPropertiesPanel } from '@/components/designer/PropertiesPanel/ComponentPropertiesPanel'

// 拖拽轨迹组件（临时简化实现）
const DragTrail: React.FC<{
  points: Array<{ x: number; y: number; timestamp: number }>
  isActive: boolean
}> = ({ points, isActive }) => {
  if (!isActive || points.length < 2) return null

  return (
    <svg
      className="pointer-events-none fixed inset-0 z-50"
      style={{ width: '100vw', height: '100vh' }}
    >
      <polyline
        points={points.map(p => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="rgba(59, 130, 246, 0.5)"
        strokeWidth="2"
        strokeDasharray="5,5"
      />
    </svg>
  )
}
import { useDesignerStore } from '@/stores/page-designer/designer-store'
import { usePropertyStore } from '@/stores/property-store/property-store'
import type { DragItem, ComponentInstance, ComponentType } from '@/types/page-designer/component'
import type { CanvasState as PageDesignerCanvasState } from '@/types/page-designer'

// 简化的工具栏组件 - 避免无限循环
const DesignerToolbar: React.FC<{
  componentCount: number
  maxComponents: number
  currentZoom: number
  onUndo: () => void
  onRedo: () => void
  onClearCanvas: () => void
}> = ({ componentCount, maxComponents, currentZoom, onUndo, onRedo, onClearCanvas }) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-gray-900">页面设计器</h1>

        <div className="h-6 w-px bg-gray-300"></div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onUndo}
            disabled={true} // 暂时禁用
            className="cursor-not-allowed rounded bg-gray-100 px-3 py-1 text-sm text-gray-400 transition-colors"
          >
            撤销
          </button>
          <button
            onClick={onRedo}
            disabled={true} // 暂时禁用
            className="cursor-not-allowed rounded bg-gray-100 px-3 py-1 text-sm text-gray-400 transition-colors"
          >
            重做
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300"></div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>
            组件: {componentCount}/{maxComponents}
          </span>
          <span>缩放: {Math.round(currentZoom * 100)}%</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onClearCanvas}
          className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 transition-colors hover:bg-red-200"
        >
          清空画布
        </button>
      </div>
    </div>
  )
}

// 状态栏组件
const DesignerStatusBar: React.FC<{
  canvasState: PageDesignerCanvasState
  stats: {
    componentCount: number
    selectedCount: number
    maxComponents: number
    currentZoom: number
    isMaxComponentsReached: boolean
  }
}> = ({ canvasState, stats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-1 text-xs text-gray-600"
    >
      <div className="flex items-center space-x-4">
        <span>就绪</span>
        <span>
          画布: {canvasState.canvasWidth} × {canvasState.canvasHeight}
        </span>
        <span>网格: {canvasState.showGrid ? '开启' : '关闭'}</span>
      </div>

      <div className="flex items-center space-x-4">
        {stats.isMaxComponentsReached && (
          <span className="font-medium text-red-600">已达到最大组件数量限制</span>
        )}
        <span>自动保存已启用</span>
      </div>
    </motion.div>
  )
}

// 属性面板占位符（已替换为ComponentPropertiesPanel）
// const PropertiesPanelPlaceholder: React.FC<{
//   selectedComponents: ComponentInstance[]
//   onComponentUpdate: (id: string, updates: Partial<ComponentInstance>) => void
// }> = ({ selectedComponents, onComponentUpdate }) => {
//   // 已移除此组件，使用ComponentPropertiesPanel替代
// }

export interface PageDesignerLayoutProps {
  className?: string
}

export const PageDesignerLayout: React.FC<PageDesignerLayoutProps> = ({ className }) => {
  // 使用 Zustand store 进行状态管理
  const {
    components,
    selectionState,
    canvas,
    dragState,
    addComponentFromType,
    selectComponent,
    updateComponent,
    deleteComponent,
    setCanvasSize,
    toggleGrid,
    startDrag,
    endDrag,
    updateDrag,
    undo,
    redo,
  } = useDesignerStore()

  // 获取属性预览数据
  const { previewProperties } = usePropertyStore()

  // 转换为数组格式以兼容现有组件，并混合预览数据
  const componentsArray = Object.values(components).map(component => {
    // 只有选中的组件才应用预览数据，避免影响其他组件
    const isSelected = selectionState.selectedComponentIds.includes(component.id)
    const hasPreviewData = previewProperties && Object.keys(previewProperties).length > 0

    if (isSelected && hasPreviewData) {
      // 只对选中的组件混合预览数据
      return {
        ...component,
        props: {
          ...component.props,
          ...previewProperties // 预览属性会覆盖原始属性
        }
      }
    }

    return component
  })
  const selectedComponentsArray = selectionState.selectedComponentIds
    .map(id => components[id])
    .filter(Boolean)

  // 统计信息
  const stats = {
    componentCount: componentsArray.length,
    selectedCount: selectedComponentsArray.length,
    maxComponents: 50,
    currentZoom: canvas.zoom,
    isMaxComponentsReached: componentsArray.length >= 50,
  }

  // 基本的操作函数
  const handleUndo = useCallback(() => {
    undo()
  }, [undo])

  const handleRedo = useCallback(() => {
    redo()
  }, [redo])

  const handleClearCanvas = useCallback(() => {
    if (window.confirm('确定要清空画布吗？此操作无法撤销。')) {
      // 清空所有组件
      Object.keys(components).forEach(id => deleteComponent(id))
    }
  }, [components, deleteComponent])

  const handleComponentSelect = useCallback(
    (id: string) => {
      selectComponent(id)
    },
    [selectComponent]
  )

  const handleComponentUpdate = useCallback(
    (id: string, updates: Partial<ComponentInstance>) => {
      updateComponent(id, updates)
    },
    [updateComponent]
  )

  const handleComponentDelete = useCallback(
    (id: string) => {
      deleteComponent(id)
    },
    [deleteComponent]
  )

  const handleComponentAdd = useCallback(
    (component: ComponentInstance) => {
      if (componentsArray.length < 50) {
        addComponentFromType(component.component_type as any, component.parent_id || undefined)
      }
    },
    [componentsArray.length, addComponentFromType]
  )

  const handleDragStart = useCallback(
    (dragData: DragItem) => {
      startDrag(dragData.type as ComponentType, dragData.type, dragData.id)
    },
    [startDrag]
  )

  const handleDragEnd = useCallback(
    (dragData: DragItem | null, dropData: any) => {
      // 更宽松的拖拽检测条件：只要拖拽了组件且释放到有效区域就添加
      if (
        dragData &&
        (dropData?.id === 'canvas' || dropData === null || dropData?.accepts?.includes('component'))
      ) {
        addComponentFromType(dragData.type as ComponentType)
      }

      endDrag()
    },
    [addComponentFromType, endDrag]
  )

  const handleDragOver = useCallback(
    (dragData: DragItem, dropData: any) => {
      updateDrag({ x: 0, y: 0 }, dropData?.id)
    },
    [updateDrag]
  )

  // 获取默认组件属性
  const getDefaultProps = (type: string) => {
    switch (type) {
      case 'button':
        return { button: { text: '按钮', variant: 'default' as const, size: 'default' as const } }
      case 'input':
        return { input: { placeholder: '请输入内容', type: 'text' as const } }
      case 'text':
        return { text: { content: '📝 文本内容', variant: 'body' as const } }
      case 'image':
        return { image: { src: '/api/placeholder/300/200', alt: '图片' } }
      default:
        return {}
    }
  }

  // 获取默认样式
  const getDefaultStyles = (type: string) => {
    const baseStyles = {
      margin: { bottom: 16 },
    }

    // 为文本组件添加特殊样式以确保可见性
    if (type === 'text') {
      return {
        ...baseStyles,
        padding: '8px 12px',
        backgroundColor: '#f3f4f6',
        border: '1px dashed #d1d5db',
        borderRadius: '4px',
        minWidth: '120px',
        minHeight: '32px',
        display: 'inline-block',
      }
    }

    return baseStyles
  }

  // 处理画布状态变化
  const handleCanvasStateChange = useCallback(
    (updates: Partial<PageDesignerCanvasState>) => {
      // 处理画布尺寸更新
      if (updates.canvasWidth && updates.canvasHeight) {
        setCanvasSize(updates.canvasWidth, updates.canvasHeight)
      }

      // 处理网格显示切换
      if ('showGrid' in updates) {
        toggleGrid()
      }
    },
    [setCanvasSize, toggleGrid]
  )

  // 拖拽轨迹状态
  const [dragTrail, setDragTrail] = useState<Array<{ x: number; y: number; timestamp: number }>>([])
  const dragTrailRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z: 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }

      // Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y: 重做
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        handleRedo()
      }

      // Delete 或 Backspace: 删除选中组件
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponentsArray.length > 0) {
        e.preventDefault()
        selectedComponentsArray.forEach(component => {
          handleComponentDelete(component.id)
        })
      }

      // Escape: 清除选择
      if (e.key === 'Escape') {
        e.preventDefault()
        const { clearSelection } = useDesignerStore.getState()
        clearSelection() // 清除选择
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo, handleRedo, selectedComponentsArray, handleComponentDelete, selectComponent])

  return (
    <PageDesignerProvider
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className={cn('flex h-screen flex-col bg-white', className)}>
        {/* 工具栏 */}
        <DesignerToolbar
          componentCount={stats.componentCount}
          maxComponents={stats.maxComponents}
          currentZoom={stats.currentZoom}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClearCanvas={handleClearCanvas}
        />

        {/* 主要内容区域 */}
        <div className="flex flex-1 overflow-hidden">
          <ResizablePanelGroup
            direction="horizontal"
            className="flex-1"
            id="main-layout-panels"
          >
            {/* 左侧组件面板 */}
            <ResizablePanel defaultSize={20} minSize={12} maxSize={25}>
              <ComponentPanel
                onComponentSelect={type =>
                  handleComponentAdd({
                    id: '',
                    page_design_id: '',
                    component_type: type as any,
                    props: {},
                    styles: {},
                    events: {},
                    responsive: {},
                    position: { z_index: 0, order: 0 },
                    meta: {
                      locked: false,
                      hidden: false,
                      custom_name: type,
                      version: '1.0.0',
                      category: 'basic',
                    },
                    parent_id: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    version: 1,
                  } as unknown as ComponentInstance)
                }
              />
            </ResizablePanel>

            <ResizableHandle className="w-px bg-gray-300 transition-colors hover:bg-gray-400" />

            {/* 中央画布区域 */}
            <ResizablePanel defaultSize={60} minSize={40}>
              <PageCanvas
                components={componentsArray as unknown as any[]}
                selectedComponentIds={selectionState.selectedComponentIds}
                canvasState={{
                  zoom: canvas.zoom,
                  pan: canvas.pan,
                  gridSize: canvas.gridSize,
                  showGrid: canvas.showGrid,
                  canvasWidth: canvas.canvasWidth,
                  canvasHeight: canvas.canvasHeight,
                }}
                dragState={
                  {
                    isDragging: dragState.isDragging,
                    draggedComponentType: dragState.draggedComponentType as any,
                    draggedComponentId: dragState.draggedComponentId,
                    dropZoneId: dragState.dropZoneId || null,
                    dragPosition: dragState.dragPosition,
                    isValidDrop: dragState.isValidDrop,
                    activeId: dragState.draggedComponentId || null,
                  } as any
                }
                onComponentSelect={handleComponentSelect}
                onComponentUpdate={handleComponentUpdate}
                onComponentDelete={handleComponentDelete}
                onComponentAdd={handleComponentAdd}
                onCanvasStateChange={handleCanvasStateChange}
              />
            </ResizablePanel>

            <ResizableHandle className="w-px bg-gray-300 transition-colors hover:bg-gray-400" />

            {/* 右侧属性面板 */}
            <ResizablePanel defaultSize={25} minSize={15} maxSize={35}>
              <ComponentPropertiesPanel
                selectedComponentId={selectionState.selectedComponentIds[0] || null}
                className="border-l border-gray-200 bg-white"
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* 状态栏 */}
        <DesignerStatusBar
          canvasState={{
            zoom: canvas.zoom,
            pan: canvas.pan,
            gridSize: canvas.gridSize,
            showGrid: canvas.showGrid,
            canvasWidth: canvas.canvasWidth,
            canvasHeight: canvas.canvasHeight,
          }}
          stats={stats}
        />
      </div>

      {/* 拖拽视觉反馈 */}
      <AnimatePresence>
        {dragState.isDragging && (
          <>
            {/* 拖拽统计信息 */}
            <DragStats
              dragState={
                {
                  isDragging: dragState.isDragging,
                  draggedComponentType: dragState.draggedComponentType as any,
                  draggedComponentId: dragState.draggedComponentId,
                  dropZoneId: dragState.dropZoneId || null,
                  dragPosition: dragState.dragPosition,
                  isValidDrop: dragState.isValidDrop,
                  activeId: (dragState as any).draggedComponentId || null,
                } as any
              }
              componentCount={Object.keys(components).length}
              maxComponents={50}
            />

            {/* 拖拽轨迹 */}
            <DragTrail points={dragTrail} isActive={dragState.isDragging} />
          </>
        )}
      </AnimatePresence>

      {/* 拖拽覆盖层 */}
      <PageDragOverlay
        active={{
          data: {
            current: dragState.isDragging
              ? { type: dragState.draggedComponentType || 'unknown' }
              : null,
          },
        }}
        activeId={dragState.draggedComponentId || 'unknown'}
      />
    </PageDesignerProvider>
  )
}
