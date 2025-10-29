/**
 * 响应式样式处理模块
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 * 功能: 响应式断点管理、媒体查询生成、响应式样式处理
 */

import { CSSProperties } from 'react'
import type { ExtendedComponentStyles } from './styles'

// 响应式断点类型
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// 响应式样式接口
export interface ResponsiveStyle {
  xs?: ExtendedComponentStyles
  sm?: ExtendedComponentStyles
  md?: ExtendedComponentStyles
  lg?: ExtendedComponentStyles
  xl?: ExtendedComponentStyles
}

/**
 * 响应式断点配置
 */
export interface BreakpointConfig {
  /** 断点名称 */
  name: Breakpoint
  /** 最小宽度 */
  minWidth: number
  /** 最大宽度 */
  maxWidth?: number
  /** 媒体查询字符串 */
  mediaQuery: string
  /** 是否为移动端优先 */
  mobileFirst: boolean
}

/**
 * 响应式处理选项
 */
export interface ResponsiveOptions {
  /** 默认断点策略 */
  strategy?: 'mobile-first' | 'desktop-first'
  /** 是否生成CSS类 */
  generateClasses?: boolean
  /** 类名前缀 */
  classPrefix?: string
  /** 是否使用CSS变量 */
  useCSSVariables?: boolean
  /** 自定义断点配置 */
  customBreakpoints?: Record<string, BreakpointConfig>
}

/**
 * 响应式样式处理结果
 */
export interface ResponsiveResult {
  /** 基础样式（最小断点） */
  baseStyles: CSSProperties
  /** 响应式样式规则 */
  responsiveRules: ResponsiveStyleRule[]
  /** 生成的CSS类 */
  cssClasses: string[]
  /** 媒体查询CSS */
  mediaCSS: string
  /** CSS变量 */
  cssVariables: Record<string, string>
  /** 处理统计 */
  stats: {
    totalBreakpoints: number
    processedBreakpoints: string[]
    totalRules: number
  }
}

/**
 * 响应式样式规则
 */
export interface ResponsiveStyleRule {
  /** 断点名称 */
  breakpoint: Breakpoint
  /** 媒体查询 */
  mediaQuery: string
  /** 样式属性 */
  styles: CSSProperties
  /** CSS类名 */
  className?: string
  /** CSS规则内容 */
  cssRule?: string
}

/**
 * 默认断点配置
 */
export const DEFAULT_BREAKPOINTS: Record<Breakpoint, BreakpointConfig> = {
  xs: {
    name: 'xs',
    minWidth: 0,
    maxWidth: 767,
    mediaQuery: '(max-width: 767px)',
    mobileFirst: true,
  },
  sm: {
    name: 'sm',
    minWidth: 640,
    maxWidth: 1023,
    mediaQuery: '(min-width: 640px)',
    mobileFirst: true,
  },
  md: {
    name: 'md',
    minWidth: 768,
    maxWidth: 1279,
    mediaQuery: '(min-width: 768px)',
    mobileFirst: true,
  },
  lg: {
    name: 'lg',
    minWidth: 1024,
    maxWidth: 1535,
    mediaQuery: '(min-width: 1024px)',
    mobileFirst: true,
  },
  xl: {
    name: 'xl',
    minWidth: 1280,
    mediaQuery: '(min-width: 1280px)',
    mobileFirst: true,
  },
}

/**
 * 响应式样式处理器
 */
export class ResponsiveStyleProcessor {
  private breakpoints: Record<string, BreakpointConfig>
  private defaultOptions: ResponsiveOptions

  constructor(options?: ResponsiveOptions) {
    this.breakpoints = { ...DEFAULT_BREAKPOINTS }
    if (options?.customBreakpoints) {
      Object.assign(this.breakpoints, options.customBreakpoints)
    }

    this.defaultOptions = {
      strategy: 'mobile-first',
      generateClasses: true,
      classPrefix: 'resp',
      useCSSVariables: true,
      ...options,
    }
  }

