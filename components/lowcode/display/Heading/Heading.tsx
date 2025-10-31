/**
 * Heading 组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface LowcodeHeadingProps {
  content?: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  size?: 'auto' | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  align?: 'left' | 'center' | 'right'
  color?: string
  decoration?: 'none' | 'underline'
  className?: string
}

export const Heading = React.forwardRef<HTMLHeadingElement, LowcodeHeadingProps>(
  (
    {
      content = '🎯 这是示例标题文本',
      level = 2,
      size = 'auto',
      weight = 'semibold',
      align = 'left',
      color,
      decoration = 'none',
      className,
      ...props
    },
    ref
  ) => {
    // 根据level决定使用哪个HTML标签
    const Tag = `h${level}` as React.ElementType

    // 根据level获取默认大小
    const getDefaultSize = (level: number) => {
      switch (level) {
        case 1:
          return '4xl'
        case 2:
          return '3xl'
        case 3:
          return '2xl'
        case 4:
          return 'xl'
        case 5:
          return 'lg'
        case 6:
          return 'base'
        default:
          return '2xl'
      }
    }

    // 获取文本大小样式类
    const getSizeClass = (size: string, level: number) => {
      if (size === 'auto') {
        size = getDefaultSize(level)
      }

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
        case '5xl':
          return 'text-5xl'
        case '6xl':
          return 'text-6xl'
        default:
          return 'text-2xl'
      }
    }

    // 获取字体粗细样式类
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
          return 'font-semibold'
      }
    }

    // 获取文本对齐样式类
    const getAlignClass = (align: string) => {
      switch (align) {
        case 'left':
          return 'text-left'
        case 'center':
          return 'text-center'
        case 'right':
          return 'text-right'
        default:
          return 'text-left'
      }
    }

    // 获取文本装饰样式类
    const getDecorationClass = (decoration: string) => {
      switch (decoration) {
        case 'none':
          return 'no-underline'
        case 'underline':
          return 'underline'
        default:
          return 'no-underline'
      }
    }

    // 构建样式类
    const classes = cn(
      // 基础样式
      'leading-tight tracking-tight',

      // 动态样式
      getSizeClass(size, level),
      getWeightClass(weight),
      getAlignClass(align),
      getDecorationClass(decoration),

      // 自定义样式
      className
    )

    // 构建内联样式
    const inlineStyles: React.CSSProperties = {
      color,
    }

    return (
      <Tag ref={ref} className={classes} style={inlineStyles} {...props}>
        {content}
      </Tag>
    )
  }
)

Heading.displayName = 'Heading'
