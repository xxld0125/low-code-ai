/**
 * Checkbox 基础组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import { Checkbox as ShadcnCheckbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { FieldValidationErrorDisplay } from '@/components/lowcode/validation/ValidationErrorDisplay'
import { cn } from '@/lib/utils'
import type { CheckboxProps } from '@/types/lowcode/component'

export interface LowcodeCheckboxProps extends CheckboxProps {
  className?: string
  id?: string
  onChange?: (checked: boolean) => void
  autoFocus?: boolean
}

export const Checkbox = React.forwardRef<HTMLButtonElement, LowcodeCheckboxProps>(
  (
    {
      label,
      checked = false,
      indeterminate = false,
      disabled = false,
      required = false,
      error,
      helper,
      className,
      id,
      onChange,
      autoFocus = false,
      ...props
    },
    ref
  ) => {
    // 生成唯一ID - 必须无条件调用Hook
    const generatedId = React.useId()
    const checkboxId = id || `checkbox-${generatedId}`

    // 处理变更
    const handleChange = (checked: boolean) => {
      if (onChange) {
        onChange(checked)
      }
    }

    // 处理键盘事件 - shadcn组件已经处理了键盘事件，这里只处理特殊情况
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      // 如果需要额外的键盘处理逻辑，可以在这里添加
      // shadcn的Checkbox组件已经处理了空格键和Enter键
    }

    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-start space-x-2">
          <ShadcnCheckbox
            id={checkboxId}
            checked={checked}
            ref={ref}
            disabled={disabled}
            onCheckedChange={handleChange}
            autoFocus={autoFocus}
            data-testid="checkbox-input"
            className={cn(
              'mt-0.5',
              error && 'border-destructive',
              indeterminate && 'data-[state=indeterminate]:bg-muted'
            )}
            {...Object.fromEntries(
              Object.entries(props).filter(
                ([key]) =>
                  ![
                    'aria-invalid',
                    'aria-required',
                    'aria-disabled',
                    'aria-checked',
                    'error',
                    'required',
                  ].includes(key)
              )
            )}
            aria-checked={checked ? 'true' : 'false'}
            aria-invalid={error ? 'true' : 'false'}
            aria-required={required}
            aria-disabled={disabled}
          />

          {label && (
            <Label
              htmlFor={checkboxId}
              data-testid="checkbox-label"
              className={cn(
                'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                required && 'after:ml-0.5 after:text-red-500 after:content-["*"]',
                disabled && 'cursor-not-allowed opacity-50',
                error && 'text-destructive',
                !disabled && 'cursor-pointer'
              )}
            >
              {label}
            </Label>
          )}
        </div>

        {/* 辅助文本 */}
        {(error || helper) && (
          <div className="ml-6 space-y-1">
            {error && (
              <FieldValidationErrorDisplay
                error={error}
                field={label}
                type="error"
                showIcon={true}
                className="text-sm"
              />
            )}
            {!error && helper && <p className="text-sm text-muted-foreground">{helper}</p>}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'LowcodeCheckbox'
