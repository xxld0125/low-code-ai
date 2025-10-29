/**
 * 基础组件库API类型定义
 * 基于 OpenAPI 3.0.3 规范
 */

// =============================================================================
// 基础类型
// =============================================================================

/**
 * 组件状态枚举
 */
export type ComponentStatus = 'draft' | 'active' | 'deprecated' | 'archived'

/**
 * 组件分类枚举
 */
export type ComponentCategory = 'basic' | 'display' | 'layout' | 'form' | 'advanced' | 'custom'

/**
 * 属性数据类型枚举
 */
export type PropDataType = 'string' | 'number' | 'boolean' | 'color' | 'select' | 'array' | 'object'

/**
 * 属性分组枚举
 */
export type PropGroup = 'basic' | 'style' | 'layout' | 'advanced'

/**
 * 属性类别枚举
 */
export type PropCategory = 'content' | 'appearance' | 'behavior' | 'layout'

/**
 * 编辑器类型枚举
 */
export type EditorType =
  | 'text'
  | 'number'
  | 'color'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'textarea'
  | 'json'

/**
 * 验证类型枚举
 */
export type ValidationType =
  | 'required'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'custom'

/**
 * 条件类型枚举
 */
export type DependencyCondition =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'greater_than'
  | 'less_than'

/**
 * 依赖动作枚举
 */
export type DependencyAction = 'show' | 'hide' | 'enable' | 'disable'

/**
 * 属性值类型 - 基于 PropDataType 的具体值类型
 */
export type PropValue =
  | string
  | number
  | boolean
  | string
  | string[]
  | Record<string, unknown>
  | null

/**
 * 边框样式枚举
 */
export type BorderStyle =
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'double'
  | 'groove'
  | 'ridge'
  | 'inset'
  | 'outset'

/**
 * 错误级别枚举
 */
export type ErrorSeverity = 'error' | 'warning'

// =============================================================================
// 核心数据结构
// =============================================================================

/**
 * 组件定义
 */
export interface ComponentDefinition {
  id: string
  name: string
  description: string
  version: string
  author: string
  category: ComponentCategory
  subcategory?: string
  tags: string[]
  component_path: string
  preview_path: string
  icon_path: string
  props_schema: PropSchema[]
  default_props: Record<string, unknown>
  default_styles: ComponentStyles
  constraints: ComponentConstraints
  validation_rules: ValidationRule[]
  status: ComponentStatus
  deprecated: boolean
  created_at: string
  updated_at: string
}

/**
 * 属性定义
 */
export interface PropSchema {
  id: string
  name: string
  type: PropDataType
  label: string
  description: string
  required: boolean
  default_value?: PropValue
  group: PropGroup
  category: PropCategory
  order: number
  options?: PropOption[]
  constraints?: PropConstraints
  validation?: ValidationRule[]
  editor_config: EditorConfig
  responsive: boolean
  dependencies?: PropertyDependency[]
}

/**
 * 组件样式定义
 */
export interface ComponentStyles {
  display?: string
  width?: string | number
  height?: string | number
  margin?: SpacingValue
  padding?: SpacingValue
  color?: string
  backgroundColor?: string
  fontSize?: string | number
  border?: BorderProperties
  borderRadius?: BorderRadiusValue
  responsive?: Record<string, PropValue>
}

/**
 * 组件约束定义
 */
export interface ComponentConstraints {
  min_width?: number
  min_height?: number
  max_width?: number
  max_height?: number
  aspect_ratio?: string
  resizable?: boolean
  draggable?: boolean
}

/**
 * 间距值
 */
export type SpacingValue =
  | string
  | number
  | { x: number; y: number }
  | { top: number; right: number; bottom: number; left: number }

/**
 * 边框属性
 */
export interface BorderProperties {
  width: string
  style: BorderStyle
  color: string
}

/**
 * 圆角值
 */
export type BorderRadiusValue =
  | string
  | number
  | { topLeft: number; topRight: number; bottomLeft: number; bottomRight: number }

/**
 * 验证规则
 */
export interface ValidationRule {
  type: ValidationType
  value: unknown
  message: string
}

/**
 * 属性选项
 */
export interface PropOption {
  value: string
  label: string
  description?: string
}

/**
 * 属性约束
 */
export interface PropConstraints {
  min?: number
  max?: number
  step?: number
  pattern?: string
}

/**
 * 编辑器配置
 */
export interface EditorConfig {
  type: EditorType
  placeholder?: string
  help?: string
  config?: Record<string, unknown>
}

/**
 * 属性依赖关系
 */
export interface PropertyDependency {
  property: string
  condition: DependencyCondition
  value: string
  action: DependencyAction
}

// =============================================================================
// 请求/响应类型
// =============================================================================

/**
 * 创建组件请求
 */
export interface CreateComponentRequest {
  name: string
  description?: string
  category: ComponentCategory
  subcategory?: string
  tags?: string[]
  component_path: string
  preview_path: string
  icon_path: string
  props_schema?: unknown[]
  default_props?: Record<string, unknown>
  default_styles?: ComponentStyles
}