  /**
   * 处理响应式样式
   */
  processResponsive(
    styles: ExtendedComponentStyles,
    options?: ResponsiveOptions
  ): ResponsiveResult {
    const opts = { ...this.defaultOptions, ...options }
    const result: ResponsiveResult = {
      baseStyles: {},
      responsiveRules: [],
      cssClasses: [],
      mediaCSS: '',
      cssVariables: {},
      stats: {
        totalBreakpoints: 0,
        processedBreakpoints: [],
        totalRules: 0,
      },
    }

    // 处理基础样式（最小断点）
    const baseStyles = this.extractBaseStyles(styles)
    result.baseStyles = baseStyles

    // 处理响应式样式
    if (styles.responsive) {
      this.processResponsiveStyles(styles.responsive, result, opts)
    }

    // 生成CSS类
    if (opts.generateClasses) {
      this.generateResponsiveClasses(result, opts)
    }

    // 生成媒体查询CSS
    this.generateMediaCSS(result, opts)

    return result
  }

  /**
   * 添加自定义断点
   */
  addBreakpoint(name: string, config: Omit<BreakpointConfig, 'name'>): void {
    this.breakpoints[name] = { ...config, name: name as Breakpoint }
  }

  /**
   * 移除断点
   */
  removeBreakpoint(name: string): void {
    delete this.breakpoints[name]
  }

  /**
   * 获取所有断点
   */
  getBreakpoints(): Record<string, BreakpointConfig> {
    return { ...this.breakpoints }
  }

  /**
   * 获取断点配置
   */
  getBreakpoint(name: string): BreakpointConfig | undefined {
    return this.breakpoints[name]
  }

  /**
   * 生成媒体查询字符串
   */
  generateMediaQuery(
    breakpoint: string,
    strategy: 'mobile-first' | 'desktop-first' = 'mobile-first'
  ): string {
    const config = this.breakpoints[breakpoint]
    if (!config) {
      throw new Error(`Unknown breakpoint: ${breakpoint}`)
    }

    if (strategy === 'mobile-first') {
      if (config.maxWidth !== undefined) {
        return `(max-width: ${config.maxWidth}px)`
      }
      return `(min-width: ${config.minWidth}px)`
    } else {
      // desktop-first strategy
      if (config.maxWidth !== undefined) {
        return `(max-width: ${config.maxWidth}px)`
      }
      return `(min-width: ${config.minWidth}px)`
    }
  }

  /**
   * 获取当前活动的断点
   */
  getActiveBreakpoint(width: number): string | null {
    let activeBreakpoint: string | null = null

    const entries = Object.entries(this.breakpoints)
    entries
      .sort(([, a], [, b]) => b.minWidth - a.minWidth)
      .forEach(([name, config]) => {
        if (width >= config.minWidth && (!config.maxWidth || width <= config.maxWidth)) {
          activeBreakpoint = name
        }
      })

    return activeBreakpoint
  }

  /**
   * 为指定宽度获取样式
   */
  getStylesForWidth(styles: ExtendedComponentStyles, width: number): CSSProperties {
    const activeBreakpoint = this.getActiveBreakpoint(width)
    const result = { ...styles }

    // 移除响应式配置
    delete result.responsive

    // 应用活动断点的样式
    if (activeBreakpoint && styles.responsive?.[activeBreakpoint as Breakpoint]) {
      Object.assign(result, styles.responsive[activeBreakpoint as Breakpoint])
    }

    return result as CSSProperties
  }

  /**
   * 提取基础样式（非响应式部分）
   */
  private extractBaseStyles(styles: ExtendedComponentStyles): CSSProperties {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { responsive, ...baseStyles } = styles
    return baseStyles as CSSProperties
  }

