/**
 * 响应式样式配置系统
 * 提供响应式断点管理、媒体查询生成、样式适配等功能
 */

import type { CSSProperties } from '@/types/designer'

// 响应式断点定义
export interface Breakpoint {
  name: string
  min: number
  max?: number
  description?: string
  icon?: string
  default?: boolean
}

// 响应式样式配置
export interface ResponsiveStyles {
  base?: CSSProperties
  sm?: CSSProperties
  md?: CSSProperties
  lg?: CSSProperties
  xl?: CSSProperties
  '2xl'?: CSSProperties
}

// 媒体查询配置
export interface MediaQueryConfig {
  min: string
  max?: string
  media: string
}

// 响应式样式规则
export interface ResponsiveStyleRule {
  property: string
  values: ResponsiveStyles
  strategy?: 'mobile-first' | 'desktop-first'
}

// 响应式配置选项
export interface ResponsiveConfig {
  strategy: 'mobile-first' | 'desktop-first'
  breakpoints: Breakpoint[]
  containerQueries?: boolean
  fluidSpacing?: boolean
  adaptiveImages?: boolean
}

// 默认断点配置
export const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  {
    name: 'base',
    min: 0,
    description: '基础样式（无媒体查询）',
    default: true
  },
  {
    name: 'sm',
    min: 640,
    max: 767,
    description: '小屏幕（手机竖屏）',
    icon: '📱'
  },
  {
    name: 'md',
    min: 768,
    max: 1023,
    description: '中等屏幕（手机横屏/小平板）',
    icon: '📱'
  },
  {
    name: 'lg',
    min: 1024,
    max: 1279,
    description: '大屏幕（平板/小桌面）',
    icon: '📱'
  },
  {
    name: 'xl',
    min: 1280,
    max: 1535,
    description: '超大屏幕（桌面）',
    icon: '💻'
  },
  {
    name: '2xl',
    min: 1536,
    description: '2倍超大屏幕（大桌面）',
    icon: '🖥️'
  }
]

// 响应式工具类
export class ResponsiveStyleManager {
  private config: ResponsiveConfig
  private breakpointCache: Map<string, MediaQueryConfig> = new Map()

  constructor(config: Partial<ResponsiveConfig> = {}) {
    this.config = {
      strategy: 'mobile-first',
      breakpoints: DEFAULT_BREAKPOINTS,
      containerQueries: false,
      fluidSpacing: true,
      adaptiveImages: true,
      ...config
    }

    this.initializeBreakpointCache()
  }

  // 初始化断点缓存
  private initializeBreakpointCache(): void {
    this.config.breakpoints.forEach(breakpoint => {
      if (breakpoint.name === 'base') return

      const mediaQueryConfig = this.generateMediaQuery(breakpoint)
      this.breakpointCache.set(breakpoint.name, mediaQueryConfig)
    })
  }

  // 生成媒体查询配置
  private generateMediaQuery(breakpoint: Breakpoint): MediaQueryConfig {
    const { min, max } = breakpoint
    let media = ''

    if (this.config.strategy === 'mobile-first') {
      // 移动优先：从最小宽度开始
      media = `(min-width: ${min}px)`
      if (max) {
        media += ` and (max-width: ${max}px)`
      }
    } else {
      // 桌面优先：从最大宽度开始
      if (max) {
        media = `(max-width: ${max}px)`
      } else {
        media = `(min-width: ${min}px)`
      }
    }

    return {
      min: `${min}px`,
      max: max ? `${max}px` : undefined,
      media
    }
  }

  // 获取断点的媒体查询
  getMediaQuery(breakpointName: string): string | null {
    const config = this.breakpointCache.get(breakpointName)
    return config ? config.media : null
  }

  // 获取所有断点
  getBreakpoints(): Breakpoint[] {
    return [...this.config.breakpoints]
  }

  // 获取指定断点
  getBreakpoint(name: string): Breakpoint | null {
    return this.config.breakpoints.find(bp => bp.name === name) || null
  }

  // 获取当前视口断点
  getCurrentBreakpoint(): string {
    if (typeof window === 'undefined') return 'base'

    const width = window.innerWidth
    let currentBreakpoint = 'base'

    // 从大到小查找匹配的断点
    const sortedBreakpoints = [...this.config.breakpoints]
      .filter(bp => bp.name !== 'base')
      .sort((a, b) => b.min - a.min)

    for (const breakpoint of sortedBreakpoints) {
      if (width >= breakpoint.min) {
        currentBreakpoint = breakpoint.name
        break
      }
    }

    return currentBreakpoint
  }

