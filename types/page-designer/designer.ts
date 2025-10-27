// 页面设计器核心类型定义

import { ComponentTree } from './component'

// 页面设计状态
export type PageDesignStatus = 'draft' | 'published' | 'archived'

// 组件实例（简化版本，避免循环依赖）
export interface ComponentInstance {
  id: string
  page_design_id: string
  component_type: string
  parent_id?: string | null

  // 层级和位置
  position: {
    z_index: number
    order: number
  }

  // 组件属性
  props: Record<string, any>
  styles: Record<string, any>
  events: Record<string, any>

  // 响应式配置
  responsive: Record<string, any>

  // 布局属性（仅对布局组件有效）
  layout_props?: Record<string, any>

  // 系统字段
  created_at: string
  updated_at: string
  version: number

  // 元数据
  meta: {
    locked: boolean
    hidden: boolean
    custom_name?: string
    notes?: string
  }
}

// 页面设计配置
export interface PageDesignConfig {
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

// 页面设计实体
export interface PageDesign {
  id: string
  name: string
  description?: string
  user_id: string

  // 页面配置
  config: PageDesignConfig

  // 组件树结构
  root_component_id: string
  component_tree: ComponentTree

  // 系统字段
  created_at: string
  updated_at: string
  version: number
  status: PageDesignStatus
  thumbnail_url?: string

  // 协作字段
  shared_with: string[]
  tags: string[]
}

// 设计历史实体
export interface DesignHistory {
  id: string
  page_design_id: string
  user_id: string

  // 操作信息
  action: HistoryAction
  description: string

  // 状态快照
  before_state: ComponentTree
  after_state: ComponentTree

  // 影响的组件
  affected_components: string[]

  // 系统字段
  created_at: string
  session_id?: string
}

export type HistoryAction =
  | 'create_component'
  | 'update_component'
  | 'delete_component'
  | 'move_component'
  | 'copy_component'
  | 'paste_component'
  | 'undo'
  | 'redo'
  | 'batch_operation'

// 画布状态
export interface CanvasState {
  zoom: number
  pan: { x: number; y: number }
  gridSize: number
  showGrid: boolean
  canvasWidth: number
  canvasHeight: number
  viewportWidth: number
  viewportHeight: number
}

// 拖拽状态
export interface DragState {
  isDragging: boolean
  draggedComponentType: string | null
  draggedComponentId: string | null
  dropZoneId: string | null
  dragPosition: { x: number; y: number } | null
  isValidDrop: boolean
  dragType: 'new' | 'move'
  originalPosition?: {
    parent_id?: string
    order: number
  }
}

// 选择状态
export interface SelectionState {
  selectedComponentIds: string[]
  hoveredComponentId: string | null
  activeComponentId: string | null
  selectionRect: {
    x: number
    y: number
    width: number
    height: number
  } | null
  isMultiSelecting: boolean
}

// UI状态
export interface DesignerUIState {
  // 面板状态
  leftPanelWidth: number
  rightPanelWidth: number
  showComponentPanel: boolean
  showPropertiesPanel: boolean
  showLayersPanel: boolean

  // 工具栏状态
  showToolbar: boolean
  showAlignmentGuides: boolean
  showMiniMap: boolean
  showRulers: boolean

  // 响应式状态
  activeBreakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  previewMode: boolean
  devicePreview: 'desktop' | 'tablet' | 'mobile'

  // 主题状态
  theme: 'light' | 'dark' | 'auto'
  highContrast: boolean

  // 编辑状态
  readonly: boolean
  showCode: boolean
  splitView: boolean
}

// 加载状态
export interface LoadingState {
  isLoading: boolean
  isSaving: boolean
  isValidating: boolean
  isPublishing: boolean
  error: string | null
  lastSaved: string | null
  saveStatus: 'saved' | 'saving' | 'error' | 'unsaved'
}

// 设计器完整状态
export interface DesignerState {
  // 当前页面
  currentPageId: string | null
  pageDesigns: Record<string, PageDesign>

  // 组件管理
  components: Record<string, ComponentInstance>

  // 各种状态
  canvas: CanvasState
  dragState: DragState
  selectionState: SelectionState
  uiState: DesignerUIState
  loadingState: LoadingState
}

// 设计器操作
export interface DesignerActions {
  // 页面设计操作
  setPageDesign: (pageDesign: PageDesign) => void
  createPageDesign: (name: string, description?: string) => Promise<string>
  updatePageDesign: (id: string, updates: Partial<PageDesign>) => void
  deletePageDesign: (id: string) => void
  loadPageDesign: (id: string) => Promise<void>
  savePageDesign: () => Promise<void>

