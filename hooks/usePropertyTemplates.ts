/**
 * 属性模板管理Hook
 *
 * 提供便捷的模板管理功能
 */

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback } from 'react'
import {
  PropertyTemplate,
  PropertyTemplateManager,
  TemplateFilter,
  TemplateApplicationResult,
  globalTemplateManager
} from '@/lib/designer/templates/property-template-manager'

// Hook状态
interface UsePropertyTemplatesState {
  templates: PropertyTemplate[]
  loading: boolean
  error: string | null
  selectedTemplate: PropertyTemplate | null
  searchQuery: string
  filter: TemplateFilter
}

// Hook返回值
interface UsePropertyTemplatesReturn extends UsePropertyTemplatesState {
  // 操作方法
  loadTemplates: (filter?: TemplateFilter) => Promise<void>
  createTemplate: (template: Omit<PropertyTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PropertyTemplate | null>
  updateTemplate: (id: string, updates: Partial<PropertyTemplate>) => Promise<PropertyTemplate | null>
  deleteTemplate: (id: string) => Promise<boolean>
  duplicateTemplate: (id: string, newName?: string) => Promise<PropertyTemplate | null>
  applyTemplate: (templateId: string, properties: Record<string, any>, options?: Parameters<PropertyTemplateManager['applyTemplate']>[2]) => Promise<TemplateApplicationResult>
  searchTemplates: (query: string) => Promise<void>
  exportTemplate: (id: string) => Promise<string | null>
  importTemplate: (data: string, options?: { overwrite?: boolean; generateNewId?: boolean }) => Promise<PropertyTemplate | null>

  // 状态管理
  setSelectedTemplate: (template: PropertyTemplate | null) => void
  setSearchQuery: (query: string) => void
  setFilter: (filter: TemplateFilter) => void
  clearError: () => void

  // 便捷方法
  getTemplateById: (id: string) => PropertyTemplate | null
  getTemplatesByCategory: (category: string) => PropertyTemplate[]
  refreshTemplates: () => Promise<void>
}

/**
 * 属性模板管理Hook
 */
export const usePropertyTemplates = (initialFilter?: TemplateFilter): UsePropertyTemplatesReturn => {
  const [state, setState] = useState<UsePropertyTemplatesState>({
    templates: [],
    loading: true,
    error: null,
    selectedTemplate: null,
    searchQuery: '',
    filter: initialFilter || {}
  })

  const managerRef = useRef<PropertyTemplateManager>(globalTemplateManager)

  // 加载模板
  const loadTemplates = useCallback(async (filter?: TemplateFilter) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const templates = await managerRef.current.listTemplates(filter)
      setState(prev => ({
        ...prev,
        templates,
        loading: false
      }))
    } catch (error) {
      console.error('Failed to load templates:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load templates'
      }))
    }
  }, [])

  // 创建模板
  const createTemplate = useCallback(async (
    template: Omit<PropertyTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PropertyTemplate | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const newTemplate = await managerRef.current.createTemplate(template)
      setState(prev => ({
        ...prev,
        templates: [...prev.templates, newTemplate],
        loading: false
      }))
      return newTemplate
    } catch (error) {
      console.error('Failed to create template:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to create template'
      }))
      return null
    }
  }, [])

  // 更新模板
  const updateTemplate = useCallback(async (
    id: string,
    updates: Partial<PropertyTemplate>
  ): Promise<PropertyTemplate | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const updatedTemplate = await managerRef.current.updateTemplate(id, updates)
      if (updatedTemplate) {
        setState(prev => ({
          ...prev,
          templates: prev.templates.map(t =>
            t.id === id ? updatedTemplate : t
          ),
          selectedTemplate: prev.selectedTemplate?.id === id ? updatedTemplate : prev.selectedTemplate,
          loading: false
        }))
      }
      return updatedTemplate
    } catch (error) {
      console.error('Failed to update template:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to update template'
      }))
      return null
    }
  }, [])

  // 删除模板
  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const success = await managerRef.current.deleteTemplate(id)
      if (success) {
        setState(prev => ({
          ...prev,
          templates: prev.templates.filter(t => t.id !== id),
          selectedTemplate: prev.selectedTemplate?.id === id ? null : prev.selectedTemplate,
          loading: false
        }))
      }
      return success
    } catch (error) {
      console.error('Failed to delete template:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to delete template'
      }))
      return false
    }
  }, [])

  // 复制模板
  const duplicateTemplate = useCallback(async (
    id: string,
    newName?: string
  ): Promise<PropertyTemplate | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const duplicated = await managerRef.current.duplicateTemplate(id, newName)
      if (duplicated) {
        setState(prev => ({
          ...prev,
          templates: [...prev.templates, duplicated],
          loading: false
        }))
      }
      return duplicated
    } catch (error) {
      console.error('Failed to duplicate template:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to duplicate template'
      }))
      return null
    }
  }, [])

  // 应用模板
  const applyTemplate = useCallback(async (
    templateId: string,
    properties: Record<string, any>,
    options?: Parameters<PropertyTemplateManager['applyTemplate']>[2]
  ): Promise<TemplateApplicationResult> => {
    try {
      return await managerRef.current.applyTemplate(templateId, properties, options)
    } catch (error) {
      console.error('Failed to apply template:', error)
      return {
        success: false,
        appliedProperties: {},
        errors: ['Failed to apply template']
      }
    }
  }, [])

  // 搜索模板
  const searchTemplates = useCallback(async (query: string) => {
    setState(prev => ({ ...prev, loading: true, searchQuery: query }))

    try {
      if (query.trim()) {
        const templates = await managerRef.current.searchTemplates(query)
        setState(prev => ({
          ...prev,
          templates,
          loading: false
        }))
      } else {
        await loadTemplates(state.filter)
      }
    } catch (error) {
      console.error('Failed to search templates:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to search templates'
      }))
    }
  }, [loadTemplates, state.filter])

  // 导出模板
  const exportTemplate = useCallback(async (id: string): Promise<string | null> => {
    try {
      return await managerRef.current.exportTemplate(id)
    } catch (error) {
      console.error('Failed to export template:', error)
      setState(prev => ({
        ...prev,
        error: 'Failed to export template'
      }))
      return null
    }
  }, [])

  // 导入模板
  const importTemplate = useCallback(async (
    data: string,
    options?: { overwrite?: boolean; generateNewId?: boolean }
  ): Promise<PropertyTemplate | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const imported = await managerRef.current.importTemplate(data, options)
      if (imported) {
        setState(prev => ({
          ...prev,
          templates: [...prev.templates, imported],
          loading: false
        }))
      }
      return imported
    } catch (error) {
      console.error('Failed to import template:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to import template'
      }))
      return null
    }
  }, [])

  // 状态管理方法
  const setSelectedTemplate = useCallback((template: PropertyTemplate | null) => {
    setState(prev => ({ ...prev, selectedTemplate: template }))
  }, [])

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }))
  }, [])

  const setFilter = useCallback((filter: TemplateFilter) => {
    setState(prev => ({ ...prev, filter }))
    loadTemplates(filter)
  }, [loadTemplates])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // 便捷方法
  const getTemplateById = useCallback((id: string): PropertyTemplate | null => {
    return state.templates.find(t => t.id === id) || null
  }, [state.templates])

  const getTemplatesByCategory = useCallback((category: string): PropertyTemplate[] => {
    return state.templates.filter(t => t.category === category)
  }, [state.templates])

  const refreshTemplates = useCallback(async () => {
    await loadTemplates(state.filter)
  }, [loadTemplates, state.filter])

  // 初始化加载
  useEffect(() => {
    loadTemplates(initialFilter)
  }, [loadTemplates, initialFilter])

  return {
    // 状态
    templates: state.templates,
    loading: state.loading,
    error: state.error,
    selectedTemplate: state.selectedTemplate,
    searchQuery: state.searchQuery,
    filter: state.filter,

    // 操作方法
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    applyTemplate,
    searchTemplates,
    exportTemplate,
    importTemplate,

    // 状态管理
    setSelectedTemplate,
    setSearchQuery,
    setFilter,
    clearError,

    // 便捷方法
    getTemplateById,
    getTemplatesByCategory,
    refreshTemplates
  }
}

