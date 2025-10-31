/**
 * 属性编辑器导出
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

// 核心组件
export { PropertyEditor } from './PropertyEditor'
export { PropertyField } from './PropertyField'
export { StyleEditor } from './StyleEditor'
export { GridEditor } from './GridEditor'

// 字段类型编辑器
export * from './FieldTypes'

// 属性分组和布局
export {
  PropertyGroup,
  PropertyGroupLayout,
  groupPropertiesByType,
  COMMON_PROPERTY_GROUPS,
} from './PropertyGroup'

// 属性验证
export {
  ValidationDisplay,
  usePropertyValidator,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
  type ValidationInfo,
} from './PropertyValidator'

// 属性依赖管理
export {
  usePropertyDependency,
  ConditionBuilder,
  COMMON_DEPENDENCIES,
  validateDependencyRules,
  type DependencyRule,
  type ExtendedPropertyCondition,
  type ConditionOperator,
} from './PropertyDependency'

// 默认导出主组件
export { PropertyEditor as default } from './PropertyEditor'
