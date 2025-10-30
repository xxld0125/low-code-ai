/**
 * Divider 预览组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { Divider } from './Divider'
import type { DividerProps } from '@/types/lowcode/component'

interface DividerPreviewProps {
  props?: Partial<DividerProps>
  styles?: Record<string, any>
  onClick?: () => void
}

export const DividerPreview: React.FC<DividerPreviewProps> = ({
  props = {},
  styles = {},
  onClick,
}) => {
  const defaultPreviewProps: DividerProps = {
    orientation: 'horizontal',
    thickness: 1,
    color: '#d1d5db',
    style: 'solid',
    length: '80%',
  }

  const mergedProps = { ...defaultPreviewProps, ...props }

  return (
    <div
      className="cursor-pointer transition-opacity hover:opacity-80"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.()
        }
      }}
    >
      <div className="flex flex-col items-center gap-4 p-4">
        {/* 水平分割线示例 */}
        <div className="w-full">
          <div className="mb-2 text-xs text-gray-500">水平分割线</div>
          <Divider {...mergedProps} orientation="horizontal" />
        </div>

        {/* 垂直分割线示例 */}
        <div className="flex w-full items-center justify-center gap-4">
          <div className="text-xs text-gray-500">垂直分割线</div>
          <div className="h-12">
            <Divider {...mergedProps} orientation="vertical" length="100%" />
          </div>
        </div>
      </div>
    </div>
  )
}
