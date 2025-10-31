/**
 * Col 布局组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { cn } from '@/lib/utils'
import type { ColProps } from '@/types/lowcode/component'
import {
  spacingToCss,
  generateResponsiveColumnStyles,
  generateResponsiveFlexStyles,
  mergeStyles,
  type ResponsiveGridProps,
} from '@/lib/lowcode/layout/utils'
import {
  GridSystemUtils,
  type ResponsiveGridProps as NewResponsiveGridProps,
  FLEX_ALIGN_SELF_CLASSES,
} from '@/lib/lowcode/layout/grid-system'

export const Col = React.forwardRef<
  HTMLDivElement,
  ColProps & NewResponsiveGridProps & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      span = 12,
      offset = 0,
      order = 0,
      flex,
      flex_grow,
      flex_shrink,
      flex_basis,
      align_self = 'auto',
      padding = { x: 0, y: 0 },
      margin = { x: 0, y: 0 },
      hidden,
      className,
      children,
      style,
      ...props
    },
    ref
  ) => {
    // 验证栅格属性
    if (typeof span === 'number' && (span < 1 || span > 24)) {
      console.warn(`Col组件: span值 ${span} 超出范围[1-24]，将使用默认值12`)
    }

    if (typeof offset === 'number' && (offset < 0 || offset > 23)) {
      console.warn(`Col组件: offset值 ${offset} 超出范围[0-23]，将使用默认值0`)
    }

    // 转换 GridSpan 类型为 ResponsiveGridProps 期望的类型
    const convertToResponsiveValue = (
      value:
        | number
        | {
            xs?: number | string
            sm?: number | string
            md?: number | string
            lg?: number | string
            xl?: number | string
          }
        | undefined
    ) => {
      if (typeof value === 'number') {
        return value
      }
      if (typeof value === 'object' && value !== null) {
        return {
          mobile: value.xs as number,
          tablet: value.sm as number,
          desktop: value.lg as number,
        }
      }
      return 12 // 默认值
    }

    const convertOrderToResponsiveValue = (
      value:
        | number
        | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number }
        | undefined
    ) => {
      if (typeof value === 'number') {
        return value
      }
      if (typeof value === 'object' && value !== null) {
        return {
          mobile: value.xs,
          tablet: value.sm,
          desktop: value.lg,
        }
      }
      return 0 // 默认值
    }

    // 使用新的栅格系统生成类名
    const spanClasses = GridSystemUtils.generateSpanClasses(span)
    const offsetClasses = GridSystemUtils.generateOffsetClasses(offset)
    const orderClasses = GridSystemUtils.generateOrderClasses(order)
    const hiddenClasses = GridSystemUtils.generateHiddenClasses(hidden || false)
    const flexClasses = GridSystemUtils.generateFlexClasses({
      flex,
      flexGrow: flex_grow,
      flexShrink: flex_shrink,
      flexBasis: flex_basis,
    })
    // 映射 flex 值到标准值
    const normalizedAlignSelf =
      typeof align_self === 'string' ? (align_self.replace('flex-', '') as any) : align_self
    const alignSelfClasses = GridSystemUtils.generateAlignSelfClasses(normalizedAlignSelf)

    // 定义响应式栅格属性（保持向后兼容）
    const responsiveProps: ResponsiveGridProps = {
      span: convertToResponsiveValue(span),
      offset: convertToResponsiveValue(offset),
      order: convertOrderToResponsiveValue(order),
      flex,
    }

    // 使用响应式工具函数生成栅格样式
    const columnStyles = generateResponsiveColumnStyles(responsiveProps)

    // 使用响应式工具函数生成Flex样式
    const flexStyles = generateResponsiveFlexStyles(flex, flex_grow, flex_shrink, flex_basis)

    // 合并所有样式
    const mergedStyle = mergeStyles(
      {
        display: 'flex',
        flexDirection: 'column',
        padding: spacingToCss(padding),
        margin: spacingToCss(margin),
      },
      columnStyles,
      flexStyles,
      style
    )

    return (
      <div
        ref={ref}
        className={cn(
          // 栅格系统类名
          spanClasses,
          offsetClasses,
          orderClasses,
          hiddenClasses,
          flexClasses,
          alignSelfClasses,
          // 用户自定义类名
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

Col.displayName = 'Col'
