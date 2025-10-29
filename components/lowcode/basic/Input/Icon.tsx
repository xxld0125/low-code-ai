/**
 * Input 图标组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'

export interface InputIconProps {
  size?: number | string
  className?: string
  color?: string
  variant?: 'default' | 'text' | 'password' | 'email' | 'number' | 'search'
}

export const InputIcon: React.FC<InputIconProps> = ({
  size = 24,
  className = '',
  color = 'currentColor',
  variant = 'default',
}) => {
  // 根据变体选择不同的图标样式
  const getIconPath = () => {
    switch (variant) {
      case 'password':
        return (
          <>
            {/* 密码锁图标 */}
            <rect
              x="6"
              y="11"
              width="12"
              height="9"
              rx="1"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M8 11V7C8 4.23858 10.2386 2 13 2C15.7614 2 18 4.23858 18 7V11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="13" cy="15" r="1" fill="currentColor" />
          </>
        )
      case 'email':
        return (
          <>
            {/* 邮件图标 */}
            <rect
              x="3"
              y="6"
              width="18"
              height="12"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M3 8L12 13L21 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        )
      case 'number':
        return (
          <>
            {/* 数字键盘图标 */}
            <rect
              x="4"
              y="6"
              width="16"
              height="12"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <rect x="7" y="9" width="2" height="2" fill="currentColor" />
            <rect x="11" y="9" width="2" height="2" fill="currentColor" />
            <rect x="15" y="9" width="2" height="2" fill="currentColor" />
            <rect x="7" y="13" width="2" height="2" fill="currentColor" />
            <rect x="11" y="13" width="2" height="2" fill="currentColor" />
            <rect x="15" y="13" width="2" height="2" fill="currentColor" />
          </>
        )
      case 'search':
        return (
          <>
            {/* 搜索图标 */}
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
            <path
              d="M21 21L16.65 16.65"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )
      default:
        return (
          <>
            {/* 默认输入框图标 */}
            <rect
              x="3"
              y="6"
              width="18"
              height="12"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            {/* 光标线 */}
            <line
              x1="7"
              y1="12"
              x2="10"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* 输入内容指示线 */}
            <line
              x1="12"
              y1="12"
              x2="16"
              y2="12"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.6"
            />
          </>
        )
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color }}
    >
      {getIconPath()}
    </svg>
  )
}

// 特殊变体的图标
export const InputTextIcon: React.FC<Omit<InputIconProps, 'variant'>> = props => (
  <InputIcon {...props} variant="text" />
)

export const InputPasswordIcon: React.FC<Omit<InputIconProps, 'variant'>> = props => (
  <InputIcon {...props} variant="password" />
)

export const InputEmailIcon: React.FC<Omit<InputIconProps, 'variant'>> = props => (
  <InputIcon {...props} variant="email" />
)

export const InputNumberIcon: React.FC<Omit<InputIconProps, 'variant'>> = props => (
  <InputIcon {...props} variant="number" />
)

export const InputSearchIcon: React.FC<Omit<InputIconProps, 'variant'>> = props => (
  <InputIcon {...props} variant="search" />
)

// 简化版本的图标（用于小尺寸）
export const InputSimpleIcon: React.FC<InputIconProps> = ({
  size = 20,
  className = '',
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ color }}
  >
    <rect
      x="4"
      y="7"
      width="16"
      height="10"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <line
      x1="7"
      y1="12"
      x2="17"
      y2="12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

// 带焦点状态的图标
export const InputFocusedIcon: React.FC<InputIconProps> = ({
  size = 24,
  className = '',
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} transition-all duration-200`}
    style={{ color }}
  >
    {/* 输入框主体 */}
    <rect
      x="3"
      y="6"
      width="18"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      className="transition-all duration-200"
    />

    {/* 焦点环 */}
    <rect
      x="1"
      y="4"
      width="22"
      height="16"
      rx="3"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      opacity="0.3"
      className="animate-pulse"
    />

    {/* 光标动画 */}
    <line
      x1="7"
      y1="12"
      x2="10"
      y2="12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="animate-pulse"
    />

    {/* 输入内容 */}
    <line
      x1="12"
      y1="12"
      x2="16"
      y2="12"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
)
