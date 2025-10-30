import React from 'react'
import { cn } from '@/lib/utils'

interface RowIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  className?: string
}

export const RowIcon: React.FC<RowIconProps> = ({
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
      {/* 表示水平排列的矩形 */}
      <rect
        x="2"
        y="6"
        width="20"
        height="3"
        rx="1.5"
        fill="currentColor"
        opacity="0.9"
      />

      <rect
        x="2"
        y="10.5"
        width="20"
        height="3"
        rx="1.5"
        fill="currentColor"
        opacity="0.7"
      />

      <rect
        x="2"
        y="15"
        width="20"
        height="3"
        rx="1.5"
        fill="currentColor"
        opacity="0.8"
      />

      {/* 左右箭头表示水平方向 */}
      <path
        d="M 1 12 L 5 9 M 1 12 L 5 15 M 23 12 L 19 9 M 23 12 L 19 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
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
export const RowIconSmall: React.FC<Omit<RowIconProps, 'size'>> = (props) => {
  return (
    <RowIcon
      size={16}
      {...props}
    />
  )
}

// 大尺寸图标，用于详情展示
export const RowIconLarge: React.FC<Omit<RowIconProps, 'size'>> = (props) => {
  return (
    <RowIcon
      size={32}
      {...props}
    />
  )
}

export default RowIcon