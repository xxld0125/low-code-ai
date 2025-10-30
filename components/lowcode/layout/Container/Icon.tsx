import React from 'react'
import { cn } from '@/lib/utils'

interface ContainerIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  className?: string
}

export const ContainerIcon: React.FC<ContainerIconProps> = ({
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
      aria-hidden="true"
      role="img"
      focusable="false"
      {...props}
    >
      {/* 外边框 */}
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        ry="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />

      {/* 内部内容区域表示 */}
      <rect
        x="6"
        y="6"
        width="12"
        height="2"
        rx="1"
        fill="currentColor"
        opacity="0.8"
      />

      <rect
        x="6"
        y="10"
        width="8"
        height="2"
        rx="1"
        fill="currentColor"
        opacity="0.6"
      />

      <rect
        x="6"
        y="14"
        width="10"
        height="2"
        rx="1"
        fill="currentColor"
        opacity="0.7"
      />

      {/* 装饰性圆点表示容器是可交互的 */}
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
export const ContainerIconSmall: React.FC<Omit<ContainerIconProps, 'size'>> = (props) => {
  return (
    <ContainerIcon
      size={16}
      {...props}
    />
  )
}

// 大尺寸图标，用于详情展示
export const ContainerIconLarge: React.FC<Omit<ContainerIconProps, 'size'>> = (props) => {
  return (
    <ContainerIcon
      size={32}
      {...props}
    />
  )
}

export default ContainerIcon