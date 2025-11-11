'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ComponentRenderer } from '@/lib/page-designer/component-renderer'
import { dataLoader } from '@/lib/page-designer/data-loader'
import { DevicePreviewSwitcher } from '@/components/preview/DevicePreviewSwitcher'
import { ErrorState } from '@/components/preview/ErrorState'
import type { PageDesign, ComponentInstance } from '@/types/page-designer'
// import { toast } from '@/hooks/use-toast' // 暂时未使用

/**
 * 清理组件属性中的事件处理器
 */
const cleanComponentProps = (props: any): any => {
  if (!props || typeof props !== 'object') {
    return props
  }

  const cleaned: any = {}
  const eventHandlerKeys = [
    'onClick', 'onUpdate', 'onDelete', 'onSelect', 'isSelected', 'isDragging',
    'isEditable', 'onDragStart', 'onDragEnd', 'onDragOver', 'onDrop',
    'onFocus', 'onBlur', 'onChange', 'onSubmit', 'onMouseEnter', 'onMouseLeave'
  ]

  Object.keys(props).forEach(key => {
    const value = props[key]

    // 检查是否是事件处理器键
    if (eventHandlerKeys.includes(key)) {
      return // 跳过事件处理器属性
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // 递归清理嵌套对象
      cleaned[key] = cleanComponentProps(value)
    } else if (Array.isArray(value)) {
      // 清理数组中的每个元素
      cleaned[key] = value.map(item =>
        (typeof item === 'object' && item !== null) ? cleanComponentProps(item) : item
      )
    } else if (typeof value === 'function') {
      // 跳过函数类型的属性
      return
    } else if (typeof value === 'string' && (
      value.startsWith('function') ||
      value.includes('=>') ||
      value.includes('onClick') ||
      value.includes('onUpdate') ||
      value.includes('onDelete')
    )) {
      // 跳过字符串形式的函数定义
      return
    } else {
      cleaned[key] = value
    }
  })

  return cleaned
}

