/**
 * Badge 预览组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { Badge } from './Badge'
import type { LowcodeBadgeProps } from './Badge'

export interface BadgePreviewProps {
  props?: Partial<LowcodeBadgeProps>
  styles?: Record<string, any>
  onClick?: () => void
}

export const BadgePreview: React.FC<BadgePreviewProps> = ({ props = {}, styles = {}, onClick }) => {
  const defaultPreviewProps: LowcodeBadgeProps = {
    content: '徽章',
    variant: 'default',
    size: 'default',
    rounded: 'full',
  }

  const mergedProps = { ...defaultPreviewProps, ...props }

  return (
    <div
      className="flex h-16 w-full cursor-pointer items-center justify-center rounded border border-gray-200 bg-white p-2 hover:border-blue-300 hover:bg-blue-50"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.()
        }
      }}
    >
      <div className="flex items-center space-x-2">
        <Badge content={mergedProps.content} variant="default" size="sm" rounded="full" />
        <span className="text-sm text-gray-700">徽章</span>
        <div className="h-2 w-2 rounded-full bg-red-400"></div>
      </div>
    </div>
  )
}
