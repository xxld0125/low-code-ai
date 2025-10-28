import { useEffect, useRef, useCallback } from 'react'
import { useDesignerStore } from '@/stores/page-designer/designer-store'
import type { ComponentInstance } from '@/types/page-designer/component'

interface AutoSaveOptions {
  pageDesignId?: string // 页面设计ID
  interval?: number // 自动保存间隔（毫秒）
  enabled?: boolean // 是否启用自动保存
  onSaveStart?: () => void // 开始保存时的回调
  onSaveSuccess?: (result: SaveResult) => void // 保存成功时的回调
  onSaveError?: (error: Error) => void // 保存失败时的回调
}

interface SaveResult {
  success: boolean
  timestamp: string
  pageDesignId?: string
  error?: string
}

// 移除 ComponentData 接口，直接使用 ComponentInstance

interface ComponentHierarchy {
  id: string
  type: string
  children: ComponentHierarchy[]
  props: Record<string, unknown>
  styles: Record<string, unknown>
}

// 安全序列化组件数据，移除不可序列化的内容
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

/**
 * 页面设计器自动保存Hook
 * 监听页面设计状态变化，自动保存到后端
 */
export function useAutoSave(options: AutoSaveOptions = {}) {
  const {
    pageDesignId: optionPageDesignId,
    interval = 30000, // 默认30秒自动保存一次
    enabled = true,
    onSaveStart,
    onSaveSuccess,
    onSaveError,
  } = options

  const { currentPageId, pageDesigns, components, selectionState, canvas } = useDesignerStore()

  const isSavingRef = useRef(false)
  const lastSaveTimeRef = useRef<string | null>(null)
  const hasUnsavedChangesRef = useRef(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 防抖的保存函数
  const debouncedSave = useCallback(async (): Promise<SaveResult> => {
    const pageId = optionPageDesignId || currentPageId
    if (!enabled || !pageId || isSavingRef.current) {
      return { success: false, timestamp: new Date().toISOString() }
    }

    const pageDesign = pageDesigns[pageId]
    if (!pageDesign) {
      return { success: false, timestamp: new Date().toISOString(), error: '页面设计不存在' }
    }

    try {
      isSavingRef.current = true
      onSaveStart?.()

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // 准备保存数据 - 安全序列化组件数据
      const safeComponents = serializeComponents(components)
      const saveData = {
        ...pageDesign,
        updated_at: new Date().toISOString(),
        version: (pageDesign.version || 1) + 1,
        // 序列化组件树结构
        component_tree: {
          version: '1.0',
          root_id: pageDesign.root_component_id,
          components: safeComponents,
          hierarchy: buildHierarchy(safeComponents),
        },
      }

      // 保存到数据库
      const { error } = await supabase
        .from('page_designs')
        .update(saveData)
        .eq('id', pageId)
        .single()

      if (error) {
        throw error
      }

      const result: SaveResult = {
        success: true,
        timestamp: new Date().toISOString(),
        pageDesignId: pageId,
      }

      hasUnsavedChangesRef.current = false
      lastSaveTimeRef.current = result.timestamp
      onSaveSuccess?.(result)

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      console.error('自动保存失败:', error)

      const result: SaveResult = {
        success: false,
        timestamp: new Date().toISOString(),
        error: errorMessage,
      }

      onSaveError?.(error instanceof Error ? error : new Error(errorMessage))
      return result
    } finally {
      isSavingRef.current = false
    }
  }, [
    enabled,
    optionPageDesignId,
    currentPageId,
    pageDesigns,
    components,
    onSaveStart,
    onSaveSuccess,
    onSaveError,
  ])

  // 触发防抖保存
  const triggerSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      debouncedSave()
    }, 1000) // 1秒防抖
  }, [debouncedSave])

  // 手动保存函数
  const manualSave = useCallback(async (): Promise<SaveResult> => {
    hasUnsavedChangesRef.current = true
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    return debouncedSave()
  }, [debouncedSave])

  // 构建组件层级结构
  const buildHierarchy = (components: Record<string, unknown>): ComponentHierarchy[] => {
    const componentMap = new Map(Object.entries(components))

    // 找到根组件
    const rootComponents = Array.from(componentMap.values()).filter(
      component => !(component as { parent_id?: string }).parent_id
    )

    // 递归构建层级结构
    const buildComponentHierarchy = (component: unknown): ComponentHierarchy => {
      const componentData = component as {
        id: string
        parent_id?: string
        component_type: string
        props?: unknown
        styles?: unknown
      }
      const children = Array.from(componentMap.values())
        .filter(child => (child as { parent_id?: string }).parent_id === componentData.id)
        .map(buildComponentHierarchy)

      return {
        id: componentData.id,
        type: componentData.component_type,
        children,
        props: (componentData.props as Record<string, unknown>) || {},
        styles: (componentData.styles as Record<string, unknown>) || {},
      }
    }

    return rootComponents.map(buildComponentHierarchy)
  }

  // 监听状态变化，触发自动保存
  useEffect(() => {
    const pageId = optionPageDesignId || currentPageId
    if (pageId) {
      hasUnsavedChangesRef.current = true
      triggerSave()
    }
  }, [
    components,
    selectionState.selectedComponentIds,
    canvas,
    optionPageDesignId,
    currentPageId,
    triggerSave,
  ])

  // 定时自动保存
  useEffect(() => {
    const pageId = optionPageDesignId || currentPageId
    if (!enabled || !pageId) return

    const timer = setInterval(() => {
      if (hasUnsavedChangesRef.current && !isSavingRef.current) {
        debouncedSave()
      }
    }, interval)

    return () => clearInterval(timer)
  }, [enabled, optionPageDesignId, currentPageId, interval, debouncedSave])

  // 页面卸载时保存
  useEffect(() => {
    const pageId = optionPageDesignId || currentPageId
    const handleBeforeUnload = () => {
      if (hasUnsavedChangesRef.current && !isSavingRef.current) {
        // 使用同步保存（如果支持）
        navigator.sendBeacon(
          '/api/auto-save',
          JSON.stringify({
            pageDesignId: pageId,
            timestamp: new Date().toISOString(),
          })
        )
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [optionPageDesignId, currentPageId])

  return {
    save: manualSave,
    saveNow: manualSave,
    isSaving: isSavingRef.current,
    lastSaveTime: lastSaveTimeRef.current,
    hasUnsavedChanges: hasUnsavedChangesRef.current,
  }
}
