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
import {
  useComponents,
  useSelectedComponents,
  useCanvasState,
  useDragState,
  useSelectionOperations,
  useComponentOperations,
  useCanvasOperations,
  useDragOperations,
  useDesignerStats,
} from '@/stores/page-designer/hooks'
import type { DragItem, ComponentInstance } from '@/types/page-designer/component'
import type { CanvasState as PageDesignerCanvasState } from '@/types/page-designer'

// 工具栏组件
const DesignerToolbar: React.FC<{
  canvasState: PageDesignerCanvasState
  stats: ReturnType<typeof useDesignerStats>
  onUndo: () => void
  onRedo: () => void
  onClearCanvas: () => void
}> = ({ canvasState, stats, onUndo, onRedo, onClearCanvas }) => {
  const { historyState } = useDesignerStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2"
    >
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-gray-900">页面设计器</h1>

        <div className="h-6 w-px bg-gray-300"></div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onUndo}
            disabled={!historyState.past.length}
            className={cn(
              'rounded px-3 py-1 text-sm transition-colors',
              historyState.past.length
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'cursor-not-allowed bg-gray-50 text-gray-400'
            )}
          >
            撤销
          </button>
          <button
            onClick={onRedo}
            disabled={!historyState.future.length}
            className={cn(
              'rounded px-3 py-1 text-sm transition-colors',
              historyState.future.length
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'cursor-not-allowed bg-gray-50 text-gray-400'
            )}
          >
            重做
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300"></div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>
            组件: {stats.componentCount}/{stats.maxComponents}
          </span>
          <span>缩放: {Math.round(canvasState.zoom * 100)}%</span>
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
    </motion.div>
  )
}

