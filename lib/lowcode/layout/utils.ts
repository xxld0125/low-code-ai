/**
 * 布局组件公共工具函数
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 *
 * 提供布局组件中常用的样式计算和类名生成工具，
 * 减少重复代码，提高代码复用性和一致性。
 */

import type { SpacingValue } from '@/types/lowcode/style'
import { type Breakpoint, getCurrentBreakpoint } from '../responsive/breakpoints'

// ============================================================================
// Flex 对齐方式映射
// ============================================================================

/**
 * Flex 水平对齐方式映射
 */
export const FLEX_JUSTIFY_CLASSES = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
} as const

/**
 * Flex 垂直对齐方式映射
 */
export const FLEX_ALIGN_CLASSES = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
} as const

/**
 * Flex 自身对齐方式映射
 */
export const FLEX_ALIGN_SELF_CLASSES = {
  auto: 'self-auto',
  start: 'self-start',
  end: 'self-end',
  center: 'self-center',
  baseline: 'self-baseline',
  stretch: 'self-stretch',
} as const

// ============================================================================
// 间距转换工具
// ============================================================================

/**
 * 将间距对象转换为CSS值
 */
export const spacingToCss = (spacing: SpacingValue | { x: number; y: number }): string => {
  if (typeof spacing === 'number') {
    return `${spacing}px`
  }

  if (typeof spacing === 'object' && spacing !== null) {
    const { x = 0, y = 0 } = spacing
    return `${y}px ${x}px`
  }

  return '0px'
}

/**
 * 将间距值转换为像素字符串
 */
export const spacingToPx = (spacing: number | string): string => {
  if (typeof spacing === 'number') {
    return `${spacing}px`
  }

  // 如果已经是字符串格式，直接返回
  if (typeof spacing === 'string') {
    return spacing
  }

  return '0px'
}

// ============================================================================
// 样式类名生成工具
// ============================================================================

/**
 * 有效的圆角值集合
 */
const VALID_ROUNDED_VALUES = ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'] as const

type ValidRoundedValue = (typeof VALID_ROUNDED_VALUES)[number]

/**
 * 生成圆角CSS类名（带类型验证）
 */
export const getRoundedClass = (rounded: boolean | string): string => {
  if (!rounded) return ''

  if (rounded === true) return 'rounded'

  const roundedStr = String(rounded).toLowerCase()

  if (VALID_ROUNDED_VALUES.includes(roundedStr as ValidRoundedValue)) {
    return roundedStr === 'none' ? '' : `rounded-${roundedStr}`
  }

  console.warn(`Invalid rounded value: ${rounded}, using default`)
  return 'rounded'
}

/**
 * 有效的阴影值集合
 */
const VALID_SHADOW_VALUES = ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'inner'] as const

type ValidShadowValue = (typeof VALID_SHADOW_VALUES)[number]

/**
 * 生成阴影CSS类名（带类型验证）
 */
export const getShadowClass = (shadow: boolean | string): string => {
  if (!shadow) return ''

  if (shadow === true) return 'shadow-md'

  const shadowStr = String(shadow).toLowerCase()

  if (VALID_SHADOW_VALUES.includes(shadowStr as ValidShadowValue)) {
    return shadowStr === 'none' ? '' : `shadow-${shadowStr}`
  }

  console.warn(`Invalid shadow value: ${shadow}, using default`)
  return 'shadow-md'
}

// ============================================================================
// 边框工具
// ============================================================================

/**
 * 生成边框CSS类名
 */
export const getBorderClass = (border: boolean | string): string => {
  if (!border) return ''

  if (border === true) return 'border border-gray-200'

  const borderStr = String(border).toLowerCase()
  return `border border-${borderStr}`
}

// ============================================================================
// 栅格计算工具
// ============================================================================

/**
 * 计算24栅格系统中的宽度百分比
 */
