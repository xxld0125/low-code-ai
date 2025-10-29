/**
 * 样式引擎核心模块
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 * 功能: 组件样式处理、内联样式与CSS类混合、样式优化
 */

import { CSSProperties } from 'react'

// 从types/lowcode/style.ts导入类型，但先定义基本类型以避免循环依赖
export interface SpacingValue {
  x?: string | number
  y?: string | number
  top?: string | number
  right?: string | number
  bottom?: string | number
  left?: string | number
}

export interface BorderProperties {
  width?: number | string
  style?: 'solid' | 'dashed' | 'dotted' | 'double'
  color?: string
  topWidth?: number | string
  topStyle?: 'solid' | 'dashed' | 'dotted' | 'double'
  topColor?: string
  rightWidth?: number | string
  rightStyle?: 'solid' | 'dashed' | 'dotted' | 'double'
  rightColor?: string
  bottomWidth?: number | string
  bottomStyle?: 'solid' | 'dashed' | 'dotted' | 'double'
  bottomColor?: string
  leftWidth?: number | string
  leftStyle?: 'solid' | 'dashed' | 'dotted' | 'double'
  leftColor?: string
}

export interface BorderRadiusValue {
  topLeft?: string | number
  topRight?: string | number
  bottomRight?: string | number
  bottomLeft?: string | number
}

export interface FlexProperties {
  flexDirection?: string
  flexWrap?: string
  justifyContent?: string
  alignItems?: string
  alignContent?: string
  gap?: string | number
  [key: string]: unknown
}

export interface GridProperties {
  gridTemplateColumns?: string
  gridTemplateRows?: string
  gridTemplateAreas?: string
  gridAutoColumns?: string
  gridAutoRows?: string
  gridAutoFlow?: string
  gridColumnGap?: string | number
  gridRowGap?: string | number
  gap?: string | number
  [key: string]: unknown
}

export interface TransformProperties {
  translate?: {
    x?: string | number
    y?: string | number
    z?: string | number
  }
  rotate?: {
    x?: string
    y?: string
    z?: string
  }
  scale?: {
    x?: number
    y?: number
    z?: number
  }
  skew?: {
    x?: string
    y?: string
  }
}

export interface TransitionProperties {
  properties?: Record<
    string,
    {
      duration?: string
      timingFunction?: string
      delay?: string
    }
  >
}

// ComponentStyles接口定义
export interface ComponentStyles {
  // 显示属性
  display?: CSSDisplayProperty
  position?: CSSPositionProperty
  visibility?: CSSVisibilityProperty
  opacity?: number
  zIndex?: number

  // 尺寸控制
  width?: string | number
  height?: string | number
  minWidth?: string | number
  minHeight?: string | number
  maxWidth?: string | number
  maxHeight?: string | number

  // 间距控制
  margin?: SpacingValue
  padding?: SpacingValue

  // 布局属性
  flex?: FlexProperties
  grid?: GridProperties

  // 文字样式
  color?: string
  backgroundColor?: string
  fontSize?: string | number
  fontWeight?: string | number
  fontFamily?: string
  lineHeight?: string | number
  textAlign?: CSSTextAlignProperty
  textDecoration?: CSSTextDecorationProperty

  // 边框和圆角
  border?: BorderProperties
  borderRadius?: BorderRadiusValue
  boxShadow?: string

  // 变换
  transform?: TransformProperties

  // 动画
  transition?: TransitionProperties

  // 自定义CSS
  customCSS?: string

  // 响应式样式
  responsive?: Record<string, Partial<ComponentStyles>>
}

// CSS属性类型声明
type CSSDisplayProperty =
  | 'none'
  | 'inline'
  | 'block'
  | 'inline-block'
  | 'flex'
  | 'inline-flex'
  | 'grid'
  | 'inline-grid'
  | 'table'
  | 'inline-table'
type CSSPositionProperty = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
type CSSVisibilityProperty = 'visible' | 'hidden' | 'collapse'
type CSSTextAlignProperty = 'left' | 'center' | 'right' | 'justify'
type CSSTextDecorationProperty = 'none' | 'underline' | 'line-through' | 'overline'

/**
 * 扩展的组件样式接口，支持更完整的CSS属性
 */
export interface ExtendedComponentStyles extends ComponentStyles {
  // 显示和定位
  visibility?: 'visible' | 'hidden' | 'collapse'
  opacity?: number
  zIndex?: number

  // 溢出和裁剪
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto'
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto'
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto'
  clip?: string

  // 列表样式
  listStyle?: string
  listStyleType?: string
  listStylePosition?: string
  listStyleImage?: string

