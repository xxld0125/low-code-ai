/**
 * 属性配置类型定义
 * 定义组件属性配置相关的所有TypeScript类型
 */

import type { EventHandlerConfig } from '@/stores/property-store'

// 基础属性值类型
export type PropertyValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | Record<string, unknown>
  | null
  | undefined

// 属性配置状态
export interface PropertyConfigState {
  // 选中状态
  selectedComponentId: string | null
  selectedComponent: ComponentInstance | null

  // 属性配置
  properties: Record<string, PropertyValue>
  dirtyProperties: Set<string>

  // 预览状态
  previewProperties: Record<string, PropertyValue>
  isPreviewMode: boolean

  // 历史管理
  history: HistoryState

  // 状态标志
  loading: boolean
  saving: boolean
  error: string | null

  // 验证状态
  validationErrors: Record<string, string>
  validationState: Record<string, ValidationState>

  // 事件配置
  eventHandlers: Record<string, EventHandlerConfig[]>
  eventValidationErrors: Record<string, string>

  // 样式配置
  stylePresets: StylePreset[]
  customStyles: Record<string, CSSProperties>

  // 组件映射（用于快速查找）
  components?: Record<string, ComponentInstance>
}

// 属性配置动作
export interface PropertyConfigActions {
  // 选中组件管理
  selectComponent: (componentId: string | null) => void

  // 属性管理
  updateProperty: (propertyPath: string, value: PropertyValue) => void
  updateProperties: (updates: Record<string, PropertyValue>) => void
  saveProperties: () => Promise<unknown>
  resetProperties: () => void

  // 历史管理
  undo: () => void
  redo: () => void
  saveToHistory: (description?: string) => void

  // 验证管理
  setValidationError: (propertyPath: string, error: string) => void
  clearValidationError: (propertyPath: string) => void
  clearAllValidationErrors: () => void

  // 事件管理
  addEventHandler: (eventType: string, handler: EventHandlerConfig) => void
  updateEventHandler: (eventType: string, index: number, handler: EventHandlerConfig) => void
  removeEventHandler: (eventType: string, index: number) => void
  setEventValidationError: (eventType: string, error: string) => void

  // 样式管理
  setCustomStyle: (propertyPath: string, style: CSSProperties) => void
  removeCustomStyle: (propertyPath: string) => void

  // 预览模式切换
  setPreviewMode: (enabled: boolean) => void

  // 状态管理
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  reset: () => void
}

// 历史状态
export interface HistoryState {
  past: (HistorySnapshot | null)[]
  present: HistorySnapshot | null
  future: (HistorySnapshot | null)[]
}

// 历史快照
export interface HistorySnapshot {
  properties: Record<string, PropertyValue>
  eventHandlers: Record<string, EventHandlerConfig[]>
  customStyles: Record<string, CSSProperties>
  timestamp: number
  description?: string
}

// 验证状态
export type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid'

// 从主设计器类型导入相关类型，避免重复定义
export type { StylePreset, CSSProperties } from '../designer'

// 组件实例
export interface ComponentInstance {
  id: string
  type: string
  name: string
  properties?: Record<string, PropertyValue>
  eventHandlers?: Record<string, EventHandlerConfig[]>
  customStyles?: Record<string, CSSProperties>
  children?: ComponentInstance[]
  parentId?: string
  position?: {
    x: number
    y: number
  }
  size?: {
    width: number
    height: number
  }
}

// 属性定义
export interface PropertyDefinition {
  // 基础信息
  key: string
  name: string
  description?: string
  category: PropertyCategory

  // 类型信息
  type: PropertyType
  valueType?: ValueType

  // 验证规则
  validation?: ValidationRule[]
  required?: boolean
  defaultValue?: PropertyValue

  // UI配置
  ui?: PropertyUIConfig

  // 高级配置
  dependencies?: PropertyDependency[]
  conditions?: PropertyCondition[]
}

