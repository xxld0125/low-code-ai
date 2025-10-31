/**
 * Badge 组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface LowcodeBadgeProps {
  content?: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  className?: string
}

export const Badge = React.forwardRef<HTMLSpanElement, LowcodeBadgeProps>(
  (
    {
      content = '示例徽章',
      variant = 'default',
      size = 'default',
      rounded = 'full',
      className,
      ...props
    },
    ref
  ) => {
    // 获取变体样式类
    const getVariantClass = (variant: string) => {
      switch (variant) {
        case 'default':
          return 'bg-gray-800 text-white hover:bg-gray-700 border-2 border-gray-600'
        case 'secondary':
          return 'bg-gray-200 text-gray-800 hover:bg-gray-300 border-2 border-gray-600'
        case 'destructive':
          return 'bg-red-600 text-white hover:bg-red-700 border-2 border-red-600'
        case 'outline':
          return 'border-2 border-gray-600 text-gray-800 bg-gray-100 hover:bg-gray-200'
        default:
          return 'bg-gray-800 text-white hover:bg-gray-700 border-2 border-gray-600'
      }
    }

    // 获取尺寸样式类
    const getSizeClass = (size: string) => {
      switch (size) {
        case 'sm':
          return 'px-2 py-0.5 text-xs'
        case 'default':
          return 'px-2.5 py-0.5 text-sm'
        case 'lg':
          return 'px-3 py-1 text-base'
        default:
          return 'px-2.5 py-0.5 text-sm'
      }
    }

    // 获取圆角样式类
    const getRoundedClass = (rounded: string) => {
      switch (rounded) {
        case 'none':
          return ''
        case 'sm':
          return 'rounded-sm'
        case 'md':
          return 'rounded-md'
        case 'lg':
          return 'rounded-lg'
        case 'full':
          return 'rounded-full'
        default:
          return 'rounded-full'
      }
    }

    // 构建样式类
    const classes = cn(
      // 基础样式
      'inline-flex',
      'items-center',
      'justify-center',
      'font-medium',
      'transition-colors',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500',
      'focus:ring-offset-2',

      // 动态样式
      getVariantClass(variant),
      getSizeClass(size),
      getRoundedClass(rounded),

      // 自定义样式
      className
    )

    return (
      <span ref={ref} className={classes} role="status" aria-label={content} {...props}>
        {content}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