  // 获取指定断点的样式
  getStylesForBreakpoint(responsiveStyles: ResponsiveStyles, breakpointName: string): CSSProperties {
    if (breakpointName === 'base') {
      return responsiveStyles.base || {}
    }

    // 按断点顺序合并样式
    const sortedBreakpoints = this.config.breakpoints
      .filter(bp => bp.name !== 'base')
      .sort((a, b) => a.min - b.min)

    const mergedStyles: CSSProperties = { ...(responsiveStyles.base || {}) }

    for (const breakpoint of sortedBreakpoints) {
      if (breakpoint.name === breakpointName) {
        // 应用当前断点的样式
        Object.assign(mergedStyles, responsiveStyles[breakpoint.name as keyof ResponsiveStyles] || {})
        break
      }
      // 应用中间断点的样式
      Object.assign(mergedStyles, responsiveStyles[breakpoint.name as keyof ResponsiveStyles] || {})
    }

    return mergedStyles
  }

  // 生成CSS媒体查询规则
  generateCSS(responsiveStyles: ResponsiveStyles, selector: string = '.responsive'): string {
    const cssRules: string[] = []

    // 基础样式
    if (responsiveStyles.base) {
      const baseStyles = this.stylesToString(responsiveStyles.base)
      cssRules.push(`${selector} {\n${baseStyles}\n}`)
    }

    // 响应式样式
    this.config.breakpoints
      .filter(bp => bp.name !== 'base' && responsiveStyles[bp.name as keyof ResponsiveStyles])
      .forEach(breakpoint => {
        const styles = responsiveStyles[breakpoint.name as keyof ResponsiveStyles]
        if (styles) {
          const mediaQuery = this.getMediaQuery(breakpoint.name)
          const cssString = this.stylesToString(styles)
          cssRules.push(`\n@media ${mediaQuery} {\n  ${selector} {\n${cssString.replace(/^/gm, '    ')}\n  }\n}`)
        }
      })

    return cssRules.join('\n')
  }

  // 样式对象转换为字符串
  private stylesToString(styles: CSSProperties): string {
    return Object.entries(styles)
      .map(([property, value]) => {
        const cssProperty = this.camelToKebab(property)
        return `    ${cssProperty}: ${value};`
      })
      .join('\n')
  }

  // 驼峰命名转短横线命名
  private camelToKebab(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase()
  }

  // 应用响应式样式到元素
  applyResponsiveStyles(element: HTMLElement, responsiveStyles: ResponsiveStyles): void {
    if (!element) return

    const currentBreakpoint = this.getCurrentBreakpoint()
    const styles = this.getStylesForBreakpoint(responsiveStyles, currentBreakpoint)

    // 应用样式到元素
    Object.entries(styles).forEach(([property, value]) => {
      const cssProperty = this.camelToKebab(property)
      element.style.setProperty(cssProperty, String(value))
    })
  }

  // 监听断点变化
  onBreakpointChange(callback: (breakpoint: string) => void): () => void {
    if (typeof window === 'undefined') return () => {}

    let currentBreakpoint = this.getCurrentBreakpoint()

    const handleResize = () => {
      const newBreakpoint = this.getCurrentBreakpoint()
      if (newBreakpoint !== currentBreakpoint) {
        currentBreakpoint = newBreakpoint
        callback(currentBreakpoint)
      }
    }

    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('orientationchange', handleResize, { passive: true })

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }

  // 计算流体间距
  calculateFluidSpacing(
    minSize: number,
    maxSize: number,
    minViewport = 320,
    maxViewport = 1200
  ): string {
    if (!this.config.fluidSpacing) {
      return `${minSize}px`
    }

    return `clamp(${minSize}px, ${minSize}px + (${maxSize} - ${minSize}) * ((100vw - ${minViewport}px) / (${maxViewport} - ${minViewport})), ${maxSize}px)`
  }

  // 计算响应式字体大小
  calculateResponsiveFontSize(
    minSize: number,
    maxSize: number,
    minViewport = 320,
    maxViewport = 1200
  ): CSSProperties {
    const fluidSize = this.calculateFluidSpacing(minSize, maxSize, minViewport, maxViewport)
    return {
      fontSize: fluidSize,
      lineHeight: '1.4',
      letterSpacing: '-0.02em'
    }
  }

