/**
 * Select 基础组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { SelectProps, SelectOption } from '@/types/lowcode/component'

export interface LowcodeSelectProps extends SelectProps {
  className?: string
  id?: string
  onChange?: (value: string | string[]) => void
  onFocus?: (e: React.FocusEvent<HTMLButtonElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLButtonElement>) => void
  loading?: boolean
}

export const Select = React.forwardRef<HTMLButtonElement, LowcodeSelectProps>(
  (
    {
      label,
      placeholder = '请选择...',
      value,
      options = [],
      required = false,
      disabled = false,
      multiple = false,
      error,
      helper,
      className,
      id,
      onChange,
      onFocus,
      onBlur,
      loading = false,
      ...props
    },
    ref
  ) => {
    // 生成唯一ID - 必须无条件调用Hook
    const generatedId = React.useId()
    const selectId = id || `select-${generatedId}`

    // 处理选择变更
    const handleValueChange = (newValue: string) => {
      if (multiple) {
        // 多选模式
        const currentValues = Array.isArray(value) ? value : value ? [value] : []
        const updatedValues = currentValues.includes(newValue)
          ? currentValues.filter(v => v !== newValue)
          : [...currentValues, newValue]

        if (onChange) {
          onChange(updatedValues)
        }
      } else {
        // 单选模式
        if (onChange) {
          onChange(newValue)
        }
      }
    }

    // 处理焦点事件
    const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
      if (onFocus) {
        onFocus(e)
      }
    }

    // 处理失焦事件
    const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
      if (onBlur) {
        onBlur(e)
      }
    }

    // 过滤和验证选项
    const filteredOptions = loading ? [] : options

    // 分组选项
    const groupedOptions = filteredOptions.reduce(
      (acc, option) => {
        const group = option.group || 'default'
        if (!acc[group]) {
          acc[group] = []
        }
        acc[group].push(option)
        return acc
      },
      {} as Record<string, SelectOption[]>
    )

    // 获取显示值
    const getDisplayValue = () => {
      if (multiple) {
        const selectedValues = Array.isArray(value) ? value : value ? [value] : []
        if (selectedValues.length === 0) return placeholder
        if (selectedValues.length === 1) {
          const option = options.find(opt => opt.value === selectedValues[0])
          return option?.label || selectedValues[0]
        }
        return `已选择 ${selectedValues.length} 项`
      } else {
        if (!value) return placeholder
        const option = options.find(opt => opt.value === value)
        return option?.label || value
      }
    }

    // 检查是否有分组
    const hasGroups =
      Object.keys(groupedOptions).length > 1 || Object.keys(groupedOptions)[0] !== 'default'

    return (
      <div className={cn('space-y-2', className)}>
        {/* 标签 */}
        {label && (
          <Label
            htmlFor={selectId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              required && 'after:ml-0.5 after:text-red-500 after:content-["*"]',
              error && 'text-destructive'
            )}
          >
            {label}
          </Label>
        )}

        {/* 选择器 */}
        <ShadcnSelect
          value={multiple ? undefined : (value as string)}
          onValueChange={handleValueChange}
          disabled={disabled}
          required={required}
        >
          <SelectTrigger
            ref={ref}
            id={selectId}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled || loading}
            data-testid="select"
            aria-invalid={error ? 'true' : 'false'}
            aria-required={required}
            aria-describedby={error || helper ? `${selectId}-description` : undefined}
            className={cn(
              // 基础样式
              'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',

              // 错误状态
              error && 'border-destructive focus:ring-destructive',

              // 多选模式特殊样式
              multiple && 'h-auto min-h-[40px] flex-wrap gap-1 py-1.5',

              // 加载状态
              loading && 'opacity-50'
            )}
            {...props}
          >
            {multiple ? (
              <div className="flex flex-wrap gap-1">
                {getDisplayValue() !== placeholder && (
                  <span className="text-sm">{getDisplayValue()}</span>
                )}
                <SelectValue placeholder={placeholder} />
              </div>
            ) : (
              <SelectValue placeholder={placeholder} />
            )}
          </SelectTrigger>

          <SelectContent>
            {hasGroups ? (
              // 分组显示
              Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                <React.Fragment key={groupName}>
                  {groupName !== 'default' && (
                    <>
                      <SelectLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        {groupName}
                      </SelectLabel>
                      <SelectSeparator />
                    </>
                  )}
                  <SelectGroup>
                    {groupOptions.map(option => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                        className={cn(
                          'cursor-pointer',
                          multiple &&
                            Array.isArray(value) &&
                            value.includes(option.value) &&
                            'bg-accent'
                        )}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  {groupName !== 'default' && <SelectSeparator />}
                </React.Fragment>
              ))
            ) : (
              // 无分组显示
              <SelectGroup>
                {options.map(option => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={cn(
                      'cursor-pointer',
                      multiple &&
                        Array.isArray(value) &&
                        value.includes(option.value) &&
                        'bg-accent'
                    )}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}

            {/* 加载状态提示 */}
            {loading && (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
                  <span>加载中...</span>
                </div>
              </div>
            )}

            {/* 无选项时的提示 */}
            {!loading && filteredOptions.length === 0 && (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                {options.length === 0 ? '暂无可选选项' : '没有匹配的选项'}
              </div>
            )}
          </SelectContent>
        </ShadcnSelect>

        {/* 辅助文本 */}
        {(error || helper) && (
          <div className="space-y-1" id={`${selectId}-description`}>
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

        {/* 多选模式的已选项显示 */}
        {multiple && Array.isArray(value) && value.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {value.map(selectedValue => {
              const option = options.find(opt => opt.value === selectedValue)
              return (
                <span
                  key={selectedValue}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                >
                  {option?.label || selectedValue}
                  <button
                    type="button"
                    onClick={() => handleValueChange(selectedValue)}
                    className="ml-1 hover:text-destructive"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              )
            })}
          </div>
        )}
      </div>
    )
  }
)

Select.displayName = 'LowcodeSelect'

// 选项搜索Hook
export const useSelectSearch = (options: SelectOption[], searchTerm: string) => {
  return React.useMemo(() => {
    if (!searchTerm.trim()) return options

    const lowerSearchTerm = searchTerm.toLowerCase()
    return options.filter(
      option =>
        option.label.toLowerCase().includes(lowerSearchTerm) ||
        option.value.toLowerCase().includes(lowerSearchTerm)
    )
  }, [options, searchTerm])
}

// 选项验证Hook
export const useSelectValidation = (
  value: string | string[],
  options: SelectOption[],
  required: boolean = false
) => {
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const errors = []

    if (required) {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          errors.push('请至少选择一个选项')
        }
      } else {
        if (!value) {
          errors.push('请选择一个选项')
        }
      }
    }

    // 验证选择的值是否在选项中
    const validateValues = (values: string[]) => {
      const validValues = options.map(opt => opt.value)
      const invalidValues = values.filter(v => !validValues.includes(v))
      if (invalidValues.length > 0) {
        errors.push(`选择了无效的选项: ${invalidValues.join(', ')}`)
      }
    }

    if (Array.isArray(value)) {
      validateValues(value)
    } else if (value) {
      validateValues([value])
    }

    setError(errors.length > 0 ? errors[0] : null)
  }, [value, options, required])

  return error
}
