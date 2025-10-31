/**
 * 响应式断点适配系统
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 任务: T133 - 实现三个断点的适配逻辑
 * 创建日期: 2025-10-31
 */

import { Breakpoint, BREAKPOINTS, BREAKPOINT_ORDER, getCurrentBreakpoint } from './breakpoints'

// 断点适配策略
export type BreakpointAdaptationStrategy = 'mobile-first' | 'desktop-first' | 'closest'

// 适配配置
export interface AdaptationConfig {
  strategy: BreakpointAdaptationStrategy
  fallbackBreakpoint?: Breakpoint
  enableSmoothTransition?: boolean
  transitionDuration?: number
}

// 默认适配配置
export const DEFAULT_ADAPTATION_CONFIG: AdaptationConfig = {
  strategy: 'mobile-first',
  fallbackBreakpoint: 'mobile',
  enableSmoothTransition: true,
  transitionDuration: 300,
}

// 响应式值适配器
export class ResponsiveAdapter {
  private config: AdaptationConfig
  private currentBreakpoint: Breakpoint
  private previousBreakpoint: Breakpoint | null
  private listeners: Set<(breakpoint: Breakpoint, previous: Breakpoint | null) => void>

  constructor(config: Partial<AdaptationConfig> = {}) {
    this.config = { ...DEFAULT_ADAPTATION_CONFIG, ...config }
    this.currentBreakpoint = getCurrentBreakpoint()
    this.previousBreakpoint = null
    this.listeners = new Set()

    // 监听窗口大小变化
    if (typeof window !== 'undefined') {
      this.setupResizeListener()
    }
  }

