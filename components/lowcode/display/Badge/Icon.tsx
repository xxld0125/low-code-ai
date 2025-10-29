/**
 * Badge 图标组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'

export interface BadgeIconProps {
  size?: number
  className?: string
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 徽章图标 */}
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="currentColor" />
      <circle cx="12" cy="12" r="7" fill="white" />
      <circle cx="12" cy="10" r="3" fill="currentColor" />
    </svg>
  )
}
