/**
 * 带实时验证的Textarea组件
 * 功能模块: 基础组件库 (004-basic-component-library) - T124任务
 * 创建日期: 2025-10-30
 * 用途: 提供实时验证功能的文本域组件
 */

import React, { useState, useCallback } from 'react'
import { Textarea } from './Textarea'
import { useFormValidation } from '@/lib/lowcode/validation/form-validation-hook'
import { FieldValidationErrorDisplay } from '@/components/lowcode/validation/ValidationErrorDisplay'
import { cn } from '@/lib/utils'
import type { ValidationRule } from '@/types/lowcode/property'

export interface ValidatedTextareaProps {
  // 基础属性
  name: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  defaultValue?: string
  rows?: number
  maxLength?: number
  className?: string

  // 验证配置
  validationRules?: ValidationRule[]
  validateOnChange?: boolean
  validateOnBlur?: boolean

  // 事件处理
  onChange?: (value: string, isValid: boolean) => void
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void

  // 显示配置
  showValidationIcon?: boolean
  showValidationMessage?: boolean
  showCharCount?: boolean
  hideErrorOnFocus?: boolean

  // 样式配置
  errorClassName?: string
  successClassName?: string
  containerClassName?: string
}

export const ValidatedTextarea: React.FC<ValidatedTextareaProps> = ({
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  readonly = false,
  defaultValue = '',
  rows = 3,
  maxLength,
  className,
  validationRules = [],
  validateOnChange = true,
  validateOnBlur = true,
  onChange,
  onBlur,
  onFocus,
  showValidationIcon = true,
  showValidationMessage = true,
  showCharCount = !!maxLength,
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
  const fieldValue = values[name] as string || ''
  const fieldError = errors[name]
  const isTouched = touched[name]
  const hasError = isTouched && !!fieldError
  const hasSuccess = isTouched && !fieldError && fieldValue.length > 0
  const showError = hasError && (!hideErrorOnFocus || !isFocused)
  const charCount = fieldValue.length
  const isOverLimit = maxLength && charCount > maxLength

  // 处理值变化
  const handleChange = useCallback((newValue: string) => {
    setFieldValue(name, newValue)

    // 触发外部onChange
    if (onChange) {
      onChange(newValue, !hasError)
    }
  }, [name, onChange, hasError, setFieldValue])

  // 处理焦点事件
  const handleFocus = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true)
    if (onFocus) {
      onFocus(e)
    }
  }, [onFocus])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
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

    if (hasError || isOverLimit) {
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
  const textareaClasses = cn(
    className,
    (hasError || isOverLimit) && (errorClassName || 'border-red-500 focus:border-red-500 focus:ring-red-500'),
    hasSuccess && !isOverLimit && (successClassName || 'border-green-500 focus:border-green-500 focus:ring-green-500'),
    showValidationIcon && 'pr-10' // 为图标留出空间
  )

  return (
    <div className={containerClasses}>
      {label && (
        <label
          htmlFor={name}
          className={cn(
            'block text-sm font-medium mb-1',
            (hasError || isOverLimit) ? 'text-red-700' : 'text-gray-700',
            required && 'after:content-["*"] after:ml-0.5 after:text-red-500'
          )}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <Textarea
          id={name}
          value={fieldValue}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readonly={readonly}
          rows={rows}
          maxlength={maxLength}
          error={showError ? fieldError : undefined}
          className={textareaClasses}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <ValidationIcon />
        </div>
      </div>

      {/* 字符计数和错误信息 */}
      <div className="mt-1 flex justify-between items-start">
        {showValidationMessage && showError && (
          <FieldValidationErrorDisplay
            error={fieldError}
            field={label}
            showIcon={showValidationIcon}
            className="text-sm"
          />
        )}

        {showCharCount && maxLength && (
          <span className={cn(
            'text-xs ml-auto',
            isOverLimit ? 'text-red-600' : 'text-gray-500'
          )}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>

      {/* 字符超限提示 */}
      {isOverLimit && (
        <FieldValidationErrorDisplay
          error="已超过最大字符限制"
          field={label}
          type="warning"
          showIcon={true}
          className="mt-1"
        />
      )}
    </div>
  )
}

export default ValidatedTextarea