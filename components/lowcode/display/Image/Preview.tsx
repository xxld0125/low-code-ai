/**
 * Image 预览组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { LowcodeImage } from './Image'
import type { LowcodeImageProps } from './Image'

export interface ImagePreviewProps {
  props?: Partial<LowcodeImageProps>
  styles?: Record<string, any>
  onClick?: () => void
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ props = {}, styles = {}, onClick }) => {
  const defaultPreviewProps: LowcodeImageProps = {
    src: '/api/placeholder/100/100',
    alt: '图片预览',
    width: 100,
    height: 100,
    object_fit: 'cover',
    rounded: 'md',
    shadow: 'sm',
    loading: 'lazy',
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
        <LowcodeImage
          src={mergedProps.src}
          alt={mergedProps.alt}
          width={32}
          height={32}
          object_fit="cover"
          rounded="md"
          shadow="sm"
          loading="lazy"
        />
        <span className="text-sm text-gray-700">图片</span>
        <div className="h-2 w-2 rounded-full bg-green-400"></div>
      </div>
    </div>
  )
}
