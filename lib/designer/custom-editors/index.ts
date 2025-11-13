/**
 * 自定义属性编辑器模块
 *
 * 导出所有编辑器相关功能和组件
 */

// 核心注册表
export {
  PropertyEditorRegistry,
  PropertyEditorRegistration,
  PropertyEditorProps,
  PropertyEditorComponent,
  PropertyEditorFactory,
  PropertySchema,
  ValidationRule,
  BuiltInEditorType,
  globalEditorRegistry,
  registerEditor,
  unregisterEditor,
  createEditor,
  getEditor,
  hasEditor,
  listEditors,
  RegisterEditor,
  useEditorRegistry,
} from './property-editor-registry'

// 内置编辑器
export { TextEditor } from './builtin-editors/text-editor'
export { SelectEditor } from './builtin-editors/select-editor'
export { NumberEditor } from './builtin-editors/number-editor'

// 初始化所有内置编辑器
export const initializeBuiltinEditors = () => {
  console.log('Builtin property editors initialized')
}

// 便捷函数：创建属性编辑器
export const createPropertyEditor = (
  type: string,
  props: Omit<PropertyEditorProps, 'onChange'>
): React.ReactElement | null => {
  const EditorComponent = createEditor(type)

  if (!EditorComponent) {
    console.warn(`No editor found for type: ${type}`)
    return null
  }

  return React.createElement(EditorComponent, props)
}

// 便捷函数：获取所有可用的编辑器类型
export const getAvailableEditorTypes = (): string[] => {
  const stats = globalEditorRegistry.getStats()
  return stats.supportedTypes
}

// 便捷函数：检查编辑器是否支持特定功能
export const editorSupportsFeature = (
  type: string,
  feature: 'multiselect' | 'validation' | 'search' | 'custom' | 'file'
): boolean => {
  const editor = getEditor(type)
  if (!editor) return false

  const supportedTypes = editor.supportedTypes || []
  const tags = editor.tags || []

  switch (feature) {
    case 'multiselect':
      return supportedTypes.includes('multiselect') || supportedTypes.includes('array')
    case 'validation':
      return tags.includes('validation')
    case 'search':
      return tags.includes('search') || supportedTypes.includes('searchable')
    case 'custom':
      return editor.category === 'custom'
    case 'file':
      return supportedTypes.includes('file') || supportedTypes.includes('image')
    default:
      return false
  }
}

import React from 'react'