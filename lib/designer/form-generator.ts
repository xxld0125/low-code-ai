/**
 * 动态表单生成器
 * 根据属性schema自动生成对应的表单控件
 */

import React from 'react'
import { PropertyType, PropertySchema } from './validation/property-validator'
import type { PropertyEditorProps } from '@/types/designer'

// 简单的输入组件
const SimpleInput: React.FC<{
  type?: string
  value: any
  onChange: (value: any) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}> = ({ type = 'text', value, onChange, placeholder, disabled, className = '' }) => (
  React.createElement('input', {
    type,
    value: value || '',
    onChange: (e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value),
    placeholder,
    disabled,
    className: `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`
  })
)

const SimpleSelect: React.FC<{
  value: any
  onChange: (value: any) => void
  options: any[]
  disabled?: boolean
  className?: string
}> = ({ value, onChange, options, disabled, className = '' }) => (
  React.createElement('select', {
    value: value || '',
    onChange: (e) => onChange(e.target.value),
    disabled,
    className: `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`
  },
    React.createElement('option', { value: '' }, '请选择...'),
    ...options.map(option =>
      React.createElement('option', { key: option, value: option }, option)
    )
  )
)

// 动态表单生成器类
export class DynamicFormGenerator {
  private editorRegistry: Map<string, React.ComponentType<PropertyEditorProps>>

  constructor() {
    this.editorRegistry = new Map()
    this.registerDefaultEditors()
  }

  private registerDefaultEditors() {
    // 注册默认的属性编辑器
    this.editorRegistry.set('text', this.createTextEditor())
    this.editorRegistry.set('number', this.createNumberEditor())
    this.editorRegistry.set('boolean', this.createBooleanEditor())
    this.editorRegistry.set('color', this.createColorEditor())
    this.editorRegistry.set('size', this.createSizeEditor())
    this.editorRegistry.set('select', this.createSelectEditor())
    this.editorRegistry.set('textarea', this.createTextareaEditor())
  }

  /**
   * 根据schema生成对应的编辑器组件
   */
  generateEditor(schema: PropertySchema): React.ComponentType<PropertyEditorProps> {
    const { type, enum: enumValues } = schema

    // 枚举类型使用下拉选择器
    if (enumValues && enumValues.length > 0) {
      return this.editorRegistry.get('select')!
    }

    // 根据类型选择对应的编辑器
    switch (type) {
      case PropertyType.STRING:
        // 如果有maxLength或者是多行文本，使用textarea
        if (schema.maxLength && schema.maxLength > 100) {
          return this.editorRegistry.get('textarea')!
        }
        return this.editorRegistry.get('text')!

      case PropertyType.NUMBER:
        return this.editorRegistry.get('number')!

      case PropertyType.BOOLEAN:
        return this.editorRegistry.get('boolean')!

      case PropertyType.COLOR:
        return this.editorRegistry.get('color')!

      case PropertyType.SIZE:
      case PropertyType.SPACING:
        return this.editorRegistry.get('size')!

      default:
        return this.editorRegistry.get('text')!
    }
  }

  /**
   * 注册自定义编辑器
   */
  registerEditor(type: string, editor: React.ComponentType<PropertyEditorProps>) {
    this.editorRegistry.set(type, editor)
  }

  private createTextEditor(): React.ComponentType<PropertyEditorProps> {
    const TextEditor: React.ComponentType<PropertyEditorProps> = ({ value, onChange, disabled, placeholder }) => (
      React.createElement(SimpleInput, {
        type: 'text',
        value,
        onChange,
        disabled,
        placeholder
      })
    )
    return TextEditor
  }

  private createNumberEditor(): React.ComponentType<PropertyEditorProps> {
    const NumberEditor: React.ComponentType<PropertyEditorProps> = ({ value, onChange, disabled, placeholder }) => (
      React.createElement(SimpleInput, {
        type: 'number',
        value,
        onChange,
        disabled,
        placeholder
      })
    )
    return NumberEditor
  }

  private createBooleanEditor(): React.ComponentType<PropertyEditorProps> {
    const BooleanEditor: React.ComponentType<PropertyEditorProps> = ({ value, onChange, disabled }) => (
      React.createElement('input', {
        type: 'checkbox',
        checked: Boolean(value),
        onChange: (e) => onChange(e.target.checked),
        disabled,
        className: 'w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
      })
    )
    return BooleanEditor
  }

  private createColorEditor(): React.ComponentType<PropertyEditorProps> {
    const ColorEditor: React.ComponentType<PropertyEditorProps> = ({ value, onChange, disabled }) => (
      React.createElement('input', {
        type: 'color',
        value: value || '#000000',
        onChange: (e) => onChange(e.target.value),
        disabled,
        className: 'w-full h-10 border border-gray-300 rounded-md cursor-pointer'
      })
    )
    return ColorEditor
  }

  private createSizeEditor(): React.ComponentType<PropertyEditorProps> {
    const SizeEditor: React.ComponentType<PropertyEditorProps> = ({ value, onChange, disabled, placeholder }) => (
      React.createElement(SimpleInput, {
        type: 'text',
        value,
        onChange,
        disabled,
        placeholder: placeholder || '例如: 10px, 1rem, 50%'
      })
    )
    return SizeEditor
  }

  private createSelectEditor(): React.ComponentType<PropertyEditorProps> {
    const SelectEditor: React.ComponentType<PropertyEditorProps> = ({ value, onChange, disabled, schema }) => {
      const options = schema.enum || []
      return React.createElement(SimpleSelect, {
        value,
        onChange,
        disabled,
        options
      })
    }
    return SelectEditor
  }

  private createTextareaEditor(): React.ComponentType<PropertyEditorProps> {
    const TextareaEditor: React.ComponentType<PropertyEditorProps> = ({ value, onChange, disabled, placeholder }) => (
      React.createElement('textarea', {
        value: value || '',
        onChange: (e) => onChange(e.target.value),
        disabled,
        placeholder,
        rows: 3,
        className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
      })
    )
    return TextareaEditor
  }
}

// 全局表单生成器实例
export const formGenerator = new DynamicFormGenerator()