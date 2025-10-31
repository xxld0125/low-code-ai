/**
 * 组件验证Hook
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 任务: T126 - 集成验证规则引擎到表单组件
 * 创建日期: 2025-10-31
 */

import { useCallback } from 'react'
import { useFormValidation, type ValidationRule } from '@/lib/lowcode/validation'

// 组件验证配置
export interface ComponentValidationConfig {
  // 组件类型
  componentType: 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'button'

  // 验证规则
  rules?: ValidationRule[]

  // 验证时机
  validateOnChange?: boolean
  validateOnBlur?: boolean

  // 初始值
  initialValue?: unknown

  // 自定义验证函数
  customValidator?: (value: unknown) => string | null
}

// 组件验证返回值
export interface ComponentValidationReturn {
  // 值
  value: unknown
  error: string | null
  isValid: boolean
  isTouched: boolean
  isDirty: boolean

  // 事件处理
  onChange: (value: unknown) => void
  onBlur: () => void
  onFocus: () => void

  // 验证方法
  validate: () => Promise<string | null>
  clearError: () => void

  // 辅助属性
  hasError: boolean
  canShowError: boolean
}

// 预定义的组件验证规则
export const ComponentValidationRules = {
  // Input组件规则
  input: {
    required: {
      type: 'required' as const,
      message: '此字段为必填项',
    },
    email: {
      type: 'email' as const,
      message: '请输入有效的邮箱地址',
    },
    phone: {
      type: 'phone' as const,
      message: '请输入有效的手机号码',
    },
    url: {
      type: 'url' as const,
      message: '请输入有效的URL地址',
    },
    number: {
      type: 'pattern' as const,
      params: { pattern: '^-?\\d+(\\.\\d+)?$' },
      message: '请输入有效的数字',
    },
    minLength: (min: number) => ({
      type: 'min_length' as const,
      params: { min },
      message: `至少需要输入${min}个字符`,
    }),
    maxLength: (max: number) => ({
      type: 'max_length' as const,
      params: { max },
      message: `最多只能输入${max}个字符`,
    }),
    pattern: (pattern: string, message?: string) => ({
      type: 'pattern' as const,
      params: { pattern },
      message: message || '输入格式不正确',
    }),
  },

  // Textarea组件规则
  textarea: {
    required: {
      type: 'required' as const,
      message: '此字段为必填项',
    },
    minLength: (min: number) => ({
      type: 'min_length' as const,
      params: { min },
      message: `至少需要输入${min}个字符`,
    }),
    maxLength: (max: number) => ({
      type: 'max_length' as const,
      params: { max },
      message: `最多只能输入${max}个字符`,
    }),
    wordCount: (min: number, max: number) => ({
      type: 'custom' as const,
      params: { validator: 'validateWordCount', min, max },
      message: `字数需要在${min}-${max}之间`,
    }),
  },

  // Select组件规则
  select: {
    required: {
      type: 'required' as const,
      message: '请选择一个选项',
    },
    minSelected: (min: number) => ({
      type: 'custom' as const,
      params: { validator: 'validateMinSelected', min },
      message: `至少需要选择${min}个选项`,
    }),
    maxSelected: (max: number) => ({
      type: 'custom' as const,
      params: { validator: 'validateMaxSelected', max },
      message: `最多只能选择${max}个选项`,
    }),
  },

  // Checkbox组件规则
  checkbox: {
    required: {
      type: 'custom' as const,
      params: { validator: 'validateCheckboxRequired' },
      message: '请勾选此选项',
    },
    minChecked: (min: number) => ({
      type: 'custom' as const,
      params: { validator: 'validateMinChecked', min },
      message: `至少需要勾选${min}个选项`,
    }),
    maxChecked: (max: number) => ({
      type: 'custom' as const,
      params: { validator: 'validateMaxChecked', max },
      message: `最多只能勾选${max}个选项`,
    }),
  },

  // Radio组件规则
  radio: {
    required: {
      type: 'required' as const,
      message: '请选择一个选项',
    },
  },
} as const

