/**
 * Heading 预览组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { Heading } from './Heading'
import type { LowcodeHeadingProps } from './Heading'

export interface HeadingPreviewProps {
  props?: Partial<LowcodeHeadingProps>
  styles?: Record<string, any>
  onClick?: () => void
}

export const HeadingPreview: React.FC<HeadingPreviewProps> = ({
  props = {},
  styles = {},
  onClick,
}) => {
  const defaultPreviewProps: LowcodeHeadingProps = {
    content: '标题预览',
    level: 3,
    size: 'auto',
    weight: 'semibold',
    align: 'left',
    color: '#111827',
    decoration: 'none',
  }

  const mergedProps = { ...defaultPreviewProps, ...props }

  return (
    <div
      className="flex h-12 w-full cursor-pointer items-center justify-center rounded border border-gray-200 bg-gray-50 p-2 hover:border-blue-300 hover:bg-blue-50"
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
        <Heading
          content={mergedProps.content}
          level={3}
          size="base"
          weight="semibold"
          align="left"
          color="#374151"
          decoration="none"
        />
        <div className="h-2 w-2 rounded-full bg-purple-400"></div>
      </div>
    </div>
  )
}
