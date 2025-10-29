/**
 * 表单组件专用验证器
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 * 任务编号: T047
 */

import {
  createRequiredRule,
  createMinLengthRule,
  createMaxLengthRule,
  createPatternRule,
  createCustomRule,
  type ValidationRule,
} from './form-validators'

// Button组件验证器
export const ButtonValidators = {
  // 按钮文本验证
  buttonText: [
    createMaxLengthRule(50, '按钮文本不能超过50个字符'),
    createCustomRule('validateButtonText', {}, '按钮文本不能为空格'),
  ],

  // 按钮类型验证
  buttonType: [createCustomRule('validateButtonType', {}, '无效的按钮类型')],

  // 按钮大小验证
  buttonSize: [createCustomRule('validateButtonSize', {}, '无效的按钮尺寸')],
}

// Input组件验证器
export const InputValidators = {
  // 文本输入验证
  text: [
    createMaxLengthRule(1000, '文本内容不能超过1000个字符'),
    createCustomRule('validateText', {}, '文本内容包含无效字符'),
  ],

  // 密码验证
  password: [
    createMinLengthRule(8, '密码至少需要8个字符'),
    createMaxLengthRule(128, '密码不能超过128个字符'),
    createCustomRule('validatePassword', {}, '密码必须包含大小写字母、数字和特殊字符'),
  ],

  // 邮箱验证
  email: [
    createRequiredRule('请输入邮箱地址'),
    createCustomRule('validateEmail', {}, '请输入有效的邮箱地址'),
  ],

  // 手机号验证
  phone: [
    createRequiredRule('请输入手机号码'),
    createPatternRule('^1[3-9]\\d{9}$', '请输入有效的手机号码'),
  ],

  // 数字验证
  number: [createCustomRule('validateNumber', {}, '请输入有效的数字')],

  // URL验证
  url: [createCustomRule('validateURL', {}, '请输入有效的URL地址')],
}

// Textarea组件验证器
export const TextareaValidators = {
  // 基础文本验证
  content: [
    createMaxLengthRule(5000, '内容不能超过5000个字符'),
    createCustomRule('validateTextarea', {}, '内容包含无效字符'),
  ],

  // 字数统计验证
  wordCount: [createCustomRule('validateWordCount', { min: 1, max: 5000 }, '字数必须在1-5000之间')],

  // 格式验证（如Markdown等）
  format: [createCustomRule('validateFormat', {}, '内容格式不正确')],
}

// Select组件验证器
export const SelectValidators = {
  // 单选验证
  singleSelect: [
    createRequiredRule('请选择一个选项'),
    createCustomRule('validateSelectOption', {}, '选择的选项无效'),
  ],

  // 多选验证
  multiSelect: [
    createCustomRule('validateMultiSelect', { min: 1, max: 10 }, '请至少选择1个，最多选择10个选项'),
  ],

  // 选项验证
  options: [
    createCustomRule('validateOptions', { min: 1, max: 100 }, '至少需要1个选项，最多100个选项'),
  ],
}

// Checkbox组件验证器
export const CheckboxValidators = {
  // 单个复选框验证
  single: [createCustomRule('validateCheckbox', {}, '请勾选复选框')],

  // 复选框组验证
  group: [
    createCustomRule(
      'validateCheckboxGroup',
      { min: 1, max: 10 },
      '请至少选择1个，最多选择10个选项'
    ),
  ],

  // 条件验证
  conditional: [createCustomRule('validateConditionalCheckbox', {}, '请根据要求勾选相应选项')],
}

// Radio组件验证器
export const RadioValidators = {
  // 单选验证
  required: [createRequiredRule('请选择一个选项')],

  // 选项验证
  options: [
    createCustomRule('validateRadioOptions', { min: 2, max: 20 }, '至少需要2个选项，最多20个选项'),
  ],

  // 选项值唯一性验证
  unique: [createCustomRule('validateRadioUnique', {}, '选项值必须唯一')],
}