export const calculateGridWidth = (span: number, totalColumns: number = 24): number => {
  if (!isValidGridSpan(span, totalColumns)) {
    console.warn(`Invalid span value: ${span}, must be between 1 and ${totalColumns}`)
    return 50 // 默认12栅格，即50%
  }

  return (span / totalColumns) * 100
}

/**
 * 计算24栅格系统中的偏移百分比
 */
export const calculateGridOffset = (offset: number, totalColumns: number = 24): number => {
  if (!isValidGridOffset(offset, totalColumns)) {
    console.warn(`Invalid offset value: ${offset}, must be between 0 and ${totalColumns - 1}`)
    return 0
  }

  return (offset / totalColumns) * 100
}

/**
 * 生成栅格列样式（基于24栅格系统）
 */
export const generateColumnStyles = (span: number, offset: number = 0): React.CSSProperties => {
  const styles: React.CSSProperties = {}

  // 验证参数
  if (!isValidGridSpan(span)) {
    console.error(`Invalid span value: ${span}, using default value 12`)
    span = 12
  }

  if (!isValidGridOffset(offset)) {
    console.error(`Invalid offset value: ${offset}, using default value 0`)
    offset = 0
  }

  // 计算宽度
  const widthPercent = calculateGridWidth(span)
  styles.flexBasis = `${widthPercent}%`
  styles.maxWidth = `${widthPercent}%`

  // 计算偏移
  const offsetPercent = calculateGridOffset(offset)
  if (offsetPercent > 0) {
    styles.marginLeft = `${offsetPercent}%`
  }

  return styles
}

// ============================================================================
// Flex属性工具
// ============================================================================

/**
 * Flex属性类型定义
 */
export type FlexValue = 'none' | 'auto' | 'initial' | number | string

/**
 * 解析Flex属性值
 */
export const parseFlexValue = (flex: FlexValue): string => {
  if (flex === 'none' || flex === undefined) return 'none'
  if (flex === 'auto') return 'auto'
  if (flex === 'initial') return 'initial'
  if (typeof flex === 'number') return `${flex}`

  return String(flex)
}

/**
 * 生成Flex相关样式
 */
export const generateFlexStyles = (
  flex?: FlexValue,
  flexGrow?: number,
  flexShrink?: number,
  flexBasis?: number | string
): React.CSSProperties => {
  const styles: React.CSSProperties = {}

  if (flex !== undefined && flex !== 'none') {
    styles.flex = parseFlexValue(flex)
  }

  if (flexGrow !== undefined) {
    styles.flexGrow = flexGrow
  }

  if (flexShrink !== undefined) {
    styles.flexShrink = flexShrink
  }

  if (flexBasis !== undefined) {
    styles.flexBasis = typeof flexBasis === 'number' ? `${flexBasis}px` : flexBasis
  }

  return styles
}

// ============================================================================
// 样式合并工具
// ============================================================================

/**
 * 安全地合并CSS样式对象
 */
export const mergeStyles = (
  ...styles: (React.CSSProperties | undefined)[]
): React.CSSProperties => {
  return styles.reduce<React.CSSProperties>((merged, style) => {
    if (!style) return merged
    return { ...merged, ...style }
  }, {})
}

/**
 * 生成完整的Flex容器样式
 */
export const generateFlexContainerStyles = (
  direction: 'row' | 'column' = 'column',
  wrap: boolean = false,
  gap: number | string = 0,
  padding: SpacingValue | { x: number; y: number } = { x: 0, y: 0 },
  margin: SpacingValue | { x: number; y: number } = { x: 0, y: 0 },
  background?: string,
  customStyles?: React.CSSProperties
): React.CSSProperties => {
  return mergeStyles(
    {
      display: 'flex',
      flexDirection: direction,
      flexWrap: wrap ? 'wrap' : 'nowrap',
      gap: spacingToPx(gap),
      padding: spacingToCss(padding),
      margin: spacingToCss(margin),
      backgroundColor: background,
    },
    customStyles
  )
}

// ============================================================================
// 响应式值类型和工具
// ============================================================================

