/**
 * Input 基础组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import { Input as ShadcnInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldValidationErrorDisplay } from '@/components/lowcode/validation/ValidationErrorDisplay'
import { useInputValidation } from '@/hooks/useComponentValidation'
import { cn } from '@/lib/utils'
import type { InputProps } from '@/types/lowcode/component'

export interface LowcodeInputProps extends Omit<InputProps, 'error'> {
  className?: string
  id?: string
  defaultValue?: string
  value?: string

  // 事件处理
  onChange?: (value: string) => void
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void

  // 验证相关
  error?: string // 向后兼容的错误属性
  useValidation?: boolean // 是否启用验证Hook
  validateOnChange?: boolean
  validateOnBlur?: boolean
  customValidator?: (value: unknown) => string | null
}

export const Input = React.forwardRef<HTMLInputElement, LowcodeInputProps>(
  (
    {
      label,
      placeholder = '请输入内容',
      type = 'text',
      value,
      defaultValue,
      required = false,
      disabled = false,
      readonly = false,
      maxlength,
      minlength,
      pattern,
      error: externalError,
      helper,
      className,
      id,
      onChange,
      onFocus,
      onBlur,
      useValidation = false,
      validateOnChange = true,
      validateOnBlur = true,
      customValidator,
      ...props
    },
    ref
  ) => {
    // 使用验证Hook（如果启用）
    const validation = useInputValidation({
      required,
      minLength: minlength,
      maxLength: maxlength,
      pattern,
      type,
      customValidator,
      initialValue: value !== undefined ? value : defaultValue,
      validateOnChange: useValidation ? validateOnChange : false,
      validateOnBlur: useValidation ? validateOnBlur : false,
    })

    // 确定是否为受控组件
    const isControlled = value !== undefined || useValidation

    // 如果启用了验证，使用验证Hook的值，否则使用传入的值
    const inputValue = useValidation
      ? (validation.value as string)
      : isControlled
        ? value
        : defaultValue

    // 生成唯一ID - 必须无条件调用Hook
    const generatedId = React.useId()
    const inputId = id || `input-${generatedId}`

    // 确定最终使用的错误信息
    const displayError = useValidation ? validation.error : externalError

    // 处理输入变化
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value

      // 如果启用了验证，先更新验证状态
      if (useValidation) {
        validation.onChange(newValue)
      }

      // 如果有自定义onChange处理器，执行它
      if (onChange) {
        onChange(newValue)
      }
    }

    // 处理焦点事件
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // 如果启用了验证，调用验证Hook的onFocus
      if (useValidation) {
        validation.onFocus()
      }

      if (onFocus) {
        onFocus(e)
      }
    }

    // 处理失焦事件
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // 如果启用了验证，调用验证Hook的onBlur
      if (useValidation) {
        validation.onBlur()
      }

      if (onBlur) {
        onBlur(e)
      }
    }

    // 获取输入类型对应的HTML5验证属性
    const getInputTypeProps = () => {
      const typeProps: any = {}

      switch (type) {
        case 'email':
          typeProps.inputMode = 'email'
          break
        case 'tel':
          typeProps.inputMode = 'tel'
          break
        case 'url':
          typeProps.inputMode = 'url'
          break
        case 'number':
          typeProps.inputMode = 'numeric'
          break
        default:
          typeProps.inputMode = 'text'
      }

      return typeProps
    }

    // 生成唯一的辅助文本ID
    const helperId = helper ? `${inputId}-helper` : undefined
    const errorId = displayError ? `${inputId}-error` : undefined

    return (
      <div className={cn('space-y-2', className)}>
        {/* 标签 */}
        {label && (
          <Label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              required && 'after:ml-0.5 after:text-red-500 after:content-["*"]',
              displayError && 'text-destructive'
            )}
          >
            {label}
          </Label>
        )}

        {/* 输入框 */}
        <div className="relative">
          <ShadcnInput
            id={inputId}
            type={type}
            {...(isControlled ? { value: inputValue } : { defaultValue: inputValue })}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readonly}
            maxLength={maxlength}
            minLength={minlength}
            pattern={pattern}
            required={required}
            ref={ref}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            data-testid="input"
            {...(displayError && { 'aria-invalid': 'true' })}
            aria-describedby={cn(helperId, errorId)}
            tabIndex={disabled ? -1 : 0}
            className={cn(
              // 基础样式
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'read-only:cursor-default read-only:bg-muted/50',

              // 错误状态
              displayError && 'border-destructive focus-visible:ring-destructive',

              // 不同类型的样式调整
              type === 'password' && 'font-mono',
              type === 'number' && 'font-mono',
              type === 'email' && 'lowercase',
              type === 'url' && 'lowercase'
            )}
            {...getInputTypeProps()}
            {...props}
          />

          {/* 字符计数器 */}
          {maxlength && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {inputValue?.length || 0}/{maxlength}
            </div>
          )}
        </div>

        {/* 辅助文本 */}
        {(displayError || helper) && (
          <div className="space-y-1">
            {displayError && (
              <FieldValidationErrorDisplay
                error={displayError}
                field={label}
                type="error"
                showIcon={true}
                className="text-sm"
              />
            )}
            {!displayError && helper && (
              <p id={helperId} data-testid="helper-text" className="text-sm text-muted-foreground">
                {helper}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'LowcodeInput'
