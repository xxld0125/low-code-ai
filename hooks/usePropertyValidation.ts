/**
 * 属性验证Hook
 *
 * 提供便捷的属性验证功能，支持实时验证和错误显示
 */

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { EnhancedPropertyValidator } from '@/lib/designer/validation/enhanced-validator'
import { PropertySchema, ValidationResult, ValidationError } from '@/lib/designer/validation/property-validator'
import { CustomValidationRule } from '@/lib/designer/validation/enhanced-validator'

// 验证Hook配置
interface UsePropertyValidationConfig {
  debounceDelay?: number
  validateOnChange?: boolean
  validateOnBlur?: boolean
  validateOnSubmit?: boolean
  showErrors?: boolean
  clearErrorsOnChange?: boolean
}

// 验证状态
interface ValidationState {
  errors: Record<string, ValidationError[]>
  warnings: Record<string, ValidationError[]>
  isValidating: boolean
  isValid: boolean
  touched: Record<string, boolean>
  dirty: Record<string, boolean>
}

// Hook返回值
interface UsePropertyValidationReturn {
  // 状态
  errors: Record<string, ValidationError[]>
  warnings: Record<string, ValidationError[]>
  isValidating: boolean
  isValid: boolean
  touched: Record<string, boolean>
  dirty: Record<string, boolean>

  // 方法
  validateField: (fieldName: string, value: any, schema: PropertySchema & { customRuleIds?: string[] }) => Promise<ValidationResult>
  validateAll: (values: Record<string, any>, schemas: Record<string, PropertySchema & { customRuleIds?: string[] }>) => Promise<Record<string, ValidationResult>>
  clearErrors: (fieldName?: string) => void
  setFieldTouched: (fieldName: string, touched: boolean) => void
  setFieldDirty: (fieldName: string, dirty: boolean) => void

  // 便捷方法
  getFieldError: (fieldName: string) => ValidationError[]
  getFieldWarning: (fieldName: string) => ValidationError[]
  hasFieldError: (fieldName: string) => boolean
  hasFieldWarning: (fieldName: string) => boolean
  isFieldValid: (fieldName: string) => boolean
  isFieldTouched: (fieldName: string) => boolean
  isFieldDirty: (fieldName: string) => boolean

  // 触发器
  triggerValidation: () => void
  resetValidation: () => void
}

/**
 * 属性验证Hook
 */
