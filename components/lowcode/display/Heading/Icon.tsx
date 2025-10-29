/**
 * Heading 图标组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'

export interface HeadingIconProps {
  size?: number
  className?: string
}

export const HeadingIcon: React.FC<HeadingIconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* H 标题图标 */}
      <path d="M3 5V7H8V19H10V7H15V5H3Z" fill="currentColor" />
      <path d="M21 9H18V5H16V19H18V11H21V9Z" fill="currentColor" />
    </svg>
  )
}
