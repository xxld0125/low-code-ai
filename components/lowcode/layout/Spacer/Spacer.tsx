/**
 * Spacer 布局组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { cn } from '@/lib/utils'
import type { SpacerProps } from '@/types/lowcode/component'

export const Spacer = React.forwardRef<
  HTMLDivElement,
  SpacerProps & React.HTMLAttributes<HTMLDivElement>
>(({ size = 16, direction = 'vertical', className, style, ...props }, ref) => {
  // 将size转换为像素值
  const getSpacingValue = (): string => {
    if (typeof size === 'number') {
      return `${size}px`
    }
    return size
  }

  // 生成样式
  const getSpacerStyle = (): React.CSSProperties => {
    const spacingValue = getSpacingValue()

    // 固定间距
    if (direction === 'vertical') {
      return {
        width: '100%',
        height: spacingValue,
      }
    } else {
      return {
        height: '100%',
        width: spacingValue,
      }
    }
  }

  return (
    <div
      ref={ref}
      className={cn('spacer', 'shrink-0', className)}
      style={{
        ...getSpacerStyle(),
        ...style,
      }}
      role="separator"
      aria-orientation={direction === 'vertical' ? 'vertical' : 'horizontal'}
      aria-hidden="true"
      {...props}
    />
  )
})

Spacer.displayName = 'Spacer'
