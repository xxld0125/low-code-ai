/**
 * 属性配置面板Store - 事件处理切片
 * 管理组件事件配置的状态和操作
 */

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type {
  EventConfig,
  EventAction,
  EventValidationResult,
  EventExecutionResult,
  EventExecutionContext
} from '@/types/designer'

// 事件处理器状态
export interface EventStoreState {
  // 当前组件的事件配置
  selectedComponentId: string | null
  eventConfigs: Record<string, EventConfig[]>

  // 事件配置编辑状态
  editingEventId: string | null
  editingActionId: string | null

  // 事件验证状态
  eventValidationErrors: Record<string, EventValidationResult>
  isEventValidating: boolean

  // 事件执行状态
  isEventExecuting: boolean
  lastEventExecutionResult: EventExecutionResult | null
  eventExecutionHistory: Array<{
    eventId: string
    result: EventExecutionResult
    timestamp: number
  }>

  // 事件模板和预设
  eventTemplates: Record<string, EventAction[]>
  availableEventTypes: string[]

  // 加载和错误状态
  loading: boolean
  saving: boolean
  error: string | null
}

// 事件处理器操作
export interface EventStoreActions {
  // 组件选择管理
  selectComponent: (componentId: string | null) => void

  // 事件配置操作
  addEventConfig: (eventType: string, config: Partial<EventConfig>) => void
  updateEventConfig: (eventId: string, updates: Partial<EventConfig>) => void
  removeEventConfig: (eventId: string) => void
  reorderEventConfigs: (componentId: string, fromIndex: number, toIndex: number) => void

  // 事件动作操作
  addActionToEvent: (eventId: string, action: Omit<EventAction, 'id'>) => void
  updateEventAction: (eventId: string, actionId: string, updates: Partial<EventAction>) => void
  removeEventAction: (eventId: string, actionId: string) => void
  reorderEventActions: (eventId: string, fromIndex: number, toIndex: number) => void

  // 事件配置编辑
  startEditingEvent: (eventId: string | null) => void
  startEditingAction: (actionId: string | null) => void
  stopEditing: () => void

  // 事件验证
  validateEventConfig: (eventId: string) => Promise<EventValidationResult>
  validateAllEvents: () => Promise<Record<string, EventValidationResult>>
  clearEventValidationError: (eventId: string) => void
  clearAllEventValidationErrors: () => void

  // 事件执行
  executeEvent: (eventId: string, context: EventExecutionContext) => Promise<EventExecutionResult>
  executeEventAction: (action: EventAction, context: EventExecutionContext) => Promise<void>

  // 事件模板管理
  loadEventTemplates: () => Promise<void>
  getEventTemplate: (templateName: string) => EventAction[]

  // 数据持久化
  saveEventConfigs: (componentId: string) => Promise<void>
  loadEventConfigs: (componentId: string) => Promise<void>

  // 批量操作
  batchUpdateEvents: (updates: Array<{ eventId: string; updates: Partial<EventConfig> }>) => void
  duplicateEvent: (eventId: string) => void

  // 状态管理
  setLoading: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  // 重置操作
  reset: () => void
  resetComponentEvents: (componentId: string) => void
}

// 合并的Store类型
export type EventStore = EventStoreState & EventStoreActions

