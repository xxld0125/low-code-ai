/**
 * 页面设计器属性验证和约束检查
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 */

import { z } from 'zod'
import {
  PropertyValue,
  PropertyDefinition,
  PropertyValidationResult,
} from '@/types/page-designer/properties'
import {
  ComponentType,
  ComponentInstance as ComponentInstanceType,
} from '@/types/page-designer/component'

// 验证结果枚举
export enum ValidationSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

// 详细验证结果
export interface DetailedValidationResult extends PropertyValidationResult {
  severity: ValidationSeverity
  code?: string
  path?: string
  context?: Record<string, any>
  suggestions?: string[]
}

// 验证上下文
export interface ValidationContext {
  componentType: ComponentType
  componentId: string
  parentComponentId?: string
  siblingComponents: ComponentInstanceType[]
  allComponents: ComponentInstanceType[]
  canvasConstraints?: CanvasConstraints
}

// 画布约束
export interface CanvasConstraints {
  maxWidth: number
  maxHeight: number
  maxComponents: number
  allowedComponents: ComponentType[]
  forbiddenComponents: ComponentType[]
}

// 基础属性验证器
export class PropertyValidator {
  // 验证单个属性
  static validateProperty(
    value: PropertyValue,
    definition: PropertyDefinition,
    context?: ValidationContext
  ): DetailedValidationResult {
    const result: DetailedValidationResult = {
      isValid: true,
      severity: ValidationSeverity.INFO,
    }

    try {
      // 1. 必填验证
      if (definition.required && (value === undefined || value === null || value === '')) {
        return {
          isValid: false,
          error: `此属性为必填项`,
          severity: ValidationSeverity.ERROR,
          code: 'REQUIRED_FIELD',
          suggestions: [`请提供有效的${definition.label}`],
        }
      }

      // 如果不是必填且值为空，跳过后续验证
      if (!definition.required && (value === undefined || value === null || value === '')) {
        return { isValid: true, severity: ValidationSeverity.INFO }
      }

      // 2. 类型验证
      const typeValidation = this.validateType(value, definition)
      if (!typeValidation.isValid) {
        return typeValidation
      }

      // 3. 约束验证
      const constraintValidation = this.validateConstraints(value, definition)
      if (!constraintValidation.isValid) {
        return constraintValidation
      }

      // 4. 条件验证
      if (definition.condition && context) {
        const conditionValidation = this.validateCondition(value, definition, context)
        if (!conditionValidation.isValid) {
          return conditionValidation
        }
      }

      // 5. 业务规则验证
      const businessValidation = this.validateBusinessRules(value, definition, context)
      if (!businessValidation.isValid) {
        return businessValidation
      }
    } catch (error) {
      return {
        isValid: false,
        error: `验证过程中发生错误: ${error instanceof Error ? error.message : String(error)}`,
        severity: ValidationSeverity.ERROR,
        code: 'VALIDATION_ERROR',
      }
    }

    return result
  }

  // 验证数据类型
  private static validateType(
    value: PropertyValue,
    definition: PropertyDefinition
  ): DetailedValidationResult {
    const { type } = definition

    switch (type) {
      case 'text':
      case 'color':
        if (typeof value !== 'string') {
          return {
            isValid: false,
            error: `期望字符串类型，实际收到 ${typeof value}`,
            severity: ValidationSeverity.ERROR,
            code: 'TYPE_MISMATCH',
            suggestions: [`请输入有效的${definition.label}`],
          }
        }
        break

      case 'number':
      case 'size':
        if (typeof value !== 'number' && typeof value !== 'string') {
          return {
            isValid: false,
            error: `期望数字类型，实际收到 ${typeof value}`,
            severity: ValidationSeverity.ERROR,
            code: 'TYPE_MISMATCH',
          }
        }
        const numValue = typeof value === 'string' ? parseFloat(value) : value
        if (isNaN(numValue)) {
          return {
            isValid: false,
            error: `无效的数字格式`,
            severity: ValidationSeverity.ERROR,
            code: 'INVALID_NUMBER',
            suggestions: ['请输入有效的数字'],
          }
        }
        break

      case 'boolean':
        if (typeof value !== 'boolean') {
          return {
            isValid: false,
            error: `期望布尔类型，实际收到 ${typeof value}`,
            severity: ValidationSeverity.ERROR,
            code: 'TYPE_MISMATCH',
          }
        }
        break

      case 'select':
        if (!definition.validation?.options) {
          return {
            isValid: false,
            error: `选择类型缺少选项定义`,
            severity: ValidationSeverity.ERROR,
            code: 'MISSING_OPTIONS',
          }
        }
        if (!definition.validation.options.includes(value)) {
          return {
            isValid: false,
            error: `无效的选项值: ${value}`,
            severity: ValidationSeverity.ERROR,
            code: 'INVALID_OPTION',
            suggestions: [`请选择: ${definition.validation.options.join(', ')}`],
          }
        }
        break

      case 'array':
        if (!Array.isArray(value)) {
          return {
            isValid: false,
            error: `期望数组类型，实际收到 ${typeof value}`,
            severity: ValidationSeverity.ERROR,
            code: 'TYPE_MISMATCH',
          }
        }
        break

      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          return {
            isValid: false,
            error: `期望对象类型，实际收到 ${typeof value}`,
            severity: ValidationSeverity.ERROR,
            code: 'TYPE_MISMATCH',
          }
        }
        break
    }

