/**
 * 高级验证规则实现
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 任务: T127 - 实现邮箱格式、数字范围等高级验证规则
 * 创建日期: 2025-10-31
 */

import { createCustomRule, createPatternRule } from './form-validators'

// 邮箱验证规则
export const EmailValidators = {
  // 基础邮箱格式验证
  basic: createPatternRule('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', '请输入有效的邮箱地址'),

  // 严格邮箱格式验证（符合RFC 5322标准）
  strict: createCustomRule('validateEmailStrict', {}, '请输入有效的邮箱地址'),

  // 企业邮箱验证
  corporate: createPatternRule(
    '^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}$',
    '请输入有效的企业邮箱地址'
  ),

  // 常见邮箱提供商验证
  commonProviders: createCustomRule(
    'validateEmailProvider',
    {
      allowedProviders: [
        'gmail.com',
        'qq.com',
        '163.com',
        '126.com',
        'sina.com',
        'hotmail.com',
        'outlook.com',
        'yahoo.com',
        'icloud.com',
      ],
    },
    '请使用常见的邮箱服务商'
  ),
}

// 数字验证规则
export const NumberValidators = {
  // 整数验证
  integer: createPatternRule('^-?\\d+$', '请输入整数'),

  // 正整数验证
  positiveInteger: createPatternRule('^\\d+$', '请输入正整数'),

  // 负整数验证
  negativeInteger: createPatternRule('^\\-\\d+$', '请输入负整数'),

  // 小数验证
  decimal: createPatternRule('^-?\\d+(\\.\\d+)?$', '请输入有效的数字'),

  // 正小数验证
  positiveDecimal: createPatternRule('^\\d+(\\.\\d+)?$', '请输入正数'),

  // 百分比验证（0-100）
  percentage: createCustomRule('validatePercentage', { min: 0, max: 100 }, '请输入0-100之间的数字'),

  // 数值范围验证
  range: (min: number, max: number, inclusive = true) =>
    createCustomRule(
      'validateNumberRange',
      { min, max, inclusive },
      `请输入${inclusive ? '[' : '('}${min}, ${max}${inclusive ? ']' : ')'}之间的数字`
    ),

  // 大于某个值
  greaterThan: (value: number) =>
    createCustomRule('validateGreaterThan', { value }, `请输入大于${value}的数字`),

  // 小于某个值
  lessThan: (value: number) =>
    createCustomRule('validateLessThan', { value }, `请输入小于${value}的数字`),

  // 保留小数位数
  decimalPlaces: (places: number) =>
    createCustomRule('validateDecimalPlaces', { places }, `最多保留${places}位小数`),
}

// 手机号验证规则
export const PhoneValidators = {
  // 中国大陆手机号
  chinaMobile: createPatternRule('^1[3-9]\\d{9}$', '请输入有效的中国手机号码'),

  // 国际手机号（E.164格式）
  international: createPatternRule(
    '^\\+[1-9]\\d{1,14}$',
    '请输入有效的国际手机号码（国家代码+号码）'
  ),

  // 带区号的固定电话
  landline: createPatternRule('^0\\d{2,3}-?\\d{7,8}$', '请输入有效的固定电话号码'),

  // 400/800服务号码
  service: createPatternRule('^[48]00-?\\d{7}$', '请输入有效的服务号码（400/800）'),
}

// 身份证验证规则
export const IdCardValidators = {
  // 15位身份证
  id15: createPatternRule('^\\d{15}$', '请输入有效的15位身份证号码'),

  // 18位身份证
  id18: createPatternRule('^\\d{17}[\\dXx]$', '请输入有效的18位身份证号码'),

  // 统一身份证验证（15或18位）
  unified: createPatternRule('(^\\d{15}$)|(^\\d{17}(\\d|X|x)$)', '请输入有效的身份证号码'),

  // 严格身份证验证（校验码验证）
  strict: createCustomRule('validateIdCardStrict', {}, '请输入有效的身份证号码'),
}

// 密码验证规则
export const PasswordValidators = {
  // 基础密码（至少6位）
  basic: createCustomRule('validatePasswordBasic', { minLength: 6 }, '密码至少需要6位字符'),

  // 中等强度（字母+数字）
  medium: createCustomRule('validatePasswordMedium', {}, '密码需要包含字母和数字'),

  // 高强度（字母+数字+特殊字符）
  strong: createCustomRule('validatePasswordStrong', {}, '密码需要包含字母、数字和特殊字符'),

  // 禁止常见密码
  notCommon: createCustomRule('validateNotCommonPassword', {}, '密码过于简单，请使用更复杂的密码'),

  // 密码确认
  confirm: (originalPassword: string) =>
    createCustomRule('validatePasswordConfirm', { originalPassword }, '两次输入的密码不一致'),
}

