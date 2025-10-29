/**
 * Button 图标组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'

export interface ButtonIconProps {
  size?: number | string
  className?: string
  color?: string
  variant?: 'default' | 'primary' | 'secondary' | 'outline'
}

export const ButtonIcon: React.FC<ButtonIconProps> = ({
  size = 24,
  className = '',
  color = 'currentColor',
  variant = 'default',
}) => {
  // 根据变体选择不同的图标样式
  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return '#ffffff'
      case 'secondary':
        return '#ffffff'
      case 'outline':
        return color
      default:
        return color
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
      style={{ color: getIconColor() }}
    >
      {/* 按钮外框 */}
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="6"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      {/* 按钮内部填充 */}
      <rect x="5" y="8" width="14" height="8" rx="4" fill="currentColor" opacity="0.1" />

      {/* 按钮文字指示线 */}
      <line
        x1="8"
        y1="12"
        x2="16"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* 点击指示点 */}
      <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.6" />
    </svg>
  )
}

// 特殊变体的图标
export const ButtonPrimaryIcon: React.FC<Omit<ButtonIconProps, 'variant'>> = props => (
  <ButtonIcon {...props} variant="primary" />
)

export const ButtonSecondaryIcon: React.FC<Omit<ButtonIconProps, 'variant'>> = props => (
  <ButtonIcon {...props} variant="secondary" />
)

export const ButtonOutlineIcon: React.FC<Omit<ButtonIconProps, 'variant'>> = props => (
  <ButtonIcon {...props} variant="outline" />
)

// 简化版本的图标（用于小尺寸）
export const ButtonSimpleIcon: React.FC<ButtonIconProps> = ({
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
      rx="5"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <line
      x1="8"
      y1="12"
      x2="16"
      y2="12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

// 带点击效果的图标
export const ButtonAnimatedIcon: React.FC<ButtonIconProps> = ({
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
    className={`${className} transition-all duration-200 hover:scale-105`}
    style={{ color }}
  >
    {/* 主要按钮形状 */}
    <rect
      x="3"
      y="6"
      width="18"
      height="12"
      rx="6"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      className="transition-all duration-200"
    />

    {/* 点击波纹效果 */}
    <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0" className="animate-ping" />

    {/* 中心指示器 */}
    <circle cx="12" cy="12" r="1.5" fill="currentColor" className="transition-all duration-200" />

    {/* 悬停高亮 */}
    <rect
      x="5"
      y="8"
      width="14"
      height="8"
      rx="4"
      fill="currentColor"
      opacity="0.05"
      className="transition-opacity duration-200"
    />
  </svg>
)