  // 生成容器查询样式
  generateContainerQueryStyles(containerName: string, responsiveStyles: ResponsiveStyles): string {
    if (!this.config.containerQueries) {
      return this.generateCSS(responsiveStyles, `.container-${containerName}`)
    }

    const cssRules: string[] = []
    const container = `@container ${containerName}`

    // 基础样式
    if (responsiveStyles.base) {
      const baseStyles = this.stylesToString(responsiveStyles.base)
      cssRules.push(`.container-${containerName} {\n${baseStyles}\n}`)
    }

    // 容器查询样式
    Object.entries(responsiveStyles)
      .filter(([key]) => key !== 'base')
      .forEach(([breakpoint, styles]) => {
        if (styles) {
          const breakpointConfig = this.getBreakpoint(breakpoint)
          if (breakpointConfig) {
            const cssString = this.stylesToString(styles)
            cssRules.push(`\n${container} (min-width: ${breakpointConfig.min}px) {\n  .container-${containerName} {\n${cssString.replace(/^/gm, '    ')}\n  }\n}`)
          }
        }
      })

    return cssRules.join('\n')
  }

  // 验证响应式样式
  validateResponsiveStyles(responsiveStyles: ResponsiveStyles): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // 检查断点是否存在
    Object.keys(responsiveStyles).forEach(breakpoint => {
      if (breakpoint !== 'base' && !this.getBreakpoint(breakpoint)) {
        errors.push(`未知的断点: ${breakpoint}`)
      }
    })

    // 检查样式值是否有效
    Object.entries(responsiveStyles).forEach(([breakpoint, styles]) => {
      if (styles) {
        Object.entries(styles).forEach(([property, value]) => {
          if (value === null || value === undefined) {
            errors.push(`断点 ${breakpoint} 的属性 ${property} 值无效`)
          }
        })
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // 合并响应式样式
  mergeResponsiveStyles(...responsiveStyles: ResponsiveStyles[]): ResponsiveStyles {
    const result: ResponsiveStyles = {}

    responsiveStyles.forEach(styles => {
      Object.entries(styles).forEach(([breakpoint, breakpointStyles]) => {
        if (breakpointStyles) {
          result[breakpoint as keyof ResponsiveStyles] = {
            ...(result[breakpoint as keyof ResponsiveStyles] as CSSProperties || {}),
            ...breakpointStyles
          }
        }
      })
    })

    return result
  }

  // 创建响应式样式Hook的数据
  createResponsiveData(responsiveStyles: ResponsiveStyles) {
    return {
      styles: responsiveStyles,
      currentBreakpoint: this.getCurrentBreakpoint(),
      getBreakpointStyles: (breakpoint: string) => this.getStylesForBreakpoint(responsiveStyles, breakpoint),
      generateCSS: (selector?: string) => this.generateCSS(responsiveStyles, selector),
      isValid: this.validateResponsiveStyles(responsiveStyles).valid
    }
  }
}

// 便捷函数
export const createResponsiveManager = (config?: Partial<ResponsiveConfig>) => {
  return new ResponsiveStyleManager(config)
}

export const getCurrentBreakpoint = () => {
  const manager = new ResponsiveStyleManager()
  return manager.getCurrentBreakpoint()
}

export const getStylesForBreakpoint = (responsiveStyles: ResponsiveStyles, breakpoint: string) => {
  const manager = new ResponsiveStyleManager()
  return manager.getStylesForBreakpoint(responsiveStyles, breakpoint)
}

export const generateResponsiveCSS = (responsiveStyles: ResponsiveStyles, selector?: string) => {
  const manager = new ResponsiveStyleManager()
  return manager.generateCSS(responsiveStyles, selector)
}

// React Hook的辅助函数
export const useResponsiveStyles = (responsiveStyles: ResponsiveStyles) => {
  const manager = new ResponsiveStyleManager()
  const [currentBreakpoint, setCurrentBreakpoint] = React.useState(manager.getCurrentBreakpoint())
  const [styles, setStyles] = React.useState(() => manager.getStylesForBreakpoint(responsiveStyles, currentBreakpoint))

  React.useEffect(() => {
    const unsubscribe = manager.onBreakpointChange(setCurrentBreakpoint)
    return unsubscribe
  }, [manager])

  React.useEffect(() => {
    setStyles(manager.getStylesForBreakpoint(responsiveStyles, currentBreakpoint))
  }, [manager, responsiveStyles, currentBreakpoint])

  return {
    currentBreakpoint,
    styles,
    cssString: manager.generateCSS(responsiveStyles),
    isValid: manager.validateResponsiveStyles(responsiveStyles).valid,
    breakpoints: manager.getBreakpoints()
  }
}

export default ResponsiveStyleManager