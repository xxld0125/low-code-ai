/**
 * 页面设计器属性类型定义
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 */

import { ComponentType } from './component'
import { z } from 'zod'

// 基础属性值类型
export type PropertyValue = string | number | boolean | string[] | Record<string, any>

// 属性编辑器类型
export type PropertyEditorType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color'
  | 'size'
  | 'spacing'
  | 'border'
  | 'shadow'
  | 'font'
  | 'array'
  | 'object'

// 属性定义接口
export interface PropertyDefinition {
  name: string
  type: PropertyEditorType
  label: string
  description?: string
  required?: boolean
  defaultValue?: PropertyValue
  // 验证规则
  validation?: {
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: string
    options?: PropertyValue[]
    required?: boolean
  }
  // 条件显示
  condition?: {
    property: string
    value: PropertyValue
    operator?: 'equals' | 'not_equals' | 'contains' | 'not_contains'
  }
  // 分组
  group?: string
  // 高级选项
  advanced?: boolean
}

// 属性组定义
export interface PropertyGroup {
  name: string
  label: string
  collapsed?: boolean
  order: number
}

// 组件属性配置
export interface ComponentPropertyConfig {
  type: ComponentType
  groups: PropertyGroup[]
  properties: PropertyDefinition[]
}

// 文本属性配置
export interface TextPropertyConfig {
  value: string
  placeholder?: string
  maxLength?: number
  multiline?: boolean
  rows?: number
  richText?: boolean
}

// 数值属性配置
export interface NumberPropertyConfig {
  value: number
  min?: number
  max?: number
  step?: number
  unit?: string
  precision?: number
}

// 布尔属性配置
export interface BooleanPropertyConfig {
  value: boolean
  label?: string
  description?: string
}

// 颜色属性配置
export interface ColorPropertyConfig {
  value: string
  preset?: string[]
  opacity?: boolean
  gradient?: boolean
}

// 尺寸属性配置
export interface SizePropertyConfig {
  value: number | string
  unit?: 'px' | '%' | 'em' | 'rem' | 'vh' | 'vw' | 'auto'
  min?: number
  max?: number
  step?: number
}

// 间距属性配置
export interface SpacingPropertyConfig {
  value: number | { top?: number; right?: number; bottom?: number; left?: number }
  unit?: 'px' | 'em' | 'rem'
  linked?: boolean // 是否锁定四个方向的值
}

// 边框属性配置
export interface BorderPropertyConfig {
  width: number
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'none'
  color: string
  radius: number
  sides: {
    top: boolean
    right: boolean
    bottom: boolean
    left: boolean
  }
}

// 阴影属性配置
export interface ShadowPropertyConfig {
  enabled: boolean
  x: number
  y: number
  blur: number
  spread: number
  color: string
  inset: boolean
}

// 字体属性配置
export interface FontPropertyConfig {
  family: string
  size: number | string
  weight: number | string
  lineHeight: number | string
  letterSpacing: number | string
  textAlign: 'left' | 'center' | 'right' | 'justify'
  textDecoration: 'none' | 'underline' | 'line-through'
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
}

// 数组属性配置
export interface ArrayPropertyConfig {
  items: PropertyValue[]
  itemType: PropertyEditorType
  itemDefinition?: PropertyDefinition
  minItems?: number
  maxItems?: number
}

// 对象属性配置
export interface ObjectPropertyConfig {
  value: Record<string, PropertyValue>
  schema: Record<string, PropertyDefinition>
}

// 属性验证结果
export interface PropertyValidationResult {
  isValid: boolean
  error?: string
  warning?: string
}

// 属性变更事件
export interface PropertyChangeEvent {
  componentId: string
  propertyName: string
  oldValue: PropertyValue
  newValue: PropertyValue
  propertyType: PropertyEditorType
}

// 属性编辑器状态
export interface PropertyEditorState {
  isEditing: boolean
  isValid: boolean
  isDirty: boolean
  validation?: PropertyValidationResult
}

