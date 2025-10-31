/**
 * 主题提供者组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 任务: T136-T139 - 实现主题系统
 * 创建日期: 2025-10-31
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ThemeSystem, type ThemeConfig, type ThemeMode } from '@/lib/lowcode/theme/theme-system'

// 主题上下文
interface ThemeContextValue {
  theme: ThemeConfig
  mode: ThemeMode
  isDarkMode: boolean
  isHighContrastMode: boolean
  setTheme: (mode: ThemeMode, customConfig?: Partial<ThemeConfig>) => void
  toggleTheme: () => ThemeMode
  toggleLightDark: () => ThemeMode
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

// 主题提供者属性
export interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: ThemeMode
  customTheme?: Partial<ThemeConfig>
  enableSystemTheme?: boolean
  storageKey?: string
  className?: string
}

/**
 * 主题提供者组件
 */
export function ThemeProvider({
  children,
  defaultTheme = 'light',
  customTheme,
  enableSystemTheme = true,
  storageKey = 'lowcode-theme',
  className,
}: ThemeProviderProps) {
  const [themeSystem] = useState(() => {
    const system = ThemeSystem.getInstance()

    // 如果有自定义主题配置，应用它
    if (customTheme) {
      system.setTheme(defaultTheme, customTheme)
    }

    return system
  })

  const [theme, setThemeState] = useState(() => themeSystem.getCurrentTheme())

  // 监听系统主题变化
  useEffect(() => {
    if (!enableSystemTheme) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      // 只在没有用户自定义主题时才跟随系统主题
      if (!customTheme) {
        const systemMode = mediaQuery.matches ? 'dark' : 'light'
        if (theme.mode !== systemMode) {
          themeSystem.setTheme(systemMode)
        }
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [enableSystemTheme, customTheme, theme.mode, themeSystem])

  // 监听主题变化
  useEffect(() => {
    const unsubscribe = themeSystem.addListener(newTheme => {
      setThemeState(newTheme)
    })

    return unsubscribe
  }, [themeSystem])

  // 主题操作方法
  const setTheme = (mode: ThemeMode, customConfig?: Partial<ThemeConfig>) => {
    themeSystem.setTheme(mode, customConfig)
  }

  const toggleTheme = () => {
    return themeSystem.toggleTheme()
  }

  const toggleLightDark = () => {
    return themeSystem.toggleLightDark()
  }

  // 计算派生状态
  const isDarkMode = theme.mode === 'dark'
  const isHighContrastMode = theme.mode === 'high-contrast'

  // 应用CSS变量
  useEffect(() => {
    const root = document.documentElement
    const variables = themeSystem.getCSSVariables()

    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // 更新主题类名
    root.classList.remove('light', 'dark', 'high-contrast')
    root.classList.add(theme.mode)

    // 添加主题提供者标识
    root.classList.add('theme-provider')
  }, [theme, themeSystem])

  const contextValue: ThemeContextValue = {
    theme,
    mode: theme.mode,
    isDarkMode,
    isHighContrastMode,
    setTheme,
    toggleTheme,
    toggleLightDark,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className={className} data-theme={theme.mode}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

/**
 * 使用主题上下文的Hook
 */
export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}

/**
 * 主题切换器组件
 */
export function ThemeSwitcher({
  showLabel = true,
  variant = 'default',
  className,
}: {
  showLabel?: boolean
  variant?: 'default' | 'compact' | 'full'
  className?: string
}) {
  const { mode, isDarkMode, isHighContrastMode, setTheme, toggleTheme } = useThemeContext()

  const getLabel = () => {
    switch (mode) {
      case 'light':
        return '明亮'
      case 'dark':
        return '暗黑'
      case 'high-contrast':
        return '高对比度'
      default:
        return mode
    }
  }

  const getIcon = () => {
    if (isHighContrastMode) {
      return '🔆'
    }
    return isDarkMode ? '🌙' : '☀️'
  }

  const getNextTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'high-contrast']
    const currentIndex = modes.indexOf(mode)
    return modes[(currentIndex + 1) % modes.length]
  }

  const handleThemeChange = () => {
    setTheme(getNextTheme())
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleThemeChange}
        className={cn(
          'rounded-md border border-border bg-background p-2 transition-colors hover:bg-muted',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          className
        )}
        title={`切换到${getLabel()}主题`}
      >
        <span className="text-lg">{getIcon()}</span>
      </button>
    )
  }

  if (variant === 'full') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {showLabel && <span className="text-sm font-medium">主题:</span>}
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          {(['light', 'dark', 'high-contrast'] as ThemeMode[]).map(themeMode => (
            <button
              key={themeMode}
              onClick={() => setTheme(themeMode)}
              className={cn(
                'rounded-md px-3 py-1 text-sm transition-colors',
                'hover:bg-muted-foreground/10',
                mode === themeMode && 'bg-primary text-primary-foreground'
              )}
            >
              <span className="mr-1">
                {themeMode === 'light' && '☀️'}
                {themeMode === 'dark' && '🌙'}
                {themeMode === 'high-contrast' && '🔆'}
              </span>
              {showLabel && themeMode === 'light' && '明亮'}
              {showLabel && themeMode === 'dark' && '暗黑'}
              {showLabel && themeMode === 'high-contrast' && '高对比度'}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleThemeChange}
      className={cn(
        'flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2',
        'transition-colors hover:bg-muted',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
    >
      <span className="text-lg">{getIcon()}</span>
      {showLabel && <span className="text-sm font-medium">{getLabel()}</span>}
    </button>
  )
}

/**
 * 明暗主题切换器（简化版）
 */
export function LightDarkSwitcher({ className }: { className?: string }) {
  const { isDarkMode, toggleLightDark } = useThemeContext()

  return (
    <button
      onClick={toggleLightDark}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        isDarkMode ? 'bg-primary' : 'bg-muted',
        className
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          isDarkMode ? 'translate-x-6' : 'translate-x-1'
        )}
      />
      <span className="sr-only">切换主题</span>
    </button>
  )
}

export default ThemeProvider
