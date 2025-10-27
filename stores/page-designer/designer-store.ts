import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import type {
  ComponentInstance as TypeComponentInstance,
  ComponentType,
} from '@/types/page-designer/component'

// 类型定义
export interface PageDesign {
  id: string
  name: string
  description?: string
  user_id: string
  config: {
    title: string
    meta?: {
      description?: string
      keywords?: string[]
      author?: string
    }
    styles?: {
      theme: 'light' | 'dark' | 'auto'
      backgroundColor?: string
      backgroundImage?: string
      spacing: 'compact' | 'normal' | 'relaxed'
    }
    layout?: {
      maxWidth?: number
      padding: { top: number; right: number; bottom: number; left: number }
      centered: boolean
    }
  }
  root_component_id: string
  component_tree: any
  created_at: string
  updated_at: string
  version: number
  status: 'draft' | 'published' | 'archived'
  thumbnail_url?: string
  shared_with: string[]
  tags: string[]
}

// 使用 types 文件中的 ComponentInstance 类型
export type ComponentInstance = TypeComponentInstance

export interface CanvasState {
  zoom: number
  pan: { x: number; y: number }
  gridSize: number
  showGrid: boolean
  canvasWidth: number
  canvasHeight: number
}

export interface DragState {
  isDragging: boolean
  draggedComponentType: ComponentType | null
  draggedComponentId: string | undefined
  dropZoneId: string | undefined
  dragPosition: { x: number; y: number } | null
  isValidDrop: boolean
}

export interface SelectionState {
  selectedComponentIds: string[]
  hoveredComponentId: string | null
  copiedComponent: ComponentInstance | null
  selectionRect: {
    x: number
    y: number
    width: number
    height: number
  } | null
}

export interface HistoryState {
  past: Partial<DesignerState>[]
  present: Partial<DesignerState>
  future: Partial<DesignerState>[]
  maxSize: number
}

export interface DesignerState {
  // 页面设计
  currentPageId: string | null
  pageDesigns: Record<string, PageDesign>

  // 组件管理
  components: Record<string, ComponentInstance>

  // 画布状态
  canvas: CanvasState

  // 拖拽状态
  dragState: DragState

  // 选择状态
  selectionState: SelectionState

  // 历史记录
  historyState: HistoryState

  // UI状态
  uiState: {
    leftPanelWidth: number
    rightPanelWidth: number
    showComponentPanel: boolean
    showPropertiesPanel: boolean
    showAlignmentGuides: boolean
    showMiniMap: boolean
    activeBreakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    theme: 'light' | 'dark' | 'auto'
  }

  // 加载状态
  loadingState: {
    isLoading: boolean
    isSaving: boolean
    error: string | null
    lastSaved: string | null
  }
}

export interface DesignerActions {
  // 页面设计操作
  setPageDesign: (pageDesign: PageDesign) => void
  createPageDesign: (name: string, description?: string) => Promise<string>
  updatePageDesign: (id: string, updates: Partial<PageDesign>) => void
  deletePageDesign: (id: string) => void
  loadPageDesign: (id: string) => Promise<void>

  // 组件操作
  addComponent: (component: ComponentInstance) => void
  addComponentFromType: (
    type: ComponentType,
    parentId?: string,
    position?: { x: number; y: number }
  ) => string
  updateComponent: (id: string, updates: Partial<ComponentInstance>) => void
  deleteComponent: (id: string) => void
  moveComponent: (id: string, newParentId: string | null, newPosition: number) => void
  duplicateComponent: (id: string) => void

  // 选择操作
  selectComponent: (id: string, multi?: boolean) => void
  selectComponents: (ids: string[]) => void
  clearSelection: () => void
  selectAll: () => void
  setHoveredComponent: (id: string | null) => void

  // 拖拽操作
  startDrag: (type: ComponentType, componentType?: ComponentType, componentId?: string) => void
  updateDrag: (position: { x: number; y: number }, dropZoneId?: string) => void
  endDrag: () => void

  // 画布操作
  setZoom: (zoom: number) => void
  setPan: (pan: { x: number; y: number }) => void
  setGridSize: (size: number) => void
  toggleGrid: () => void
  setCanvasSize: (width: number, height: number) => void

  // 历史操作
  undo: () => void
  redo: () => void
  saveToHistory: () => void
  clearHistory: () => void