  // 表格样式
  borderCollapse?: 'collapse' | 'separate'
  borderSpacing?: string | number
  captionSide?: 'top' | 'bottom'
  emptyCells?: 'show' | 'hide'

  // 其他样式
  cursor?: string
  userSelect?: 'auto' | 'text' | 'none' | 'contain' | 'all'
  pointerEvents?:
    | 'auto'
    | 'none'
    | 'visiblePainted'
    | 'visibleFill'
    | 'visibleStroke'
    | 'painted'
    | 'fill'
    | 'stroke'
    | 'all'
  willChange?: string
}

/**
 * 样式处理选项
 */
export interface StyleProcessingOptions {
  /** 是否启用优化 */
  optimize?: boolean
  /** 是否移除无效样式 */
  removeInvalid?: boolean
  /** 是否自动添加浏览器前缀 */
  addPrefixes?: boolean
  /** 是否单位化数值 */
  unitizeValues?: boolean
  /** 默认单位 */
  defaultUnit?: string
  /** 自定义CSS变量 */
  cssVariables?: Record<string, string>
}

/**
 * 样式处理结果
 */
export interface StyleProcessingResult {
  /** 内联样式对象 */
  inlineStyles: CSSProperties
  /** CSS类名 */
  cssClasses: string[]
  /** 自定义CSS字符串 */
  customCSS: string
  /** CSS变量声明 */
  cssVariables: Record<string, string>
  /** 处理统计信息 */
  stats: {
    totalProperties: number
    processedProperties: number
    optimizedProperties: number
    invalidProperties: string[]
  }
}

/**
 * 默认样式处理选项
 */
const DEFAULT_OPTIONS: StyleProcessingOptions = {
  optimize: true,
  removeInvalid: true,
  addPrefixes: true,
  unitizeValues: true,
  defaultUnit: 'px',
  cssVariables: {},
}

/**
 * 样式引擎核心类
 */
export class StyleEngine {
  private cache = new Map<string, StyleProcessingResult>()
  private cssVariableCounter = 0

  /**
   * 处理组件样式
   */
  processStyles(
    styles: ExtendedComponentStyles,
    options: StyleProcessingOptions = {}
  ): StyleProcessingResult {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    const cacheKey = this.generateCacheKey(styles, opts)

    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const result: StyleProcessingResult = {
      inlineStyles: {},
      cssClasses: [],
      customCSS: '',
      cssVariables: {},
      stats: {
        totalProperties: 0,
        processedProperties: 0,
        optimizedProperties: 0,
        invalidProperties: [],
      },
    }

    // 处理基础样式
    this.processBasicStyles(styles, result, opts)

    // 处理间距样式
    this.processSpacingStyles(styles, result, opts)

    // 处理边框和圆角
    this.processBorderStyles(styles, result, opts)

    // 处理Flex布局
    this.processFlexStyles(styles, result, opts)

    // 处理Grid布局
    this.processGridStyles(styles, result, opts)

    // 处理变换样式
    this.processTransformStyles(styles, result, opts)

    // 处理过渡样式
    this.processTransitionStyles(styles, result, opts)

    // 处理自定义CSS
    this.processCustomCSS(styles, result, opts)

    // 优化结果
    if (opts.optimize) {
      this.optimizeResult(result, opts)
    }

    // 缓存结果
    this.cache.set(cacheKey, result)
    return result
  }

  /**
   * 合并多个样式对象
   */
  mergeStyles(...styles: (ExtendedComponentStyles | undefined)[]): ExtendedComponentStyles {
    return styles.reduce((merged: ExtendedComponentStyles, style) => {
      if (!style) return merged
      return { ...merged, ...style }
    }, {} as ExtendedComponentStyles)
  }

  /**
   * 生成CSS类名
   */
  generateCSSClass(prefix: string, styles: Partial<ExtendedComponentStyles>): string {
    const hash = this.hashObject(styles)
    return `${prefix}-${hash}`
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }

  /**
   * 处理基础样式
   */
  private processBasicStyles(
    styles: ExtendedComponentStyles,
    result: StyleProcessingResult,
    options: StyleProcessingOptions
  ): void {
    const basicProperties = [
      'display',
      'position',
      'visibility',
      'opacity',
      'zIndex',
      'width',
      'height',
      'minWidth',
      'minHeight',
      'maxWidth',
      'maxHeight',
      'color',
      'backgroundColor',
      'fontSize',
      'fontWeight',
      'fontFamily',
      'lineHeight',
      'textAlign',
      'textDecoration',
      'top',
      'right',
      'bottom',
      'left',
      'overflow',
      'overflowX',
      'overflowY',
      'clip',
      'listStyle',
      'listStyleType',
      'listStylePosition',
      'listStyleImage',
      'borderCollapse',
      'borderSpacing',
      'captionSide',
      'emptyCells',
      'cursor',
      'userSelect',
      'pointerEvents',
      'willChange',
    ] as const

    for (const prop of basicProperties) {
      const value = (styles as Record<string, unknown>)[prop]
      if (value !== undefined) {
        result.stats.totalProperties++
        this.setProcessedProperty(result.inlineStyles, prop, value as string | number, options)
        result.stats.processedProperties++
      }
    }
  }

