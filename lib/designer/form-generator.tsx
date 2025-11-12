/**
 * 动态表单生成引擎
 * 根据属性定义自动生成表单字段和编辑器
 */

import React from 'react'
import type {
  PropertyValue,
  PropertyDefinition,
  FormFieldConfig,
  FormConfig,
  FormLayout,
  FormGroup,
} from '@/types/designer'

/**
 * 动态表单生成器
 */
export class FormGenerator {
  private propertyEditors: Map<string, React.ComponentType<any>> = new Map()
  private fieldRenderers: Map<string, FieldRenderer> = new Map()

  constructor() {
    this.registerBuiltinEditors()
    this.registerBuiltinRenderers()
  }

  /**
   * 生成表单配置
   */
  generateForm(
    properties: Record<string, PropertyValue>,
    propertyDefinitions: Record<string, PropertyDefinition>,
    options: FormGeneratorOptions = {}
  ): FormConfig {
    const fields: FormFieldConfig[] = []

    for (const [propertyPath, propertyDef] of Object.entries(propertyDefinitions)) {
      const value = properties[propertyPath]
      const fieldConfig = this.generateField(propertyPath, value, propertyDef, options)

      if (fieldConfig) {
        fields.push(fieldConfig)
      }
    }

    const layout = this.generateLayout(propertyDefinitions, options)
    const validation = this.generateValidation(options)
    const submit = this.generateSubmit(options)

    return {
      fields,
      layout,
      validation,
      submit,
    }
  }

  /**
   * 生成表单字段配置
   */
  generateField(
    propertyPath: string,
    value: PropertyValue,
    propertyDefinition: PropertyDefinition,
    options: FormGeneratorOptions = {}
  ): FormFieldConfig | null {
    // 检查字段是否应该显示
    if (!this.shouldShowField(propertyDefinition, options.allProperties || {})) {
      return null
    }

    const disabled = this.isFieldDisabled(propertyDefinition, options.allProperties || {})
    const visible = this.shouldShowField(propertyDefinition, options.allProperties || {})

    return {
      property: propertyDefinition,
      value,
      error: options.errors?.[propertyPath],
      touched: options.touched?.has(propertyPath) || false,
      disabled,
      visible,
    }
  }

  /**
   * 生成表单布局
   */
  generateLayout(
    propertyDefinitions: Record<string, PropertyDefinition>,
    options: FormGeneratorOptions = {}
  ): FormLayout {
    const layoutType = options.layout?.type || 'vertical'
    const columns = options.layout?.columns || 1
    const spacing = options.layout?.spacing || 'normal'

    // 生成分组
    const groups = this.generateGroups(propertyDefinitions, options)

    return {
      type: layoutType,
      columns,
      spacing,
      groups,
    }
  }

  /**
   * 生成分组
   */
  private generateGroups(
    propertyDefinitions: Record<string, PropertyDefinition>,
    options: FormGeneratorOptions
  ): FormGroup[] {
    const groups: FormGroup[] = []
    const categoryGroups: Record<string, string[]> = {}

    // 按类别分组
    for (const [propertyPath, propertyDef] of Object.entries(propertyDefinitions)) {
      const category = propertyDef.category || 'basic'
      if (!categoryGroups[category]) {
        categoryGroups[category] = []
      }
      categoryGroups[category].push(propertyPath)
    }

    // 创建分组对象
    for (const [category, properties] of Object.entries(categoryGroups)) {
      groups.push({
        id: category,
        title: this.getCategoryDisplayName(category),
        description: this.getCategoryDescription(category),
        collapsed: options.collapsedGroups?.includes(category) || false,
        properties,
      })
    }

    return groups
  }

  /**
   * 生成验证配置
   */
  private generateValidation(options: FormGeneratorOptions): FormConfig['validation'] {
    return {
      mode: options.validation?.mode || 'onChange',
      revalidateMode: options.validation?.revalidateMode || 'onChange',
      validateOnMount: options.validation?.validateOnMount || false,
      debounceMs: options.validation?.debounceMs || 300,
    }
  }

  /**
   * 生成提交配置
   */
  private generateSubmit(options: FormGeneratorOptions): FormConfig['submit'] {
    return {
      mode: options.submit?.mode || 'manual',
      debounceMs: options.submit?.debounceMs || 500,
      validateOnSubmit: options.submit?.validateOnSubmit !== false,
    }
  }

