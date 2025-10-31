/**
 * 编辑器通用类型定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import { ValidationError } from '../validation/style-validator'

// 基础字段定义接口
export interface FieldDefinition<T = unknown> {
  name: string
  label: string
  type: FieldType
  required?: boolean
  default_value?: T
  description?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  validation?: ValidationRule[]
  options?: Array<{ label: string; value: T; description?: string }>
  config?: Record<string, unknown>
}

// 字段类型枚举
export type FieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'color'
  | 'size'
  | 'font-size'
  | 'spacing'
  | 'border-radius'
  | 'border-style'
  | 'border'
  | 'shadow'
  | 'font-weight'
  | 'line-height'
  | 'textarea'
  | 'slider'
  | 'switch'
  | 'transition'

// 验证规则接口
export interface ValidationRule {
  id: string
  type: ValidationRuleType
  label: string
  enabled: boolean
  config: Record<string, unknown>
  errorMessage?: string
}

export type ValidationRuleType =
  | 'required'
  | 'min_length'
  | 'max_length'
  | 'pattern'
  | 'email'
  | 'url'
  | 'min_value'
  | 'max_value'
  | 'custom'

// 基础编辑器属性接口
export interface BaseEditorProps<T = unknown> {
  definition: FieldDefinition<T>
  value?: T
  error?: string
  disabled?: boolean
  readonly?: boolean
  onChange: (value: T) => void
  onError?: (error: ValidationError) => void
  onBlur?: () => void
  onFocus?: () => void
  className?: string
}

// 尺寸字段配置
export interface SizeConfig {
  min?: number
  max?: number
  step?: number
  units?: string[]
  defaultUnit?: string
  allowNegative?: boolean
  allowAuto?: boolean
  required?: boolean
  presets?: Array<{ label: string; value: string }>
}

// 颜色字段配置
export interface ColorConfig {
  format?: 'hex' | 'rgb' | 'rgba' | 'hsl'
  allowAlpha?: boolean
  presets?: Array<{ label: string; value: string; category?: string }>
  showPresets?: boolean
}

// 样式属性定义接口
export interface StylePropertyDefinition {
  id: string
  name: string
  label: string
  type: FieldType
  category: StyleCategory
  default_value?: unknown
  description?: string
  config?: Record<string, unknown>
}

// 样式分组定义
export interface StyleGroup {
  id: string
  name: string
  properties: StylePropertyDefinition[]
}

// 样式分类
export type StyleCategory =
  | 'layout'
  | 'typography'
  | 'color'
  | 'border'
  | 'spacing'
  | 'shadow'
  | 'background'
  | 'effects'

// 组件属性定义接口
export interface ComponentPropertyDefinition {
  name: string
  label: string
  type: FieldType
  category: PropertyCategory
  default_value?: unknown
  description?: string
  required?: boolean
  validation?: ValidationRule[]
  options?: Array<{ label: string; value: unknown }>
  config?: Record<string, unknown>
}

// 属性分类
export type PropertyCategory =
  | 'basic'
  | 'content'
  | 'behavior'
  | 'validation'
  | 'accessibility'
  | 'advanced'

// 编辑器事件接口
export interface EditorEvent<T = unknown> {
  type: EditorEventType
  property: string
  value: T
  previousValue?: T
  timestamp: number
}

export type EditorEventType = 'change' | 'focus' | 'blur' | 'validate' | 'error' | 'reset'

// 事件监听器类型
export type EditorEventListener<T = unknown> = (event: EditorEvent<T>) => void

// 编辑器状态接口
export interface EditorState<T = unknown> {
  value?: T
  error?: ValidationError
  touched: boolean
  dirty: boolean
  validating: boolean
  disabled: boolean
  readonly: boolean
}

// 组件样式定义接口
export interface ComponentStyleDefinition {
  id: string
  name: string
  category: string
  style_schema: {
    groups: StyleGroup[]
  }
  properties?: StylePropertyDefinition[]
  defaultStyles?: Record<string, unknown>
}

// 组件属性定义接口
export interface ComponentPropertyDefinitions {
  id: string
  name: string
  category: string
  properties: ComponentPropertyDefinition[]
  defaultProperties: Record<string, unknown>
}

// 组件定义接口
export interface ComponentDefinition {
  id: string
  name: string
  category: string
  description?: string
  styleDefinition: ComponentStyleDefinition
  propertyDefinitions: ComponentPropertyDefinitions
  preview?: {
    icon?: string
    screenshot?: string
    description?: string
  }
}

// 批量更新接口
export interface BatchUpdateOperation {
  type: 'update' | 'delete' | 'add'
  property: string
  value?: unknown
  oldValue?: unknown
}

export interface BatchUpdateResult<T = unknown> {
  success: boolean
  operations: BatchUpdateOperation[]
  errors?: ValidationError[]
  newValue?: T
}

// 防抖配置接口
export interface DebounceConfig {
  delay: number
  leading?: boolean
  trailing?: boolean
  maxWait?: number
}

// 编辑器主题配置
export interface EditorTheme {
  colors: {
    primary: string
    secondary: string
    error: string
    warning: string
    success: string
    background: string
    surface: string
    border: string
    text: {
      primary: string
      secondary: string
      disabled: string
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      md: string
      lg: string
      xl: string
    }
    fontWeight: {
      normal: string
      medium: string
      semibold: string
      bold: string
    }
  }
}

// 响应式配置接口
export interface ResponsiveConfig {
  enabled: boolean
  breakpoints: string[]
  currentBreakpoint?: string
  syncBreakpoints?: boolean
}

// 预览配置接口
export interface PreviewConfig {
  showGrid?: boolean
  showOutline?: boolean
  scale?: number
  backgroundColor?: string
  device?: string
  orientation?: 'portrait' | 'landscape'
}

// 组件样式接口（兼容原有类型）
export interface ComponentStyles extends Record<string, unknown> {
  // 样式属性
  color?: string
  backgroundColor?: string
  fontSize?: string | number
  fontWeight?: string | number
  fontFamily?: string
  lineHeight?: string | number
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  width?: string | number
  height?: string | number
  margin?: string | number
  padding?: string | number
  border?: string
  borderRadius?: string | number
  boxShadow?: string
  opacity?: number
  transform?: string
  transition?: string
  // ... 其他CSS属性
}
