/**
 * 属性配置状态管理
 * 使用Zustand + Immer中间件管理组件属性配置状态
 */

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet } from 'immer'
import type { PropertyConfigState, PropertyConfigActions, EventHandlerConfig, CSSProperties, StylePreset } from '@/types/designer'
import { useStyleStore } from '../style-store'

// 在模块加载时启用MapSet插件
enableMapSet()

// Helper function to get component from designer store
const getComponentFromDesignerStore = (componentId: string | null) => {
  if (!componentId) return null

  try {
    // 尝试从全局状态或通过其他方式访问designer store
    // 这里需要动态导入以避免循环依赖
    return null // 临时返回null，稍后修复
  } catch (error) {
    console.warn('无法从designer store获取组件:', error)
    return null
  }
}

interface PropertyConfigStore extends PropertyConfigState, PropertyConfigActions {}

// 初始状态
const initialState: PropertyConfigState = {
  // 选中状态
  selectedComponentId: null,
  selectedComponent: null,

  // 属性配置
  properties: {},
  dirtyProperties: new Set(),

  // 预览状态
  previewProperties: {},
  isPreviewMode: true,

  // 历史管理
  history: {
    past: [],
    present: null,
    future: [],
  },

  // 状态标志
  loading: false,
  saving: false,
  error: null,

  // 验证状态
  validationErrors: {},
  validationState: {},

  // 事件配置
  eventHandlers: {},
  eventValidationErrors: {},

  // 样式配置
  stylePresets: [],
  customStyles: {},
}

/**
 * 属性配置Store
 * 管理组件属性的编辑、预览、保存和历史记录
 */
