/**
 * 设计系统统一导出
 * 提供shadcn/ui设计系统的完整集成
 *
 * 主要功能：
 * - 主题管理（明亮、暗黑、高对比度）
 * - 设计令牌系统
 * - 组件变体管理
 * - 响应式断点
 * - CSS变量生成
 */

// 主题系统导出
export {
  type Theme,
  type ThemeMode,
  type ThemeColors,
  type ThemeSpacing,
  type ThemeTypography,
  type ThemeShadows,
  type ThemeBorderRadius,
  type ThemeBreakpoints,
  lightTheme,
  darkTheme,
  highContrastTheme,
  themes,
  getTheme,
  applyTheme,
  themeClassNames,
} from './theme'

// 导入内部使用
import { applyTheme as _applyTheme, getTheme as _getTheme } from './theme'
import { componentVariants as _componentVariants } from './variants'
import {
  allDesignTokens as __allDesignTokens,
  tokensByType as __tokensByType,
  generateAllTokensCSS as __generateAllTokensCSS,
} from './tokens'

// 设计令牌系统导出
export {
  type DesignToken,
  type TokenType,
  type TokenCategory,
  primitiveColorTokens,
  semanticColorTokens,
  spacingTokens,
  fontSizeTokens,
  fontWeightTokens,
  lineHeightTokens,
  borderRadiusTokens,
  shadowTokens,
  breakpointTokens,
  zIndexTokens,
  transitionTokens,
  allDesignTokens,
  tokensByType,
  tokensByCategory,
  getTokenByName,
  getTokensByType,
  getTokensByCategory,
  getTokenCssVar,
  generateTokenCSS,
  generateAllTokensCSS,
} from './tokens'

// 组件变体系统导出
export {
  type BaseVariants,
  type ButtonVariants,
  type InputVariants,
  type CardVariants,
  type BadgeVariants,
  type TextVariants,
  type ContainerVariants,
  type GridVariants,
  type FlexVariants,
  type DividerVariants,
  type SpacerVariants,
  type ComponentVariantsType,
  buttonVariants,
  inputVariants,
  cardVariants,
  badgeVariants,
  textVariants,
  containerVariants,
  gridVariants,
  flexVariants,
  dividerVariants,
  spacerVariants,
  componentVariants,
  getVariantClasses,
  mergeVariantClasses,
  responsiveVariant,
} from './variants'

// 响应式断点导出（兼容现有系统）
export const BREAKPOINTS = {
  mobile: { min: 0, max: 767 }, // 移动端
  tablet: { min: 768, max: 1023 }, // 平板端
  desktop: { min: 1024, max: Infinity }, // 桌面端
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * 设计系统工具函数
 */

/**
 * 获取当前断点
 */
export function getCurrentBreakpoint(width: number): Breakpoint {
  if (width <= BREAKPOINTS.mobile.max) return 'mobile'
  if (width <= BREAKPOINTS.tablet.max) return 'tablet'
  return 'desktop'
}

/**
 * 生成响应式CSS类名
 */
export function generateResponsiveClass(
  baseClass: string,
  breakpoints: Partial<Record<Breakpoint, string>>
): string {
  const classes = [baseClass]

  if (breakpoints.mobile) {
    classes.push(breakpoints.mobile)
  }
  if (breakpoints.tablet) {
    classes.push(`sm:${breakpoints.tablet}`)
  }
  if (breakpoints.desktop) {
    classes.push(`lg:${breakpoints.desktop}`)
  }

  return classes.join(' ')
}

/**
 * 主题管理Hook的辅助函数
 */
export function createThemeUtils() {
  /**
   * 初始化主题系统
   */
  const initTheme = (mode: 'light' | 'dark' | 'high-contrast' = 'light'): void => {
    if (typeof window !== 'undefined') {
      _applyTheme(mode)

      // 保存到localStorage
      localStorage.setItem('design-system-theme', mode)
    }
  }

  /**
   * 从localStorage获取保存的主题
   */
  const getSavedTheme = (): 'light' | 'dark' | 'high-contrast' => {
    if (typeof window === 'undefined') return 'light'

    const saved = localStorage.getItem('design-system-theme')
    if (saved && ['light', 'dark', 'high-contrast'].includes(saved)) {
      return saved as 'light' | 'dark' | 'high-contrast'
    }

    // 检测系统主题偏好
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    return 'light'
  }

  /**
   * 切换主题
   */
  const toggleTheme = (
    mode?: 'light' | 'dark' | 'high-contrast'
  ): 'light' | 'dark' | 'high-contrast' => {
    const currentMode = getSavedTheme()
    const modes: ('light' | 'dark' | 'high-contrast')[] = ['light', 'dark', 'high-contrast']

    let newMode: 'light' | 'dark' | 'high-contrast'
    if (mode) {
      newMode = mode
    } else {
      const currentIndex = modes.indexOf(currentMode)
      newMode = modes[(currentIndex + 1) % modes.length]
    }

    initTheme(newMode)
    return newMode
  }

  /**
   * 监听系统主题变化
   */
  const watchSystemTheme = (callback: (mode: 'light' | 'dark') => void): (() => void) => {
    if (typeof window === 'undefined') return () => {}

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      callback(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }

  return {
    initTheme,
    getSavedTheme,
    toggleTheme,
    watchSystemTheme,
  }
}

/**
 * 设计系统配置对象
 */
export const designSystemConfig = {
  // 版本信息
  version: '1.0.0',

  // 支持的主题
  themes: ['light', 'dark', 'high-contrast'] as ('light' | 'dark' | 'high-contrast')[],

  // 默认主题
  defaultTheme: 'light' as 'light' | 'dark' | 'high-contrast',

  // 响应式断点
  breakpoints: BREAKPOINTS,

  // 组件变体映射
  variants: _componentVariants,

  // 设计令牌
  tokens: __allDesignTokens,

  // 工具函数
  utils: {
    getCurrentBreakpoint,
    generateResponsiveClass,
    createThemeUtils,
  },
}

/**
 * 默认导出设计系统配置
 */
export default designSystemConfig

/**
 * 开发环境下的调试工具
 */
export const debugUtils = {
  /**
   * 打印所有设计令牌
   */
  printAllTokens: () => {
    console.group('🎨 Design System Tokens')
    console.log('Total tokens:', __allDesignTokens.length)

    Object.entries(__tokensByType).forEach(([type, tokens]) => {
      if (tokens.length > 0) {
        console.group(`📦 ${type} (${tokens.length})`)
        tokens.forEach(token => {
          console.log(`  ${token.name}: ${token.value}`, token.description || '')
        })
        console.groupEnd()
      }
    })

    console.groupEnd()
  },

  /**
   * 打印主题信息
   */
  printThemeInfo: (mode: 'light' | 'dark' | 'high-contrast' = 'light') => {
    const theme = _getTheme(mode)
    console.group(`🎭 Theme: ${theme.name}`)
    console.log('Mode:', theme.mode)
    console.log('Colors:', theme.colors)
    console.log('Spacing:', theme.spacing)
    console.log('Typography:', theme.typography)
    console.groupEnd()
  },

  /**
   * 生成CSS变量调试信息
   */
  generateDebugCSS: () => {
    const css = __generateAllTokensCSS()
    console.log('📝 Generated CSS Variables:')
    console.log(css)
    return css
  },
}
