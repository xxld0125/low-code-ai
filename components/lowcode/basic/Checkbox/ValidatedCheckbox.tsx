/**
 * 带实时验证的Checkbox组件
 * 功能模块: 基础组件库 (004-basic-component-library) - T124任务
 * 创建日期: 2025-10-30
 * 用途: 提供实时验证功能的复选框组件
 */

import React, { useState, useCallback } from 'react'
import { Checkbox } from './Checkbox'
import { useFormValidation } from '@/lib/lowcode/validation/form-validation-hook'
import { FieldValidationErrorDisplay } from '@/components/lowcode/validation/ValidationErrorDisplay'
import { cn } from '@/lib/utils'
import type { ValidationRule } from '@/types/lowcode/property'

export interface ValidatedCheckboxProps {
  // 基础属性
  name: string
  label?: string
  required?: boolean
  disabled?: boolean
  defaultValue?: boolean
  className?: string

  // 验证配置
  validationRules?: ValidationRule[]
  validateOnChange?: boolean

  // 事件处理
  onChange?: (checked: boolean, isValid: boolean) => void
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void

  // 显示配置
  showValidationIcon?: boolean
  showValidationMessage?: boolean
  hideErrorOnFocus?: boolean

  // 样式配置
  errorClassName?: string
  successClassName?: string
  containerClassName?: string
}

export const ValidatedCheckbox: React.FC<ValidatedCheckboxProps> = ({
  name,
  label,
  required = false,
  disabled = false,
  defaultValue = false,
  className,
  validationRules = [],
  validateOnChange = true,
  onChange,
  onClick,
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
    validateOnBlur: false, // Checkbox通常不需要失焦验证
  })

  // 当前字段状态
  const fieldValue = values[name] as boolean || false
  const fieldError = errors[name]
  const isTouched = touched[name]
  const hasError = isTouched && !!fieldError
  const hasSuccess = isTouched && !fieldError && fieldValue
  const showError = hasError && (!hideErrorOnFocus || !isFocused)

  // 处理值变化
  const handleChange = useCallback((newChecked: boolean) => {
    setFieldValue(name, newChecked)

    // 触发外部onChange
    if (onChange) {
      onChange(newChecked, !hasError)
    }
  }, [name, onChange, hasError, setFieldValue])

  // 处理点击事件（用于标记为touched）
  const handleClick = useCallback(() => {
    setIsFocused(true)
    setFieldTouched(name, true)
  }, [name, setFieldTouched])

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

  // 复选框样式
  const checkboxClasses = cn(
    className,
    hasError && (errorClassName || 'border-red-500 focus:border-red-500 focus:ring-red-500'),
    hasSuccess && (successClassName || 'border-green-500 focus:border-green-500 focus:ring-green-500')
  )

  return (
    <div className={containerClasses}>
      <div className="flex items-start space-x-2">
        <div className="flex items-center h-5">
          <div className="relative">
            <Checkbox
              id={name}
              checked={fieldValue}
              required={required}
              disabled={disabled}
              className={checkboxClasses}
              onChange={handleChange}
            />

            {showValidationIcon && (
              <div className="absolute -right-5 top-0 flex items-center">
                <ValidationIcon />
              </div>
            )}
          </div>
        </div>

        {label && (
          <label
            htmlFor={name}
            className={cn(
              'text-sm font-medium cursor-pointer',
              hasError ? 'text-red-700' : 'text-gray-700',
              required && 'after:content-["*"] after:ml-0.5 after:text-red-500'
            )}
          >
            {label}
          </label>
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

export default ValidatedCheckbox