  /**
   * 处理间距样式
   */
  private processSpacingStyles(
    styles: ExtendedComponentStyles,
    result: StyleProcessingResult,
    options: StyleProcessingOptions
  ): void {
    if (styles.margin) {
      this.processSpacingValue('margin', styles.margin, result, options)
    }
    if (styles.padding) {
      this.processSpacingValue('padding', styles.padding, result, options)
    }
  }

  /**
   * 处理边框和圆角样式
   */
  private processBorderStyles(
    styles: ExtendedComponentStyles,
    result: StyleProcessingResult,
    options: StyleProcessingOptions
  ): void {
    if (styles.border) {
      this.processBorderValue(styles.border, result, options)
    }
    if (styles.borderRadius) {
      this.processBorderRadiusValue(styles.borderRadius, result, options)
    }
    if (styles.boxShadow) {
      ;(result.inlineStyles as CSSProperties).boxShadow = styles.boxShadow
      result.stats.processedProperties++
    }
  }

  /**
   * 处理Flex布局样式
   */
  private processFlexStyles(
    styles: ExtendedComponentStyles,
    result: StyleProcessingResult,
    options: StyleProcessingOptions
  ): void {
    if (styles.flex) {
      const flex = styles.flex
      if (typeof flex === 'object') {
        Object.entries(flex).forEach(([key, value]) => {
          if (value !== undefined) {
            this.setProcessedProperty(
              result.inlineStyles,
              key as keyof CSSProperties,
              value as string | number,
              options
            )
            result.stats.processedProperties++
          }
        })
      } else {
        ;(result.inlineStyles as CSSProperties).flex = flex
        result.stats.processedProperties++
      }
    }
  }

  /**
   * 处理Grid布局样式
   */
  private processGridStyles(
    styles: ExtendedComponentStyles,
    result: StyleProcessingResult,
    options: StyleProcessingOptions
  ): void {
    if (styles.grid) {
      const grid = styles.grid
      Object.entries(grid).forEach(([key, value]) => {
        if (value !== undefined) {
          this.setProcessedProperty(
            result.inlineStyles,
            key as keyof CSSProperties,
            value as string | number,
            options
          )
          result.stats.processedProperties++
        }
      })
    }
  }

  /**
   * 处理变换样式
   */
  private processTransformStyles(
    styles: ExtendedComponentStyles,
    result: StyleProcessingResult,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: StyleProcessingOptions
  ): void {
    if (styles.transform) {
      const transform = styles.transform
      const transformValue = this.buildTransformString(transform)
      if (transformValue) {
        ;(result.inlineStyles as CSSProperties).transform = transformValue
        result.stats.processedProperties++
      }
    }
  }

  /**
   * 处理过渡样式
   */
  private processTransitionStyles(
    styles: ExtendedComponentStyles,
    result: StyleProcessingResult,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: StyleProcessingOptions
  ): void {
    if (styles.transition) {
      const transition = styles.transition
      const transitionValue = this.buildTransitionString(transition)
      if (transitionValue) {
        ;(result.inlineStyles as CSSProperties).transition = transitionValue
        result.stats.processedProperties++
      }
    }
  }

  /**
   * 处理自定义CSS
   */
  private processCustomCSS(
    styles: ExtendedComponentStyles,
    result: StyleProcessingResult,
    options: StyleProcessingOptions
  ): void {
    if (styles.customCSS) {
      result.customCSS += styles.customCSS
      result.stats.processedProperties++
    }

    // 处理CSS变量
    if (options.cssVariables && Object.keys(options.cssVariables).length > 0) {
      result.cssVariables = { ...result.cssVariables, ...options.cssVariables }
    }
  }

