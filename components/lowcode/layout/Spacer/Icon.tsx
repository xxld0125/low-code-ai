import React from 'react'
import { cn } from '@/lib/utils'

interface SpacerIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  className?: string
}

export const SpacerIcon: React.FC<SpacerIconProps> = ({
  size = 24,
  className,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-gray-600', className)}
      {...props}
    >
      {/* 上方内容块 */}
      <rect
        x="4"
        y="3"
        width="6"
        height="2"
        rx="1"
        fill="currentColor"
        opacity="0.7"
      />

      <rect
        x="14"
        y="3"
        width="6"
        height="2"
        rx="1"
        fill="currentColor"
        opacity="0.7"
      />

      {/* 间距区域（虚线表示） */}
      <rect
        x="4"
        y="7"
        width="16"
        height="2"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2,1"
        opacity="0.4"
      />

      {/* 间距指示器（小圆点） */}
      <circle
        cx="8"
        cy="8"
        r="1"
        fill="#3b82f6"
        opacity="0.8"
      />

      <circle
        cx="12"
        cy="8"
        r="1"
        fill="#3b82f6"
        opacity="0.8"
      />

      <circle
        cx="16"
        cy="8"
        r="1"
        fill="#3b82f6"
        opacity="0.8"
      />

      {/* 下方内容块 */}
      <rect
        x="4"
        y="13"
        width="8"
        height="2"
        rx="1"
        fill="currentColor"
        opacity="0.7"
      />

      <rect
        x="14"
        y="13"
        width="6"
        height="2"
        rx="1"
        fill="currentColor"
        opacity="0.7"
      />

      {/* 水平间距表示 */}
      <rect
        x="4"
        y="17"
        width="2"
        height="4"
        rx="1"
        fill="currentColor"
        opacity="0.6"
      />

      {/* 水平间距指示器 */}
      <circle
        cx="5"
        cy="19"
        r="0.5"
        fill="#3b82f6"
        opacity="0.8"
      />

      <rect
        x="10"
        y="17"
        width="2"
        height="4"
        rx="1"
        fill="currentColor"
        opacity="0.6"
      />

      <circle
        cx="11"
        cy="19"
        r="0.5"
        fill="#3b82f6"
        opacity="0.8"
      />

      <rect
        x="16"
        y="17"
        width="2"
        height="4"
        rx="1"
        fill="currentColor"
        opacity="0.6"
      />

      <circle
        cx="17"
        cy="19"
        r="0.5"
        fill="#3b82f6"
        opacity="0.8"
      />

      {/* 装饰性圆点表示可交互 */}
      <circle
        cx="20"
        cy="4"
        r="1.5"
        fill="#10b981"
        stroke="white"
        strokeWidth="0.5"
      />
    </svg>
  )
}

// 预览模式下的小图标
export const SpacerIconSmall: React.FC<Omit<SpacerIconProps, 'size'>> = (props) => {
  return (
    <SpacerIcon
      size={16}
      {...props}
    />
  )
}

// 大尺寸图标，用于详情展示
export const SpacerIconLarge: React.FC<Omit<SpacerIconProps, 'size'>> = (props) => {
  return (
    <SpacerIcon
      size={32}
      {...props}
    />
  )
}

export default SpacerIcon