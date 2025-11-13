/**
 * 属性编辑器注册表
 *
 * 提供可扩展的属性编辑器系统，支持：
 * - 自定义编辑器注册
 * - 类型映射和验证
 * - 编辑器工厂模式
 * - 动态加载和缓存
 */

import React from 'react'
import { z } from 'zod'

// 基础属性编辑器接口
export interface PropertyEditorProps {
  value: unknown
  onChange: (value: unknown) => void
  schema: PropertySchema
  disabled?: boolean
  placeholder?: string
  className?: string
  error?: string
  onBlur?: () => void
  onFocus?: () => void
}

// 属性编辑器组件类型
export type PropertyEditorComponent = React.ComponentType<PropertyEditorProps>

// 属性编辑器注册信息
export interface PropertyEditorRegistration {
  type: string
  name: string
  description: string
  component: PropertyEditorComponent
  schema?: z.ZodSchema
  supportedTypes?: string[]
  defaultProps?: Partial<PropertyEditorProps>
  category?: 'basic' | 'advanced' | 'custom' | 'layout' | 'style'
  icon?: string
  tags?: string[]
}

// 属性编辑器工厂
export interface PropertyEditorFactory {
  create: (type: string) => PropertyEditorComponent | null
  register: (editor: PropertyEditorRegistration) => void
  unregister: (type: string) => void
  list: (category?: string) => PropertyEditorRegistration[]
  get: (type: string) => PropertyEditorRegistration | null
  has: (type: string) => boolean
}

// 属性模式定义
export interface PropertySchema {
  type: string
  title?: string
  description?: string
  required?: boolean
  default?: unknown
  validation?: ValidationRule[]
  // 额外的UI配置
  ui?: {
    placeholder?: string
    help?: string
    disabled?: boolean
    className?: string
    width?: 'full' | 'fit' | number
    height?: 'auto' | number
    options?: Record<string, unknown>
  }
}

// 验证规则
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  value?: unknown
  message?: string
  validator?: (value: unknown) => boolean | string
}

// 内置编辑器类型
export type BuiltInEditorType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'color'
  | 'date'
  | 'time'
  | 'datetime'
  | 'range'
  | 'textarea'
  | 'file'
  | 'image'
  | 'url'
  | 'email'
  | 'password'
  | 'json'
  | 'array'
  | 'object'

// 属性编辑器注册表实现
export class PropertyEditorRegistry implements PropertyEditorFactory {
  private editors = new Map<string, PropertyEditorRegistration>()
  private typeAliases = new Map<string, string>()
  private fallbackEditor: PropertyEditorComponent

  constructor(fallbackEditor?: PropertyEditorComponent) {
    this.fallbackEditor = fallbackEditor || this.createDefaultFallbackEditor()
  }

  /**
   * 注册属性编辑器
   */
  register(editor: PropertyEditorRegistration): void {
    // 验证注册信息
    this.validateRegistration(editor)

    // 注册编辑器
    this.editors.set(editor.type, editor)

    // 注册类型别名
    if (editor.supportedTypes) {
      editor.supportedTypes.forEach(type => {
        if (type !== editor.type) {
          this.typeAliases.set(type, editor.type)
        }
      })
    }

    console.log(`Property editor registered: ${editor.type} (${editor.name})`)
  }

  /**
   * 注销属性编辑器
   */
  unregister(type: string): void {
    const editor = this.editors.get(type)
    if (!editor) return

    // 删除编辑器
    this.editors.delete(type)

    // 删除类型别名
    this.typeAliases.forEach((actualType, alias) => {
      if (actualType === type) {
        this.typeAliases.delete(alias)
      }
    })

    console.log(`Property editor unregistered: ${type}`)
  }

  /**
   * 创建属性编辑器组件
   */
  create(type: string): PropertyEditorComponent | null {
    // 检查直接类型
    if (this.editors.has(type)) {
      return this.editors.get(type)!.component
    }

    // 检查类型别名
    const actualType = this.typeAliases.get(type)
    if (actualType && this.editors.has(actualType)) {
      return this.editors.get(actualType)!.component
    }

    // 返回fallback编辑器
    return this.fallbackEditor
  }

  /**
   * 获取编辑器注册信息
   */
  get(type: string): PropertyEditorRegistration | null {
    // 检查直接类型
    const editor = this.editors.get(type)
    if (editor) return editor

    // 检查类型别名
    const actualType = this.typeAliases.get(type)
    if (actualType) {
      return this.editors.get(actualType) || null
    }

    return null
  }

  /**
   * 检查编辑器是否存在
   */
  has(type: string): boolean {
    return this.editors.has(type) || this.typeAliases.has(type)
  }

  /**
   * 列出所有编辑器
   */
  list(category?: string): PropertyEditorRegistration[] {
    const editors = Array.from(this.editors.values())

    if (category) {
      return editors.filter(editor => editor.category === category)
    }

    return editors
  }

