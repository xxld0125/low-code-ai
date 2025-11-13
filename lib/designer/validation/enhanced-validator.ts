/**
 * 增强属性验证器
 *
 * 基于现有PropertyValidator扩展，添加更多自定义规则和高级功能
 */

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { PropertyValidator, PropertySchema, ValidationRule, ValidationResult, ValidationError } from './property-validator'

// 自定义验证规则类型
export interface CustomValidationRule extends ValidationRule {
  id: string
  name: string
  description?: string
  category?: 'format' | 'business' | 'security' | 'performance'
  async?: boolean
  dependencies?: string[] // 依赖的其他属性
}

// 验证规则注册表
export class ValidationRuleRegistry {
  private rules = new Map<string, CustomValidationRule>()

  /**
   * 注册自定义验证规则
   */
  register(rule: CustomValidationRule): void {
    if (this.rules.has(rule.id)) {
      console.warn(`验证规则 ${rule.id} 已存在，将被覆盖`)
    }
    this.rules.set(rule.id, rule)
  }

  /**
   * 注销验证规则
   */
  unregister(id: string): boolean {
    return this.rules.delete(id)
  }

  /**
   * 获取验证规则
   */
  get(id: string): CustomValidationRule | undefined {
    return this.rules.get(id)
  }

  /**
   * 获取所有规则
   */
  getAll(): CustomValidationRule[] {
    return Array.from(this.rules.values())
  }

  /**
   * 按分类获取规则
   */
  getByCategory(category: string): CustomValidationRule[] {
    return this.getAll().filter(rule => rule.category === category)
  }

  /**
   * 清空所有自定义规则
   */
  clear(): void {
    this.rules.clear()
  }
}

// 常用自定义验证规则
export class CommonValidationRules {
  /**
   * 邮箱验证规则
   */
  static email(): CustomValidationRule {
    return {
      id: 'email',
      name: '邮箱地址',
      description: '验证有效的邮箱地址格式',
      category: 'format',
      validator: (value: any): ValidationResult => {
        if (!value) return { valid: true, errors: [] }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const isValid = typeof value === 'string' && emailRegex.test(value)

        return {
          valid: isValid,
          errors: isValid ? [] : [{
            code: 'EMAIL_INVALID',
            message: '请输入有效的邮箱地址',
            value
          }]
        }
      }
    }
  }

  /**
   * URL验证规则
   */
  static url(): CustomValidationRule {
    return {
      id: 'url',
      name: 'URL地址',
      description: '验证有效的URL格式',
      category: 'format',
      validator: (value: any): ValidationResult => {
        if (!value) return { valid: true, errors: [] }

        let isValid = false
        try {
          new URL(value)
          isValid = true
        } catch {
          isValid = false
        }

        return {
          valid: isValid,
          errors: isValid ? [] : [{
            code: 'URL_INVALID',
            message: '请输入有效的URL地址',
            value
          }]
        }
      }
    }
  }

  /**
   * 手机号验证规则（中国）
   */
  static phoneCN(): CustomValidationRule {
    return {
      id: 'phone_cn',
      name: '中国手机号',
      description: '验证有效的中国手机号码格式',
      category: 'format',
      validator: (value: any): ValidationResult => {
        if (!value) return { valid: true, errors: [] }

        const phoneRegex = /^1[3-9]\d{9}$/
        const isValid = typeof value === 'string' && phoneRegex.test(value.replace(/\D/g, ''))

        return {
          valid: isValid,
          errors: isValid ? [] : [{
            code: 'PHONE_INVALID',
            message: '请输入有效的中国手机号码',
            value
          }]
        }
      }
    }
  }

  /**
   * 身份证验证规则（中国）
   */
  static idCardCN(): CustomValidationRule {
    return {
      id: 'idcard_cn',
      name: '身份证号',
      description: '验证有效的中国身份证号码格式',
      category: 'format',
      validator: (value: any): ValidationResult => {
        if (!value) return { valid: true, errors: [] }

        const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
        const isValid = typeof value === 'string' && idCardRegex.test(value)

        return {
          valid: isValid,
          errors: isValid ? [] : [{
            code: 'IDCARD_INVALID',
            message: '请输入有效的身份证号码',
            value
          }]
        }
      }
    }
  }

