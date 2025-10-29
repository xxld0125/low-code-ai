/**
 * 字段类型编辑器导出
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

// 基础字段编辑器
export { StringFieldEditor } from './StringFieldEditor'
export { NumberFieldEditor } from './NumberFieldEditor'
export { BooleanFieldEditor } from './BooleanFieldEditor'
export { SelectFieldEditor } from './SelectFieldEditor'

// 样式字段编辑器
export { ColorFieldEditor } from './ColorFieldEditor'
export { ImageFieldEditor } from './ImageFieldEditor'
export { SpacingFieldEditor } from './SpacingFieldEditor'
export { BorderFieldEditor } from './BorderFieldEditor'
export { ShadowFieldEditor } from './ShadowFieldEditor'

// 字段类型映射
export type FieldEditorType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'color'
  | 'image'
  | 'spacing'
  | 'border'
  | 'shadow'
  | 'font'
  | 'icon'
  | 'array'
  | 'object'
  | 'custom'

// 字段编辑器组件映射
export const FIELD_EDITOR_COMPONENTS = {
  string: 'StringFieldEditor',
  number: 'NumberFieldEditor',
  boolean: 'BooleanFieldEditor',
  select: 'SelectFieldEditor',
  multiselect: 'SelectFieldEditor',
  color: 'ColorFieldEditor',
  image: 'ImageFieldEditor',
  spacing: 'SpacingFieldEditor',
  border: 'BorderFieldEditor',
  shadow: 'ShadowFieldEditor',
  font: 'StringFieldEditor',
  icon: 'StringFieldEditor',
  array: 'StringFieldEditor',
  object: 'StringFieldEditor',
  custom: 'StringFieldEditor',
} as const

// 获取字段编辑器组件名称
export function getFieldEditorComponent(type: FieldEditorType): string {
  return FIELD_EDITOR_COMPONENTS[type] || 'StringFieldEditor'
}

// 检查字段类型是否支持特定功能
export function supportsMultipleValues(type: FieldEditorType): boolean {
  return type === 'multiselect' || type === 'array'
}

export function supportsPresets(type: FieldEditorType): boolean {
  return ['color', 'spacing', 'border', 'shadow'].includes(type)
}

export function supportsPreview(type: FieldEditorType): boolean {
  return ['color', 'image', 'border', 'shadow'].includes(type)
}

export function requiresValidation(type: FieldEditorType): boolean {
  return ['string', 'number', 'email', 'url'].includes(type)
}
