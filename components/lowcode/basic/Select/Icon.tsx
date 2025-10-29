/**
 * Select 图标组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'

export interface SelectIconProps {
  size?: number | string
  className?: string
  variant?: 'open' | 'multiple' | 'simple' | 'animated' | 'selected' | 'error' | 'disabled'
  color?: string
  strokeWidth?: number
}

export const SelectIcon: React.FC<SelectIconProps> = ({
  size = 20,
  className = '',
  variant = 'open',
  color = 'currentColor',
  strokeWidth = 2,
}) => {
  const getIconContent = () => {
    switch (variant) {
      case 'open':
        return (
          <polyline
            points="6 9 12 15 18 9"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )
      case 'multiple':
        return (
          <>
            <rect
              x="3"
              y="3"
              width="7"
              height="7"
              rx="1"
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <rect
              x="14"
              y="3"
              width="7"
              height="7"
              rx="1"
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <rect
              x="3"
              y="14"
              width="7"
              height="7"
              rx="1"
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <rect
              x="14"
              y="14"
              width="7"
              height="7"
              rx="1"
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
            />
          </>
        )
      case 'selected':
        return (
          <>
            <polyline
              points="6 9 12 15 18 9"
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="8" r="1" fill={color} />
          </>
        )
      default:
        return (
          <polyline
            points="6 9 12 15 18 9"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )
    }
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {getIconContent()}
    </svg>
  )
}

// 预定义的图标组件
export const SelectOpenIcon: React.FC<Omit<SelectIconProps, 'variant'>> = props => (
  <SelectIcon {...props} variant="open" />
)

export const SelectMultipleIcon: React.FC<Omit<SelectIconProps, 'variant'>> = props => (
  <SelectIcon {...props} variant="multiple" />
)

export const SelectSimpleIcon: React.FC<SelectIconProps> = ({
  size = 20,
  className = '',
  variant = 'open',
  color = 'currentColor',
}) => {
  return (
    <div
      className={className}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
        <polyline
          points="6 9 12 15 18 9"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

// 动画变体
export const SelectAnimatedIcon: React.FC<SelectIconProps> = ({
  size = 20,
  className = '',
  variant = 'open',
  color = 'currentColor',
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div
      className={`${className} cursor-pointer transition-all duration-200`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
        <polyline
          points="6 9 12 15 18 9"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

// 选中状态变体
export const SelectSelectedIcon: React.FC<SelectIconProps> = ({
  size = 20,
  className = '',
  color = 'currentColor',
}) => {
  return (
    <div
      className={className}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        position: 'relative',
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
        <polyline
          points="6 9 12 15 18 9"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="8" r="1" fill={color} />
      </svg>
    </div>
  )
}

// 错误状态变体
export const SelectErrorIcon: React.FC<SelectIconProps> = ({
  size = 20,
  className = '',
  color = '#ef4444',
}) => {
  return (
    <div
      className={className}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
        <polyline
          points="6 9 12 15 18 9"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

// 禁用状态变体
export const SelectDisabledIcon: React.FC<SelectIconProps> = ({
  size = 20,
  className = '',
  color = '#d1d5db',
}) => {
  return (
    <div
      className={`${className} opacity-50`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
        <polyline
          points="6 9 12 15 18 9"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

export default SelectIcon
