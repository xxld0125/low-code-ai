/**
 * 页面设计器行布局组件
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import React from 'react'
import { ComponentRendererProps } from '@/types/page-designer/component'
import { RowProps } from '@/types/page-designer/layout'
import { cn } from '@/lib/utils'

export const PageRow: React.FC<ComponentRendererProps> = ({
  id,
  props,
  styles,
  isSelected,
  isDragging,
  onSelect,
  onDelete,
  children,
}) => {
  const rowProps = props.row || {
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

  // 合并样式
  const mergedStyles: React.CSSProperties = {
    // Flexbox布局（Row默认为水平布局）
    display: 'flex',
    flexDirection: 'row',
    flexWrap: rowProps.wrap ? 'wrap' : 'nowrap',
    justifyContent:
      rowProps.justify === 'start'
        ? 'flex-start'
        : rowProps.justify === 'end'
          ? 'flex-end'
          : rowProps.justify === 'center'
            ? 'center'
            : rowProps.justify === 'between'
              ? 'space-between'
              : rowProps.justify === 'around'
                ? 'space-around'
                : rowProps.justify === 'evenly'
                  ? 'space-evenly'
                  : 'flex-start',
    alignItems:
      rowProps.align === 'start'
        ? 'flex-start'
        : rowProps.align === 'end'
          ? 'flex-end'
          : rowProps.align === 'center'
            ? 'center'
            : rowProps.align === 'stretch'
              ? 'stretch'
              : 'flex-start',

    // 间距
    gap:
      typeof rowProps.gap === 'number'
        ? `${rowProps.gap}px`
        : typeof rowProps.gap === 'string'
          ? rowProps.gap
          : '0',
    padding: getSpacingValue(rowProps.padding),
    margin: getSpacingValue(rowProps.margin),

    // 自定义样式
    width: styles.width || '100%',
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
      data-component-type="row"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      style={mergedStyles}
      className={cn(
        'page-designer-row',
        'transition-all duration-200',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2',
        isDragging && 'opacity-75',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        props.className
      )}
      tabIndex={0}
      role="group"
      aria-label="行布局组件"
    >
      {children}
    </div>
  )
}

// 行布局预览组件（用于组件面板）
export const PageRowPreview: React.FC<{
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
      <div className="flex gap-1">
        <div className="h-8 w-8 rounded bg-blue-300"></div>
        <div className="h-8 w-8 rounded bg-blue-400"></div>
        <div className="h-8 w-8 rounded bg-blue-300"></div>
      </div>
    </div>
  )
}
