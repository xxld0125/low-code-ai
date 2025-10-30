/**
 * Divider 布局组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { cn } from '@/lib/utils'
import type { DividerProps } from '@/types/lowcode/component'

export const Divider = React.forwardRef<
  HTMLDivElement,
  DividerProps & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      orientation = 'horizontal',
      thickness = 1,
      color = '#e5e7eb',
      style = 'solid',
      length = '100%',
      className,
      style: htmlStyle,
      ...props
    },
    ref
  ) => {
    // 生成边框样式
    const getBorderStyle = (): React.CSSProperties => {
      const borderStyleValue = style as string

      if (orientation === 'horizontal') {
        return {
          borderTop: `${thickness}px ${borderStyleValue} ${color}`,
          width: typeof length === 'string' && length.includes('%') ? length : `${length}px`,
          height: 0,
        }
      } else {
        return {
          borderLeft: `${thickness}px ${borderStyleValue} ${color}`,
          height: typeof length === 'string' && length.includes('%') ? length : `${length}px`,
          width: 0,
        }
      }
    }

    // 合并样式
    const mergedStyle: React.CSSProperties = {
      ...getBorderStyle(),
      margin: orientation === 'horizontal' ? '8px 0' : '0 8px',
      ...(htmlStyle && typeof htmlStyle === 'object' ? htmlStyle : {}),
    }

    return (
      <div
        ref={ref}
        className={cn('divider', 'shrink-0', className)}
        style={mergedStyle}
        role="separator"
        aria-orientation={orientation}
        {...props}
      />
    )
  }
)

Divider.displayName = 'Divider'
