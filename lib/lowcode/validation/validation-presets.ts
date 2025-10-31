/**
 * 表单验证规则预设
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 任务: T126 - 集成验证规则引擎到表单组件
 * 创建日期: 2025-10-30
 */

import type { ValidationRule } from '@/types/lowcode/property'

// 基础验证规则工厂函数
export const createRequiredRule = (message?: string): ValidationRule => ({
  type: 'required',
  message: message || '此字段为必填项',
  params: {},
})

export const createMinLengthRule = (min: number, message?: string): ValidationRule => ({
  type: 'min_length',
  message: message || `输入内容至少需要${min}个字符`,
  params: { min },
})

export const createMaxLengthRule = (max: number, message?: string): ValidationRule => ({
  type: 'max_length',
  message: message || `输入内容不能超过${max}个字符`,
  params: { max },
})

export const createMinValueRule = (min: number, message?: string): ValidationRule => ({
  type: 'min_value',
  message: message || `输入值不能小于${min}`,
  params: { min },
})

export const createMaxValueRule = (max: number, message?: string): ValidationRule => ({
  type: 'max_value',
  message: message || `输入值不能大于${max}`,
  params: { max },
})

export const createPatternRule = (pattern: string, message?: string): ValidationRule => ({
  type: 'pattern',
  message: message || '输入格式不正确',
  params: { pattern },
})

export const createEmailRule = (message?: string): ValidationRule => ({
  type: 'email',
  message: message || '请输入有效的邮箱地址',
  params: {},
})

export const createPhoneRule = (message?: string): ValidationRule => ({
  type: 'phone',
  message: message || '请输入有效的手机号码',
  params: {},
})

export const createUrlRule = (message?: string): ValidationRule => ({
  type: 'url',
  message: message || '请输入有效的URL地址',
  params: {},
})

export const createCustomRule = (validator: string, message?: string, params?: Record<string, unknown>): ValidationRule => ({
  type: 'custom',
  message: message || '验证失败',
  params: { validator, ...params },
})

// 常用验证规则预设
export const VALIDATION_PRESETS = {
  // 用户名验证
  username: [
    createRequiredRule('用户名不能为空'),
    createMinLengthRule(3, '用户名至少需要3个字符'),
    createMaxLengthRule(20, '用户名不能超过20个字符'),
    createPatternRule('^[a-zA-Z0-9_]+$', '用户名只能包含字母、数字和下划线'),
  ],

  // 密码验证
  password: [
    createRequiredRule('密码不能为空'),
    createMinLengthRule(8, '密码至少需要8个字符'),
    createMaxLengthRule(50, '密码不能超过50个字符'),
    createCustomRule('validatePassword', '密码必须包含大小写字母、数字和特殊字符'),
  ],

  // 确认密码验证
  confirmPassword: [
    createRequiredRule('请确认密码'),
    createCustomRule('validatePasswordMatch', '两次输入的密码不一致'),
  ],

  // 邮箱验证
  email: [
    createRequiredRule('邮箱不能为空'),
    createEmailRule(),
  ],

  // 手机号验证
  phone: [
    createRequiredRule('手机号不能为空'),
    createPhoneRule(),
  ],

  // 姓名验证
  realName: [
    createRequiredRule('姓名不能为空'),
    createMinLengthRule(2, '姓名至少需要2个字符'),
    createMaxLengthRule(10, '姓名不能超过10个字符'),
    createPatternRule('^[\u4e00-\u9fa5a-zA-Z]+$', '姓名只能包含中文和英文字母'),
  ],

  // 身份证号验证
  idCard: [
    createRequiredRule('身份证号不能为空'),
    createPatternRule(
      '^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$',
      '请输入有效的身份证号码'
    ),
  ],

  // 年龄验证
  age: [
    createRequiredRule('年龄不能为空'),
    createMinValueRule(0, '年龄不能小于0'),
    createMaxValueRule(150, '年龄不能大于150'),
  ],

  // 数字验证（正数）
  positiveNumber: [
    createRequiredRule('请输入数字'),
    createMinValueRule(0, '请输入大于0的数字'),
  ],

  // 金额验证
  amount: [
    createRequiredRule('金额不能为空'),
    createMinValueRule(0, '金额不能小于0'),
    createPatternRule('^[0-9]+(\\.[0-9]{1,2})?$', '请输入有效的金额格式'),
  ],

  // 网址验证
  website: [
    createUrlRule(),
  ],

  // QQ号验证
  qq: [
    createPatternRule('^[1-9][0-9]{4,}$', '请输入有效的QQ号'),
  ],

  // 微信号验证
  wechat: [
    createPatternRule('^[a-zA-Z]([-_a-zA-Z0-9]{5,19})$', '请输入有效的微信号'),
  ],

  // 银行卡号验证
  bankCard: [
    createRequiredRule('银行卡号不能为空'),
    createPatternRule('^[0-9]{16,19}$', '请输入有效的银行卡号'),
  ],

  // 验证码验证
  verificationCode: [
    createRequiredRule('验证码不能为空'),
    createPatternRule('^\\d{6}$', '请输入6位数字验证码'),
  ],

  // 短文本验证（如标题、备注等）
  shortText: [
    createMaxLengthRule(100, '输入内容不能超过100个字符'),
  ],

  // 长文本验证（如描述、内容等）
  longText: [
    createMaxLengthRule(1000, '输入内容不能超过1000个字符'),
  ],

  // 文件名验证
  fileName: [
    createRequiredRule('文件名不能为空'),
    createPatternRule('^[^\\/:*?"<>|]+$', '文件名包含非法字符'),
    createMaxLengthRule(255, '文件名不能超过255个字符'),
  ],

  // IP地址验证
  ipAddress: [
    createPatternRule(
      '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
      '请输入有效的IP地址'
    ),
  ],

  // 端口号验证
  port: [
    createRequiredRule('端口号不能为空'),
    createMinValueRule(1, '端口号必须在1-65535之间'),
    createMaxValueRule(65535, '端口号必须在1-65535之间'),
  ],

  // 颜色值验证
  color: [
    createPatternRule('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$', '请输入有效的颜色值'),
  ],
}