  /**
   * 密码强度验证规则
   */
  static passwordStrength(minLength = 8): CustomValidationRule {
    return {
      id: 'password_strength',
      name: '密码强度',
      description: `密码至少${minLength}位，包含大小写字母、数字和特殊字符`,
      category: 'security',
      validator: (value: any): ValidationResult => {
        const errors: ValidationError[] = []

        if (typeof value !== 'string') {
          errors.push({
            code: 'PASSWORD_TYPE',
            message: '密码必须是字符串',
            value
          })
          return { valid: false, errors }
        }

        if (value.length < minLength) {
          errors.push({
            code: 'PASSWORD_LENGTH',
            message: `密码长度至少${minLength}位`,
            value
          })
        }

        if (!/[a-z]/.test(value)) {
          errors.push({
            code: 'PASSWORD_LOWERCASE',
            message: '密码必须包含小写字母',
            value
          })
        }

        if (!/[A-Z]/.test(value)) {
          errors.push({
            code: 'PASSWORD_UPPERCASE',
            message: '密码必须包含大写字母',
            value
          })
        }

        if (!/\d/.test(value)) {
          errors.push({
            code: 'PASSWORD_NUMBER',
            message: '密码必须包含数字',
            value
          })
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          errors.push({
            code: 'PASSWORD_SPECIAL',
            message: '密码必须包含特殊字符',
            value
          })
        }

        return {
          valid: errors.length === 0,
          errors
        }
      }
    }
  }

  /**
   * 文件扩展名验证规则
   */
  static fileExtension(allowedExtensions: string[]): CustomValidationRule {
    return {
      id: 'file_extension',
      name: '文件扩展名',
      description: `只允许文件类型: ${allowedExtensions.join(', ')}`,
      category: 'format',
      validator: (value: any): ValidationResult => {
        if (!value) return { valid: true, errors: [] }

        const extension = value.split('.').pop()?.toLowerCase()
        const isValid = extension && allowedExtensions.includes(extension)

        return {
          valid: isValid,
          errors: isValid ? [] : [{
            code: 'FILE_EXTENSION',
            message: `只允许文件类型: ${allowedExtensions.join(', ')}`,
            value
          }]
        }
      }
    }
  }

  /**
   * 数组长度验证规则
   */
  static arrayLength(min?: number, max?: number): CustomValidationRule {
    return {
      id: 'array_length',
      name: '数组长度',
      description: min !== undefined && max !== undefined
        ? `数组长度必须在${min}-${max}之间`
        : min !== undefined
          ? `数组长度至少${min}`
          : max !== undefined
            ? `数组长度最多${max}`
            : '数组长度验证',
      category: 'format',
      validator: (value: any): ValidationResult => {
        if (!Array.isArray(value)) {
          return {
            valid: false,
            errors: [{
              code: 'ARRAY_TYPE',
              message: '值必须是数组',
              value
            }]
          }
        }

        const errors: ValidationError[] = []

        if (min !== undefined && value.length < min) {
          errors.push({
            code: 'ARRAY_MIN_LENGTH',
            message: `数组长度至少${min}`,
            value
          })
        }

        if (max !== undefined && value.length > max) {
          errors.push({
            code: 'ARRAY_MAX_LENGTH',
            message: `数组长度最多${max}`,
            value
          })
        }

        return {
          valid: errors.length === 0,
          errors
        }
      }
    }
  }

  /**
   * 唯一性验证规则（异步）
   */
  static unique(checkFunction: (value: any) => Promise<boolean>): CustomValidationRule {
    return {
      id: 'unique',
      name: '唯一性',
      description: '值必须唯一',
      category: 'business',
      async: true,
      validator: async (value: any): Promise<ValidationResult> => {
        if (!value) return { valid: true, errors: [] }

        try {
          const isUnique = await checkFunction(value)
          return {
            valid: isUnique,
            errors: isUnique ? [] : [{
              code: 'DUPLICATE_VALUE',
              message: '该值已存在，请使用其他值',
              value
            }]
          }
        } catch {
          return {
            valid: false,
            errors: [{
              code: 'UNIQUE_CHECK_ERROR',
              message: '唯一性验证失败，请稍后重试',
              value
            }]
          }
        }
      }
    }
  }
}

// 增强验证器类
export class EnhancedPropertyValidator extends PropertyValidator {
  private ruleRegistry = new ValidationRuleRegistry()

  constructor() {
    super()
    this.registerCommonRules()
  }

  /**
   * 注册常用验证规则
   */
  private registerCommonRules(): void {
    const commonRules = [
      CommonValidationRules.email(),
      CommonValidationRules.url(),
      CommonValidationRules.phoneCN(),
      CommonValidationRules.idCardCN(),
      CommonValidationRules.passwordStrength(),
      CommonValidationRules.fileExtension(['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']),
      CommonValidationRules.arrayLength(),
    ]

    commonRules.forEach(rule => this.ruleRegistry.register(rule))
  }

