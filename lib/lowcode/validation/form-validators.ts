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

    // 根据validatorName调用对应的自定义验证函数
    switch (validatorName) {
      case 'validatePassword':
        return this.validatePassword(value)
      case 'validateUsername':
        return this.validateUsername(value)
      case 'validatePasswordMatch':
        return this.validatePasswordMatch(value, rule?.params)
      case 'validateChecked':
        return this.validateChecked(value)
      case 'validateEmailFormat':
        return this.validateEmailFormat(value)
      case 'validatePhoneFormat':
        return this.validatePhoneFormat(value)
      case 'validateUrlFormat':
        return this.validateUrlFormat(value)
      case 'validateIdCard':
        return this.validateIdCard(value)
      case 'validateBankCard':
        return this.validateBankCard(value)
      case 'validateIpAddress':
        return this.validateIpAddress(value)
      case 'validateColorHex':
        return this.validateColorHex(value)
      case 'validateNumberRange':
        return this.validateNumberRange(value, rule?.params)
      case 'validateDateRange':
        return this.validateDateRange(value, rule?.params)
      case 'validateFileSize':
        return this.validateFileSize(value, rule?.params)
      case 'validateFileType':
        return this.validateFileType(value, rule?.params)
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
   * 密码匹配验证
   */
  private static validatePasswordMatch(value: unknown, params?: Record<string, unknown>): FormValidationResult {
    const originalPassword = params?.originalPassword as string
    if (!originalPassword) {
      return {
        isValid: false,
        errors: ['缺少原始密码进行比较'],
        warnings: [],
      }
    }

    if (value !== originalPassword) {
      return {
        isValid: false,
        errors: ['两次输入的密码不一致'],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * 复选框选中验证
   */
  private static validateChecked(value: unknown): FormValidationResult {
    if (value !== true && value !== 'true') {
      return {
        isValid: false,
        errors: ['请勾选此项'],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * 邮箱格式验证（增强版）
   */
  private static validateEmailFormat(value: unknown): FormValidationResult {
    if (typeof value !== 'string') {
      return { isValid: false, errors: ['邮箱必须是字符串'], warnings: [] }
    }

    // 更严格的邮箱正则表达式
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    if (!emailRegex.test(value)) {
      return {
        isValid: false,
        errors: ['请输入有效的邮箱地址'],
        warnings: [],
      }
    }

    // 检查邮箱长度
    if (value.length > 254) {
      return {
        isValid: false,
        errors: ['邮箱地址过长'],
        warnings: [],
      }
    }

    // 检查各部分长度
    const [localPart] = value.split('@')
    if (localPart.length > 64) {
      return {
        isValid: false,
        errors: ['邮箱用户名部分过长'],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * 手机号格式验证（增强版）
   */
  private static validatePhoneFormat(value: unknown): FormValidationResult {
    if (typeof value !== 'string') {
      return { isValid: false, errors: ['手机号必须是字符串'], warnings: [] }
    }

    // 清理输入（移除空格、横线等）
    const cleanPhone = value.replace(/\s|-|\(|\)/g, '')

    // 中国手机号正则表达式
    const phoneRegex = /^1[3-9]\d{9}$/

    if (!phoneRegex.test(cleanPhone)) {
      return {
        isValid: false,
        errors: ['请输入有效的中国手机号码'],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * URL格式验证（增强版）
   */
  private static validateUrlFormat(value: unknown): FormValidationResult {
    if (typeof value !== 'string') {
      return { isValid: false, errors: ['URL必须是字符串'], warnings: [] }
    }

    try {
      // 使用URL构造函数验证
      new URL(value)
      return { isValid: true, errors: [], warnings: [] }
    } catch {
      // 如果URL构造函数失败，使用正则表达式
      const urlRegex = /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:\w.)*)?)?$/

      if (!urlRegex.test(value)) {
        return {
          isValid: false,
          errors: ['请输入有效的URL地址'],
          warnings: [],
        }
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * 身份证号验证
   */
  private static validateIdCard(value: unknown): FormValidationResult {
    if (typeof value !== 'string') {
      return { isValid: false, errors: ['身份证号必须是字符串'], warnings: [] }
    }

    // 18位身份证号正则表达式
    const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/

    if (!idCardRegex.test(value)) {
      return {
        isValid: false,
        errors: ['请输入有效的18位身份证号码'],
        warnings: [],
      }
    }

    // 验证校验码
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

    let sum = 0
    for (let i = 0; i < 17; i++) {
      sum += parseInt(value[i]) * weights[i]
    }

    const checkCode = checkCodes[sum % 11]
    if (value[17].toUpperCase() !== checkCode) {
      return {
        isValid: false,
        errors: ['身份证号校验码不正确'],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * 银行卡号验证
   */
  private static validateBankCard(value: unknown): FormValidationResult {
    if (typeof value !== 'string') {
      return { isValid: false, errors: ['银行卡号必须是字符串'], warnings: [] }
    }

    // 移除空格和非数字字符
    const cleanCard = value.replace(/\D/g, '')

    // 银行卡号长度验证（通常16-19位）
    if (cleanCard.length < 16 || cleanCard.length > 19) {
      return {
        isValid: false,
        errors: ['银行卡号长度不正确'],
        warnings: [],
      }
    }

    // Luhn算法验证
    let sum = 0
    let isEven = false

    for (let i = cleanCard.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanCard[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    if (sum % 10 !== 0) {
      return {
        isValid: false,
        errors: ['银行卡号不正确'],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * IP地址验证
   */
  private static validateIpAddress(value: unknown): FormValidationResult {
    if (typeof value !== 'string') {
      return { isValid: false, errors: ['IP地址必须是字符串'], warnings: [] }
    }

    const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

    if (!ipRegex.test(value)) {
      return {
        isValid: false,
        errors: ['请输入有效的IP地址'],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * 颜色值验证
   */
  private static validateColorHex(value: unknown): FormValidationResult {
    if (typeof value !== 'string') {
      return { isValid: false, errors: ['颜色值必须是字符串'], warnings: [] }
    }

    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

    if (!colorRegex.test(value)) {
      return {
        isValid: false,
        errors: ['请输入有效的十六进制颜色值（如 #FF0000 或 #F00）'],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * 数字范围验证
   */
  private static validateNumberRange(value: unknown, params?: Record<string, unknown>): FormValidationResult {
    const numValue = Number(value)
    if (isNaN(numValue)) {
      return { isValid: false, errors: ['请输入有效的数字'], warnings: [] }
    }

    const min = params?.min as number
    const max = params?.max as number

    if (min !== undefined && numValue < min) {
      return {
        isValid: false,
        errors: [`数值不能小于${min}`],
        warnings: [],
      }
    }

    if (max !== undefined && numValue > max) {
      return {
        isValid: false,
        errors: [`数值不能大于${max}`],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * 日期范围验证
   */
  private static validateDateRange(value: unknown, params?: Record<string, unknown>): FormValidationResult {
    if (typeof value !== 'string') {
      return { isValid: false, errors: ['日期必须是字符串'], warnings: [] }
    }

    const date = new Date(value)
    if (isNaN(date.getTime())) {
      return { isValid: false, errors: ['请输入有效的日期'], warnings: [] }
    }

    const minDate = params?.minDate ? new Date(params.minDate as string) : undefined
    const maxDate = params?.maxDate ? new Date(params.maxDate as string) : undefined

    if (minDate && date < minDate) {
      return {
        isValid: false,
        errors: [`日期不能早于${minDate.toLocaleDateString()}`],
        warnings: [],
      }
    }

    if (maxDate && date > maxDate) {
      return {
        isValid: false,
        errors: [`日期不能晚于${maxDate.toLocaleDateString()}`],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * 文件大小验证
   */
  private static validateFileSize(value: unknown, params?: Record<string, unknown>): FormValidationResult {
    const size = Number(value)
    if (isNaN(size) || size < 0) {
      return { isValid: false, errors: ['请输入有效的文件大小'], warnings: [] }
    }

    const maxSize = params?.maxSize as number // 单位：字节
    if (maxSize && size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2)
      return {
        isValid: false,
        errors: [`文件大小不能超过${maxSizeMB}MB`],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * 文件类型验证
   */
  private static validateFileType(value: unknown, params?: Record<string, unknown>): FormValidationResult {
    if (typeof value !== 'string') {
      return { isValid: false, errors: ['文件名必须是字符串'], warnings: [] }
    }

    const allowedTypes = params?.allowedTypes as string[]
    if (!allowedTypes || allowedTypes.length === 0) {
      return { isValid: true, errors: [], warnings: [] }
    }

    const fileExtension = value.split('.').pop()?.toLowerCase()
    if (!fileExtension) {
      return {
        isValid: false,
        errors: ['无法确定文件类型'],
        warnings: [],
      }
    }

    if (!allowedTypes.includes(fileExtension)) {
      return {
        isValid: false,
        errors: [`不支持的文件类型：${fileExtension}，支持的类型：${allowedTypes.join(', ')}`],
        warnings: [],
      }
    }

    return { isValid: true, errors: [], warnings: [] }
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
