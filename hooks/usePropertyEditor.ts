/**
 * 属性编辑器Hook
 * 提供组件属性编辑的统一接口，封装状态管理和副作用处理
 */

import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { usePropertyStore } from '@/stores/property-store'
import { useDesignerStore } from '@/stores/page-designer/designer-store'
import { PropertyValidator, PropertySchema, ValidationResult } from '@/lib/designer/validation/property-validator'
import { previewManager } from '@/lib/designer/preview-manager'
import type {
  PropertyValue,
  PropertyEditorProps,
  ComponentInstance,
  EventHandlerConfig
} from '@/types/designer'

interface UsePropertyEditorOptions {
  // 自动保存配置
  autoSave?: boolean
  autoSaveDelay?: number

  // 验证配置
  autoValidate?: boolean
  validateOnChange?: boolean
  showValidationErrors?: boolean

  // 预览配置
  enablePreview?: boolean
  previewDelay?: number

  // 性能优化配置
  enablePerformanceOptimization?: boolean
  batchUpdateDelay?: number
  maxUpdatesPerSecond?: number

  // 调试配置
  debug?: boolean
}

interface UsePropertyEditorReturn {
  // 属性状态
  properties: Record<string, PropertyValue>
  previewProperties: Record<string, PropertyValue>
  dirtyProperties: Set<string>

  // 组件状态
  selectedComponentId: string | null
  selectedComponent: ComponentInstance | null
  loading: boolean
  saving: boolean
  error: string | null

  // 验证状态
  validationErrors: Record<string, string>
  isValid: boolean

  // 操作方法
  updateProperty: (key: string, value: PropertyValue) => void
  updateProperties: (updates: Record<string, PropertyValue>) => void
  saveChanges: () => Promise<void>
  resetChanges: () => void
  validateProperty: (key: string, value: PropertyValue, schema: PropertySchema) => ValidationResult

  // 工具方法
  isDirty: boolean
  hasUnsavedChanges: boolean
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void

  // 预览方法
  applyPreview: () => void
  discardPreview: () => void
  setPreviewMode: (enabled: boolean) => void

  // 事件方法
  addEventHandler: (eventType: string, handler: EventHandlerConfig) => void
  updateEventHandler: (eventType: string, index: number, handler: EventHandlerConfig) => void
  removeEventHandler: (eventType: string, index: number) => void
}

