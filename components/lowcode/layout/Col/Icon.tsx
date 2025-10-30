import React from 'react'
import { cn } from '@/lib/utils'

interface ColIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  className?: string
}

export const ColIcon: React.FC<ColIconProps> = ({
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
      {/* 表示垂直排列的矩形 */}
      <rect
        x="4"
        y="2"
        width="16"
        height="20"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />

      {/* 内部分隔线表示列结构 */}
      <line
        x1="12"
        y1="2"
        x2="12"
        y2="22"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
      />

      {/* 上半部分内容 */}
      <rect
        x="6"
        y="6"
        width="5"
        height="2"
        rx="1"
        fill="currentColor"
        opacity="0.8"
      />

      <rect
        x="6"
        y="10"
        width="4"
        height="2"
        rx="1"
        fill="currentColor"
        opacity="0.6"
      />

      {/* 下半部分内容 */}
      <rect
        x="13"
        y="6"
        width="5"
        height="2"
        rx="1"
        fill="currentColor"
        opacity="0.8"
      />

      <rect
        x="13"
        y="10"
        width="4"
        height="2"
        rx="1"
        fill="currentColor"
        opacity="0.6"
      />

      {/* 底部装饰线 */}
      <rect
        x="6"
        y="16"
        width="5"
        height="2"
        rx="1"
        fill="currentColor"
        opacity="0.7"
      />

      <rect
        x="13"
        y="16"
        width="5"
        height="2"
        rx="1"
        fill="currentColor"
        opacity="0.7"
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
export const ColIconSmall: React.FC<Omit<ColIconProps, 'size'>> = (props) => {
  return (
    <ColIcon
      size={16}
      {...props}
    />
  )
}

// 大尺寸图标，用于详情展示
export const ColIconLarge: React.FC<Omit<ColIconProps, 'size'>> = (props) => {
  return (
    <ColIcon
      size={32}
      {...props}
    />
  )
}

export default ColIcon