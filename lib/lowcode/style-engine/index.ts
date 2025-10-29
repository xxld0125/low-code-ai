/**
 * 样式引擎主导出文件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 * 功能: 统一导出样式引擎的所有功能模块
 */

// 核心样式处理
export {
  StyleEngine,
  defaultStyleEngine,
  processComponentStyles,
  mergeComponentStyles,
  generateComponentCSSClass,
} from './styles'

export type {
  ExtendedComponentStyles,
  StyleProcessingOptions,
  StyleProcessingResult,
} from './styles'

// 响应式样式处理
export {
  ResponsiveStyleProcessor,
  DEFAULT_BREAKPOINTS,
  defaultResponsiveProcessor,
  processResponsiveStyles,
  getCurrentBreakpoint,
  getStylesAtWidth,
  createMediaQuery,
  responsiveUtils,
} from './responsive'

// 样式验证
export {
  StyleValidator,
  defaultStyleValidator,
  validateComponentStyles,
  addValidationRule,
  removeValidationRule,
} from './validation'

export type {
  ValidationError,
  ValidationResult,
  ValidationOptions,
  ValidationRule,
} from './validation'

// 样式缓存
export {
  StyleCacheManager,
  StyleProcessorCacheFactory,
  defaultStyleCache,
  getCachedStyleResult,
  setCachedStyleResult,
  getCachedResponsiveResult,
  setCachedResponsiveResult,
  getCachedValidationResult,
  setCachedValidationResult,
} from './cache'

export type { CacheConfig, CacheStats, CacheEvents, CacheKeyGenerator } from './cache'

// 类型导出
export type {
  ComponentStyles,
  SpacingValue,
  BorderProperties,
  BorderRadiusValue,
  FlexProperties,
  GridProperties,
  TransformProperties,
  TransitionProperties,
} from './styles'

export type {
  Breakpoint,
  ResponsiveStyle,
  BreakpointConfig,
  ResponsiveOptions,
  ResponsiveResult,
  ResponsiveStyleRule,
} from './responsive'

/**
 * 样式引擎版本信息
 */
export const STYLE_ENGINE_VERSION = '1.0.0'
export const STYLE_ENGINE_BUILD_DATE = '2025-10-29'
