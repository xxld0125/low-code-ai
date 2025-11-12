/**
 * 组件属性验证器
 * 用于验证组件属性的配置值是否符合规范
 */

export enum PropertyType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
  COLOR = 'color',
  SIZE = 'size',
  SPACING = 'spacing'
}

export interface PropertySchema {
  type: PropertyType
  required?: boolean
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  pattern?: string
  enum?: any[]
  default?: any
  nullable?: boolean
  customRules?: ValidationRule[]
}

export interface ValidationRule {
  type: string
  validator: (value: any, schema?: PropertySchema) => ValidationResult | Promise<ValidationResult>
  message?: string // 自定义错误消息
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings?: ValidationWarning[]
}

// 内部验证结果接口
interface InternalValidationResult {
  valid: boolean
  message?: string | null
  code?: string
}

export interface ValidationError {
  code: string
  message: string
  property?: string
  value?: any
}

export interface ValidationWarning {
  code: string
  message: string
  property?: string
  suggestion?: string
}

export class PropertyValidator {
  private defaultRules: Map<string, ValidationRule> = new Map()

  constructor() {
    this.initializeDefaultRules()
  }

  private initializeDefaultRules() {
    // 字符串验证规则
    this.defaultRules.set('minLength', {
      type: 'minLength',
      validator: (value: any, schema: PropertySchema): InternalValidationResult => ({
        valid: typeof value === 'string' && value.length >= (schema.minLength || 0),
        message: `至少需要${schema.minLength}个字符`,
        code: 'MIN_LENGTH'
      })
    })

    this.defaultRules.set('maxLength', {
      type: 'maxLength',
      validator: (value: any, schema: PropertySchema): InternalValidationResult => ({
        valid: typeof value === 'string' && value.length <= (schema.maxLength || Infinity),
        message: `不能超过${schema.maxLength}个字符`,
        code: 'MAX_LENGTH'
      })
    })

    this.defaultRules.set('pattern', {
      type: 'pattern',
      validator: (value: any, schema: PropertySchema): InternalValidationResult => {
        if (!schema.pattern || typeof value !== 'string') {
          return { valid: true, message: null, code: 'PATTERN' }
        }
        const regex = new RegExp(schema.pattern)
        return {
          valid: regex.test(value),
          message: '格式不正确',
          code: 'PATTERN'
        }
      }
    })

    // 数字验证规则
    this.defaultRules.set('minimum', {
      type: 'minimum',
      validator: (value: any, schema: PropertySchema): InternalValidationResult => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value
        return {
          valid: typeof numValue === 'number' && numValue >= (schema.minimum || -Infinity),
          message: `不能小于${schema.minimum}`,
          code: 'MINIMUM'
        }
      }
    })

