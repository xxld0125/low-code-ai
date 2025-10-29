/**
 * Image 组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React, { useState } from 'react'
import NextImage from 'next/image'
import { cn } from '@/lib/utils'

export interface LowcodeImageProps {
  src?: string
  alt?: string
  width?: number | string
  height?: number | string
  object_fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: 'lazy' | 'eager'
  className?: string
}

export const LowcodeImage = React.forwardRef<HTMLDivElement, LowcodeImageProps>(
  (
    {
      src = '/api/placeholder/300/200',
      alt = '图片',
      width = 300,
      height = 200,
      object_fit = 'cover',
      rounded = 'none',
      shadow = 'none',
      loading = 'lazy',
      className,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    const handleLoad = () => {
      setIsLoading(false)
      setHasError(false)
    }

    const handleError = () => {
      setIsLoading(false)
      setHasError(true)
    }

    // 获取圆角样式类
    const getRoundedClass = (rounded: string) => {
      switch (rounded) {
        case 'none':
          return ''
        case 'sm':
          return 'rounded-sm'
        case 'md':
          return 'rounded-md'
        case 'lg':
          return 'rounded-lg'
        case 'xl':
          return 'rounded-xl'
        case 'full':
          return 'rounded-full'
        default:
          return ''
      }
    }

    // 获取阴影样式类
    const getShadowClass = (shadow: string) => {
      switch (shadow) {
        case 'none':
          return ''
        case 'sm':
          return 'shadow-sm'
        case 'md':
          return 'shadow-md'
        case 'lg':
          return 'shadow-lg'
        case 'xl':
          return 'shadow-xl'
        default:
          return ''
      }
    }

    // 处理宽高值
    const getImageSize = (value: number | string): number => {
      if (typeof value === 'number') {
        return value
      }
      // 如果是字符串，尝试解析为数字
      const parsed = parseInt(value, 10)
      return isNaN(parsed) ? 300 : parsed
    }

    const imageWidth = getImageSize(width)
    const imageHeight = getImageSize(height)

    // 构建容器样式
    const containerClasses = cn(
      // 基础样式
      'relative inline-block overflow-hidden',
      'transition-all duration-200',

      // 动态样式
      getRoundedClass(rounded),
      getShadowClass(shadow),

      // 状态样式
      'hover:opacity-95',

      // 自定义样式
      className
    )

    // 构建容器内联样式
    const containerStyles: React.CSSProperties = {
      width: typeof width === 'string' && width.includes('%') ? width : undefined,
      height: typeof height === 'string' && height.includes('%') ? height : undefined,
    }

    return (
      <div ref={ref} className={containerClasses} style={containerStyles} {...props}>
        {hasError ? (
          // 错误状态
          <div
            className={cn(
              'flex items-center justify-center bg-gray-100 text-gray-500',
              'border-2 border-dashed border-gray-300',
              getRoundedClass(rounded)
            )}
            style={{
              width: typeof width === 'string' && width.includes('%') ? '100%' : imageWidth,
              height: typeof height === 'string' && height.includes('%') ? '100%' : imageHeight,
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
                  getRoundedClass(rounded)
                )}
              >
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
              </div>
            )}

            <NextImage
              src={src}
              alt={alt}
              width={imageWidth}
              height={imageHeight}
              className={cn(
                'transition-opacity duration-300',
                isLoading ? 'opacity-0' : 'opacity-100',
                getRoundedClass(rounded)
              )}
              style={{
                objectFit:
                  object_fit === 'cover'
                    ? 'cover'
                    : object_fit === 'contain'
                      ? 'contain'
                      : object_fit === 'fill'
                        ? 'fill'
                        : object_fit === 'none'
                          ? 'none'
                          : 'scale-down',
                width: '100%',
                height: '100%',
              }}
              onLoad={handleLoad}
              onError={handleError}
              priority={loading === 'eager'}
              quality={85}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </>
        )}
      </div>
    )
  }
)

LowcodeImage.displayName = 'LowcodeImage'
