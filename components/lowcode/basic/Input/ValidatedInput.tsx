/**
 * 带实时验证的Input组件
 * 功能模块: 基础组件库 (004-basic-component-library) - T124任务
 * 创建日期: 2025-10-30
 * 用途: 提供实时验证功能的输入框组件
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Input } from './Input'
import { useFormValidation } from '@/lib/lowcode/validation/form-validation-hook'
import { FieldValidationErrorDisplay } from '@/components/lowcode/validation/ValidationErrorDisplay'
import { VALIDATION_PRESETS, COMPONENT_VALIDATION_RULES } from '@/lib/lowcode/validation/validation-presets'
import { cn } from '@/lib/utils'
import type { ValidationRule } from '@/types/lowcode/property'

export interface ValidatedInputProps {
  // 基础属性
  name: string
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number'
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  defaultValue?: string
  className?: string

  // 验证配置
  validationRules?: ValidationRule[]
  validationPreset?: string
  inputType?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  validateOnChange?: boolean
  validateOnBlur?: boolean

  // 事件处理
  onChange?: (value: string, isValid: boolean) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void

  // 显示配置
  showValidationIcon?: boolean
  showValidationMessage?: boolean
  hideErrorOnFocus?: boolean

  // 样式配置
  errorClassName?: string
  successClassName?: string
  containerClassName?: string
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  readonly = false,
  defaultValue = '',
  className,
  validationRules = [],
  validationPreset,
  inputType = 'text',
  validateOnChange = true,
  validateOnBlur = true,
  onChange,
  onBlur,
  onFocus,
  showValidationIcon = true,
  showValidationMessage = true,
  hideErrorOnFocus = false,
  errorClassName,
  successClassName,
  containerClassName,
}) => {
  // 状态管理
  const [isFocused, setIsFocused] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  // 计算最终的验证规则
  const finalValidationRules = useMemo(() => {
    let rules = [...validationRules]

    // 如果有验证预设，添加预设规则
    if (validationPreset && validationPreset !== 'none') {
      const presetRules = VALIDATION_PRESETS[validationPreset as keyof typeof VALIDATION_PRESETS] || []
      rules = [...rules, ...presetRules]
    }

    // 根据输入类型添加相应规则
    if (inputType && inputType !== 'text') {
      const typeRules = COMPONENT_VALIDATION_RULES.input[inputType as keyof typeof COMPONENT_VALIDATION_RULES.input] || []
      rules = [...rules, ...typeRules]
    }

    // 如果必填但没有required规则，添加必填规则
    if (required && !rules.some(rule => rule.type === 'required')) {
      rules.unshift({
        type: 'required',
        message: '此字段为必填项',
        params: {},
      })
    }

    return rules
  }, [validationRules, validationPreset, inputType, required])

  // 表单验证Hook
  const {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    validateField,
  } = useFormValidation({
    initialValues: { [name]: defaultValue },
    validationRules: { [name]: finalValidationRules },
    validateOnChange,
    validateOnBlur,
  })

  // 当前字段状态
  const fieldValue = values[name] as string || ''
  const fieldError = errors[name]
  const isTouched = touched[name]
  const hasError = isTouched && !!fieldError
  const hasSuccess = isTouched && !fieldError && fieldValue.length > 0
  const showError = hasError && (!hideErrorOnFocus || !isFocused)

  // 处理值变化
  const handleChange = useCallback((newValue: string) => {
    setFieldValue(name, newValue)

    // 触发外部onChange
    if (onChange) {
      onChange(newValue, !hasError)
    }
  }, [name, onChange, hasError, setFieldValue])

  // 处理焦点事件
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    if (onFocus) {
      onFocus(e)
    }
  }, [onFocus])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    setFieldTouched(name, true)

    // 触发失焦验证
    if (validateOnBlur) {
      validateField(name)
    }

    if (onBlur) {
      onBlur(e)
    }
  }, [name, validateOnBlur, setFieldTouched, validateField, onBlur])

  // 验证图标
  const ValidationIcon = () => {
    if (!showValidationIcon) return null

    if (isValidating) {
      return (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
      )
    }

    if (hasError) {
      return (
        <svg
          className="h-4 w-4 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" />
          <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" />
        </svg>
      )
    }

    if (hasSuccess) {
      return (
        <svg
          className="h-4 w-4 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      )
    }

    return null
  }

  // 容器样式
  const containerClasses = cn(
    'relative',
    containerClassName
  )

  // 输入框样式
  const inputClasses = cn(
    className,
    hasError && (errorClassName || 'border-red-500 focus:border-red-500 focus:ring-red-500'),
    hasSuccess && (successClassName || 'border-green-500 focus:border-green-500 focus:ring-green-500'),
    showValidationIcon && 'pr-10' // 为图标留出空间
  )

  return (
    <div className={containerClasses}>
      {label && (
        <label
          htmlFor={name}
          className={cn(
            'block text-sm font-medium mb-1',
            hasError ? 'text-red-700' : 'text-gray-700',
            required && 'after:content-["*"] after:ml-0.5 after:text-red-500'
          )}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <Input
          id={name}
          type={type}
          value={fieldValue}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readonly={readonly}
          error={showError ? fieldError : undefined}
          className={inputClasses}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <ValidationIcon />
        </div>
      </div>

      {showValidationMessage && showError && (
        <FieldValidationErrorDisplay
          error={fieldError}
          field={label}
          showIcon={showValidationIcon}
          className="mt-1"
        />
      )}
    </div>
  )
}

export default ValidatedInput