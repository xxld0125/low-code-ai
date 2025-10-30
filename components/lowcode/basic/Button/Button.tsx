/**
 * Button 基础组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import { Button as ShadcnButton } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ButtonProps } from '@/types/lowcode/component'

export interface LowcodeButtonProps {
  className?: string
  children?: React.ReactNode
  text?: string
  variant?: 'default' | 'primary' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  icon_position?: 'left' | 'right'
  onClick?: string | ((event: React.MouseEvent<HTMLButtonElement>) => void)
}

export const Button = React.forwardRef<HTMLButtonElement, LowcodeButtonProps>(
  (
    {
      text = '点击按钮',
      variant = 'default',
      size = 'default',
      disabled = false,
      loading = false,
      icon,
      icon_position = 'left',
      onClick,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // 处理点击事件
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        e.preventDefault()
        return
      }

      // 如果有自定义事件处理器，执行它
      if (onClick && typeof onClick === 'string') {
        // 这里可以触发全局事件处理器
        // TODO: 实现事件处理器调用逻辑
        console.log('Button clicked with handler:', onClick)
      }

      // 调用传入的onClick函数（如果存在）
      if (typeof onClick === 'function') {
        onClick(e)
      }
    }

    // 处理键盘事件
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        return
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick(e as any)
      }
    }

    // 将variant映射到shadcn/ui的variant
    const getShadcnVariant = (
      buttonVariant: string
    ): 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' => {
      switch (buttonVariant) {
        case 'primary':
          return 'default'
        case 'secondary':
          return 'secondary'
        case 'destructive':
          return 'destructive'
        case 'outline':
          return 'outline'
        case 'ghost':
          return 'ghost'
        case 'link':
          return 'link'
        default:
          return 'default'
      }
    }

    // 将size映射到shadcn/ui的size
    const getShadcnSize = (buttonSize: string): 'default' | 'sm' | 'lg' | 'icon' => {
      switch (buttonSize) {
        case 'sm':
          return 'sm'
        case 'lg':
          return 'lg'
        case 'icon':
          return 'icon'
        default:
          return 'default'
      }
    }

    // 将size映射到测试期望的data-size值
    const getDataSize = (buttonSize: string) => {
      switch (buttonSize) {
        case 'sm':
          return 'small'
        case 'lg':
          return 'large'
        case 'icon':
          return 'icon'
        default:
          return 'medium'
      }
    }

    // 加载动画组件
    const LoadingSpinner = () => (
      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
    )

    // 渲染按钮内容
    const renderContent = () => {
      if (children) {
        return children
      }

      return (
        <>
          {loading && <LoadingSpinner />}

          {icon && icon_position === 'left' && (
            <span className="mr-2 inline-flex items-center">{icon}</span>
          )}

          <span className="select-none">{text}</span>

          {icon && icon_position === 'right' && (
            <span className="ml-2 inline-flex items-center">{icon}</span>
          )}
        </>
      )
    }

    return (
      <ShadcnButton
        ref={ref}
        variant={getShadcnVariant(variant)}
        size={getShadcnSize(size)}
        disabled={disabled || loading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        data-testid="button"
        data-variant={variant}
        data-size={getDataSize(size)}
        data-disabled={disabled.toString()}
        data-loading={loading.toString()}
        aria-disabled={disabled}
        className={cn(
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          disabled && 'cursor-not-allowed',
          loading && 'relative',
          className
        )}
        {...props}
      >
        {renderContent()}
      </ShadcnButton>
    )
  }
)

Button.displayName = 'LowcodeButton'