// 主要的组件验证Hook
export const useComponentValidation = (
  config: ComponentValidationConfig
): ComponentValidationReturn => {
  const {
    rules = [],
    validateOnChange = true,
    validateOnBlur = true,
    initialValue,
    customValidator,
  } = config

  // 使用表单验证Hook
  const formValidation = useFormValidation({
    initialValues: { value: initialValue },
    validationRules: { value: rules },
    validateOnChange,
    validateOnBlur,
  })

  const {
    values,
    errors,
    touched,
    dirty,
    isValid,
    setFieldValue,
    setFieldTouched,
    validateField,
    setFieldError,
  } = formValidation

  // 获取当前值和错误
  const value = values.value
  const error = errors.value
  const isTouched = touched.value || false
  const isDirty = dirty.value || false

  // 自定义验证函数
  const runCustomValidation = useCallback(
    (val: unknown): string | null => {
      if (customValidator) {
        return customValidator(val)
      }
      return null
    },
    [customValidator]
  )

  // 验证方法
  const validate = useCallback(async (): Promise<string | null> => {
    // 先运行内置规则验证
    const isValid = await validateField('value')
    if (!isValid) {
      // 获取验证错误信息
      const fieldError = errors.value
      return fieldError || null
    }

    // 运行自定义验证
    return runCustomValidation(value)
  }, [validateField, value, runCustomValidation, errors.value])

  // 变更处理
  const onChange = useCallback(
    (newValue: unknown) => {
      setFieldValue('value', newValue)

      // 如果有自定义验证器且要求实时验证
      if (validateOnChange && customValidator) {
        // 异步执行自定义验证，不阻塞UI
        runCustomValidation(newValue)
      }
    },
    [setFieldValue, validateOnChange, customValidator, runCustomValidation]
  )

  // 失焦处理
  const onBlur = useCallback(() => {
    setFieldTouched('value', true)

    if (validateOnBlur) {
      // 异步执行验证，不阻塞UI
      validate().catch(error => {
        console.error('验证过程中发生错误:', error)
      })
    }
  }, [setFieldTouched, validateOnBlur, validate])

  // 聚焦处理
  const onFocus = useCallback(() => {
    // 可以在这里添加聚焦时的逻辑
  }, [])

  // 清除错误
  const clearError = useCallback(() => {
    setFieldError('value', null)
  }, [setFieldError])

  // 计算派生状态
  const hasError = !!error
  const canShowError = isTouched && hasError

  return {
    value,
    error,
    isValid,
    isTouched,
    isDirty,
    onChange,
    onBlur,
    onFocus,
    validate,
    clearError,
    hasError,
    canShowError,
  }
}

// 便捷Hook：Input组件验证
export const useInputValidation = (props: {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: string
  type?: string
  customValidator?: (value: unknown) => string | null
  initialValue?: string
  validateOnChange?: boolean
  validateOnBlur?: boolean
}) => {
  const rules: ValidationRule[] = []

  // 添加必填规则
  if (props.required) {
    rules.push(ComponentValidationRules.input.required)
  }

  // 添加类型特定规则
  if (props.type === 'email') {
    rules.push(ComponentValidationRules.input.email)
  } else if (props.type === 'tel') {
    rules.push(ComponentValidationRules.input.phone)
  } else if (props.type === 'url') {
    rules.push(ComponentValidationRules.input.url)
  } else if (props.type === 'number') {
    rules.push(ComponentValidationRules.input.number)
  }

  // 添加长度规则
  if (props.minLength !== undefined) {
    rules.push(ComponentValidationRules.input.minLength(props.minLength))
  }
  if (props.maxLength !== undefined) {
    rules.push(ComponentValidationRules.input.maxLength(props.maxLength))
  }

  // 添加模式规则
  if (props.pattern) {
    rules.push(ComponentValidationRules.input.pattern(props.pattern))
  }

  return useComponentValidation({
    componentType: 'input',
    rules,
    initialValue: props.initialValue || '',
    validateOnChange: props.validateOnChange,
    validateOnBlur: props.validateOnBlur,
    customValidator: props.customValidator,
  })
}

