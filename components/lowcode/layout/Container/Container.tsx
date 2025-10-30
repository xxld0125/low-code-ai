/**
 * Container 布局组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { cn } from '@/lib/utils'
import type { ContainerProps } from '@/types/lowcode/component'
import type { BackgroundValue } from '@/types/lowcode/style'
import {
  FLEX_JUSTIFY_CLASSES,
  FLEX_ALIGN_CLASSES,
  spacingToCss,
  getRoundedClass,
  getShadowClass,
  generateFlexContainerStyles,
} from '@/lib/lowcode/layout/utils'

export const Container = React.forwardRef<
  HTMLDivElement,
  ContainerProps & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      direction = 'column',
      wrap = false,
      justify = 'start',
      align = 'start',
      gap = 0,
      padding = { x: 0, y: 0 },
      margin = { x: 0, y: 0 },
      background,
      border,
      rounded,
      shadow,
      className,
      children,
      style,
      ...props
    },
    ref
  ) => {
    // 验证属性值
    if (gap !== undefined && typeof gap === 'number' && gap < 0) {
      console.warn(`Container组件: gap值不能为负数，将使用默认值0`)
    }

    // 转换 BackgroundValue 到 string
    const backgroundToString = (bg: BackgroundValue | undefined): string | undefined => {
      if (typeof bg === 'string') {
        return bg
      }
      // 如果 BackgroundValue 是对象类型，提取颜色值
      if (typeof bg === 'object' && bg !== null && 'color' in bg) {
        return bg.color as string
      }
      return undefined
    }

    // 使用公共工具函数生成样式
    const mergedStyle = generateFlexContainerStyles(
      direction,
      wrap,
      Math.max(0, typeof gap === 'number' ? gap : 0),
      padding,
      margin,
      backgroundToString(background),
      style
    )

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          FLEX_JUSTIFY_CLASSES[justify],
          FLEX_ALIGN_CLASSES[align],
          getRoundedClass(rounded || false),
          getShadowClass(shadow || false),
          border && 'border border-gray-200',
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

Container.displayName = 'Container'