export const usePropertyValidation = (
  config: UsePropertyValidationConfig = {}
): UsePropertyValidationReturn => {
  const {
    debounceDelay = 300,
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = false,
    showErrors = true,
    clearErrorsOnChange = true
  } = config

  // 验证器实例
  const validatorRef = useRef<EnhancedPropertyValidator>(new EnhancedPropertyValidator())

  // 验证状态
  const [validationState, setValidationState] = useState<ValidationState>({
    errors: {},
    warnings: {},
    isValidating: false,
    isValid: true,
    touched: {},
    dirty: {}
  })

  // 当前值和模式引用
  const valuesRef = useRef<Record<string, any>>({})
  const schemasRef = useRef<Record<string, PropertySchema & { customRuleIds?: string[] }>>({})

  // 防抖验证函数
  const debouncedValidate = useCallback(
    useDebouncedCallback(async (
      fieldName: string,
      value: any,
      schema: PropertySchema & { customRuleIds?: string[] }
    ) => {
      setValidationState(prev => ({ ...prev, isValidating: true }))

      try {
        const result = await validatorRef.current.validateWithCustomRulesAsync(value, schema)

        setValidationState(prev => ({
          ...prev,
          isValidating: false,
          errors: {
            ...prev.errors,
            [fieldName]: result.errors
          },
          warnings: {
            ...prev.warnings,
            [fieldName]: result.warnings || []
          },
          isValid: Object.keys(prev.errors).every(key =>
            key === fieldName ? result.errors.length === 0 : prev.errors[key].length === 0
          )
        }))
      } catch (error) {
        console.error('Validation error:', error)
        setValidationState(prev => ({
          ...prev,
          isValidating: false,
          errors: {
            ...prev.errors,
            [fieldName]: [{
              code: 'VALIDATION_ERROR',
              message: '验证过程中发生错误',
              value
            }]
          }
        }))
      }
    }, debounceDelay),
    [debounceDelay]
  )

  // 验证单个字段
  const validateField = useCallback(async (
    fieldName: string,
    value: any,
    schema: PropertySchema & { customRuleIds?: string[] }
  ): Promise<ValidationResult> => {
    // 更新值引用
    valuesRef.current[fieldName] = value
    schemasRef.current[fieldName] = schema

    // 清除之前的错误（如果配置了）
    if (clearErrorsOnChange) {
      setValidationState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [fieldName]: []
        },
        warnings: {
          ...prev.warnings,
          [fieldName]: []
        }
      }))
    }

    // 执行验证
    if (validateOnChange) {
      await debouncedValidate(fieldName, value, schema)
    } else {
      const result = validatorRef.current.validateWithCustomRules(value, schema)
      setValidationState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [fieldName]: result.errors
        },
        warnings: {
          ...prev.warnings,
          [fieldName]: result.warnings || []
        }
      }))
      return result
    }

    return validatorRef.current.validateWithCustomRules(value, schema)
  }, [debouncedValidate, clearErrorsOnChange, validateOnChange])

  // 验证所有字段
  const validateAll = useCallback(async (
    values: Record<string, any>,
    schemas: Record<string, PropertySchema & { customRuleIds?: string[] }>
  ): Promise<Record<string, ValidationResult>> => {
    setValidationState(prev => ({ ...prev, isValidating: true }))

    try {
      const results = await validatorRef.current.validateMultipleWithCustomRulesAsync(values, schemas)

      const newErrors: Record<string, ValidationError[]> = {}
      const newWarnings: Record<string, ValidationError[]> = {}
      let isValid = true

      Object.entries(results).forEach(([fieldName, result]) => {
        newErrors[fieldName] = result.errors
        newWarnings[fieldName] = result.warnings || []
        if (result.errors.length > 0) {
          isValid = false
        }
      })

      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        errors: newErrors,
        warnings: newWarnings,
        isValid
      }))

      return results
    } catch (error) {
      console.error('Batch validation error:', error)
      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        isValid: false
      }))
      return {}
    }
  }, [])

  // 清除错误
  const clearErrors = useCallback((fieldName?: string) => {
    if (fieldName) {
      setValidationState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [fieldName]: []
        },
        warnings: {
          ...prev.warnings,
          [fieldName]: []
        }
      }))
    } else {
      setValidationState(prev => ({
        ...prev,
        errors: {},
        warnings: {}
      }))
    }
  }, [])

  // 设置字段触摸状态
  const setFieldTouched = useCallback((fieldName: string, touched: boolean) => {
    setValidationState(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [fieldName]: touched
      }
    }))
  }, [])

  // 设置字段脏状态
  const setFieldDirty = useCallback((fieldName: string, dirty: boolean) => {
    setValidationState(prev => ({
      ...prev,
      dirty: {
        ...prev.dirty,
        [fieldName]: dirty
      }
    }))
  }, [])

  // 便捷方法
  const getFieldError = useCallback((fieldName: string): ValidationError[] => {
    return validationState.errors[fieldName] || []
  }, [validationState.errors])

  const getFieldWarning = useCallback((fieldName: string): ValidationError[] => {
    return validationState.warnings[fieldName] || []
  }, [validationState.warnings])

  const hasFieldError = useCallback((fieldName: string): boolean => {
    return getFieldError(fieldName).length > 0
  }, [getFieldError])

  const hasFieldWarning = useCallback((fieldName: string): boolean => {
    return getFieldWarning(fieldName).length > 0
  }, [getFieldWarning])

  const isFieldValid = useCallback((fieldName: string): boolean => {
    return !hasFieldError(fieldName)
  }, [hasFieldError])

  const isFieldTouched = useCallback((fieldName: string): boolean => {
    return validationState.touched[fieldName] || false
  }, [validationState.touched])

  const isFieldDirty = useCallback((fieldName: string): boolean => {
    return validationState.dirty[fieldName] || false
  }, [validationState.dirty])

  // 触发验证
  const triggerValidation = useCallback(() => {
    Object.entries(valuesRef.current).forEach(([fieldName, value]) => {
      const schema = schemasRef.current[fieldName]
      if (schema) {
        validateField(fieldName, value, schema)
      }
    })
  }, [validateField])

  // 重置验证状态
  const resetValidation = useCallback(() => {
    setValidationState({
      errors: {},
      warnings: {},
      isValidating: false,
      isValid: true,
      touched: {},
      dirty: {}
    })
    valuesRef.current = {}
    schemasRef.current = {}
  }, [])

  return {
    // 状态
    errors: validationState.errors,
    warnings: validationState.warnings,
    isValidating: validationState.isValidating,
    isValid: validationState.isValid,
    touched: validationState.touched,
    dirty: validationState.dirty,

    // 方法
    validateField,
    validateAll,
    clearErrors,
    setFieldTouched,
    setFieldDirty,

    // 便捷方法
    getFieldError,
    getFieldWarning,
    hasFieldError,
    hasFieldWarning,
    isFieldValid,
    isFieldTouched,
    isFieldDirty,

    // 触发器
    triggerValidation,
    resetValidation
  }
}

