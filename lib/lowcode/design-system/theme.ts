/**
 * 设计系统主题配置
 * 支持明亮、暗黑、高对比度三种主题
 * 基于shadcn/ui设计系统扩展
 */

export type ThemeMode = 'light' | 'dark' | 'high-contrast'

export interface Theme {
  name: string
  mode: ThemeMode
  colors: ThemeColors
  spacing: ThemeSpacing
  typography: ThemeTypography
  shadows: ThemeShadows
  borderRadius: ThemeBorderRadius
  breakpoints: ThemeBreakpoints
}

export interface ThemeColors {
  // 基础色彩
  background: string
  foreground: string

  // 卡片和弹出层
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string

  // 主要色彩
  primary: string
  primaryForeground: string

  // 次要色彩
  secondary: string
  secondaryForeground: string

  // 静音色彩
  muted: string
  mutedForeground: string

  // 强调色彩
  accent: string
  accentForeground: string

  // 状态色彩
  destructive: string
  destructiveForeground: string
  warning: string
  warningForeground: string
  success: string
  successForeground: string
  info: string
  infoForeground: string

  // 边框和输入
  border: string
  input: string
  ring: string

  // 图表色彩
  chart: string[]
}

export interface ThemeSpacing {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
}

export interface ThemeTypography {
  fontFamily: {
    sans: string[]
    serif: string[]
    mono: string[]
  }
  fontSize: {
    xs: [string, string]
    sm: [string, string]
    base: [string, string]
    lg: [string, string]
    xl: [string, string]
    '2xl': [string, string]
    '3xl': [string, string]
    '4xl': [string, string]
    '5xl': [string, string]
    '6xl': [string, string]
  }
  fontWeight: {
    thin: string
    light: string
    normal: string
    medium: string
    semibold: string
    bold: string
    extrabold: string
    black: string
  }
  lineHeight: {
    tight: string
    snug: string
    normal: string
    relaxed: string
    loose: string
  }
}

export interface ThemeShadows {
  sm: string
  base: string
  md: string
  lg: string
  xl: string
  '2xl': string
  inner: string
  none: string
}

export interface ThemeBorderRadius {
  none: string
  sm: string
  base: string
  md: string
  lg: string
  xl: string
  '2xl': string
  full: string
}

