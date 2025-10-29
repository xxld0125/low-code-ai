/**
 * 响应式工具函数
 * 提供响应式样式生成、属性值处理和布局辅助功能
 *
 * 创建日期: 2025-10-29
 * 功能模块: T009-响应式设计断点和可访问性标准
 */

import type { CSSProperties } from 'react'
import {
  type Breakpoint,
  MEDIA_QUERIES,
  BREAKPOINT_ORDER,
  getBreakpointForWidth,
} from './breakpoints'

/**
 * 响应式样式值接口
 */
export interface ResponsiveValue<T> {
  mobile?: T
  tablet?: T
  desktop?: T
}

/**
 * 响应式样式对象接口
 */
export interface ResponsiveStyles {
  // 基础CSS属性
  display?: CSSProperties['display']
  position?: CSSProperties['position']
  width?: CSSProperties['width']
  height?: CSSProperties['height']
  margin?: CSSProperties['margin']
  padding?: CSSProperties['padding']
  color?: CSSProperties['color']
  fontSize?: CSSProperties['fontSize']
  fontWeight?: CSSProperties['fontWeight']
  backgroundColor?: CSSProperties['backgroundColor']
  border?: CSSProperties['border']
  borderRadius?: CSSProperties['borderRadius']
  // 其他CSS属性
  [key: string]: CSSProperties[keyof CSSProperties] | unknown

  // 响应式样式
  responsive?: Partial<ResponsiveValue<Partial<CSSProperties>>>
}

/**
 * Tailwind CSS 类名生成选项
 */
export interface TailwindClassOptions {
  prefix?: string
  important?: boolean
}

/**
 * CSS 变量值接口
 */
export interface CSSVariable {
  name: string
  value: string
}

/**
 * 将响应式值转换为 Tailwind CSS 类名
 * @param responsive 响应式值对象
 * @param classGenerator 类名生成函数 (value, breakpoint) => string
 * @param options 选项配置
 * @returns Tailwind CSS 类名字符串
 */
export function generateResponsiveClasses<T>(
  responsive: ResponsiveValue<T> | undefined,
  classGenerator: (value: T, breakpoint?: Breakpoint) => string,
  options: TailwindClassOptions = {}
): string {
  if (!responsive) return ''

  const classes: string[] = []
  const { prefix = '', important = false } = options

  // 为每个断点生成类名
  for (const breakpoint of BREAKPOINT_ORDER) {
    const value = responsive[breakpoint]
    if (value !== undefined) {
      let className = classGenerator(value, breakpoint)

      // 添加断点前缀（除了mobile断点）
      if (breakpoint !== 'mobile') {
        className = `${breakpoint}:${className}`
      }

      // 添加前缀和important标记
      if (prefix) {
        className = `${prefix}:${className}`
      }
      if (important) {
        className = `!${className}`
      }

      classes.push(className)
    }
  }

  return classes.join(' ')
}

/**
 * 生成响应式 CSS 变量
 * @param responsive 响应式值
 * @param variableName CSS变量名（不需要--前缀）
 * @returns CSS变量定义数组
 */
export function generateResponsiveCSSVariables<T>(
  responsive: ResponsiveValue<T> | undefined,
  variableName: string
): CSSVariable[] {
  if (!responsive) return []

  const variables: CSSVariable[] = []

  for (const breakpoint of BREAKPOINT_ORDER) {
    const value = responsive[breakpoint]
    if (value !== undefined) {
      const name = `--${variableName}-${breakpoint}`
      variables.push({
        name,
        value: String(value),
      })
    }
  }

  return variables
}

/**
 * 生成响应式媒体查询 CSS
 * @param responsive 响应式样式
 * @param styleGenerator 样式生成函数 (value) => CSSProperties
 * @returns 媒体查询 CSS 字符串
 */
export function generateResponsiveMediaQuery<T>(
  responsive: ResponsiveValue<T> | undefined,
  styleGenerator: (value: T) => CSSProperties
): string {
  if (!responsive) return ''

  const queries: string[] = []

  for (const breakpoint of BREAKPOINT_ORDER) {
    const value = responsive[breakpoint]
    if (value !== undefined) {
      const styles = styleGenerator(value)
      const cssString = Object.entries(styles)
        .map(([prop, val]) => `${prop}: ${val};`)
        .join(' ')

      if (cssString) {
        const mediaQuery =
          breakpoint === 'mobile'
            ? cssString
            : `@media ${MEDIA_QUERIES[breakpoint]} { ${cssString} }`
        queries.push(mediaQuery)
      }
    }
  }

  return queries.join('\n')
}

/**
 * 获取当前断点
 * @returns 当前设备的断点
 */
export function getCurrentBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') {
    // 服务器端默认返回 desktop
    return 'desktop'
  }

  return getBreakpointForWidth(window.innerWidth)
}

/**
 * 监听断点变化
 * @param callback 断点变化回调函数
 * @returns 清理函数
 */