export function usePropertyEditor(
  componentId: string | null,
  options: UsePropertyEditorOptions = {}
): UsePropertyEditorReturn {
  // 合并默认选项
  const {
    autoSave = false,
    autoSaveDelay = 2000,
    autoValidate = true,
    validateOnChange = true,
    showValidationErrors = true,
    enablePreview = true,
    previewDelay = 100,
    enablePerformanceOptimization = true,
    batchUpdateDelay = 16,
    maxUpdatesPerSecond = 60,
    debug = false
  } = options

  // 状态管理
  const store = usePropertyStore()
  const designerStore = useDesignerStore()
  const validatorRef = useRef(new PropertyValidator())

  // 本地状态
  const [validationState, setValidationState] = useState<Record<string, ValidationResult>>({})
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const previewTimeoutRef = useRef<NodeJS.Timeout>()

  // 调试日志
  const debugLog = useCallback((message: string, data?: any) => {
    if (debug) {
      console.log(`[usePropertyEditor] ${message}`, data)
    }
  }, [debug])

  // 预览管理器订阅
  useEffect(() => {
    if (!componentId) return

    const unsubscribe = previewManager.onUpdate((updates) => {
      updates.forEach(update => {
        if (update.componentId === componentId) {
          debugLog('Preview update received', update)
          // 预览更新会自动反映在store中，无需额外处理
        }
      })
    })

    return unsubscribe
  }, [componentId, debugLog])

  // 选择组件
  useEffect(() => {
    if (componentId !== store.selectedComponentId) {
      // 从designer store获取组件数据
      const component = componentId ? designerStore.components[componentId] : null
      debugLog('Selecting component', { componentId, component: component?.component_type })

      // 手动设置property store的状态
      store.selectComponent(componentId)

      if (component) {
        // 确保属性数据正确初始化
        store.updateProperties({
          ...component.props,
          styles: component.styles || {},
          events: component.events || {}
        })
      }
    }
  }, [componentId, store.selectedComponentId, store, designerStore, debugLog])

  // 自动保存逻辑
  const scheduleAutoSave = useCallback(() => {
    if (!autoSave || store.dirtyProperties.size === 0) {
      return
    }

    debugLog('Scheduling auto save', { dirtyProperties: Array.from(store.dirtyProperties) })

    // 清除之前的定时器
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // 设置新的自动保存定时器
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        debugLog('Executing auto save')
        await store.saveProperties()
      } catch (error) {
        console.error('Auto save failed:', error)
      }
    }, autoSaveDelay)
  }, [autoSave, autoSaveDelay, store.dirtyProperties.size, store, debugLog])

  // 验证属性
  const validateProperty = useCallback((
    key: string,
    value: PropertyValue,
    schema: PropertySchema
  ): ValidationResult => {
    const validator = validatorRef.current
    const result = validator.validate(value, schema)

    if (showValidationErrors) {
      if (!result.valid && result.errors.length > 0) {
        store.setValidationError(key, result.errors[0].message)
      } else {
        store.clearValidationError(key)
      }
    }

    // 更新本地验证状态
    setValidationState(prev => ({
      ...prev,
      [key]: result
    }))

    debugLog('Property validated', { key, value, result })
    return result
  }, [store, showValidationErrors, debugLog])

  // 更新单个属性
  const updateProperty = useCallback((
    key: string,
    value: PropertyValue
  ) => {
    debugLog('Updating property', { key, value })

    const oldValue = store.previewProperties[key]

    // 检查是否为样式属性
    const isStyleProperty = key.startsWith('style.')

    if (enablePerformanceOptimization && isStyleProperty && componentId) {
      // 使用性能优化的样式更新
      const styleProperty = key.replace('style.', '')
      store.updateStylePropertyOptimized(componentId, styleProperty, value)
    } else {
      // 使用常规属性更新
      store.updateProperty(key, value)
    }

    // 添加到预览管理器
    if (componentId && enablePreview) {
      previewManager.addUpdate(componentId, key, oldValue, value)
    }

    // 自动验证
    if (autoValidate && validateOnChange) {
      // 这里需要一个schema，实际使用时需要传入
      // 暂时跳过验证，等待schema系统完善
    }

    // 调度自动保存
    scheduleAutoSave()
  }, [
    store,
    autoValidate,
    validateOnChange,
    scheduleAutoSave,
    debugLog,
    componentId,
    enablePreview,
    enablePerformanceOptimization
  ])

  // 批量更新属性
  const updateProperties = useCallback((
    updates: Record<string, PropertyValue>
  ) => {
    debugLog('Updating properties', { updates })

    // 分离样式属性和常规属性
    const styleUpdates: Record<string, PropertyValue> = {}
    const regularUpdates: Record<string, PropertyValue> = {}

    Object.entries(updates).forEach(([key, value]) => {
      if (key.startsWith('style.')) {
        const styleProperty = key.replace('style.', '')
        styleUpdates[styleProperty] = value
      } else {
        regularUpdates[key] = value
      }
    })

    // 分别处理样式和常规属性更新
    if (enablePerformanceOptimization && Object.keys(styleUpdates).length > 0 && componentId) {
      // 使用性能优化的批量样式更新
      store.updateStylePropertiesOptimized(componentId, styleUpdates)
    } else if (Object.keys(styleUpdates).length > 0) {
      // 常规样式更新
      Object.entries(styleUpdates).forEach(([property, value]) => {
        store.updateStyleProperty(`style.${property}`, value)
      })
    }

    // 更新常规属性
    if (Object.keys(regularUpdates).length > 0) {
      store.updateProperties(regularUpdates)
    }

    // 批量验证
    if (autoValidate && validateOnChange) {
      Object.keys(updates).forEach(key => {
        // 需要schema，暂时跳过
      })
    }

    scheduleAutoSave()
  }, [
    store,
    autoValidate,
    validateOnChange,
    scheduleAutoSave,
    debugLog,
    componentId,
    enablePerformanceOptimization
  ])

  // 保存更改
  const saveChanges = useCallback(async () => {
    debugLog('Manual save triggered')

    try {
      await store.saveProperties()
      debugLog('Save completed successfully')
    } catch (error) {
      debugLog('Save failed', error)
      throw error
    }
  }, [store, debugLog])

  // 重置更改
  const resetChanges = useCallback(() => {
    debugLog('Resetting changes')

    // 清除自动保存定时器
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    store.resetProperties()

    // 清除验证状态
    setValidationState({})

    debugLog('Changes reset completed')
  }, [store, debugLog])

  // 应用预览
  const applyPreview = useCallback(() => {
    debugLog('Applying preview')
    // 这会将预览属性应用到实际属性中
    store.saveProperties()
  }, [store, debugLog])

  // 丢弃预览
  const discardPreview = useCallback(() => {
    debugLog('Discarding preview')
    store.resetProperties()
  }, [store, debugLog])

  // 设置预览模式
  const setPreviewMode = useCallback((enabled: boolean) => {
    debugLog('Setting preview mode', { enabled })
    store.setPreviewMode(enabled)
  }, [store, debugLog])

  // 事件处理器操作
  const addEventHandler = useCallback((
    eventType: string,
    handler: EventHandlerConfig
  ) => {
    debugLog('Adding event handler', { eventType, handler })
    store.addEventHandler(eventType, handler)
    scheduleAutoSave()
  }, [store, scheduleAutoSave, debugLog])

  const updateEventHandler = useCallback((
    eventType: string,
    index: number,
    handler: EventHandlerConfig
  ) => {
    debugLog('Updating event handler', { eventType, index, handler })
    store.updateEventHandler(eventType, index, handler)
    scheduleAutoSave()
  }, [store, scheduleAutoSave, debugLog])

  const removeEventHandler = useCallback((
    eventType: string,
    index: number
  ) => {
    debugLog('Removing event handler', { eventType, index })
    store.removeEventHandler(eventType, index)
    scheduleAutoSave()
  }, [store, scheduleAutoSave, debugLog])

  // 历史操作
  const undo = useCallback(() => {
    debugLog('Undo operation')
    store.undo()
  }, [store, debugLog])

  const redo = useCallback(() => {
    debugLog('Redo operation')
    store.redo()
  }, [store, debugLog])

  // 计算属性
  const isDirty = useMemo(() => store.dirtyProperties.size > 0, [store.dirtyProperties.size])

  const hasUnsavedChanges = useMemo(() => {
    // 检查是否有任何未保存的更改（包括属性、事件、样式等）
    return isDirty ||
           Object.keys(store.eventHandlers).some(key =>
             store.dirtyProperties.has(`eventHandlers.${key}`)
           ) ||
           Object.keys(store.customStyles).some(key =>
             store.dirtyProperties.has(`customStyles.${key}`)
           )
  }, [isDirty, store.dirtyProperties, store.eventHandlers, store.customStyles])

  const canUndo = useMemo(() => store.history.past.length > 0, [store.history.past.length])
  const canRedo = useMemo(() => store.history.future.length > 0, [store.history.future.length])

  const isValid = useMemo(() => {
    // 检查所有验证是否通过
    const allValidations = Object.values(validationState)
    return allValidations.every(validation => validation.valid) &&
           Object.keys(store.validationErrors).length === 0
  }, [validationState, store.validationErrors])

  // 清理副作用
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current)
      }
    }
  }, [])

  return {
    // 属性状态
    properties: store.properties,
    previewProperties: store.previewProperties,
    dirtyProperties: store.dirtyProperties,

    // 组件状态
    selectedComponentId: store.selectedComponentId,
    selectedComponent: componentId ? designerStore.components[componentId] : null,
    loading: store.loading,
    saving: store.saving,
    error: store.error,

    // 验证状态
    validationErrors: store.validationErrors,
    isValid,

    // 操作方法
    updateProperty,
    updateProperties,
    saveChanges,
    resetChanges,
    validateProperty,

    // 工具方法
    isDirty,
    hasUnsavedChanges,
    canUndo,
    canRedo,
    undo,
    redo,

    // 预览方法
    applyPreview,
    discardPreview,
    setPreviewMode,

    // 事件方法
    addEventHandler,
    updateEventHandler,
    removeEventHandler,
  }
}

/**
 * 属性编辑器工厂Hook
 * 根据组件类型提供预设的配置和schema
 */
export function usePropertyEditorForType(
  componentType: string,
  componentId: string | null,
  options: UsePropertyEditorOptions = {}
) {
  // 根据组件类型获取默认的schema配置
  const schemas = useMemo(() => {
    // 这里应该从组件库中获取schema定义
    // 暂时返回基础schema
    switch (componentType) {
      case 'Button':
        return {
          text: {
            type: 'string' as const,
            required: true,
            minLength: 1,
            maxLength: 100
          },
          disabled: {
            type: 'boolean' as const,
            required: false,
            default: false
          },
          variant: {
            type: 'string' as const,
            required: false,
            enum: ['primary', 'secondary', 'outline', 'ghost'],
            default: 'primary'
          }
        }
      case 'Input':
        return {
          placeholder: {
            type: 'string' as const,
            required: false,
            maxLength: 200
          },
          required: {
            type: 'boolean' as const,
            required: false,
            default: false
          },
          disabled: {
            type: 'boolean' as const,
            required: false,
            default: false
          }
        }
      default:
        return {}
    }
  }, [componentType])

  return usePropertyEditor(componentId, {
    ...options,
    // 可以根据组件类型添加特定配置
  })
}