  /**
   * 设置窗口大小变化监听器
   */
  private setupResizeListener() {
    let resizeTimer: NodeJS.Timeout

    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        const newBreakpoint = getCurrentBreakpoint()
        if (newBreakpoint !== this.currentBreakpoint) {
          this.previousBreakpoint = this.currentBreakpoint
          this.currentBreakpoint = newBreakpoint
          this.notifyListeners()
        }
      }, 100) // 防抖处理
    }

    window.addEventListener('resize', handleResize, { passive: true })
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners() {
    this.listeners.forEach(listener => {
      listener(this.currentBreakpoint, this.previousBreakpoint)
    })
  }

  /**
   * 添加断点变化监听器
   */
  addListener(listener: (breakpoint: Breakpoint, previous: Breakpoint | null) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener) // 返回取消监听的函数
  }

  /**
   * 获取当前断点
   */
  getCurrentBreakpoint(): Breakpoint {
    return this.currentBreakpoint
  }

  /**
   * 获取上一个断点
   */
  getPreviousBreakpoint(): Breakpoint | null {
    return this.previousBreakpoint
  }

  /**
   * 根据策略获取响应式值
   */
  getResponsiveValue<T>(
    value: T | Partial<Record<Breakpoint, T>>,
    config: Partial<AdaptationConfig> = {}
  ): T {
    const finalConfig = { ...this.config, ...config }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const responsiveValue = value as Partial<Record<Breakpoint, T>>

      switch (finalConfig.strategy) {
        case 'mobile-first':
          return this.getMobileFirstValue(responsiveValue)
        case 'desktop-first':
          return this.getDesktopFirstValue(responsiveValue)
        case 'closest':
          return this.getClosestValue(responsiveValue)
        default:
          return this.getMobileFirstValue(responsiveValue)
      }
    }

    return value as T
  }

  /**
   * Mobile-first策略：从最小断点开始查找
   */
  private getMobileFirstValue<T>(responsiveValue: Partial<Record<Breakpoint, T>>): T {
    // 查找当前断点及之前所有断点的值
    for (let i = BREAKPOINT_ORDER.indexOf(this.currentBreakpoint); i >= 0; i--) {
      const bp = BREAKPOINT_ORDER[i]
      if (responsiveValue[bp] !== undefined) {
        return responsiveValue[bp]!
      }
    }

    // 如果没有找到，返回fallback
    const fallback = responsiveValue[this.config.fallbackBreakpoint!]
    return fallback !== undefined ? fallback : this.getFirstAvailableValue(responsiveValue)
  }

  /**
   * Desktop-first策略：从最大断点开始查找
   */
  private getDesktopFirstValue<T>(responsiveValue: Partial<Record<Breakpoint, T>>): T {
    // 查找当前断点及之后所有断点的值
    for (
      let i = BREAKPOINT_ORDER.indexOf(this.currentBreakpoint);
      i < BREAKPOINT_ORDER.length;
      i++
    ) {
      const bp = BREAKPOINT_ORDER[i]
      if (responsiveValue[bp] !== undefined) {
        return responsiveValue[bp]!
      }
    }

    // 如果没有找到，返回fallback
    const fallback = responsiveValue[this.config.fallbackBreakpoint!]
    return fallback !== undefined ? fallback : this.getLastAvailableValue(responsiveValue)
  }

  /**
   * Closest策略：查找最接近当前断点的值
   */
  private getClosestValue<T>(responsiveValue: Partial<Record<Breakpoint, T>>): T {
    const currentIndex = BREAKPOINT_ORDER.indexOf(this.currentBreakpoint)
    let closestIndex = -1
    let minDistance = Infinity

    // 找到距离当前断点最近的已定义值
    Object.entries(responsiveValue).forEach(([breakpoint, value]) => {
      if (value !== undefined) {
        const index = BREAKPOINT_ORDER.indexOf(breakpoint as Breakpoint)
        const distance = Math.abs(index - currentIndex)
        if (distance < minDistance) {
          minDistance = distance
          closestIndex = index
        }
      }
    })

    if (closestIndex !== -1) {
      const bp = BREAKPOINT_ORDER[closestIndex]
      return responsiveValue[bp]!
    }

    // 如果没有找到，返回fallback
    const fallback = responsiveValue[this.config.fallbackBreakpoint!]
    return fallback !== undefined ? fallback : this.getFirstAvailableValue(responsiveValue)
  }

  /**
   * 获取第一个可用值
   */
  private getFirstAvailableValue<T>(responsiveValue: Partial<Record<Breakpoint, T>>): T {
    for (const bp of BREAKPOINT_ORDER) {
      if (responsiveValue[bp] !== undefined) {
        return responsiveValue[bp]!
      }
    }
    throw new Error('No available value found in responsive object')
  }

  /**
   * 获取最后一个可用值
   */
  private getLastAvailableValue<T>(responsiveValue: Partial<Record<Breakpoint, T>>): T {
    for (let i = BREAKPOINT_ORDER.length - 1; i >= 0; i--) {
      const bp = BREAKPOINT_ORDER[i]
      if (responsiveValue[bp] !== undefined) {
        return responsiveValue[bp]!
      }
    }
    throw new Error('No available value found in responsive object')
  }

  /**
   * 检查是否应该显示某个断点的内容
   */
  shouldShow(breakpoint: Breakpoint): boolean {
    switch (this.config.strategy) {
      case 'mobile-first':
        // Mobile-first: 显示当前断点及以下断点的内容
        return (
          BREAKPOINT_ORDER.indexOf(breakpoint) <= BREAKPOINT_ORDER.indexOf(this.currentBreakpoint)
        )
      case 'desktop-first':
        // Desktop-first: 显示当前断点及以上断点的内容
        return (
          BREAKPOINT_ORDER.indexOf(breakpoint) >= BREAKPOINT_ORDER.indexOf(this.currentBreakpoint)
        )
      case 'closest':
        // Closest: 只显示当前断点的内容
        return breakpoint === this.currentBreakpoint
      default:
        return breakpoint === this.currentBreakpoint
    }
  }

  /**
   * 获取断点转换CSS类
   */
  getBreakpointClasses(breakpointClasses: Partial<Record<Breakpoint, string>>): string {
    const classes: string[] = []

    Object.entries(breakpointClasses).forEach(([bp, className]) => {
      if (this.shouldShow(bp as Breakpoint)) {
        if (bp === 'mobile') {
          classes.push(className)
        } else {
          classes.push(`${bp}:${className}`)
        }
      }
    })

    return classes.join(' ')
  }

  /**
   * 生成响应式CSS媒体查询
   */
  generateMediaQuery(breakpoint: Breakpoint, css: string): string {
    const mediaQuery = this.getMediaQueryForBreakpoint(breakpoint)
    return `${mediaQuery} { ${css} }`
  }

  /**
   * 获取断点对应的媒体查询
   */
  private getMediaQueryForBreakpoint(breakpoint: Breakpoint): string {
    switch (this.config.strategy) {
      case 'mobile-first':
        return `(min-width: ${BREAKPOINTS[breakpoint].min}px)`
      case 'desktop-first':
        return `(max-width: ${BREAKPOINTS[breakpoint].max}px)`
      default:
        return `(min-width: ${BREAKPOINTS[breakpoint].min}px)`
    }
  }

  /**
   * 计算响应式尺寸
   */
  calculateResponsiveSize(
    sizes: Partial<Record<Breakpoint, number | string>>,
    containerWidth?: number
  ): string {
    const currentValue = this.getResponsiveValue(sizes)

    if (typeof currentValue === 'number') {
      // 如果是数字，根据容器宽度计算相对尺寸
      if (containerWidth) {
        const breakpointWidth = BREAKPOINTS[this.currentBreakpoint].max
        const ratio = Math.min(containerWidth / breakpointWidth, 1)
        return `${Math.round(currentValue * ratio)}px`
      }
      return `${currentValue}px`
    }

    return currentValue
  }

  /**
   * 获取断点过渡动画配置
   */
  getTransitionConfig(): {
    duration: number
    easing: string
    properties: string[]
  } {
    return {
      duration: this.config.transitionDuration || 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      properties: ['opacity', 'transform', 'width', 'height', 'margin', 'padding'],
    }
  }

  /**
   * 生成过渡样式
   */
  generateTransitionStyles(): React.CSSProperties {
    const config = this.getTransitionConfig()
    return {
      transition: config.properties
        .map(prop => `${prop} ${config.duration}ms ${config.easing}`)
        .join(', '),
    }
  }

  /**
   * 销毁适配器
   */
  destroy() {
    this.listeners.clear()
  }
}

