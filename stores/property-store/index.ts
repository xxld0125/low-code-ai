/**
 * 属性配置状态管理入口文件
 * 导出所有store相关的类型、hooks和工具
 */

// 导出主store和相关hooks
export { usePropertyStore } from './property-store'
export type { EventHandlerConfig, CSSProperties } from './property-store'

// 导出所有选择器
export {
  // 基础状态选择器
  useSelectedComponentId,
  useSelectedComponent,
  useProperties,
  usePreviewProperties,
  useDirtyProperties,

  // 状态标志选择器
  usePropertyLoading,
  usePropertySaving,
  usePropertyError,

  // 预览状态选择器
  usePreviewMode,

  // 验证状态选择器
  useValidationErrors,
  useValidationState,
  usePropertyValidationError,

  // 历史状态选择器
  useHistory,
  useCanUndo,
  useCanRedo,

  // 事件状态选择器
  useEventHandlers,
  useEventValidationErrors,
  useEventHandlerByType,

  // 样式状态选择器
  useCustomStyles,
  useCustomStyleByPath,
  useStylesPresets,

  // 动作选择器
  useSelectComponent,
  useUpdateProperty,
  useUpdateProperties,
  useSaveProperties,
  useResetProperties,
  useUndo,
  useRedo,
  useSaveToHistory,

  // 验证动作选择器
  useSetValidationError,
  useClearValidationError,
  useClearAllValidationErrors,

  // 事件动作选择器
  useAddEventHandler,
  useUpdateEventHandler,
  useRemoveEventHandler,
  useSetEventValidationError,

  // 样式动作选择器
  useSetCustomStyle,
  useRemoveCustomStyle,

  // 预览模式动作选择器
  useSetPreviewMode,

  // 状态管理动作选择器
  useSetPropertyLoading,
  useSetPropertyError,
  useClearPropertyError,
  useResetPropertyStore,

  // 复合选择器
  useIsDirty,
  useHasValidationErrors,
  useCanSave,

  // 属性选择器
  useProperty,
  useSavedProperty,
  useIsPropertyDirty,

  // 组件特定选择器
  useSelectedComponentName,
  useSelectedComponentType,
  useSelectedComponentIdSafe,
} from './selectors'