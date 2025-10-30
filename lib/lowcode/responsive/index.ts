/**
 * 响应式设计系统导出
 * 统一导出响应式断点、工具函数和可访问性标准
 *
 * 创建日期: 2025-10-29
 * 功能模块: T009-响应式设计断点和可访问性标准
 */

// 断点系统导出
export {
  type Breakpoint,
  type BreakpointConfig,
  BREAKPOINTS,
  BREAKPOINT_VALUES,
  MEDIA_QUERIES,
  MIN_WIDTH_QUERIES,
  MAX_WIDTH_QUERIES,
  BREAKPOINT_ORDER,
  getBreakpointForWidth,
  getNextBreakpoints,
  getPreviousBreakpoints,
  getNextBreakpoint,
  getPreviousBreakpoint,
  isValidBreakpoint,
} from './breakpoints'

// 响应式工具函数导出
export {
  type ResponsiveValue,
  type ResponsiveStyles,
  type TailwindClassOptions,
  type CSSVariable,
  generateResponsiveClasses,
  generateResponsiveCSSVariables,
  generateResponsiveMediaQuery,
  getCurrentBreakpoint,
  watchBreakpointChange,
  createResponsiveStyle,
  mergeResponsiveStyles,
  getStylesForBreakpoint,
  validateResponsiveValue,
  createResponsiveSpacing,
  createResponsiveFontSize,
} from './utils'

// 可访问性标准导出
export {
  type AccessibilityCheck,
  type ContrastCheck,
  type AccessibilityConfig,
  WCAG_STANDARDS,
  ACCESSIBILITY_CONSTANTS,
  hexToRgb,
  calculateLuminance,
  calculateContrastRatio,
  isLargeText,
  checkContrast,
  checkTouchTarget,
  checkFocusIndicator,
  generateAriaSuggestions,
  generateKeyboardSupport,
  checkPageTitle,
  checkLanguageAttribute,
  generateAccessibilityReport,
} from './accessibility'

// 栅格系统导出
export {
  type GridSystemConfig,
  type GridColumn,
  type GridRow,
  type GridContainer,
  GridSystemManager,
  DEFAULT_GRID_CONFIG,
  RESPONSIVE_GRID_CONFIGS,
  defaultGridSystem,
  getGridSystem,
  gridUtils,
  calculateGridWidth,
  calculateGridOffset,
  validateGridSpan,
  validateGridOffset,
  calculateGridColumnStyles,
  calculateGridRowStyles,
  calculateGridContainerStyles,
  getResponsiveValue,
} from './grid-system'

// 版本信息
export const RESPONSIVE_SYSTEM_VERSION = '1.0.0'
export const WCAG_VERSION = '2.1'
export const ACCESSIBILITY_LEVEL = 'AA'

/**
 * 响应式系统信息
 */
export const RESPONSIVE_SYSTEM_INFO = {
  version: RESPONSIVE_SYSTEM_VERSION,
  wcagVersion: WCAG_VERSION,
  accessibilityLevel: ACCESSIBILITY_LEVEL,
  breakpoints: {
    mobile: '0-767px',
    tablet: '768-1023px',
    desktop: '1024px+',
  },
  features: [
    '三级响应式断点系统',
    'Tailwind CSS 类名生成',
    'CSS 变量支持',
    '媒体查询生成',
    'WCAG 2.1 AA 可访问性标准',
    '颜色对比度检查',
    '触摸目标尺寸验证',
    '焦点指示器检查',
    'ARIA 属性建议',
    '键盘导航支持',
  ],
} as const

/**
 * 默认配置导出
 */
export const DEFAULT_CONFIG = {
  breakpoints: {
    mobile: { min: 0, max: 767 },
    tablet: { min: 768, max: 1023 },
    desktop: { min: 1024, max: Infinity },
  },
  accessibility: {
    contrastRatio: 4.5,
    targetSize: 44,
    enableKeyboard: true,
    enableScreenReader: true,
  },
  performance: {
    debounceTime: 150,
    maxBreakpointChecks: 10,
  },
} as const
