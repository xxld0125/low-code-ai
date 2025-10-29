/**
 * Textarea 图标组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'

export interface TextareaIconProps {
  size?: number | string
  className?: string
  color?: string
  variant?: 'default' | 'filled' | 'outlined' | 'dashed'
}

export const TextareaIcon: React.FC<TextareaIconProps> = ({
  size = 24,
  className = '',
  color = 'currentColor',
  variant = 'default',
}) => {
  // 根据变体选择不同的图标样式
  const getIconStyle = () => {
    switch (variant) {
      case 'filled':
        return {
          fill: color,
          stroke: 'none',
        }
      case 'outlined':
        return {
          fill: 'none',
          stroke: color,
        }
      case 'dashed':
        return {
          fill: 'none',
          stroke: color,
          strokeDasharray: '2 2',
        }
      default:
        return {
          fill: 'none',
          stroke: color,
        }
    }
  }

  const iconStyle = getIconStyle()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 文本域外框 */}
      <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth="2" style={iconStyle} />

      {/* 文本行指示 */}
      <g stroke={color} strokeWidth="1.5" opacity="0.6">
        <line x1="6" y1="10" x2="10" y2="10" strokeLinecap="round" />
        <line x1="6" y1="13" x2="14" y2="13" strokeLinecap="round" />
        <line x1="6" y1="16" x2="12" y2="16" strokeLinecap="round" />
      </g>

      {/* 调整大小指示器 */}
      {variant !== 'filled' && (
        <g opacity="0.4">
          <line
            x1="18"
            y1="16"
            x2="19"
            y2="17"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="16"
            y1="18"
            x2="17"
            y2="17"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  )
}

// 特殊变体的图标
export const TextareaFilledIcon: React.FC<Omit<TextareaIconProps, 'variant'>> = props => (
  <TextareaIcon {...props} variant="filled" />
)

export const TextareaOutlinedIcon: React.FC<Omit<TextareaIconProps, 'variant'>> = props => (
  <TextareaIcon {...props} variant="outlined" />
)

export const TextareaDashedIcon: React.FC<Omit<TextareaIconProps, 'variant'>> = props => (
  <TextareaIcon {...props} variant="dashed" />
)

