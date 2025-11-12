'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { propertyPanelTheme, darkTheme } from '@/lib/designer/shadcn-theme'

// 主题上下文接口
interface ThemeContextType {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  customTheme: any
  toggleTheme: () => void
}

// 创建主题上下文
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// 主题提供者Props
interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: 'light' | 'dark'
  storageKey?: string
  enableSystem?: boolean
}

/**
 * 属性配置面板主题提供者
 * 为属性配置面板提供主题切换和管理功能
 */
export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'property-panel-theme',
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(defaultTheme)

  // 初始化主题
  useEffect(() => {
    // 从localStorage读取保存的主题设置
    const savedTheme = localStorage.getItem(storageKey) as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (enableSystem) {
      // 检测系统主题偏好
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      setTheme(systemTheme)
    }
  }, [storageKey, enableSystem])

  // 监听系统主题变化
  useEffect(() => {
    if (!enableSystem) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(storageKey)) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [storageKey, enableSystem])

  // 应用主题到DOM
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  // 保存主题到localStorage
  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    localStorage.setItem(storageKey, newTheme)
  }

  // 切换主题
  const toggleTheme = () => {
    handleSetTheme(theme === 'light' ? 'dark' : 'light')
  }

  // 获取当前主题配置
  const currentTheme = theme === 'dark' ? darkTheme : propertyPanelTheme

  const value: ThemeContextType = {
    theme,
    setTheme: handleSetTheme,
    customTheme: currentTheme,
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// 使用主题的Hook
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// 主题切换按钮组件
interface ThemeToggleProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
}

export function ThemeToggle({ className, variant = 'outline' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        variant === 'outline'
          ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
          : variant === 'ghost'
            ? 'hover:bg-accent hover:text-accent-foreground'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
      } ${className || ''}`}
      title={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
    >
      {theme === 'light' ? (
        // 月亮图标 (深色模式)
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      ) : (
        // 太阳图标 (浅色模式)
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      )}
      <span className="sr-only ml-2">切换主题</span>
    </button>
  )
}

export default ThemeProvider
