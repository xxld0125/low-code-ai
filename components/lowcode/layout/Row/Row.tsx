/**
 * Row 布局组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { cn } from '@/lib/utils'
import type { RowProps } from '@/types/lowcode/component'
import {
  FLEX_JUSTIFY_CLASSES,
  FLEX_ALIGN_CLASSES,
  spacingToCss,
  generateFlexContainerStyles,
} from '@/lib/lowcode/layout/utils'

export const Row = React.forwardRef<
  HTMLDivElement,
  RowProps & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      wrap = false,
      justify = 'start',
      align = 'start',
      gap = 0,
      padding = { x: 0, y: 0 },
      margin = { x: 0, y: 0 },
      className,
      children,
      style,
      ...props
    },
    ref
  ) => {
    // 验证属性值
    if (gap !== undefined && typeof gap === 'number' && gap < 0) {
      console.warn(`Row组件: gap值不能为负数，将使用默认值0`)
    }

    // 使用公共工具函数生成样式（Row固定为水平布局）
    const mergedStyle = generateFlexContainerStyles(
      'row',
      wrap,
      Math.max(0, typeof gap === 'number' ? gap : 0),
      padding,
      margin,
      undefined,
      style
    )

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          'flex-row',
          FLEX_JUSTIFY_CLASSES[justify],
          FLEX_ALIGN_CLASSES[align],
          className
        )}
        style={mergedStyle}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Row.displayName = 'Row'