// 简化版本的图标（用于小尺寸）
export const TextareaSimpleIcon: React.FC<TextareaIconProps> = ({
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
    stroke={color}
  >
    <rect x="4" y="7" width="16" height="10" rx="2" strokeWidth="2" />
    <line x1="7" y1="11" x2="11" y2="11" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="7" y1="14" x2="13" y2="14" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

// 带动画效果的图标
export const TextareaAnimatedIcon: React.FC<TextareaIconProps> = ({
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
    stroke={color}
  >
    {/* 动画外框 */}
    <rect
      x="3"
      y="6"
      width="18"
      height="12"
      rx="2"
      strokeWidth="2"
      className="transition-all duration-200"
    />

    {/* 动画文本行 */}
    <g strokeWidth="1.5" className="transition-all duration-300">
      <line x1="6" y1="10" x2="10" y2="10" strokeLinecap="round" opacity="0.6">
        <animate attributeName="x2" values="10;14;10" dur="2s" repeatCount="indefinite" />
      </line>
      <line x1="6" y1="13" x2="14" y2="13" strokeLinecap="round" opacity="0.6">
        <animate attributeName="x2" values="14;10;14" dur="2s" repeatCount="indefinite" />
      </line>
      <line x1="6" y1="16" x2="12" y2="16" strokeLinecap="round" opacity="0.6">
        <animate attributeName="x2" values="12;15;12" dur="2s" repeatCount="indefinite" />
      </line>
    </g>

    {/* 动画调整指示器 */}
    <g opacity="0.4" className="transition-all duration-200">
      <line x1="18" y1="16" x2="19" y2="17" strokeWidth="1.5" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.2;1"
          dur="1.5s"
          repeatCount="indefinite"
          additive="sum"
        />
      </line>
      <line x1="16" y1="18" x2="17" y2="17" strokeWidth="1.5" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.2;1"
          dur="1.5s"
          repeatCount="indefinite"
          additive="sum"
        />
      </line>
    </g>
  </svg>
)

// 带字符计数指示的图标
export const TextareaCounterIcon: React.FC<
  TextareaIconProps & {
    current?: number
    max?: number
  }
> = ({ size = 24, className = '', color = 'currentColor', current = 0, max = 100 }) => {
  const percentage = Math.min((current / max) * 100, 100)
  const isNearLimit = percentage > 80
  const isOverLimit = current > max

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 文本域外框 */}
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="2"
        stroke={isOverLimit ? '#ef4444' : color}
        strokeWidth="2"
        fill="none"
      />

      {/* 文本行 */}
      <g stroke={color} strokeWidth="1.5" opacity="0.6">
        <line x1="6" y1="10" x2="10" y2="10" strokeLinecap="round" />
        <line x1="6" y1="13" x2="14" y2="13" strokeLinecap="round" />
        <line x1="6" y1="16" x2="12" y2="16" strokeLinecap="round" />
      </g>

      {/* 字符计数指示器 */}
      <g transform="translate(18, 18)">
        {/* 背景圆 */}
        <circle
          cx="0"
          cy="0"
          r="4"
          fill="white"
          stroke={isOverLimit ? '#ef4444' : isNearLimit ? '#f59e0b' : color}
          strokeWidth="1"
        />

        {/* 进度圆 */}
        {percentage > 0 && (
          <circle
            cx="0"
            cy="0"
            r="3"
            fill="none"
            stroke={isOverLimit ? '#ef4444' : isNearLimit ? '#f59e0b' : '#10b981'}
            strokeWidth="1.5"
            strokeDasharray={`${(percentage / 100) * 18.85} 18.85`}
            transform="rotate(-90 0 0)"
            className="transition-all duration-300"
          />
        )}

        {/* 数字指示 */}
        <text
          x="0"
          y="0"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="6"
          fill={isOverLimit ? '#ef4444' : isNearLimit ? '#f59e0b' : color}
          fontWeight="bold"
        >
          {Math.min(current, 99)}
        </text>
      </g>
    </svg>
  )
}

// 带错误状态的图标
export const TextareaErrorIcon: React.FC<TextareaIconProps> = ({
  size = 24,
  className = '',
  color = '#ef4444',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* 错误状态的外框 */}
    <rect x="3" y="6" width="18" height="12" rx="2" stroke={color} strokeWidth="2" fill="none" />

    {/* 错误指示线 */}
    <line x1="3" y1="6" x2="21" y2="18" stroke={color} strokeWidth="1" opacity="0.5" />
    <line x1="21" y1="6" x2="3" y2="18" stroke={color} strokeWidth="1" opacity="0.5" />

    {/* 错误图标 */}
    <g transform="translate(12, 12)">
      <circle cx="0" cy="0" r="6" fill={color} opacity="0.1" />
      <circle cx="0" cy="0" r="5" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="-2" y1="-2" x2="2" y2="2" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="-2" x2="-2" y2="2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
)

// 带成功状态的图标
export const TextareaSuccessIcon: React.FC<TextareaIconProps> = ({
  size = 24,
  className = '',
  color = '#10b981',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* 成功状态的外框 */}
    <rect x="3" y="6" width="18" height="12" rx="2" stroke={color} strokeWidth="2" fill="none" />

    {/* 成功指示背景 */}
    <rect x="3" y="6" width="18" height="12" rx="2" fill={color} opacity="0.1" />

    {/* 成功勾选 */}
    <g transform="translate(12, 12)">
      <circle cx="0" cy="0" r="6" fill="white" />
      <path
        d="M -3 0 L -1 2 L 3 -2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </g>
  </svg>
)

// 导出默认图标
export { TextareaIcon as default }
