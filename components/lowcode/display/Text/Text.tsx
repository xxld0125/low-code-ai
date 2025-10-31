/**
 * Text 组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface LowcodeTextProps {
  content?: string
  variant?: 'body' | 'caption'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  align?: 'left' | 'center' | 'right' | 'justify'
  color?: string
  decoration?: 'none' | 'underline' | 'line-through'
  className?: string
  style?: React.CSSProperties
}

export const Text = React.forwardRef<HTMLParagraphElement, LowcodeTextProps>(
  (
    {
      content = '这是一段示例文本',
      variant = 'body',
      size = 'base',
      weight = 'normal',
      align = 'left',
      color,
      decoration = 'none',
      className,
      style,
      ...props
    },
    ref
  ) => {
    // 根据variant决定使用哪个HTML标签
    const Tag = variant === 'caption' ? 'span' : 'p'

    // 获取文本大小样式类
    const getSizeClass = (size: string) => {
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
        default:
          return 'text-base'
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
          return 'font-normal'
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
        case 'justify':
          return 'text-justify'
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
        case 'line-through':
          return 'line-through'
        default:
          return 'no-underline'
      }
    }

    // 构建样式类
    const classes = cn(
      // 基础样式
      'leading-relaxed',

      // 动态样式
      getSizeClass(size),
      getWeightClass(weight),
      getAlignClass(align),
      getDecorationClass(decoration),

      // variant特定样式
      variant === 'caption' && 'text-gray-500',

      // 自定义样式
      className
    )

    // 构建内联样式
    const inlineStyles: React.CSSProperties = {
      color,
      ...style,
    }

    return (
      <Tag ref={ref} className={classes} style={inlineStyles} {...props}>
        {content}
      </Tag>
    )
  }
)

Text.displayName = 'Text'