/**
 * 简化的字段验证Hook
 */
export const useFieldValidation = (
  fieldName: string,
  value: any,
  schema: PropertySchema & { customRuleIds?: string[] },
  config: UsePropertyValidationConfig = {}
) => {
  const {
    validateField,
    clearErrors,
    setFieldTouched,
    setFieldDirty,
    getFieldError,
    getFieldWarning,
    hasFieldError,
    hasFieldWarning,
    isFieldValid,
    isFieldTouched,
    isFieldDirty,
    isValidating
  } = usePropertyValidation(config)

  // 当值变化时验证
  useEffect(() => {
    if (value !== undefined) {
      validateField(fieldName, value, schema)
      setFieldDirty(fieldName, true)
    }
  }, [value, fieldName, schema, validateField, setFieldDirty])

  // 处理blur事件
  const handleBlur = useCallback(() => {
    setFieldTouched(fieldName, true)
  }, [fieldName, setFieldTouched])

  // 处理change事件
  const handleChange = useCallback((newValue: any) => {
    validateField(fieldName, newValue, schema)
  }, [fieldName, schema, validateField])

  return {
    // 状态
    error: getFieldError(fieldName),
    warning: getFieldWarning(fieldName),
    hasError: hasFieldError(fieldName),
    hasWarning: hasFieldWarning(fieldName),
    isValid: isFieldValid(fieldName),
    isTouched: isFieldTouched(fieldName),
    isDirty: isFieldDirty(fieldName),
    isValidating,

    // 方法
    handleBlur,
    handleChange,
    clearErrors: () => clearErrors(fieldName)
  }
}

/**
 * 自定义验证规则Hook
 */
export const useCustomValidationRules = () => {
  const validatorRef = useRef<EnhancedPropertyValidator>(new EnhancedPropertyValidator())

  const addRule = useCallback((rule: CustomValidationRule) => {
    validatorRef.current.addCustomRule(rule)
  }, [])

  const removeRule = useCallback((id: string) => {
    return validatorRef.current.removeCustomRule(id)
  }, [])

  const getRules = useCallback(() => {
    return validatorRef.current.getAvailableRules()
  }, [])

  const getRulesByCategory = useCallback((category: string) => {
    return validatorRef.current.getRulesByCategory(category)
  }, [])

  return {
    addRule,
    removeRule,
    getRules,
    getRulesByCategory
  }
}