/**
 * 带实时验证的Select组件
 * 功能模块: 基础组件库 (004-basic-component-library) - T124任务
 * 创建日期: 2025-10-30
 * 用途: 提供实时验证功能的选择器组件
 */

import React, { useState, useCallback } from 'react'
import { Select } from './Select'
import { useFormValidation } from '@/lib/lowcode/validation/form-validation-hook'
import { FieldValidationErrorDisplay } from '@/components/lowcode/validation/ValidationErrorDisplay'
import { cn } from '@/lib/utils'
import type { ValidationRule } from '@/types/lowcode/property'
import type { SelectOption as BaseSelectOption } from '@/types/lowcode/component'

export interface SelectOption extends BaseSelectOption {
  // 扩展基础SelectOption，保持兼容性
}

export interface ValidatedSelectProps {
  // 基础属性
  name: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  defaultValue?: string | number
  options: SelectOption[]
  className?: string

  // 验证配置
  validationRules?: ValidationRule[]
  validateOnChange?: boolean
  validateOnBlur?: boolean

  // 事件处理
  onChange?: (value: string, isValid: boolean) => void
  onBlur?: (e: React.FocusEvent<HTMLButtonElement>) => void
  onFocus?: (e: React.FocusEvent<HTMLButtonElement>) => void

  // 显示配置
  showValidationIcon?: boolean
  showValidationMessage?: boolean
  hideErrorOnFocus?: boolean

  // 样式配置
  errorClassName?: string
  successClassName?: string
  containerClassName?: string
}

export const ValidatedSelect: React.FC<ValidatedSelectProps> = ({
  name,
  label,
  placeholder = '请选择',
  required = false,
  disabled = false,
  defaultValue = '',
  options = [],
  className,
  validationRules = [],
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

  // 状态管理
  const [isValidating, setIsValidating] = useState(false)

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
    validationRules: { [name]: validationRules },
    validateOnChange,
    validateOnBlur,
  })

  // 当前字段状态
  const fieldValue = values[name] as string | number || ''
  const fieldError = errors[name]
  const isTouched = touched[name]
  const hasError = isTouched && !!fieldError
  const hasSuccess = isTouched && !fieldError && fieldValue !== ''
  const showError = hasError && (!hideErrorOnFocus || !isFocused)

  // 处理值变化
  const handleChange = useCallback((newValue: string | string[]) => {
    // 如果是数组，取第一个值（单选模式）
    const value = Array.isArray(newValue) ? newValue[0] : newValue
    setFieldValue(name, value)

    // 触发外部onChange
    if (onChange) {
      onChange(value, !hasError)
    }
  }, [name, onChange, hasError, setFieldValue])

  // 处理焦点事件
  const handleFocus = useCallback((e: React.FocusEvent<HTMLButtonElement>) => {
    setIsFocused(true)
    if (onFocus) {
      onFocus(e)
    }
  }, [onFocus])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLButtonElement>) => {
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

  // 选择框样式
  const selectClasses = cn(
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
        <Select
          id={name}
          value={String(fieldValue)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          options={options}
          error={showError ? fieldError : undefined}
          className={selectClasses}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
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

export default ValidatedSelect