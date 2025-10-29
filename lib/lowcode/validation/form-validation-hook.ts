/**
 * 表单验证React Hook
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import { useState, useCallback, useEffect } from 'react'
import type { ValidationRule } from '@/types/lowcode/property'
import {
  FormValidator,
  createRequiredRule,
  createMinLengthRule,
  createMaxLengthRule,
  createEmailRule,
  createPhoneRule,
  createPatternRule,
  createCustomRule,
} from './form-validators'

// 表单字段状态接口
export interface FormFieldState {
  value: unknown
  error: string | null
  isTouched: boolean
  isDirty: boolean
  isValidating: boolean
}

// 表单状态接口
export interface FormState {
  [fieldName: string]: FormFieldState
}

// 表单验证Hook配置
export interface UseFormValidationConfig {
  initialValues?: Record<string, unknown>
  validationRules?: Record<string, ValidationRule[]>
  validateOnChange?: boolean
  validateOnBlur?: boolean
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>
}

// 表单验证Hook返回值
export interface UseFormValidationReturn {
  // 表单状态
  values: Record<string, unknown>
  errors: Record<string, string | null>
  touched: Record<string, boolean>
  dirty: Record<string, boolean>
  isValid: boolean
  isSubmitting: boolean

  // 字段操作
  getFieldValue: (fieldName: string) => unknown
  setFieldValue: (fieldName: string, value: unknown) => void
  getFieldError: (fieldName: string) => string | null
  setFieldError: (fieldName: string, error: string | null) => void
  isFieldTouched: (fieldName: string) => boolean
  setFieldTouched: (fieldName: string, touched: boolean) => void
  isFieldDirty: (fieldName: string) => boolean

  // 验证操作
  validateField: (fieldName: string) => Promise<boolean>
  validateForm: () => Promise<boolean>
  clearErrors: () => void
  resetForm: () => void

  // 提交操作
  handleSubmit: (
    onSubmit?: (values: Record<string, unknown>) => void | Promise<void>
  ) => Promise<void>
}

/**
 * 表单验证Hook
 */
