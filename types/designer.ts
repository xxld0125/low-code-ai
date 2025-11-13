/**
 * 设计器属性配置面板类型定义
 * 专门用于组件属性配置功能的类型系统
 */

import { PropertyType, PropertySchema, ValidationResult, ValidationError } from '@/lib/designer/validation/property-validator'

// 基础属性值类型
export type PropertyValue = string | number | boolean | object | unknown[] | null

// 属性编辑器Props接口
export interface PropertyEditorProps {
  // 基础属性
  label: string
  value: PropertyValue
  onChange: (value: PropertyValue) => void
  schema: PropertySchema

  // 状态
  disabled?: boolean
  readonly?: boolean
  loading?: boolean

  // 验证
  error?: string
  warning?: string
  onValidate?: (value: PropertyValue) => ValidationResult

  // UI
  placeholder?: string
  description?: string
  className?: string

  // 高级属性
  autoFocus?: boolean
  tabIndex?: number
  testId?: string
}

// 属性配置状态
export interface PropertyConfigState {
  // 选中组件状态
  selectedComponentId: string | null
  selectedComponent: ComponentInstance | null

  // 属性配置数据
  properties: Record<string, PropertyValue>
  previewProperties: Record<string, PropertyValue>
  dirtyProperties: Set<string>

  // 预览模式
  isPreviewMode: boolean

  // 验证状态
  validationErrors: Record<string, string>
  validationState: Record<string, 'valid' | 'invalid' | 'pending'>

  // 历史管理
  history: PropertyHistoryState

  // 加载和错误状态
  loading: boolean
  saving: boolean
  error: string | null

  // 事件处理器
  eventHandlers: Record<string, EventHandlerConfig[]>
  eventValidationErrors: Record<string, string>

  // 样式配置
  stylePresets: StylePreset[]
  customStyles: Record<string, CSSProperties>

  // 组件缓存（用于快速访问）
  components?: Record<string, ComponentInstance>
}

// 属性配置操作
export interface PropertyConfigActions {
  // 组件选择管理
  selectComponent: (componentId: string | null) => void

  // 属性操作
  updateProperty: (propertyPath: string, value: PropertyValue) => void
  updateProperties: (updates: Record<string, PropertyValue>) => void
  saveProperties: () => Promise<void>
  resetProperties: () => void

  // 预览管理
  setPreviewMode: (enabled: boolean) => void
  applyPreview: () => void
  discardPreview: () => void

  // 验证管理
  setValidationError: (propertyPath: string, error: string) => void
  clearValidationError: (propertyPath: string) => void
  clearAllValidationErrors: () => void
  validateProperty: (propertyPath: string, value: PropertyValue, schema: PropertySchema) => ValidationResult
  validateAllProperties: (schemas: Record<string, PropertySchema>) => Record<string, ValidationResult>

  // 历史操作
  undo: () => void
  redo: () => void
  saveToHistory: (description?: string) => void
  canUndo: () => boolean
  canRedo: () => void

  // 事件处理器操作
  addEventHandler: (eventType: string, handler: EventHandlerConfig) => void
  updateEventHandler: (eventType: string, index: number, handler: EventHandlerConfig) => void
  removeEventHandler: (eventType: string, index: number) => void
  setEventValidationError: (eventType: string, error: string) => void

  // 样式管理
  setCustomStyle: (propertyPath: string, style: CSSProperties) => void
  removeCustomStyle: (propertyPath: string) => void
  loadStylePresets: () => Promise<void>

  // 扩展样式操作
  updateStyleProperty: (property: string, value: PropertyValue) => void
  updateStyleProperties: (updates: Record<string, PropertyValue>) => void
  applyStylePreset: (presetId: string) => void
  saveStylePreset: (preset: Omit<StylePreset, 'id'>) => Promise<StylePreset>

  // 性能优化的样式操作
  updateStylePropertyOptimized: (componentId: string, property: string, value: PropertyValue) => void
  updateStylePropertiesOptimized: (componentId: string, updates: Record<string, PropertyValue>) => void

  // 状态管理
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  // 重置操作
  reset: () => void
}

// 属性历史状态
export interface PropertyHistoryState {
  past: PropertyHistorySnapshot[]
  present: PropertyHistorySnapshot | null
  future: PropertyHistorySnapshot[]
}

