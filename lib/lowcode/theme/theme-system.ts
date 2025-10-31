/**
 * 主题系统
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 任务: T136-T139 - 实现主题系统
 * 创建日期: 2025-10-31
 */

export type ThemeMode = 'light' | 'dark' | 'high-contrast'

export interface ThemeColors {
  // 主色调
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string

  // 背景色
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string

  // 边框和分割线
  border: string
  input: string

  // 状态色
  destructive: string
  destructiveForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string

  // 特殊用途
  ring: string
  success: string
  successForeground: string
  warning: string
  warningForeground: string
  info: string
  infoForeground: string
}

export interface ThemeConfig {
  mode: ThemeMode
  colors: ThemeColors
  customColors?: Partial<ThemeColors>
  transitions?: {
    duration: number
    easing: string
  }
}

// 默认明亮主题
export const LIGHT_THEME: ThemeConfig = {
  mode: 'light',
  colors: {
    primary: 'hsl(222.2 84% 4.9%)',
    primaryForeground: 'hsl(210 40% 98%)',
    secondary: 'hsl(210 40% 96%)',
    secondaryForeground: 'hsl(222.2 84% 4.9%)',
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(222.2 84% 4.9%)',
    card: 'hsl(0 0% 100%)',
    cardForeground: 'hsl(222.2 84% 4.9%)',
    popover: 'hsl(0 0% 100%)',
    popoverForeground: 'hsl(222.2 84% 4.9%)',
    border: 'hsl(214.3 31.8% 91.4%)',
    input: 'hsl(214.3 31.8% 91.4%)',
    destructive: 'hsl(0 84.2% 60.2%)',
    destructiveForeground: 'hsl(210 40% 98%)',
    muted: 'hsl(210 40% 96%)',
    mutedForeground: 'hsl(215.4 16.3% 46.9%)',
    accent: 'hsl(210 40% 96%)',
    accentForeground: 'hsl(222.2 84% 4.9%)',
    ring: 'hsl(222.2 84% 4.9%)',
    success: 'hsl(142.1 76.2% 36.3%)',
    successForeground: 'hsl(355.7 100% 97.3%)',
    warning: 'hsl(38.8 92% 50.2%)',
    warningForeground: 'hsl(48 96% 89%)',
    info: 'hsl(198.6 88.7% 48.4%)',
    infoForeground: 'hsl(210 40% 98%)',
  },
  transitions: {
    duration: 150,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
}

// 默认暗黑主题
export const DARK_THEME: ThemeConfig = {
  mode: 'dark',
  colors: {
    primary: 'hsl(222.2 84% 4.9%)',
    primaryForeground: 'hsl(210 40% 98%)',
    secondary: 'hsl(217.2 32.6% 17.5%)',
    secondaryForeground: 'hsl(210 40% 98%)',
    background: 'hsl(222.2 84% 4.9%)',
    foreground: 'hsl(210 40% 98%)',
    card: 'hsl(222.2 84% 4.9%)',
    cardForeground: 'hsl(210 40% 98%)',
    popover: 'hsl(222.2 84% 4.9%)',
    popoverForeground: 'hsl(210 40% 98%)',
    border: 'hsl(217.2 32.6% 17.5%)',
    input: 'hsl(217.2 32.6% 17.5%)',
    destructive: 'hsl(0 62.8% 30.6%)',
    destructiveForeground: 'hsl(210 40% 98%)',
    muted: 'hsl(217.2 32.6% 17.5%)',
    mutedForeground: 'hsl(215 20.2% 65.1%)',
    accent: 'hsl(217.2 32.6% 17.5%)',
    accentForeground: 'hsl(210 40% 98%)',
    ring: 'hsl(212.7 26.8% 83.9%)',
    success: 'hsl(142.1 70.6% 45.3%)',
    successForeground: 'hsl(144.9 80.4% 10%)',
    warning: 'hsl(38.8 92% 50%)',
    warningForeground: 'hsl(48 96% 89%)',
    info: 'hsl(198.6 88.7% 48.4%)',
    infoForeground: 'hsl(210 40% 98%)',
  },
  transitions: {
    duration: 150,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
}

// 高对比度主题
export const HIGH_CONTRAST_THEME: ThemeConfig = {
  mode: 'high-contrast',
  colors: {
    primary: 'hsl(0 0% 0%)',
    primaryForeground: 'hsl(0 0% 100%)',
    secondary: 'hsl(0 0% 0%)',
    secondaryForeground: 'hsl(0 0% 100%)',
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(0 0% 0%)',
    card: 'hsl(0 0% 100%)',
    cardForeground: 'hsl(0 0% 0%)',
    popover: 'hsl(0 0% 100%)',
    popoverForeground: 'hsl(0 0% 0%)',
    border: 'hsl(0 0% 0%)',
    input: 'hsl(0 0% 0%)',
    destructive: 'hsl(0 100% 0%)',
    destructiveForeground: 'hsl(0 0% 100%)',
    muted: 'hsl(0 0% 95%)',
    mutedForeground: 'hsl(0 0% 0%)',
    accent: 'hsl(0 0% 0%)',
    accentForeground: 'hsl(0 0% 100%)',
    ring: 'hsl(0 0% 0%)',
    success: 'hsl(120 100% 25%)',
    successForeground: 'hsl(0 0% 100%)',
    warning: 'hsl(60 100% 50%)',
    warningForeground: 'hsl(0 0% 100%)',
    info: 'hsl(200 100% 30%)',
    infoForeground: 'hsl(0 0% 100%)',
  },
  transitions: {
    duration: 0, // 高对比度模式不使用动画
    easing: 'linear',
  },
}

// 预定义主题
export const THEMES: Record<ThemeMode, ThemeConfig> = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
  'high-contrast': HIGH_CONTRAST_THEME,
}

// 主题系统类
export class ThemeSystem {
  private static instance: ThemeSystem
  private currentTheme: ThemeConfig
  private listeners: Set<(theme: ThemeConfig) => void>
  private storageKey = 'lowcode-theme'

  private constructor() {
    this.currentTheme = this.loadTheme()
    this.listeners = new Set()
  }

  static getInstance(): ThemeSystem {
    if (!ThemeSystem.instance) {
      ThemeSystem.instance = new ThemeSystem()
    }
    return ThemeSystem.instance
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): ThemeConfig {
    return this.currentTheme
  }

  /**
   * 获取当前主题模式
   */
  getCurrentMode(): ThemeMode {
    return this.currentTheme.mode
  }

  /**
   * 设置主题
   */
  setTheme(mode: ThemeMode, customConfig?: Partial<ThemeConfig>): void {
    const baseTheme = THEMES[mode]
    const newTheme: ThemeConfig = {
      ...baseTheme,
      ...customConfig,
      mode,
      colors: {
        ...baseTheme.colors,
        ...customConfig?.colors,
      },
    }

    this.currentTheme = newTheme
    this.saveTheme(newTheme)
    this.applyTheme(newTheme)
    this.notifyListeners(newTheme)
  }

  /**
   * 切换主题
   */
  toggleTheme(): ThemeMode {
    const modes: ThemeMode[] = ['light', 'dark', 'high-contrast']
    const currentIndex = modes.indexOf(this.currentTheme.mode)
    const nextIndex = (currentIndex + 1) % modes.length
    const nextMode = modes[nextIndex]

    this.setTheme(nextMode)
    return nextMode
  }

  /**
   * 切换明亮/暗黑主题
   */
  toggleLightDark(): ThemeMode {
    const nextMode = this.currentTheme.mode === 'light' ? 'dark' : 'light'
    this.setTheme(nextMode)
    return nextMode
  }

  /**
   * 添加主题变化监听器
   */
  addListener(listener: (theme: ThemeConfig) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * 获取CSS变量
   */
  getCSSVariables(): Record<string, string> {
    const variables: Record<string, string> = {}
    const colors = this.currentTheme.colors

    Object.entries(colors).forEach(([key, value]) => {
      variables[`--${key}`] = value
    })

    // 添加过渡变量
    if (this.currentTheme.transitions) {
      variables['--transition-duration'] = `${this.currentTheme.transitions.duration}ms`
      variables['--transition-easing'] = this.currentTheme.transitions.easing
    }

    return variables
  }

  /**
   * 生成Tailwind CSS配置
   */
  generateTailwindConfig(): Record<string, unknown> {
    const colors = this.currentTheme.colors

    return {
      darkMode: 'class',
      content: [],
      theme: {
        extend: {
          colors: {
            primary: colors.primary,
            'primary-foreground': colors.primaryForeground,
            secondary: colors.secondary,
            'secondary-foreground': colors.secondaryForeground,
            background: colors.background,
            foreground: colors.foreground,
            card: colors.card,
            'card-foreground': colors.cardForeground,
            popover: colors.popover,
            'popover-foreground': colors.popoverForeground,
            border: colors.border,
            input: colors.input,
            destructive: colors.destructive,
            'destructive-foreground': colors.destructiveForeground,
            muted: colors.muted,
            'muted-foreground': colors.mutedForeground,
            accent: colors.accent,
            'accent-foreground': colors.accentForeground,
            ring: colors.ring,
            success: colors.success,
            'success-foreground': colors.successForeground,
            warning: colors.warning,
            'warning-foreground': colors.warningForeground,
            info: colors.info,
            'info-foreground': colors.infoForeground,
          },
        },
      },
      plugins: [],
    }
  }

  /**
   * 检查是否为暗黑主题
   */
  isDarkMode(): boolean {
    return this.currentTheme.mode === 'dark'
  }

  /**
   * 检查是否为高对比度主题
   */
  isHighContrastMode(): boolean {
    return this.currentTheme.mode === 'high-contrast'
  }

  /**
   * 获取主题色值
   */
  getColor(colorName: keyof ThemeColors): string {
    return this.currentTheme.colors[colorName]
  }

  /**
   * 创建主题样式对象
   */
  createThemeStyles(): React.CSSProperties {
    const variables = this.getCSSVariables()
    return variables as React.CSSProperties
  }

  /**
   * 通知监听器
   */
  private notifyListeners(theme: ThemeConfig): void {
    this.listeners.forEach(listener => listener(theme))
  }

  /**
   * 应用主题到DOM
   */
  private applyTheme(theme: ThemeConfig): void {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    const variables = this.getCSSVariables()

    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // 更新主题类名
    root.classList.remove('light', 'dark', 'high-contrast')
    root.classList.add(theme.mode)
  }

  /**
   * 保存主题到本地存储
   */
  private saveTheme(theme: ThemeConfig): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const themeData = {
          mode: theme.mode,
          colors: theme.colors,
          transitions: theme.transitions,
          customColors: theme.customColors,
        }
        window.localStorage.setItem(this.storageKey, JSON.stringify(themeData))
      }
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
    }
  }

  /**
   * 从本地存储加载主题
   */
  private loadTheme(): ThemeConfig {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(this.storageKey)
        if (saved) {
          const themeData = JSON.parse(saved)
          const baseTheme = THEMES[themeData.mode as ThemeMode]

          return {
            ...baseTheme,
            ...themeData,
            mode: themeData.mode,
            colors: {
              ...baseTheme.colors,
              ...themeData.colors,
            },
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error)
    }

    // 检查系统主题偏好
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? DARK_THEME : LIGHT_THEME
    }

    return LIGHT_THEME
  }

  /**
   * 重置主题
   */
  reset(): void {
    this.currentTheme = this.loadTheme()
    this.applyTheme(this.currentTheme)
    this.notifyListeners(this.currentTheme)
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.listeners.clear()
  }
}

// 获取全局主题系统实例
export function getThemeSystem(): ThemeSystem {
  return ThemeSystem.getInstance()
}

// 便捷函数
export function getCurrentTheme(): ThemeConfig {
  return getThemeSystem().getCurrentTheme()
}

export function getCurrentThemeMode(): ThemeMode {
  return getThemeSystem().getCurrentMode()
}

export function setTheme(mode: ThemeMode, customConfig?: Partial<ThemeConfig>): void {
  getThemeSystem().setTheme(mode, customConfig)
}

export function toggleTheme(): ThemeMode {
  return getThemeSystem().toggleTheme()
}

export function toggleLightDark(): ThemeMode {
  return getThemeSystem().toggleLightDark()
}

export default ThemeSystem
