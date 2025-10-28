/**
 * 页面设计器中央画布
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useDroppable, DndContext } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3X3,
  Layers,
  MousePointer,
  Move,
  Copy,
  Trash2,
  GripVertical,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { COMPONENT_TYPES, ComponentInstance, DragState } from '@/types/page-designer/component'
import type { CanvasState } from '@/types/page-designer'

// 导入基础组件
import { PageButton, PageInput, PageText, PageImage } from '@/components/lowcode/page-basic'

// 画布配置
const CANVAS_CONFIG = {
  width: 1200, // 固定画布宽度（MVP版本）
  maxWidth: 50, // 最大组件数量限制
  gridSize: 8, // 网格大小（用于对齐）
  minZoom: 0.25,
  maxZoom: 2,
  zoomStep: 0.1,
} as const

// 组件渲染映射
const ComponentRenderers: Record<string, React.FC<any>> = {
  button: PageButton,
  input: PageInput,
  text: PageText,
  image: PageImage,
  // 其他组件类型将在后续实现
  link: PageText,
  heading: PageText,
  paragraph: PageText,
  divider: PageText,
  spacer: PageText,
  container: PageText,
  row: PageText,
  col: PageText,
  form: PageText,
  textarea: PageText,
  select: PageText,
  checkbox: PageText,
  radio: PageText,
  navbar: PageText,
  sidebar: PageText,
  breadcrumb: PageText,
  tabs: PageText,
  list: PageText,
  table: PageText,
  card: PageText,
  grid: PageText,
}

export interface PageCanvasProps {
  className?: string
  components: ComponentInstance[]
  selectedComponentIds: string[]
  canvasState: CanvasState
  dragState: DragState
  onComponentSelect: (id: string) => void
  onComponentUpdate: (id: string, updates: Partial<ComponentInstance>) => void
  onComponentDelete: (id: string) => void
  onComponentAdd: (component: ComponentInstance) => void
  onCanvasStateChange: (updates: Partial<CanvasState>) => void
}

// 可排序组件包装器
const SortableComponentWrapper: React.FC<{
  component: ComponentInstance
  isSelected: boolean
  isHovered?: boolean
  onSelect: (id: string) => void
  onUpdate: (id: string, updates: Partial<ComponentInstance>) => void
  onDelete: (id: string) => void
  onDuplicate?: (id: string) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}> = ({
  component,
  isSelected,
  isHovered = false,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
  })

  const Renderer = ComponentRenderers[component.component_type]

  const handleWrapperClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onSelect(component.id)
    },
    [component.id, onSelect]
  )

  const handleDuplicate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDuplicate?.(component.id)
    },
    [component.id, onDuplicate]
  )

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDelete(component.id)
    },
    [component.id, onDelete]
  )

  if (!Renderer) {
    console.warn(`No renderer found for component type: ${component.component_type}`)
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4">
        <div className="text-sm text-red-600">未知组件类型: {component.component_type}</div>
      </div>
    )
  }

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        'group relative',
        'transition-all duration-200',
        // 基础状态样式
        !isSelected && !isHovered && 'hover:ring-1 hover:ring-gray-300',
        // 选中状态样式
        isSelected && ['ring-2 ring-blue-500 ring-offset-2', 'shadow-lg shadow-blue-500/20'],
        // 拖拽状态
        isDragging && 'z-50 scale-95 opacity-50',
        // 悬停状态
        isHovered && !isSelected && 'ring-1 ring-blue-300'
      )}
      onClick={handleWrapperClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* 组件内容 */}
      <div className={cn('relative', isSelected && 'overflow-hidden rounded-lg')}>
        <Renderer
          id={component.id}
          type={component.component_type}
          props={component.props}
          styles={component.styles}
          events={component.events}
          isSelected={isSelected}
          isDragging={isDragging}
          onSelect={onSelect}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      </div>

      {/* 选中状态的增强视觉反馈 */}
      <AnimatePresence>
        {isSelected && (
          <>
            {/* 选择边框增强 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pointer-events-none absolute inset-0 rounded-lg border-2 border-blue-500"
              style={{
                boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.1), 0 0 20px rgba(59, 130, 246, 0.2)',
              }}
            />

            {/* 拖拽手柄 */}
            <div
              {...listeners}
              className="absolute -left-2 top-1/2 -translate-y-1/2 transform opacity-0 transition-opacity group-hover:opacity-100"
            >
              <div className="flex h-8 w-2 cursor-move items-center justify-center rounded-l bg-blue-500">
                <GripVertical className="h-3 w-3 text-white" />
              </div>
            </div>

            {/* 底部操作手柄 */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 transform opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex items-center space-x-1 rounded bg-blue-500 px-2 py-1 text-xs text-white shadow-lg">
                <span className="max-w-32 truncate">
                  {component.meta.custom_name || component.component_type}
                </span>
                <div className="h-4 w-px bg-blue-400" />
                <button
                  onClick={handleDuplicate}
                  className="rounded p-0.5 transition-colors hover:bg-blue-600"
                  title="复制组件"
                >
                  <Copy className="h-3 w-3" />
                </button>
                <button
                  onClick={handleDelete}
                  className="ml-1 rounded bg-red-500 p-0.5 transition-colors hover:bg-red-600"
                  title="删除组件"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* 左上角选择指示器 */}
            <div className="absolute -left-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-md" />

            {/* 右上角选择指示器 */}
            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-md" />

            {/* 左下角选择指示器 */}
            <div className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-md" />

            {/* 右下角选择指示器 */}
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-md" />
          </>
        )}
      </AnimatePresence>

      {/* 悬停状态的提示 */}
      <AnimatePresence>
        {!isSelected && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute -top-6 left-0 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-lg"
          >
            {component.meta.custom_name || component.component_type}
            <div className="absolute -bottom-1 left-4 h-2 w-2 rotate-45 transform bg-gray-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 空状态组件
const EmptyCanvas: React.FC<{
  onComponentAdd: (type: string) => void
}> = ({ onComponentAdd }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-full flex-col items-center justify-center text-center"
    >
      <div className="mx-auto max-w-md p-8">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
          <Layers className="h-12 w-12 text-gray-400" />
        </div>

        <h3 className="mb-2 text-xl font-semibold text-gray-900">开始设计您的页面</h3>

        <p className="mb-6 text-gray-600">
          从左侧组件面板拖拽组件到这里，或点击下方按钮快速添加基础组件
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onComponentAdd(COMPONENT_TYPES.BUTTON)}
          >
            添加按钮
          </Button>
          <Button variant="outline" size="sm" onClick={() => onComponentAdd(COMPONENT_TYPES.TEXT)}>
            添加文本
          </Button>
          <Button variant="outline" size="sm" onClick={() => onComponentAdd(COMPONENT_TYPES.IMAGE)}>
            添加图片
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// 缩放控制组件
const ZoomControls: React.FC<{
  zoom: number
  onZoomChange: (zoom: number) => void
  onReset: () => void
}> = ({ zoom, onZoomChange, onReset }) => {
  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + CANVAS_CONFIG.zoomStep, CANVAS_CONFIG.maxZoom)
    console.log('Zooming in:', { currentZoom: zoom, newZoom })
    onZoomChange(newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - CANVAS_CONFIG.zoomStep, CANVAS_CONFIG.minZoom)
    console.log('Zooming out:', { currentZoom: zoom, newZoom })
    onZoomChange(newZoom)
  }

  const handleReset = () => {
    console.log('Resetting zoom')
    onReset()
  }

  return (
    <div className="absolute bottom-4 right-4 z-20 flex items-center space-x-2 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomOut}
        disabled={zoom <= CANVAS_CONFIG.minZoom}
        className="h-8 w-8 p-0"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>

      <div className="min-w-[60px] text-center">
        <span className="text-sm font-medium text-gray-700">{Math.round(zoom * 100)}%</span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomIn}
        disabled={zoom >= CANVAS_CONFIG.maxZoom}
        className="h-8 w-8 p-0"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-6 w-px bg-gray-300" />

      <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 w-8 p-0">
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

