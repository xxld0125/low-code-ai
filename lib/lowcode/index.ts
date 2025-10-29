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
  ValidationError,
  ValidationResult,
  ValidationOptions,
  ValidationRule,
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

// 将在后续任务中添加导出
// export * from './component-system'
// export * from './validation'
