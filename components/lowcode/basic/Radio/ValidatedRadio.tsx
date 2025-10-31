/**
 * 带实时验证的Radio组件
 * 功能模块: 基础组件库 (004-basic-component-library) - T124任务
 * 创建日期: 2025-10-30
 * 用途: 提供实时验证功能的单选框组件
 */

import React, { useState, useCallback } from 'react'
import { Radio } from './Radio'
import { useFormValidation } from '@/lib/lowcode/validation/form-validation-hook'
import { FieldValidationErrorDisplay } from '@/components/lowcode/validation/ValidationErrorDisplay'
import { cn } from '@/lib/utils'
import type { ValidationRule } from '@/types/lowcode/property'
import type { RadioOption as BaseRadioOption } from '@/types/lowcode/component'

export interface RadioOption extends BaseRadioOption {
  // 扩展基础RadioOption，保持兼容性
}

export interface ValidatedRadioProps {
  // 基础属性
  name: string
  label?: string
  required?: boolean
  disabled?: boolean
  defaultValue?: string | number
  options: RadioOption[]
  orientation?: 'horizontal' | 'vertical'
  className?: string

  // 验证配置
  validationRules?: ValidationRule[]
  validateOnChange?: boolean

  // 事件处理
  onChange?: (value: string, isValid: boolean) => void
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void
  onFocus?: (e: React.FocusEvent<HTMLDivElement>) => void

  // 显示配置
  showValidationIcon?: boolean
  showValidationMessage?: boolean
  hideErrorOnFocus?: boolean

  // 样式配置
  errorClassName?: string
  successClassName?: string
  containerClassName?: string
  optionClassName?: string
}

export const ValidatedRadio: React.FC<ValidatedRadioProps> = ({
  name,
  label,
  required = false,
  disabled = false,
  defaultValue = '',
  options = [],
  orientation = 'vertical',
  className,
  validationRules = [],
  validateOnChange = true,
  onChange,
  onBlur,
  onFocus,
  showValidationIcon = true,
  showValidationMessage = true,
  hideErrorOnFocus = false,
  errorClassName,
  successClassName,
  containerClassName,
  optionClassName,
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
    validateOnBlur: false, // Radio通常不需要失焦验证
  })

  // 当前字段状态
  const fieldValue = values[name] as string | number || ''
  const fieldError = errors[name]
  const isTouched = touched[name]
  const hasError = isTouched && !!fieldError
  const hasSuccess = isTouched && !fieldError && fieldValue !== ''
  const showError = hasError && (!hideErrorOnFocus || !isFocused)

  // 处理值变化
  const handleChange = useCallback((newValue: string) => {
    setFieldValue(name, newValue)
    setFieldTouched(name, true)

    // 触发外部onChange
    if (onChange) {
      onChange(newValue, !hasError)
    }
  }, [name, onChange, hasError, setFieldValue, setFieldTouched])

  // 处理焦点事件
  const handleFocus = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    setIsFocused(true)
    setFieldTouched(name, true)
    if (onFocus) {
      onFocus(e)
    }
  }, [onFocus, name, setFieldTouched])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    setIsFocused(false)

    if (onBlur) {
      onBlur(e)
    }
  }, [onBlur])

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

  // 选项容器样式
  const optionsContainerClasses = cn(
    orientation === 'horizontal' ? 'flex space-x-4' : 'space-y-2'
  )

  // 选项样式
  const optionClasses = cn(
    'flex items-center space-x-2',
    optionClassName
  )

  // 单选框样式
  const radioClasses = cn(
    className,
    hasError && (errorClassName || 'border-red-500 focus:border-red-500 focus:ring-red-500'),
    hasSuccess && (successClassName || 'border-green-500 focus:border-green-500 focus:ring-green-500')
  )

  return (
    <div className={containerClasses}>
      {label && (
        <label className={cn(
          'block text-sm font-medium mb-2',
          hasError ? 'text-red-700' : 'text-gray-700',
          required && 'after:content-["*"] after:ml-0.5 after:text-red-500'
        )}>
          {label}
        </label>
      )}

      <div className={optionsContainerClasses}>
        <Radio
          value={String(fieldValue)}
          options={options}
          required={required}
          disabled={disabled}
          className={radioClasses}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {/* 验证图标 */}
        {showValidationIcon && (
          <div className="flex items-center ml-2">
            <ValidationIcon />
          </div>
        )}
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

export default ValidatedRadio