// 属性面板状态
export interface PropertyPanelState {
  selectedComponentId: string | null
  activeTab: 'properties' | 'styles' | 'events' | 'advanced'
  collapsedGroups: Set<string>
  searchQuery: string
  showAdvanced: boolean
}

// 属性编辑器组件Props
export interface PropertyEditorProps {
  definition: PropertyDefinition
  value: PropertyValue
  onChange: (value: PropertyValue) => void
  onBlur?: () => void
  onFocus?: () => void
  disabled?: boolean
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
}

// 属性组组件Props
export interface PropertyGroupProps {
  group: PropertyGroup
  children: React.ReactNode
  isCollapsed: boolean
  onToggle: () => void
}

// 属性面板组件Props
export interface PropertyPanelProps {
  componentId: string | null
  componentType?: ComponentType
  properties: Record<string, PropertyValue>
  styles: Record<string, PropertyValue>
  events: Record<string, PropertyValue>
  onChange: (property: string, value: PropertyValue, type: 'props' | 'styles' | 'events') => void
  onValidate?: (property: string, result: PropertyValidationResult) => void
  className?: string
}

// Zod验证模式
export const PropertyValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.any()),
  z.record(z.string(), z.any()),
])

export const PropertyDefinitionSchema = z.object({
  name: z.string(),
  type: z.enum([
    'text',
    'number',
    'boolean',
    'select',
    'color',
    'size',
    'spacing',
    'border',
    'shadow',
    'font',
    'array',
    'object',
  ]),
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  defaultValue: z.any().optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      pattern: z.string().optional(),
      options: z.array(z.any()).optional(),
      required: z.boolean().optional(),
    })
    .optional(),
  condition: z
    .object({
      property: z.string(),
      value: z.any(),
      operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains']).optional(),
    })
    .optional(),
  group: z.string().optional(),
  advanced: z.boolean().optional(),
})

export const ComponentPropertyConfigSchema = z.object({
  type: z.string(),
  groups: z.array(
    z.object({
      name: z.string(),
      label: z.string(),
      collapsed: z.boolean().optional(),
      order: z.number(),
    })
  ),
  properties: z.array(PropertyDefinitionSchema),
})

// 工具函数类型
export type PropertyValidator = (
  value: PropertyValue,
  definition: PropertyDefinition
) => PropertyValidationResult
export type PropertyTransformer = (value: PropertyValue) => PropertyValue
export type PropertyFormatter = (value: PropertyValue, definition: PropertyDefinition) => string

// 属性配置映射
export type ComponentPropertyConfigs = Record<ComponentType, ComponentPropertyConfig>

// 预设的属性配置
export const PRESET_COLORS = [
  '#000000',
  '#FFFFFF',
  '#F3F4F6',
  '#9CA3AF',
  '#4B5563',
  '#111827',
  '#EF4444',
  '#F87171',
  '#FCA5A5',
  '#FBBF24',
  '#FDE047',
  '#84CC16',
  '#22C55E',
  '#10B981',
  '#14B8A6',
  '#06B6D4',
  '#0EA5E9',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#A855F7',
  '#D946EF',
  '#EC4899',
  '#F43F5E',
]

export const PRESET_FONT_SIZES = [
  { label: 'XS', value: 12 },
  { label: 'SM', value: 14 },
  { label: 'Base', value: 16 },
  { label: 'LG', value: 18 },
  { label: 'XL', value: 20 },
  { label: '2XL', value: 24 },
  { label: '3XL', value: 30 },
  { label: '4XL', value: 36 },
  { label: '5XL', value: 48 },
]

export const PRESET_SPACING = [
  { label: '0', value: 0 },
  { label: '1', value: 4 },
  { label: '2', value: 8 },
  { label: '3', value: 12 },
  { label: '4', value: 16 },
  { label: '5', value: 20 },
  { label: '6', value: 24 },
  { label: '8', value: 32 },
  { label: '10', value: 40 },
  { label: '12', value: 48 },
  { label: '16', value: 64 },
  { label: '20', value: 80 },
  { label: '24', value: 96 },
]
