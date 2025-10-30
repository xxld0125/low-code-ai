/**
 * Spacer 预览组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { Spacer } from './Spacer'
import type { SpacerProps } from '@/types/lowcode/component'

interface SpacerPreviewProps {
  props?: Partial<SpacerProps>
  styles?: Record<string, any>
  onClick?: () => void
}

export const SpacerPreview: React.FC<SpacerPreviewProps> = ({
  props = {},
  styles = {},
  onClick,
}) => {
  const defaultPreviewProps: SpacerProps = {
    size: 16,
    direction: 'vertical',
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
        {/* 垂直间距示例 */}
        <div className="w-full">
          <div className="mb-2 text-xs text-gray-500">垂直间距</div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-8 rounded bg-gray-300"></div>
            <Spacer {...mergedProps} direction="vertical" size={8} />
            <div className="h-2 w-12 rounded bg-gray-400"></div>
          </div>
        </div>

        {/* 水平间距示例 */}
        <div className="w-full">
          <div className="mb-2 text-xs text-gray-500">水平间距</div>
          <div className="flex items-center justify-center">
            <div className="h-2 w-6 rounded bg-gray-300"></div>
            <Spacer {...mergedProps} direction="horizontal" size={12} />
            <div className="h-2 w-8 rounded bg-gray-400"></div>
          </div>
        </div>

        {/* 弹性间距示例 */}
        <div className="w-full">
          <div className="mb-2 text-xs text-gray-500">弹性间距</div>
          <div className="flex h-8 items-center">
            <div className="h-2 w-8 rounded bg-gray-300"></div>
            <Spacer direction="horizontal" size={16} />
            <div className="h-2 w-8 rounded bg-gray-400"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