    return { isValid: true, severity: ValidationSeverity.INFO }
  }

  // 验证约束条件
  private static validateConstraints(
    value: PropertyValue,
    definition: PropertyDefinition
  ): DetailedValidationResult {
    const validation = definition.validation
    if (!validation) return { isValid: true, severity: ValidationSeverity.INFO }

    const numValue = typeof value === 'string' ? parseFloat(value) : (value as number)

    // 数字约束
    if (typeof numValue === 'number' && !isNaN(numValue)) {
      if (validation.min !== undefined && numValue < validation.min) {
        return {
          isValid: false,
          error: `值不能小于 ${validation.min}`,
          severity: ValidationSeverity.ERROR,
          code: 'MIN_VIOLATION',
          suggestions: [`请输入大于或等于 ${validation.min} 的值`],
        }
      }

      if (validation.max !== undefined && numValue > validation.max) {
        return {
          isValid: false,
          error: `值不能大于 ${validation.max}`,
          severity: ValidationSeverity.ERROR,
          code: 'MAX_VIOLATION',
          suggestions: [`请输入小于或等于 ${validation.max} 的值`],
        }
      }
    }

    // 字符串约束
    if (typeof value === 'string') {
      if (validation.minLength !== undefined && value.length < validation.minLength) {
        return {
          isValid: false,
          error: `长度不能少于 ${validation.minLength} 个字符`,
          severity: ValidationSeverity.ERROR,
          code: 'MIN_LENGTH_VIOLATION',
          suggestions: [`请输入至少 ${validation.minLength} 个字符`],
        }
      }

      if (validation.maxLength !== undefined && value.length > validation.maxLength) {
        return {
          isValid: false,
          error: `长度不能超过 ${validation.maxLength} 个字符`,
          severity: ValidationSeverity.ERROR,
          code: 'MAX_LENGTH_VIOLATION',
          suggestions: [`请输入不超过 ${validation.maxLength} 个字符`],
        }
      }

      if (validation.pattern) {
        const regex = new RegExp(validation.pattern)
        if (!regex.test(value)) {
          return {
            isValid: false,
            error: `格式不正确`,
            severity: ValidationSeverity.ERROR,
            code: 'PATTERN_VIOLATION',
            suggestions: ['请检查输入格式'],
          }
        }
      }
    }

    return { isValid: true, severity: ValidationSeverity.INFO }
  }

  // 验证条件显示
  private static validateCondition(
    value: PropertyValue,
    definition: PropertyDefinition,
    context: ValidationContext
  ): DetailedValidationResult {
    const { condition } = definition
    if (!condition) return { isValid: true, severity: ValidationSeverity.INFO }

    // 这里需要根据上下文获取其他属性的值
    // 由于当前架构限制，这里只做基础验证
    return { isValid: true, severity: ValidationSeverity.INFO }
  }

  // 验证业务规则
  private static validateBusinessRules(
    value: PropertyValue,
    definition: PropertyDefinition,
    context?: ValidationContext
  ): DetailedValidationResult {
    if (!context) return { isValid: true, severity: ValidationSeverity.INFO }

    const { componentType, componentId } = context

    // 根据组件类型进行特定的业务规则验证
    switch (componentType) {
      case 'button':
        return this.validateButtonProperty(value, definition, context)
      case 'input':
        return this.validateInputProperty(value, definition, context)
      case 'image':
        return this.validateImageProperty(value, definition, context)
      case 'text':
        return this.validateTextProperty(value, definition, context)
      default:
        return { isValid: true, severity: ValidationSeverity.INFO }
    }
  }

  // 验证按钮属性
  private static validateButtonProperty(
    value: PropertyValue,
    definition: PropertyDefinition,
    context: ValidationContext
  ): DetailedValidationResult {
    if (definition.name === 'button.text') {
      const text = String(value).trim()
      if (text.length === 0) {
        return {
          isValid: false,
          error: '按钮文字不能为空',
          severity: ValidationSeverity.ERROR,
          code: 'BUTTON_TEXT_EMPTY',
          suggestions: ['请输入按钮文字'],
        }
      }
      if (text.length > 50) {
        return {
          isValid: false,
          error: '按钮文字过长',
          severity: ValidationSeverity.WARNING,
          code: 'BUTTON_TEXT_TOO_LONG',
          suggestions: ['建议按钮文字不超过20个字符'],
        }
      }
    }

    return { isValid: true, severity: ValidationSeverity.INFO }
  }

  // 验证输入框属性
  private static validateInputProperty(
    value: PropertyValue,
    definition: PropertyDefinition,
    context: ValidationContext
  ): DetailedValidationResult {
    if (definition.name === 'input.placeholder') {
      const placeholder = String(value).trim()
      if (placeholder.length > 100) {
        return {
          isValid: false,
          error: '占位符文字过长',
          severity: ValidationSeverity.WARNING,
          code: 'PLACEHOLDER_TOO_LONG',
          suggestions: ['建议占位符不超过50个字符'],
        }
      }
    }

    if (definition.name === 'input.maxlength') {
      const maxLength = Number(value)
      if (maxLength < 1) {
        return {
          isValid: false,
          error: '最大长度必须大于0',
          severity: ValidationSeverity.ERROR,
          code: 'INVALID_MAX_LENGTH',
          suggestions: ['请输入大于0的数字'],
        }
      }
      if (maxLength > 1000) {
        return {
          isValid: false,
          error: '最大长度过长',
          severity: ValidationSeverity.WARNING,
          code: 'MAX_LENGTH_TOO_LONG',
          suggestions: ['建议最大长度不超过500个字符'],
        }
      }
    }

    return { isValid: true, severity: ValidationSeverity.INFO }
  }

  // 验证图片属性
  private static validateImageProperty(
    value: PropertyValue,
    definition: PropertyDefinition,
    context: ValidationContext
  ): DetailedValidationResult {
    if (definition.name === 'image.src') {
      const src = String(value).trim()
      if (src.length === 0) {
        return {
          isValid: false,
          error: '图片地址不能为空',
          severity: ValidationSeverity.ERROR,
          code: 'IMAGE_SRC_EMPTY',
          suggestions: ['请输入有效的图片地址'],
        }
      }

      // 验证URL格式
      try {
        new URL(src)
      } catch {
        // 如果不是完整URL，检查是否为相对路径
        if (!src.startsWith('/') && !src.startsWith('./')) {
          return {
            isValid: false,
            error: '无效的图片地址格式',
            severity: ValidationSeverity.WARNING,
            code: 'INVALID_IMAGE_URL',
            suggestions: ['请输入完整的URL或相对路径'],
          }
        }
      }
    }

    return { isValid: true, severity: ValidationSeverity.INFO }
  }

  // 验证文本属性
  private static validateTextProperty(
    value: PropertyValue,
    definition: PropertyDefinition,
    context: ValidationContext
  ): DetailedValidationResult {
    if (definition.name === 'text.content') {
      const content = String(value).trim()
      if (content.length === 0) {
        return {
          isValid: false,
          error: '文本内容不能为空',
          severity: ValidationSeverity.ERROR,
          code: 'TEXT_CONTENT_EMPTY',
          suggestions: ['请输入文本内容'],
        }
      }
      if (content.length > 10000) {
        return {
          isValid: false,
          error: '文本内容过长',
          severity: ValidationSeverity.WARNING,
          code: 'TEXT_CONTENT_TOO_LONG',
          suggestions: ['建议文本内容不超过5000个字符'],
        }
      }
    }

    return { isValid: true, severity: ValidationSeverity.INFO }
  }
}

