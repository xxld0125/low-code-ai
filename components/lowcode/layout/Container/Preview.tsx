/**
 * Container 预览组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { Container } from './Container'
import type { ContainerProps } from '@/types/lowcode/component'
import type { BackgroundValue } from '@/types/lowcode/style'

interface ContainerPreviewProps {
  props?: Partial<ContainerProps>
  styles?: Record<string, any>
  onClick?: () => void
}

export const ContainerPreview: React.FC<ContainerPreviewProps> = ({
  props = {},
  styles = {},
  onClick,
}) => {
  const defaultPreviewProps: ContainerProps = {
    direction: 'column',
    gap: 8,
    padding: { x: 12, y: 8 },
    background: { color: '#f8fafc' } as BackgroundValue,
    rounded: 'small',
    border: true,
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
      <Container {...mergedProps}>
        {/* 模拟内容 */}
        <div className="flex flex-col gap-2">
          <div className="h-2 w-16 rounded bg-gray-300"></div>
          <div className="h-2 w-12 rounded bg-gray-400"></div>
          <div className="h-2 w-14 rounded bg-gray-300"></div>
        </div>
      </Container>
    </div>
  )
}
