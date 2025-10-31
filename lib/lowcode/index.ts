/**
 * 低代码核心逻辑导出
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-28
 * 更新日期: 2025-10-29 (T010-样式引擎和主题系统)
 */

// T009: 响应式设计断点和可访问性标准
export * from './responsive'

// T010: 样式引擎和主题系统
export {
  StyleEngine,
  defaultStyleEngine,
  processComponentStyles,
  mergeComponentStyles,
  generateComponentCSSClass,
  ResponsiveStyleProcessor,
  DEFAULT_BREAKPOINTS,
  defaultResponsiveProcessor,
  processResponsiveStyles,
  getCurrentBreakpoint,
  getStylesAtWidth,
  createMediaQuery,
  StyleValidator,
  defaultStyleValidator,
  validateComponentStyles,
  StyleCacheManager,
  StyleProcessorCacheFactory,
  defaultStyleCache,
} from './style-engine'

export type {
  ExtendedComponentStyles,
  StyleProcessingOptions,
  StyleProcessingResult,
  ValidationError as StyleValidationError,
  ValidationOptions,
  ValidationRule as StyleValidationRule,
  CacheConfig,
  CacheStats,
  CacheEvents,
  CacheKeyGenerator,
  ComponentStyles,
  SpacingValue,
  BorderProperties,
  BorderRadiusValue,
  FlexProperties,
  GridProperties,
  TransformProperties,
  TransitionProperties,
  Breakpoint as StyleEngineBreakpoint,
  ResponsiveStyle,
  BreakpointConfig as StyleEngineBreakpointConfig,
  ResponsiveOptions,
  ResponsiveResult,
  ResponsiveStyleRule,
} from './style-engine'

// 样式引擎特定的导出，避免冲突
export { DEFAULT_BREAKPOINTS as STYLE_ENGINE_BREAKPOINTS, responsiveUtils } from './style-engine'

// T114: 新增编辑器类型和工具导出
export * from './types/editor'
export type { PreviewConfig as EditorPreviewConfig } from './types/editor'
export {
  BREAKPOINTS,
  BREAKPOINT_ARRAY,
  DEFAULT_BREAKPOINT,
  getBreakpointById,
  getBreakpointByWidth,
} from './constants/breakpoints'

export type { BreakpointId } from './constants/breakpoints'
export * from './constants/style-presets'
export * from './utils/style-utils'
export type {
  ValidationError as StyleValidationError,
  ValidationResult as StyleValidationResult,
  ValidationSeverity,
} from './validation/style-validator'
export { STYLE_VALIDATION_RULES } from './validation/style-validator'
// export {
//   globalStyleValidator,
//   validateStyles,
//   addCustomValidationRule,
//   createStyleValidator
// } from './validation/style-validator'

// export type {
//   ValidationError as StyleValidationError,
//   ValidationRule as StyleValidationRule,
//   ValidationResult as StyleValidationResult,
//   ValidationRuleType
// } from './validation/style-validator'
// export * from './style-engine/preview'

// 将在后续任务中添加导出
// export * from './component-system'