// 组件验证器 - 验证整个组件的属性
export class ComponentValidator {
  // 验证组件实例
  static validateComponent(
    component: ComponentInstanceType,
    allComponents: ComponentInstanceType[],
    canvasConstraints?: CanvasConstraints
  ): DetailedValidationResult[] {
    const results: DetailedValidationResult[] = []
    const context: ValidationContext = {
      componentType: component.component_type,
      componentId: component.id,
      siblingComponents: allComponents.filter(c => c.id !== component.id),
      allComponents,
      canvasConstraints,
    }

    // 获取组件的属性定义
    const propertyDefinitions = this.getComponentPropertyDefinitions(component.component_type)

    // 验证属性
    for (const [key, value] of Object.entries(component.props)) {
      const definition = propertyDefinitions[key]
      if (definition) {
        const result = PropertyValidator.validateProperty(value, definition, context)
        if (!result.isValid || result.severity === ValidationSeverity.WARNING) {
          result.path = `props.${key}`
          results.push(result)
        }
      }
    }

    // 验证样式
    for (const [key, value] of Object.entries(component.styles)) {
      const definition = this.getStylePropertyDefinition(key)
      if (definition) {
        const result = PropertyValidator.validateProperty(value, definition, context)
        if (!result.isValid || result.severity === ValidationSeverity.WARNING) {
          result.path = `styles.${key}`
          results.push(result)
        }
      }
    }

    // 验证布局约束
    const layoutValidation = this.validateLayoutConstraints(component, allComponents)
    results.push(...layoutValidation)

    // 验证画布约束
    if (canvasConstraints) {
      const canvasValidation = this.validateCanvasConstraints(component, canvasConstraints)
      results.push(...canvasValidation)
    }

    return results
  }

