/**
 * 内置验证器
 * 提供常用的验证规则实现
 */

import type {
  PropertyValue,
  ValidationRule,
  ValidationType
} from '@/types/designer'
import type { ValidatorFunction, ValidationContext } from './ValidationEngine'

// 验证器注册表
const validators: Map<ValidationType, ValidatorFunction> = new Map()

/**
 * 注册验证器
 */
export function registerValidator(type: ValidationType, validator: ValidatorFunction): void {
  validators.set(type, validator)
}

/**
 * 获取验证器
 */
export function getValidator(type: ValidationType): ValidatorFunction | null {
  return validators.get(type) || null
}

/**
 * 获取所有验证器类型
 */
export function getValidatorTypes(): ValidationType[] {
  return Array.from(validators.keys())
}

// 注册所有内置验证器
function registerBuiltinValidators(): void {
  // 必填验证器
  registerValidator('required', async (value, rule, context) => {
    if (isEmpty(value)) {
      return {
        propertyPath: context.propertyPath || '',
        message: rule.message || `${context.propertyPath || '此字段'}是必填的`,
        code: 'REQUIRED',
        severity: 'error',
        rule,
      }
    }
    return null
  })

  // 最小长度验证器
  registerValidator('minLength', async (value, rule, context) => {
    const minLength = (rule.params?.minLength as number) || rule.params?.min as number
    if (typeof value === 'string' && value.length < minLength) {
      return {
        propertyPath: context.propertyPath || '',
        message: rule.message || `${context.propertyPath || '此字段'}长度不能少于${minLength}个字符`,
        code: 'MIN_LENGTH',
        severity: 'error',
        rule,
      }
    }
    return null
  })

  // 最大长度验证器
  registerValidator('maxLength', async (value, rule, context) => {
    const maxLength = (rule.params?.maxLength as number) || rule.params?.max as number
    if (typeof value === 'string' && value.length > maxLength) {
      return {
        propertyPath: context.propertyPath || '',
        message: rule.message || `${context.propertyPath || '此字段'}长度不能超过${maxLength}个字符`,
        code: 'MAX_LENGTH',
        severity: 'error',
        rule,
      }
    }
    return null
  })

  // 最小值验证器
  registerValidator('min', async (value, rule, context) => {
    const min = rule.params?.min as number
    if (typeof value === 'number' && value < min) {
      return {
        propertyPath: context.propertyPath || '',
        message: rule.message || `${context.propertyPath || '此字段'}不能小于${min}`,
        code: 'MIN_VALUE',
        severity: 'error',
        rule,
      }
    }
    return null
  })

  // 最大值验证器
  registerValidator('max', async (value, rule, context) => {
    const max = rule.params?.max as number
    if (typeof value === 'number' && value > max) {
      return {
        propertyPath: context.propertyPath || '',
        message: rule.message || `${context.propertyPath || '此字段'}不能大于${max}`,
        code: 'MAX_VALUE',
        severity: 'error',
        rule,
      }
    }
    return null
  })

  // 正则表达式验证器
  registerValidator('pattern', async (value, rule, context) => {
    const pattern = rule.params?.pattern as string
    if (typeof value === 'string' && pattern) {
      const regex = new RegExp(pattern)
      if (!regex.test(value)) {
        return {
          propertyPath: context.propertyPath || '',
          message: rule.message || `${context.propertyPath || '此字段'}格式不正确`,
          code: 'PATTERN_MISMATCH',
          severity: 'error',
          rule,
        }
      }
    }
    return null
  })

  // 邮箱验证器
  registerValidator('email', async (value, rule, context) => {
    if (typeof value === 'string' && value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return {
          propertyPath: context.propertyPath || '',
          message: rule.message || '请输入有效的邮箱地址',
          code: 'INVALID_EMAIL',
          severity: 'error',
          rule,
        }
      }
    }
    return null
  })

  // URL验证器
  registerValidator('url', async (value, rule, context) => {
    if (typeof value === 'string' && value.trim()) {
      try {
        new URL(value)
      } catch {
        return {
          propertyPath: context.propertyPath || '',
          message: rule.message || '请输入有效的URL地址',
          code: 'INVALID_URL',
          severity: 'error',
          rule,
        }
      }
    }
    return null
  })

  // 数字验证器
  registerValidator('number', async (value, rule, context) => {
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value !== 'number' && isNaN(Number(value))) {
        return {
          propertyPath: context.propertyPath || '',
          message: rule.message || `${context.propertyPath || '此字段'}必须是数字`,
          code: 'INVALID_NUMBER',
          severity: 'error',
          rule,
        }
      }
    }
    return null
  })

  // 整数验证器
  registerValidator('integer', async (value, rule, context) => {
    if (value !== null && value !== undefined && value !== '') {
      const num = Number(value)
      if (!Number.isInteger(num)) {
        return {
          propertyPath: context.propertyPath || '',
          message: rule.message || `${context.propertyPath || '此字段'}必须是整数`,
          code: 'INVALID_INTEGER',
          severity: 'error',
          rule,
        }
      }
    }
    return null
  })

  // 数组验证器
  registerValidator('array', async (value, rule, context) => {
    if (value !== null && value !== undefined && value !== '') {
      if (!Array.isArray(value)) {
        return {
          propertyPath: context.propertyPath || '',
          message: rule.message || `${context.propertyPath || '此字段'}必须是数组`,
          code: 'INVALID_ARRAY',
          severity: 'error',
          rule,
        }
      }

      const minLength = rule.params?.minLength as number
      const maxLength = rule.params?.maxLength as number

      if (minLength && value.length < minLength) {
        return {
          propertyPath: context.propertyPath || '',
          message: rule.message || `至少需要选择${minLength}项`,
          code: 'ARRAY_MIN_LENGTH',
          severity: 'error',
          rule,
        }
      }

      if (maxLength && value.length > maxLength) {
        return {
          propertyPath: context.propertyPath || '',
          message: rule.message || `最多只能选择${maxLength}项`,
          code: 'ARRAY_MAX_LENGTH',
          severity: 'error',
          rule,
        }
      }
    }
    return null
  })

  // 对象验证器
  registerValidator('object', async (value, rule, context) => {
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value !== 'object' || Array.isArray(value)) {
        return {
          propertyPath: context.propertyPath || '',
          message: rule.message || `${context.propertyPath || '此字段'}必须是对象`,
          code: 'INVALID_OBJECT',
          severity: 'error',
          rule,
        }
      }
    }
    return null
  })

  // 枚举验证器
  registerValidator('enum', async (value, rule, context) => {
    const allowedValues = rule.params?.values as PropertyValue[]
    if (allowedValues && !allowedValues.includes(value)) {
      return {
        propertyPath: context.propertyPath || '',
        message: rule.message || `${context.propertyPath || '此字段'}的值必须是: ${allowedValues.join(', ')}`,
        code: 'INVALID_ENUM_VALUE',
        severity: 'error',
        rule,
      }
    }
    return null
  })

  // 自定义验证器
  registerValidator('custom', async (value, rule, context) => {
    const customValidator = rule.params?.validator as (
      value: PropertyValue,
      context: ValidationContext
    ) => Promise<string | null> | string | null

    if (typeof customValidator === 'function') {
      try {
        const errorMessage = await customValidator(value, context)
        if (errorMessage) {
          return {
            propertyPath: context.propertyPath || '',
            message: rule.message || errorMessage,
            code: 'CUSTOM_VALIDATION_FAILED',
            severity: 'error',
            rule,
          }
        }
      } catch (error) {
        return {
          propertyPath: context.propertyPath || '',
          message: rule.message || '自定义验证失败',
          code: 'CUSTOM_VALIDATION_ERROR',
          severity: 'error',
          rule,
        }
      }
    }
    return null
  })

  // 唯一性验证器（异步）
  registerValidator('unique', async (value, rule, context) => {
    if (value === null || value === undefined || value === '') {
      return null
    }

    const uniqueCheck = rule.params?.uniqueCheck as (
      value: PropertyValue,
      context: ValidationContext
    ) => Promise<boolean>

    if (typeof uniqueCheck === 'function') {
      try {
        const isUnique = await uniqueCheck(value, context)
        if (!isUnique) {
          return {
            propertyPath: context.propertyPath || '',
            message: rule.message || `${context.propertyPath || '此字段'}的值必须唯一`,
            code: 'VALUE_NOT_UNIQUE',
            severity: 'error',
            rule,
          }
        }
      } catch (error) {
        return {
          propertyPath: context.propertyPath || '',
          message: rule.message || '唯一性验证失败',
          code: 'UNIQUE_CHECK_ERROR',
          severity: 'error',
          rule,
        }
      }
    }
    return null
  })

  // 存在性验证器（异步）
  registerValidator('exists', async (value, rule, context) => {
    if (value === null || value === undefined || value === '') {
      return null
    }

    const existsCheck = rule.params?.existsCheck as (
      value: PropertyValue,
      context: ValidationContext
    ) => Promise<boolean>

    if (typeof existsCheck === 'function') {
      try {
        const exists = await existsCheck(value, context)
        if (!exists) {
          return {
            propertyPath: context.propertyPath || '',
            message: rule.message || `${context.propertyPath || '此字段'}的值不存在`,
            code: 'VALUE_NOT_EXISTS',
            severity: 'error',
            rule,
          }
        }
      } catch (error) {
        return {
          propertyPath: context.propertyPath || '',
          message: rule.message || '存在性验证失败',
          code: 'EXISTS_CHECK_ERROR',
          severity: 'error',
          rule,
        }
      }
    }
    return null
  })
}

// 工具函数
function isEmpty(value: PropertyValue): boolean {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  )
}

// 初始化注册内置验证器
registerBuiltinValidators()