// URL验证规则
export const UrlValidators = {
  // HTTP/HTTPS URL
  http: createPatternRule(
    '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&\\/\\/=]*)$',
    '请输入有效的HTTP/HTTPS URL'
  ),

  // 任何协议的URL
  any: createPatternRule('^[a-zA-Z][a-zA-Z0-9+.-]*:\\/\\/[^\\s]+$', '请输入有效的URL地址'),

  // 域名验证
  domain: createPatternRule(
    '^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\\.[a-zA-Z]{2,}$',
    '请输入有效的域名'
  ),

  // IP地址验证
  ipv4: createPatternRule(
    '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
    '请输入有效的IPv4地址'
  ),
}

// 日期时间验证规则
export const DateTimeValidators = {
  // 日期格式（YYYY-MM-DD）
  date: createPatternRule('^\\d{4}-\\d{2}-\\d{2}$', '请输入有效的日期格式（YYYY-MM-DD）'),

  // 时间格式（HH:MM）
  time: createPatternRule('^([01]?[0-9]|2[0-3]):[0-5][0-9]$', '请输入有效的时间格式（HH:MM）'),

  // 日期时间格式（YYYY-MM-DD HH:MM）
  datetime: createPatternRule(
    '^\\d{4}-\\d{2}-\\d{2} ([01]?[0-9]|2[0-3]):[0-5][0-9]$',
    '请输入有效的日期时间格式（YYYY-MM-DD HH:MM）'
  ),

  // 年龄验证
  age: (min: number, max: number) =>
    createCustomRule('validateAge', { min, max }, `年龄需要在${min}-${max}岁之间`),

  // 未来日期
  futureDate: createCustomRule('validateFutureDate', {}, '请选择未来的日期'),

  // 过去日期
  pastDate: createCustomRule('validatePastDate', {}, '请选择过去的日期'),
}

// 文件验证规则
export const FileValidators = {
  // 文件大小限制（字节）
  maxSize: (maxSizeBytes: number) =>
    createCustomRule(
      'validateFileSize',
      { maxSize: maxSizeBytes },
      `文件大小不能超过${Math.round(maxSizeBytes / 1024 / 1024)}MB`
    ),

  // 文件类型限制
  allowedTypes: (allowedTypes: string[]) =>
    createCustomRule(
      'validateFileType',
      { allowedTypes },
      `仅支持以下文件类型：${allowedTypes.join(', ')}`
    ),

  // 图片验证
  image: createCustomRule('validateImageFile', {}, '请上传有效的图片文件'),

  // 文档验证
  document: createCustomRule('validateDocumentFile', {}, '请上传有效的文档文件'),
}

// 业务逻辑验证规则
export const BusinessValidators = {
  // 用户名验证（字母、数字、下划线，3-20位）
  username: createPatternRule(
    '^[a-zA-Z0-9_]{3,20}$',
    '用户名只能包含字母、数字和下划线，长度3-20位'
  ),

  // 真实姓名验证（中文或英文，2-10位）
  realName: createPatternRule('^[\\u4e00-\\u9fa5a-zA-Z\\s]{2,10}$', '请输入有效的真实姓名'),

  // 公司名称验证
  companyName: createPatternRule(
    '^[\\u4e00-\\u9fa5a-zA-Z0-9()（）\\s]{2,50}$',
    '请输入有效的公司名称'
  ),

  // 银行卡号验证
  bankCard: createPatternRule('^\\d{16,19}$', '请输入有效的银行卡号'),

  // 邮政编码验证
  postcode: createPatternRule('\\d{6}', '请输入有效的邮政编码'),

  // 地址验证
  address: createCustomRule(
    'validateAddress',
    { minLength: 5, maxLength: 100 },
    '请输入有效的地址（5-100字符）'
  ),

  // 自定义业务规则
  custom: (validatorName: string, params: Record<string, unknown>, message: string) =>
    createCustomRule(validatorName, params, message),
}