  /**
   * 处理间距值
   */
  private processSpacingValue(
    prefix: 'margin' | 'padding',
    value: SpacingValue,
    result: StyleProcessingResult,
    options: StyleProcessingOptions
  ): void {
    if (typeof value === 'string' || typeof value === 'number') {
      const processedValue = this.processValue(value, options)
      result.inlineStyles[prefix] = processedValue
      result.stats.processedProperties++
    } else if (typeof value === 'object') {
      // 处理方向性间距
      const directions = ['top', 'right', 'bottom', 'left', 'x', 'y'] as const
      for (const dir of directions) {
        if (value[dir] !== undefined) {
          const propName = `${prefix}${dir.charAt(0).toUpperCase() + dir.slice(1)}`
          const processedValue = this.processValue(value[dir]!, options)
          ;(result.inlineStyles as Record<string, unknown>)[propName] = processedValue
          result.stats.processedProperties++
        }
      }
    }
  }

  /**
   * 处理边框值
   */
  private processBorderValue(
    border: BorderProperties,
    result: StyleProcessingResult,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: StyleProcessingOptions
  ): void {
    const borderProps = ['width', 'style', 'color'] as const
    const sides = ['top', 'right', 'bottom', 'left'] as const

    // 检查是否是统一边框
    const isUniform = borderProps.every(prop =>
      sides.every(
        side =>
          border[
            `${prop}${side.charAt(0).toUpperCase() + side.slice(1)}` as keyof BorderProperties
          ] === undefined
      )
    )

    if (isUniform && (border.width || border.style || border.color)) {
      // 统一边框
      const borderValue = [border.width, border.style, border.color].filter(Boolean).join(' ')
      ;(result.inlineStyles as Record<string, unknown>).border = borderValue
      result.stats.processedProperties++
    } else {
      // 分别设置各边
      for (const side of sides) {
        const sidePrefix = `border${side.charAt(0).toUpperCase() + side.slice(1)}`
        const sideBorderValue = [
          border[`${sidePrefix}Width` as keyof BorderProperties],
          border[`${sidePrefix}Style` as keyof BorderProperties],
          border[`${sidePrefix}Color` as keyof BorderProperties],
        ]
          .filter(Boolean)
          .join(' ')

        if (sideBorderValue) {
          ;(result.inlineStyles as Record<string, unknown>)[sidePrefix] = sideBorderValue
          result.stats.processedProperties++
        }
      }
    }
  }

  /**
   * 处理圆角值
   */
  private processBorderRadiusValue(
    borderRadius: BorderRadiusValue,
    result: StyleProcessingResult,
    options: StyleProcessingOptions
  ): void {
    if (typeof borderRadius === 'string' || typeof borderRadius === 'number') {
      const finalRadiusValue = this.processValue(borderRadius, options)
      ;(result.inlineStyles as Record<string, unknown>).borderRadius = finalRadiusValue
      result.stats.processedProperties++
    } else if (typeof borderRadius === 'object') {
      const corners = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'] as const
      const cornerValues = corners.map(corner =>
        borderRadius[corner] ? this.processValue(borderRadius[corner]!, options) : undefined
      )

      if (cornerValues.every(v => v === cornerValues[0])) {
        // 所有角相同
        if (cornerValues[0]) {
          ;(result.inlineStyles as Record<string, unknown>).borderRadius = cornerValues[0]
          result.stats.processedProperties++
        }
      } else {
        // 分别设置各角
        const radiusValue = cornerValues.filter(Boolean).join(' ')
        if (radiusValue) {
          ;(result.inlineStyles as Record<string, unknown>).borderRadius = radiusValue
          result.stats.processedProperties++
        }
      }
    }
  }

  /**
   * 构建变换字符串
   */
  private buildTransformString(transform: TransformProperties): string {
    const transforms: string[] = []

    if (transform.translate) {
      const { x = 0, y = 0, z = 0 } = transform.translate
      transforms.push(`translate3d(${x}, ${y}, ${z})`)
    }

    if (transform.rotate) {
      const { x = 0, y = 0, z = 0 } = transform.rotate
      if (x) transforms.push(`rotateX(${x})`)
      if (y) transforms.push(`rotateY(${y})`)
      if (z) transforms.push(`rotateZ(${z})`)
    }

    if (transform.scale) {
      const { x = 1, y = 1, z = 1 } = transform.scale
      transforms.push(`scale3d(${x}, ${y}, ${z})`)
    }

    if (transform.skew) {
      const { x = 0, y = 0 } = transform.skew
      transforms.push(`skew(${x}, ${y})`)
    }

    return transforms.join(' ')
  }

  /**
   * 构建过渡字符串
   */
  private buildTransitionString(transition: TransitionProperties): string {
    const transitions: string[] = []

    if (transition.properties) {
      for (const [property, config] of Object.entries(transition.properties)) {
        const value = [
          property,
          config.duration || '0s',
          config.timingFunction || 'ease',
          config.delay || '0s',
        ].join(' ')
        transitions.push(value)
      }
    }

    return transitions.join(', ')
  }

