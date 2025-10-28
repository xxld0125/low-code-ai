/**
 * 页面设计器按钮组件
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { ComponentRendererProps } from '@/types/page-designer/component'
import { cn } from '@/lib/utils'

export const PageButton: React.FC<ComponentRendererProps> = ({
  id,
  props,
  styles,
  isSelected,
  isDragging,
  onSelect,
  onDelete,
}) => {
  const buttonProps = props.button || {
    text: '点击按钮',
    variant: 'primary',
    size: 'md',
    disabled: false,
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (buttonProps.onClick) {
      // 执行自定义事件处理
      console.log('Button click event:', buttonProps.onClick)
    }
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
    <Button
      data-component-id={id}
      data-component-type="button"
      variant={buttonProps.variant === 'primary' ? 'default' : buttonProps.variant}
      size={buttonProps.size === 'md' ? 'default' : buttonProps.size}
      disabled={buttonProps.disabled}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      style={mergedStyles}
      className={cn(
        'page-designer-button',
        'transition-all duration-200',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2',
        isDragging && 'opacity-75',
        'hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        props.className
      )}
      tabIndex={0}
      role="button"
      aria-label={buttonProps.text || '按钮'}
    >
      {buttonProps.loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}

      {buttonProps.icon && buttonProps.icon_position === 'left' && (
        <span className="mr-2">{buttonProps.icon}</span>
      )}

      <span className="select-none">{buttonProps.text}</span>

      {buttonProps.icon && buttonProps.icon_position === 'right' && (
        <span className="ml-2">{buttonProps.icon}</span>
      )}
    </Button>
  )
}

// 按钮预览组件（用于组件面板）
export const PageButtonPreview: React.FC<{
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
      <Button variant="outline" size="sm" disabled>
        按钮
      </Button>
    </div>
  )
}