/**
 * 响应式值类型定义
 */
export type ResponsiveValue<T> = {
  [K in Breakpoint]?: T
} & {
  /** 默认值（在移动端使用） */
  default?: T
}

/**
 * 获取当前断点的响应式值
 */
export function getResponsiveValue<T>(value: T | ResponsiveValue<T>, breakpoint?: Breakpoint): T {
  const currentBreakpoint = breakpoint || getCurrentBreakpoint()

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const responsiveValue = value as ResponsiveValue<T>

    // 优先使用当前断点的值
    if (responsiveValue[currentBreakpoint] !== undefined) {
      return responsiveValue[currentBreakpoint]!
    }

    // 回退到默认值
    if (responsiveValue.default !== undefined) {
      return responsiveValue.default
    }

    // 尝试使用移动端的值作为默认值
    if (responsiveValue.mobile !== undefined) {
      return responsiveValue.mobile
    }
  }

  return value as T
}

/**
 * 响应式间距值类型
 */
export type ResponsiveSpacing = SpacingValue | ResponsiveValue<SpacingValue>

/**
 * 获取响应式间距值
 */
export function getResponsiveSpacing(spacing: ResponsiveSpacing, breakpoint?: Breakpoint): string {
  const value = getResponsiveValue(spacing, breakpoint)
  return spacingToCss(value as SpacingValue | { x: number; y: number })
}

/**
 * 响应式栅格属性类型
 */
export interface ResponsiveGridProps {
  span?: number | ResponsiveValue<number>
  offset?: number | ResponsiveValue<number>
  order?: number | ResponsiveValue<number>
  flex?: string | number | ResponsiveValue<string | number>
}

/**
 * 生成响应式栅格样式
 */
export function generateResponsiveColumnStyles(
  props: ResponsiveGridProps,
  breakpoint?: Breakpoint
): React.CSSProperties {
  const span = getResponsiveValue(props.span || 12, breakpoint)
  const offset = getResponsiveValue(props.offset || 0, breakpoint)

  return generateColumnStyles(span, offset)
}

/**
 * 生成响应式Flex样式
 */
export function generateResponsiveFlexStyles(
  flex?: string | number | ResponsiveValue<string | number>,
  flexGrow?: number | ResponsiveValue<number>,
  flexShrink?: number | ResponsiveValue<number>,
  flexBasis?: number | string | ResponsiveValue<number | string>,
  breakpoint?: Breakpoint
): React.CSSProperties {
  const resolvedFlex = getResponsiveValue(flex, breakpoint)
  const resolvedFlexGrow = getResponsiveValue(flexGrow, breakpoint)
  const resolvedFlexShrink = getResponsiveValue(flexShrink, breakpoint)
  const resolvedFlexBasis = getResponsiveValue(flexBasis, breakpoint)

  return generateFlexStyles(resolvedFlex, resolvedFlexGrow, resolvedFlexShrink, resolvedFlexBasis)
}

// ============================================================================
// 类型验证工具
// ============================================================================

/**
 * 验证间距值是否有效
 */
export const isValidSpacing = (spacing: unknown): boolean => {
  if (typeof spacing === 'number') {
    return spacing >= 0
  }

  if (typeof spacing === 'object' && spacing !== null && 'x' in spacing && 'y' in spacing) {
    const { x = 0, y = 0 } = spacing as { x?: number; y?: number }
    return typeof x === 'number' && x >= 0 && typeof y === 'number' && y >= 0
  }

  return false
}

/**
 * 验证栅格值是否有效
 */
export const isValidGridSpan = (span: number, totalColumns: number = 24): boolean => {
  return Number.isInteger(span) && span > 0 && span <= totalColumns
}

/**
 * 验证栅格偏移值是否有效
 */
export const isValidGridOffset = (offset: number, totalColumns: number = 24): boolean => {
  return Number.isInteger(offset) && offset >= 0 && offset < totalColumns
}

