import React from 'react'
import { cn } from '@/lib/utils'

interface DividerIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  className?: string
}

export const DividerIcon: React.FC<DividerIconProps> = ({
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
      {/* 水平分割线 */}
      <line
        x1="4"
        y1="12"
        x2="9"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* 中间圆点（表示可以带文本） */}
      <circle
        cx="12"
        cy="12"
        r="1.5"
        fill="currentColor"
      />

      {/* 水平分割线继续 */}
      <line
        x1="15"
        y1="12"
        x2="20"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* 垂直分割线（展示不同方向） */}
      <line
        x1="6"
        y1="18"
        x2="6"
        y2="21"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />

      <line
        x1="10"
        y1="18"
        x2="10"
        y2="21"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />

      <line
        x1="14"
        y1="18"
        x2="14"
        y2="21"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />

      <line
        x1="18"
        y1="18"
        x2="18"
        y2="21"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
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
export const DividerIconSmall: React.FC<Omit<DividerIconProps, 'size'>> = (props) => {
  return (
    <DividerIcon
      size={16}
      {...props}
    />
  )
}

// 大尺寸图标，用于详情展示
export const DividerIconLarge: React.FC<Omit<DividerIconProps, 'size'>> = (props) => {
  return (
    <DividerIcon
      size={32}
      {...props}
    />
  )
}

export default DividerIcon