    this.defaultRules.set('maximum', {
      type: 'maximum',
      validator: (value: any, schema: PropertySchema): InternalValidationResult => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value
        return {
          valid: typeof numValue === 'number' && numValue <= (schema.maximum || Infinity),
          message: `不能大于${schema.maximum}`,
          code: 'MAXIMUM'
        }
      }
    })

    // 枚举验证规则
    this.defaultRules.set('enum', {
      type: 'enum',
      validator: (value: any, schema: PropertySchema): InternalValidationResult => ({
        valid: schema.enum ? schema.enum.includes(value) : true,
        message: schema.enum ? `必须是以下值之一: ${schema.enum.join(', ')}` : '',
        code: 'ENUM'
      })
    })

    // 布尔值验证规则
    this.defaultRules.set('boolean', {
      type: 'boolean',
      validator: (value: any): InternalValidationResult => {
        if (typeof value === 'boolean') {
          return { valid: true, message: null, code: 'BOOLEAN' }
        }
        if (typeof value === 'string') {
          const lowerValue = value.toLowerCase()
          if (['true', 'false', '1', '0'].includes(lowerValue)) {
            return { valid: true, message: null, code: 'BOOLEAN' }
          }
        }
        return {
          valid: false,
          message: '必须是布尔值 (true/false)',
          code: 'BOOLEAN'
        }
      }
    })

    // 数字类型验证规则
    this.defaultRules.set('number', {
      type: 'number',
      validator: (value: any): InternalValidationResult => {
        if (typeof value === 'number') {
          return { valid: true, message: null, code: 'NUMBER' }
        }
        if (typeof value === 'string') {
          const numValue = parseFloat(value)
          if (!isNaN(numValue)) {
            return { valid: true, message: null, code: 'NUMBER' }
          }
        }
        return {
          valid: false,
          message: '必须是数字',
          code: 'NUMBER'
        }
      }
    })
  }

  /**
   * 验证单个属性值
   */
  validate(value: any, schema: PropertySchema): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // 检查必需字段
    if (schema.required && this.isEmpty(value)) {
      errors.push({
        code: 'REQUIRED',
        message: '这是必填项',
        value
      })
      return { valid: false, errors, warnings }
    }

    // 如果值为空且不是必需字段，直接通过
    if (this.isEmpty(value) && !schema.required) {
      return { valid: true, errors, warnings }
    }

    // 类型验证
    const typeValidation = this.validateType(value, schema)
    if (!typeValidation.valid) {
      errors.push(typeValidation)
      return { valid: false, errors, warnings }
    }

    // 基础规则验证
    for (const [ruleName, rule] of this.defaultRules) {
      if (this.shouldApplyRule(ruleName, schema)) {
        const result = rule.validator(value, schema)
        if (!result.valid) {
          errors.push({
            code: result.code || ruleName,
            message: result.message || '',
            value
          })
        }
      }
    }

    // 自定义规则验证
    if (schema.customRules) {
      for (const customRule of schema.customRules) {
        const result = customRule.validator(value, schema)
        if (!result.valid) {
          errors.push({
            code: 'CUSTOM',
            message: result.message || '自定义验证失败',
            value
          })
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 异步验证单个属性值
   */
  async validateAsync(value: any, schema: PropertySchema): Promise<ValidationResult> {
    const syncResult = this.validate(value, schema)

    // 如果有异步自定义规则，执行异步验证
    if (schema.customRules) {
      const asyncRules = schema.customRules.filter(rule =>
        rule.validator.constructor.name === 'AsyncFunction'
      )

      if (asyncRules.length > 0) {
        for (const asyncRule of asyncRules) {
          try {
            const result = await asyncRule.validator(value, schema)
            if (!result.valid) {
              syncResult.errors.push({
                code: 'ASYNC_CUSTOM',
                message: result.message || '异步验证失败',
                value
              })
              syncResult.valid = false
            }
          } catch (error) {
            syncResult.errors.push({
              code: 'ASYNC_ERROR',
              message: '异步验证过程中发生错误',
              value
            })
            syncResult.valid = false
          }
        }
      }
    }

    return syncResult
  }

  /**
   * 批量验证多个属性
   */
  validateMultiple(
    values: Record<string, any>,
    schemas: Record<string, PropertySchema>
  ): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {}

    for (const [propertyName, schema] of Object.entries(schemas)) {
      const value = values[propertyName]
      results[propertyName] = this.validate(value, schema)
    }

    return results
  }

  /**
   * 批量异步验证多个属性
   */
  async validateMultipleAsync(
    values: Record<string, any>,
    schemas: Record<string, PropertySchema>
  ): Promise<Record<string, ValidationResult>> {
    const promises = Object.entries(schemas).map(async ([propertyName, schema]) => {
      const value = values[propertyName]
      const result = await this.validateAsync(value, schema)
      return [propertyName, result]
    })

    const results = await Promise.all(promises)
    return Object.fromEntries(results)
  }

  private validateType(value: any, schema: PropertySchema): ValidationError | null {
    const expectedType = schema.type

    switch (expectedType) {
      case PropertyType.STRING:
        if (typeof value !== 'string') {
          return {
            code: 'TYPE_MISMATCH',
            message: '必须是字符串',
            value
          }
        }
        break

      case PropertyType.NUMBER:
        const numberRule = this.defaultRules.get('number')
        if (numberRule) {
          const result = numberRule.validator(value)
          if (!result.valid) {
            return {
              code: 'TYPE_MISMATCH',
              message: result.message || '必须是数字',
              value
            }
          }
        }
        break

      case PropertyType.BOOLEAN:
        const booleanRule = this.defaultRules.get('boolean')
        if (booleanRule) {
          const result = booleanRule.validator(value)
          if (!result.valid) {
            return {
              code: 'TYPE_MISMATCH',
              message: result.message || '必须是布尔值',
              value
            }
          }
        }
        break

      case PropertyType.OBJECT:
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          return {
            code: 'TYPE_MISMATCH',
            message: '必须是对象',
            value
          }
        }
        break

      case PropertyType.ARRAY:
        if (!Array.isArray(value)) {
          return {
            code: 'TYPE_MISMATCH',
            message: '必须是数组',
            value
          }
        }
        break

      case PropertyType.COLOR:
        // 简单的颜色验证
        const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^[a-zA-Z]+$|^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$|^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/
        if (typeof value !== 'string' || !colorRegex.test(value)) {
          return {
            code: 'TYPE_MISMATCH',
            message: '必须是有效的颜色值',
            value
          }
        }
        break

      case PropertyType.SIZE:
        // 简单的尺寸验证 (支持 px, rem, em, % 等)
        const sizeRegex = /^\d+(px|rem|em|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)$/
        if (typeof value !== 'string' || !sizeRegex.test(value)) {
          return {
            code: 'TYPE_MISMATCH',
            message: '必须是有效的尺寸值 (如: 10px, 1rem, 50%)',
            value
          }
        }
        break

      case PropertyType.SPACING:
        // 间距验证 (支持 1-4个值)
        const spacingRegex = /^(\d+(px|rem|em|pt|pc|in|cm|mm|ex|ch))(?:\s+\d+(px|rem|em|pt|pc|in|cm|mm|ex|ch)){0,3}$/
        if (typeof value !== 'string' || !spacingRegex.test(value)) {
          return {
            code: 'TYPE_MISMATCH',
            message: '必须是有效的间距值 (如: 10px 或 10px 20px)',
            value
          }
        }
        break

      default:
        return {
          code: 'UNKNOWN_TYPE',
          message: `未知的属性类型: ${expectedType}`,
          value
        }
    }

    return null
  }

  private shouldApplyRule(ruleName: string, schema: PropertySchema): boolean {
    switch (ruleName) {
      case 'minLength':
        return schema.minLength !== undefined
      case 'maxLength':
        return schema.maxLength !== undefined
      case 'minimum':
        return schema.minimum !== undefined
      case 'maximum':
        return schema.maximum !== undefined
      case 'pattern':
        return schema.pattern !== undefined
      case 'enum':
        return schema.enum !== undefined && schema.enum.length > 0
      case 'boolean':
        return schema.type === PropertyType.BOOLEAN
      case 'number':
        return schema.type === PropertyType.NUMBER
      default:
        return false
    }
  }

  private isEmpty(value: any): boolean {
    return value === null ||
           value === undefined ||
           value === '' ||
           (Array.isArray(value) && value.length === 0)
  }
}