  // 组件操作
  addComponent: (component: ComponentInstance) => void
  updateComponent: (id: string, updates: Partial<ComponentInstance>) => void
  deleteComponent: (id: string) => void
  moveComponent: (id: string, newParentId: string | null, newPosition: number) => void
  duplicateComponent: (id: string) => void
  copyComponent: (id: string) => void
  pasteComponent: (position: { x: number; y: number }) => void

  // 选择操作
  selectComponent: (id: string, multi?: boolean) => void
  selectComponents: (ids: string[]) => void
  clearSelection: () => void
  selectAll: () => void
  setHoveredComponent: (id: string | null) => void

  // 拖拽操作
  startDrag: (type: string, componentType?: string, componentId?: string) => void
  updateDrag: (position: { x: number; y: number }, dropZoneId?: string) => void
  endDrag: () => void
  cancelDrag: () => void

  // 画布操作
  setZoom: (zoom: number, center?: { x: number; y: number }) => void
  setPan: (pan: { x: number; y: number }) => void
  setGridSize: (size: number) => void
  toggleGrid: () => void
  setCanvasSize: (width: number, height: number) => void
  centerContent: () => void
  zoomToFit: () => void

  // UI操作
  setLeftPanelWidth: (width: number) => void
  setRightPanelWidth: (width: number) => void
  toggleComponentPanel: () => void
  togglePropertiesPanel: () => void
  toggleLayersPanel: () => void
  toggleAlignmentGuides: () => void
  toggleMiniMap: () => void
  toggleRulers: () => void
  setActiveBreakpoint: (breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl') => void
  setPreviewMode: (enabled: boolean) => void
  setDevicePreview: (device: 'desktop' | 'tablet' | 'mobile') => void
  setTheme: (theme: 'light' | 'dark' | 'auto') => void
  setReadonly: (readonly: boolean) => void
  toggleCodeView: () => void
  toggleSplitView: () => void

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

  // 历史操作
  undo: () => void
  redo: () => void
  saveToHistory: () => void
  clearHistory: () => void
}

// 设计器Store类型
export type DesignerStore = DesignerState & DesignerActions

// 设计器配置
export interface DesignerConfig {
  // 画布配置
  canvas: {
    defaultWidth: number
    defaultHeight: number
    minWidth: number
    minHeight: number
    maxWidth: number
    maxHeight: number
    defaultZoom: number
    minZoom: number
    maxZoom: number
    zoomStep: number
  }

  // 组件配置
  components: {
    maxComponentsPerPage: number
    maxNestingDepth: number
    enableComponentValidation: boolean
    autoSaveInterval: number
  }

  // UI配置
  ui: {
    defaultPanelWidth: {
      left: number
      right: number
    }
    minPanelWidth: {
      left: number
      right: number
    }
    enableAnimations: boolean
    enableShortcuts: boolean
    showTooltips: boolean
  }

  // 性能配置
  performance: {
    enableVirtualization: boolean
    virtualizationThreshold: number
    debounceDelay: number
    throttleDelay: number
  }

  // 功能开关
  features: {
    enableCollaboration: boolean
    enableVersionControl: boolean
    enableAIAssistance: boolean
    enableAdvancedMode: boolean
  }
}

// 设计器上下文
export interface DesignerContext {
  store: DesignerStore
  config: DesignerConfig
  theme: 'light' | 'dark' | 'auto'
  locale: string
  isPreview: boolean
  isReadonly: boolean
}

// 设计器事件
export interface DesignerEvent {
  type: DesignerEventType
  payload: any
  timestamp: number
  source: string
}

export type DesignerEventType =
  | 'component:add'
  | 'component:update'
  | 'component:delete'
  | 'component:move'
  | 'component:select'
  | 'page:save'
  | 'page:load'
  | 'page:publish'
  | 'canvas:zoom'
  | 'canvas:pan'
  | 'ui:resize'
  | 'error:occurred'
  | 'performance:warning'

// 键盘快捷键
export interface KeyboardShortcut {
  key: string
  modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[]
  action: string
  description: string
  category: 'edit' | 'view' | 'navigation' | 'file' | 'help'
  enabled: boolean
}

// 设备预设
export interface DevicePreset {
  id: string
  name: string
  width: number
  height: number
  userAgent?: string
  type: 'desktop' | 'tablet' | 'mobile'
  orientation: 'portrait' | 'landscape'
}

// 主题配置
export interface DesignerTheme {
  id: string
  name: string
  type: 'light' | 'dark'
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    error: string
    warning: string
    success: string
    info: string
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  borderRadius: {
    sm: number
    md: number
    lg: number
    xl: number
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}
