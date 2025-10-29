/**
 * 页面设计器卡片组件
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { ComponentRendererProps } from '@/types/page-designer/component'

export const PageCard: React.FC<ComponentRendererProps> = ({
  id,
  props,
  styles,
  isSelected,
  isDragging,
  onSelect,
  onDelete,
}) => {
  const cardProps = props.card || {
    title: '卡片标题',
    description: '卡片描述内容',
    variant: 'default',
    padding: 'medium',
    shadow: true,
    rounded: true,
    border: false,
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
      case 'outlined':
        return 'border border-gray-200 bg-white'
      case 'filled':
        return 'bg-gray-50 border-0'
      case 'elevated':
        return 'bg-white shadow-lg border-0'
      default:
        return 'bg-white border border-gray-200'
    }
  }

  // 获取内边距样式
  const getPaddingClass = (padding: string | undefined) => {
    switch (padding) {
      case 'none':
        return 'p-0'
      case 'small':
        return 'p-3'
      case 'large':
        return 'p-6'
      default:
        return 'p-4'
    }
  }

  // 获取圆角样式
  const getRoundedClass = (rounded: boolean | string | undefined) => {
    if (!rounded) return ''
    if (typeof rounded === 'boolean') {
      return rounded ? 'rounded-lg' : ''
    }
    return `rounded-${rounded}`
  }

  // 获取阴影样式
  const getShadowClass = (shadow: boolean | string | undefined) => {
    if (!shadow) return ''
    if (typeof shadow === 'boolean') {
      return shadow ? 'shadow-md' : ''
    }
    return `shadow-${shadow}`
  }

  return (
    <div
      data-component-id={id}
      data-component-type="card"
      style={mergedStyles}
      className={cn(
        'page-designer-card',
        'relative',
        'transition-all duration-200',
        getVariantClass(cardProps.variant),
        getPaddingClass(cardProps.padding),
        getRoundedClass(cardProps.rounded),
        getShadowClass(cardProps.shadow),
        isSelected && 'ring-2 ring-blue-500 ring-offset-2',
        isDragging && 'opacity-75',
        'hover:shadow-lg',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        props.className
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      aria-label={cardProps.title || '卡片'}
    >
      {/* 卡片头部 */}
      {cardProps.title && (
        <div className="mb-3">
          <h3 className="text-lg font-semibold leading-tight text-gray-900">{cardProps.title}</h3>
        </div>
      )}

      {/* 卡片内容 */}
      <div className="text-gray-600">
        {cardProps.description ? (
          <p className="text-sm leading-relaxed">{cardProps.description}</p>
        ) : (
          <div className="text-sm text-gray-400">卡片内容区域</div>
        )}
      </div>

      {/* 卡片操作区域 */}
      {props.children && <div className="mt-4 border-t border-gray-100 pt-3">{props.children}</div>}

      {/* 选中状态指示器 */}
      {isSelected && (
        <div className="absolute left-2 top-2 rounded bg-blue-500 px-2 py-1 text-xs text-white">
          卡片
        </div>
      )}
    </div>
  )
}

// 卡片预览组件（用于组件面板）
export const PageCardPreview: React.FC<{
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
        <div className="h-4 w-4 rounded-sm bg-gray-300"></div>
        <div className="flex flex-col">
          <div className="mb-1 h-2 w-12 rounded bg-gray-400"></div>
          <div className="h-1 w-8 rounded bg-gray-300"></div>
        </div>
      </div>
    </div>
  )
}
