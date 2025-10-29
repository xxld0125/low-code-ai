/**
 * 图片字段编辑器
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React, { useState } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PropertyDefinition } from '@/types/lowcode/property'
import { cn } from '@/lib/utils'
import { Image as ImageIcon, Upload, X, Eye } from 'lucide-react'

interface ImageFieldEditorProps {
  value: unknown
  onChange: (value: unknown) => void
  disabled?: boolean
  readonly?: boolean
  definition: PropertyDefinition
  showPreview?: boolean
  acceptTypes?: string[]
  maxSize?: number // 最大文件大小 (MB)
}

export const ImageFieldEditor: React.FC<ImageFieldEditorProps> = ({
  value,
  onChange,
  disabled = false,
  readonly = false,
  definition,
  showPreview = true,
  acceptTypes = ['image/*'],
  maxSize = 10,
}) => {
  const [inputValue, setInputValue] = useState(String(value || definition.default || ''))
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // 验证图片URL
  const isValidImageUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return false

    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // 处理URL输入变更
  const handleUrlChange = (newUrl: string) => {
    setInputValue(newUrl)
    setError('')

    if (newUrl.trim() === '') {
      setPreviewUrl('')
      onChange('')
      return
    }

    if (isValidImageUrl(newUrl)) {
      onChange(newUrl)
      setPreviewUrl(newUrl)
    } else {
      setError('请输入有效的图片URL')
    }
  }

  // 处理文件上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    const validTypes = acceptTypes.some(type => {
      if (type === 'image/*') return file.type.startsWith('image/')
      return file.type === type
    })

    if (!validTypes) {
      setError('不支持的文件类型')
      return
    }

    // 验证文件大小
    if (file.size > maxSize * 1024 * 1024) {
      setError(`文件大小不能超过 ${maxSize}MB`)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // 这里应该上传到服务器，现在只是创建本地预览
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setInputValue(file.name)
      onChange({
        name: file.name,
        url: url,
        size: file.size,
        type: file.type,
      })
    } catch (err) {
      setError('图片上传失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 清除图片
  const clearImage = () => {
    setInputValue('')
    setPreviewUrl('')
    onChange('')
    setError('')
  }

  // 处理图片加载错误
  const handleImageError = () => {
    setError('图片加载失败')
    setPreviewUrl('')
  }

  const isValid = isValidImageUrl(inputValue) || !inputValue
  const displayUrl = previewUrl || inputValue

  // 只读模式显示
  if (readonly) {
    if (!displayUrl) {
      return <div className="text-sm text-muted-foreground">无图片</div>
    }

    return (
      <div className="space-y-2">
        {showPreview && (
          <div className="group relative">
            <Image
              src={displayUrl}
              alt="预览"
              width={384} // 24rem = 384px (最大宽度)
              height={192} // 12rem = 192px (最大高度)
              className="h-auto max-h-48 max-w-full rounded border border-border object-contain"
              onError={handleImageError}
            />
            <div className="absolute inset-0 flex items-center justify-center rounded bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Eye className="h-6 w-6 text-white" />
            </div>
          </div>
        )}
        <div className="break-all text-xs text-muted-foreground">{displayUrl}</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 输入区域 */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={e => handleUrlChange(e.target.value)}
          disabled={disabled || isLoading}
          placeholder="输入图片URL或上传图片"
          className={cn('flex-1', !isValid && 'border-destructive focus:border-destructive')}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById(`file-upload-${definition.key}`)?.click()}
          disabled={disabled || isLoading}
        >
          <Upload className="h-4 w-4" />
        </Button>
        {inputValue && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearImage}
            disabled={disabled || isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 隐藏的文件输入 */}
      <input
        id={`file-upload-${definition.key}`}
        type="file"
        accept={acceptTypes.join(',')}
        onChange={handleFileUpload}
        disabled={disabled || isLoading}
        className="hidden"
      />

      {/* 图片预览 */}
      {showPreview && displayUrl && isValid && (
        <Card className="overflow-hidden">
          <CardContent className="p-3">
            <div className="group relative">
              <Image
                src={displayUrl}
                alt="图片预览"
                width={768} // 假设最大宽度
                height={192} // 12rem = 192px (最大高度)
                className="h-auto max-h-48 w-full rounded object-contain"
                onError={handleImageError}
              />
              <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Badge variant="secondary" className="text-xs">
                  {displayUrl.length > 30 ? `${displayUrl.slice(0, 30)}...` : displayUrl}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          上传中...
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="flex items-center gap-1 text-xs text-destructive">
          <ImageIcon className="h-3 w-3" />
          {error}
        </div>
      )}

      {/* 支持的文件类型提示 */}
      <div className="text-xs text-muted-foreground">
        支持格式: {acceptTypes.join(', ')}
        {maxSize && ` • 最大 ${maxSize}MB`}
      </div>
    </div>
  )
}
