/**
 * 页面设计器容器组件
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import React from 'react'
import { ComponentRendererProps } from '@/types/page-designer/component'
import { ContainerProps } from '@/types/page-designer/layout'
import { cn } from '@/lib/utils'

export const PageContainer: React.FC<
  ComponentRendererProps & React.HTMLAttributes<HTMLDivElement>
> = ({
  id,
  props,
  styles,
  isSelected,
  isDragging,
  onSelect,
  onDelete,
  children,
  readonly,
  onUpdate,
  isHovered,
  ...htmlProps
}) => {
  const containerProps = props.container || {
    direction: 'column',
    wrap: false,
    justify: 'start',
    align: 'start',
    gap: 0,
    padding: { x: 0, y: 0 },
    margin: { x: 0, y: 0 },
  }

  // 处理点击事件
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect?.(id)
  }

  // 处理双击事件
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // 双击编辑或其他操作
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.stopPropagation()
      onDelete?.(id)
    }
  }

  // 生成间距样式
  const getSpacingValue = (spacing: any): string => {
    if (!spacing) return '0'
    if (typeof spacing === 'number') return `${spacing}px`
    if (typeof spacing === 'string') return spacing
    if (typeof spacing === 'object') {
      const { x = 0, y = 0, top, right, bottom, left } = spacing
      if (top !== undefined || right !== undefined || bottom !== undefined || left !== undefined) {
        return `${top ?? y}px ${right ?? x}px ${bottom ?? y}px ${left ?? x}px`
      }
      return `${y}px ${x}px`
    }
    return '0'
  }

  // 生成背景样式
  const getBackgroundStyle = (background: any): React.CSSProperties => {
    if (!background) return {}
    if (typeof background === 'string') {
      return { backgroundColor: background }
    }
    return {
      backgroundColor: background.color,
      backgroundImage: background.image ? `url(${background.image})` : undefined,
      backgroundSize: background.size,
      backgroundPosition: background.position,
      backgroundRepeat: background.repeat,
    }
  }

  // 生成边框样式
  const getBorderStyle = (border: any): React.CSSProperties => {
    if (!border) return {}
    if (typeof border === 'boolean') {
      return border ? { border: '1px solid #e5e7eb' } : {}
    }
    if (typeof border === 'string') {
      return { border }
    }
    if (typeof border === 'object') {
      const { width = 1, color = '#e5e7eb', style = 'solid', side = 'all' } = border
      const borderValue = `${width}px ${style} ${color}`

      switch (side) {
        case 'all':
          return { border: borderValue }
        case 'top':
          return { borderTop: borderValue }
        case 'right':
          return { borderRight: borderValue }
        case 'bottom':
          return { borderBottom: borderValue }
        case 'left':
          return { borderLeft: borderValue }
        case 'x':
          return { borderLeft: borderValue, borderRight: borderValue }
        case 'y':
          return { borderTop: borderValue, borderBottom: borderValue }
        default:
          return { border: borderValue }
      }
    }
    return {}
  }

  // 生成阴影样式
  const getShadowStyle = (shadow: any): string => {
    if (!shadow) return 'none'
    if (typeof shadow === 'boolean') {
      return shadow ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : 'none'
    }
    return shadow
  }

  // 生成圆角样式
  const getBorderRadiusStyle = (radius: any): string => {
    if (!radius) return '0'
    if (typeof radius === 'boolean') {
      return radius ? '0.375rem' : '0'
    }
    if (typeof radius === 'string' || typeof radius === 'number') {
      return `${radius}`
    }
    return '0'
  }

  // 合并样式
  const mergedStyles: React.CSSProperties = {
    // Flexbox布局
    display: 'flex',
    flexDirection: containerProps.direction || 'column',
    flexWrap: containerProps.wrap ? 'wrap' : 'nowrap',
    justifyContent: containerProps.justify || 'flex-start',
    alignItems: containerProps.align || 'flex-start',
    gap: `${containerProps.gap || 0}px`,

    // 间距
    padding: getSpacingValue(containerProps.padding),
    margin: getSpacingValue(containerProps.margin),

    // 背景和边框
    ...getBackgroundStyle(containerProps.background),
    ...getBorderStyle(containerProps.border),
    boxShadow: getShadowStyle(containerProps.shadow),
    borderRadius: getBorderRadiusStyle(containerProps.rounded),

    // 自定义样式
    width: styles?.width || '100%',
    height: styles?.height || 'auto',
    minWidth: styles?.minWidth,
    minHeight: styles?.minHeight,
    maxWidth: styles?.maxWidth,
    maxHeight: styles?.maxHeight,
    position: styles?.position || 'relative',
    top: styles?.top,
    right: styles?.right,
    bottom: styles?.bottom,
    left: styles?.left,
    zIndex: styles?.zIndex,
    opacity: styles?.opacity,
    overflow: styles?.overflow || 'visible',
    transition: styles?.transition || 'all 0.2s ease-in-out',
    cursor: isDragging ? 'grabbing' : 'pointer',
    userSelect: 'none',

    // 过滤不兼容的样式属性
  }

  return (
    <div
      data-component-id={id}
      data-component-type="container"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      style={mergedStyles}
      className={cn(
        'page-designer-container',
        'transition-all duration-200',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2',
        isDragging && 'opacity-75',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        props.className
      )}
      tabIndex={0}
      role="group"
      aria-label="容器组件"
      {...htmlProps}
    >
      {children}
    </div>
  )
}

// 容器预览组件（用于组件面板）
export const PageContainerPreview: React.FC<{
  onClick?: () => void
}> = ({ onClick }) => {
  return (
    <div
      className="flex h-20 w-full cursor-pointer items-center justify-center rounded border border-gray-200 bg-white p-2 hover:border-blue-300 hover:bg-blue-50"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.()
        }
      }}
    >
      <div className="flex flex-col gap-1">
        <div className="h-2 w-16 rounded bg-gray-300"></div>
        <div className="h-2 w-12 rounded bg-gray-400"></div>
        <div className="h-2 w-14 rounded bg-gray-300"></div>
      </div>
    </div>
  )
}
