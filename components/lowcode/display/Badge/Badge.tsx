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
      content = '徽章',
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
          return 'bg-primary text-primary-foreground hover:bg-primary/90'
        case 'secondary':
          return 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        case 'destructive':
          return 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
        case 'outline':
          return 'border border-input text-foreground bg-background hover:bg-accent hover:text-accent-foreground'
        default:
          return 'bg-primary text-primary-foreground hover:bg-primary/90'
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
