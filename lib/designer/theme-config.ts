import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind CSS类名合并工具
 * 专门用于属性配置面板的主题样式合并
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 属性配置面板主题配置
 * 定义了颜色、间距、字体等设计令牌
 */
export const propertyPanelTheme = {
  // 颜色配置
  colors: {
    // 主色调
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },

    // 成功色
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },

    // 警告色
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },

    // 错误色
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },

    // 属性面板专用颜色
    propertyPanel: {
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      muted: {
        foreground: 'hsl(var(--muted-foreground))',
        background: 'hsl(var(--muted))',
      },
    },
  },

  // 间距配置
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '0.75rem', // 12px
    lg: '1rem', // 16px
    xl: '1.5rem', // 24px
    xxl: '2rem', // 32px
  },

  // 圆角配置
  borderRadius: {
    sm: '0.125rem', // 2px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
  },

  // 字体配置
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  // 阴影配置
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },

  // 过渡配置
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
}

/**
 * 属性编辑器专用样式类
 */
export const propertyEditorClasses = {
  // 基础编辑器样式
  editor: cn(
    'w-full transition-colors duration-200',
    'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ),

  // 错误状态样式
  error: cn(
    'border-red-500 focus:border-red-500 focus:ring-red-500',
    'text-red-900 placeholder-red-300'
  ),

  // 标签样式
  label: cn(
    'text-sm font-medium text-gray-700',
    'peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
  ),

  // 描述文本样式
  description: cn('text-sm text-gray-500', 'mt-1 leading-relaxed'),

  // 分组容器样式
  group: cn('space-y-4 p-4 rounded-lg border', 'bg-white dark:bg-gray-800'),

  // 属性卡片样式
  propertyCard: cn(
    'p-4 border rounded-lg',
    'hover:shadow-md transition-shadow duration-200',
    'bg-white dark:bg-gray-800'
  ),
}

/**
 * 动态生成属性编辑器样式类
 */
export function getPropertyEditorClass(
  type: string,
  state: 'default' | 'error' | 'disabled' = 'default',
  size: 'sm' | 'md' | 'lg' = 'md'
): string {
  const baseClasses = propertyEditorClasses.editor

  const stateClasses = {
    default: '',
    error: propertyEditorClasses.error,
    disabled: 'opacity-50 cursor-not-allowed',
  }[state]

  const sizeClasses = {
    sm: 'py-1 px-2 text-sm',
    md: 'py-2 px-3 text-base',
    lg: 'py-3 px-4 text-lg',
  }[size]

  return cn(baseClasses, stateClasses, sizeClasses)
}

/**
 * 生成响应式样式类
 */
export function getResponsiveClasses(
  base: string,
  sm?: string,
  md?: string,
  lg?: string,
  xl?: string
): string {
  const classes = [base]

  if (sm) classes.push(`sm:${sm}`)
  if (md) classes.push(`md:${md}`)
  if (lg) classes.push(`lg:${lg}`)
  if (xl) classes.push(`xl:${xl}`)

  return classes.join(' ')
}

/**
 * 颜色工具函数
 */
export const colorUtils = {
  /**
   * 将颜色值转换为RGB格式
   */
  toRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  },

  /**
   * 获取对比色（黑色或白色）
   */
  getContrastColor: (hex: string): string => {
    const rgb = colorUtils.toRgb(hex)
    if (!rgb) return '#000000'

    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  },

  /**
   * 验证颜色值
   */
  isValidColor: (value: string): boolean => {
    const colorRegex =
      /^(#([0-9A-Fa-f]{3}){1,2}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*)|hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)|hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\))$/
    return colorRegex.test(value)
  },
}

export default propertyPanelTheme