// 自定义验证器函数
export const CustomValidatorFunctions: Record<string, (value: unknown) => string | null> = {
  // 按钮文本验证
  validateButtonText: (value: unknown) => {
    if (typeof value === 'string' && value.trim().length === 0) {
      return '按钮文本不能为空格'
    }
    return null
  },

  // 按钮类型验证
  validateButtonType: (value: unknown) => {
    if (typeof value === 'string') {
      const validTypes = ['primary', 'secondary', 'outline', 'ghost', 'destructive']
      if (!validTypes.includes(value)) {
        return '无效的按钮类型'
      }
    }
    return null
  },

  // 按钮大小验证
  validateButtonSize: (value: unknown) => {
    if (typeof value === 'string') {
      const validSizes = ['sm', 'md', 'lg']
      if (!validSizes.includes(value)) {
        return '无效的按钮尺寸'
      }
    }
    return null
  },

  // 文本验证
  validateText: (value: unknown) => {
    if (typeof value === 'string') {
      // 检查是否包含控制字符
      if (/[\x00-\x1F\x7F]/.test(value)) {
        return '文本内容包含无效字符'
      }
    }
    return null
  },

  // 密码验证
  validatePassword: (value: unknown) => {
    if (typeof value === 'string') {
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
        return '密码必须包含大小写字母、数字和特殊字符'
      }
    }
    return null
  },

  // 邮箱验证
  validateEmail: (value: unknown) => {
    if (typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return '请输入有效的邮箱地址'
      }
    }
    return null
  },

  // 数字验证
  validateNumber: (value: unknown) => {
    if (typeof value === 'string') {
      if (value && isNaN(Number(value))) {
        return '请输入有效的数字'
      }
    }
    return null
  },

  // URL验证
  validateURL: (value: unknown) => {
    if (typeof value === 'string' && value) {
      try {
        new URL(value)
      } catch {
        return '请输入有效的URL地址'
      }
    }
    return null
  },

  // Textarea验证
  validateTextarea: (value: unknown) => {
    if (typeof value === 'string') {
      // 检查是否包含控制字符
      if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(value)) {
        return '内容包含无效字符'
      }
    }
    return null
  },

  // 字数统计验证
  validateWordCount: () => {
    // 这个验证器需要额外的参数，暂时跳过具体验证
    return null
  },

  // 格式验证
  validateFormat: () => {
    // 可以根据需要扩展不同的格式验证
    return null
  },

  // Select选项验证
  validateSelectOption: (value: unknown) => {
    if (Array.isArray(value)) {
      // 多选验证
      if (value.length === 0) {
        return '请至少选择一个选项'
      }
    } else if (typeof value === 'string') {
      // 单选验证
      if (!value) {
        return '请选择一个选项'
      }
    }

    return null
  },

  // 多选验证
  validateMultiSelect: (value: unknown) => {
    if (Array.isArray(value)) {
      // 这个验证器需要额外的参数，暂时跳过具体验证
      if (value.length === 0) {
        return '请至少选择一个选项'
      }
    }
    return null
  },

  // 选项验证
  validateOptions: () => {
    // 这个验证器需要额外的参数，暂时跳过具体验证
    return null
  },

  // Checkbox验证
  validateCheckbox: (value: unknown) => {
    if (value !== true) {
      return '请勾选复选框'
    }
    return null
  },

  // 复选框组验证
  validateCheckboxGroup: (value: unknown) => {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '请至少选择一个选项'
      }
    }
    return null
  },

  // 条件验证
  validateConditionalCheckbox: () => {
    // 这个验证器需要额外的参数，暂时跳过具体验证
    return null
  },

  // Radio选项验证
  validateRadioOptions: () => {
    // 这个验证器需要额外的参数，暂时跳过具体验证
    return null
  },

  // Radio选项唯一性验证
  validateRadioUnique: () => {
    // 这个验证器需要额外的参数，暂时跳过具体验证
    return null
  },
}

// 表单组件验证规则集合
export const FormComponentValidationRules = {
  button: ButtonValidators,
  input: InputValidators,
  textarea: TextareaValidators,
  select: SelectValidators,
  checkbox: CheckboxValidators,
  radio: RadioValidators,
} as const

// 获取组件验证器的辅助函数
export const getComponentValidators = (
  componentType: keyof typeof FormComponentValidationRules
) => {
  return FormComponentValidationRules[componentType] || {}
}

// 创建组件特定验证规则的辅助函数
export const createComponentValidationRule = (
  componentType: keyof typeof FormComponentValidationRules,
  ruleType: string,
  params?: Record<string, unknown>,
  message?: string
): ValidationRule => {
  const validators = getComponentValidators(componentType)
  const rules = Array.isArray(validators[ruleType as keyof typeof validators])
    ? validators[ruleType as keyof typeof validators]
    : []

  if (rules.length > 0) {
    return rules[0] // 返回第一个匹配的规则
  }

  // 如果没有预定义规则，创建自定义规则
  return createCustomRule(ruleType, params || {}, message || '验证失败')
}

const componentValidators = {
  FormComponentValidationRules,
  CustomValidatorFunctions,
  getComponentValidators,
  createComponentValidationRule,
}

export default componentValidators