// 属性历史快照
export interface PropertyHistorySnapshot {
  properties: Record<string, PropertyValue>
  eventHandlers: Record<string, EventHandlerConfig[]>
  customStyles: Record<string, CSSProperties>
  timestamp: number
  description?: string
}

// 组件实例（简化版）
export interface ComponentInstance {
  id: string
  type: string
  name: string
  properties?: Record<string, PropertyValue>
  eventHandlers?: Record<string, EventHandlerConfig[]>
  customStyles?: Record<string, CSSProperties>
  parent?: string | null
  children?: string[]
  position?: {
    x: number
    y: number
    z: number
  }
  size?: {
    width: number
    height: number
  }
  visible?: boolean
  locked?: boolean
  created_at: string
  updated_at: string
}

// 事件处理器配置
export interface EventHandlerConfig {
  id: string
  action: 'navigate' | 'api' | 'custom' | 'setState'
  target?: string
  parameters?: Record<string, unknown>
  enabled: boolean
  order?: number
  description?: string
}

// 样式预设
export interface StylePreset {
  id: string
  name: string
  description?: string
  category: 'basic' | 'modern' | 'classic' | 'minimalist' | 'colorful'
  styles: {
    colors?: Record<string, string>
    typography?: Record<string, string | number>
    spacing?: Record<string, string | number>
    borders?: Record<string, string | number>
  }
  thumbnail?: string
  applicableTypes: string[]
  isDefault: boolean
}

// CSS属性
export interface CSSProperties {
  [key: string]: string | number
}

// 属性编辑器Props
export interface PropertyEditorProps {
  // 基础属性
  label: string
  value: PropertyValue
  onChange: (value: PropertyValue) => void
  schema: PropertySchema

  // 状态
  disabled?: boolean
  readonly?: boolean
  loading?: boolean

  // 验证
  error?: string
  warning?: string
  onValidate?: (value: PropertyValue) => ValidationResult

  // UI
  placeholder?: string
  description?: string
  className?: string

  // 高级属性
  autoFocus?: boolean
  tabIndex?: number
  testId?: string
}

// 属性组配置
export interface PropertyGroupConfig {
  title: string
  description?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
  icon?: string
  order: number
}

// 属性面板配置
export interface PropertyPanelConfig {
  // 布局配置
  width: number
  resizable: boolean
  minWidth: number
  maxWidth: number

  // 功能配置
  showValidation: boolean
  showHistory: boolean
  showPresets: boolean
  showAdvanced: boolean

  // 交互配置
  autoSave: boolean
  autoSaveDelay: number
  livePreview: boolean
  previewDelay: number

  // 分组配置
  groups: PropertyGroupConfig[]
  defaultGroup: string

  // 样式配置
  theme: 'light' | 'dark' | 'auto'
  density: 'compact' | 'normal' | 'relaxed'
}

// 动态表单配置
export interface DynamicFormConfig {
  // 表单数据
  properties: Record<string, PropertyValue>
  schemas: Record<string, PropertySchema>
  groups: Record<string, PropertyGroupConfig>

  // 表单状态
  loading: boolean
  saving: boolean
  validating: boolean

  // 表单行为
  autoValidate: boolean
  validateOnChange: boolean
  showValidationErrors: boolean
  showValidationWarnings: boolean

  // 布局配置
  layout: 'vertical' | 'horizontal' | 'grid'
  columns: number
  spacing: 'compact' | 'normal' | 'relaxed'

  // 交互配置
  collapsibleGroups: boolean
  defaultCollapsedGroups: string[]
  focusFirstError: boolean
  scrollToError: boolean
}

// 预览管理器配置
export interface PreviewManagerConfig {
  // 预览模式
  enabled: boolean
  realTime: boolean
  debounceDelay: number

  // 预览范围
  previewProperties: boolean
  previewStyles: boolean
  previewEvents: boolean

  // 性能配置
  maxPreviews: number
  cacheSize: number
  clearCacheOnSave: boolean
}

// 属性配置面板完整类型
export type PropertyConfigStore = PropertyConfigState & PropertyConfigActions

// 导出常用的PropertyType和PropertySchema，方便其他地方使用
export type { PropertyType, PropertySchema, ValidationResult, ValidationError }