  // 获取组件属性定义
  private static getComponentPropertyDefinitions(
    componentType: ComponentType
  ): Record<string, PropertyDefinition> {
    // 这里应该从组件注册表获取定义，这里提供简化版本
    const definitions: Record<string, Record<string, PropertyDefinition>> = {
      button: {
        'button.text': {
          name: 'button.text',
          type: 'text',
          label: '按钮文字',
          required: true,
          validation: { maxLength: 50 },
        },
        'button.variant': {
          name: 'button.variant',
          type: 'select',
          label: '按钮样式',
          required: true,
          validation: { options: ['primary', 'secondary', 'outline', 'ghost', 'link'] },
        },
      },
      input: {
        'input.placeholder': {
          name: 'input.placeholder',
          type: 'text',
          label: '占位符',
          validation: { maxLength: 100 },
        },
        'input.required': {
          name: 'input.required',
          type: 'boolean',
          label: '必填字段',
        },
        'input.maxlength': {
          name: 'input.maxlength',
          type: 'number',
          label: '最大长度',
          validation: { min: 1, max: 1000 },
        },
      },
      text: {
        'text.content': {
          name: 'text.content',
          type: 'text',
          label: '文本内容',
          required: true,
          validation: { maxLength: 10000 },
        },
      },
      image: {
        'image.src': {
          name: 'image.src',
          type: 'text',
          label: '图片地址',
          required: true,
        },
        'image.alt': {
          name: 'image.alt',
          type: 'text',
          label: '替代文字',
          validation: { maxLength: 200 },
        },
      },
    }

    return definitions[componentType] || {}
  }

  // 获取样式属性定义
  private static getStylePropertyDefinition(styleKey: string): PropertyDefinition | null {
    // 常用样式属性定义
    const styleDefinitions: Record<string, PropertyDefinition> = {
      width: {
        name: 'width',
        type: 'size',
        label: '宽度',
        validation: { min: 0, max: 2000 },
      },
      height: {
        name: 'height',
        type: 'size',
        label: '高度',
        validation: { min: 0, max: 2000 },
      },
      fontSize: {
        name: 'fontSize',
        type: 'number',
        label: '字体大小',
        validation: { min: 8, max: 120 },
      },
      padding: {
        name: 'padding',
        type: 'size',
        label: '内边距',
        validation: { min: 0, max: 200 },
      },
      margin: {
        name: 'margin',
        type: 'size',
        label: '外边距',
        validation: { min: 0, max: 200 },
      },
    }

    return styleDefinitions[styleKey] || null
  }

