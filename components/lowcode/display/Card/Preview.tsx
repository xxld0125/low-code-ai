/**
 * Card 预览组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { Card } from './Card'
import type { LowcodeCardProps } from './Card'

export interface CardPreviewProps {
  props?: Partial<LowcodeCardProps>
  styles?: Record<string, any>
  onClick?: () => void
}

export const CardPreview: React.FC<CardPreviewProps> = ({ props = {}, styles = {}, onClick }) => {
  const defaultPreviewProps: LowcodeCardProps = {
    title: '卡片',
    description: '卡片预览',
    footer: '',
    padding: 'small',
    rounded: 'medium',
    shadow: 'small',
    border: 'light',
    background: '#ffffff',
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
        <div className="h-8 w-10 rounded-sm border border-gray-300 bg-white p-1 shadow-sm">
          <div className="flex h-full flex-col justify-between">
            <div className="h-1 w-full rounded-sm bg-gray-400"></div>
            <div className="h-0.5 w-3/4 rounded-sm bg-gray-300"></div>
            <div className="h-0.5 w-1/2 rounded-sm bg-gray-200"></div>
          </div>
        </div>
        <span className="text-sm text-gray-700">卡片</span>
        <div className="h-2 w-2 rounded-full bg-orange-400"></div>
      </div>
    </div>
  )
}
