/**
 * Text 图标组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'

export interface TextIconProps {
  size?: number
  className?: string
}

export const TextIcon: React.FC<TextIconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 文本行图标 */}
      <rect x="3" y="5" width="18" height="2" rx="1" fill="currentColor" />
      <rect x="3" y="11" width="14" height="2" rx="1" fill="currentColor" />
      <rect x="3" y="17" width="16" height="2" rx="1" fill="currentColor" />
    </svg>
  )
}
