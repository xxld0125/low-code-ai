/**
 * Col 预览组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { Col } from './Col'
import type { ColProps } from '@/types/lowcode/component'

interface ColPreviewProps {
  props?: Partial<ColProps>
  styles?: Record<string, any>
  onClick?: () => void
}

export const ColPreview: React.FC<ColPreviewProps> = ({ props = {}, styles = {}, onClick }) => {
  const defaultPreviewProps: ColProps = {
    span: 12,
    padding: { x: 8, y: 8 },
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
      <Col {...mergedProps}>
        {/* 模拟内容 */}
        <div className="flex flex-col gap-2">
          <div className="h-2 w-12 rounded bg-blue-300"></div>
          <div className="h-2 w-16 rounded bg-blue-400"></div>
          <div className="h-2 w-10 rounded bg-blue-300"></div>
        </div>
      </Col>
    </div>
  )
}
