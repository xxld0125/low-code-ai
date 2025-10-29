/**
 * Input 基础组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import { Input as ShadcnInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { InputProps } from '@/types/lowcode/component'

export interface LowcodeInputProps extends InputProps {
  className?: string
  id?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
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
      error,
      helper,
      className,
      id,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    // 确定是否为受控组件
    const isControlled = value !== undefined

    // 如果是受控组件使用value，否则使用defaultValue
    const inputValue = isControlled ? value : defaultValue
    // 生成唯一ID - 必须无条件调用Hook
    const generatedId = React.useId()
    const inputId = id || `input-${generatedId}`

    // 处理输入变化
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value

      // 如果有自定义onChange处理器，执行它
      if (onChange) {
        onChange(newValue)
      }
    }

    // 处理焦点事件
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (onFocus) {
        onFocus(e)
      }
    }

    // 处理失焦事件
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
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
    const errorId = error ? `${inputId}-error` : undefined

    return (
      <div className={cn('space-y-2', className)}>
        {/* 标签 */}
        {label && (
          <Label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              required && 'after:ml-0.5 after:text-red-500 after:content-["*"]',
              error && 'text-destructive'
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
            {...(error && { 'aria-invalid': 'true' })}
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
              error && 'border-destructive focus-visible:ring-destructive',

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
        {(error || helper) && (
          <div className="space-y-1">
            {error && (
              <p
                id={errorId}
                data-testid="error-message"
                className="flex items-center gap-1 text-sm text-destructive"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </p>
            )}
            {!error && helper && (
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

// 输入框验证Hook
export const useInputValidation = (
  value: string,
  rules: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: string
    custom?: (value: string) => string | null
  }
) => {
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const errors = []

    if (rules.required && !value.trim()) {
      errors.push('此字段为必填项')
    }

    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`最少需要输入${rules.minLength}个字符`)
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`最多只能输入${rules.maxLength}个字符`)
    }

    if (rules.pattern && value) {
      const regex = new RegExp(rules.pattern)
      if (!regex.test(value)) {
        errors.push('输入格式不正确')
      }
    }

    if (rules.custom) {
      const customError = rules.custom(value)
      if (customError) {
        errors.push(customError)
      }
    }

    setError(errors.length > 0 ? errors[0] : null)
  }, [value, rules])

  return error
}