export interface ThemeBreakpoints {
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

/**
 * 明亮主题配置
 */
export const lightTheme: Theme = {
  name: 'Light',
  mode: 'light',
  colors: {
    // 基础色彩 - 基于现有shadcn/ui配置
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(0 0% 3.9%)',

    // 卡片和弹出层
    card: 'hsl(0 0% 100%)',
    cardForeground: 'hsl(0 0% 3.9%)',
    popover: 'hsl(0 0% 100%)',
    popoverForeground: 'hsl(0 0% 3.9%)',

    // 主要色彩
    primary: 'hsl(0 0% 9%)',
    primaryForeground: 'hsl(0 0% 98%)',

    // 次要色彩
    secondary: 'hsl(0 0% 96.1%)',
    secondaryForeground: 'hsl(0 0% 9%)',

    // 静音色彩
    muted: 'hsl(0 0% 96.1%)',
    mutedForeground: 'hsl(0 0% 45.1%)',

    // 强调色彩
    accent: 'hsl(0 0% 96.1%)',
    accentForeground: 'hsl(0 0% 9%)',

    // 状态色彩
    destructive: 'hsl(0 84.2% 60.2%)',
    destructiveForeground: 'hsl(0 0% 98%)',
    warning: 'hsl(38 92% 50%)',
    warningForeground: 'hsl(0 0% 98%)',
    success: 'hsl(142 76% 36%)',
    successForeground: 'hsl(0 0% 98%)',
    info: 'hsl(199 89% 48%)',
    infoForeground: 'hsl(0 0% 98%)',

    // 边框和输入
    border: 'hsl(0 0% 89.8%)',
    input: 'hsl(0 0% 89.8%)',
    ring: 'hsl(0 0% 3.9%)',

    // 图表色彩
    chart: [
      'hsl(12 76% 61%)',
      'hsl(173 58% 39%)',
      'hsl(197 37% 24%)',
      'hsl(43 74% 66%)',
      'hsl(27 87% 67%)',
    ],
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', '1rem'],
      sm: ['0.875rem', '1.25rem'],
      base: ['1rem', '1.5rem'],
      lg: ['1.125rem', '1.75rem'],
      xl: ['1.25rem', '1.75rem'],
      '2xl': ['1.5rem', '2rem'],
      '3xl': ['1.875rem', '2.25rem'],
      '4xl': ['2.25rem', '2.5rem'],
      '5xl': ['3rem', '1'],
      '6xl': ['3.75rem', '1'],
    },
    fontWeight: {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    lineHeight: {
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000',
  },
  borderRadius: {
    none: '0',
    sm: 'calc(var(--radius) - 4px)',
    base: 'var(--radius)',
    md: 'calc(var(--radius) - 2px)',
    lg: 'var(--radius)',
    xl: 'calc(var(--radius) + 2px)',
    '2xl': 'calc(var(--radius) + 4px)',
    full: '9999px',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
}

/**
 * 暗黑主题配置
 */
export const darkTheme: Theme = {
  ...lightTheme,
  name: 'Dark',
  mode: 'dark',
  colors: {
    // 基础色彩 - 基于现有shadcn/ui暗黑配置
    background: 'hsl(0 0% 3.9%)',
    foreground: 'hsl(0 0% 98%)',

    // 卡片和弹出层
    card: 'hsl(0 0% 3.9%)',
    cardForeground: 'hsl(0 0% 98%)',
    popover: 'hsl(0 0% 3.9%)',
    popoverForeground: 'hsl(0 0% 98%)',

    // 主要色彩
    primary: 'hsl(0 0% 98%)',
    primaryForeground: 'hsl(0 0% 9%)',

    // 次要色彩
    secondary: 'hsl(0 0% 14.9%)',
    secondaryForeground: 'hsl(0 0% 98%)',

    // 静音色彩
    muted: 'hsl(0 0% 14.9%)',
    mutedForeground: 'hsl(0 0% 63.9%)',

    // 强调色彩
    accent: 'hsl(0 0% 14.9%)',
    accentForeground: 'hsl(0 0% 98%)',

    // 状态色彩 - 暗黑主题下的状态色彩调整
    destructive: 'hsl(0 62.8% 30.6%)',
    destructiveForeground: 'hsl(0 0% 98%)',
    warning: 'hsl(48 96% 53%)',
    warningForeground: 'hsl(0 0% 98%)',
    success: 'hsl(142 76% 46%)',
    successForeground: 'hsl(0 0% 98%)',
    info: 'hsl(199 89% 58%)',
    infoForeground: 'hsl(0 0% 98%)',

    // 边框和输入
    border: 'hsl(0 0% 14.9%)',
    input: 'hsl(0 0% 14.9%)',
    ring: 'hsl(0 0% 83.1%)',

    // 图表色彩 - 暗黑主题下的图表色彩调整
    chart: [
      'hsl(220 70% 50%)',
      'hsl(160 60% 45%)',
      'hsl(30 80% 55%)',
      'hsl(280 65% 60%)',
      'hsl(340 75% 55%)',
    ],
  },
}

/**
 * 高对比度主题配置
 */
export const highContrastTheme: Theme = {
  ...lightTheme,
  name: 'High Contrast',
  mode: 'high-contrast',
  colors: {
    // 高对比度基础色彩 - 纯黑白配色
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(0 0% 0%)',

    // 卡片和弹出层
    card: 'hsl(0 0% 100%)',
    cardForeground: 'hsl(0 0% 0%)',
    popover: 'hsl(0 0% 100%)',
    popoverForeground: 'hsl(0 0% 0%)',

    // 主要色彩 - 高对比度蓝色
    primary: 'hsl(211 96% 26%)',
    primaryForeground: 'hsl(0 0% 100%)',

    // 次要色彩 - 深灰色边框
    secondary: 'hsl(0 0% 96%)',
    secondaryForeground: 'hsl(0 0% 0%)',

    // 静音色彩 - 保留可读性
    muted: 'hsl(0 0% 96%)',
    mutedForeground: 'hsl(0 0% 20%)',

    // 强调色彩 - 强对比度
    accent: 'hsl(0 0% 96%)',
    accentForeground: 'hsl(0 0% 0%)',

    // 状态色彩 - 高对比度版本
    destructive: 'hsl(0 84% 40%)',
    destructiveForeground: 'hsl(0 0% 100%)',
    warning: 'hsl(38 92% 40%)',
    warningForeground: 'hsl(0 0% 100%)',
    success: 'hsl(142 76% 26%)',
    successForeground: 'hsl(0 0% 100%)',
    info: 'hsl(199 89% 38%)',
    infoForeground: 'hsl(0 0% 100%)',

    // 边框和输入 - 高对比度边框
    border: 'hsl(0 0% 0%)',
    input: 'hsl(0 0% 0%)',
    ring: 'hsl(211 96% 26%)',

    // 图表色彩 - 高对比度图表
    chart: [
      'hsl(211 96% 26%)',
      'hsl(142 76% 26%)',
      'hsl(0 84% 40%)',
      'hsl(38 92% 40%)',
      'hsl(199 89% 38%)',
    ],
  },
}

/**
 * 主题映射
 */
export const themes: Record<ThemeMode, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  'high-contrast': highContrastTheme,
}

/**
 * 获取当前主题
 */
export function getTheme(mode: ThemeMode = 'light'): Theme {
  return themes[mode] || lightTheme
}

/**
 * 主题相关的CSS类名
 */
export const themeClassNames = {
  light: '',
  dark: 'dark',
  'high-contrast': 'high-contrast',
}

/**
 * 主题切换相关的工具函数
 */
export function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement
  const theme = getTheme(mode)

  // 移除所有主题类名
  root.classList.remove('dark', 'high-contrast')

  // 添加当前主题类名
  const className = themeClassNames[mode]
  if (className) {
    root.classList.add(className)
  }

  // 设置CSS变量
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
    root.style.setProperty(cssVar, value)
  })
}