  /**
   * 处理数值（添加单位等）
   */
  private processValue(value: string | number, options: StyleProcessingOptions): string | number {
    if (typeof value === 'number') {
      if (options.unitizeValues) {
        return `${value}${options.defaultUnit}`
      }
      return value
    }
    return value
  }

  /**
   * 设置处理后的属性
   */
  private setProcessedProperty(
    styles: CSSProperties,
    property: string,
    value: string | number,
    options: StyleProcessingOptions
  ): void {
    // 转换驼峰命名为CSS属性名
    const cssProperty = this.camelToKebab(property)
    const processedValue = this.processValue(value, options)

    // 添加浏览器前缀（如果需要）
    if (options.addPrefixes) {
      const prefixedProperties = this.getPrefixedProperties(cssProperty, processedValue)
      prefixedProperties.forEach(([prop, val]) => {
        ;(styles as Record<string, unknown>)[this.kebabToCamel(prop)] = val
      })
    } else {
      ;(styles as Record<string, unknown>)[this.kebabToCamel(cssProperty)] = processedValue
    }
  }

  /**
   * 优化处理结果
   */
  private optimizeResult(
    result: StyleProcessingResult,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: StyleProcessingOptions
  ): void {
    // 移除重复的样式
    const optimized: CSSProperties = {}
    const seen = new Set<string>()

    Object.entries(result.inlineStyles).forEach(([key, value]) => {
      const cssProperty = this.camelToKebab(key)
      if (!seen.has(cssProperty)) {
        ;(optimized as Record<string, unknown>)[key] = value
        seen.add(cssProperty)
      } else {
        result.stats.optimizedProperties++
      }
    })

    result.inlineStyles = optimized

    // 优化CSS类
    const uniqueClasses = Array.from(new Set(result.cssClasses))
    result.cssClasses = uniqueClasses

    // 压缩自定义CSS
    if (result.customCSS) {
      result.customCSS = this.minifyCSS(result.customCSS)
    }
  }

  /**
   * 获取需要浏览器前缀的属性
   */
  private getPrefixedProperties(
    property: string,
    value: string | number
  ): Array<[string, string | number]> {
    const prefixed: Array<[string, string | number]> = [[property, value]]

    const prefixMap: Record<string, string[]> = {
      transform: ['-webkit-transform'],
      transition: ['-webkit-transition'],
      animation: ['-webkit-animation'],
      'user-select': ['-webkit-user-select', '-moz-user-select', '-ms-user-select'],
      'box-sizing': ['-webkit-box-sizing', '-moz-box-sizing'],
    }

    if (prefixMap[property]) {
      prefixMap[property].forEach(prefix => {
        prefixed.push([prefix, value])
      })
    }

    return prefixed
  }

  /**
   * 驼峰转短横线
   */
  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
  }

  /**
   * 短横线转驼峰
   */
  private kebabToCamel(str: string): string {
    return str.replace(/-([a-z])/g, g => g[1].toUpperCase())
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(
    styles: ExtendedComponentStyles,
    options: StyleProcessingOptions
  ): string {
    return JSON.stringify({ styles, options })
  }

  /**
   * 对象哈希
   */
  private hashObject(obj: unknown): string {
    const str = JSON.stringify(obj)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * 压缩CSS
   */
  private minifyCSS(css: string): string {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除注释
      .replace(/\s+/g, ' ') // 压缩空白
      .replace(/;\s*}/g, '}') // 移除最后的分号
      .replace(/\s*{\s*/g, '{') // 压缩大括号
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*;\s*/g, ';') // 压缩分号
      .replace(/\s*:\s*/g, ':') // 压缩冒号
      .trim()
  }
}

/**
 * 默认样式引擎实例
 */
export const defaultStyleEngine = new StyleEngine()

/**
 * 便捷函数：处理样式
 */
export function processComponentStyles(
  styles: ExtendedComponentStyles,
  options?: StyleProcessingOptions
): StyleProcessingResult {
  return defaultStyleEngine.processStyles(styles, options)
}

/**
 * 便捷函数：合并样式
 */
export function mergeComponentStyles(
  ...styles: (ExtendedComponentStyles | undefined)[]
): ExtendedComponentStyles {
  return defaultStyleEngine.mergeStyles(...styles)
}

/**
 * 便捷函数：生成CSS类名
 */
export function generateComponentCSSClass(
  prefix: string,
  styles: Partial<ExtendedComponentStyles>
): string {
  return defaultStyleEngine.generateCSSClass(prefix, styles)
}
