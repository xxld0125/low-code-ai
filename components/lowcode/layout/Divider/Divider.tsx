import React from 'react'
import { ComponentRendererProps } from '@/types/page-designer/component'
import { cn } from '@/lib/utils'

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double'
  dashed?: boolean
  plain?: boolean
  color?: string
  size?: number
  children?: React.ReactNode
  className?: string
}

export const Divider: React.FC<
  Omit<ComponentRendererProps, 'type'> & DividerProps & React.HTMLAttributes<HTMLDivElement>
> = ({
  id,
  props = {},
  styles = {},
  className,
  children,
  isSelected,
  isDragging,
  onSelect,
  onDelete,
  readonly,
  onUpdate,
  isHovered,
  ...htmlProps
}) => {
  const {
    orientation = 'horizontal',
    borderStyle = 'solid',
    dashed = false,
    plain = false,
    color = '#e5e7eb',
    size = 1,
  } = props

  // 生成边框样式
  const getBorderStyle = (): React.CSSProperties => {
    const borderStyleValue =
      borderStyle === 'dashed'
        ? 'dashed'
        : borderStyle === 'dotted'
          ? 'dotted'
          : borderStyle === 'double'
            ? 'double'
            : 'solid'

    if (orientation === 'horizontal') {
      return {
        borderTop: `${size}px ${borderStyleValue} ${color}`,
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: borderStyle === 'double' ? `${size}px ${borderStyleValue} ${color}` : 'none',
      }
    } else {
      return {
        borderLeft: `${size}px ${borderStyleValue} ${color}`,
        borderTop: 'none',
        borderBottom: 'none',
        borderRight: borderStyle === 'double' ? `${size}px ${borderStyleValue} ${color}` : 'none',
      }
    }
  }

  // 合并样式
  const mergedStyles: React.CSSProperties = {
    ...getBorderStyle(),
    margin: (styles as any).margin || '16px 0',
    padding: (styles as any).padding || 0,
    opacity: (styles as any).opacity || 1,
    width: orientation === 'vertical' ? '1px' : '100%',
    height: orientation === 'vertical' ? '100%' : '1px',
    minWidth: orientation === 'vertical' ? '1px' : 'auto',
    minHeight: orientation === 'vertical' ? 'auto' : '1px',
  }

  // 如果有子元素且不是纯文本模式，使用带文本的分割线布局
  if (children && !plain) {
    return (
      <div
        data-component-id={id}
        data-component-type="divider"
        className={cn(
          'flex items-center text-gray-500',
          orientation === 'vertical' ? 'flex-col' : '',
          className
        )}
        style={{
          margin: (styles as any).margin || '16px 0',
          opacity: (styles as any).opacity || 1,
        }}
        {...htmlProps}
      >
        {/* 左侧线条 */}
        <div
          className={cn(
            'flex-1',
            orientation === 'vertical' ? 'h-full w-px' : 'h-px',
            dashed && 'border-dashed'
          )}
          style={{
            borderTop: orientation === 'horizontal' ? `${size}px ${borderStyle} ${color}` : 'none',
            borderLeft: orientation === 'vertical' ? `${size}px ${borderStyle} ${color}` : 'none',
          }}
        />

        {/* 中间文本 */}
        <div
          className={cn('px-3 text-sm', orientation === 'vertical' ? 'py-2' : '')}
          style={{ color }}
        >
          {children}
        </div>

        {/* 右侧线条 */}
        <div
          className={cn(
            'flex-1',
            orientation === 'vertical' ? 'h-full w-px' : 'h-px',
            dashed && 'border-dashed'
          )}
          style={{
            borderTop: orientation === 'horizontal' ? `${size}px ${borderStyle} ${color}` : 'none',
            borderLeft: orientation === 'vertical' ? `${size}px ${borderStyle} ${color}` : 'none',
          }}
        />
      </div>
    )
  }

  // 纯文本模式的分割线
  if (children && plain) {
    return (
      <div
        data-component-id={id}
        data-component-type="divider"
        className={cn('relative', className)}
        style={{
          margin: (styles as any).margin || '16px 0',
          opacity: (styles as any).opacity || 1,
        }}
        {...htmlProps}
      >
        <div
          className={cn(
            'absolute inset-0 flex items-center',
            orientation === 'vertical' ? 'flex-col' : ''
          )}
        >
          <div
            className={cn(
              'w-full',
              orientation === 'vertical' ? 'h-full w-px' : 'h-px w-full',
              dashed && 'border-dashed'
            )}
            style={{
              borderTop:
                orientation === 'horizontal' ? `${size}px ${borderStyle} ${color}` : 'none',
              borderLeft: orientation === 'vertical' ? `${size}px ${borderStyle} ${color}` : 'none',
            }}
          />
        </div>
        <div
          className={cn('relative bg-white px-3 text-sm', orientation === 'vertical' ? 'py-2' : '')}
          style={{ color }}
        >
          {children}
        </div>
      </div>
    )
  }

  // 普通分割线
  return (
    <div
      data-component-id={id}
      data-component-type="divider"
      className={cn('divider', className)}
      style={mergedStyles}
      role="separator"
      aria-orientation={orientation}
      {...htmlProps}
    />
  )
}