// 状态栏组件
const DesignerStatusBar: React.FC<{
  canvasState: PageDesignerCanvasState
  stats: ReturnType<typeof useDesignerStats>
}> = ({ canvasState, stats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-1 text-xs text-gray-600"
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

// 属性面板占位符（后续实现）
const PropertiesPanelPlaceholder: React.FC<{
  selectedComponents: ComponentInstance[]
  onComponentUpdate: (id: string, updates: Partial<ComponentInstance>) => void
}> = ({ selectedComponents, onComponentUpdate }) => {
  return (
    <div className="flex h-full flex-col border-l border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">属性面板</h2>
      </div>

      <div className="flex-1 p-4">
        {selectedComponents.length === 0 ? (
          <div className="text-center text-sm text-gray-500">
            <div className="py-8">
              <svg
                className="mx-auto mb-4 h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              <p>选择组件以查看属性</p>
            </div>
          </div>
        ) : selectedComponents.length === 1 ? (
          <div>
            <h3 className="mb-3 font-medium text-gray-900">
              {selectedComponents[0].meta.custom_name || selectedComponents[0].component_type}
            </h3>
            <div className="text-sm text-gray-600">
              <p>ID: {selectedComponents[0].id}</p>
              <p>类型: {selectedComponents[0].component_type}</p>
              <p>创建时间: {new Date(selectedComponents[0].created_at).toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500">
            <p>已选择 {selectedComponents.length} 个组件</p>
            <p>批量编辑功能开发中...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export interface PageDesignerLayoutProps {
  className?: string
}

export const PageDesignerLayout: React.FC<PageDesignerLayoutProps> = ({ className }) => {
  // 状态管理
  const components = useComponents()
  const selectedComponents = useSelectedComponents()
  const canvasState = useCanvasState()
  const dragState = useDragState()
  const stats = useDesignerStats()

  // 操作hooks
  const { undo, redo } = useDesignerStore()
  const { clearSelection } = useSelectionOperations()
  const { addComponentFromType, updateComponent, deleteComponent } = useComponentOperations()
  const { setZoom, toggleGrid } = useCanvasOperations()
  const { startDrag, endDrag } = useDragOperations()

  // 拖拽轨迹状态
  const [dragTrail, setDragTrail] = useState<Array<{ x: number; y: number; timestamp: number }>>([])
  const dragTrailRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // 处理拖拽开始
  const handleDragStart = useCallback(
    (dragData: DragItem) => {
      startDrag(dragData.type, dragData.type, dragData.id)
      setDragTrail([])
    },
    [startDrag]
  )

  // 处理拖拽结束
  const handleDragEnd = useCallback(
    (dragData: DragItem | null, dropData: any) => {
      if (dragData && dragData.isFromPanel && dropData?.id === 'canvas') {
        try {
          const componentId = addComponentFromType(dragData.type)
          console.log('Component added:', componentId)
        } catch (error) {
          console.error('Failed to add component:', error)
        }
      }

      endDrag()
      setDragTrail([])
    },
    [addComponentFromType, endDrag]
  )

  // 处理拖拽轨迹
  const handleDragOver = useCallback((dragData: DragItem, dropData: any) => {
    // 简化的拖拽轨迹处理，暂时禁用
    // 可以在后续版本中通过更精确的鼠标位置跟踪来实现
  }, [])

  // 处理组件选择
  const handleComponentSelect = useCallback((id: string) => {
    const { selectComponent } = useDesignerStore.getState()
    selectComponent(id)
  }, [])

  // 处理组件更新
  const handleComponentUpdate = useCallback(
    (id: string, updates: Partial<ComponentInstance>) => {
      updateComponent(id, updates)
    },
    [updateComponent]
  )

  // 处理组件删除
  const handleComponentDelete = useCallback(
    (id: string) => {
      deleteComponent(id)
    },
    [deleteComponent]
  )

  // 处理组件添加
  const handleComponentAdd = useCallback(
    (component: ComponentInstance) => {
      addComponentFromType(component.component_type, component.parent_id)
    },
    [addComponentFromType]
  )

  // 处理画布状态变化
  const handleCanvasStateChange = useCallback(
    (updates: Partial<PageDesignerCanvasState>) => {
      if ((updates as any).zoom !== undefined) setZoom((updates as any).zoom)
      if (
        (updates as any).showGrid !== undefined &&
        (updates as any).showGrid !== (canvasState as any).showGrid
      ) {
        toggleGrid()
      }
    },
    [setZoom, toggleGrid, canvasState]
  )

  // 处理工具栏操作
  const handleUndo = useCallback(() => {
    undo()
  }, [undo])

  const handleRedo = useCallback(() => {
    redo()
  }, [redo])

  const handleClearCanvas = useCallback(() => {
    if (window.confirm('确定要清空画布吗？此操作无法撤销。')) {
      // 清空所有组件
      const { components, updateComponent, deleteComponent } = useDesignerStore.getState()
      Object.keys(components).forEach(componentId => {
        deleteComponent(componentId)
      })
      clearSelection()
    }
  }, [clearSelection])

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
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponents.length > 0) {
        e.preventDefault()
        selectedComponents.forEach(component => {
          handleComponentDelete(component.id)
        })
      }

      // Escape: 清除选择
      if (e.key === 'Escape') {
        e.preventDefault()
        clearSelection()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo, handleRedo, selectedComponents, handleComponentDelete, clearSelection])

  return (
    <PageDesignerProvider
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className={cn('flex h-screen flex-col bg-gray-50', className)}>
        {/* 工具栏 */}
        <DesignerToolbar
          canvasState={canvasState}
          stats={stats}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClearCanvas={handleClearCanvas}
        />

        {/* 主要内容区域 */}
        <div className="flex flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* 左侧组件面板 */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
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
                components={components as unknown as any[]}
                selectedComponentIds={selectedComponents.map(c => c.id)}
                canvasState={canvasState}
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
                onComponentSelect={handleComponentSelect}
                onComponentUpdate={handleComponentUpdate}
                onComponentDelete={handleComponentDelete}
                onComponentAdd={handleComponentAdd}
                onCanvasStateChange={handleCanvasStateChange}
              />
            </ResizablePanel>

            <ResizableHandle className="w-px bg-gray-300 transition-colors hover:bg-gray-400" />

            {/* 右侧属性面板 */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
              <PropertiesPanelPlaceholder
                selectedComponents={selectedComponents}
                onComponentUpdate={handleComponentUpdate}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* 状态栏 */}
        <DesignerStatusBar canvasState={canvasState} stats={stats} />
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
