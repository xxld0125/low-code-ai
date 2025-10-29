/**
 * 页面设计器输入框组件
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import React, { useState, useCallback, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ComponentRendererProps, ComponentProps } from '@/types/page-designer/component'

export const PageInput: React.FC<ComponentRendererProps> = ({
  id,
  props,
  styles,
  isSelected,
  isDragging,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  const inputProps = useMemo(() => {
    const defaultInput: ComponentProps['input'] = {
      placeholder: '请输入内容',
      type: 'text',
      required: false,
      disabled: false,
      readOnly: false,
    }
    return props.input || defaultInput
  }, [props.input])

  const [value, setValue] = useState(inputProps?.value || '')
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)

      // 更新组件属性
      onUpdate?.(id, {
        props: {
          ...props,
          input: {
            ...inputProps!,
            value: newValue,
          } as ComponentProps['input'],
        },
      })
    },
    [id, inputProps, onUpdate, props]
  )

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect?.(id)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // 双击编辑或其他操作
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.stopPropagation()
      onDelete?.(id)
    }
  }

  const handleFocus = (e: React.FocusEvent) => {
    setIsFocused(true)
    e.stopPropagation()
  }

  const handleBlur = (e: React.FocusEvent) => {
    setIsFocused(false)
    e.stopPropagation()
  }

  // 合并默认样式和自定义样式
  const mergedStyles: React.CSSProperties = {
    width: styles.width || '100%',
    cursor: isDragging ? 'grabbing' : 'text',
    transition: styles.transition || 'all 0.2s ease-in-out',
    userSelect: 'none',
    // 过滤掉不兼容的样式属性
    boxShadow:
      styles.boxShadow && typeof styles.boxShadow === 'string' ? styles.boxShadow : undefined,
    background:
      styles.background && typeof styles.background === 'string' ? styles.background : undefined,
    border: styles.border && typeof styles.border === 'string' ? styles.border : undefined,
    borderRadius:
      styles.borderRadius && typeof styles.borderRadius !== 'boolean'
        ? styles.borderRadius
        : undefined,
    margin: styles.margin && typeof styles.margin === 'string' ? styles.margin : undefined,
    padding: styles.padding && typeof styles.padding === 'string' ? styles.padding : undefined,
    // 直接支持的标准CSS属性
    color: styles.color,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    fontFamily: styles.fontFamily,
    textAlign: styles.textAlign,
    textDecoration: styles.textDecoration,
    textTransform: styles.textTransform,
    lineHeight: styles.lineHeight,
    opacity: styles.opacity,
    position: styles.position,
    top: styles.top,
    right: styles.right,
    bottom: styles.bottom,
    left: styles.left,
    zIndex: styles.zIndex,
    display: styles.display,
    minWidth: styles.minWidth,
    minHeight: styles.minHeight,
    maxWidth: styles.maxWidth,
    maxHeight: styles.maxHeight,
  }

  return (
    <div
      data-component-id={id}
      data-component-type="input"
      style={mergedStyles}
      className={cn(
        'page-designer-input',
        'space-y-2',
        isSelected && 'rounded p-2 ring-2 ring-blue-500 ring-offset-2',
        isDragging && 'opacity-75',
        props.className
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="group"
      aria-label={inputProps?.label || '输入框'}
    >
      {inputProps?.label && (
        <Label
          htmlFor={`input-${id}`}
          className={cn(
            'text-sm font-medium',
            inputProps?.required && 'after:ml-1 after:text-red-500 after:content-["*"]',
            inputProps?.disabled && 'text-gray-500'
          )}
        >
          {inputProps.label}
        </Label>
      )}

      <Input
        id={`input-${id}`}
        type={inputProps?.type}
        placeholder={inputProps?.placeholder}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={inputProps?.disabled}
        readOnly={inputProps?.readOnly}
        required={inputProps?.required}
        maxLength={inputProps?.maxlength}
        minLength={inputProps?.minlength}
        pattern={inputProps?.pattern}
        className={cn(
          'transition-all duration-200',
          isFocused && 'ring-2 ring-blue-500',
          inputProps?.error && 'border-red-500 focus:ring-red-500',
          inputProps?.disabled && 'cursor-not-allowed bg-gray-100'
        )}
        aria-invalid={!!inputProps?.error}
        aria-describedby={
          inputProps?.error ? `error-${id}` : inputProps?.helper ? `helper-${id}` : undefined
        }
      />

      {inputProps?.error && (
        <p id={`error-${id}`} className="text-sm text-red-600" role="alert">
          {inputProps.error}
        </p>
      )}

      {inputProps?.helper && !inputProps?.error && (
        <p id={`helper-${id}`} className="text-sm text-gray-500">
          {inputProps.helper}
        </p>
      )}
    </div>
  )
}