  /**
   * 渲染表单字段
   */
  renderField(
    fieldConfig: FormFieldConfig,
    onChange: (propertyPath: string, value: PropertyValue) => void
  ): React.ReactNode {
    const { property, value, error, disabled } = fieldConfig
    const editorType = property.type

    // 获取自定义渲染器
    const customRenderer = fieldConfig.property.ui?.renderer
    if (customRenderer && this.fieldRenderers.has(customRenderer)) {
      const renderer = this.fieldRenderers.get(customRenderer)!
      return renderer(fieldConfig, onChange)
    }

    // 使用内置编辑器
    const Editor = this.propertyEditors.get(editorType)
    if (Editor) {
      return (
        <Editor
          key={property.key}
          property={property}
          value={value}
          error={error}
          disabled={disabled}
          onChange={newValue => onChange(property.key, newValue)}
        />
      )
    }

    // 默认文本输入
    return (
      <input
        key={property.key}
        type="text"
        value={(value as string) || ''}
        onChange={e => onChange(property.key, e.target.value)}
        disabled={disabled}
        placeholder={property.ui?.placeholder}
        className={property.ui?.className}
      />
    )
  }

  /**
   * 注册属性编辑器
   */
  registerEditor(type: string, editor: React.ComponentType<any>): void {
    this.propertyEditors.set(type, editor)
  }

  /**
   * 注册字段渲染器
   */
  registerFieldRenderer(name: string, renderer: FieldRenderer): void {
    this.fieldRenderers.set(name, renderer)
  }

  /**
   * 检查字段是否应该显示
   */
  private shouldShowField(
    propertyDefinition: PropertyDefinition,
    allProperties: Record<string, PropertyValue>
  ): boolean {
    const showIf = propertyDefinition.ui?.showIf
    if (!showIf) {
      return true
    }

    const conditionValue = allProperties[showIf.property]

    switch (showIf.operator) {
      case 'eq':
        return conditionValue === showIf.value
      case 'ne':
        return conditionValue !== showIf.value
      case 'exists':
        return conditionValue !== undefined && conditionValue !== null
      case 'empty':
        return this.isEmpty(conditionValue)
      case 'notEmpty':
        return !this.isEmpty(conditionValue)
      default:
        return true
    }
  }

  /**
   * 检查字段是否禁用
   */
  private isFieldDisabled(
    propertyDefinition: PropertyDefinition,
    allProperties: Record<string, PropertyValue>
  ): boolean {
    return (propertyDefinition.dependencies || []).some(
      dependency =>
        dependency.effect === 'disable' &&
        this.evaluateCondition(dependency.condition, allProperties)
    )
  }

  /**
   * 评估条件
   */
  private evaluateCondition(
    condition: import('@/types/designer').PropertyCondition,
    allProperties: Record<string, PropertyValue>
  ): boolean {
    const conditionValue = allProperties[condition.property]

    switch (condition.operator) {
      case 'eq':
        return conditionValue === condition.value
      case 'ne':
        return conditionValue !== condition.value
      case 'exists':
        return conditionValue !== undefined && conditionValue !== null
      case 'empty':
        return this.isEmpty(conditionValue)
      case 'notEmpty':
        return !this.isEmpty(conditionValue)
      default:
        return false
    }
  }

  /**
   * 检查值是否为空
   */
  private isEmpty(value: PropertyValue): boolean {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    )
  }

  /**
   * 获取分类显示名称
   */
  private getCategoryDisplayName(category: string): string {
    const categoryNames: Record<string, string> = {
      basic: '基础属性',
      content: '内容属性',
      layout: '布局属性',
      style: '样式属性',
      behavior: '行为属性',
      advanced: '高级属性',
      accessibility: '无障碍属性',
    }

    return categoryNames[category] || category
  }

  /**
   * 获取分类描述
   */
  private getCategoryDescription(category: string): string {
    const categoryDescriptions: Record<string, string> = {
      basic: '组件的基础配置',
      content: '组件的内容相关设置',
      layout: '组件的布局和尺寸设置',
      style: '组件的外观和样式设置',
      behavior: '组件的交互和行为设置',
      advanced: '高级配置选项',
      accessibility: '无障碍访问设置',
    }

    return categoryDescriptions[category] || ''
  }

  /**
   * 注册内置编辑器
   */
  private registerBuiltinEditors(): void {
    // 编辑器注册将在后续的编辑器组件创建时完成
  }

  /**
   * 注册内置渲染器
   */
  private registerBuiltinRenderers(): void {
    // 渲染器注册将在后续完成
  }
}

// 字段渲染器类型
export type FieldRenderer = (
  fieldConfig: FormFieldConfig,
  onChange: (propertyPath: string, value: PropertyValue) => void
) => React.ReactNode

// 表单生成器选项
export interface FormGeneratorOptions {
  layout?: Partial<FormLayout>
  validation?: Partial<FormConfig['validation']>
  submit?: Partial<FormConfig['submit']>
  allProperties?: Record<string, PropertyValue>
  errors?: Record<string, string>
  touched?: Set<string>
  collapsedGroups?: string[]
}

// 创建全局表单生成器实例
export const formGenerator = new FormGenerator()