export default function PreviewPage() {
  const params = useParams()
  const pageDesignId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageDesign, setPageDesign] = useState<PageDesign | null>(null)
  const [components, setComponents] = useState<ComponentInstance[]>([])
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [currentTime, setCurrentTime] = useState<string>('')

  // 更新当前时间，仅在客户端运行
  useEffect(() => {
    // 确保只在客户端执行
    if (typeof window === 'undefined') return

    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
    }

    updateTime() // 立即更新一次
    const interval = setInterval(updateTime, 1000) // 每秒更新

    return () => clearInterval(interval)
  }, [])

  // 加载页面设计数据
  useEffect(() => {
    if (!pageDesignId) return

    const loadPreviewData = async () => {
      try {
        setLoading(true)
        setError(null)

        const designData = await dataLoader.loadFullDesignData(pageDesignId)

        if (designData.error) {
          setError(designData.error)
          return
        }

        if (!designData.pageDesign) {
          setError('页面设计不存在')
          return
        }

        setPageDesign(designData.pageDesign)

        
        // 创建完全清理的组件数据，确保没有事件处理器
        const cleanedComponents = (designData.components || []).map(component => {
          const cleaned: any = {
            id: component.id,
            page_design_id: component.page_design_id,
            component_type: component.component_type,
            parent_id: component.parent_id,
            position: component.position,
            styles: component.styles || {},
            events: {}, // 清空所有事件处理器
            responsive: component.responsive || {},
            layout_props: component.layout_props || {},
            created_at: component.created_at,
            updated_at: component.updated_at,
            version: component.version,
            meta: component.meta || {},
          }

          // 根据组件类型创建安全的默认props
          switch (component.component_type) {
            case 'button':
              cleaned.props = {
                button: {
                  text: component.props?.button?.text || '按钮',
                  variant: component.props?.button?.variant || 'default',
                  size: component.props?.button?.size || 'default',
                  type: component.props?.button?.type || 'button',
                  disabled: component.props?.button?.disabled || false,
                  className: component.props?.button?.className || '',
                  // 只包含安全的属性，排除所有事件处理器
                }
              }
              break
            case 'text':
              cleaned.props = {
                text: {
                  content: component.props?.text?.content || '文本内容',
                  variant: component.props?.text?.variant || 'body',
                  tag: component.props?.text?.tag || 'div',
                  className: component.props?.text?.className || '',
                }
              }
              break
            case 'image':
              cleaned.props = {
                image: {
                  src: component.props?.image?.src || '/api/placeholder/300/200',
                  alt: component.props?.image?.alt || '图片',
                  width: component.props?.image?.width,
                  height: component.props?.image?.height,
                  className: component.props?.image?.className || '',
                }
              }
              break
            case 'container':
              cleaned.props = {
                container: {
                  tag: component.props?.container?.tag || 'div',
                  className: component.props?.container?.className || '',
                }
              }
              break
            case 'input':
              cleaned.props = {
                input: {
                  type: component.props?.input?.type || 'text',
                  placeholder: component.props?.input?.placeholder || '',
                  value: component.props?.input?.value || '',
                  disabled: component.props?.input?.disabled || false,
                  readOnly: component.props?.input?.readOnly || false,
                  className: component.props?.input?.className || '',
                }
              }
              break
            case 'link':
              cleaned.props = {
                link: {
                  href: component.props?.link?.href || '#',
                  target: component.props?.link?.target || '_self',
                  text: component.props?.link?.text || '链接',
                  className: component.props?.link?.className || '',
                }
              }
              break
            default:
              cleaned.props = {}
          }

          return cleaned
        })

        setComponents(cleanedComponents)

              } catch (err) {
        console.error('加载预览数据失败:', err)
        setError(err instanceof Error ? err.message : '加载失败，请重试')
      } finally {
        setLoading(false)
      }
    }

    loadPreviewData()
  }, [pageDesignId])

  // 获取预览容器的样式
  const getPreviewContainerStyles = () => {
    const baseStyles = {
      width: '100%',
      height: '100%',
      transition: 'all 0.3s ease',
      margin: '0 auto',
    }

    switch (previewMode) {
      case 'mobile':
        return {
          ...baseStyles,
          maxWidth: '375px',
        }
      case 'tablet':
        return {
          ...baseStyles,
          maxWidth: '768px',
        }
      case 'desktop':
      default:
        return {
          ...baseStyles,
          maxWidth: '100%',
        }
    }
  }

  // 渲染页面内容
  const renderPageContent = () => {

    if (!pageDesign || components.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="mb-2 text-lg">暂无内容</p>
            <p className="text-sm">此页面设计还没有添加任何组件</p>
            <p className="text-xs text-gray-400">pageDesign: {!!pageDesign}, components: {components.length}</p>
          </div>
        </div>
      )
    }

    try {
      // 应用页面级样式
      const pageStyles = ComponentRenderer.applyPageStyles(pageDesign)

      // 获取根组件ID
      const rootId = pageDesign.root_component_id || null

      // 渲染组件树
      const renderedComponents = ComponentRenderer.renderComponentTree(components, rootId)

      return (
        <div style={pageStyles}>
          {renderedComponents.length > 0 ? (
            renderedComponents
          ) : (
            <div className="flex h-64 items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="mb-2 text-lg">暂无内容</p>
                <p className="text-sm">此页面设计还没有添加任何组件</p>
              </div>
            </div>
          )}
        </div>
      )
    } catch (err) {
      console.error('渲染页面失败:', err)
      return (
        <div className="flex h-64 items-center justify-center text-red-500">
          <div className="text-center">
            <p className="mb-2 text-lg">渲染失败</p>
            <p className="text-sm">页面渲染时发生错误，请检查组件配置</p>
          </div>
        </div>
      )
    }
  }

  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">正在加载预览...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorState error={error} pageDesignId={pageDesignId} />
  }

  return (
    <>
      {/* 设备预览切换器 */}
      <DevicePreviewSwitcher
        initialMode={previewMode}
        onModeChange={setPreviewMode}
      />

      {/* 预览内容区域 */}
      <div className="flex min-h-screen items-center justify-center py-8">
        <div style={getPreviewContainerStyles()}>
          {/* 模拟设备外框 */}
          <div
            className={`bg-white shadow-xl ${
              previewMode === 'mobile'
                ? 'rounded-2xl border-8 border-gray-800'
                : previewMode === 'tablet'
                  ? 'rounded-lg border-4 border-gray-700'
                  : 'border border-gray-200'
            }`}
          >
            {/* 设备状态栏（仅在移动端显示） */}
            {(previewMode === 'mobile' || previewMode === 'tablet') && (
              <div className="flex items-center justify-between bg-gray-900 px-4 py-1 text-xs text-white">
                <span>{currentTime || '--:--'}</span>
                <div className="flex items-center space-x-1">
                  <div className="h-3 w-4 rounded-sm border border-white">
                    <div className="m-px h-2 w-3 rounded-sm bg-white"></div>
                  </div>
                </div>
              </div>
            )}

            {/* 页面内容 */}
            <div
              className="overflow-auto"
              style={{
                maxHeight:
                  previewMode === 'mobile' ? '667px' : previewMode === 'tablet' ? '1024px' : 'none',
              }}
            >
              {renderPageContent()}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