// 自定义验证函数实现
export const CustomValidationFunctions = {
  // 严格邮箱验证
  validateEmailStrict: (value: string): string | null => {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    return emailRegex.test(value) ? null : '请输入有效的邮箱地址'
  },

  // 邮箱提供商验证
  validateEmailProvider: (value: string, params: { allowedProviders: string[] }): string | null => {
    const domain = value.split('@')[1]?.toLowerCase()
    if (!domain) return '请输入有效的邮箱地址'

    return params.allowedProviders.includes(domain) ? null : '请使用常见的邮箱服务商'
  },

  // 百分比验证
  validatePercentage: (value: string, params: { min: number; max: number }): string | null => {
    const num = parseFloat(value)
    if (isNaN(num)) return '请输入有效的数字'
    return num >= params.min && num <= params.max
      ? null
      : `请输入${params.min}-${params.max}之间的数字`
  },

  // 数值范围验证
  validateNumberRange: (
    value: string,
    params: { min: number; max: number; inclusive: boolean }
  ): string | null => {
    const num = parseFloat(value)
    if (isNaN(num)) return '请输入有效的数字'

    const { min, max, inclusive } = params
    const isValid = inclusive ? num >= min && num <= max : num > min && num < max

    return isValid
      ? null
      : `请输入${inclusive ? '[' : '('}${min}, ${max}${inclusive ? ']' : ')'}之间的数字`
  },

  // 大于验证
  validateGreaterThan: (value: string, params: { value: number }): string | null => {
    const num = parseFloat(value)
    if (isNaN(num)) return '请输入有效的数字'
    return num > params.value ? null : `请输入大于${params.value}的数字`
  },

  // 小于验证
  validateLessThan: (value: string, params: { value: number }): string | null => {
    const num = parseFloat(value)
    if (isNaN(num)) return '请输入有效的数字'
    return num < params.value ? null : `请输入小于${params.value}的数字`
  },

  // 小数位数验证
  validateDecimalPlaces: (value: string, params: { places: number }): string | null => {
    const num = parseFloat(value)
    if (isNaN(num)) return '请输入有效的数字'

    const decimalPart = value.split('.')[1]
    if (!decimalPart) return null

    return decimalPart.length <= params.places ? null : `最多保留${params.places}位小数`
  },

  // 基础密码验证
  validatePasswordBasic: (value: string, params: { minLength: number }): string | null => {
    return value.length >= params.minLength ? null : `密码至少需要${params.minLength}位字符`
  },

  // 中等强度密码验证
  validatePasswordMedium: (value: string): string | null => {
    const hasLetter = /[a-zA-Z]/.test(value)
    const hasNumber = /\d/.test(value)
    return hasLetter && hasNumber ? null : '密码需要包含字母和数字'
  },

  // 高强度密码验证
  validatePasswordStrong: (value: string): string | null => {
    const hasLetter = /[a-zA-Z]/.test(value)
    const hasNumber = /\d/.test(value)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)
    return hasLetter && hasNumber && hasSpecial ? null : '密码需要包含字母、数字和特殊字符'
  },

  // 常见密码检查
  validateNotCommonPassword: (value: string): string | null => {
    const commonPasswords = [
      '123456',
      'password',
      '123456789',
      '12345678',
      '12345',
      '1234567',
      '1234567890',
      'qwerty',
      'abc123',
      'password123',
    ]
    return commonPasswords.includes(value.toLowerCase()) ? '密码过于简单，请使用更复杂的密码' : null
  },

  // 密码确认验证
  validatePasswordConfirm: (value: string, params: { originalPassword: string }): string | null => {
    return value === params.originalPassword ? null : '两次输入的密码不一致'
  },

  // 年龄验证
  validateAge: (value: string, params: { min: number; max: number }): string | null => {
    const age = parseInt(value)
    if (isNaN(age)) return '请输入有效的年龄'

    const birthYear = new Date().getFullYear() - age
    const minYear = new Date().getFullYear() - params.max
    const maxYear = new Date().getFullYear() - params.min

    return birthYear >= minYear && birthYear <= maxYear
      ? null
      : `年龄需要在${params.min}-${params.max}岁之间`
  },

  // 未来日期验证
  validateFutureDate: (value: string): string | null => {
    const date = new Date(value)
    const now = new Date()
    return date > now ? null : '请选择未来的日期'
  },

  // 过去日期验证
  validatePastDate: (value: string): string | null => {
    const date = new Date(value)
    const now = new Date()
    return date < now ? null : '请选择过去的日期'
  },

  // 文件大小验证
  validateFileSize: (file: File, params: { maxSize: number }): string | null => {
    return file.size <= params.maxSize
      ? null
      : `文件大小不能超过${Math.round(params.maxSize / 1024 / 1024)}MB`
  },

  // 文件类型验证
  validateFileType: (file: File, params: { allowedTypes: string[] }): string | null => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    return params.allowedTypes.includes(fileExtension)
      ? null
      : `仅支持以下文件类型：${params.allowedTypes.join(', ')}`
  },

  // 图片文件验证
  validateImageFile: (file: File): string | null => {
    const imageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    return imageTypes.includes(fileExtension) ? null : '请上传有效的图片文件'
  },

  // 文档文件验证
  validateDocumentFile: (file: File): string | null => {
    const docTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    return docTypes.includes(fileExtension) ? null : '请上传有效的文档文件'
  },

  // 地址验证
  validateAddress: (
    value: string,
    params: { minLength: number; maxLength: number }
  ): string | null => {
    const trimmedValue = value.trim()
    if (trimmedValue.length < params.minLength) {
      return `地址至少需要${params.minLength}个字符`
    }
    if (trimmedValue.length > params.maxLength) {
      return `地址不能超过${params.maxLength}个字符`
    }
    return null
  },
}

// 导出所有验证器
export const AdvancedValidators = {
  Email: EmailValidators,
  Number: NumberValidators,
  Phone: PhoneValidators,
  IdCard: IdCardValidators,
  Password: PasswordValidators,
  Url: UrlValidators,
  DateTime: DateTimeValidators,
  File: FileValidators,
  Business: BusinessValidators,
  Custom: CustomValidationFunctions,
}

export default AdvancedValidators
