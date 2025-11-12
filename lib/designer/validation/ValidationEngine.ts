/**
 * 属性验证引擎
 * 提供灵活、可扩展的属性验证功能
 */

import type {
  PropertyValue,
  PropertyDefinition,
  ValidationRule,
  ValidationType
} from '@/types/designer'
import { getValidator } from './validators'
import { validateDependencies } from './utils'

// 验证结果接口
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

// 验证错误
export interface ValidationError {
  propertyPath: string
  message: string
  code: string
  severity: 'error' | 'warning'
  rule?: ValidationRule
}

// 验证警告
export interface ValidationWarning {
  propertyPath: string
  message: string
  code: string
  rule?: ValidationRule
}

// 验证上下文
export interface ValidationContext {
  componentId?: string
  componentType?: string
  allProperties?: Record<string, PropertyValue>
  validationMode?: 'strict' | 'lenient'
  locale?: string
}

// 验证器函数类型
export type ValidatorFunction = (
  value: PropertyValue,
  rule: ValidationRule,
  context: ValidationContext
) => Promise<ValidationError | null>

/**
 * 属性验证引擎
 */
export class ValidationEngine {
  private customValidators: Map<string, ValidatorFunction> = new Map()
  private validationCache: Map<string, ValidationResult> = new Map()
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map()

  constructor(private config: ValidationEngineConfig = {}) {
    this.registerBuiltinValidators()
  }

  /**
   * 验证单个属性
   */
  async validateProperty(
    propertyPath: string,
    value: PropertyValue,
    propertyDefinition: PropertyDefinition,
    context: ValidationContext = {}
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // 如果属性不可见，跳过验证
    if (!this.isPropertyVisible(propertyDefinition, context.allProperties || {})) {
      return { isValid: true, errors: [], warnings: [] }
    }

    // 如果属性禁用，跳过验证
    if (this.isPropertyDisabled(propertyDefinition, context.allProperties || {})) {
      return { isValid: true, errors: [], warnings: [] }
    }

    try {
      // 执行验证规则
      if (propertyDefinition.validation) {
        for (const rule of propertyDefinition.validation) {
          const result = await this.executeValidationRule(
            propertyPath,
            value,
            rule,
            context
          )

          if (result) {
            if (result.severity === 'error') {
              errors.push(result)
            } else {
              warnings.push({
                propertyPath,
                message: result.message,
                code: result.code,
                rule: result.rule,
              })
            }
          }
        }
      }

      // 验证必填字段
      if (propertyDefinition.required && this.isEmpty(value)) {
        errors.push({
          propertyPath,
          message: `${propertyDefinition.name || propertyPath}是必填字段`,
          code: 'REQUIRED',
          severity: 'error',
        })
      }

      // 验证依赖条件
      const dependencyErrors = await validateDependencies(
        propertyPath,
        value,
        propertyDefinition.dependencies || [],
        context
      )
      errors.push(...dependencyErrors)

    } catch (error) {
      console.error(`验证属性 ${propertyPath} 时发生错误:`, error)
      errors.push({
        propertyPath,
        message: '验证过程中发生错误',
        code: 'VALIDATION_ERROR',
        severity: 'error',
      })
    }

    const isValid = errors.length === 0

    return {
      isValid,
      errors,
      warnings,
    }
  }

  /**
   * 验证多个属性
   */
  async validateProperties(
    properties: Record<string, PropertyValue>,
    propertyDefinitions: Record<string, PropertyDefinition>,
    context: ValidationContext = {}
  ): Promise<ValidationResult> {
    const allErrors: ValidationError[] = []
    const allWarnings: ValidationWarning[] = []

    for (const [propertyPath, value] of Object.entries(properties)) {
      const propertyDefinition = propertyDefinitions[propertyPath]
      if (!propertyDefinition) {
        continue // 没有定义的属性跳过验证
      }

      const result = await this.validateProperty(
        propertyPath,
        value,
        propertyDefinition,
        {
          ...context,
          allProperties: properties,
        }
      )

      allErrors.push(...result.errors)
      allWarnings.push(...result.warnings)
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    }
  }

