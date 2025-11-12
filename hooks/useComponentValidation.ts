import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * 验证规则接口
 */
export interface ValidationRule {
  /** 验证函数 */
  validate: (value: unknown) => boolean | string
  /** 错误消息 */
  message: string
  /** 是否异步验证 */
  async?: boolean
}

/**
 * 验证状态接口
 */
export interface ValidationState {
  /** 是否有效 */
  isValid: boolean
  /** 错误信息 */
  errors: string[]
  /** 是否正在验证 */
  isValidating: boolean
  /** 是否已验证 */
  hasValidated: boolean
}

/**
 * 组件验证Hook配置
 */
interface UseComponentValidationConfig {
  /** 验证规则映射 */
  rules: Record<string, ValidationRule[]>
  /** 验证模式 */
  mode?: 'onChange' | 'onBlur' | 'onSubmit'
  /** 验证延迟（毫秒） */
  delay?: number
  /** 验证失败回调 */
  onValidationError?: (field: string, errors: string[]) => void
  /** 验证成功回调 */
  onValidationSuccess?: (field: string) => void
}

/**
 * 组件验证Hook
 * @param config 配置选项
 * @returns 验证状态和验证函数
 */
export function useComponentValidation(config: UseComponentValidationConfig) {
  const {
    rules,
    mode = 'onChange',
    delay = 300,
    onValidationError,
    onValidationSuccess,
  } = config

  // 状态管理
  const [validationState, setValidationState] = useState<Record<string, ValidationState>>(() => {
    const initial: Record<string, ValidationState> = {}
    Object.keys(rules).forEach(field => {
      initial[field] = {
        isValid: true,
        errors: [],
        isValidating: false,
        hasValidated: false,
      }
    })
    return initial
  })

  // 值缓存
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {}
    Object.keys(rules).forEach(field => {
      initial[field] = undefined
    })
    return initial
  })

  // 防抖定时器
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({})

  // 执行单个字段的验证
  const validateField = useCallback(async (
    field: string,
    value: unknown
  ): Promise<ValidationState> => {
    const fieldRules = rules[field]
    if (!fieldRules || fieldRules.length === 0) {
      return {
        isValid: true,
        errors: [],
        isValidating: false,
        hasValidated: true,
      }
    }

    setValidationState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        isValidating: true,
      }
    }))

    const errors: string[] = []

    try {
      for (const rule of fieldRules) {
        if (rule.async) {
          // 异步验证
          const result = await rule.validate(value)
          if (result === false || typeof result === 'string') {
            errors.push(typeof result === 'string' ? result : rule.message)
          }
        } else {
          // 同步验证
          const result = rule.validate(value)
          if (result === false || typeof result === 'string') {
            errors.push(typeof result === 'string' ? result : rule.message)
          }
        }
      }
    } catch {
      errors.push('验证过程中发生错误')
    }

    const isValid = errors.length === 0
    const newState: ValidationState = {
      isValid,
      errors,
      isValidating: false,
      hasValidated: true,
    }

    setValidationState(prev => ({
      ...prev,
      [field]: newState,
    }))

    // 触发回调
    if (isValid) {
      onValidationSuccess?.(field)
    } else {
      onValidationError?.(field, errors)
    }

    return newState
  }, [rules, onValidationError, onValidationSuccess])

  // 防抖验证字段
  const debouncedValidateField = useCallback((
    field: string,
    value: unknown
  ) => {
    // 更新值
    setValues(prev => ({ ...prev, [field]: value }))

    // 清除之前的定时器
    if (debounceTimers.current[field]) {
      clearTimeout(debounceTimers.current[field])
    }

    // 设置新的定时器
    debounceTimers.current[field] = setTimeout(() => {
      validateField(field, value)
    }, delay)
  }, [validateField, delay])

  // 立即验证字段
  const validateFieldImmediate = useCallback((
    field: string,
    value: unknown
  ) => {
    // 更新值
    setValues(prev => ({ ...prev, [field]: value }))

    // 清除防抖定时器
    if (debounceTimers.current[field]) {
      clearTimeout(debounceTimers.current[field])
    }

    return validateField(field, value)
  }, [validateField])

  // 验证所有字段
  const validateAll = useCallback(async (): Promise<boolean> => {
    const results = await Promise.all(
      Object.keys(rules).map(field => validateField(field, values[field]))
    )

    return results.every(result => result.isValid)
  }, [rules, validateField, values])

  // 重置验证状态
  const resetValidation = useCallback((field?: string) => {
    if (field) {
      setValidationState(prev => ({
        ...prev,
        [field]: {
          isValid: true,
          errors: [],
          isValidating: false,
          hasValidated: false,
        }
      }))
    } else {
      const resetState: Record<string, ValidationState> = {}
      Object.keys(rules).forEach(f => {
        resetState[f] = {
          isValid: true,
          errors: [],
          isValidating: false,
          hasValidated: false,
        }
      })
      setValidationState(resetState)
    }
  }, [rules])

  // 清除错误
  const clearErrors = useCallback((field?: string) => {
    if (field) {
      setValidationState(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          errors: [],
          isValid: true,
        }
      }))
    } else {
      setValidationState(prev => {
        const cleared: Record<string, ValidationState> = {}
        Object.keys(prev).forEach(f => {
          cleared[f] = {
            ...prev[f],
            errors: [],
            isValid: true,
          }
        })
        return cleared
      })
    }
  }, [])

  // 处理字段值变化
  const handleFieldChange = useCallback((
    field: string,
    value: unknown
  ) => {
    if (mode === 'onChange') {
      debouncedValidateField(field, value)
    } else {
      setValues(prev => ({ ...prev, [field]: value }))
    }
  }, [mode, debouncedValidateField])

  // 处理字段失焦
  const handleFieldBlur = useCallback((
    field: string
  ) => {
    if (mode === 'onBlur') {
      validateFieldImmediate(field, values[field])
    }
  }, [mode, validateFieldImmediate, values])

  // 获取字段错误信息
  const getFieldError = useCallback((field: string): string | null => {
    const state = validationState[field]
    return state?.hasValidated && !state?.isValid && state?.errors?.length > 0
      ? state.errors[0]
      : null
  }, [validationState])

  // 获取字段所有错误信息
  const getFieldErrors = useCallback((field: string): string[] => {
    const state = validationState[field]
    return state?.hasValidated && !state?.isValid ? state?.errors || [] : []
  }, [validationState])

  // 检查字段是否有错误
  const hasFieldError = useCallback((field: string): boolean => {
    const state = validationState[field]
    return state?.hasValidated && !state?.isValid
  }, [validationState])

  // 检查是否有任何错误
  const hasAnyError = useCallback((): boolean => {
    return Object.values(validationState).some(state => state.hasValidated && !state.isValid)
  }, [validationState])

  // 检查是否正在验证
  const isValidating = useCallback((): boolean => {
    return Object.values(validationState).some(state => state.isValidating)
  }, [validationState])

  // 清理定时器
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => {
        if (timer) clearTimeout(timer)
      })
    }
  }, [])

  return {
    // 状态
    validationState,
    values,

    // 验证函数
    validateField,
    validateFieldImmediate,
    validateAll,
    resetValidation,
    clearErrors,

    // 事件处理
    handleFieldChange,
    handleFieldBlur,

    // 查询函数
    getFieldError,
    getFieldErrors,
    hasFieldError,
    hasAnyError,
    isValidating,

    // 快捷状态
    isValid: !hasAnyError(),
    isDirty: Object.keys(validationState).some(field => validationState[field].hasValidated),
  }
}

// 输入组件专用验证Hook
export function useInputValidation(config: Omit<UseComponentValidationConfig, 'rules'> & {
  validationRules?: Record<string, ValidationRule[]>
}) {
  const rules = config.validationRules || {}

  return useComponentValidation({
    ...config,
    rules
  })
}