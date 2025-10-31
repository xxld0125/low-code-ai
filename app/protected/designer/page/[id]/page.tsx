'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Save, Undo2, Redo2, Eye, Download, Share2, Settings } from 'lucide-react'
import { PageDesignerLayout } from '@/components/page-designer/PageDesignerLayout'
import { PageDesignerErrorBoundary } from '@/components/page-designer/PageDesignerErrorBoundary'
import { toast } from '@/hooks/use-toast'
import { dataLoader } from '@/lib/page-designer/data-loader'
import { dataSerializer } from '@/lib/page-designer/serializer'
import { dataSaver } from '@/lib/page-designer/data-saver'
import { useDesignerStore } from '@/stores/page-designer/designer-store'
import { useAutoSave } from '@/hooks/use-auto-save'
import type { ComponentInstance } from '@/types/page-designer/component'

// 安全序列化组件数据
const serializeComponents = (
  components: Record<string, ComponentInstance>
): Record<string, unknown> => {
  const serialized: Record<string, unknown> = {}

  Object.entries(components).forEach(([id, component]) => {
    serialized[id] = {
      id: component.id,
      page_design_id: component.page_design_id,
      component_type: component.component_type,
      parent_id: component.parent_id,
      position: component.position,
      props: component.props,
      styles: component.styles,
      events: {}, // 不序列化事件处理器
      responsive: component.responsive,
      layout_props: component.layout_props,
      created_at: component.created_at,
      updated_at: component.updated_at,
      version: component.version,
      meta: component.meta,
    }
  })

  return serialized
}

// 构建组件层级结构
const buildComponentHierarchy = (components: Record<string, unknown>): unknown[] => {
  const componentMap = new Map(Object.entries(components))

  // 找到根组件
  const rootComponents = Array.from(componentMap.values()).filter(
    component => !(component as { parent_id?: string }).parent_id
  )

  // 递归构建层级结构
  const buildHierarchy = (component: unknown): unknown => {
    const componentData = component as {
      id: string
      parent_id?: string
      component_type: string
      props?: unknown
      styles?: unknown
    }
    const children = Array.from(componentMap.values())
      .filter(child => (child as { parent_id?: string }).parent_id === componentData.id)
      .map(buildHierarchy)

    return {
      id: componentData.id,
      type: componentData.component_type,
      children,
      props: componentData.props || {},
      styles: componentData.styles || {},
    }
  }

  return rootComponents.map(buildHierarchy)
}

