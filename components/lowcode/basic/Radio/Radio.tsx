/**
 * Radio 基础组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { RadioProps, RadioOption } from '@/types/lowcode/component'

export interface LowcodeRadioProps extends RadioProps {
  className?: string
  id?: string
  direction?: 'vertical' | 'horizontal'
  onChange?: (value: string) => void
  onFocus?: (e: React.FocusEvent<HTMLDivElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void
  autoFocus?: boolean
}

export const Radio = React.forwardRef<HTMLDivElement, LowcodeRadioProps>(
  (
    {
      label,
      value = '',
      options = [],
      required = false,
      disabled = false,
      error,
      helper,
      direction = 'vertical',
      className,
      id,
      onChange,
      onFocus,
      onBlur,
      autoFocus = false,
      ...props
    },
    ref
  ) => {
    // 生成唯一ID - 必须无条件调用Hook
    const generatedId = React.useId()
    const radioId = id || `radio-${generatedId}`

    // 处理选择变更
    const handleValueChange = (newValue: string) => {
      if (onChange) {
        onChange(newValue)
      }
    }

    // 处理焦点事件
    const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
      if (onFocus) {
        onFocus(e)
      }
    }

    // 处理失焦事件
    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      if (onBlur) {
        onBlur(e)
      }
    }

    // 处理键盘事件
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === ' ' && !disabled) {
        e.preventDefault()
        // 找到第一个选中的选项或第一个可用选项
        const availableOptions = options.filter(opt => !opt.disabled)
        if (availableOptions.length > 0) {
          const currentValue = value
          const currentIndex = availableOptions.findIndex(opt => opt.value === currentValue)
          const nextIndex = (currentIndex + 1) % availableOptions.length
          handleValueChange(availableOptions[nextIndex].value)
        }
      }
    }

    // 检查选项是否有效
    const hasValidOptions = Array.isArray(options) && options.length > 0

    return (
      <div
        ref={ref}
        id={radioId}
        className={cn('space-y-3', className)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required}
        {...props}
      >
        {/* 标签 */}
        {label && (
          <Label
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              required && 'after:ml-0.5 after:text-red-500 after:content-["*"]',
              error && 'text-destructive'
            )}
            id={`${radioId}-label`}
          >
            {label}
          </Label>
        )}

        {/* 单选框组 */}
        <RadioGroup
          value={value}
          onValueChange={handleValueChange}
          disabled={disabled}
          required={required}
          className={cn(
            direction === 'horizontal' ? 'flex flex-row space-x-6' : 'space-y-3',
            disabled && 'opacity-50'
          )}
        >
          {hasValidOptions ? (
            options.map((option, index) => (
              <div
                key={option.value || index}
                className={cn(
                  'flex items-center space-x-2',
                  direction === 'horizontal' && 'whitespace-nowrap'
                )}
              >
                <RadioGroupItem
                  value={option.value}
                  id={`${radioId}-option-${index}`}
                  disabled={option.disabled || disabled}
                  autoFocus={autoFocus && index === 0}
                  data-testid="radio-input"
                  aria-checked={value === option.value ? 'true' : 'false'}
                  aria-disabled={option.disabled || disabled}
                  className={cn(
                    'h-4 w-4 rounded-full border border-primary text-primary',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                />
                <Label
                  htmlFor={`${radioId}-option-${index}`}
                  data-testid="radio-label"
                  className={cn(
                    'text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                    option.disabled || disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  )}
                >
                  {option.label}
                </Label>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">暂无选项</div>
          )}
        </RadioGroup>

        {/* 辅助文本 */}
        {(error || helper) && (
          <div className="space-y-1" id={`${radioId}-description`}>
            {error && (
              <p className="flex items-center gap-1 text-sm text-destructive">
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </p>
            )}
            {!error && helper && (
              <p className="flex items-start gap-1 text-sm text-muted-foreground">
                <svg
                  className="mt-0.5 h-4 w-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{helper}</span>
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Radio.displayName = 'LowcodeRadio'

// Radio验证Hook
export const useRadioValidation = (
  value: string,
  options: RadioOption[],
  required: boolean = false
) => {
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const errors = []

    if (required && !value) {
      errors.push('请选择一个选项')
    }

    // 验证选择的值是否在选项中
    if (value && options.length > 0) {
      const validValues = options.map(opt => opt.value)
      if (!validValues.includes(value)) {
        errors.push('选择了无效的选项')
      }
    }

    setError(errors.length > 0 ? errors[0] : null)
  }, [value, options, required])

  return error
}

// Radio选项管理Hook
export const useRadioOptions = (initialOptions: RadioOption[] = []) => {
  const [options, setOptions] = React.useState<RadioOption[]>(initialOptions)

  // 添加选项
  const addOption = (option: Omit<RadioOption, 'value'>) => {
    const newOption: RadioOption = {
      ...option,
      value: `option_${Date.now()}`,
    }
    setOptions(prev => [...prev, newOption])
  }

  // 删除选项
  const removeOption = (value: string) => {
    setOptions(prev => prev.filter(opt => opt.value !== value))
  }

  // 更新选项
  const updateOption = (value: string, updates: Partial<RadioOption>) => {
    setOptions(prev => prev.map(opt => (opt.value === value ? { ...opt, ...updates } : opt)))
  }

  // 重新排序选项
  const reorderOptions = (fromIndex: number, toIndex: number) => {
    setOptions(prev => {
      const newOptions = [...prev]
      const [moved] = newOptions.splice(fromIndex, 1)
      newOptions.splice(toIndex, 0, moved)
      return newOptions
    })
  }

  // 验证选项唯一性
  const validateUniqueness = () => {
    const values = options.map(opt => opt.value)
    const uniqueValues = new Set(values)
    return values.length === uniqueValues.size
  }

  return {
    options,
    setOptions,
    addOption,
    removeOption,
    updateOption,
    reorderOptions,
    validateUniqueness,
  }
}