export const usePropertyStore = create<PropertyConfigStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,

        // 选中组件管理
        selectComponent: (componentId: string | null) => {
          set(state => {
            state.selectedComponentId = componentId

            if (componentId) {
              // 加载组件属性数据
              const component = state.components?.[componentId]
              if (component) {
                state.selectedComponent = component
                state.properties = component.properties || {}
                state.previewProperties = { ...(component.properties || {}) }
                state.eventHandlers = component.eventHandlers || {}
                state.customStyles = component.customStyles || {}

                // 清除脏状态
                state.dirtyProperties.clear()
                state.validationErrors = {}
                state.eventValidationErrors = {}
              } else {
                // 如果组件不存在，重置状态
                state.selectedComponent = null
                state.properties = {}
                state.previewProperties = {}
                state.eventHandlers = {}
                state.customStyles = {}
                state.dirtyProperties.clear()
                state.validationErrors = {}
                state.eventValidationErrors = {}
              }
            } else {
              // 取消选中
              state.selectedComponent = null
              state.properties = {}
              state.previewProperties = {}
              state.eventHandlers = {}
              state.customStyles = {}
              state.dirtyProperties.clear()
              state.validationErrors = {}
              state.eventValidationErrors = {}
            }
          })
        },

        updateProperty: (propertyPath: string, value: unknown) => {
          set(state => {
            const oldValue = state.previewProperties[propertyPath]

            // 更新预览属性
            state.previewProperties[propertyPath] = value

            // 标记为脏属性
            if (oldValue !== value) {
              state.dirtyProperties.add(propertyPath)
            } else {
              state.dirtyProperties.delete(propertyPath)
            }

            // 清除该属性的验证错误
            delete state.validationErrors[propertyPath]
          })
        },

        updateProperties: (updates: Record<string, unknown>) => {
          set(state => {
            Object.entries(updates).forEach(([propertyPath, value]) => {
              const oldValue = state.previewProperties[propertyPath]

              // 更新预览属性
              state.previewProperties[propertyPath] = value

              // 标记为脏属性
              if (oldValue !== value) {
                state.dirtyProperties.add(propertyPath)
              } else {
                state.dirtyProperties.delete(propertyPath)
              }

              // 清除该属性的验证错误
              delete state.validationErrors[propertyPath]
            })
          })
        },

        saveProperties: async () => {
          const currentState = get()
          const { selectedComponentId, previewProperties } = currentState

          if (!selectedComponentId || currentState.dirtyProperties.size === 0) {
            return
          }

          set(state => {
            state.saving = true
            state.error = null
          })

          try {
            // 保存到持久化存储
            const response = await fetch('/api/components/properties', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                componentId: selectedComponentId,
                properties: previewProperties,
              }),
            })

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error?.message || '保存失败')
            }

            const result = await response.json()

            set(state => {
              // 更新保存状态
              state.properties = { ...previewProperties }
              state.dirtyProperties.clear()

              // 更新组件数据
              if (state.selectedComponent) {
                state.selectedComponent.properties = { ...previewProperties }
              }

              // 更新全局组件列表
              if (state.components?.[selectedComponentId]) {
                state.components[selectedComponentId].properties = { ...previewProperties }
              }

              state.saving = false
            })

            return result.data
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '保存失败'
            set(state => {
              state.error = errorMessage
              state.saving = false
            })
            throw error
          }
        },

        resetProperties: () => {
          set(state => {
            state.previewProperties = { ...state.properties }
            state.dirtyProperties.clear()
            state.validationErrors = {}
            state.eventValidationErrors = {}
          })
        },

        // 历史管理
        undo: () => {
          set(state => {
            const { past, present } = state.history
            if (past.length > 0) {
              const previous = past[past.length - 1]
              const newPast = past.slice(0, past.length - 1)

              state.history = {
                past: newPast,
                present: previous,
                future: [present, ...state.history.future],
              }

              if (previous) {
                state.previewProperties = { ...previous.properties }
                state.eventHandlers = { ...previous.eventHandlers }
                state.customStyles = { ...previous.customStyles }
              }
            }
          })
        },

        redo: () => {
          set(state => {
            const { future, present } = state.history
            if (future.length > 0) {
              const next = future[0]
              const newFuture = future.slice(1)

              state.history = {
                past: [...state.history.past, present],
                present: next,
                future: newFuture,
              }

              if (next) {
                state.previewProperties = { ...next.properties }
                state.eventHandlers = { ...next.eventHandlers }
                state.customStyles = { ...next.customStyles }
              }
            }
          })
        },

        saveToHistory: (description?: string) => {
          set(state => {
            const snapshot = {
              properties: { ...state.previewProperties },
              eventHandlers: { ...state.eventHandlers },
              customStyles: { ...state.customStyles },
              timestamp: Date.now(),
              description,
            }

            state.history = {
              past: [...state.history.past.slice(-49), state.history.present].filter(Boolean),
              present: snapshot,
              future: [],
            }
          })
        },

        // 验证管理
        setValidationError: (propertyPath: string, error: string) => {
          set(state => {
            state.validationErrors[propertyPath] = error
            state.validationState[propertyPath] = 'invalid'
          })
        },

        clearValidationError: (propertyPath: string) => {
          set(state => {
            delete state.validationErrors[propertyPath]
            delete state.validationState[propertyPath]
          })
        },

        clearAllValidationErrors: () => {
          set(state => {
            state.validationErrors = {}
            state.validationState = {}
            state.eventValidationErrors = {}
          })
        },

        // 事件管理
        addEventHandler: (eventType: string, handler: EventHandlerConfig) => {
          set(state => {
            if (!state.eventHandlers[eventType]) {
              state.eventHandlers[eventType] = []
            }
            state.eventHandlers[eventType].push(handler)
            state.dirtyProperties.add(`eventHandlers.${eventType}`)
          })
        },

        updateEventHandler: (eventType: string, index: number, handler: EventHandlerConfig) => {
          set(state => {
            if (state.eventHandlers[eventType]?.[index]) {
              state.eventHandlers[eventType][index] = handler
              state.dirtyProperties.add(`eventHandlers.${eventType}`)
            }
          })
        },

        removeEventHandler: (eventType: string, index: number) => {
          set(state => {
            if (state.eventHandlers[eventType]) {
              state.eventHandlers[eventType].splice(index, 1)
              if (state.eventHandlers[eventType].length === 0) {
                delete state.eventHandlers[eventType]
              }
              state.dirtyProperties.add(`eventHandlers.${eventType}`)
            }
          })
        },

        setEventValidationError: (eventType: string, error: string) => {
          set(state => {
            state.eventValidationErrors[eventType] = error
          })
        },

        // 样式管理 - 扩展样式相关功能
        setCustomStyle: (propertyPath: string, style: CSSProperties) => {
          set(state => {
            state.customStyles[propertyPath] = style
            state.dirtyProperties.add(`customStyles.${propertyPath}`)
          })
        },

        removeCustomStyle: (propertyPath: string) => {
          set(state => {
            delete state.customStyles[propertyPath]
            state.dirtyProperties.add(`customStyles.${propertyPath}`)
          })
        },

        // 样式属性更新（集成样式store）
        updateStyleProperty: (property: string, value: unknown) => {
          const styleStore = useStyleStore.getState()
          styleStore.updateStyle(property, value)

          // 同时更新到属性配置中以保持一致性
          set(state => {
            const stylePropertyKey = `style.${property}`
            state.previewProperties[stylePropertyKey] = value
            state.dirtyProperties.add(stylePropertyKey)
          })
        },

        updateStyleProperties: (updates: Record<string, unknown>) => {
          const styleStore = useStyleStore.getState()
          styleStore.updateStyles(updates)

          // 同时更新到属性配置中
          set(state => {
            Object.entries(updates).forEach(([property, value]) => {
              const stylePropertyKey = `style.${property}`
              state.previewProperties[stylePropertyKey] = value
              state.dirtyProperties.add(stylePropertyKey)
            })
          })
        },

        // 性能优化的样式属性更新
        updateStylePropertyOptimized: (componentId: string, property: string, value: unknown) => {
          const styleStore = useStyleStore.getState()
          styleStore.updateStyleOptimized(componentId, property, value)

          // 同时更新到属性配置中以保持一致性
          set(state => {
            const stylePropertyKey = `style.${property}`
            state.previewProperties[stylePropertyKey] = value
            state.dirtyProperties.add(stylePropertyKey)
          })
        },

        updateStylePropertiesOptimized: (componentId: string, updates: Record<string, unknown>) => {
          const styleStore = useStyleStore.getState()
          styleStore.updateStylesOptimized(componentId, updates)

          // 同时更新到属性配置中
          set(state => {
            Object.entries(updates).forEach(([property, value]) => {
              const stylePropertyKey = `style.${property}`
              state.previewProperties[stylePropertyKey] = value
              state.dirtyProperties.add(stylePropertyKey)
            })
          })
        },

        // 样式预设管理
        applyStylePreset: (presetId: string) => {
          const styleStore = useStyleStore.getState()
          styleStore.applyStylePreset(presetId)

          set(state => {
            state.appliedPreset = presetId
          })
        },

        saveStylePreset: async (preset: Omit<StylePreset, 'id'>) => {
          const styleStore = useStyleStore.getState()
          return await styleStore.saveStylePreset(preset)
        },

        loadStylePresets: async () => {
          const styleStore = useStyleStore.getState()
          await styleStore.loadStylePresets()

          set(state => {
            state.stylePresets = styleStore.stylePresets
          })
        },

        // 预览模式切换
        setPreviewMode: (enabled: boolean) => {
          set(state => {
            state.isPreviewMode = enabled
            if (!enabled) {
              // 退出预览模式时恢复到保存状态
              state.previewProperties = { ...state.properties }
              state.dirtyProperties.clear()
              state.validationErrors = {}
            }
          })
        },

        // 状态管理
        setLoading: (loading: boolean) => {
          set(state => {
            state.loading = loading
          })
        },

        setError: (error: string | null) => {
          set(state => {
            state.error = error
          })
        },

        clearError: () => {
          set(state => {
            state.error = null
          })
        },

        // 重置
        reset: () => {
          set(state => {
            Object.assign(state, initialState)
          })
        },
      }))
    ),
    {
      name: 'property-store',
    }
  )
)