  /**
   * 处理响应式样式
   */
  private processResponsiveStyles(
    responsiveStyles: Record<Breakpoint, Partial<ExtendedComponentStyles>>,
    result: ResponsiveResult,
    options: ResponsiveOptions
  ): void {
    const entries = Object.entries(responsiveStyles)
    entries.forEach(([breakpoint, styles]) => {
      if (!styles || Object.keys(styles).length === 0) return

      const config = this.breakpoints[breakpoint]
      if (!config) {
        console.warn(`Unknown breakpoint: ${breakpoint}`)
        return
      }

      const mediaQuery = this.generateMediaQuery(breakpoint, options.strategy)
      const rule: ResponsiveStyleRule = {
        breakpoint: breakpoint as Breakpoint,
        mediaQuery,
        styles: styles as CSSProperties,
      }

      result.responsiveRules.push(rule)
      result.stats.processedBreakpoints.push(breakpoint)
      result.stats.totalRules++
    })

    result.stats.totalBreakpoints = Object.keys(responsiveStyles).length as number
  }

  /**
   * 生成响应式CSS类
   */
  private generateResponsiveClasses(result: ResponsiveResult, options: ResponsiveOptions): void {
    result.responsiveRules.forEach(rule => {
      const className = `${options.classPrefix}-${rule.breakpoint}`
      rule.className = className
      result.cssClasses.push(className)
    })
  }

  /**
   * 生成媒体查询CSS
   */
  private generateMediaCSS(result: ResponsiveResult, options: ResponsiveOptions): void {
    const cssRules: string[] = []

    result.responsiveRules.forEach(rule => {
      const className = rule.className || `.${options.classPrefix}-${rule.breakpoint}`
      const styles = this.stylesToCSS(rule.styles)

      if (styles) {
        const cssRule = `@media ${rule.mediaQuery} { ${className} { ${styles} } }`
        cssRules.push(cssRule)
        rule.cssRule = cssRule
      }
    })

    result.mediaCSS = cssRules.join('\n')
  }

  /**
   * 样式对象转CSS字符串
   */
  private stylesToCSS(styles: CSSProperties): string {
    const cssProps: string[] = []

    Object.entries(styles).forEach(([property, value]) => {
      if (value !== undefined && value !== null) {
        const cssProperty = this.camelToKebab(property)
        cssProps.push(`${cssProperty}: ${value}`)
      }
    })

    return cssProps.join('; ')
  }

  /**
   * 驼峰转短横线
   */
  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
  }
}

/**
 * 默认响应式处理器实例
 */
export const defaultResponsiveProcessor = new ResponsiveStyleProcessor()

/**
 * 便捷函数：处理响应式样式
 */
export function processResponsiveStyles(
  styles: ExtendedComponentStyles,
  options?: ResponsiveOptions
): ResponsiveResult {
  return defaultResponsiveProcessor.processResponsive(styles, options)
}

/**
 * 便捷函数：获取当前断点
 */
export function getCurrentBreakpoint(width: number): string | null {
  return defaultResponsiveProcessor.getActiveBreakpoint(width)
}

/**
 * 便捷函数：获取指定宽度的样式
 */
export function getStylesAtWidth(styles: ExtendedComponentStyles, width: number): CSSProperties {
  return defaultResponsiveProcessor.getStylesForWidth(styles, width)
}

/**
 * 便捷函数：生成媒体查询
 */
export function createMediaQuery(
  breakpoint: string,
  strategy?: 'mobile-first' | 'desktop-first'
): string {
  return defaultResponsiveProcessor.generateMediaQuery(breakpoint, strategy)
}

/**
 * 响应式工具函数
 */
export const responsiveUtils = {
  /**
   * 检查是否为移动端
   */
  isMobile: (width: number): boolean => width < 768,

  /**
   * 检查是否为平板端
   */
  isTablet: (width: number): boolean => width >= 768 && width < 1024,

  /**
   * 检查是否为桌面端
   */
  isDesktop: (width: number): boolean => width >= 1024,

  /**
   * 获取容器查询支持
   */
  supportsContainerQueries: (): boolean => {
    return typeof CSS !== 'undefined' && CSS.supports('container-type', 'inline-size')
  },

  /**
   * 创建容器查询
   */
  createContainerQuery: (minWidth: number, maxWidth?: number): string => {
    if (maxWidth) {
      return `(min-width: ${minWidth}px) and (max-width: ${maxWidth}px)`
    }
    return `(min-width: ${minWidth}px)`
  },
}
