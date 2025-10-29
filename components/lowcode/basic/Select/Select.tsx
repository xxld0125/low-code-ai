/**
 * 页面设计器选择框组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ComponentRendererProps } from '@/types/page-designer/component'
import { cn } from '@/lib/utils'

export const PageSelect: React.FC<ComponentRendererProps> = ({
  id,
  props,
  styles,
  isSelected,
  isDragging,
  onSelect,
  onDelete,
}) => {
  const selectProps = props.select || {
    placeholder: '请选择',
    value: '',
    options: [
      { label: '选项 1', value: 'option1' },
      { label: '选项 2', value: 'option2' },
      { label: '选项 3', value: 'option3' },
    ],
    disabled: false,
  }

  const handleChange = (value: string) => {
    if (selectProps.onChange) {
      selectProps.onChange(value)
    }
    onSelect?.(id)
  }

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

  // 合并默认样式和自定义样式
  const mergedStyles: React.CSSProperties = {
    width: styles.width || 'auto',
    height: styles.height || 'auto',
    cursor: isDragging ? 'grabbing' : 'pointer',
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
      data-component-type="select"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      style={mergedStyles}
      className={cn(
        'page-designer-select',
        'transition-all duration-200',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2',
        isDragging && 'opacity-75',
        'hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        props.className
      )}
      tabIndex={0}
      role="combobox"
      aria-label={selectProps.label || '选择框'}
      aria-controls="select-dropdown"
      aria-expanded="false"
    >
      <Select
        value={selectProps.value}
        onValueChange={handleChange}
        disabled={selectProps.disabled}
      >
        <SelectTrigger className="w-full" onClick={e => e.stopPropagation()}>
          <SelectValue placeholder={selectProps.placeholder} />
        </SelectTrigger>
        <SelectContent id="select-dropdown" onClick={e => e.stopPropagation()}>
          {selectProps.options?.map((option: any, index: number) => (
            <SelectItem key={index} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// 选择框预览组件（用于组件面板）
export const PageSelectPreview: React.FC<{
  onClick?: () => void
}> = ({ onClick }) => {
  return (
    <div
      className="flex h-16 w-full cursor-pointer items-center justify-center rounded border border-gray-200 bg-white p-2 hover:border-blue-300 hover:bg-blue-50"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.()
        }
      }}
    >
      <div className="flex items-center space-x-2">
        <div className="h-8 w-16 rounded border border-gray-300 bg-gray-50 px-2 py-1">
          <div className="h-3 w-8 rounded bg-gray-200"></div>
        </div>
        <span className="text-sm text-gray-600">选择框</span>
      </div>
    </div>
  )
}
