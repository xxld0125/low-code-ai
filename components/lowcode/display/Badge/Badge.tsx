/**
 * 页面设计器徽章组件
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { ComponentRendererProps } from '@/types/page-designer/component'

export const PageBadge: React.FC<ComponentRendererProps> = ({
  id,
  props,
  styles,
  isSelected,
  isDragging,
  onSelect,
  onDelete,
}) => {
  const badgeProps = props.badge || {
    text: '徽章',
    variant: 'default',
    size: 'medium',
    rounded: true,
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
    cursor: isDragging ? 'grabbing' : 'pointer',
    transition: styles.transition || 'all 0.2s ease-in-out',
    userSelect: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    width: styles.width,
    height: styles.height,
    minWidth: styles.minWidth,
    minHeight: styles.minHeight,
    maxWidth: styles.maxWidth,
    maxHeight: styles.maxHeight,
  }

  // 获取变体样式
  const getVariantClass = (variant: string | undefined) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 text-white border-0'
      case 'secondary':
        return 'bg-gray-100 text-gray-700 border-0'
      case 'success':
        return 'bg-green-500 text-white border-0'
      case 'warning':
        return 'bg-yellow-500 text-white border-0'
      case 'error':
        return 'bg-red-500 text-white border-0'
      case 'outline':
        return 'border border-gray-300 text-gray-700 bg-white'
      default:
        return 'bg-blue-500 text-white border-0'
    }
  }

  // 获取尺寸样式
  const getSizeClass = (size: string | undefined) => {
    switch (size) {
      case 'small':
        return 'px-2 py-1 text-xs'
      case 'large':
        return 'px-4 py-2 text-base'
      default:
        return 'px-3 py-1 text-sm'
    }
  }

  // 获取圆角样式
  const getRoundedClass = (rounded: boolean | string | undefined) => {
    if (!rounded) return ''
    if (typeof rounded === 'boolean') {
      return rounded ? 'rounded-full' : ''
    }
    return `rounded-${rounded}`
  }

  return (
    <span
      data-component-id={id}
      data-component-type="badge"
      style={mergedStyles}
      className={cn(
        'page-designer-badge',
        'inline-flex',
        'items-center',
        'justify-center',
        'font-medium',
        'transition-all duration-200',
        getVariantClass(badgeProps.variant),
        getSizeClass(badgeProps.size),
        getRoundedClass(badgeProps.rounded),
        isSelected && 'ring-2 ring-blue-500 ring-offset-2',
        isDragging && 'opacity-75',
        'hover:opacity-90',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        props.className
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="status"
      aria-label={badgeProps.text || '徽章'}
    >
      {badgeProps.text || '徽章'}

      {/* 选中状态指示器 */}
      {isSelected && <span className="ml-1 inline-block h-2 w-2 rounded-full bg-blue-200"></span>}
    </span>
  )
}

// 徽章预览组件（用于组件面板）
export const PageBadgePreview: React.FC<{
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
        <div className="inline-flex h-5 w-8 items-center justify-center rounded-full bg-blue-500 px-2">
          <div className="h-1 w-4 rounded bg-white"></div>
        </div>
        <span className="text-sm text-gray-700">徽章</span>
      </div>
    </div>
  )
}