// 全局适配器实例
let globalAdapter: ResponsiveAdapter | null = null

/**
 * 获取全局响应式适配器
 */
export function getGlobalAdapter(config?: Partial<AdaptationConfig>): ResponsiveAdapter {
  if (!globalAdapter) {
    globalAdapter = new ResponsiveAdapter(config)
  }
  return globalAdapter
}

/**
 * 便捷函数：获取响应式值
 */
export function getResponsiveValue<T>(
  value: T | Partial<Record<Breakpoint, T>>,
  config?: Partial<AdaptationConfig>
): T {
  const adapter = getGlobalAdapter(config)
  return adapter.getResponsiveValue(value)
}

/**
 * 便捷函数：生成响应式类名
 */
export function getResponsiveClasses(
  classes: Partial<Record<Breakpoint, string>>,
  config?: Partial<AdaptationConfig>
): string {
  const adapter = getGlobalAdapter(config)
  return adapter.getBreakpointClasses(classes)
}

/**
 * 便捷函数：检查断点匹配
 */
export function isBreakpoint(breakpoint: Breakpoint, config?: Partial<AdaptationConfig>): boolean {
  const adapter = getGlobalAdapter(config)
  return adapter.getCurrentBreakpoint() === breakpoint
}

/**
 * 便捷函数：检查断点范围
 */
export function isBreakpointInRange(
  minBreakpoint: Breakpoint,
  maxBreakpoint: Breakpoint,
  config?: Partial<AdaptationConfig>
): boolean {
  const adapter = getGlobalAdapter(config)
  const current = adapter.getCurrentBreakpoint()
  const currentIndex = BREAKPOINT_ORDER.indexOf(current)
  const minIndex = BREAKPOINT_ORDER.indexOf(minBreakpoint)
  const maxIndex = BREAKPOINT_ORDER.indexOf(maxBreakpoint)

  return currentIndex >= minIndex && currentIndex <= maxIndex
}

// 响应式Hook的辅助函数
export function useResponsiveValue<T>(
  value: T | Partial<Record<Breakpoint, T>>,
  config?: Partial<AdaptationConfig>
): T {
  // 这个函数将在React Hook中使用
  const adapter = getGlobalAdapter(config)
  return adapter.getResponsiveValue(value)
}

export default ResponsiveAdapter
