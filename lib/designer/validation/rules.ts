/**
 * 常用验证规则
 * 提供预定义的验证规则配置
 */

import type { ValidationRule } from '@/types/designer'

// 基础验证规则
export const ValidationRules = {
  // 必填规则
  required: (message?: string): ValidationRule => ({
    type: 'required',
    message: message || '此字段为必填项',
  }),

  // 最小长度规则
  minLength: (min: number, message?: string): ValidationRule => ({
    type: 'minLength',
    params: { minLength: min },
    message: message || `最少需要${min}个字符`,
  }),

  // 最大长度规则
  maxLength: (max: number, message?: string): ValidationRule => ({
    type: 'maxLength',
    params: { maxLength: max },
    message: message || `最多允许${max}个字符`,
  }),

  // 长度范围规则
  lengthRange: (min: number, max: number): ValidationRule[] => [
    ValidationRules.minLength(min),
    ValidationRules.maxLength(max),
  ],

  // 数字范围规则
  min: (min: number, message?: string): ValidationRule => ({
    type: 'min',
    params: { min },
    message: message || `数值不能小于${min}`,
  }),

  max: (max: number, message?: string): ValidationRule => ({
    type: 'max',
    params: { max },
    message: message || `数值不能大于${max}`,
  }),

  // 数值范围规则
  range: (min: number, max: number): ValidationRule[] => [
    ValidationRules.min(min),
    ValidationRules.max(max),
  ],

  // 邮箱规则
  email: (message?: string): ValidationRule => ({
    type: 'email',
    message: message || '请输入有效的邮箱地址',
  }),

  // URL规则
  url: (message?: string): ValidationRule => ({
    type: 'url',
    message: message || '请输入有效的URL地址',
  }),

  // 正则表达式规则
  pattern: (pattern: string, message?: string): ValidationRule => ({
    type: 'pattern',
    params: { pattern },
    message: message || '格式不正确',
  }),

  // 手机号规则
  phone: (message?: string): ValidationRule => ({
    type: 'pattern',
    params: { pattern: /^1[3-9]\d{9}$/ },
    message: message || '请输入有效的手机号',
  }),

  // 身份证号规则
  idCard: (message?: string): ValidationRule => ({
    type: 'pattern',
    params: { pattern: /^\d{15}|\d{18}$/ },
    message: message || '请输入有效的身份证号',
  }),

  // 密码强度规则
  password: (message?: string): ValidationRule => ({
    type: 'pattern',
    params: { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/ },
    message: message || '密码必须包含大小写字母和数字，长度至少8位',
  }),

  // 数字规则
  number: (message?: string): ValidationRule => ({
    type: 'number',
    message: message || '请输入有效的数字',
  }),

  // 整数规则
  integer: (message?: string): ValidationRule => ({
    type: 'integer',
    message: message || '请输入有效的整数',
  }),

  // 自定义规则
  custom: (
    validator: (value: unknown, context: any) => Promise<string | null> | string | null,
    message?: string
  ): ValidationRule => ({
    type: 'custom',
    params: { validator },
    message: message || '验证失败',
  }),

  // 唯一性规则
  unique: (
    uniqueCheck: (value: unknown, context: any) => Promise<boolean>,
    message?: string
  ): ValidationRule => ({
    type: 'unique',
    async: true,
    params: { uniqueCheck },
    message: message || '值必须唯一',
  }),

  // 存在性规则
  exists: (
    existsCheck: (value: unknown, context: any) => Promise<boolean>,
    message?: string
  ): ValidationRule => ({
    type: 'exists',
    async: true,
    params: { existsCheck },
    message: message || '值必须存在',
  }),
}

// 常用验证规则组合
export const ValidationRuleSets = {
  // 用户名验证
  username: [
    ValidationRules.required('用户名不能为空'),
    ValidationRules.minLength(2, '用户名至少需要2个字符'),
    ValidationRules.maxLength(20, '用户名不能超过20个字符'),
    ValidationRules.pattern(
      /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
      '用户名只能包含字母、数字、下划线和中文'
    ),
  ],

  // 密码验证
  password: [
    ValidationRules.required('密码不能为空'),
    ValidationRules.minLength(6, '密码至少需要6个字符'),
    ValidationRules.maxLength(20, '密码不能超过20个字符'),
  ],

  // 强密码验证
  strongPassword: [ValidationRules.required('密码不能为空'), ValidationRules.password()],

  // 邮箱验证
  email: [ValidationRules.required('邮箱不能为空'), ValidationRules.email()],

  // 手机号验证
  phone: [ValidationRules.required('手机号不能为空'), ValidationRules.phone()],

  // 年龄验证
  age: [
    ValidationRules.required('年龄不能为空'),
    ValidationRules.integer('年龄必须是整数'),
    ValidationRules.range(0, 150, '年龄必须在0-150之间'),
  ],

  // 价格验证
  price: [
    ValidationRules.required('价格不能为空'),
    ValidationRules.number('价格必须是数字'),
    ValidationRules.min(0, '价格不能小于0'),
  ],

  // 标题验证
  title: [
    ValidationRules.required('标题不能为空'),
    ValidationRules.minLength(1, '标题至少需要1个字符'),
    ValidationRules.maxLength(100, '标题不能超过100个字符'),
  ],

  // 描述验证
  description: [ValidationRules.maxLength(500, '描述不能超过500个字符')],

  // 网址验证
  website: [ValidationRules.url()],
}
