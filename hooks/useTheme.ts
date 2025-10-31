/**
 * 主题React Hook
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 任务: T136-T139 - 实现主题系统
 * 创建日期: 2025-10-31
 */

import { useState, useEffect, useCallback } from 'react'
import { ThemeSystem, type ThemeConfig, type ThemeMode } from '@/lib/lowcode/theme/theme-system'

// 主题Hook返回值
export interface UseThemeReturn {
  // 主题信息
  theme: ThemeConfig
  mode: ThemeMode
  isDarkMode: boolean
  isHighContrastMode: boolean

  // 主题操作
  setTheme: (mode: ThemeMode, customConfig?: Partial<ThemeConfig>) => void
  toggleTheme: () => ThemeMode
  toggleLightDark: () => ThemeMode

  // 主题样式
  themeStyles: React.CSSProperties
  cssVariables: Record<string, string>

  // 主题色值
  getColor: (colorName: keyof ThemeConfig['colors']) => string

  // 主题系统
  themeSystem: ThemeSystem
}

/**
 * 主题Hook
 */
export function useTheme(): UseThemeReturn {
  const [themeSystem] = useState(() => ThemeSystem.getInstance())
  const [theme, setThemeState] = useState(() => themeSystem.getCurrentTheme())

  // 监听主题变化
  useEffect(() => {
    const unsubscribe = themeSystem.addListener(newTheme => {
      setThemeState(newTheme)
    })

    return unsubscribe
  }, [themeSystem])

  // 主题操作方法
  const setTheme = useCallback(
    (mode: ThemeMode, customConfig?: Partial<ThemeConfig>) => {
      themeSystem.setTheme(mode, customConfig)
    },
    [themeSystem]
  )

  const toggleTheme = useCallback(() => {
    return themeSystem.toggleTheme()
  }, [themeSystem])

  const toggleLightDark = useCallback(() => {
    return themeSystem.toggleLightDark()
  }, [themeSystem])

  // 获取主题色值
  const getColor = useCallback(
    (colorName: keyof ThemeConfig['colors']) => {
      return themeSystem.getColor(colorName)
    },
    [themeSystem]
  )

  // 计算派生状态
  const isDarkMode = theme.mode === 'dark'
  const isHighContrastMode = theme.mode === 'high-contrast'
  const themeStyles = themeSystem.createThemeStyles()
  const cssVariables = themeSystem.getCSSVariables()

  return {
    theme,
    mode: theme.mode,
    isDarkMode,
    isHighContrastMode,
    setTheme,
    toggleTheme,
    toggleLightDark,
    themeStyles,
    cssVariables,
    getColor,
    themeSystem,
  }
}

/**
 * 简化版主题Hook - 只返回主题模式和切换函数
 */
export function useThemeMode(): {
  mode: ThemeMode
  isDarkMode: boolean
  isHighContrastMode: boolean
  setTheme: (mode: ThemeMode) => void
  toggleTheme: () => ThemeMode
  toggleLightDark: () => ThemeMode
} {
  const { mode, isDarkMode, isHighContrastMode, setTheme, toggleTheme, toggleLightDark } =
    useTheme()

  return {
    mode,
    isDarkMode,
    isHighContrastMode,
    setTheme,
    toggleTheme,
    toggleLightDark,
  }
}

/**
 * 主题色Hook
 */
export function useThemeColor(colorName: keyof ThemeConfig['colors']): string {
  const { getColor } = useTheme()
  return getColor(colorName)
}

/**
 * 系统主题检测Hook
 */
export function useSystemTheme(): ThemeMode {
  const [systemTheme, setSystemTheme] = useState<ThemeMode>('light')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return systemTheme
}

/**
 * 主题切换动画Hook
 */
export function useThemeTransition(duration?: number) {
  const { theme } = useTheme()
  const [isTransitioning, setIsTransitioning] = useState(false)

  const transitionDuration = duration || theme.transitions?.duration || 150

  const startTransition = useCallback(() => {
    setIsTransitioning(true)
    setTimeout(() => {
      setIsTransitioning(false)
    }, transitionDuration)
  }, [transitionDuration])

  return {
    isTransitioning,
    transitionDuration,
    startTransition,
  }
}

const themeHooks = {
  useTheme,
  useThemeMode,
  useThemeColor,
  useSystemTheme,
  useThemeTransition,
}

export default themeHooks
