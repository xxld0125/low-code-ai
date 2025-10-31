/**
 * Card 组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface LowcodeCardProps {
  title?: string
  description?: string
  footer?: string
  padding?: 'none' | 'small' | 'medium' | 'large'
  rounded?: 'none' | 'small' | 'medium' | 'large'
  shadow?: 'none' | 'small' | 'medium' | 'large'
  border?: 'none' | 'light' | 'medium' | 'strong'
  background?: string
  children?: React.ReactNode
  className?: string
}

export const Card = React.forwardRef<HTMLDivElement, LowcodeCardProps>(
  (
    {
      title,
      description,
      footer,
      padding = 'medium',
      rounded = 'medium',
      shadow = 'medium',
      border = 'light',
      background = '#f3f4f6',
      children,
      className,
      ...props
    },
    ref
  ) => {
    // 获取内边距样式类
    const getPaddingClass = (padding: string) => {
      switch (padding) {
        case 'none':
          return 'p-0'
        case 'small':
          return 'p-3'
        case 'medium':
          return 'p-4'
        case 'large':
          return 'p-6'
        default:
          return 'p-4'
      }
    }

    // 获取圆角样式类
    const getRoundedClass = (rounded: string) => {
      switch (rounded) {
        case 'none':
          return ''
        case 'small':
          return 'rounded-sm'
        case 'medium':
          return 'rounded-md'
        case 'large':
          return 'rounded-lg'
        default:
          return 'rounded-md'
      }
    }

    // 获取阴影样式类
    const getShadowClass = (shadow: string) => {
      switch (shadow) {
        case 'none':
          return ''
        case 'small':
          return 'shadow-sm'
        case 'medium':
          return 'shadow-md'
        case 'large':
          return 'shadow-lg'
        default:
          return 'shadow-md'
      }
    }

    // 获取边框样式类
    const getBorderClass = (border: string) => {
      switch (border) {
        case 'none':
          return ''
        case 'light':
          return 'border-2 border-gray-600'
        case 'medium':
          return 'border-2 border-gray-600'
        case 'strong':
          return 'border-2 border-gray-600'
        default:
          return 'border-2 border-gray-600'
      }
    }

    // 构建样式类
    const classes = cn(
      // 基础样式
      'relative',
      'transition-all duration-200',
      'hover:shadow-lg',

      // 动态样式
      getPaddingClass(padding),
      getRoundedClass(rounded),
      getShadowClass(shadow),
      getBorderClass(border),

      // 自定义样式
      className
    )

    // 构建内联样式
    const inlineStyles: React.CSSProperties = {
      backgroundColor: background,
    }

    return (
      <div ref={ref} className={classes} style={inlineStyles} data-testid="card" {...props}>
        {/* 卡片头部 */}
        {title && (
          <div className="mb-3">
            <h3 className="text-lg font-semibold leading-tight text-gray-900">{title}</h3>
          </div>
        )}

        {/* 卡片内容 */}
        {(description || children) && (
          <div className="text-gray-600">
            {description && <p className="text-sm leading-relaxed">{description}</p>}
            {children && <div className="mt-2">{children}</div>}
          </div>
        )}

        {/* 卡片底部 */}
        {footer && (
          <div className="mt-4 border-t border-gray-100 pt-3">
            <p className="text-sm text-gray-500">{footer}</p>
          </div>
        )}
      </div>
    )
  }
)

Card.displayName = 'Card'