export const useFormValidation = (
  config: UseFormValidationConfig = {}
): UseFormValidationReturn => {
  const {
    initialValues = {},
    validationRules = {},
    validateOnChange = true,
    validateOnBlur = true,
    onSubmit: externalOnSubmit,
  } = config

  // 表单状态
  const [formState, setFormState] = useState<FormState>(() => {
    const initialState: FormState = {}
    Object.keys(initialValues).forEach(fieldName => {
      initialState[fieldName] = {
        value: initialValues[fieldName],
        error: null,
        isTouched: false,
        isDirty: false,
        isValidating: false,
      }
    })
    return initialState
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // 计算派生状态
  const values = Object.fromEntries(
    Object.entries(formState).map(([fieldName, fieldState]) => [fieldName, fieldState.value])
  )

  const errors = Object.fromEntries(
    Object.entries(formState).map(([fieldName, fieldState]) => [fieldName, fieldState.error])
  )

  const touched = Object.fromEntries(
    Object.entries(formState).map(([fieldName, fieldState]) => [fieldName, fieldState.isTouched])
  )

  const dirty = Object.fromEntries(
    Object.entries(formState).map(([fieldName, fieldState]) => [fieldName, fieldState.isDirty])
  )

  const isValid = Object.values(errors).every(error => !error)

  // 更新字段状态
  const updateFieldState = useCallback((fieldName: string, updates: Partial<FormFieldState>) => {
    setFormState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        ...updates,
      },
    }))
  }, [])

  // 验证单个字段
  const validateField = useCallback(
    async (fieldName: string): Promise<boolean> => {
      const rules = validationRules[fieldName]
      if (!rules || rules.length === 0) {
        updateFieldState(fieldName, { error: null })
        return true
      }

      updateFieldState(fieldName, { isValidating: true })

      try {
        const value = formState[fieldName]?.value
        const result = FormValidator.validateMultiple(value, rules)

        updateFieldState(fieldName, {
          error: result.isValid ? null : result.errors[0],
          isValidating: false,
        })

        return result.isValid
      } catch {
        updateFieldState(fieldName, {
          error: '验证过程中发生错误',
          isValidating: false,
        })
        return false
      }
    },
    [formState, validationRules, updateFieldState]
  )

  // 验证整个表单
  const validateForm = useCallback(async (): Promise<boolean> => {
    const fieldNames = Object.keys(validationRules)
    const results = await Promise.all(fieldNames.map(fieldName => validateField(fieldName)))
    return results.every(isValid => isValid)
  }, [validationRules, validateField])

  // 获取字段值
  const getFieldValue = useCallback(
    (fieldName: string): unknown => {
      return formState[fieldName]?.value
    },
    [formState]
  )

  // 设置字段值
  const setFieldValue = useCallback(
    (fieldName: string, value: unknown) => {
      const currentValue = formState[fieldName]?.value
      const isDirty = currentValue !== value

      updateFieldState(fieldName, {
        value,
        isDirty,
        // 如果值改变且配置了实时验证，则重新验证
        ...(validateOnChange && isDirty ? {} : {}),
      })

      // 如果配置了实时验证，则触发验证
      if (validateOnChange && isDirty) {
        setTimeout(() => validateField(fieldName), 0)
      }
    },
    [formState, validateOnChange, validateField, updateFieldState]
  )

  // 获取字段错误
  const getFieldError = useCallback(
    (fieldName: string): string | null => {
      return formState[fieldName]?.error || null
    },
    [formState]
  )

  // 设置字段错误
  const setFieldError = useCallback(
    (fieldName: string, error: string | null) => {
      updateFieldState(fieldName, { error })
    },
    [updateFieldState]
  )

  // 检查字段是否被触摸过
  const isFieldTouched = useCallback(
    (fieldName: string): boolean => {
      return formState[fieldName]?.isTouched || false
    },
    [formState]
  )

  // 设置字段触摸状态
  const setFieldTouched = useCallback(
    (fieldName: string, touched: boolean) => {
      updateFieldState(fieldName, { isTouched: touched })

      // 如果配置了失焦验证且字段刚被触摸，则触发验证
      if (validateOnBlur && touched) {
        setTimeout(() => validateField(fieldName), 0)
      }
    },
    [validateOnBlur, validateField, updateFieldState]
  )

  // 检查字段是否脏（值是否改变）
  const isFieldDirty = useCallback(
    (fieldName: string): boolean => {
      return formState[fieldName]?.isDirty || false
    },
    [formState]
  )

  // 清除所有错误
  const clearErrors = useCallback(() => {
    Object.keys(formState).forEach(fieldName => {
      updateFieldState(fieldName, { error: null })
    })
  }, [formState, updateFieldState])

  // 重置表单
  const resetForm = useCallback(() => {
    const newState: FormState = {}
    Object.keys(initialValues).forEach(fieldName => {
      newState[fieldName] = {
        value: initialValues[fieldName],
        error: null,
        isTouched: false,
        isDirty: false,
        isValidating: false,
      }
    })
    setFormState(newState)
  }, [initialValues])

  // 处理表单提交
  const handleSubmit = useCallback(
    async (onSubmit?: (values: Record<string, unknown>) => void | Promise<void>) => {
      if (isSubmitting) return

      setIsSubmitting(true)

      try {
        // 标记所有字段为已触摸
        Object.keys(formState).forEach(fieldName => {
          updateFieldState(fieldName, { isTouched: true })
        })

        // 验证表单
        const isFormValid = await validateForm()

        if (isFormValid) {
          const submitHandler = onSubmit || externalOnSubmit
          if (submitHandler) {
            await submitHandler(values)
          }
        }
      } catch (error) {
        console.error('表单提交错误:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [isSubmitting, formState, validateForm, values, externalOnSubmit, updateFieldState]
  )

  // 初始化时添加新字段
  useEffect(() => {
    const currentFieldNames = Object.keys(formState)
    const requiredFieldNames = Object.keys(validationRules)

    // 添加缺失的字段
    requiredFieldNames.forEach(fieldName => {
      if (!currentFieldNames.includes(fieldName)) {
        updateFieldState(fieldName, {
          value: initialValues[fieldName] || '',
          error: null,
          isTouched: false,
          isDirty: false,
          isValidating: false,
        })
      }
    })
  }, [validationRules, initialValues, formState, updateFieldState])

  return {
    // 表单状态
    values,
    errors,
    touched,
    dirty,
    isValid,
    isSubmitting,

    // 字段操作
    getFieldValue,
    setFieldValue,
    getFieldError,
    setFieldError,
    isFieldTouched,
    setFieldTouched,
    isFieldDirty,

    // 验证操作
    validateField,
    validateForm,
    clearErrors,
    resetForm,

    // 提交操作
    handleSubmit,
  }
}

// 创建预定义的验证规则配置
export const createValidationRules = {
  // 用户名验证
  username: [
    createRequiredRule('用户名不能为空'),
    createMinLengthRule(3, '用户名至少需要3个字符'),
    createMaxLengthRule(20, '用户名不能超过20个字符'),
    createPatternRule('^[a-zA-Z0-9_]+$', '用户名只能包含字母、数字和下划线'),
  ],

  // 邮箱验证
  email: [createRequiredRule('邮箱不能为空'), createEmailRule()],

  // 密码验证
  password: [
    createRequiredRule('密码不能为空'),
    createMinLengthRule(8, '密码至少需要8个字符'),
    createCustomRule('validatePassword'),
  ],

  // 手机号验证
  phone: [createRequiredRule('手机号不能为空'), createPhoneRule()],

  // 必填文本验证
  requiredText: [createRequiredRule(), createMaxLengthRule(100)],

  // 可选文本验证
  optionalText: [createMaxLengthRule(100)],
}

export default useFormValidation
