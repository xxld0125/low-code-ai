/**
 * Card 图标组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'

export interface CardIconProps {
  size?: number
  className?: string
}

export const CardIcon: React.FC<CardIconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 卡片图标 */}
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <rect x="6" y="8" width="12" height="2" rx="1" fill="currentColor" />
      <rect x="6" y="12" width="8" height="2" rx="1" fill="currentColor" />
    </svg>
  )
}