// 按组件类型分组的验证规则
export const COMPONENT_VALIDATION_RULES = {
  // Input组件验证规则
  input: {
    // 文本输入
    text: [...VALIDATION_PRESETS.shortText],
    // 邮箱输入
    email: [...VALIDATION_PRESETS.email],
    // 密码输入
    password: [...VALIDATION_PRESETS.password],
    // 数字输入
    number: [...VALIDATION_PRESETS.positiveNumber],
    // 电话输入
    tel: [...VALIDATION_PRESETS.phone],
    // 网址输入
    url: [...VALIDATION_PRESETS.website],
  },

  // Textarea组件验证规则
  textarea: {
    // 短文本
    short: [...VALIDATION_PRESETS.shortText],
    // 长文本
    long: [...VALIDATION_PRESETS.longText],
    // 描述文本
    description: [createMaxLengthRule(500, '描述不能超过500个字符')],
  },

  // Select组件验证规则
  select: {
    // 必选选择器
    required: [createRequiredRule('请选择一个选项')],
    // 可选选择器
    optional: [],
  },

  // Checkbox组件验证规则
  checkbox: {
    // 必须勾选
    required: [createCustomRule('validateChecked', '请勾选此项')],
    // 可选勾选
    optional: [],
  },

  // Radio组件验证规则
  radio: {
    // 必须选择
    required: [createRequiredRule('请选择一个选项')],
    // 可选选择
    optional: [],
  },
}

// 动态验证规则生成器
export class ValidationRuleBuilder {
  private rules: ValidationRule[] = []

  required(message?: string): ValidationRuleBuilder {
    this.rules.push(createRequiredRule(message))
    return this
  }

  minLength(min: number, message?: string): ValidationRuleBuilder {
    this.rules.push(createMinLengthRule(min, message))
    return this
  }

  maxLength(max: number, message?: string): ValidationRuleBuilder {
    this.rules.push(createMaxLengthRule(max, message))
    return this
  }

  minValue(min: number, message?: string): ValidationRuleBuilder {
    this.rules.push(createMinValueRule(min, message))
    return this
  }

  maxValue(max: number, message?: string): ValidationRuleBuilder {
    this.rules.push(createMaxValueRule(max, message))
    return this
  }

  pattern(pattern: string, message?: string): ValidationRuleBuilder {
    this.rules.push(createPatternRule(pattern, message))
    return this
  }

  email(message?: string): ValidationRuleBuilder {
    this.rules.push(createEmailRule(message))
    return this
  }

  phone(message?: string): ValidationRuleBuilder {
    this.rules.push(createPhoneRule(message))
    return this
  }

  url(message?: string): ValidationRuleBuilder {
    this.rules.push(createUrlRule(message))
    return this
  }

  custom(validator: string, message?: string, params?: Record<string, unknown>): ValidationRuleBuilder {
    this.rules.push(createCustomRule(validator, message, params))
    return this
  }

  build(): ValidationRule[] {
    return [...this.rules]
  }

  reset(): ValidationRuleBuilder {
    this.rules = []
    return this
  }
}

// 便捷函数：创建验证规则构建器
export const createValidationRules = (): ValidationRuleBuilder => {
  return new ValidationRuleBuilder()
}

// 验证规则工具函数
export const ValidationRuleUtils = {
  // 合并验证规则
  merge(...ruleSets: ValidationRule[][]): ValidationRule[] {
    return ruleSets.flat()
  },

  // 过滤重复规则
  unique(rules: ValidationRule[]): ValidationRule[] {
    const seen = new Set<string>()
    return rules.filter(rule => {
      const key = `${rule.type}-${JSON.stringify(rule.params)}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  },

  // 验证规则转换为配置对象
  toConfig(rules: ValidationRule[]): {
    rules: ValidationRule[]
    hasRequired: boolean
    hasCustom: boolean
    types: string[]
  } {
    return {
      rules,
      hasRequired: rules.some(rule => rule.type === 'required'),
      hasCustom: rules.some(rule => rule.type === 'custom'),
      types: rules.map(rule => rule.type),
    }
  },

  // 从配置对象创建验证规则
  fromConfig(config: Record<string, unknown>): ValidationRule[] {
    return (config.rules as ValidationRule[]) || []
  },
}

export default VALIDATION_PRESETS