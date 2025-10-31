/**
 * Textarea 基础组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FieldValidationErrorDisplay } from '@/components/lowcode/validation/ValidationErrorDisplay'
import { cn } from '@/lib/utils'
import type { TextareaProps } from '@/types/lowcode/component'

export interface LowcodeTextareaProps extends TextareaProps {
  className?: string
  style?: React.CSSProperties
  id?: string
  onChange?: (value: string) => void
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  tabIndex?: number
  autoFocus?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, LowcodeTextareaProps>(
  (
    {
      label,
      placeholder = '请输入内容...',
      value = '',
      rows = 4,
      required = false,
      disabled = false,
      readonly = false,
      maxlength,
      error,
      helper,
      resize = 'vertical',
      className,
      style,
      id,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      tabIndex,
      autoFocus = false,
      ...props
    },
    ref
  ) => {
    // 生成唯一ID - 必须无条件调用Hook
    const generatedId = React.useId()
    const textareaId = id || `textarea-${generatedId}`

    // 处理输入变化
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value

      // 如果有自定义onChange处理器，执行它
      if (onChange) {
        onChange(newValue)
      }
    }

    // 处理焦点事件
    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (onFocus) {
        onFocus(e)
      }
    }

    // 处理失焦事件
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (onBlur) {
        onBlur(e)
      }
    }

    // 处理键盘事件 - 支持Tab缩进
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // 处理Tab键缩进
      if (e.key === 'Tab' && !e.shiftKey && !disabled && !readonly) {
        e.preventDefault()
        const target = e.currentTarget
        const start = target.selectionStart
        const end = target.selectionEnd
        const newValue = value.substring(0, start) + '  ' + value.substring(end)

        if (onChange) {
          onChange(newValue)
        }

        // 设置光标位置
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 2
        }, 0)
      }

      // 调用外部键盘事件处理器
      if (onKeyDown) {
        onKeyDown(e)
      }
    }

    // 获取resize样式
    const getResizeClass = () => {
      switch (resize) {
        case 'none':
          return 'resize-none'
        case 'horizontal':
          return 'resize-x'
        case 'vertical':
          return 'resize-y'
        case 'both':
          return 'resize'
        default:
          return 'resize-y'
      }
    }

    // 计算字符数
    const characterCount = value?.length || 0
    const isOverLimit = maxlength && characterCount > maxlength

    return (
      <div className={cn('space-y-2', className)} style={style}>
        {/* 标签 */}
        {label && (
          <Label
            htmlFor={textareaId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              required && 'after:ml-0.5 after:text-red-500 after:content-["*"]',
              error && 'text-destructive'
            )}
          >
            {label}
          </Label>
        )}

        {/* 文本域 */}
        <div className="relative">
          <ShadcnTextarea
            id={textareaId}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readonly}
            maxLength={maxlength}
            required={required}
            rows={rows}
            ref={ref}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            tabIndex={tabIndex}
            autoFocus={autoFocus}
            data-testid="textarea"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error || helper ? `${textareaId}-description` : undefined}
            aria-required={required}
            className={cn(
              // 基础样式
              'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'read-only:cursor-default read-only:bg-muted/50',

              // 调整大小样式
              getResizeClass(),

              // 错误状态
              error && 'border-destructive focus-visible:ring-destructive',

              // 超出字符限制时的样式
              isOverLimit && 'border-destructive text-destructive',

              // 只读状态特殊样式
              readonly && 'border-muted bg-muted/30'
            )}
            {...props}
          />

          {/* 字符计数器 */}
          {maxlength && (
            <div
              className={cn(
                'absolute bottom-2 right-3 text-xs',
                isOverLimit ? 'font-medium text-destructive' : 'text-muted-foreground'
              )}
            >
              {characterCount}/{maxlength}
            </div>
          )}
        </div>

        {/* 辅助文本 */}
        {(error || helper) && (
          <div className="space-y-1" id={`${textareaId}-description`}>
            {error && (
              <FieldValidationErrorDisplay
                error={error}
                field={label}
                type="error"
                showIcon={true}
                className="text-sm"
              />
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

        {/* 超出字符限制的警告 */}
        {isOverLimit && (
          <p className="flex items-center gap-1 text-xs text-destructive">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            已超出字符限制
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'LowcodeTextarea'

// 自动调整高度的Textarea Hook
export const useAutoResize = (
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  value: string,
  minRows: number = 3,
  maxRows: number = 10
) => {
  React.useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // 保存原始样式
    const originalOverflow = textarea.style.overflow
    const originalHeight = textarea.style.height

    // 临时重置高度以计算内容高度
    textarea.style.overflow = 'hidden'
    textarea.style.height = 'auto'

    // 计算行高
    const computedStyle = window.getComputedStyle(textarea)
    const lineHeight = parseInt(computedStyle.lineHeight) || 20
    const paddingTop = parseInt(computedStyle.paddingTop) || 8
    const paddingBottom = parseInt(computedStyle.paddingBottom) || 8
    const borderTop = parseInt(computedStyle.borderTopWidth) || 1
    const borderBottom = parseInt(computedStyle.borderBottomWidth) || 1

    // 计算内容行数
    const contentRows = Math.ceil(
      (textarea.scrollHeight - paddingTop - paddingBottom - borderTop - borderBottom) / lineHeight
    )

    // 限制行数范围
    const targetRows = Math.max(minRows, Math.min(contentRows, maxRows))
    const targetHeight =
      targetRows * lineHeight + paddingTop + paddingBottom + borderTop + borderBottom

    // 设置目标高度
    textarea.style.height = `${targetHeight}px`

    // 如果达到最大行数，允许滚动
    if (contentRows >= maxRows) {
      textarea.style.overflow = 'auto'
    } else {
      textarea.style.overflow = originalOverflow
    }
  }, [textareaRef, value, minRows, maxRows])
}

// 字符计数Hook
export const useCharacterCount = (value: string, maxLength?: number) => {
  const count = value.length
  const remaining = maxLength ? maxLength - count : undefined
  const isOverLimit = maxLength ? count > maxLength : false
  const percentage = maxLength ? (count / maxLength) * 100 : 0

  return {
    count,
    remaining,
    isOverLimit,
    percentage,
    getStatus: () => {
      if (!maxLength) return 'normal'
      if (isOverLimit) return 'error'
      if (percentage > 90) return 'warning'
      if (percentage > 70) return 'notice'
      return 'normal'
    },
  }
}