  /**
   * 添加自定义验证规则
   */
  addCustomRule(rule: CustomValidationRule): void {
    this.ruleRegistry.register(rule)
  }

  /**
   * 移除自定义验证规则
   */
  removeCustomRule(id: string): boolean {
    return this.ruleRegistry.unregister(id)
  }

  /**
   * 获取所有可用的验证规则
   */
  getAvailableRules(): CustomValidationRule[] {
    return this.ruleRegistry.getAll()
  }

  /**
   * 按分类获取验证规则
   */
  getRulesByCategory(category: string): CustomValidationRule[] {
    return this.ruleRegistry.getByCategory(category)
  }

  /**
   * 增强的验证方法，支持自定义规则
   */
  validateWithCustomRules(
    value: any,
    schema: PropertySchema & { customRuleIds?: string[] }
  ): ValidationResult {
    // 先执行基础验证
    const baseResult = super.validate(value, schema)

    // 如果基础验证失败，直接返回
    if (!baseResult.valid) {
      return baseResult
    }

    // 执行自定义规则验证
    if (schema.customRuleIds) {
      for (const ruleId of schema.customRuleIds) {
        const rule = this.ruleRegistry.get(ruleId)
        if (rule) {
          const ruleResult = rule.validator(value)
          if (!ruleResult.valid) {
            baseResult.errors.push(...ruleResult.errors)
            baseResult.valid = false
          }
        }
      }
    }

    return baseResult
  }

  /**
   * 增强的异步验证方法
   */
  async validateWithCustomRulesAsync(
    value: any,
    schema: PropertySchema & { customRuleIds?: string[] }
  ): Promise<ValidationResult> {
    // 先执行基础异步验证
    const baseResult = await super.validateAsync(value, schema)

    // 如果基础验证失败，直接返回
    if (!baseResult.valid) {
      return baseResult
    }

    // 执行自定义规则验证
    if (schema.customRuleIds) {
      for (const ruleId of schema.customRuleIds) {
        const rule = this.ruleRegistry.get(ruleId)
        if (rule) {
          try {
            const ruleResult = await rule.validator(value)
            if (!ruleResult.valid) {
              baseResult.errors.push(...ruleResult.errors)
              baseResult.valid = false
            }
          } catch {
            baseResult.errors.push({
              code: 'CUSTOM_RULE_ERROR',
              message: `自定义规则 ${ruleId} 执行失败`,
              value
            })
            baseResult.valid = false
          }
        }
      }
    }

    return baseResult
  }

  /**
   * 批量验证多个属性（支持自定义规则）
   */
  validateMultipleWithCustomRules(
    values: Record<string, any>,
    schemas: Record<string, (PropertySchema & { customRuleIds?: string[] })>
  ): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {}

    for (const [propertyName, schema] of Object.entries(schemas)) {
      const value = values[propertyName]
      results[propertyName] = this.validateWithCustomRules(value, schema)
    }

    return results
  }

  /**
   * 批量异步验证多个属性（支持自定义规则）
   */
  async validateMultipleWithCustomRulesAsync(
    values: Record<string, any>,
    schemas: Record<string, (PropertySchema & { customRuleIds?: string[] })>
  ): Promise<Record<string, ValidationResult>> {
    const promises = Object.entries(schemas).map(async ([propertyName, schema]) => {
      const value = values[propertyName]
      const result = await this.validateWithCustomRulesAsync(value, schema)
      return [propertyName, result]
    })

    const results = await Promise.all(promises)
    return Object.fromEntries(results)
  }
}

// 创建全局增强验证器实例
export const globalEnhancedValidator = new EnhancedPropertyValidator()

// 便捷函数
export const addValidationRule = (rule: CustomValidationRule): void => {
  globalEnhancedValidator.addCustomRule(rule)
}

export const removeValidationRule = (id: string): boolean => {
  return globalEnhancedValidator.removeCustomRule(id)
}

export const getValidationRules = (): CustomValidationRule[] => {
  return globalEnhancedValidator.getAvailableRules()
}

export const getValidationRulesByCategory = (category: string): CustomValidationRule[] => {
  return globalEnhancedValidator.getRulesByCategory(category)
}

export const validateWithRules = (
  value: any,
  schema: PropertySchema & { customRuleIds?: string[] }
): ValidationResult => {
  return globalEnhancedValidator.validateWithCustomRules(value, schema)
}

export const validateWithRulesAsync = async (
  value: any,
  schema: PropertySchema & { customRuleIds?: string[] }
): Promise<ValidationResult> => {
  return globalEnhancedValidator.validateWithCustomRulesAsync(value, schema)
}