  /**
   * 防抖验证
   */
  validatePropertyDebounced(
    propertyPath: string,
    value: PropertyValue,
    propertyDefinition: PropertyDefinition,
    context: ValidationContext = {},
    delay: number = 300
  ): Promise<ValidationResult> {
    return new Promise((resolve) => {
      // 清除之前的定时器
      const existingTimer = this.debounceTimers.get(propertyPath)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      // 设置新的定时器
      const timer = setTimeout(async () => {
        const result = await this.validateProperty(
          propertyPath,
          value,
          propertyDefinition,
          context
        )

        // 更新缓存
        const cacheKey = this.getCacheKey(propertyPath, value, propertyDefinition, context)
        this.validationCache.set(cacheKey, result)

        this.debounceTimers.delete(propertyPath)
        resolve(result)
      }, delay)

      this.debounceTimers.set(propertyPath, timer)
    })
  }

  /**
   * 批量验证
   */
  async validateBatch(
    validationItems: Array<{
      propertyPath: string
      value: PropertyValue
      propertyDefinition: PropertyDefinition
    }>,
    context: ValidationContext = {}
  ): Promise<ValidationResult> {
    const promises = validationItems.map(item =>
      this.validateProperty(
        item.propertyPath,
        item.value,
        item.propertyDefinition,
        context
      )
    )

    const results = await Promise.all(promises)

    const allErrors: ValidationError[] = []
    const allWarnings: ValidationWarning[] = []

    results.forEach(result => {
      allErrors.push(...result.errors)
      allWarnings.push(...result.warnings)
    })

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    }
  }

  /**
   * 注册自定义验证器
   */
  registerValidator(type: string, validator: ValidatorFunction): void {
    this.customValidators.set(type, validator)
  }

  /**
   * 移除自定义验证器
   */
  unregisterValidator(type: string): void {
    this.customValidators.delete(type)
  }

  /**
   * 获取验证器
   */
  getValidator(type: ValidationType): ValidatorFunction | null {
    // 首先检查自定义验证器
    const customValidator = this.customValidators.get(type)
    if (customValidator) {
      return customValidator
    }

    // 返回内置验证器
    return getValidator(type)
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.validationCache.clear()
  }

  /**
   * 清除防抖定时器
   */
  clearDebounceTimers(): void {
    this.debounceTimers.forEach(timer => clearTimeout(timer))
    this.debounceTimers.clear()
  }

  /**
   * 销毁验证引擎
   */
  destroy(): void {
    this.clearCache()
    this.clearDebounceTimers()
    this.customValidators.clear()
  }

  // 私有方法

  private registerBuiltinValidators(): void {
    // 内置验证器已在 validators.ts 中注册
  }

  private async executeValidationRule(
    propertyPath: string,
    value: PropertyValue,
    rule: ValidationRule,
    context: ValidationContext
  ): Promise<ValidationError | null> {
    const validator = this.getValidator(rule.type)
    if (!validator) {
      return {
        propertyPath,
        message: `未知的验证规则类型: ${rule.type}`,
        code: 'UNKNOWN_VALIDATOR',
        severity: 'error',
        rule,
      }
    }

    try {
      const error = await validator(value, rule, {
        ...context,
        propertyPath,
      })

      if (error) {
        return {
          ...error,
          propertyPath,
          rule,
        }
      }

      return null
    } catch (validationError) {
      console.error(`执行验证规则 ${rule.type} 时发生错误:`, validationError)
      return {
        propertyPath,
        message: rule.message || '验证失败',
        code: 'VALIDATION_EXECUTION_ERROR',
        severity: 'error',
        rule,
      }
    }
  }

  private isPropertyVisible(
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

  private isPropertyDisabled(
    propertyDefinition: PropertyDefinition,
    allProperties: Record<string, PropertyValue>
  ): boolean {
    // 检查依赖条件中是否有禁用效果
    return (propertyDefinition.dependencies || []).some(dependency =>
      dependency.effect === 'disable' && this.evaluateCondition(dependency.condition, allProperties)
    )
  }

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

  private isEmpty(value: PropertyValue): boolean {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    )
  }

  private getCacheKey(
    propertyPath: string,
    value: PropertyValue,
    propertyDefinition: PropertyDefinition,
    context: ValidationContext
  ): string {
    return `${propertyPath}:${JSON.stringify(value)}:${JSON.stringify(propertyDefinition.validation)}:${context.componentId || ''}`
  }
}

// 验证引擎配置接口
export interface ValidationEngineConfig {
  cacheSize?: number
  defaultDebounceMs?: number
  strictMode?: boolean
  locale?: string
}

// 创建全局验证引擎实例
export const validationEngine = new ValidationEngine()