/**
 * 更新组件请求
 */
export interface UpdateComponentRequest {
  name?: string
  description?: string
  category?: ComponentCategory
  subcategory?: string
  tags?: string[]
  component_path?: string
  preview_path?: string
  icon_path?: string
  props_schema?: unknown[]
  default_props?: Record<string, unknown>
  default_styles?: ComponentStyles
  status?: ComponentStatus
}

/**
 * 创建属性请求
 */
export interface CreatePropRequest {
  name: string
  type: PropDataType
  label: string
  description?: string
  required?: boolean
  default_value?: unknown
  group?: PropGroup
  order?: number
  options?: PropOption[]
  validation?: ValidationRule[]
  editor_config?: EditorConfig
}

/**
 * 预览请求
 */
export interface PreviewRequest {
  props: Record<string, PropValue>
  styles?: ComponentStyles
  theme?: 'light' | 'dark' | 'high-contrast'
  viewport?: {
    width?: number
    height?: number
  }
}

/**
 * 预览响应
 */
export interface PreviewResponse {
  html: string
  css: string
  props: Record<string, PropValue>
  styles: ComponentStyles
  render_time: number
}

/**
 * 验证请求
 */
export interface ValidationRequest {
  props: Record<string, PropValue>
  styles?: ComponentStyles
  strict_mode?: boolean
}

/**
 * 验证响应
 */
export interface ValidationResponse {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  validation_time: number
}

/**
 * 验证错误
 */
export interface ValidationError {
  property: string
  message: string
  code: string
  severity: ErrorSeverity
}

/**
 * 组件分类
 */
export interface ComponentCategoryInfo {
  name: string
  label: string
  description: string
  count: number
  icon: string
  order: number
}

/**
 * 主题定义
 */
export interface Theme {
  name: string
  label: string
  description: string
  colors: Record<string, string>
  preview?: string
}

/**
 * 分页信息
 */
export interface Pagination {
  current_page: number
  total_pages: number
  total_items: number
  per_page: number
  has_next: boolean
  has_prev: boolean
}

// =============================================================================
// API响应类型
// =============================================================================

/**
 * 成功响应基础结构
 */
export interface SuccessResponse<T = unknown> {
  success: true
  data: T
}

/**
 * 错误响应结构
 */
export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown> | unknown[] | string
  }
}

/**
 * 组件列表响应
 */
export interface ComponentsListResponse {
  success: true
  data: {
    components: ComponentDefinition[]
    pagination: Pagination
  }
}

/**
 * 带消息的响应
 */
export interface MessageResponse {
  success: true
  message: string
}

// =============================================================================
// 查询参数类型
// =============================================================================

/**
 * 组件列表查询参数
 */
export interface ComponentsQueryParams {
  category?: ComponentCategory
  status?: ComponentStatus
  search?: string
  page?: number
  limit?: number
}

/**
 * 属性查询参数
 */
export interface PropsQueryParams {
  group?: PropGroup
}

// =============================================================================
// 错误代码常量
// =============================================================================

/**
 * API错误代码
 */
export const ERROR_CODES = {
  // 通用错误
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',

  // 验证错误
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_COMPONENT_ID: 'INVALID_COMPONENT_ID',
  INVALID_PROP_TYPE: 'INVALID_PROP_TYPE',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // 组件相关错误
  COMPONENT_NOT_FOUND: 'COMPONENT_NOT_FOUND',
  COMPONENT_ALREADY_EXISTS: 'COMPONENT_ALREADY_EXISTS',
  COMPONENT_IN_USE: 'COMPONENT_IN_USE',
  COMPONENT_DEPRECATED: 'COMPONENT_DEPRECATED',

  // 属性相关错误
  PROP_NOT_FOUND: 'PROP_NOT_FOUND',
  PROP_ALREADY_EXISTS: 'PROP_ALREADY_EXISTS',
  INVALID_PROP_VALUE: 'INVALID_PROP_VALUE',

  // 权限错误
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  COMPONENT_ACCESS_DENIED: 'COMPONENT_ACCESS_DENIED',
} as const

/**
 * HTTP状态码
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const

// =============================================================================
// 类型守卫函数
// =============================================================================

/**
 * 检查是否为有效的组件分类
 */
export function isValidComponentCategory(value: string): value is ComponentCategory {
  return ['basic', 'display', 'layout', 'form', 'advanced', 'custom'].includes(value)
}

/**
 * 检查是否为有效的组件状态
 */
export function isValidComponentStatus(value: string): value is ComponentStatus {
  return ['draft', 'active', 'deprecated', 'archived'].includes(value)
}

/**
 * 检查是否为有效的属性数据类型
 */
export function isValidPropDataType(value: string): value is PropDataType {
  return ['string', 'number', 'boolean', 'color', 'select', 'array', 'object'].includes(value)
}

/**
 * 检查是否为有效的属性分组
 */
export function isValidPropGroup(value: string): value is PropGroup {
  return ['basic', 'style', 'layout', 'advanced'].includes(value)
}

// =============================================================================
// 导出所有类型
// =============================================================================

export * from './types'
