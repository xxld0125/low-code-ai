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
import { GridSystemUtils, type ResponsiveRowProps } from '@/lib/lowcode/layout/grid-system'

export const Row = React.forwardRef<
  HTMLDivElement,
  RowProps & ResponsiveRowProps & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      wrap = false,
      justify = 'start',
      align = 'start',
      gap = 0,
      padding = { x: 0, y: 0 },
      margin = { x: 0, y: 0 },
      direction,
      gutter,
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

    // 使用栅格系统生成类名
    const gridClasses = GridSystemUtils.generateRowClasses({
      gutter: gutter || { x: gap, y: gap },
      justify,
      align,
      wrap,
      direction,
    })

    return (
      <div
        ref={ref}
        className={cn(
          // 栅格系统类名
          gridClasses,
          // 基础Flex容器类（向后兼容）
          'flex',
          'flex-row',
          // 对齐方式
          FLEX_JUSTIFY_CLASSES[justify as keyof typeof FLEX_JUSTIFY_CLASSES],
          FLEX_ALIGN_CLASSES[align as keyof typeof FLEX_ALIGN_CLASSES],
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
