/**
 * 组件验证工具
 */

import { ComponentDefinition } from '@/types/page-designer/component'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * 验证组件定义的完整性和一致性
 */
export function validateComponentDefinition(definition: ComponentDefinition): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // 基本字段验证
  if (!definition.type || typeof definition.type !== 'string') {
    errors.push('组件类型(type)是必需的且必须是字符串')
  }

  if (!definition.name || typeof definition.name !== 'string') {
    errors.push('组件名称(name)是必需的且必须是字符串')
  }

  if (!definition.category || typeof definition.category !== 'string') {
    errors.push('组件分类(category)是必需的且必须是字符串')
  }

  // 标签验证
  if (definition.tags) {
    if (!Array.isArray(definition.tags)) {
      errors.push('标签(tags)必须是数组')
    } else {
      const duplicateTags = definition.tags.filter((tag: string, index: number) =>
        definition.tags!.indexOf(tag) !== index
      )
      if (duplicateTags.length > 0) {
        warnings.push(`发现重复标签: ${duplicateTags.join(', ')}`)
      }
    }
  }

  // 属性验证
  if (!definition.defaultProps) {
    errors.push('默认属性(defaultProps)是必需的')
  }

  if (definition.configurable && typeof definition.configurable !== 'object') {
    errors.push('可配置属性(configurable)必须是对象')
  }

  // 响应式配置验证
  if (definition.responsive) {
    if (typeof definition.responsive !== 'object') {
      errors.push('响应式配置(responsive)必须是对象')
    } else {
      const { breakpoints, properties } = definition.responsive
      if (breakpoints && !Array.isArray(breakpoints)) {
        errors.push('响应式断点(breakpoints)必须是数组')
      }
      if (properties && !Array.isArray(properties)) {
        errors.push('响应式属性(properties)必须是数组')
      }
    }
  }

  // 示例数据验证
  if (definition.examples) {
    if (!Array.isArray(definition.examples)) {
      errors.push('示例数据(examples)必须是数组')
    } else {
      definition.examples.forEach((example, index) => {
        if (!example.name) {
          errors.push(`示例${index + 1}缺少名称`)
        }
        if (!example.props) {
          warnings.push(`示例${index + 1}缺少属性定义`)
        }
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * 验证组件属性值
 */
export function validateComponentProps(
  componentName: string,
  props: Record<string, any>,
  definition: ComponentDefinition
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // 验证必需属性
  if (definition.configurable) {
    Object.entries(definition.configurable).forEach(([key, config]) => {
      if (typeof config === 'object' && config !== null && (config as any).required && !(key in props)) {
        errors.push(`组件${componentName}缺少必需属性: ${key}`)
      }

      // 类型验证
      if (key in props && typeof config === 'object' && config !== null) {
        const value = props[key]
        const expectedType = (config as any).type

        switch (expectedType) {
          case 'number':
            if (typeof value !== 'number' && value !== null && value !== undefined) {
              errors.push(`组件${componentName}属性${key}应该是数字类型`)
            }
            break
          case 'string':
            if (typeof value !== 'string' && value !== null && value !== undefined) {
              errors.push(`组件${componentName}属性${key}应该是字符串类型`)
            }
            break
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push(`组件${componentName}属性${key}应该是布尔类型`)
            }
            break
          case 'select':
            if ((config as any).options && Array.isArray((config as any).options) && !(config as any).options.some((opt: any) => opt.value === value)) {
              errors.push(`组件${componentName}属性${key}的值不在可选范围内`)
            }
            break
        }

        // 范围验证
        if (typeof value === 'number' && typeof config === 'object' && config !== null) {
          if ('min' in config && value < (config as any).min) {
            errors.push(`组件${componentName}属性${key}的值不能小于${(config as any).min}`)
          }
          if ('max' in config && value > (config as any).max) {
            errors.push(`组件${componentName}属性${key}的值不能大于${(config as any).max}`)
          }
        }
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * 批量验证组件定义
 */
export function validateComponentDefinitions(
  definitions: ComponentDefinition[]
): { valid: ComponentDefinition[]; invalid: Array<{ definition: ComponentDefinition; result: ValidationResult }> } {
  const valid: ComponentDefinition[] = []
  const invalid: Array<{ definition: ComponentDefinition; result: ValidationResult }> = []

  definitions.forEach(definition => {
    const result = validateComponentDefinition(definition)
    if (result.isValid) {
      valid.push(definition)
    } else {
      invalid.push({ definition, result })
    }
  })

  return { valid, invalid }
}