  /**
   * 获取编辑器统计信息
   */
  getStats(): {
    totalEditors: number
    editorsByCategory: Record<string, number>
    typeAliases: number
    supportedTypes: string[]
  } {
    const editorsByCategory: Record<string, number> = {}
    const supportedTypes = new Set<string>()

    this.editors.forEach(editor => {
      // 统计分类
      const category = editor.category || 'other'
      editorsByCategory[category] = (editorsByCategory[category] || 0) + 1

      // 收集支持的类型
      supportedTypes.add(editor.type)
      if (editor.supportedTypes) {
        editor.supportedTypes.forEach(type => supportedTypes.add(type))
      }
    })

    return {
      totalEditors: this.editors.size,
      editorsByCategory,
      typeAliases: this.typeAliases.size,
      supportedTypes: Array.from(supportedTypes),
    }
  }

  /**
   * 批量注册编辑器
   */
  registerBatch(editors: PropertyEditorRegistration[]): void {
    editors.forEach(editor => this.register(editor))
  }

  /**
   * 清空所有编辑器
   */
  clear(): void {
    this.editors.clear()
    this.typeAliases.clear()
  }

  /**
   * 导出编辑器配置
   */
  export(): string {
    const data = {
      editors: Array.from(this.editors.entries()).map(([type, editor]) => ({
        type,
        name: editor.name,
        description: editor.description,
        supportedTypes: editor.supportedTypes,
        category: editor.category,
        tags: editor.tags,
      })),
      typeAliases: Array.from(this.typeAliases.entries()),
      exportDate: new Date().toISOString(),
    }

    return JSON.stringify(data, null, 2)
  }

  /**
   * 验证注册信息
   */
  private validateRegistration(editor: PropertyEditorRegistration): void {
    if (!editor.type || typeof editor.type !== 'string') {
      throw new Error('Editor type is required and must be a string')
    }

    if (!editor.name || typeof editor.name !== 'string') {
      throw new Error('Editor name is required and must be a string')
    }

    if (!editor.component || typeof editor.component !== 'function') {
      throw new Error('Editor component is required and must be a React component')
    }

    if (this.editors.has(editor.type)) {
      console.warn(`Editor type '${editor.type}' is already registered, it will be overwritten`)
    }
  }

  /**
   * 创建默认fallback编辑器
   */
  private createDefaultFallbackEditor(): PropertyEditorComponent {
    return ({ value, onChange, schema, disabled, placeholder, error }: PropertyEditorProps) => {
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        onChange(newValue)
      }

      return (
        <div className="fallback-editor p-2 border rounded">
          <div className="text-sm text-gray-600 mb-1">
            Unknown editor type: {schema.type}
          </div>
          <input
            type="text"
            value={typeof value === 'string' ? value : JSON.stringify(value)}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full px-2 py-1 border rounded text-sm"
          />
          {error && (
            <div className="text-xs text-red-500 mt-1">{error}</div>
          )}
        </div>
      )
    }
  }
}

// 创建全局编辑器注册表实例
export const globalEditorRegistry = new PropertyEditorRegistry()

// 编辑器注册函数的便捷API
export const registerEditor = (editor: PropertyEditorRegistration): void => {
  globalEditorRegistry.register(editor)
}

export const unregisterEditor = (type: string): void => {
  globalEditorRegistry.unregister(type)
}

export const createEditor = (type: string): PropertyEditorComponent | null => {
  return globalEditorRegistry.create(type)
}

export const getEditor = (type: string): PropertyEditorRegistration | null => {
  return globalEditorRegistry.get(type)
}

export const hasEditor = (type: string): boolean => {
  return globalEditorRegistry.has(type)
}

export const listEditors = (category?: string): PropertyEditorRegistration[] => {
  return globalEditorRegistry.list(category)
}

// 装饰器：用于自动注册编辑器
export function RegisterEditor(config: Partial<PropertyEditorRegistration>) {
  return function <T extends PropertyEditorComponent>(component: T): T {
    const editorConfig: PropertyEditorRegistration = {
      type: config.type || component.displayName || component.name || 'unknown',
      name: config.name || component.displayName || component.name || 'Unknown Editor',
      description: config.description || '',
      component,
      supportedTypes: config.supportedTypes,
      category: config.category || 'custom',
      icon: config.icon,
      tags: config.tags,
    }

    registerEditor(editorConfig)
    return component
  }
}

// Hook for using the editor registry
export const useEditorRegistry = () => {
  const registry = globalEditorRegistry

  return {
    register: registry.register.bind(registry),
    unregister: registry.unregister.bind(registry),
    create: registry.create.bind(registry),
    get: registry.get.bind(registry),
    has: registry.has.bind(registry),
    list: registry.list.bind(registry),
    getStats: registry.getStats.bind(registry),
    clear: registry.clear.bind(registry),
    export: registry.export.bind(registry),
  }
}