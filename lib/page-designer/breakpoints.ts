/**
 * 页面设计器响应式设计断点配置
 * 基于Tailwind CSS断点和现代设备尺寸设计
 */

export const BREAKPOINTS = {
  xs: { min: 0, max: 639, container: 100 }, // 手机竖屏
  sm: { min: 640, max: 767, container: 640 }, // 手机横屏小平板
  md: { min: 768, max: 1023, container: 768 }, // 平板竖屏
  lg: { min: 1024, max: 1279, container: 1024 }, // 平板横屏小笔记本
  xl: { min: 1280, max: 1535, container: 1280 }, // 桌面显示器
  '2xl': { min: 1536, max: Infinity, container: 1536 }, // 大屏显示器
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * 响应式工具函数
 */
export const responsiveUtils = {
  /**
   * 获取当前断点
   */
  getCurrentBreakpoint: (width: number): Breakpoint => {
    for (const [name, config] of Object.entries(BREAKPOINTS)) {
      if (width >= config.min && width <= config.max) {
        return name as Breakpoint
      }
    }
    return 'lg' // 默认断点
  },

  /**
   * 检查宽度是否在指定断点范围内
   */
  isInBreakpoint: (width: number, breakpoint: Breakpoint): boolean => {
    const config = BREAKPOINTS[breakpoint]
    return width >= config.min && width <= config.max
  },

  /**
   * 获取断点对应的容器最大宽度
   */
  getContainerWidth: (breakpoint: Breakpoint): number => {
    return BREAKPOINTS[breakpoint].container
  },

  /**
   * 生成媒体查询CSS
   */
  getMediaQuery: (breakpoint: Breakpoint, direction: 'up' | 'down' | 'only' = 'up'): string => {
    const config = BREAKPOINTS[breakpoint]

    switch (direction) {
      case 'up':
        return `@media (min-width: ${config.min}px)`
      case 'down':
        return `@media (max-width: ${config.max}px)`
      case 'only':
        return `@media (min-width: ${config.min}px) and (max-width: ${config.max}px)`
      default:
        return `@media (min-width: ${config.min}px)`
    }
  },
}

/**
 * 页面设计器固定配置（MVP版本）
 */
export const CANVAS_CONFIG = {
  // 固定画布宽度（MVP版本）
  width: 1200,

  // 最大组件数量限制
  maxComponents: 50,

  // 网格设置
  grid: {
    size: 8, // 网格大小（像素）
    enabled: true,
    snapThreshold: 5, // 吸附阈值（像素）
  },

  // 断点设置
  breakpoints: BREAKPOINTS,

  // 默认容器设置
  container: {
    padding: { top: 16, right: 16, bottom: 16, left: 16 },
    centered: true,
    maxWidth: 1200,
  },
} as const

/**
 * 响应式栅格系统
 */
export const GRID_SYSTEM = {
  columns: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 12,
    xl: 12,
    '2xl': 12,
  },

  gutter: {
    xs: 16,
    sm: 16,
    md: 24,
    lg: 24,
    xl: 24,
    '2xl': 32,
  },

  // 计算列宽
  getColumnWidth: (span: number, breakpoint: Breakpoint): string => {
    const columns = GRID_SYSTEM.columns[breakpoint]
    const percentage = (span / columns) * 100
    return `${percentage}%`
  },

  // 计算偏移
  getOffset: (offset: number, breakpoint: Breakpoint): string => {
    const columns = GRID_SYSTEM.columns[breakpoint]
    const percentage = (offset / columns) * 100
    return `${percentage}%`
  },
} as const
