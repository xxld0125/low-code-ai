/**
 * 属性定义类型
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-28
 */

import { ComponentProps } from './component'

// 属性编辑器配置
export interface PropertyDefinition {
  key: string
  type: PropertyType
  label: string
  description?: string
  required?: boolean
  default?: unknown
  options?: PropertyOption[]
  validation?: ValidationRule[]
  group?: string
  order?: number
  conditional?: PropertyCondition
}

export type PropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'color'
  | 'font'
  | 'spacing'
  | 'border'
  | 'shadow'
  | 'image'
  | 'icon'
  | 'array'
  | 'object'
  | 'custom'

export interface PropertyOption {
  value: string | number | boolean
  label: string
  disabled?: boolean
  group?: string
}

export interface PropertyCondition {
  property: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value: unknown
}

// 验证规则
export interface ValidationRule {
  type: ValidationType
  message?: string
  params?: Record<string, unknown>
}

export type ValidationType =
  | 'required'
  | 'min_length'
  | 'max_length'
  | 'min_value'
  | 'max_value'
  | 'pattern'
  | 'email'
  | 'url'
  | 'custom'

// 组件定义
export interface ComponentDefinition {
  type: string
  name: string
  category: 'basic' | 'display' | 'layout'
  description: string
  icon: string
  properties: PropertyDefinition[]
  default_props: ComponentProps
  preview_props?: ComponentProps
  examples?: ComponentProps[]
}

// 属性编辑器状态
export interface PropertyEditorState {
  component_type: string
  properties: ComponentProps
  errors: Record<string, string[]>
  touched: Record<string, boolean>
  loading: boolean
}

// 属性更新事件
export interface PropertyUpdateEvent {
  component_id: string
  property_key: string
  value: unknown
  previous_value: unknown
}
