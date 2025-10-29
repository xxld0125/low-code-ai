/**
 * 表单验证系统导出
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

// 核心验证器
export {
  FormValidator,
  type FormValidationResult,
  type ValidatorFunction,
  // 验证规则创建函数
  createRequiredRule,
  createMinLengthRule,
  createMaxLengthRule,
  createEmailRule,
  createPhoneRule,
  createPatternRule,
  createCustomRule,
} from './form-validators'

// React Hook
export {
  useFormValidation,
  createValidationRules,
  type UseFormValidationConfig,
  type UseFormValidationReturn,
  type FormFieldState,
  type FormState,
} from './form-validation-hook'

// 表单组件验证器 (T047任务)
export {
  ButtonValidators,
  InputValidators,
  TextareaValidators,
  SelectValidators,
  CheckboxValidators,
  RadioValidators,
  CustomValidatorFunctions,
  FormComponentValidationRules,
  getComponentValidators,
  createComponentValidationRule,
} from './component-validators'

// 重新导出相关类型
export type { ValidationRule } from '@/types/lowcode/property'

// 导入验证规则创建函数
import {
  createRequiredRule,
  createMinLengthRule,
  createMaxLengthRule,
  createEmailRule,
  createPhoneRule,
  createPatternRule,
  createCustomRule,
  FormValidator,
} from './form-validators'
import { createValidationRules, useFormValidation } from './form-validation-hook'

// 常用验证器集合
export const CommonValidators = {
  // 基础验证
  required: (message?: string) => createRequiredRule(message),
  minLength: (min: number, message?: string) => createMinLengthRule(min, message),
  maxLength: (max: number, message?: string) => createMaxLengthRule(max, message),

  // 格式验证
  email: (message?: string) => createEmailRule(message),
  phone: (message?: string) => createPhoneRule(message),
  url: (message?: string) =>
    createPatternRule(
      '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&\\/\\/=]*)$',
      message || '请输入有效的URL地址'
    ),

  // 数字验证
  number: (message?: string) =>
    createPatternRule('^-?\\d+(\\.\\d+)?$', message || '请输入有效的数字'),
  positiveNumber: (message?: string) =>
    createPatternRule('^\\d+(\\.\\d+)?$', message || '请输入正数'),
  integer: (message?: string) => createPatternRule('^-?\\d+$', message || '请输入整数'),

  // 中国大陆相关验证
  idCard: (message?: string) =>
    createPatternRule(
      '(^\\d{15}$)|(^\\d{18}$)|(^\\d{17}(\\d|X|x)$)',
      message || '请输入有效的身份证号码'
    ),
  postcode: (message?: string) => createPatternRule('\\d{6}', message || '请输入有效的邮政编码'),

  // 自定义验证器
  password: (message?: string) => createCustomRule('validatePassword', {}, message),
  username: (message?: string) => createCustomRule('validateUsername', {}, message),
} as const

// 预定义验证规则集合
export const ValidationRuleSets = {
  // 用户注册表单
  userRegistration: {
    username: [...createValidationRules.username],
    email: [...createValidationRules.email],
    password: [...createValidationRules.password],
    confirmPassword: [
      createRequiredRule('请确认密码'),
      createCustomRule('validatePasswordConfirm'),
    ],
  },

  // 用户登录表单
  userLogin: {
    username: [createRequiredRule('请输入用户名或邮箱')],
    password: [createRequiredRule('请输入密码')],
  },

  // 联系表单
  contactForm: {
    name: [
      createRequiredRule('请输入姓名'),
      createMinLengthRule(2, '姓名至少需要2个字符'),
      createMaxLengthRule(50, '姓名不能超过50个字符'),
    ],
    email: [...createValidationRules.email],
    phone: [...createValidationRules.phone],
    subject: [createRequiredRule('请输入主题'), createMaxLengthRule(100, '主题不能超过100个字符')],
    message: [
      createRequiredRule('请输入留言内容'),
      createMinLengthRule(10, '留言内容至少需要10个字符'),
      createMaxLengthRule(1000, '留言内容不能超过1000个字符'),
    ],
  },

  // 搜索表单
  searchForm: {
    keyword: [
      createRequiredRule('请输入搜索关键词'),
      createMinLengthRule(2, '搜索关键词至少需要2个字符'),
      createMaxLengthRule(100, '搜索关键词不能超过100个字符'),
    ],
  },
} as const

// 错误消息常量
export const ErrorMessages = {
  REQUIRED: '此字段为必填项',
  INVALID_EMAIL: '请输入有效的邮箱地址',
  INVALID_PHONE: '请输入有效的手机号码',
  INVALID_URL: '请输入有效的URL地址',
  INVALID_NUMBER: '请输入有效的数字',
  INVALID_DATE: '请输入有效的日期',
  INVALID_TIME: '请输入有效的时间',
  TOO_SHORT: '输入内容太短',
  TOO_LONG: '输入内容太长',
  INVALID_FORMAT: '输入格式不正确',
  PASSWORD_TOO_WEAK: '密码强度不够',
  PASSWORDS_NOT_MATCH: '两次输入的密码不一致',
  INVALID_ID_CARD: '请输入有效的身份证号码',
  INVALID_POSTCODE: '请输入有效的邮政编码',
} as const

// 验证配置常量
export const ValidationConfig = {
  // 默认验证选项
  DEFAULT_OPTIONS: {
    validateOnChange: true,
    validateOnBlur: true,
    showErrorsOnChange: false,
    showErrorsOnBlur: true,
  },

  // 实时验证配置
  REAL_TIME_VALIDATION: {
    validateOnChange: true,
    validateOnBlur: true,
    showErrorsOnChange: true,
    showErrorsOnBlur: true,
    debounceTime: 300,
  },

  // 提交时验证配置
  SUBMIT_VALIDATION: {
    validateOnChange: false,
    validateOnBlur: true,
    showErrorsOnChange: false,
    showErrorsOnBlur: true,
  },

  // 严格验证配置
  STRICT_VALIDATION: {
    validateOnChange: true,
    validateOnBlur: true,
    showErrorsOnChange: true,
    showErrorsOnBlur: true,
    debounceTime: 100,
  },
} as const

const validationModule = {
  FormValidator,
  useFormValidation,
  CommonValidators,
  ValidationRuleSets,
  ErrorMessages,
  ValidationConfig,
}

export default validationModule
