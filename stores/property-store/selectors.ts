/**
 * 属性配置状态选择器
 * 提供优化的状态选择器以防止不必要的重新渲染
 */

import { usePropertyStore } from './property-store'

// 基础状态选择器
export const useSelectedComponentId = () => usePropertyStore((state) => state.selectedComponentId)
export const useSelectedComponent = () => usePropertyStore((state) => state.selectedComponent)
export const useProperties = () => usePropertyStore((state) => state.properties)
export const usePreviewProperties = () => usePropertyStore((state) => state.previewProperties)
export const useDirtyProperties = () => usePropertyStore((state) => state.dirtyProperties)

// 状态标志选择器
export const usePropertyLoading = () => usePropertyStore((state) => state.loading)
export const usePropertySaving = () => usePropertyStore((state) => state.saving)
export const usePropertyError = () => usePropertyStore((state) => state.error)

// 预览状态选择器
export const usePreviewMode = () => usePropertyStore((state) => state.isPreviewMode)

// 验证状态选择器
export const useValidationErrors = () => usePropertyStore((state) => state.validationErrors)
export const useValidationState = () => usePropertyStore((state) => state.validationState)
export const usePropertyValidationError = (propertyPath: string) =>
  usePropertyStore((state) => state.validationErrors[propertyPath])

// 历史状态选择器
export const useHistory = () => usePropertyStore((state) => state.history)
export const useCanUndo = () => usePropertyStore((state) => state.history.past.length > 0)
export const useCanRedo = () => usePropertyStore((state) => state.history.future.length > 0)

// 事件状态选择器
export const useEventHandlers = () => usePropertyStore((state) => state.eventHandlers)
export const useEventValidationErrors = () => usePropertyStore((state) => state.eventValidationErrors)
export const useEventHandlerByType = (eventType: string) =>
  usePropertyStore((state) => state.eventHandlers[eventType] || [])

// 样式状态选择器
export const useCustomStyles = () => usePropertyStore((state) => state.customStyles)
export const useCustomStyleByPath = (propertyPath: string) =>
  usePropertyStore((state) => state.customStyles[propertyPath])

// 样式预设选择器
export const useStylesPresets = () => usePropertyStore((state) => state.stylePresets)

// 动作选择器（防止无限重新渲染）
export const useSelectComponent = () => usePropertyStore((state) => state.selectComponent)
export const useUpdateProperty = () => usePropertyStore((state) => state.updateProperty)
export const useUpdateProperties = () => usePropertyStore((state) => state.updateProperties)
export const useSaveProperties = () => usePropertyStore((state) => state.saveProperties)
export const useResetProperties = () => usePropertyStore((state) => state.resetProperties)
export const useUndo = () => usePropertyStore((state) => state.undo)
export const useRedo = () => usePropertyStore((state) => state.redo)
export const useSaveToHistory = () => usePropertyStore((state) => state.saveToHistory)

// 验证动作选择器
export const useSetValidationError = () => usePropertyStore((state) => state.setValidationError)
export const useClearValidationError = () => usePropertyStore((state) => state.clearValidationError)
export const useClearAllValidationErrors = () => usePropertyStore((state) => state.clearAllValidationErrors)

// 事件动作选择器
export const useAddEventHandler = () => usePropertyStore((state) => state.addEventHandler)
export const useUpdateEventHandler = () => usePropertyStore((state) => state.updateEventHandler)
export const useRemoveEventHandler = () => usePropertyStore((state) => state.removeEventHandler)
export const useSetEventValidationError = () => usePropertyStore((state) => state.setEventValidationError)

// 样式动作选择器
export const useSetCustomStyle = () => usePropertyStore((state) => state.setCustomStyle)
export const useRemoveCustomStyle = () => usePropertyStore((state) => state.removeCustomStyle)

// 预览模式动作选择器
export const useSetPreviewMode = () => usePropertyStore((state) => state.setPreviewMode)

// 状态管理动作选择器
export const useSetPropertyLoading = () => usePropertyStore((state) => state.setLoading)
export const useSetPropertyError = () => usePropertyStore((state) => state.setError)
export const useClearPropertyError = () => usePropertyStore((state) => state.clearError)
export const useResetPropertyStore = () => usePropertyStore((state) => state.reset)

// 复合选择器
export const useIsDirty = () => usePropertyStore((state) => state.dirtyProperties.size > 0)
export const useHasValidationErrors = () => usePropertyStore((state) =>
  Object.keys(state.validationErrors).length > 0 || Object.keys(state.eventValidationErrors).length > 0
)
export const useCanSave = () => usePropertyStore((state) =>
  state.dirtyProperties.size > 0 &&
  !state.saving &&
  Object.keys(state.validationErrors).length === 0 &&
  Object.keys(state.eventValidationErrors).length === 0
)

// 属性选择器（带缓存）
export const useProperty = (propertyPath: string) =>
  usePropertyStore((state) => state.previewProperties[propertyPath])
export const useSavedProperty = (propertyPath: string) =>
  usePropertyStore((state) => state.properties[propertyPath])
export const useIsPropertyDirty = (propertyPath: string) =>
  usePropertyStore((state) => state.dirtyProperties.has(propertyPath))

// 组件特定选择器
export const useSelectedComponentName = () =>
  usePropertyStore((state) => state.selectedComponent?.name || '')
export const useSelectedComponentType = () =>
  usePropertyStore((state) => state.selectedComponent?.type || '')
export const useSelectedComponentIdSafe = () =>
  usePropertyStore((state) => state.selectedComponentId || '')