// 画布工具栏
const CanvasToolbar: React.FC<{
  showGrid: boolean
  onToggleGrid: () => void
}> = ({ showGrid, onToggleGrid }) => {
  return (
    <div className="absolute right-4 top-4 z-20 flex items-center space-x-2 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
      <Button
        variant={showGrid ? 'default' : 'ghost'}
        size="sm"
        onClick={onToggleGrid}
        className="h-8 px-3"
      >
        <Grid3X3 className="mr-1 h-4 w-4" />
        网格
      </Button>
    </div>
  )
}

export const PageCanvas: React.FC<PageCanvasProps> = ({
  className,
  components,
  selectedComponentIds,
  canvasState,
  dragState,
  onComponentSelect,
  onComponentUpdate,
  onComponentDelete,
  onComponentAdd,
  onCanvasStateChange,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isOver, setIsOver] = useState(false)
  const [hoveredComponentId, setHoveredComponentId] = useState<string | null>(null)
  const [orderedComponents, setOrderedComponents] = useState(components)

  // 设置拖拽区域
  const { setNodeRef, isOver: isDroppableOver } = useDroppable({
    id: 'canvas',
    data: {
      accepts: ['component'],
      dropZoneType: 'canvas',
    },
  })

  // 处理组件选择
  const handleComponentSelect = useCallback(
    (id: string) => {
      onComponentSelect(id)
    },
    [onComponentSelect]
  )

  // 处理组件更新
  const handleComponentUpdate = useCallback(
    (id: string, updates: Partial<ComponentInstance>) => {
      onComponentUpdate(id, updates)
    },
    [onComponentUpdate]
  )

  // 处理组件删除
  const handleComponentDelete = useCallback(
    (id: string) => {
      onComponentDelete(id)
    },
    [onComponentDelete]
  )

  // 处理组件复制
  const handleComponentDuplicate = useCallback(
    (id: string) => {
      const component = components.find(c => c.id === id)
      if (!component) return

      const now = new Date().toISOString()
      const duplicatedComponent: ComponentInstance = {
        ...component,
        id: `component-${Date.now()}`,
        position: {
          ...component.position,
          order: components.length,
        },
        created_at: now,
        updated_at: now,
        meta: {
          ...component.meta,
          custom_name: component.meta.custom_name
            ? `${component.meta.custom_name} 副本`
            : `${component.component_type} 副本`,
        },
      }

      onComponentAdd(duplicatedComponent)
    },
    [components, onComponentAdd]
  )

  // 处理悬停状态
  const handleComponentHover = useCallback((id: string | null) => {
    setHoveredComponentId(id)
  }, [])

  // 处理快速添加组件
  const handleQuickAddComponent = useCallback(
    (type: string) => {
      const now = new Date().toISOString()
      const newComponent: ComponentInstance = {
        id: `component-${Date.now()}`,
        page_design_id: '', // 需要从上下文获取
        component_type: type as any,
        position: {
          z_index: components.length,
          order: components.length,
        },
        props: getDefaultProps(type),
        styles: getDefaultStyles(type),
        events: {},
        responsive: {},
        created_at: now,
        updated_at: now,
        version: 1,
        meta: {
          locked: false,
          hidden: false,
        },
      }

      onComponentAdd(newComponent)
    },
    [components.length, onComponentAdd]
  )

  // 处理缩放变化
  const handleZoomChange = useCallback(
    (zoom: number) => {
      console.log('PageCanvas: handleZoomChange called with zoom:', zoom)
      onCanvasStateChange({ zoom })
    },
    [onCanvasStateChange]
  )

  // 处理重置视图
  const handleResetView = useCallback(() => {
    console.log('PageCanvas: handleResetView called')
    onCanvasStateChange({
      zoom: 1,
      pan: { x: 0, y: 0 },
    })
  }, [onCanvasStateChange])

  // 处理网格切换
  const handleToggleGrid = useCallback(() => {
    onCanvasStateChange({ showGrid: !canvasState.showGrid })
  }, [canvasState.showGrid, onCanvasStateChange])

  // 监听悬停状态
  useEffect(() => {
    setIsOver(isDroppableOver)
  }, [isDroppableOver])

  // 同步组件顺序 - 确保组件按照order属性排序
  useEffect(() => {
    const sortedComponents = [...components].sort((a, b) => a.position.order - b.position.order)
    setOrderedComponents(sortedComponents)
  }, [components])

  // 处理组件拖拽排序
  const handleDragEnd = useCallback(
    (event: any) => {
      const { active, over } = event

      // 如果是组件面板的拖拽，不处理排序
      if (
        typeof active.id === 'string' &&
        active.id.startsWith('component-') &&
        !components.find(c => c.id === active.id)
      ) {
        return
      }

      if (active && over && active.id !== over.id) {
        const oldIndex = orderedComponents.findIndex(item => item.id === active.id)
        const newIndex = orderedComponents.findIndex(item => item.id === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          const newComponents = arrayMove(orderedComponents, oldIndex, newIndex)
          setOrderedComponents(newComponents)

          // 更新所有组件的order属性
          newComponents.forEach((component, index) => {
            onComponentUpdate(component.id, {
              position: { ...component.position, order: index },
            })
          })
        }
      }
    },
    [orderedComponents, onComponentUpdate, components]
  )

  // 获取默认组件属性
  const getDefaultProps = (type: string) => {
    switch (type) {
      case 'button':
        return { button: { text: '按钮', variant: 'primary' as const, size: 'md' as const } }
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
        display: 'inline-block' as const,
      }
    }

    return baseStyles
  }

  const canvasScale = canvasState.zoom
  const isDraggingOver = dragState.isDragging && isOver

  return (
    <div className={cn('relative flex-1 overflow-hidden bg-gray-50', className)}>
      {/* 画布工具栏 */}
      <CanvasToolbar showGrid={canvasState.showGrid} onToggleGrid={handleToggleGrid} />

      {/* 主画布区域 */}
      <ScrollArea className="h-full">
        <div ref={canvasRef} className="flex min-h-full justify-center p-8">
          <motion.div
            ref={setNodeRef}
            className="relative bg-white shadow-xl"
            style={{
              width: CANVAS_CONFIG.width,
              minHeight: 600,
              transform: `scale(${canvasScale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease-out',
            }}
          >
            {/* 网格背景 */}
            {canvasState.showGrid && (
              <div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                  `,
                  backgroundSize: `${CANVAS_CONFIG.gridSize}px ${CANVAS_CONFIG.gridSize}px`,
                }}
              />
            )}

            {/* 拖拽时的视觉反馈 */}
            <AnimatePresence>
              {isDraggingOver && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50"
                >
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center text-blue-600">
                      <Move className="mx-auto mb-2 h-8 w-8" />
                      <p className="text-sm font-medium">释放以添加组件</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 组件渲染区域 */}
            <div className="relative p-6">
              {components.length === 0 ? (
                <EmptyCanvas onComponentAdd={handleQuickAddComponent} />
              ) : (
                <DndContext onDragEnd={handleDragEnd} autoScroll={true}>
                  <SortableContext
                    items={orderedComponents.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      <AnimatePresence>
                        {orderedComponents.map(component => (
                          <SortableComponentWrapper
                            key={component.id}
                            component={component}
                            isSelected={selectedComponentIds.includes(component.id)}
                            isHovered={hoveredComponentId === component.id}
                            onSelect={handleComponentSelect}
                            onUpdate={handleComponentUpdate}
                            onDelete={handleComponentDelete}
                            onDuplicate={handleComponentDuplicate}
                            onMouseEnter={() => handleComponentHover(component.id)}
                            onMouseLeave={() => handleComponentHover(null)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            {/* 组件数量指示器 */}
            {components.length > 0 && (
              <div className="absolute left-2 top-2 rounded bg-gray-800 px-2 py-1 text-xs text-white">
                {components.length} / {CANVAS_CONFIG.maxWidth} 个组件
              </div>
            )}
          </motion.div>
        </div>
      </ScrollArea>

      {/* 缩放控制 */}
      <ZoomControls zoom={canvasScale} onZoomChange={handleZoomChange} onReset={handleResetView} />
    </div>
  )
}
