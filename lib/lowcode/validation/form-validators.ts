/**
 * 表单组件验证器
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

// cspell:disable-next-line
import type { ValidationRule } from '@/types/lowcode/property'

// 重新导出ValidationRule类型
export type { ValidationRule }

// 验证结果接口
export interface FormValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// 验证器函数类型
export type ValidatorFunction = (value: unknown, rule?: ValidationRule) => FormValidationResult

// 基础验证器类
export class FormValidator {
  // 验证器映射表
  private static validators: Record<string, ValidatorFunction> = {
    required: FormValidator.validateRequired,
    minLength: FormValidator.validateMinLength,
    maxLength: FormValidator.validateMaxLength,
    minValue: FormValidator.validateMinValue,
    maxValue: FormValidator.validateMaxValue,
    pattern: FormValidator.validatePattern,
    email: FormValidator.validateEmail,
    url: FormValidator.validateUrl,
    phone: FormValidator.validatePhone,
    custom: FormValidator.validateCustom,
  }

  /**
   * 执行单个验证规则
   */
  static validate(value: unknown, rule: ValidationRule): FormValidationResult {
    const validator = this.validators[rule.type]
    if (!validator) {
      return {
        isValid: true,
        errors: [],
        warnings: [`未知的验证规则类型: ${rule.type}`],
      }
    }

    return validator(value, rule)
  }

  /**
   * 执行多个验证规则
   */
  static validateMultiple(value: unknown, rules: ValidationRule[]): FormValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    let isValid = true

    for (const rule of rules) {
      const result = this.validate(value, rule)
      if (!result.isValid) {
        isValid = false
      }
      errors.push(...result.errors)
      warnings.push(...result.warnings)
    }

    return {
      isValid,
      errors,
      warnings,
    }
  }

  // 验证器实现

  /**
   * 必填验证
   */
  private static validateRequired(value: unknown, rule?: ValidationRule): FormValidationResult {
    const isEmpty =
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)

    if (isEmpty) {
      return {
        isValid: false,
        errors: [rule?.message || '此字段为必填项'],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * 最小长度验证
   */
  private static validateMinLength(value: unknown, rule?: ValidationRule): FormValidationResult {
    if (typeof value !== 'string') {
      return { isValid: true, errors: [], warnings: ['最小长度验证仅适用于字符串类型'] }
    }

    const minLength = (rule?.params as { min?: number })?.min || 0
    if (value.length < minLength) {
      return {
        isValid: false,
        errors: [rule?.message || `输入内容至少需要${minLength}个字符`],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * 最大长度验证
   */
  private static validateMaxLength(value: unknown, rule?: ValidationRule): FormValidationResult {
    if (typeof value !== 'string') {
      return { isValid: true, errors: [], warnings: ['最大长度验证仅适用于字符串类型'] }
    }

    const maxLength = (rule?.params as { max?: number })?.max || Infinity
    if (value.length > maxLength) {
      return {
        isValid: false,
        errors: [rule?.message || `输入内容不能超过${maxLength}个字符`],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * 最小值验证
   */
  private static validateMinValue(value: unknown, rule?: ValidationRule): FormValidationResult {
    const numValue = Number(value)
    if (isNaN(numValue)) {
      return { isValid: true, errors: [], warnings: ['最小值验证仅适用于数字类型'] }
    }

    const minValue = (rule?.params as { min?: number })?.min || -Infinity
    if (numValue < minValue) {
      return {
        isValid: false,
        errors: [rule?.message || `输入值不能小于${minValue}`],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * 最大值验证
   */
  private static validateMaxValue(value: unknown, rule?: ValidationRule): FormValidationResult {
    const numValue = Number(value)
    if (isNaN(numValue)) {
      return { isValid: true, errors: [], warnings: ['最大值验证仅适用于数字类型'] }
    }

    const maxValue = (rule?.params as { max?: number })?.max || Infinity
    if (numValue > maxValue) {
      return {
        isValid: false,
        errors: [rule?.message || `输入值不能大于${maxValue}`],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * 正则表达式验证
   */
  private static validatePattern(value: unknown, rule?: ValidationRule): FormValidationResult {
    if (typeof value !== 'string') {
      return { isValid: true, errors: [], warnings: ['正则验证仅适用于字符串类型'] }
    }

    const pattern = rule?.params?.pattern as string | undefined
    if (!pattern) {
      return { isValid: true, errors: [], warnings: ['缺少正则表达式模式'] }
    }

    try {
      const regex = new RegExp(pattern)
      if (!regex.test(value)) {
        return {
          isValid: false,
          errors: [rule?.message || '输入格式不正确'],
          warnings: [],
        }
      }
    } catch {
      return {
        isValid: false,
        errors: ['正则表达式格式错误'],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * 邮箱验证
   */
  private static validateEmail(value: unknown, rule?: ValidationRule): FormValidationResult {
    if (typeof value !== 'string') {
      return { isValid: true, errors: [], warnings: ['邮箱验证仅适用于字符串类型'] }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return {
        isValid: false,
        errors: [rule?.message || '请输入有效的邮箱地址'],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * URL验证
   */
  private static validateUrl(value: unknown, rule?: ValidationRule): FormValidationResult {
    if (typeof value !== 'string') {
      return { isValid: true, errors: [], warnings: ['URL验证仅适用于字符串类型'] }
    }

    try {
      new URL(value)
    } catch {
      return {
        isValid: false,
        errors: [rule?.message || '请输入有效的URL地址'],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * 手机号验证
   */
  private static validatePhone(value: unknown, rule?: ValidationRule): FormValidationResult {
    if (typeof value !== 'string') {
      return { isValid: true, errors: [], warnings: ['手机号验证仅适用于字符串类型'] }
    }

    // 中国手机号正则表达式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(value.replace(/\s|-/g, ''))) {
      return {
        isValid: false,
        errors: [rule?.message || '请输入有效的手机号码'],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * 自定义验证
   */
  private static validateCustom(value: unknown, rule?: ValidationRule): FormValidationResult {
    const validatorName = rule?.params?.validator as string | undefined
    if (!validatorName) {
      return {
        isValid: false,
        errors: ['自定义验证缺少验证器名称'],
        warnings: [],
      }
    }

    // 这里可以根据validatorName调用对应的自定义验证函数
    // 为了简化，这里只是一个示例
    switch (validatorName) {
      case 'validatePassword':
        return this.validatePassword(value)
      case 'validateUsername':
        return this.validateUsername(value)
      default:
        return {
          isValid: true,
          errors: [],
          warnings: [`未知的自定义验证器: ${validatorName}`],
        }
    }
  }

  /**
   * 密码验证示例
   */
  private static validatePassword(value: unknown): FormValidationResult {
    if (typeof value !== 'string') {
      return { isValid: true, errors: [], warnings: ['密码验证仅适用于字符串类型'] }
    }

    const errors: string[] = []

    if (value.length < 8) {
      errors.push('密码长度至少8位')
    }

    if (!/[A-Z]/.test(value)) {
      errors.push('密码必须包含大写字母')
    }

    if (!/[a-z]/.test(value)) {
      errors.push('密码必须包含小写字母')
    }

    if (!/\d/.test(value)) {
      errors.push('密码必须包含数字')
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.push('密码必须包含特殊字符')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    }
  }

  /**
   * 用户名验证示例
   */
  private static validateUsername(value: unknown): FormValidationResult {
    if (typeof value !== 'string') {
      return { isValid: true, errors: [], warnings: ['用户名验证仅适用于字符串类型'] }
    }

    const errors: string[] = []

    if (value.length < 3 || value.length > 20) {
      errors.push('用户名长度必须在3-20个字符之间')
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      errors.push('用户名只能包含字母、数字和下划线')
    }

    if (/^\d/.test(value)) {
      errors.push('用户名不能以数字开头')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    }
  }

  /**
   * 注册自定义验证器
   */
  static registerValidator(name: string, validator: ValidatorFunction): void {
    this.validators[name] = validator
  }

  /**
   * 获取所有可用的验证器
   */
  static getAvailableValidators(): string[] {
    return Object.keys(this.validators)
  }
}

// 导出常用的验证规则创建函数
export const createRequiredRule = (message?: string): ValidationRule => ({
  type: 'required',
  message: message || '此字段为必填项',
})

export const createMinLengthRule = (min: number, message?: string): ValidationRule => ({
  type: 'min_length',
  params: { min },
  message: message || `输入内容至少需要${min}个字符`,
})

export const createMaxLengthRule = (max: number, message?: string): ValidationRule => ({
  type: 'max_length',
  params: { max },
  message: message || `输入内容不能超过${max}个字符`,
})

export const createEmailRule = (message?: string): ValidationRule => ({
  type: 'email',
  message: message || '请输入有效的邮箱地址',
})

export const createPhoneRule = (message?: string): ValidationRule => ({
  type: 'pattern',
  params: { pattern: '^1[3-9]\\d{9}$' },
  message: message || '请输入有效的手机号码',
})

export const createPatternRule = (pattern: string, message?: string): ValidationRule => ({
  type: 'pattern',
  params: { pattern },
  message: message || '输入格式不正确',
})

export const createCustomRule = (
  validator: string,
  params?: Record<string, unknown>,
  message?: string
): ValidationRule => ({
  type: 'custom',
  params: { validator, ...params },
  message: message || '验证失败',
})