  // 验证布局约束
  private static validateLayoutConstraints(
    component: ComponentInstanceType,
    allComponents: ComponentInstanceType[]
  ): DetailedValidationResult[] {
    const results: DetailedValidationResult[] = []

    // 检查嵌套深度
    const maxDepth = this.calculateNestingDepth(component, allComponents)
    if (maxDepth > 5) {
      results.push({
        isValid: false,
        error: '组件嵌套层级过深',
        severity: ValidationSeverity.WARNING,
        code: 'NESTING_TOO_DEEP',
        path: 'hierarchy',
        suggestions: ['建议减少嵌套层级以提高性能'],
      })
    }

    // 检查子组件数量
    const childCount = this.getChildCount(component, allComponents)
    if (childCount > 50) {
      results.push({
        isValid: false,
        error: '子组件数量过多',
        severity: ValidationSeverity.WARNING,
        code: 'TOO_MANY_CHILDREN',
        path: 'hierarchy',
        suggestions: ['建议减少子组件数量以提高性能'],
      })
    }

    return results
  }

  // 计算嵌套深度
  private static calculateNestingDepth(
    component: ComponentInstanceType,
    allComponents: ComponentInstanceType[],
    currentDepth = 0
  ): number {
    if (currentDepth > 10) return currentDepth // 防止无限递归

    const children = allComponents.filter(c => c.parent_id === component.id)
    if (children.length === 0) return currentDepth

    return Math.max(
      ...children.map(child => this.calculateNestingDepth(child, allComponents, currentDepth + 1))
    )
  }

  // 获取子组件数量
  private static getChildCount(
    component: ComponentInstanceType,
    allComponents: ComponentInstanceType[]
  ): number {
    return allComponents.filter(c => c.parent_id === component.id).length
  }

  // 验证画布约束
  private static validateCanvasConstraints(
    component: ComponentInstanceType,
    constraints: CanvasConstraints
  ): DetailedValidationResult[] {
    const results: DetailedValidationResult[] = []

    // 检查组件类型是否允许
    if (constraints.forbiddenComponents.includes(component.component_type)) {
      results.push({
        isValid: false,
        error: `不允许使用 ${component.component_type} 类型的组件`,
        severity: ValidationSeverity.ERROR,
        code: 'FORBIDDEN_COMPONENT_TYPE',
        suggestions: ['请选择允许的组件类型'],
      })
    }

    if (
      constraints.allowedComponents.length > 0 &&
      !constraints.allowedComponents.includes(component.component_type)
    ) {
      results.push({
        isValid: false,
        error: `不允许使用 ${component.component_type} 类型的组件`,
        severity: ValidationSeverity.ERROR,
        code: 'UNALLOWED_COMPONENT_TYPE',
        suggestions: [`请选择: ${constraints.allowedComponents.join(', ')}`],
      })
    }

    return results
  }
}

// 验证工具函数
export const ValidationUtils = {
  // 批量验证属性
  validateProperties(
    properties: Record<string, PropertyValue>,
    definitions: Record<string, PropertyDefinition>,
    context?: ValidationContext
  ): DetailedValidationResult[] {
    const results: DetailedValidationResult[] = []

    for (const [key, value] of Object.entries(properties)) {
      const definition = definitions[key]
      if (definition) {
        const result = PropertyValidator.validateProperty(value, definition, context)
        if (!result.isValid || result.severity === ValidationSeverity.WARNING) {
          result.path = key
          results.push(result)
        }
      }
    }

    return results
  },

  // 过滤验证结果
  filterResults(
    results: DetailedValidationResult[],
    severity?: ValidationSeverity
  ): DetailedValidationResult[] {
    if (!severity) return results
    return results.filter(result => result.severity === severity)
  },

  // 获取错误摘要
  getErrorSummary(results: DetailedValidationResult[]): {
    total: number
    errors: number
    warnings: number
    info: number
  } {
    return {
      total: results.length,
      errors: results.filter(r => r.severity === ValidationSeverity.ERROR).length,
      warnings: results.filter(r => r.severity === ValidationSeverity.WARNING).length,
      info: results.filter(r => r.severity === ValidationSeverity.INFO).length,
    }
  },
}

export default PropertyValidator