// 创建事件Store
export const useEventStore = create<EventStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // 初始状态
        selectedComponentId: null,
        eventConfigs: {},
        editingEventId: null,
        editingActionId: null,
        eventValidationErrors: {},
        isEventValidating: false,
        isEventExecuting: false,
        lastEventExecutionResult: null,
        eventExecutionHistory: [],
        eventTemplates: {},
        availableEventTypes: [
          'click',
          'dblclick',
          'submit',
          'change',
          'input',
          'focus',
          'blur',
          'mouseover',
          'mouseout',
          'keydown',
          'keyup',
          'load',
          'resize',
          'scroll'
        ],
        loading: false,
        saving: false,
        error: null,

        // 组件选择管理
        selectComponent: (componentId: string | null) => {
          set((state) => {
            state.selectedComponentId = componentId
            state.editingEventId = null
            state.editingActionId = null
          })
        },

        // 事件配置操作
        addEventConfig: (eventType: string, config: Partial<EventConfig>) => {
          set((state) => {
            const componentId = state.selectedComponentId
            if (!componentId) return

            if (!state.eventConfigs[componentId]) {
              state.eventConfigs[componentId] = []
            }

            const newEvent: EventConfig = {
              id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: eventType,
              actions: [],
              enabled: true,
              order: state.eventConfigs[componentId].length + 1,
              ...config
            }

            state.eventConfigs[componentId].push(newEvent)
            state.editingEventId = newEvent.id
          })
        },

        updateEventConfig: (eventId: string, updates: Partial<EventConfig>) => {
          set((state) => {
            const componentId = state.selectedComponentId
            if (!componentId || !state.eventConfigs[componentId]) return

            const eventIndex = state.eventConfigs[componentId].findIndex(e => e.id === eventId)
            if (eventIndex === -1) return

            Object.assign(state.eventConfigs[componentId][eventIndex], updates)
          })
        },

        removeEventConfig: (eventId: string) => {
          set((state) => {
            const componentId = state.selectedComponentId
            if (!componentId || !state.eventConfigs[componentId]) return

            state.eventConfigs[componentId] = state.eventConfigs[componentId].filter(
              event => event.id !== eventId
            )

            // 重新排序
            state.eventConfigs[componentId].forEach((event, index) => {
              event.order = index + 1
            })

            // 如果正在编辑被删除的事件，停止编辑
            if (state.editingEventId === eventId) {
              state.editingEventId = null
            }
          })
        },

        reorderEventConfigs: (componentId: string, fromIndex: number, toIndex: number) => {
          set((state) => {
            if (!state.eventConfigs[componentId]) return

            const events = [...state.eventConfigs[componentId]]
            const [movedEvent] = events.splice(fromIndex, 1)
            events.splice(toIndex, 0, movedEvent)

            // 重新设置顺序
            events.forEach((event, index) => {
              event.order = index + 1
            })

            state.eventConfigs[componentId] = events
          })
        },

        // 事件动作操作
        addActionToEvent: (eventId: string, action: Omit<EventAction, 'id'>) => {
          set((state) => {
            const componentId = state.selectedComponentId
            if (!componentId || !state.eventConfigs[componentId]) return

            const eventIndex = state.eventConfigs[componentId].findIndex(e => e.id === eventId)
            if (eventIndex === -1) return

            const newAction: EventAction = {
              id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              ...action
            }

            state.eventConfigs[componentId][eventIndex].actions.push(newAction)
            state.editingActionId = newAction.id
          })
        },

        updateEventAction: (eventId: string, actionId: string, updates: Partial<EventAction>) => {
          set((state) => {
            const componentId = state.selectedComponentId
            if (!componentId || !state.eventConfigs[componentId]) return

            const eventIndex = state.eventConfigs[componentId].findIndex(e => e.id === eventId)
            if (eventIndex === -1) return

            const actionIndex = state.eventConfigs[componentId][eventIndex].actions.findIndex(
              action => action.id === actionId
            )
            if (actionIndex === -1) return

            Object.assign(
              state.eventConfigs[componentId][eventIndex].actions[actionIndex],
              updates
            )
          })
        },

        removeEventAction: (eventId: string, actionId: string) => {
          set((state) => {
            const componentId = state.selectedComponentId
            if (!componentId || !state.eventConfigs[componentId]) return

            const eventIndex = state.eventConfigs[componentId].findIndex(e => e.id === eventId)
            if (eventIndex === -1) return

            state.eventConfigs[componentId][eventIndex].actions =
              state.eventConfigs[componentId][eventIndex].actions.filter(
                action => action.id !== actionId
              )

            // 重新排序
            state.eventConfigs[componentId][eventIndex].actions.forEach((action, index) => {
              action.order = index + 1
            })

            if (state.editingActionId === actionId) {
              state.editingActionId = null
            }
          })
        },

        reorderEventActions: (eventId: string, fromIndex: number, toIndex: number) => {
          set((state) => {
            const componentId = state.selectedComponentId
            if (!componentId || !state.eventConfigs[componentId]) return

            const eventIndex = state.eventConfigs[componentId].findIndex(e => e.id === eventId)
            if (eventIndex === -1) return

            const actions = [...state.eventConfigs[componentId][eventIndex].actions]
            const [movedAction] = actions.splice(fromIndex, 1)
            actions.splice(toIndex, 0, movedAction)

            // 重新设置顺序
            actions.forEach((action, index) => {
              action.order = index + 1
            })

            state.eventConfigs[componentId][eventIndex].actions = actions
          })
        },

        // 事件配置编辑
        startEditingEvent: (eventId: string | null) => {
          set((state) => {
            state.editingEventId = eventId
            state.editingActionId = null
          })
        },

        startEditingAction: (actionId: string | null) => {
          set((state) => {
            state.editingActionId = actionId
          })
        },

        stopEditing: () => {
          set((state) => {
            state.editingEventId = null
            state.editingActionId = null
          })
        },

        // 事件验证
        validateEventConfig: async (eventId: string): Promise<EventValidationResult> => {
          set((state) => {
            state.isEventValidating = true
          })

          try {
            // 这里应该调用验证逻辑
            // 暂时返回模拟结果
            const result: EventValidationResult = {
              isValid: true,
              errors: [],
              warnings: []
            }

            set((state) => {
              state.eventValidationErrors[eventId] = result
              state.isEventValidating = false
            })

            return result
          } catch (error) {
            const errorResult: EventValidationResult = {
              isValid: false,
              errors: [error instanceof Error ? error.message : '验证失败'],
              warnings: []
            }

            set((state) => {
              state.eventValidationErrors[eventId] = errorResult
              state.isEventValidating = false
            })

            return errorResult
          }
        },

        validateAllEvents: async (): Promise<Record<string, EventValidationResult>> => {
          set((state) => {
            state.isEventValidating = true
          })

          try {
            const componentId = get().selectedComponentId
            if (!componentId || !get().eventConfigs[componentId]) {
              set((state) => {
                state.isEventValidating = false
              })
              return {}
            }

            const events = get().eventConfigs[componentId]
            const results: Record<string, EventValidationResult> = {}

            for (const event of events) {
              results[event.id] = await get().validateEventConfig(event.id)
            }

            set((state) => {
              state.isEventValidating = false
            })

            return results
          } catch (error) {
            set((state) => {
              state.isEventValidating = false
            })
            throw error
          }
        },

        clearEventValidationError: (eventId: string) => {
          set((state) => {
            delete state.eventValidationErrors[eventId]
          })
        },

        clearAllEventValidationErrors: () => {
          set((state) => {
            state.eventValidationErrors = {}
          })
        },

        // 事件执行
        executeEvent: async (eventId: string, context: EventExecutionContext): Promise<EventExecutionResult> => {
          set((state) => {
            state.isEventExecuting = true
          })

          try {
            const componentId = get().selectedComponentId
            if (!componentId || !get().eventConfigs[componentId]) {
              throw new Error('未找到组件事件配置')
            }

            const event = get().eventConfigs[componentId].find(e => e.id === eventId)
            if (!event) {
              throw new Error('未找到事件配置')
            }

            if (!event.enabled) {
              const result: EventExecutionResult = {
                success: false,
                executedActions: [],
                errors: ['事件已禁用'],
                executionTime: 0
              }

              set((state) => {
                state.isEventExecuting = false
                state.lastEventExecutionResult = result
              })

              return result
            }

            const startTime = Date.now()
            const executedActions: string[] = []
            const errors: string[] = []

            // 按顺序执行动作
            for (const action of event.actions.sort((a, b) => a.order - b.order)) {
              try {
                if (action.enabled !== false) {
                  await get().executeEventAction(action, context)
                  executedActions.push(action.id)

                  // 处理延迟
                  if (action.delay && action.delay > 0) {
                    await new Promise(resolve => setTimeout(resolve, action.delay))
                  }
                }
              } catch (error) {
                errors.push(`动作 ${action.id} 执行失败: ${error instanceof Error ? error.message : '未知错误'}`)
              }
            }

            const executionTime = Date.now() - startTime
            const result: EventExecutionResult = {
              success: errors.length === 0,
              executedActions,
              errors,
              executionTime
            }

            set((state) => {
              state.isEventExecuting = false
              state.lastEventExecutionResult = result
              state.eventExecutionHistory.push({
                eventId,
                result,
                timestamp: Date.now()
              })

              // 限制历史记录数量
              if (state.eventExecutionHistory.length > 100) {
                state.eventExecutionHistory = state.eventExecutionHistory.slice(-50)
              }
            })

            return result
          } catch (error) {
            const errorResult: EventExecutionResult = {
              success: false,
              executedActions: [],
              errors: [error instanceof Error ? error.message : '事件执行失败'],
              executionTime: 0
            }

            set((state) => {
              state.isEventExecuting = false
              state.lastEventExecutionResult = errorResult
            })

            return errorResult
          }
        },

        executeEventAction: async (action: EventAction, context: EventExecutionContext): Promise<void> => {
          // 这里应该根据action类型执行相应的逻辑
          // 暂时使用模拟实现
          console.log('执行事件动作:', action.type, action.payload, context)
        },

        // 事件模板管理
        loadEventTemplates: async (): Promise<void> => {
          set((state) => {
            state.loading = true
          })

          try {
            // 这里应该从API或配置文件加载模板
            // 暂时使用内置模板
            const templates = {
              'navigate': [
                {
                  id: 'template-navigate',
                  type: 'navigate' as const,
                  payload: { url: '/target-page' },
                  order: 1,
                  description: '页面导航'
                }
              ],
              'show-message': [
                {
                  id: 'template-message',
                  type: 'show-message' as const,
                  payload: { message: '操作成功', type: 'success' },
                  order: 1,
                  description: '显示消息'
                }
              ]
            }

            set((state) => {
              state.eventTemplates = templates
              state.loading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : '加载事件模板失败'
              state.loading = false
            })
          }
        },

        getEventTemplate: (templateName: string): EventAction[] => {
          const template = get().eventTemplates[templateName]
          return template ? template.map(action => ({
            ...action,
            id: `${action.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          })) : []
        },

        // 数据持久化
        saveEventConfigs: async (componentId: string): Promise<void> => {
          set((state) => {
            state.saving = true
            state.error = null
          })

          try {
            const eventConfigs = get().eventConfigs[componentId] || []

            // 这里应该调用API保存事件配置
            console.log('保存事件配置:', componentId, eventConfigs)

            set((state) => {
              state.saving = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : '保存事件配置失败'
              state.saving = false
            })
            throw error
          }
        },

        loadEventConfigs: async (componentId: string): Promise<void> => {
          set((state) => {
            state.loading = true
            state.error = null
          })

          try {
            // 这里应该从API加载事件配置
            // 暂时使用空配置
            const eventConfigs: EventConfig[] = []

            set((state) => {
              state.eventConfigs[componentId] = eventConfigs
              state.loading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : '加载事件配置失败'
              state.loading = false
            })
          }
        },

        // 批量操作
        batchUpdateEvents: (updates: Array<{ eventId: string; updates: Partial<EventConfig> }>) => {
          set((state) => {
            const componentId = state.selectedComponentId
            if (!componentId || !state.eventConfigs[componentId]) return

            updates.forEach(({ eventId, updates }) => {
              const eventIndex = state.eventConfigs[componentId].findIndex(e => e.id === eventId)
              if (eventIndex !== -1) {
                Object.assign(state.eventConfigs[componentId][eventIndex], updates)
              }
            })
          })
        },

        duplicateEvent: (eventId: string) => {
          set((state) => {
            const componentId = state.selectedComponentId
            if (!componentId || !state.eventConfigs[componentId]) return

            const originalEvent = state.eventConfigs[componentId].find(e => e.id === eventId)
            if (!originalEvent) return

            const duplicatedEvent: EventConfig = {
              ...originalEvent,
              id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              actions: originalEvent.actions.map(action => ({
                ...action,
                id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
              }))
            }

            state.eventConfigs[componentId].push(duplicatedEvent)
          })
        },

        // 状态管理
        setLoading: (loading: boolean) => {
          set((state) => {
            state.loading = loading
          })
        },

        setSaving: (saving: boolean) => {
          set((state) => {
            state.saving = saving
          })
        },

        setError: (error: string | null) => {
          set((state) => {
            state.error = error
          })
        },

        clearError: () => {
          set((state) => {
            state.error = null
          })
        },

        // 重置操作
        reset: () => {
          set((state) => {
            state.selectedComponentId = null
            state.eventConfigs = {}
            state.editingEventId = null
            state.editingActionId = null
            state.eventValidationErrors = {}
            state.isEventValidating = false
            state.isEventExecuting = false
            state.lastEventExecutionResult = null
            state.eventExecutionHistory = []
            state.loading = false
            state.saving = false
            state.error = null
          })
        },

        resetComponentEvents: (componentId: string) => {
          set((state) => {
            state.eventConfigs[componentId] = []
            // 删除该组件相关的事件验证错误
            Object.keys(state.eventValidationErrors).forEach(eventId => {
              if (state.eventConfigs[componentId].some(event => event.id === eventId)) {
                delete state.eventValidationErrors[eventId]
              }
            })
          })
        }
      }))
    ),
    {
      name: 'event-store'
    }
  )
)

// 优化的选择器hooks
export const useSelectedComponentId = () => useEventStore(state => state.selectedComponentId)
export const useEventConfigs = (componentId: string) => useEventStore(state => state.eventConfigs[componentId] || [])
export const useEventConfig = (eventId: string) => {
  const selectedComponentId = useSelectedComponentId()
  const eventConfigs = useEventConfigs(selectedComponentId || '')
  return eventConfigs.find(event => event.id === eventId)
}
export const useEditingEventId = () => useEventStore(state => state.editingEventId)
export const useEditingActionId = () => useEventStore(state => state.editingActionId)
export const useEventValidationErrors = () => useEventStore(state => state.eventValidationErrors)
export const useIsEventValidating = () => useEventStore(state => state.isEventValidating)
export const useIsEventExecuting = () => useEventStore(state => state.isEventExecuting)
export const useLastEventExecutionResult = () => useEventStore(state => state.lastEventExecutionResult)
export const useEventExecutionHistory = () => useEventStore(state => state.eventExecutionHistory)
export const useEventTemplates = () => useEventStore(state => state.eventTemplates)
export const useAvailableEventTypes = () => useEventStore(state => state.availableEventTypes)
export const useEventLoading = () => useEventStore(state => state.loading)
export const useEventSaving = () => useEventStore(state => state.saving)
export const useEventError = () => useEventStore(state => state.error)

// Action选择器（防止不必要的重新渲染）
export const useSelectComponent = () => useEventStore(state => state.selectComponent)
export const useAddEventConfig = () => useEventStore(state => state.addEventConfig)
export const useUpdateEventConfig = () => useEventStore(state => state.updateEventConfig)
export const useRemoveEventConfig = () => useEventStore(state => state.removeEventConfig)
export const useAddActionToEvent = () => useEventStore(state => state.addActionToEvent)
export const useUpdateEventAction = () => useEventStore(state => state.updateEventAction)
export const useRemoveEventAction = () => useEventStore(state => state.removeEventAction)
export const useExecuteEvent = () => useEventStore(state => state.executeEvent)
export const useValidateEventConfig = () => useEventStore(state => state.validateEventConfig)
export const useSaveEventConfigs = () => useEventStore(state => state.saveEventConfigs)
export const useLoadEventConfigs = () => useEventStore(state => state.loadEventConfigs)
export const useDuplicateEvent = () => useEventStore(state => state.duplicateEvent)
export const useStartEditingEvent = () => useEventStore(state => state.startEditingEvent)
export const useStopEditing = () => useEventStore(state => state.stopEditing)
export const useReorderEventConfigs = () => useEventStore(state => state.reorderEventConfigs)