export function watchBreakpointChange(callback: (breakpoint: Breakpoint) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {} // 服务器端返回空函数
  }

  let currentBreakpoint = getCurrentBreakpoint()

  const handleResize = () => {
    const newBreakpoint = getCurrentBreakpoint()
    if (newBreakpoint !== currentBreakpoint) {
      currentBreakpoint = newBreakpoint
      callback(newBreakpoint)
    }
  }

  window.addEventListener('resize', handleResize)

  // 返回清理函数
  return () => {
    window.removeEventListener('resize', handleResize)
  }
}

/**
 * 将 CSS 属性转换为响应式样式
 * @param property CSS属性名
 * @param responsive 响应式值
 * @returns 响应式样式对象
 */
export function createResponsiveStyle<T extends string | number>(
  property: keyof CSSProperties,
  responsive: ResponsiveValue<T>
): ResponsiveStyles {
  const baseStyle: Partial<CSSProperties> = {}
  const responsiveStyles: ResponsiveValue<Partial<CSSProperties>> = {}

  for (const breakpoint of BREAKPOINT_ORDER) {
    const value = responsive[breakpoint]
    if (value !== undefined) {
      if (breakpoint === 'mobile') {
        baseStyle[property] = value as never
      } else {
        responsiveStyles[breakpoint] = {
          [property]: value,
        }
      }
    }
  }

  const result: ResponsiveStyles = baseStyle
  if (Object.keys(responsiveStyles).length > 0) {
    result.responsive = responsiveStyles
  }

  return result
}

/**
 * 合并响应式样式
 * @param styles 响应式样式数组
 * @returns 合并后的响应式样式
 */
export function mergeResponsiveStyles(
  ...styles: (ResponsiveStyles | undefined)[]
): ResponsiveStyles {
  const result: ResponsiveStyles = {}

  for (const style of styles) {
    if (!style) continue

    // 合并基础样式
    Object.assign(result, style)

    // 合并响应式样式
    if (style.responsive) {
      result.responsive = {
        ...result.responsive,
        ...style.responsive,
      }
    }
  }

  return result
}

/**
 * 从响应式样式中获取指定断点的实际样式
 * @param responsiveStyles 响应式样式对象
 * @param breakpoint 目标断点
 * @returns 该断点的实际样式
 */
export function getStylesForBreakpoint(
  responsiveStyles: ResponsiveStyles,
  breakpoint: Breakpoint
): CSSProperties {
  const result: CSSProperties = { ...responsiveStyles }

  // 从小断点开始累积样式
  for (const bp of BREAKPOINT_ORDER) {
    if (bp === breakpoint) break

    const bpStyles = responsiveStyles.responsive?.[bp]
    if (bpStyles) {
      Object.assign(result, bpStyles)
    }
  }

  // 添加当前断点的样式
  const currentStyles = responsiveStyles.responsive?.[breakpoint]
  if (currentStyles) {
    Object.assign(result, currentStyles)
  }

  // 移除 responsive 属性
  const finalResult: CSSProperties = { ...result }
  // 使用类型断言来删除responsive属性
  const tempResult = finalResult as Record<string, unknown>
  delete tempResult.responsive
  return finalResult
}

/**
 * 验证响应式值是否有效
 * @param responsive 响应式值
 * @param validator 验证函数
 * @returns 是否有效
 */
export function validateResponsiveValue<T>(
  responsive: ResponsiveValue<T> | undefined,
  validator: (value: T) => boolean
): boolean {
  if (!responsive) return true

  return Object.values(responsive).every(value => value === undefined || validator(value))
}

/**
 * 创建响应式间距值
 * @param spacing 间距值（数字或数组）
 * @returns 响应式间距值
 */
export function createResponsiveSpacing(
  spacing: number | [number, number] | [number, number, number]
): ResponsiveValue<string> {
  const result: ResponsiveValue<string> = {}

  if (typeof spacing === 'number') {
    result.mobile = `${spacing}px`
    result.tablet = `${spacing}px`
    result.desktop = `${spacing}px`
  } else if (Array.isArray(spacing)) {
    if (spacing.length === 2) {
      result.mobile = `${spacing[0]}px`
      result.tablet = `${spacing[1]}px`
      result.desktop = `${spacing[1]}px`
    } else if (spacing.length === 3) {
      result.mobile = `${spacing[0]}px`
      result.tablet = `${spacing[1]}px`
      result.desktop = `${spacing[2]}px`
    }
  }

  return result
}

/**
 * 创建响应式字体大小
 * @param fontSize 字体大小配置
 * @returns 响应式字体大小
 */
export function createResponsiveFontSize(fontSize: {
  mobile?: string | number
  tablet?: string | number
  desktop?: string | number
}): ResponsiveValue<string> {
  const result: ResponsiveValue<string> = {}

  const processValue = (value: string | number | undefined): string | undefined => {
    if (value === undefined) return undefined
    return typeof value === 'string' ? value : `${value}px`
  }

  result.mobile = processValue(fontSize.mobile)
  result.tablet = processValue(fontSize.tablet)
  result.desktop = processValue(fontSize.desktop)

  return result
}