// ============================================================================
// 错误处理和调试工具
// ============================================================================

/**
 * 布局组件错误类型
 */
export interface LayoutError {
  component: string
  property: string
  value: unknown
  expected: string
  message: string
}

/**
 * 布局错误收集器
 */
class LayoutErrorCollector {
  private errors: LayoutError[] = []
  private maxErrors: number = 50

  /**
   * 添加错误
   */
  addError(error: LayoutError): void {
    this.errors.push(error)

    // 限制错误数量，避免内存泄漏
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // 在开发环境中输出错误
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Layout Error] ${error.component}: ${error.message}`, error)
    }
  }

  /**
   * 获取所有错误
   */
  getErrors(): LayoutError[] {
    return [...this.errors]
  }

  /**
   * 清空错误
   */
  clear(): void {
    this.errors = []
  }

  /**
   * 获取指定组件的错误
   */
  getComponentErrors(component: string): LayoutError[] {
    return this.errors.filter(error => error.component === component)
  }
}

/**
 * 全局布局错误收集器实例
 */
export const layoutErrorCollector = new LayoutErrorCollector()

/**
 * 验证并报告布局组件属性错误
 */
export function validateLayoutProp(
  component: string,
  property: string,
  value: unknown,
  validator: (value: unknown) => boolean,
  expected: string
): boolean {
  if (!validator(value)) {
    const error: LayoutError = {
      component,
      property,
      value,
      expected,
      message: `属性 ${property} 的值 ${JSON.stringify(value)} 无效，期望 ${expected}`,
    }

    layoutErrorCollector.addError(error)
    return false
  }

  return true
}

/**
 * 验证Container组件属性
 */
export const validateContainerProps = (props: Record<string, unknown>): boolean => {
  let isValid = true

  // 验证gap
  if (
    props.gap !== undefined &&
    !validateLayoutProp(
      'Container',
      'gap',
      props.gap,
      value => typeof value === 'number' && value >= 0,
      '非负数'
    )
  ) {
    isValid = false
  }

  // 验证direction
  if (
    props.direction &&
    !validateLayoutProp(
      'Container',
      'direction',
      props.direction,
      value => typeof value === 'string' && ['row', 'column'].includes(value),
      "'row' 或 'column'"
    )
  ) {
    isValid = false
  }

  return isValid
}

/**
 * 验证Row组件属性
 */
export const validateRowProps = (props: Record<string, unknown>): boolean => {
  let isValid = true

  // 验证gap
  if (
    props.gap !== undefined &&
    !validateLayoutProp(
      'Row',
      'gap',
      props.gap,
      value => typeof value === 'number' && value >= 0,
      '非负数'
    )
  ) {
    isValid = false
  }

  return isValid
}

/**
 * 验证Col组件属性
 */
export const validateColProps = (props: Record<string, unknown>): boolean => {
  let isValid = true

  // 验证span
  if (
    props.span !== undefined &&
    !validateLayoutProp(
      'Col',
      'span',
      props.span,
      value => typeof value === 'number' && value >= 1 && value <= 24,
      '1-24的整数'
    )
  ) {
    isValid = false
  }

  // 验证offset
  if (
    props.offset !== undefined &&
    !validateLayoutProp(
      'Col',
      'offset',
      props.offset,
      value => typeof value === 'number' && value >= 0 && value <= 23,
      '0-23的整数'
    )
  ) {
    isValid = false
  }

  return isValid
}

/**
 * 获取布局统计信息（用于调试）
 */
export function getLayoutStats(): {
  totalErrors: number
  errorsByComponent: Record<string, number>
  recentErrors: LayoutError[]
} {
  const errors = layoutErrorCollector.getErrors()
  const errorsByComponent: Record<string, number> = {}

  errors.forEach(error => {
    errorsByComponent[error.component] = (errorsByComponent[error.component] || 0) + 1
  })

  return {
    totalErrors: errors.length,
    errorsByComponent,
    recentErrors: errors.slice(-10),
  }
}