// 便捷Hook：Textarea组件验证
export const useTextareaValidation = (props: {
  required?: boolean
  minLength?: number
  maxLength?: number
  wordCount?: { min?: number; max?: number }
  customValidator?: (value: unknown) => string | null
  initialValue?: string
  validateOnChange?: boolean
  validateOnBlur?: boolean
}) => {
  const rules: ValidationRule[] = []

  if (props.required) {
    rules.push(ComponentValidationRules.textarea.required)
  }

  if (props.minLength !== undefined) {
    rules.push(ComponentValidationRules.textarea.minLength(props.minLength))
  }

  if (props.maxLength !== undefined) {
    rules.push(ComponentValidationRules.textarea.maxLength(props.maxLength))
  }

  if (props.wordCount) {
    const { min, max } = props.wordCount
    if (min !== undefined || max !== undefined) {
      rules.push(ComponentValidationRules.textarea.wordCount(min || 0, max || Infinity))
    }
  }

  return useComponentValidation({
    componentType: 'textarea',
    rules,
    initialValue: props.initialValue || '',
    validateOnChange: props.validateOnChange,
    validateOnBlur: props.validateOnBlur,
    customValidator: props.customValidator,
  })
}

// 便捷Hook：Select组件验证
export const useSelectValidation = (props: {
  required?: boolean
  multiple?: boolean
  minSelected?: number
  maxSelected?: number
  customValidator?: (value: unknown) => string | null
  initialValue?: string | string[]
  validateOnChange?: boolean
  validateOnBlur?: boolean
}) => {
  const rules: ValidationRule[] = []

  if (props.required) {
    rules.push(ComponentValidationRules.select.required)
  }

  if (props.multiple && props.minSelected !== undefined) {
    rules.push(ComponentValidationRules.select.minSelected(props.minSelected))
  }

  if (props.multiple && props.maxSelected !== undefined) {
    rules.push(ComponentValidationRules.select.maxSelected(props.maxSelected))
  }

  return useComponentValidation({
    componentType: 'select',
    rules,
    initialValue: props.initialValue || (props.multiple ? [] : ''),
    validateOnChange: props.validateOnChange,
    validateOnBlur: props.validateOnBlur,
    customValidator: props.customValidator,
  })
}

// 便捷Hook：Checkbox组件验证
export const useCheckboxValidation = (props: {
  required?: boolean
  multiple?: boolean
  minChecked?: number
  maxChecked?: number
  customValidator?: (value: unknown) => string | null
  initialValue?: boolean | string[]
  validateOnChange?: boolean
  validateOnBlur?: boolean
}) => {
  const rules: ValidationRule[] = []

  if (props.required && !props.multiple) {
    rules.push(ComponentValidationRules.checkbox.required)
  }

  if (props.multiple && props.minChecked !== undefined) {
    rules.push(ComponentValidationRules.checkbox.minChecked(props.minChecked))
  }

  if (props.multiple && props.maxChecked !== undefined) {
    rules.push(ComponentValidationRules.checkbox.maxChecked(props.maxChecked))
  }

  return useComponentValidation({
    componentType: 'checkbox',
    rules,
    initialValue: props.initialValue || (props.multiple ? [] : false),
    validateOnChange: props.validateOnChange,
    validateOnBlur: props.validateOnBlur,
    customValidator: props.customValidator,
  })
}

// 便捷Hook：Radio组件验证
export const useRadioValidation = (props: {
  required?: boolean
  customValidator?: (value: unknown) => string | null
  initialValue?: string
  validateOnChange?: boolean
  validateOnBlur?: boolean
}) => {
  const rules: ValidationRule[] = []

  if (props.required) {
    rules.push(ComponentValidationRules.radio.required)
  }

  return useComponentValidation({
    componentType: 'radio',
    rules,
    initialValue: props.initialValue || '',
    validateOnChange: props.validateOnChange,
    validateOnBlur: props.validateOnBlur,
    customValidator: props.customValidator,
  })
}