  // UI操作
  setLeftPanelWidth: (width: number) => void
  setRightPanelWidth: (width: number) => void
  toggleComponentPanel: () => void
  togglePropertiesPanel: () => void
  toggleAlignmentGuides: () => void
  toggleMiniMap: () => void
  setActiveBreakpoint: (breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl') => void
  setTheme: (theme: 'light' | 'dark' | 'auto') => void

  // 加载操作
  setLoading: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  updateLastSaved: () => void

  // 批量操作
  batchUpdate: (
    updates: Array<{
      type: 'component' | 'page'
      id: string
      data: any
    }>
  ) => void
}

export type DesignerStore = DesignerState & DesignerActions

// 创建设计器状态
export const useDesignerStore = create<DesignerStore>()(
  subscribeWithSelector(
    devtools(
      set => ({
        // 初始状态
        currentPageId: null,
        pageDesigns: {},
        components: {},
        canvas: {
          zoom: 1,
          pan: { x: 0, y: 0 },
          gridSize: 8,
          showGrid: true,
          canvasWidth: 1200,
          canvasHeight: 800,
        },
        dragState: {
          isDragging: false,
          draggedComponentType: null,
          draggedComponentId: undefined,
          dropZoneId: undefined,
          dragPosition: null,
          isValidDrop: false,
        },
        selectionState: {
          selectedComponentIds: [],
          hoveredComponentId: null,
          copiedComponent: null,
          selectionRect: null,
        },
        historyState: {
          past: [],
          present: {},
          future: [],
          maxSize: 50,
        },
        uiState: {
          leftPanelWidth: 280,
          rightPanelWidth: 320,
          showComponentPanel: true,
          showPropertiesPanel: true,
          showAlignmentGuides: true,
          showMiniMap: false,
          activeBreakpoint: 'lg',
          theme: 'light',
        },
        loadingState: {
          isLoading: false,
          isSaving: false,
          error: null,
          lastSaved: null,
        },

        // 页面设计操作
        setPageDesign: pageDesign =>
          set(state => ({
            currentPageId: pageDesign.id,
            pageDesigns: {
              ...state.pageDesigns,
              [pageDesign.id]: pageDesign,
            },
          })),

        createPageDesign: async (name, description) => {
          set(state => ({
            loadingState: { ...state.loadingState, isLoading: true, error: null },
          }))

          try {
            const response = await fetch('/api/page-designer/page-designs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name,
                description,
                config: {
                  title: name,
                  styles: { theme: 'light', spacing: 'normal' },
                  layout: { padding: { top: 0, right: 0, bottom: 0, left: 0 }, centered: false },
                },
              }),
            })

            if (!response.ok) throw new Error('创建页面设计失败')

            const { data } = await response.json()

            set(state => ({
              currentPageId: data.id,
              pageDesigns: { ...state.pageDesigns, [data.id]: data },
              loadingState: { ...state.loadingState, isLoading: false },
            }))

            return data.id
          } catch (error) {
            set(state => ({
              loadingState: {
                ...state.loadingState,
                isLoading: false,
                error: error instanceof Error ? error.message : '创建失败',
              },
            }))
            throw error
          }
        },

        updatePageDesign: (id, updates) =>
          set(state => ({
            pageDesigns: {
              ...state.pageDesigns,
              [id]: { ...state.pageDesigns[id], ...updates },
            },
          })),

        deletePageDesign: id =>
          set(state => {
            const newPageDesigns = { ...state.pageDesigns }
            delete newPageDesigns[id]
            return {
              pageDesigns: newPageDesigns,
              currentPageId: state.currentPageId === id ? null : state.currentPageId,
            }
          }),

        loadPageDesign: async id => {
          set(state => ({
            loadingState: { ...state.loadingState, isLoading: true, error: null },
          }))

          try {
            const response = await fetch(`/api/page-designer/page-designs/${id}`)
            if (!response.ok) throw new Error('加载页面设计失败')

            const { data } = await response.json()

            // 构建组件映射
            const components: Record<string, ComponentInstance> = {}
            data.component_instances?.forEach((component: ComponentInstance) => {
              components[component.id] = component
            })

            set(state => ({
              currentPageId: id,
              pageDesigns: { ...state.pageDesigns, [id]: data },
              components,
              loadingState: { ...state.loadingState, isLoading: false },
            }))
          } catch (error) {
            set(state => ({
              loadingState: {
                ...state.loadingState,
                isLoading: false,
                error: error instanceof Error ? error.message : '加载失败',
              },
            }))
            throw error
          }
        },

        // 组件操作
        addComponent: component =>
          set(state => ({
            components: {
              ...state.components,
              [component.id]: component,
            },
          })),

        // 新增：从组件类型添加组件（用于拖拽）
        addComponentFromType: (type, parentId, position) => {
          const id = `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          const now = new Date().toISOString()

          // 获取默认属性和样式
          const getDefaultProps = (componentType: ComponentType) => {
            switch (componentType) {
              case 'button':
                return {
                  button: { text: '按钮', variant: 'primary' as const, size: 'md' as const },
                }
              case 'input':
                return { input: { placeholder: '请输入内容', type: 'text' as const } }
              case 'text':
                return { text: { content: '文本内容', variant: 'body' as const } }
              case 'image':
                return { image: { src: '/api/placeholder/300/200', alt: '图片' } }
              default:
                return {}
            }
          }

          const getDefaultStyles = (componentType: ComponentType) => {
            return {
              margin: { bottom: 16 },
            }
          }

          const newComponent: ComponentInstance = {
            id,
            component_type: type,
            page_design_id: 'current-page', // 临时值
            parent_id: parentId,
            position: {
              z_index: 0,
              order: 0,
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

          set(state => {
            // 检查组件数量限制
            const componentCount = Object.keys(state.components).length
            if (componentCount >= 50) {
              throw new Error('已达到最大组件数量限制（50个）')
            }

            state.components[id] = newComponent

            // 如果指定了父组件，更新父组件的子组件顺序
            if (parentId && state.components[parentId]) {
              const parentChildren = Object.values(state.components)
                .filter(c => c.parent_id === parentId)
                .sort((a, b) => a.position.order - b.position.order)

              newComponent.position.order = parentChildren.length
            }

            // 自动选中新添加的组件
            state.selectionState.selectedComponentIds = [id]

            return state
          })

          return id
        },

        updateComponent: (id, updates) =>
          set(state => ({
            components: {
              ...state.components,
              [id]: { ...state.components[id], ...updates },
            },
          })),

        deleteComponent: id =>
          set(state => {
            const newComponents = { ...state.components }
            delete newComponents[id]

            // 递归删除子组件
            const deleteChildren = (parentId: string) => {
              Object.values(newComponents).forEach(component => {
                if (component.parent_id === parentId) {
                  delete newComponents[component.id]
                  deleteChildren(component.id)
                }
              })
            }
            deleteChildren(id)

            return {
              components: newComponents,
              selectionState: {
                ...state.selectionState,
                selectedComponentIds: state.selectionState.selectedComponentIds.filter(
                  selectedId => selectedId !== id
                ),
              },
            }
          }),

        moveComponent: (id, newParentId, newPosition) =>
          set((state): Partial<DesignerStore> => {
            const component = state.components[id]
            if (!component) return state

            return {
              components: {
                ...state.components,
                [id]: {
                  ...component,
                  parent_id: newParentId,
                  position: { ...component.position, order: newPosition },
                } as ComponentInstance,
              },
            }
          }),

        duplicateComponent: id =>
          set(state => {
            const component = state.components[id]
            if (!component) return state

            const newId = `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            const newComponent: ComponentInstance = {
              ...component,
              id: newId,
              position: {
                ...component.position,
                order: component.position.order + 1,
                z_index: component.position.z_index + 1,
              },
              meta: {
                ...component.meta,
                custom_name: component.meta.custom_name
                  ? `${component.meta.custom_name} (副本)`
                  : undefined,
              },
            }

            return {
              components: {
                ...state.components,
                [newId]: newComponent,
              },
              selectionState: {
                ...state.selectionState,
                selectedComponentIds: [newId],
              },
            }
          }),

        // 选择操作
        selectComponent: (id, multi = false) =>
          set(state => ({
            selectionState: {
              ...state.selectionState,
              selectedComponentIds: multi
                ? state.selectionState.selectedComponentIds.includes(id)
                  ? state.selectionState.selectedComponentIds.filter(
                      selectedId => selectedId !== id
                    )
                  : [...state.selectionState.selectedComponentIds, id]
                : [id],
            },
          })),

        selectComponents: ids =>
          set(state => ({
            selectionState: {
              ...state.selectionState,
              selectedComponentIds: ids,
            },
          })),

        clearSelection: () =>
          set(state => ({
            selectionState: {
              ...state.selectionState,
              selectedComponentIds: [],
              selectionRect: null,
            },
          })),

        selectAll: () =>
          set(state => ({
            selectionState: {
              ...state.selectionState,
              selectedComponentIds: Object.values(state.components)
                .filter(component => !component.parent_id)
                .map(component => component.id),
            },
          })),

        setHoveredComponent: id =>
          set(state => ({
            selectionState: {
              ...state.selectionState,
              hoveredComponentId: id,
            },
          })),

        // 拖拽操作
        startDrag: (type, componentType, componentId) =>
          set(state => ({
            dragState: {
              ...state.dragState,
              isDragging: true,
              draggedComponentType: componentType || type,
              draggedComponentId: componentId,
              dropZoneId: undefined,
              dragPosition: null,
              isValidDrop: false,
            },
          })),

        updateDrag: (position, dropZoneId) =>
          set(state => ({
            dragState: {
              ...state.dragState,
              dragPosition: position,
              dropZoneId,
              isValidDrop: !!dropZoneId,
            },
          })),

        endDrag: () =>
          set(state => ({
            dragState: {
              ...state.dragState,
              isDragging: false,
              draggedComponentType: null,
              draggedComponentId: undefined,
              dropZoneId: undefined,
              dragPosition: null,
              isValidDrop: false,
            },
          })),

        // 画布操作
        setZoom: zoom =>
          set(state => ({
            canvas: { ...state.canvas, zoom: Math.max(0.1, Math.min(3, zoom)) },
          })),

        setPan: pan =>
          set(state => ({
            canvas: { ...state.canvas, pan },
          })),

        setGridSize: size =>
          set(state => ({
            canvas: { ...state.canvas, gridSize: size },
          })),

        toggleGrid: () =>
          set(state => ({
            canvas: { ...state.canvas, showGrid: !state.canvas.showGrid },
          })),

        setCanvasSize: (width, height) =>
          set(state => ({
            canvas: { ...state.canvas, canvasWidth: width, canvasHeight: height },
          })),

        // 历史操作
        undo: () =>
          set(state => {
            const { past, present, future } = state.historyState
            if (past.length === 0) return state

            const previous = past[past.length - 1]
            const newPast = past.slice(0, past.length - 1)

            return {
              historyState: {
                past: newPast,
                present: previous,
                future: [present, ...future],
                maxSize: state.historyState.maxSize,
              },
              ...previous,
            }
          }),

        redo: () =>
          set(state => {
            const { past, present, future } = state.historyState
            if (future.length === 0) return state

            const next = future[0]
            const newFuture = future.slice(1)

            return {
              historyState: {
                past: [...past, present],
                present: next,
                future: newFuture,
                maxSize: state.historyState.maxSize,
              },
              ...next,
            }
          }),

        saveToHistory: () =>
          set(state => {
            const { past, maxSize } = state.historyState

            // 创建当前状态快照
            const currentState = {
              components: state.components,
              pageDesigns: state.pageDesigns,
            }

            const newPast = [...past, currentState].slice(-maxSize)

            return {
              historyState: {
                past: newPast,
                present: currentState,
                future: [],
                maxSize,
              },
            }
          }),

        clearHistory: () =>
          set(state => ({
            historyState: {
              past: [],
              present: {},
              future: [],
              maxSize: state.historyState.maxSize,
            },
          })),

        // UI操作
        setLeftPanelWidth: width =>
          set(state => ({
            uiState: { ...state.uiState, leftPanelWidth: width },
          })),

        setRightPanelWidth: width =>
          set(state => ({
            uiState: { ...state.uiState, rightPanelWidth: width },
          })),

        toggleComponentPanel: () =>
          set(state => ({
            uiState: { ...state.uiState, showComponentPanel: !state.uiState.showComponentPanel },
          })),

        togglePropertiesPanel: () =>
          set(state => ({
            uiState: { ...state.uiState, showPropertiesPanel: !state.uiState.showPropertiesPanel },
          })),

        toggleAlignmentGuides: () =>
          set(state => ({
            uiState: { ...state.uiState, showAlignmentGuides: !state.uiState.showAlignmentGuides },
          })),

        toggleMiniMap: () =>
          set(state => ({
            uiState: { ...state.uiState, showMiniMap: !state.uiState.showMiniMap },
          })),

        setActiveBreakpoint: breakpoint =>
          set(state => ({
            uiState: { ...state.uiState, activeBreakpoint: breakpoint },
          })),

        setTheme: theme =>
          set(state => ({
            uiState: { ...state.uiState, theme },
          })),

        // 加载操作
        setLoading: loading =>
          set(state => ({
            loadingState: { ...state.loadingState, isLoading: loading },
          })),

        setSaving: saving =>
          set(state => ({
            loadingState: { ...state.loadingState, isSaving: saving },
          })),

        setError: error =>
          set(state => ({
            loadingState: { ...state.loadingState, error },
          })),

        clearError: () =>
          set(state => ({
            loadingState: { ...state.loadingState, error: null },
          })),

        updateLastSaved: () =>
          set(state => ({
            loadingState: { ...state.loadingState, lastSaved: new Date().toISOString() },
          })),

        // 批量操作
        batchUpdate: updates =>
          set(state => {
            let newComponents = { ...state.components }
            let newPageDesigns = { ...state.pageDesigns }

            updates.forEach(update => {
              if (update.type === 'component') {
                newComponents = {
                  ...newComponents,
                  [update.id]: { ...newComponents[update.id], ...update.data },
                }
              } else if (update.type === 'page') {
                newPageDesigns = {
                  ...newPageDesigns,
                  [update.id]: { ...newPageDesigns[update.id], ...update.data },
                }
              }
            })

            return {
              components: newComponents,
              pageDesigns: newPageDesigns,
            }
          }),
      }),
      { name: 'designer-store' }
    )
  )
)
