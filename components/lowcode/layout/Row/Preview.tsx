/**
 * Row 预览组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { Row } from './Row'
import type { RowProps } from '@/types/lowcode/component'

interface RowPreviewProps {
  props?: Partial<RowProps>
  styles?: Record<string, any>
  onClick?: () => void
}

export const RowPreview: React.FC<RowPreviewProps> = ({ props = {}, styles = {}, onClick }) => {
  const defaultPreviewProps: RowProps = {
    gap: 8,
    justify: 'start',
    align: 'center',
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
      <Row {...mergedProps}>
        {/* 模拟内容 */}
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded bg-blue-300"></div>
          <div className="h-8 w-8 rounded bg-blue-400"></div>
          <div className="h-8 w-8 rounded bg-blue-300"></div>
        </div>
      </Row>
    </div>
  )
}
