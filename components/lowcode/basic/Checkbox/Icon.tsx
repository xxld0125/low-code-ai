/**
 * Checkbox 图标组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'

export interface CheckboxIconProps {
  size?: number | string
  className?: string
  variant?: 'unchecked' | 'checked' | 'indeterminate'
  color?: string
  strokeWidth?: number
}

export const CheckboxIcon: React.FC<CheckboxIconProps> = ({
  size = 20,
  className = '',
  variant = 'unchecked',
  color = 'currentColor',
  strokeWidth = 2,
}) => {
  const getIconContent = () => {
    switch (variant) {
      case 'checked':
        return (
          <polyline
            points="20 6 9 17 4 12"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )
      case 'indeterminate':
        return (
          <line
            x1="6"
            y1="12"
            x2="18"
            y2="12"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )
      default:
        return null
    }
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        ry="2"
        stroke={color}
        strokeWidth={strokeWidth}
        fill={variant === 'unchecked' ? 'none' : color}
        fillOpacity={variant === 'unchecked' ? 0 : 0.1}
      />
      {getIconContent()}
    </svg>
  )
}

// 预定义的图标组件
export const CheckboxUncheckedIcon: React.FC<Omit<CheckboxIconProps, 'variant'>> = props => (
  <CheckboxIcon {...props} variant="unchecked" />
)

export const CheckboxCheckedIcon: React.FC<Omit<CheckboxIconProps, 'variant'>> = props => (
  <CheckboxIcon {...props} variant="checked" />
)

export const CheckboxIndeterminateIcon: React.FC<Omit<CheckboxIconProps, 'variant'>> = props => (
  <CheckboxIcon {...props} variant="indeterminate" />
)

// 简单变体
export const CheckboxSimpleIcon: React.FC<CheckboxIconProps> = ({
  size = 20,
  className = '',
  variant = 'unchecked',
  color = 'currentColor',
}) => {
  return (
    <div
      className={className}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        border: `2px solid ${color}`,
        borderRadius: '4px',
        backgroundColor: variant !== 'unchecked' ? color : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {variant === 'checked' && (
        <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none">
          <polyline
            points="20 6 9 17 4 12"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {variant === 'indeterminate' && (
        <div
          style={{
            width: '60%',
            height: '3px',
            backgroundColor: 'white',
          }}
        />
      )}
    </div>
  )
}

// 动画变体
export const CheckboxAnimatedIcon: React.FC<CheckboxIconProps> = ({
  size = 20,
  className = '',
  variant = 'unchecked',
  color = 'currentColor',
}) => {
  return (
    <div
      className={`${className} transition-all duration-200`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        border: `2px solid ${color}`,
        borderRadius: '4px',
        backgroundColor: variant !== 'unchecked' ? color : 'transparent',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {variant === 'checked' && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: 'checkmark 0.2s ease-in-out',
          }}
        >
          <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none">
            <polyline
              points="20 6 9 17 4 12"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
      {variant === 'indeterminate' && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
          style={{
            width: '60%',
            height: '3px',
            backgroundColor: 'white',
            animation: 'indeterminate 0.2s ease-in-out',
          }}
        />
      )}
      <style jsx>{`
        @keyframes checkmark {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes indeterminate {
          0% {
            transform: translate(-50%, -50%) scaleX(0);
          }
          100% {
            transform: translate(-50%, -50%) scaleX(1);
          }
        }
      `}</style>
    </div>
  )
}

// 错误状态变体
export const CheckboxErrorIcon: React.FC<CheckboxIconProps> = ({
  size = 20,
  className = '',
  variant = 'unchecked',
  color = '#ef4444',
}) => {
  return (
    <div
      className={className}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        border: `2px solid ${color}`,
        borderRadius: '4px',
        backgroundColor: variant !== 'unchecked' ? color : 'transparent',
        position: 'relative',
      }}
    >
      {variant === 'checked' && (
        <svg
          width="60%"
          height="60%"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <polyline
            points="20 6 9 17 4 12"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {variant === 'indeterminate' && (
        <div
          style={{
            width: '60%',
            height: '3px',
            backgroundColor: 'white',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </div>
  )
}

// 禁用状态变体
export const CheckboxDisabledIcon: React.FC<CheckboxIconProps> = ({
  size = 20,
  className = '',
  variant = 'unchecked',
  color = '#d1d5db',
}) => {
  return (
    <div
      className={`${className} opacity-50`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        border: `2px solid ${color}`,
        borderRadius: '4px',
        backgroundColor: variant !== 'unchecked' ? color : 'transparent',
        position: 'relative',
      }}
    >
      {variant === 'checked' && (
        <svg
          width="60%"
          height="60%"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <polyline
            points="20 6 9 17 4 12"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {variant === 'indeterminate' && (
        <div
          style={{
            width: '60%',
            height: '3px',
            backgroundColor: 'white',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </div>
  )
}

export default CheckboxIcon
