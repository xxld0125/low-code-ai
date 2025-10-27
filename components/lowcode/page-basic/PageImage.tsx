/**
 * 页面设计器图片组件
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import React, { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ComponentRendererProps } from '@/types/page-designer/component'

export const PageImage: React.FC<ComponentRendererProps> = ({
  id,
  props,
  styles,
  isSelected,
  isDragging,
  onSelect,
  onDelete,
}) => {
  const imageProps = props.image || {
    src: '/api/placeholder/300/200',
    alt: '图片',
    width: 300,
    height: 200,
    objectFit: 'cover',
    rounded: false,
    shadow: false,
    loading: 'lazy',
  }

  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect?.(id)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // 双击编辑或其他操作
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.stopPropagation()
      onDelete?.(id)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  // 合并默认样式和自定义样式
  const mergedStyles: React.CSSProperties = {
    width: styles.width || imageProps.width || 'auto',
    height: styles.height || imageProps.height || 'auto',
    cursor: isDragging ? 'grabbing' : 'pointer',
    transition: styles.transition || 'all 0.2s ease-in-out',
    userSelect: 'none',
    objectFit: (imageProps as any).object_fit || 'cover',
    // 过滤掉不兼容的样式属性
    boxShadow:
      styles.boxShadow && typeof styles.boxShadow === 'string' ? styles.boxShadow : undefined,
    background:
      styles.background && typeof styles.background === 'string' ? styles.background : undefined,
    border: styles.border && typeof styles.border === 'string' ? styles.border : undefined,
    borderRadius:
      styles.borderRadius && typeof styles.borderRadius !== 'boolean'
        ? styles.borderRadius
        : undefined,
    margin: styles.margin && typeof styles.margin === 'string' ? styles.margin : undefined,
    padding: styles.padding && typeof styles.padding === 'string' ? styles.padding : undefined,
    // 直接支持的标准CSS属性
    color: styles.color,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    fontFamily: styles.fontFamily,
    textAlign: styles.textAlign,
    textDecoration: styles.textDecoration,
    textTransform: styles.textTransform,
    lineHeight: styles.lineHeight,
    opacity: styles.opacity,
    position: styles.position,
    top: styles.top,
    right: styles.right,
    bottom: styles.bottom,
    left: styles.left,
    zIndex: styles.zIndex,
    display: styles.display,
    minWidth: styles.minWidth,
    minHeight: styles.minHeight,
    maxWidth: styles.maxWidth,
    maxHeight: styles.maxHeight,
  }

  // 获取圆角样式
  const getRoundedClass = (rounded: boolean | string | undefined) => {
    if (!rounded) return ''
    if (typeof rounded === 'boolean') {
      return rounded ? 'rounded-lg' : ''
    }
    return `rounded-${rounded}`
  }

  // 获取阴影样式
  const getShadowClass = (shadow: boolean | string | undefined) => {
    if (!shadow) return ''
    if (typeof shadow === 'boolean') {
      return shadow ? 'shadow-lg' : ''
    }
    return `shadow-${shadow}`
  }

  return (
    <div
      data-component-id={id}
      data-component-type="image"
      style={mergedStyles}
      className={cn(
        'page-designer-image',
        'relative inline-block',
        'transition-all duration-200',
        getRoundedClass(imageProps.rounded),
        getShadowClass(imageProps.shadow),
        isSelected && 'ring-2 ring-blue-500 ring-offset-2',
        isDragging && 'opacity-75',
        'hover:opacity-90',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        props.className
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="img"
      aria-label={imageProps.alt || '图片'}
    >
      {hasError ? (
        // 错误状态
        <div
          className={cn(
            'flex items-center justify-center bg-gray-100 text-gray-500',
            'border-2 border-dashed border-gray-300',
            getRoundedClass(imageProps.rounded)
          )}
          style={{
            width: imageProps.width,
            height: imageProps.height,
          }}
        >
          <div className="p-4 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm">图片加载失败</p>
          </div>
        </div>
      ) : (
        <>
          {isLoading && (
            // 加载状态
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center bg-gray-100',
                getRoundedClass(imageProps.rounded)
              )}
            >
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
            </div>
          )}

          <Image
            src={imageProps.src}
            alt={imageProps.alt || '图片'}
            width={typeof imageProps.width === 'number' ? imageProps.width : 300}
            height={typeof imageProps.height === 'number' ? imageProps.height : 200}
            className={cn(
              'transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100',
              getRoundedClass(imageProps.rounded)
            )}
            style={mergedStyles}
            onLoad={handleLoad}
            onError={handleError}
            priority={imageProps.loading === 'eager'}
            quality={85}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </>
      )}

      {/* 图片信息叠加层 */}
      {isSelected && (
        <div className="absolute left-2 top-2 rounded bg-black bg-opacity-50 px-2 py-1 text-xs text-white">
          {imageProps.width} × {imageProps.height}
        </div>
      )}
    </div>
  )
}

// 图片预览组件（用于组件面板）
export const PageImagePreview: React.FC<{
  onClick?: () => void
}> = ({ onClick }) => {
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
        <svg
          className="h-6 w-6 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-sm text-gray-700">图片</span>
      </div>
    </div>
  )
}
