'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ComponentRenderer } from '@/lib/page-designer/component-renderer'
import { dataLoader } from '@/lib/page-designer/data-loader'
import type { PageDesign, ComponentInstance } from '@/types/page-designer'
// import { toast } from '@/hooks/use-toast' // 暂时未使用

export default function PreviewPage() {
  const params = useParams()
  const pageDesignId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageDesign, setPageDesign] = useState<PageDesign | null>(null)
  const [components, setComponents] = useState<ComponentInstance[]>([])
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

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
        setComponents(designData.components || [])
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
            <div className="py-8 text-center text-gray-500">
              <p>请返回编辑器添加组件</p>
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

  // 设备预览切换器
  const DevicePreviewSwitcher = () => (
    <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setPreviewMode('desktop')}
          className={`rounded p-2 ${previewMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          title="桌面预览"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5z" />
          </svg>
        </button>
        <button
          onClick={() => setPreviewMode('tablet')}
          className={`rounded p-2 ${previewMode === 'tablet' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          title="平板预览"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM3 4a4 4 0 014-4h6a4 4 0 014 4v12a4 4 0 01-4 4H7a4 4 0 01-4-4V4z" />
          </svg>
        </button>
        <button
          onClick={() => setPreviewMode('mobile')}
          className={`rounded p-2 ${previewMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          title="手机预览"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 2a2 2 0 00-2 2v12a2 2 0 002 2h4a2 2 0 002-2V4a2 2 0 00-2-2H8zM6 4a4 4 0 014-4h4a4 4 0 014 4v12a4 4 0 01-4 4h-4a4 4 0 01-4-4V4z" />
          </svg>
        </button>
      </div>
    </div>
  )

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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-red-600">加载失败</h1>
          <p className="mb-4 text-gray-600">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              重新加载
            </button>
            <a
              href={`/protected/designer/page/${pageDesignId}`}
              className="inline-block rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              返回编辑
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 设备预览切换器 */}
      <DevicePreviewSwitcher />

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
                <span>
                  {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
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
