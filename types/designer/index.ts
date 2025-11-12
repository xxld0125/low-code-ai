// Export all designer types
export * from './api'
export * from './field'
export * from './relationship'
export * from './table'

// 属性配置面板相关类型
export type {
  PropertyValue,
  PropertyConfigState,
  PropertyConfigActions,
  HistoryState,
  HistorySnapshot,
  ValidationState,
  StylePreset,
  CSSProperties,
  ComponentInstance,
  PropertyDefinition,
  PropertyCategory,
  PropertyType,
  ValueType,
  ValidationRule,
  ValidationType,
  PropertyUIConfig,
  PropertyOption,
  PropertyDependency,
  PropertyCondition,
  ConditionOperator,
  ComponentType,
} from './property-config'

// 事件处理相关类型（从store导入）
export type { EventHandlerConfig } from '@/stores/property-store'
