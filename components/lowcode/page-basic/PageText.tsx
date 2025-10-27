/**
 * 页面设计器文本组件
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { ComponentRendererProps } from '@/types/page-designer/component'

export const PageText: React.FC<ComponentRendererProps> = ({
  id,
  props,
  styles,
  isSelected,
  isDragging,
  onSelect,
  onDelete,
}) => {
  const textProps = props.text || {
    content: '文本内容',
    variant: 'body',
    weight: 'normal',
    size: 'base',
    align: 'left',
    decoration: 'none',
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

  // 获取文本标签类型
  const getTextTag = (variant: string) => {
    switch (variant) {
      case 'heading1':
        return 'h1'
      case 'heading2':
        return 'h2'
      case 'heading3':
        return 'h3'
      case 'heading4':
        return 'h4'
      case 'heading5':
        return 'h5'
      case 'heading6':
        return 'h6'
      default:
        return 'p'
    }
  }

  // 获取字体大小样式
  const getTextSizeClass = (size: string) => {
    switch (size) {
      case 'xs':
        return 'text-xs'
      case 'sm':
        return 'text-sm'
      case 'base':
        return 'text-base'
      case 'lg':
        return 'text-lg'
      case 'xl':
        return 'text-xl'
      case '2xl':
        return 'text-2xl'
      case '3xl':
        return 'text-3xl'
      case '4xl':
        return 'text-4xl'
      default:
        return 'text-base'
    }
  }

  // 获取字体粗细样式
  const getWeightClass = (weight: string) => {
    switch (weight) {
      case 'normal':
        return 'font-normal'
      case 'medium':
        return 'font-medium'
      case 'semibold':
        return 'font-semibold'
      case 'bold':
        return 'font-bold'
      default:
        return 'font-normal'
    }
  }

  // 获取文本对齐样式
  const getAlignClass = (align: string) => {
    switch (align) {
      case 'left':
        return 'text-left'
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      case 'justify':
        return 'text-justify'
      default:
        return 'text-left'
    }
  }

  // 获取文本装饰样式
  const getDecorationClass = (decoration: string) => {
    switch (decoration) {
      case 'none':
        return 'no-underline'
      case 'underline':
        return 'underline'
      case 'line-through':
        return 'line-through'
      default:
        return 'no-underline'
    }
  }

  // 合并默认样式和自定义样式
  const mergedStyles: React.CSSProperties = {
    width: styles.width || 'auto',
    height: styles.height || 'auto',
    color: styles.color || (textProps as any).color,
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

  const TextTag = getTextTag(textProps.variant)

  return React.createElement(
    TextTag,
    {
      'data-component-id': id,
      'data-component-type': 'text',
      style: mergedStyles,
      className: cn(
        'page-designer-text',
        'transition-all duration-200',
        getTextSizeClass(textProps.size || 'base'),
        getWeightClass(textProps.weight || 'normal'),
        getAlignClass(textProps.align || 'left'),
        getDecorationClass(textProps.decoration || 'none'),
        isSelected && 'ring-2 ring-blue-500 ring-offset-2 rounded p-1',
        isDragging && 'opacity-75',
        'hover:bg-gray-50',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        props.className
      ),
      onClick: handleClick,
      onDoubleClick: handleDoubleClick,
      onKeyDown: handleKeyDown,
      tabIndex: 0,
      role: 'text',
      'aria-label': textProps.content || '文本',
      'aria-selected': isSelected,
    },
    textProps.content || '文本内容'
  )
}

// 文本预览组件（用于组件面板）
export const PageTextPreview: React.FC<{
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
      <span className="text-sm text-gray-700">文本</span>
    </div>
  )
}