export default function PageDesignerEditor() {
  const params = useParams()
  const router = useRouter()
  const pageDesignId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    currentPageId,
    setPageDesign,
    // savePageDesign // 暂时未使用
  } = useDesignerStore()

  // 自动保存
  const { isSaving, lastSaveTime } = useAutoSave({
    pageDesignId,
    interval: 30000,
    enabled: !!currentPageId,
  }) // saveNow 暂时未使用

  // 加载页面设计数据
  useEffect(() => {
    if (!pageDesignId) return

    const loadDesign = async () => {
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

        // 设置到状态管理
        setPageDesign(designData.pageDesign)

        // 设置当前页面ID
        useDesignerStore.setState({
          currentPageId: pageDesignId,
        })

        // 从 component_tree 恢复组件数据
        if (designData.pageDesign?.component_tree?.components) {
          const treeComponents = designData.pageDesign.component_tree.components

          // 转换为 Zustand store 需要的格式
          const componentsRecord: Record<string, unknown> = {}
          Object.entries(treeComponents).forEach(([id, component]) => {
            componentsRecord[id] = {
              ...component,
              // 确保必要字段存在
              page_design_id: pageDesignId,
              events: component.events || {},
              responsive: component.responsive || {},
              meta: component.meta || { locked: false, hidden: false },
            }
          })

          // 直接设置到 store 的 components 状态
          useDesignerStore.setState({
            components: componentsRecord as Record<string, ComponentInstance>,
          })
        }
      } catch (err) {
        console.error('加载页面设计失败:', err)
        setError(err instanceof Error ? err.message : '加载失败，请重试')
      } finally {
        setLoading(false)
      }
    }

    loadDesign()
  }, [pageDesignId, setPageDesign])

  // 保存页面设计
  const handleSave = async () => {
    if (!pageDesignId) return

    try {
      setSaving(true)

      // 获取当前状态
      const currentState = useDesignerStore.getState()

      // 安全序列化组件数据
      const serializedComponents = serializeComponents(currentState.components)

      // 构建组件层级结构
      const hierarchy = buildComponentHierarchy(serializedComponents)

      // 动态计算根组件ID
      const componentArray = Object.values(serializedComponents) as ComponentInstance[]
      const rootComponent = componentArray.find(comp => !comp.parent_id)
      const rootId = rootComponent?.id || ''

      // 序列化组件树
      const componentTree = {
        version: '1.0',
        root_id: rootId,
        components: serializedComponents,
        hierarchy,
      }

      const result = await dataSaver.autoSave(pageDesignId, componentTree)

      if (result.success) {
        toast({
          title: '保存成功',
          description: '页面设计已保存',
        })
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      console.error('保存失败:', err)
      toast({
        title: '保存失败',
        description: '无法保存页面设计，请重试',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // 导出页面设计
  const handleExport = () => {
    try {
      const currentState = useDesignerStore.getState()
      const pageDesign = currentState.pageDesigns[pageDesignId]

      if (!pageDesign) {
        toast({
          title: '导出失败',
          description: '没有可导出的页面设计',
          variant: 'destructive',
        })
        return
      }

      const exportData = dataSerializer.exportDesign(
        pageDesign,
        Object.values(currentState.components)
      )

      // 创建下载链接
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${pageDesign.name}-design.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: '导出成功',
        description: '页面设计已导出为JSON文件',
      })
    } catch (err) {
      console.error('导出失败:', err)
      toast({
        title: '导出失败',
        description: '无法导出页面设计',
        variant: 'destructive',
      })
    }
  }

  // 预览页面
  const handlePreview = () => {
    window.open(`/protected/designer/preview/${pageDesignId}`, '_blank')
  }

  // 分享页面
  const handleShare = () => {
    // 这里实现分享逻辑
    toast({
      title: '分享功能',
      description: '分享功能正在开发中',
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">正在加载页面设计...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-red-600">加载失败</h1>
          <p className="mb-4 text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()}>重新加载</Button>
        </div>
      </div>
    )
  }

  return (
    <PageDesignerErrorBoundary>
      <div className="min-h-screen bg-white">
        {/* 顶部工具栏 */}
        <div className="border-b border-gray-200 bg-white px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/protected/designer/list')}
              >
                ← 返回列表
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => useDesignerStore.getState().undo()}
                  disabled={!useDesignerStore.getState().historyState.canUndo}
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => useDesignerStore.getState().redo()}
                  disabled={!useDesignerStore.getState().historyState.canRedo}
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* 保存状态指示器 */}
              <div className="text-sm text-gray-600">
                {isSaving
                  ? '保存中...'
                  : lastSaveTime
                    ? `已保存于 ${new Date(lastSaveTime).toLocaleTimeString()}`
                    : '未保存'}
              </div>

              {/* 操作按钮 */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={saving || isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                保存
              </Button>

              <Button variant="outline" size="sm" onClick={handlePreview}>
                <Eye className="mr-2 h-4 w-4" />
                预览
              </Button>

              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                分享
              </Button>

              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                导出
              </Button>

              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                设置
              </Button>
            </div>
          </div>
        </div>

        {/* 主设计器区域 */}
        <div className="h-[calc(100vh-60px)]">
          <PageDesignerLayout />
        </div>
      </div>
    </PageDesignerErrorBoundary>
  )
}