// 属性分类
export type PropertyCategory =
  | 'basic'      // 基础属性：标题、描述、占位符等
  | 'content'    // 内容属性：文本、图片、链接等
  | 'layout'     // 布局属性：尺寸、位置、对齐等
  | 'style'      // 样式属性：颜色、字体、边框等
  | 'behavior'   // 行为属性：事件、验证、权限等
  | 'advanced'   // 高级属性：自定义配置、条件显示等
  | 'accessibility' // 无障碍属性

// 属性类型
export type PropertyType =
  | 'text'       // 文本输入
  | 'textarea'   // 多行文本
  | 'number'     // 数字输入
  | 'boolean'    // 开关/复选框
  | 'select'     // 下拉选择
  | 'multiselect' // 多选下拉
  | 'radio'      // 单选按钮组
  | 'checkbox'   // 复选框组
  | 'color'      // 颜色选择器
  | 'date'       // 日期选择
  | 'time'       // 时间选择
  | 'datetime'   // 日期时间选择
  | 'file'       // 文件上传
  | 'image'      // 图片上传
  | 'url'        // URL输入
  | 'email'      // 邮箱输入
  | 'password'   // 密码输入
  | 'range'      // 滑块
  | 'size'       // 尺寸配置
  | 'spacing'    // 间距配置
  | 'alignment'  // 对齐配置
  | 'font'       // 字体配置
  | 'border'     // 边框配置
  | 'shadow'     // 阴影配置
  | 'animation'  // 动画配置
  | 'array'      // 数组配置
  | 'object'     // 对象配置
  | 'code'       // 代码编辑器
  | 'json'       // JSON编辑器
  | 'custom'     // 自定义编辑器

// 值类型
export type ValueType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'null'
  | 'any'

// 验证规则
export interface ValidationRule {
  type: ValidationType
  params?: Record<string, unknown>
  message?: string
  async?: boolean
}

// 验证类型
export type ValidationType =
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'pattern'
  | 'email'
  | 'url'
  | 'custom'
  | 'unique'
  | 'exists'

// 属性UI配置
export interface PropertyUIConfig {
  // 显示配置
  label?: string
  placeholder?: string
  helpText?: string
  width?: 'small' | 'medium' | 'large' | 'full'
  inline?: boolean

  // 选项配置（用于select、radio、checkbox等）
  options?: PropertyOption[]

  // 数值配置（用于number、range等）
  min?: number
  max?: number
  step?: number
  unit?: string

  // 文本配置（用于text、textarea等）
  maxLength?: number
  rows?: number
  autoComplete?: string

  // 样式配置
  className?: string
  style?: React.CSSProperties

  // 条件显示
  showIf?: PropertyCondition

  // 自定义渲染器
  renderer?: string
  rendererProps?: Record<string, unknown>
}

// 属性选项
export interface PropertyOption {
  value: PropertyValue
  label: string
  description?: string
  disabled?: boolean
  icon?: string
  group?: string
}

// 属性依赖
export interface PropertyDependency {
  property: string
  condition: PropertyCondition
  effect: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional'
}

// 属性条件
export interface PropertyCondition {
  property: string
  operator: ConditionOperator
  value: PropertyValue
  value2?: PropertyValue // 用于范围操作
}

// 条件操作符
export type ConditionOperator =
  | 'eq'          // 等于
  | 'ne'          // 不等于
  | 'gt'          // 大于
  | 'gte'         // 大于等于
  | 'lt'          // 小于
  | 'lte'         // 小于等于
  | 'contains'    // 包含
  | 'startsWith'  // 开始于
  | 'endsWith'    // 结束于
  | 'in'          // 包含于数组
  | 'notIn'       // 不包含于数组
  | 'between'     // 介于两个值之间
  | 'regex'       // 正则匹配
  | 'exists'      // 存在
  | 'empty'       // 为空
  | 'notEmpty'    // 不为空

// 组件类型定义
export interface ComponentType {
  id: string
  name: string
  displayName: string
  description?: string
  category: string
  icon?: string
  properties: PropertyDefinition[]
  defaultProperties: Record<string, PropertyValue>
  allowedChildren?: string[]
  maxChildren?: number
  configurable?: boolean
}