/**
 * 简化的模板应用Hook
 */
export const useTemplateApplication = () => {
  const [applying, setApplying] = useState(false)
  const [lastResult, setLastResult] = useState<TemplateApplicationResult | null>(null)

  const applyTemplate = useCallback(async (
    templateId: string,
    properties: Record<string, any>,
    options?: Parameters<PropertyTemplateManager['applyTemplate']>[2]
  ): Promise<TemplateApplicationResult> => {
    setApplying(true)
    setLastResult(null)

    try {
      const result = await globalTemplateManager.applyTemplate(templateId, properties, options)
      setLastResult(result)
      return result
    } catch (error) {
      console.error('Failed to apply template:', error)
      const errorResult: TemplateApplicationResult = {
        success: false,
        appliedProperties: {},
        errors: ['Failed to apply template']
      }
      setLastResult(errorResult)
      return errorResult
    } finally {
      setApplying(false)
    }
  }, [])

  const createFromProperties = useCallback(async (
    properties: Record<string, any>,
    metadata: {
      name: string
      description?: string
      category?: string
      tags?: string[]
      author?: string
      componentTypes?: string[]
    }
  ): Promise<PropertyTemplate | null> => {
    try {
      return await globalTemplateManager.createTemplateFromProperties(properties, metadata)
    } catch (error) {
      console.error('Failed to create template from properties:', error)
      return null
    }
  }, [])

  return {
    applying,
    lastResult,
    applyTemplate,
    createFromProperties
  }
}

/**
 * 模板统计Hook
 */
export const useTemplateStats = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      const templateStats = await globalTemplateManager.getTemplateStats()
      setStats(templateStats)
    } catch (error) {
      console.error('Failed to load template stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return {
    stats,
    loading,
    refresh: loadStats
  }
}

import { useRef } from 'react'