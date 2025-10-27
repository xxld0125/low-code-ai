/**
 * 页面设计器拖拽提供者
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import React, { createContext, useContext, useCallback, useState, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DragCancelEvent,
  CollisionDetection,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { ComponentType, DragItem, DragState } from '@/types/page-designer/component'

// 拖拽上下文接口
interface PageDesignerContextValue {
  dragState: DragState
  activeDragItem: DragItem | null
  sensors: any
  handleDragStart: (event: DragStartEvent) => void
  handleDragOver: (event: DragOverEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
  handleDragCancel: (event: DragCancelEvent) => void
}

const PageDesignerContext = createContext<PageDesignerContextValue | null>(null)

// 拖拽提供者属性接口
export interface PageDesignerProviderProps {
  children: React.ReactNode
  onDragStart?: (dragData: DragItem) => void
  onDragEnd?: (dragData: DragItem | null, dropData: any) => void
  onDragOver?: (dragData: DragItem, dropData: any) => void
  onDragCancel?: (dragData: DragItem | null) => void
  collisionDetection?: CollisionDetection
  dropAnimation?: DropAnimation | null
}

// 自定义碰撞检测算法
const customCollisionDetection: CollisionDetection = args => {
  const { active, droppableContainers } = args

  // 首先尝试中心点最近距离
  const centerCollisions = closestCenter({
    active,
    droppableContainers,
  } as any)

  if (centerCollisions.length > 0) {
    return centerCollisions
  }

  // 如果没有找到中心点碰撞，返回空数组
  return []
}

// 默认拖拽动画配置
const defaultDropAnimation: DropAnimation = {
  duration: 250,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
}

export const PageDesignerProvider: React.FC<PageDesignerProviderProps> = ({
  children,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragCancel,
  collisionDetection = customCollisionDetection,
  dropAnimation = defaultDropAnimation,
}) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    activeId: null,
    draggedComponentType: null,
    dropZoneId: null,
    position: undefined,
  })

  const [activeDragItem, setActiveDragItem] = useState<DragItem | null>(null)
  const dragStartTime = useRef<number>(0)

  // 配置拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px距离才激活拖拽，避免误操作
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 处理拖拽开始
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event
      const dragData = active.data.current as DragItem

      if (!dragData) {
        console.warn('No drag data found for active item:', active.id)
        return
      }

      dragStartTime.current = Date.now()

      const newDragState: DragState = {
        isDragging: true,
        activeId: active.id.toString(),
        draggedComponentType: dragData.type,
        dropZoneId: null,
        position: undefined,
      }

      setDragState(newDragState)
      setActiveDragItem(dragData)

      // 触发外部回调
      onDragStart?.(dragData)

      // 添加拖拽开始的全局样式
      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'
    },
    [onDragStart]
  )

  // 处理拖拽悬停
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event

      if (!over || !activeDragItem) return

      const dropData = over.data.current
      const newDragState: DragState = {
        ...dragState,
        dropZoneId: over.id as string,
        position: {
          x: event.delta.x,
          y: event.delta.y,
        },
      }

      setDragState(newDragState)

      // 触发外部回调
      onDragOver?.(activeDragItem, dropData)
    },
    [activeDragItem, dragState, onDragOver]
  )

  // 处理拖拽结束
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      const dragDuration = Date.now() - dragStartTime.current

      // 重置拖拽状态
      setDragState({
        isDragging: false,
        activeId: null,
        draggedComponentType: null,
        dropZoneId: null,
        position: undefined,
      })

      // 恢复全局样式
      document.body.style.cursor = ''
      document.body.style.userSelect = ''

      let dropData = null
      if (over) {
        dropData = over.data.current
      }

      // 触发外部回调
      onDragEnd?.(activeDragItem, dropData)

      // 延迟清除活动拖拽项目，允许动画完成
      setTimeout(() => {
        setActiveDragItem(null)
      }, 100)

      // 性能监控
      if (process.env.NODE_ENV === 'development') {
        console.log(`Drag completed in ${dragDuration}ms`)
      }
    },
    [activeDragItem, onDragEnd]
  )

  // 处理拖拽取消
  const handleDragCancel = useCallback(
    (event: DragCancelEvent) => {
      // 重置拖拽状态
      setDragState({
        isDragging: false,
        activeId: null,
        draggedComponentType: null,
        dropZoneId: null,
        position: undefined,
      })

      // 恢复全局样式
      document.body.style.cursor = ''
      document.body.style.userSelect = ''

      // 触发外部回调
      onDragCancel?.(activeDragItem)

      // 清除活动拖拽项目
      setActiveDragItem(null)

      if (process.env.NODE_ENV === 'development') {
        console.log('Drag cancelled')
      }
    },
    [activeDragItem, onDragCancel]
  )

  // 渲染拖拽预览组件
  const renderDragOverlay = () => {
    if (!activeDragItem) return null

    // 根据组件类型渲染不同的预览
    const renderPreview = (type: string) => {
      switch (type) {
        case 'button':
          return (
            <div className="pointer-events-none rounded-lg bg-blue-500 px-4 py-2 text-white shadow-lg">
              按钮
            </div>
          )
        case 'input':
          return (
            <div className="pointer-events-none rounded border border-gray-300 bg-white px-3 py-2 shadow-lg">
              <div className="h-4 rounded bg-gray-200"></div>
            </div>
          )
        case 'text':
          return (
            <div className="pointer-events-none rounded bg-white px-3 py-2 shadow-lg">
              <div className="text-sm">文本内容</div>
            </div>
          )
        case 'image':
          return (
            <div className="pointer-events-none rounded border border-gray-300 bg-gray-100 shadow-lg">
              <div className="flex h-16 w-24 items-center justify-center">
                <span className="text-xs text-gray-500">图片</span>
              </div>
            </div>
          )
        default:
          return (
            <div className="pointer-events-none rounded border border-gray-300 bg-white px-3 py-2 shadow-lg">
              <span className="text-sm text-gray-600">{type}</span>
            </div>
          )
      }
    }

    return (
      <DragOverlay dropAnimation={dropAnimation}>
        <div className="rotate-2 transform opacity-90">{renderPreview(activeDragItem.type)}</div>
      </DragOverlay>
    )
  }

  const contextValue: PageDesignerContextValue = {
    dragState,
    activeDragItem,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  }

  return (
    <PageDesignerContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
        {renderDragOverlay()}
      </DndContext>
    </PageDesignerContext.Provider>
  )
}

// Hook to use the page designer context
export const usePageDesigner = () => {
  const context = useContext(PageDesignerContext)
  if (!context) {
    throw new Error('usePageDesigner must be used within a PageDesignerProvider')
  }
  return context
}

// Hook to get drag state
export const useDragState = () => {
  const { dragState } = usePageDesigner()
  return dragState
}

// Hook to check if dragging
export const useIsDragging = () => {
  const { dragState } = usePageDesigner()
  return dragState.isDragging
}

// Hook to get active drag item
export const useActiveDragItem = () => {
  const { activeDragItem } = usePageDesigner()
  return activeDragItem
}
