/**
 * 页面设计器列布局组件
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import React from 'react'
import { ComponentRendererProps } from '@/types/page-designer/component'
import { ColProps, Breakpoint } from '@/types/page-designer/layout'
import { cn } from '@/lib/utils'

export const PageCol: React.FC<ComponentRendererProps> = ({
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
}) => {
  const colProps = props.col || {
    span: 12,
    offset: 0,
    order: 0,
    flex: undefined,
    flexGrow: undefined,
    flexShrink: undefined,
    flexBasis: undefined,
    alignSelf: undefined,
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

  // 生成栅格类名
  const getGridClasses = (): string => {
    const classes: string[] = []

    // 默认span
    const defaultSpan = typeof colProps.span === 'number' ? colProps.span : 12
    classes.push(`col-span-${defaultSpan}`)

    // 响应式span
    if (typeof colProps.span === 'object') {
      Object.entries(colProps.span as Record<Breakpoint, number | string>).forEach(
        ([breakpoint, value]) => {
          if (breakpoint !== 'xs') {
            const spanValue = typeof value === 'number' ? value : parseInt(value) || 12
            classes.push(`${breakpoint}:col-span-${spanValue}`)
          }
        }
      )
    }

    // 默认offset
    if (typeof colProps.offset === 'number' && colProps.offset > 0) {
      classes.push(`col-start-${colProps.offset + 1}`)
    }

    // 响应式offset
    if (typeof colProps.offset === 'object') {
      Object.entries(colProps.offset as Record<Breakpoint, number | string>).forEach(
        ([breakpoint, value]) => {
          if (breakpoint !== 'xs' && value) {
            const offsetValue = typeof value === 'number' ? value : parseInt(value) || 0
            if (offsetValue > 0) {
              classes.push(`${breakpoint}:col-start-${offsetValue + 1}`)
            }
          }
        }
      )
    }

    // order
    if (colProps.order && colProps.order !== 0) {
      classes.push(`order-${colProps.order}`)
    }

    // 响应式order
    if (typeof colProps.order === 'object') {
      Object.entries(colProps.order as Record<Breakpoint, number>).forEach(
        ([breakpoint, value]) => {
          if (breakpoint !== 'xs' && value !== 0) {
            classes.push(`${breakpoint}:order-${value}`)
          }
        }
      )
    }

    return classes.join(' ')
  }

  // 合并样式
  const mergedStyles: React.CSSProperties = {
    // Flexbox属性（作为flex子项）
    flex:
      typeof colProps.flex === 'string'
        ? colProps.flex
        : typeof colProps.flex === 'number'
          ? `${colProps.flex}`
          : undefined,
    flexGrow: colProps.flexGrow,
    flexShrink: colProps.flexShrink,
    flexBasis: colProps.flexBasis,
    alignSelf:
      colProps.alignSelf === 'auto'
        ? 'auto'
        : colProps.alignSelf === 'flex-start'
          ? 'flex-start'
          : colProps.alignSelf === 'flex-end'
            ? 'flex-end'
            : colProps.alignSelf === 'center'
              ? 'center'
              : colProps.alignSelf === 'baseline'
                ? 'baseline'
                : colProps.alignSelf === 'stretch'
                  ? 'stretch'
                  : undefined,

    // 间距
    padding: getSpacingValue(colProps.padding),
    margin: getSpacingValue(colProps.margin),

    // 自定义样式
    width: styles.width || 'auto',
    height: styles.height || 'auto',
    minWidth: styles.minWidth,
    minHeight: styles.minHeight,
    maxWidth: styles.maxWidth,
    maxHeight: styles.maxHeight,
    position: styles.position || 'relative',
    top: styles.top,
    right: styles.right,
    bottom: styles.bottom,
    left: styles.left,
    zIndex: styles.zIndex,
    opacity: styles.opacity,
    overflow: styles.overflow || 'visible',
    transition: styles.transition || 'all 0.2s ease-in-out',
    cursor: isDragging ? 'grabbing' : 'pointer',
    userSelect: 'none',

    // 背景和边框
    backgroundColor: styles.backgroundColor,
    backgroundImage: styles.backgroundImage,
    backgroundSize: styles.backgroundSize,
    backgroundPosition: styles.backgroundPosition,
    backgroundRepeat: styles.backgroundRepeat,

    // 过滤不兼容的样式属性
    boxShadow:
      styles.boxShadow && typeof styles.boxShadow === 'string' ? styles.boxShadow : undefined,
    background:
      styles.background && typeof styles.background === 'string' ? styles.background : undefined,
    border: styles.border && typeof styles.border === 'string' ? styles.border : undefined,
    borderRadius:
      styles.borderRadius && typeof styles.borderRadius !== 'boolean'
        ? styles.borderRadius
        : undefined,
  }

  return (
    <div
      data-component-id={id}
      data-component-type="col"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      style={mergedStyles}
      className={cn(
        'page-designer-col',
        getGridClasses(),
        'transition-all duration-200',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2',
        isDragging && 'opacity-75',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        props.className
      )}
      tabIndex={0}
      role="group"
      aria-label="列布局组件"
    >
      {children}
    </div>
  )
}

// 列布局预览组件（用于组件面板）
export const PageColPreview: React.FC<{
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
      <div className="flex flex-col gap-1">
        <div className="h-2 w-16 rounded bg-green-300"></div>
        <div className="h-2 w-20 rounded bg-green-400"></div>
        <div className="h-2 w-14 rounded bg-green-300"></div>
      </div>
    </div>
  )
}
